from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from app.schemas.contact import ContactResponse, ContactCreate, ContactAdminUpdate
from app.schemas.common import SuccessResponse
from app.services import contact_service
from app.api.deps import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/contact", tags=["contact"])




# PUBLIC ROUTES
@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def send_message(payload: ContactCreate, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    try:
        await contact_service.create_message(payload, ip_address=ip, user_agent=user_agent)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))
    
    return SuccessResponse(message="Message sent successfully")





# ADMIN ROUTES
@router.get("", response_model=dict)
async def list_messages(
    include_spam: bool = Query(False),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    admin: User = Depends(get_admin_user),
):
    return await contact_service.get_all_messages(
        include_spam=include_spam,
        unread_only=unread_only,
        limit=limit,
        skip=skip,
    )

@router.get("/unread-count")
async def unread_count(admin: User = Depends(get_admin_user)):
    count = await contact_service.get_unread_count()
    return {"unread": count}

@router.get("/{message_id}", response_model=ContactResponse)
async def get_message(
    message_id: str,
    admin: User = Depends(get_admin_user),
): 
    msg = await contact_service.get_message_by_id(message_id)
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    await contact_service.mark_read(message_id)
    return msg



@router.patch("/{message_id}/read", response_model=SuccessResponse)
async def mark_read(
    message_id: str,
    admin: User = Depends(get_admin_user),
):
    msg = await contact_service.mark_read(message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return SuccessResponse(message="Marked as read")
    

@router.patch("/{message_id}/spam", response_model=SuccessResponse)
async def mark_spam(
    message_id: str,
    admin: User = Depends(get_admin_user),
):
    msg = await contact_service.mark_spam(message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return SuccessResponse(message="Marked as spam")


@router.delete("/{message_id}/", response_model=SuccessResponse)
async def delete_message(
    message_id: str,
    admin: User = Depends(get_admin_user),
):
    deleted = await contact_service.delete_message(message_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return SuccessResponse(message="Message deleted")



