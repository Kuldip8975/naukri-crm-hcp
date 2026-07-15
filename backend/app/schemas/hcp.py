"""HCP schemas."""

from typing import Optional, List
from datetime import datetime
import uuid
from pydantic import BaseModel, Field, EmailStr, field_validator


class HCPBase(BaseModel):
    """Base HCP schema."""
    name: str = Field(..., description="HCP name")
    title: Optional[str] = Field(None, description="Professional title")
    specialty: Optional[str] = Field(None, description="Medical specialty")
    email: Optional[EmailStr] = Field(None, description="Email address")  # Changed to Optional
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="Location")
    organization: Optional[str] = Field(None, description="Organization/affiliation")
    status: Optional[str] = Field("active", description="Status (active, inactive, pending)")
    notes: Optional[str] = Field(None, description="Additional notes")
    preferences: Optional[str] = Field(None, description="Communication preferences")


class HCPCreate(HCPBase):
    """Schema for creating an HCP."""
    pass


class HCPUpdate(BaseModel):
    """Schema for updating an HCP."""
    name: Optional[str] = None
    title: Optional[str] = None
    specialty: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    organization: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    preferences: Optional[str] = None


class HCPResponse(HCPBase):
    """Schema for HCP response."""
    id: str
    engagement_score: int = Field(default=0)
    last_interaction: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        """Convert UUID to string if needed."""
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class HCPListResponse(BaseModel):
    """Schema for HCP list response."""
    items: List[HCPResponse]
    total: int
    page: int
    limit: int