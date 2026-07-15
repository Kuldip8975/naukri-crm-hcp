"""API v1 router with all endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import hcps
from app.api.v1.endpoints import interactions
from app.api.v1.endpoints import followups
from app.api.v1.endpoints import analytics
from app.api.v1.endpoints import ai

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(hcps.router, prefix="/hcps", tags=["HCPs"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["Interactions"])
api_router.include_router(followups.router, prefix="/followups", tags=["Follow-ups"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])