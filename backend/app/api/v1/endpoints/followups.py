"""Follow-up endpoints."""

import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.models.database import get_db
from app.models.user import User
from app.repositories.followup_repository import FollowUpRepository
from app.repositories.interaction_repository import InteractionRepository
from app.services.followup_service import FollowUpService
from app.schemas.followup import FollowUpCreate, FollowUpUpdate, FollowUpResponse
from app.core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Follow-ups"])


def get_followup_service(
    db: AsyncSession = Depends(get_db),
) -> FollowUpService:
    """Dependency injection for follow-up service."""
    followup_repo = FollowUpRepository(db)
    interaction_repo = InteractionRepository(db)
    return FollowUpService(
        followup_repo=followup_repo,
        interaction_repo=interaction_repo,
    )


@router.post("/followups", response_model=FollowUpResponse)
async def create_followup(
    followup_data: FollowUpCreate,
    current_user: User = Depends(get_current_user),
    service: FollowUpService = Depends(get_followup_service),
) -> FollowUpResponse:
    """Create a follow-up for an interaction."""
    try:
        followup = await service.create_followup(
            interaction_id=followup_data.interaction_id,
            user_id=str(current_user.id),
            data=followup_data.model_dump(),
        )
        return followup
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except Exception as e:
        logger.error(f"Create followup error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create followup: {str(e)}",
        )


@router.put("/followups/{followup_id}/complete")
async def complete_followup(
    followup_id: str,
    current_user: User = Depends(get_current_user),
    service: FollowUpService = Depends(get_followup_service),
) -> Dict[str, Any]:
    """Mark a follow-up as completed."""
    try:
        await service.complete_followup(followup_id)
        return {"success": True, "message": "Follow-up completed successfully"}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except Exception as e:
        logger.error(f"Complete followup error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete followup: {str(e)}",
        )