from fastapi import APIRouter, Depends, Query, Request, WebSocket
from app.schemas.common import SuccessResponse
from app.services import analytics_service
from app.api.deps import get_admin_user
from app.websockets.analytics_ws import analytics_ws_handler
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["analytics"])

# PUBLIC session tracking
@router.post("/session")
async def track_session(request: Request):
    session_id = request.headers.get("X-Session-ID")
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")

    new_session_id = await analytics_service.create_or_update_session(
        session_id=session_id,
        ip_address=ip,
        user_agent=user_agent,
        refferer=referrer,
    )
    return {"session_id": new_session_id}

@router.post("/command")
async def track_command(
    request: Request,
    command: str = Query(min_length=1, max_length=100),
    args: Optional[str] = Query(None, max_length=200),
):
    session_id = request.headers.get("X-Session-ID", "anonymous")
    await analytics_service.log_command(
        session_id=session_id,
        command=command,
        args=args,
    )
    return {"logger": True}



# ADMIN - dashboad data
@router.get("/realtime")
async def realtime_stats(admin: User = Depends(get_admin_user)):
    return await analytics_service.get_realtime_stats()

@router.get("/dashboard")
async def full_dashboard(admin: User = Depends(get_admin_user)):
    return await analytics_service.get_full_dashboard()

@router.get("/active_users")
async def actirve_users(admin: User = Depends(get_admin_user)):
    count = await analytics_service.get_active_visitor_count()
    return {"active_now": count}



# Websockets live feed admin
@router.websocket("/ws")
async def analytics_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return 
    
    from app.core.security import decode_token
    from app.models.user import User as UserModel
    from app.utils.cache import is_token_blacklisted

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return
    jti = payload.get("jti")
    if jti and await is_token_blacklisted(jti):
        await websocket.close(code=4001)
        return
    user = await UserModel.find_one(UserModel.username == payload.get("sub"))
    if not user or not user.is_admin:
        await websocket.close(code=4003)
        return
    
    await analytics_ws_handler(websocket)