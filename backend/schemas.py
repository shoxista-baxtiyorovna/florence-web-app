from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, PaymentStatusEnum

# Generic Config
class OrmBase(BaseModel):
    model_config = {"from_attributes": True}

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    telegram_id: Optional[str] = None
    phone_number: Optional[str] = None
    phone_verified: bool = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase, OrmBase):
    id: int
    role: RoleEnum
    created_at: datetime

# Auth Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
    user_id: Optional[int] = None

# Branch Schemas
class BranchBase(BaseModel):
    city: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase, OrmBase):
    id: int
    shop_id: int

# Shop Schemas
class ShopBase(BaseModel):
    business_name: str
    registration_number: Optional[str] = None

class ShopCreate(ShopBase):
    pass

class ShopResponse(ShopBase, OrmBase):
    id: int
    owner_id: int
    rating_score: float
    badge: str
    branches: List[BranchResponse] = []

# Product Schemas
class ProductBase(BaseModel):
    title: str
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    description: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str
    stock_quantity: int = 0
    
    # Florence Taxonomy & Smart Sorting Filters
    is_seasonal: bool = False
    rating_score: float = 0.0
    format: str = "bouquet"
    size: str = "average"
    is_trending: bool = False
    main_flower: Optional[str] = None
    likes_count: int = 0

class ProductCreate(ProductBase):
    shop_id: int

class ProductResponse(ProductBase, OrmBase):
    id: int
    shop_id: int

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    branch_id: int
    items: List[OrderItemCreate]
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    is_anonymous: bool = False
    gift_message: Optional[str] = None
    delivery_time_slot: Optional[str] = None

class OrderResponse(OrmBase):
    id: int
    user_id: int
    branch_id: int
    total_amount: float
    delivery_fee: float
    payment_status: PaymentStatusEnum
    transaction_id: str
    created_at: datetime
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    is_anonymous: bool
    gift_message: Optional[str] = None
    delivery_time_slot: Optional[str] = None

# Payment Webhook
class PaymeWebhook(BaseModel):
    transaction_id: str
    order_id: int
    status: str

# Review Schemas (Append-only for customers, reply string for sellers)
class ReviewBase(BaseModel):
    rating: int  # 1 to 5
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewSellerReply(BaseModel):
    seller_reply: str

class ReviewResponse(ReviewBase, OrmBase):
    id: int
    product_id: int
    user_id: int
    seller_reply: Optional[str] = None
    created_at: datetime
