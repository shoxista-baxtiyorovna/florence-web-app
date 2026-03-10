from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(
    city: Optional[str] = None, 
    main_flower: Optional[str] = None,
    format: Optional[str] = None,
    size: Optional[str] = None,
    is_trending: Optional[bool] = None,
    sort_by: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if city:
        query = query.join(models.Shop).join(models.Branch).filter(models.Branch.city == city)
    
    # Florence Taxonomy Filters
    if main_flower:
        query = query.filter(models.Product.main_flower == main_flower)
    if format:
        query = query.filter(models.Product.format == format)
    if size:
        query = query.filter(models.Product.size == size)
    if is_trending is not None:
        query = query.filter(models.Product.is_trending == is_trending)
        
    # Smart Sorting
    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "rating_desc":
        query = query.order_by(models.Product.rating_score.desc())
        
    products = query.offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Note: in a real app, protect this route with Admin JWT dependency
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/{product_id}/like")
def toggle_like(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Toggle a like on a product for the currently authenticated user"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product in current_user.liked_products:
        current_user.liked_products.remove(product)
        product.likes_count -= 1
        status_action = "unliked"
    else:
        current_user.liked_products.append(product)
        product.likes_count += 1
        status_action = "liked"
        
    db.commit()
    return {"status": status_action, "likes_count": product.likes_count}
