"""HCP repository."""

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc

from app.models.hcp import HCP
from app.repositories.base_repository import BaseRepository


class HCPRepository(BaseRepository[HCP]):
    """Repository for HCP model."""

    def __init__(self, session: AsyncSession):
        super().__init__(session, HCP)

    async def search(
        self,
        query: str,
        filters: Dict[str, Any] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[HCP]:
        """Search HCPs by name, specialty, or location."""
        conditions = [self.model.deleted_at.is_(None)]
        
        if query:
            search = f"%{query}%"
            conditions.append(
                or_(
                    self.model.name.ilike(search),
                    self.model.specialty.ilike(search),
                    self.model.location.ilike(search),
                )
            )
        
        if filters:
            if filters.get("specialty"):
                conditions.append(self.model.specialty == filters["specialty"])
            if filters.get("status"):
                conditions.append(self.model.status == filters["status"])
            if filters.get("location"):
                conditions.append(self.model.location.ilike(f"%{filters['location']}%"))
        
        stmt = select(self.model).where(and_(*conditions)).order_by(
            self.model.name
        ).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_specialty(self, specialty: str) -> List[HCP]:
        """Get HCPs by specialty."""
        stmt = select(self.model).where(
            self.model.specialty == specialty,
            self.model.deleted_at.is_(None)
        ).order_by(self.model.name)
        result = await self.session.execute(stmt)
        return result.scalars().all()