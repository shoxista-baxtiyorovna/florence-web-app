from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, products, shops, delivery, orders

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tashkent Flora Marketplace API")

# Setup CORS to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://myproject-vibe-code.vercel.app",  # Production Vercel Domain
        "https://florence-marketplace.vercel.app"  # Alternative Prod Domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(shops.router, prefix="/api/shops", tags=["Shops"])
app.include_router(delivery.router, prefix="/api/delivery", tags=["Delivery"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Marketplace API is running"}
