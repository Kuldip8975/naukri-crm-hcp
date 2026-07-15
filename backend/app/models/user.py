"""User model."""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class User(BaseModel):
    """User model for authentication and authorization."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False, default="sales_rep")
    is_active = Column(Boolean, nullable=False, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    interactions = relationship("Interaction", back_populates="user", lazy="select")
    followups = relationship("FollowUp", back_populates="user", lazy="select")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="select")
    
    def to_dict(self):
        """Convert to dictionary with string ID."""
        data = super().to_dict()
        data["id"] = str(self.id)
        return data