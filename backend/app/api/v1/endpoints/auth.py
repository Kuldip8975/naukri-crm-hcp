"""Authentication endpoints."""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
)
from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import SecurityConfig

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency injection for auth service."""
    user_repo = UserRepository(db)
    return AuthService(user_repo)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    try:
        payload = SecurityConfig.decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token")
        
        user_repo = UserRepository(db)
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")
        
        if not user.is_active:
            raise AuthenticationError("User is inactive")
        
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise AuthenticationError("Invalid authentication credentials")


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Login user and return JWT tokens."""
    try:
        user = await auth_service.authenticate_user(
            email=login_data.email,
            password=login_data.password,
        )
        
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        access_token = SecurityConfig.create_access_token(token_data)
        refresh_token = SecurityConfig.create_refresh_token(token_data)
        
        # Convert user to response with string ID
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response,
        }
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user and return JWT tokens."""
    try:
        user = await auth_service.register_user(user_data.model_dump())
        
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
        access_token = SecurityConfig.create_access_token(token_data)
        refresh_token = SecurityConfig.create_refresh_token(token_data)
        
        # Convert user to response with string ID
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response,
        }
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
):
    """Logout user (client-side token removal)."""
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
):
    """Refresh access token using refresh token."""
    try:
        payload = SecurityConfig.decode_token(refresh_data.refresh_token, is_refresh=True)
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        
        if not user_id:
            raise AuthenticationError("Invalid refresh token")
        
        token_data = {"sub": user_id, "email": email, "role": role}
        access_token = SecurityConfig.create_access_token(token_data)
        refresh_token = SecurityConfig.create_refresh_token(token_data)
        
        user_response = UserResponse(
            id=user_id,
            email=email or "",
            full_name="User",
            role=role or "sales_rep",
            is_active=True,
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current user profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
    )