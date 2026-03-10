from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(
    tags=["shops"]
)

# Protect endpoints to SELLER or ADMIN only
def check_seller_role(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.RoleEnum.SELLER, models.RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions. Must be a SELLER."
        )
    return current_user

@router.post("/", response_model=schemas.ShopResponse)
def create_shop(shop: schemas.ShopCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_seller_role)):
    """Seller Onboarding: Create a shop/brand"""
    # Check if this user already has this shop name
    db_shop = db.query(models.Shop).filter(models.Shop.business_name == shop.business_name).first()
    if db_shop:
        raise HTTPException(status_code=400, detail="Shop with this name already exists")
    
    new_shop = models.Shop(**shop.model_dump(), owner_id=current_user.id)
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    return new_shop

@router.get("/", response_model=List[schemas.ShopResponse])
def get_my_shops(db: Session = Depends(get_db), current_user: models.User = Depends(check_seller_role)):
    """The Bloom Dashboard: Get only shops owned by the logged in seller (RBAC)"""
    shops = db.query(models.Shop).filter(models.Shop.owner_id == current_user.id).all()
    return shops

@router.put("/{shop_id}", response_model=schemas.ShopResponse)
def update_shop(shop_id: int, shop: schemas.ShopCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_seller_role)):
    """Update existing shop details (business name, INN)"""
    db_shop = db.query(models.Shop).filter(models.Shop.id == shop_id).first()
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if db_shop.owner_id != current_user.id and current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to edit this shop")
    
    # Check if new name conflicts with another shop
    conflict = db.query(models.Shop).filter(models.Shop.business_name == shop.business_name, models.Shop.id != shop_id).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Shop with this name already exists")
        
    db_shop.business_name = shop.business_name
    db_shop.registration_number = shop.registration_number
    db.commit()
    db.refresh(db_shop)
    return db_shop

@router.get("/all", response_model=List[schemas.ShopResponse])
def get_all_shops(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Admin Dashboard: Get all shops"""
    if current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    shops = db.query(models.Shop).all()
    return shops

@router.post("/{shop_id}/branches", response_model=schemas.BranchResponse)
def create_branch(shop_id: int, branch: schemas.BranchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_seller_role)):
    """Add a new branch location to a specific shop"""
    # RBAC: Must own the shop to add a branch
    db_shop = db.query(models.Shop).filter(models.Shop.id == shop_id).first()
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if db_shop.owner_id != current_user.id and current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to edit this shop")
    
    new_branch = models.Branch(**branch.model_dump(), shop_id=shop_id)
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch

@router.put("/{shop_id}/branches/{branch_id}/toggle", response_model=schemas.BranchResponse)
def toggle_branch_status(shop_id: int, branch_id: int, is_active: bool, db: Session = Depends(get_db), current_user: models.User = Depends(check_seller_role)):
    """Toggle Vacation Mode for a branch"""
    db_shop = db.query(models.Shop).filter(models.Shop.id == shop_id).first()
    if not db_shop or (db_shop.owner_id != current_user.id and current_user.role != models.RoleEnum.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    branch = db.query(models.Branch).filter(models.Branch.id == branch_id, models.Branch.shop_id == shop_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
        
    branch.is_active = is_active
    db.commit()
    db.refresh(branch)
    return branch
