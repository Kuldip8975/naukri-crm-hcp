"""Follow-up service."""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.repositories.followup_repository import FollowUpRepository
from app.repositories.interaction_repository import InteractionRepository
from app.models.followup import FollowUp, FollowUpStatus
from app.core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class FollowUpService:
    """Service for managing follow-ups."""

    def __init__(
        self,
        followup_repo: FollowUpRepository,
        interaction_repo: InteractionRepository,
    ):
        self.followup_repo = followup_repo
        self.interaction_repo = interaction_repo

    async def create_followup(
        self,
        interaction_id: str,
        user_id: str,
        data: Dict[str, Any]
    ) -> FollowUp:
        """Create a new follow-up."""
        interaction = await self.interaction_repo.get_by_id(interaction_id)
        if not interaction:
            raise NotFoundError("Interaction", interaction_id)

        followup = FollowUp(
            interaction_id=interaction_id,
            user_id=user_id,
            scheduled_date=data.get("scheduled_date"),
            priority=data.get("priority", "medium"),
            notes=data.get("notes", ""),
            status=FollowUpStatus.PENDING,
        )
        return await self.followup_repo.create(followup)

    async def get_followups(self, user_id: str) -> List[FollowUp]:
        """Get follow-ups for a user."""
        return await self.followup_repo.get_by_user_id(user_id)

    async def complete_followup(self, followup_id: str) -> FollowUp:
        """Mark a follow-up as completed."""
        followup = await self.followup_repo.get_by_id(followup_id)
        if not followup:
            raise NotFoundError("FollowUp", followup_id)
        
        followup.status = FollowUpStatus.COMPLETED
        followup.completed_date = datetime.utcnow()
        return await self.followup_repo.update(followup_id, {
            "status": FollowUpStatus.COMPLETED,
            "completed_date": datetime.utcnow()
        })