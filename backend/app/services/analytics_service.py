"""Analytics service."""

import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.repositories.interaction_repository import InteractionRepository
from app.repositories.hcp_repository import HCPRepository

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics and reporting."""

    def __init__(
        self,
        interaction_repo: InteractionRepository,
        hcp_repo: HCPRepository,
    ):
        self.interaction_repo = interaction_repo
        self.hcp_repo = hcp_repo

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics."""
        interactions = await self.interaction_repo.get_by_user_id(user_id, limit=1000)
        
        return {
            "total_interactions": len(interactions),
            "total_hcps": len(set(i.hcp_id for i in interactions)),
            "followups_due": len([i for i in interactions if i.follow_up_required]),
            "recent_interactions": interactions[:10],
        }

    async def get_interaction_trends(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get interaction trends."""
        interactions = await self.interaction_repo.get_by_user_id(user_id, limit=1000)
        
        # Group by date
        trends = {}
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        for interaction in interactions:
            if interaction.interaction_date >= cutoff:
                date_key = interaction.interaction_date.strftime("%Y-%m-%d")
                trends[date_key] = trends.get(date_key, 0) + 1
        
        return {
            "trends": trends,
            "total": sum(trends.values()),
        }