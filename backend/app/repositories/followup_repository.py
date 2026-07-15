"""Follow-up repository."""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from datetime import datetime

from app.models.followup import FollowUp
from app.repositories.base_repository import BaseRepository


class FollowUpRepository(BaseRepository[FollowUp]):
    """Repository for FollowUp model."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, FollowUp)

    async def get_by_user_id(
        self,
        user_id: str,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[FollowUp]:
        """Get follow-ups by user ID."""
        conditions = [
            self.model.user_id == user_id,
            self.model.deleted_at.is_(None)
        ]
        if status:
            conditions.append(self.model.status == status)
        
        stmt = select(self.model).where(and_(*conditions)).order_by(
            self.model.scheduled_date
        ).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_interaction_id(self, interaction_id: str) -> List[FollowUp]:
        """Get follow-ups by interaction ID."""
        stmt = select(self.model).where(
            self.model.interaction_id == interaction_id,
            self.model.deleted_at.is_(None)
        ).order_by(self.model.scheduled_date)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_due_followups(self, user_id: str) -> List[FollowUp]:
        """Get due follow-ups for a user."""
        now = datetime.utcnow()
        stmt = select(self.model).where(
            self.model.user_id == user_id,
            self.model.status == "pending",
            self.model.scheduled_date <= now,
            self.model.deleted_at.is_(None)
        ).order_by(self.model.scheduled_date)
        result = await self.session.execute(stmt)
        return result.scalars().all()