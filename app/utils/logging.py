"""
Logging configuration and utilities
"""

import logging
import sys
from typing import Optional
from loguru import logger
from app.config import settings

# Remove default loguru handler
logger.remove()

# Add console handler with custom format
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
    level=settings.LOG_LEVEL,
    colorize=True,
    backtrace=True,
    diagnose=True
)

# Add file handler if specified
if settings.LOG_FILE:
    logger.add(
        settings.LOG_FILE,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
        level=settings.LOG_LEVEL,
        rotation="1 day",
        retention="30 days",
        compression="gzip"
    )

def get_logger(name: Optional[str] = None):
    """Get a logger instance with the specified name"""
    if name:
        return logger.bind(name=name)
    return logger

# Intercept standard logging and redirect to loguru
class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

# Setup standard logging to use loguru
logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
