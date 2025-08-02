"""
AEON Video Generation Routes
"""

from .generate import router as generate_router
from .status import router as status_router

__all__ = ["generate_router", "status_router"]
