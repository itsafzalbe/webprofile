from fastapi import APIRouter, Query, HTTPException, status, Depends
from app.services import filesystem_service
from app.api.deps import get_admin_user
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/filesystem", tags=["filesystem"])

# Public terminal commands
@router.get("/ls")
async def ls(
    path: str = Query("/home/afzalbe"),
    hidden: bool = Query(False),
):
    result = await filesystem_service.ls(path, show_hidden=hidden)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    return result

@router.get("/cd")
async def cd(
    current: str = Query("/home/afzalbe"),
    target: str = Query("~"),
):
    result = await filesystem_service.cd(current, target)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    return result

@router.get("/cat")
async def cat(path: str = Query(...), current: str = Query("/home/afzalbe")):
    result = await filesystem_service.cat(path, current_path=current)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    return result

@router.get("/tree")
async def tree(
    path: str = Query("home/afzalbe"),
    hidden: bool = Query(False),
    max_depth: int = Query(3, ge=1, le=5),
):
    result = await filesystem_service.tree(
        path,
        show_hidden=hidden,
        _max_depth=max_depth,
    )
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    ascii_tree = f"{path}\n" + filesystem_service.render_tree(result)

    return {
        "path": path,
        "tree": result,
        "rendered": ascii_tree,
    }
        
@router.get("/pwd")
async def pwd(path: str = Query("/home/afzalbe")):
    return await filesystem_service.pwd(path)

@router.get("/node")
async def get_node(path: str = Query(...)):
    node = await filesystem_service.get_node(path)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No such file or directory: {path}",
        )
    return node



#admin - filesystem managemnet
@router.post("/node")
async def create_node(payload: dict, admin: User = Depends(get_admin_user)):
    from app.models.filesystem import FileSystemNode
    from datetime import datetime

    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="paths is required")
    
    existing = await filesystem_service.get_node(path)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Path already exists: {path}")
    
    node = FileSystemNode(
        name=        payload.get("name", path.split("/")[-1]),
        path=        path,
        node_type=   payload.get("node_type", "file"),
        content=     payload.get("content"),
        parent_path= payload.get("parent_path", "/".join(path.split("/")[:-1]) or "/"),
        is_hidden=   payload.get("is_hidden", False),
        permissions= payload.get("permissions", "r--"),
        owner=       "afzalbe",
    )
    await node.insert()

    parent = await filesystem_service.get_node(node.parent_path)
    if parent:
        from app.models.filesystem import FileSystemNode as FSNode
        parent_doc = await FSNode.find_one(FSNode.path == node.parent_path)
        if parent_doc:
            if path not in parent_doc.children:
                parent_doc.children.append(path)
                await parent_doc.save()
    
    return {"created": True, "node": filesystem_service._format(node)}


@router.patch("/node")
async def update_node(path: str = Query(...), payload: dict = None, admin: User = Depends(get_admin_user)):
    from app.models.filesystem import FileSystemNode
    from datetime import datetime

    node = await FileSystemNode.find_one(FileSystemNode.path == path)
    if not node:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not found: {path}")
    
    if payload:
        for field in ("content", "is_hidden", "permissions", "name"):
            if field in payload:
                setattr(node, field, payload[field])
    
    node.modefied_at = datetime.utcnow()
    await node.save()
    return {"updated": True, "node": filesystem_service._format(node)}

@router.delete("/node")
async def delete_node(path: str = Query(...), admin: User = Depends(get_admin_user)):
    from app.models.filesystem import FileSystemNode

    node = await FileSystemNode.find_one(FileSystemNode.path == path)
    if not node:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not found: {path}")
    
    if node.node_type == "directory" and node.children:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Directory not empty. Delete children first",
        )
    
    if node.parent_path:
        parent = await FileSystemNode.find_one(FileSystemNode.path == node.parent_path)
        if parent and path in parent.children:
            parent.children.remove(path)
            await parent.save()
    await node.delete()
    return {"deleted": True, "path": path}
