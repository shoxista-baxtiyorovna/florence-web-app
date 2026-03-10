import enum
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, Enum, DateTime, func, Table
from sqlalchemy.orm import relationship
import uuid
from database import Base

user_product_likes = Table(
    'user_product_likes', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete="CASCADE"), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)

class RoleEnum(str, enum.Enum):
    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"

class PaymentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    display_name = Column(String, nullable=True) # Used for Customers
    telegram_id = Column(String, unique=True, nullable=True) # Telegram Auth
    phone_number = Column(String, unique=True, nullable=True)
    phone_verified = Column(Boolean, default=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.CUSTOMER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    shops = relationship("Shop", back_populates="owner")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    liked_products = relationship("Product", secondary=user_product_likes, back_populates="liked_by")

class Shop(Base):
    __tablename__ = "shops"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    business_name = Column(String, unique=True, index=True)
    registration_number = Column(String, nullable=True) # Uzbekistan Compliance
    rating_score = Column(Float, default=0.0)
    badge = Column(String, default="Seed") # Seed -> Sprout -> Bloom
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="shops")
    branches = relationship("Branch", back_populates="shop")
    products = relationship("Product", back_populates="shop")

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"))
    city = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True) # Vacation mode
    
    # Relationships
    shop = relationship("Shop", back_populates="branches")
    orders = relationship("Order", back_populates="branch")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"))
    title = Column(String, index=True)
    title_uz = Column(String, index=True, nullable=True)
    title_ru = Column(String, index=True, nullable=True)
    description = Column(Text, nullable=True)
    description_uz = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    price = Column(Float)
    image_url = Column(String, nullable=True)
    category = Column(String, index=True) 
    stock_quantity = Column(Integer, default=0)
    
    # Florence Taxonomy & Smart Sorting Filters
    is_seasonal = Column(Boolean, default=False)
    rating_score = Column(Float, default=0.0) # 1-5 scale
    format = Column(String, default="bouquet") # e.g., bouquet, box, basket
    size = Column(String, default="average") # e.g., small, average, big
    is_trending = Column(Boolean, default=False)
    main_flower = Column(String, nullable=True) # e.g., roses, daisies, peonies
    likes_count = Column(Integer, default=0)
    
    # Relationships
    shop = relationship("Shop", back_populates="products")
    reviews = relationship("Review", back_populates="product")
    liked_by = relationship("User", secondary=user_product_likes, back_populates="liked_products")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    total_amount = Column(Float)
    delivery_fee = Column(Float, default=0.0)
    payment_status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING)
    transaction_id = Column(String, default=lambda: str(uuid.uuid4()), unique=True) # For Soliq/Payme/Uzum
    
    # Gifting Suite Logistics
    recipient_name = Column(String, nullable=True)
    recipient_phone = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    gift_message = Column(Text, nullable=True)
    delivery_time_slot = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    branch = relationship("Branch", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_time = Column(Float)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, default=5) # 1 to 5
    comment = Column(Text, nullable=False) # Append-only text from user
    seller_reply = Column(Text, nullable=True) # Seller response
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
