"""
Authentication utilities for AEON Video Backend
Handles Clerk JWT verification and user authentication
"""

import os
import jwt
import httpx
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException
from utils.config import get_settings

logger = logging.getLogger(__name__)

class ClerkAuth:
    """Clerk authentication handler"""
    
    def __init__(self):
        self.settings = get_settings()
        self.clerk_secret_key = self.settings.clerk_secret_key
        self.clerk_jwt_issuer = self.settings.clerk_jwt_issuer or "https://clerk.accounts.dev"
        
    async def get_jwks(self) -> Dict[str, Any]:
        """Fetch Clerk JWKS (JSON Web Key Set)"""
        try:
            jwks_url = f"{self.clerk_jwt_issuer}/.well-known/jwks.json"
            async with httpx.AsyncClient() as client:
                response = await client.get(jwks_url)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(status_code=500, detail="Authentication service unavailable")
    
    def verify_jwt_signature(self, token: str, jwks: Dict[str, Any]) -> Dict[str, Any]:
        """Verify JWT signature using JWKS"""
        try:
            # Decode header to get key ID
            header = jwt.get_unverified_header(token)
            key_id = header.get("kid")
            
            if not key_id:
                raise ValueError("No key ID in JWT header")
            
            # Find the correct key in JWKS
            public_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == key_id:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not public_key:
                raise ValueError("No matching key found in JWKS")
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience="https://smart4technology.com",
                issuer=self.clerk_jwt_issuer
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            logger.error(f"JWT verification error: {e}")
            raise HTTPException(status_code=401, detail="Token verification failed")
    
    async def verify_clerk_jwt(self, token: str) -> Dict[str, Any]:
        """Verify Clerk JWT and return user data"""
        try:
            # Fetch JWKS
            jwks = await self.get_jwks()
            
            # Verify JWT
            payload = self.verify_jwt_signature(token, jwks)
            
            # Extract user data
            user_data = {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "email_verified": payload.get("email_verified", False),
                "aud": payload.get("aud"),
                "iss": payload.get("iss"),
                "exp": payload.get("exp"),
                "iat": payload.get("iat")
            }
            
            logger.info(f"JWT verified for user: {user_data['user_id']}")
            return user_data
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"JWT verification failed: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")

# Global auth instance
clerk_auth = ClerkAuth()

async def verify_clerk_jwt(token: str) -> Dict[str, Any]:
    """Verify Clerk JWT and return user data"""
    return await clerk_auth.verify_clerk_jwt(token)

def get_user_id_from_token(token: str) -> Optional[str]:
    """Extract user ID from JWT token without verification (for logging)"""
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub")
    except:
        return None 