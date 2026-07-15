"""Follow-up schemas."""

from typing import Optional
from datetime import datetime  # ADD THIS IMPORT
from pydantic import BaseModel, Field


class FollowUpBase(BaseModel):
    """Base follow-up schema."""
    interaction_id: str = Field(..., description="Interaction ID")
    scheduled_date: datetime = Field(..., description="Scheduled date")
    priority: Optional[str] = Field("medium", description="Priority (low, medium, high)")
    notes: Optional[str] = Field(None, description="Follow-up notes")


class FollowUpCreate(FollowUpBase):
    """Schema for creating a follow-up."""
    pass


class FollowUpUpdate(BaseModel):
    """Schema for updating a follow-up."""
    scheduled_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class FollowUpResponse(FollowUpBase):
    """Schema for follow-up response."""
    id: str
    user_id: str
    status: str
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True