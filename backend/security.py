from passlib.context import CryptContext
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer()

def hacher_mdp (mot_de_passe: str) -> str:
    return pwd_context.hash(mot_de_passe)

def verifier_mdp (mdp: str, mdp_hache: str)-> bool:
    return pwd_context.verify(mdp, mdp_hache)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def creer_token_access(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm= ALGORITHM)

def get_utilisateur_courant(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials
    exception_auth = HTTPException(
        status_code= status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les informations",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise exception_auth
        return payload
    except JWTError :
        raise exception_auth