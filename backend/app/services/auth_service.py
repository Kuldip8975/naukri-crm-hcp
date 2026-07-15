"""Authentication service."""

import logging
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.core.exceptions import AuthenticationError, NotFoundError, ConflictError
from app.core.security import SecurityConfig

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service for user management."""

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate user with email and password."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise AuthenticationError("Invalid credentials")
        
        if not SecurityConfig.verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid credentials")
        
        if not user.is_active:
            raise AuthenticationError("User account is inactive")
        
        # Update last login
        user.last_login = datetime.utcnow()
        await self.user_repo.update(str(user.id), {"last_login": datetime.utcnow()})
        
        return user

    async def register_user(self, user_data: Dict[str, Any]) -> User:
        """Register a new user."""
        # Check if user exists
        existing = await self.user_repo.get_by_email(user_data["email"])
        if existing:
            raise ConflictError("User with this email already exists")
        
        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=user_data["email"],
            hashed_password=SecurityConfig.get_password_hash(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data.get("role", "sales_rep"),
            is_active=True,
        )
        
        return await self.user_repo.create(user)

    async def send_password_reset(self, email: str) -> None:
        """Send password reset email."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Don't reveal if user exists for security
            return
        
        # In production, send email with reset link
        # For now, just log
        logger.info(f"Password reset requested for: {email}")

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset password using token."""
        # In production, validate token and get user
        # For now, placeholder
        logger.info(f"Password reset with token: {token[:10]}...")