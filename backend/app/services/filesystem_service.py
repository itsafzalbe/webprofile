import logging
from typing import Optional
from app.models.filesystem import FileSystemNode

logger = logging.getLogger(__name__)

def _format(node: FileSystemNode) -> dict:
    return {
        "name":         node.name,
        "path":         node.path,
        "node_type":    node.node_type,
        "content":      node.content,
        "parent_path":  node.parent_path,
        "children":     node.children,
        "is_hidden":    node.is_hidden,
        "permissions":  node.permissions,
        "owner":        node.owner,
        "size":         node.size,
        "modified_at":  node.modified_at,

    }

async def get_node(path: str) -> Optional[dict]:
    node = await FileSystemNode.find_one(FileSystemNode.path == path)
    if not node:
        return None
    return _format(node)


async def ls(path: str, show_hidden: bool = False) -> dict:
    node = await FileSystemNode.find_one(FileSystemNode.path == path)

    if not node:
        return {"error": f"ls: {path}: No such file or directory"}
    
    if node.node_type != "directory":
        return {"error": f"ls: {path}: Not a directory"}
    
    children = await FileSystemNode.find(
        FileSystemNode.parent_path == path
    ).to_list()

    if not show_hidden:
        children = [c for c in children if not c.is_hidden]
    
    dirs  = sorted([c for c in children if c.node_type == "directory"], key=lambda x: x.name)
    files = sorted([c for c in children if c.node_type == "file"],      key=lambda x: x.name)

    return {
        "path": path,
        "entries": [
            {
                "name":        c.name,
                "node_type":   c.node_type,
                "path":        c.path,
                "size":        c.size,
                "permissions": c.permissions,
                "modified_at": c.modified_at,
                "is_hidden":   c.is_hidden,
            }
            for c in dirs + files
        ],
    }
    
async def cd(current_path: str, target: str) -> dict:
    if target == "~" or target == "/home/afzalbe":
        new_path = "/home/afzalbe"
    elif target == "/":
        new_path = "/"
    elif target == "..":
        parts = current_path.rstrip("/").rsplit("/", 1)
        new_path = parts[0] if parts[0] else "/"
    elif target == ".":
        new_path == current_path
    elif target.startswith("/"):
        new_path = target.rstrip("/") or "/"
    else:
        base = current_path.rstrip("/")
        new_path = f"{base}/{target}"
    
    node = await FileSystemNode.find_one(FileSystemNode.path == new_path)

    if not node:
        return {"error": f"cd: {target}: No such file or directory"}
    
    if node.node_type != "directory":
        return {"error": f"cd: {target}: Not a directory"}
    
    return {"path": new_path, "node": _format(node)}

async def cat(path: str, current_path: str = "/home/afzalbe") -> dict:
    if not path.startswith("/"):
        path = f"{current_path.rstrip('/')}/{path}"
    node = await FileSystemNode.find_one(FileSystemNode.path == path)

    if not node:
        return {"error": f"cat: {path}: No such file or directory"}
    
    if node.node_type == "directory":
        return {"error": f"cat: {path}: Is a directory"}
    
    if "r" not in node.permissions:
        return {"error": f"cat: {path}: Permission denied"}
    
    return {
        "path":    path,
        "name":    node.name,
        "content": node.content or "",
    }


async def tree(path: str, show_hidden: bool = False, _depth: int = 0, _max_depth: int = 3) -> dict:
    node = await FileSystemNode.find_one(FileSystemNode.path == path)

    if not node:
        return {"error": f"tree: {path}: No such file or directory"}
    
    if node.node_type != "directory":
        return {"error": f"tree: {path}: Not a directory"}
    
    result = {
        "name":      node.name,
        "path":      node.path,
        "node_type": "directory",
        "children":  [],
    }
    if _depth >= _max_depth:
        return result
    
    children = await FileSystemNode.find(
        FileSystemNode.parent_path == path
    ).to_list()

    if not show_hidden:
        children = [c for c in children if not c.is_hidden]

    children_sorted = sorted(children, key=lambda x: (x.node_type != "directory", x.name))

    for child in children_sorted:
        if child.node_type == "directory":
            subtree = await tree(child.path, show_hidden, _depth + 1, _max_depth)
            result["children"].append(subtree)
        else:
            result["children"].append({
                "name":      child.name,
                "path":      child.path,
                "node_type": "file",
                "size":      child.size,
            })
    return result

def render_tree(node: dict, prefix: str = "", is_last: bool = True) -> str:

    connector = "└── " if is_last else "├── "
    name = node["name"]
    if node["node_type"] == "directory":
        name += "/"

    lines = [f"{prefix}{connector}{name}"]

    if node.get("children"):
        extension = "    " if is_last else "│   "
        children = node["children"]
        for i, child in enumerate(children):
            child_is_last = i == len(children) - 1
            lines.append(render_tree(child, prefix + extension, child_is_last))
    
    return "\n".join(lines)



async def pwd(path: str) -> dict:
    return {"path": path}

async def find_node(name: str, search_path: str = "/") -> list:

    nodes = await FileSystemNode.find(
        FileSystemNode.path.startswith(search_path),
        FileSystemNode.name.find(name) >= 0,
    ).to_list()

    return [_format(n) for n in nodes]

async def get_file_for_download(path: str) -> Optional[dict]:
    node = await FileSystemNode.find_one(FileSystemNode.path == path)
    if not node or node.node_type != "file":
        return None
    return _format(node)