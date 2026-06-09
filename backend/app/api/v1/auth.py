from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.user import LoginRequest, TokenResponse, RefreshRequest, UserResponse
from app.schemas.common import SuccessResponse
from app.services.auth_service import (
    authenticate_user,
    refresh_access_token,
    update_last_login,
)
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user, get_admin_user
from app.utils.cache import blacklist_token
from app.models.user import User
from datetime import datetime
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest):
    user = await authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    await update_last_login(user)

    return TokenResponse(
        access_token=create_access_token({"sub": user.username}),
        refresh_token=create_refresh_token({"sub": user.username}),
    )

@router.post("/refresh", response_model=dict)
@limiter.limit("10/minute")
async def refresh(request: Request, payload: RefreshRequest):
    result = await refresh_access_token(payload.refresh_token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    return result


@router.get("/me", response_model=UserResponse)
@limiter.limit("30/minute")
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    return UserResponse(
        username=current_user.username,
        is_admin=current_user.is_admin,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
    )


@router.post("/logout", response_model=SuccessResponse)
async def logout(request: Request, current_user: User = Depends(get_current_user)):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")

    payload = decode_token(token)
    if payload:
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            ttl = int(exp - datetime.utcnow().timestamp())
            if ttl > 0:
                await blacklist_token(jti, ttl)
    return SuccessResponse(message="Logged out successfully")


@router.get("/verify")
@limiter.limit("20/minute")
async def verify_token(request: Request, current_user: User = Depends(get_admin_user)):
    return {"valid": True, "username": current_user.username, "is_admin": current_user.is_admin}




