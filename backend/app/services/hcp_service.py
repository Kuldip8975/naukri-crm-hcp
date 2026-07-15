"""HCP service."""

import logging
from typing import Optional, Dict, Any, List
import uuid

from app.repositories.hcp_repository import HCPRepository
from app.models.hcp import HCP, HCPStatus
from app.core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class HCPService:
    """Service for managing HCPs."""

    def __init__(self, hcp_repo: HCPRepository):
        self.hcp_repo = hcp_repo

    async def create_hcp(self, data: Dict[str, Any]) -> HCP:
        """Create a new HCP."""
        if not data.get("name"):
            raise ValidationError("HCP name is required")
        
        hcp = HCP(**data)
        return await self.hcp_repo.create(hcp)

    async def get_hcp(self, hcp_id: str) -> HCP:
        """Get HCP by ID."""
        hcp = await self.hcp_repo.get_by_id(hcp_id)
        if not hcp:
            raise NotFoundError("HCP", hcp_id)
        return hcp

    async def get_hcps(
        self,
        filters: Dict[str, Any] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[HCP]:
        """Get HCPs with filters."""
        filters = filters or {}
        return await self.hcp_repo.search(
            query=filters.get("search", ""),
            filters=filters,
            skip=skip,
            limit=limit
        )

    async def update_hcp(self, hcp_id: str, data: Dict[str, Any]) -> HCP:
        """Update an HCP."""
        hcp = await self.get_hcp(hcp_id)
        for key, value in data.items():
            if hasattr(hcp, key):
                setattr(hcp, key, value)
        return await self.hcp_repo.update(hcp_id, data)

    async def delete_hcp(self, hcp_id: str) -> bool:
        """Delete an HCP."""
        await self.get_hcp(hcp_id)
        return await self.hcp_repo.delete(hcp_id)