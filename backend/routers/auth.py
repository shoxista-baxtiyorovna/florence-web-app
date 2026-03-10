from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

import models, schemas, security
from database import get_db

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, role: models.RoleEnum = models.RoleEnum.CUSTOMER, display_name: str = None, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        role=role,
        display_name=display_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store Role in JWT
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel
class UserUpdate(BaseModel):
    display_name: str

@router.put("/me", response_model=schemas.UserResponse)
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Update profile details (e.g. display name)"""
    current_user.display_name = user_update.display_name
    db.commit()
    db.refresh(current_user)
    return current_user

from typing import List
@router.get("/wishlist", response_model=List[schemas.ProductResponse])
def get_wishlist(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Fetch the user's liked products"""
    return current_user.liked_products

@router.post("/telegram", response_model=schemas.Token)
def telegram_auth(telegram_data: dict, db: Session = Depends(get_db)):
    """Receives Telegram widget payload and issues JWT"""
    tg_id = str(telegram_data.get("id"))
    if not tg_id or tg_id == "None":
        raise HTTPException(status_code=400, detail="Invalid Telegram data")
        
    first_name = telegram_data.get("first_name", f"TG_User_{tg_id}")
    requested_role_str = telegram_data.get("requested_role", "customer")
    
    try:
        role_enum = models.RoleEnum(requested_role_str)
    except ValueError:
        role_enum = models.RoleEnum.CUSTOMER
    
    user = db.query(models.User).filter(models.User.telegram_id == tg_id).first()
    
    if not user:
        # Create new user with mock email mapped to their TG ID
        email = f"{tg_id}@telegram.local"
        user = models.User(
            email=email,
            hashed_password=security.get_password_hash(tg_id), 
            role=role_enum,
            display_name=first_name,
            telegram_id=tg_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
