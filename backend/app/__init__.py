"""Backend application for Naukri CRM HCP Module."""

__version__ = "1.0.0"
__author__ = "Your Name"

from app.config import settings
from app.main import app

__all__ = ["app", "settings"]