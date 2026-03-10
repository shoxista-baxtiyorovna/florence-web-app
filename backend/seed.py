from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_db():
    # Will drop everything to start fresh with new schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Create Users (Admin, Seller, Customer)
    admin = models.User(
        email="admin@tashkentflora.uz",
        hashed_password=pwd_context.hash("admin123"),
        role=models.RoleEnum.ADMIN,
        display_name="System Admin"
    )
    db.add(admin)
    
    seller1 = models.User(
        email="premium@example.com",
        hashed_password=pwd_context.hash("seller123"),
        role=models.RoleEnum.SELLER,
        display_name="Premium Gardens Admin"
    )
    db.add(seller1)
    
    seller2 = models.User(
        email="tulips@example.com",
        hashed_password=pwd_context.hash("seller123"),
        role=models.RoleEnum.SELLER,
        display_name="Tulip Dreams Admin"
    )
    db.add(seller2)
    db.commit()

    # 2. Create Shops
    shop1 = models.Shop(owner_id=seller1.id, business_name="Premium Gardens LLC", registration_number="UZ12345678", badge="Bloom", rating_score=4.9)
    shop2 = models.Shop(owner_id=seller2.id, business_name="Tashkent Tulip Boutique", registration_number="UZ87654321", badge="Sprout", rating_score=4.1)
    db.add_all([shop1, shop2])
    db.commit()

    # 3. Create Branches
    branch1 = models.Branch(shop_id=shop1.id, city="Capital City", address="Amir Temur Street 4A", latitude=41.311081, longitude=69.240562)
    branch2 = models.Branch(shop_id=shop2.id, city="Samarkand", address="Registan Square 1", latitude=39.65416, longitude=66.97495)
    db.add_all([branch1, branch2])
    db.commit()

    # 4. Create Products linked to Shops
    products = [
      models.Product(
          shop_id=shop1.id, title="Romantic Red Roses", title_uz="Romantik qizil atirgullar", title_ru="Романтические красные розы", 
          description="A classic bouquet of 24 premium red roses.", description_uz="24 ta premium qizil atirgullarning klassik guldastasi.", description_ru="Классический букет из 24 красных роз премиум-класса.", 
          price=45.00, image_url="/img/bouquet_roses.png", category="bouquet", rating_score=4.9, format="bouquet", size="big", is_trending=True, main_flower="roses"
      ),
      models.Product(
          shop_id=shop1.id, title="Pastel Dream Peonies", title_uz="Pastel orzu pionlari", title_ru="Пастельные пионы мечты", 
          description="Soft pink and white peonies arranged beautifully.", description_uz="Chiroyli tarzda joylashtirilgan och pushti va oq pionlar.", description_ru="Красиво оформленные нежно-розовые и белые пионы.", 
          price=65.00, image_url="/img/bouquet_peonies.png", category="arrangement", rating_score=5.0, format="box", size="average", is_trending=True, main_flower="peonies"
      ),
      models.Product(
          shop_id=shop1.id, title="Elegant Orchids", title_uz="Nafis orxideyalar", title_ru="Элегантные орхидеи", 
          description="A sophisticated white orchid in a premium modern pot.", description_uz="Premium zamonaviy tuvakdagi nafis oq orxideya.", description_ru="Изысканная белая орхидея в премиальном современном горшке.", 
          price=85.00, image_url="/img/elegant_orchids.png", category="arrangement", rating_score=4.8, format="basket", size="big", is_trending=False, main_flower="orchids"
      ),
      models.Product(
          shop_id=shop2.id, title="Sunflower Sunshine", title_uz="Kungaboqar nuri", title_ru="Солнечное сияние", 
          description="Bright yellow sunflowers to brighten any day.", description_uz="Kuningizni yoritish uchun yorqin qip-qizil kungaboqarlar.", description_ru="Яркие желтые подсолнухи, чтобы скрасить любой день.", 
          price=30.00, image_url="/img/bouquet_sunflowers.png", category="bouquet", rating_score=4.2, format="bouquet", size="average", is_trending=False, main_flower="sunflowers"
      ),
      models.Product(
          shop_id=shop2.id, title="Wildflower Mix", title_uz="Yovvoyi gullar aralashmasi", title_ru="Смесь полевых цветов", 
          description="A cheerful mix of seasonal wildflowers and greens.", description_uz="Mavsumiy yovvoyi gullar va ko'katlarning quvnoq aralashmasi.", description_ru="Жизнерадостная смесь сезонных полевых цветов и зелени.", 
          price=40.00, image_url="/img/wildflower_mix.png", category="bouquet", rating_score=4.7, format="basket", size="small", is_trending=True, main_flower="daisies"
      ),
      models.Product(
          shop_id=shop2.id, title="Tulip Fantasy", title_uz="Lola fantaziyasi", title_ru="Тюльпанная фантазия", 
          description="Spring tulips in various vibrant shades of pink and red.", description_uz="Pushti va qizilning turli xil yorqin ranglaridagi bahorgi lolalar.", description_ru="Весенние тюльпаны различных ярких оттенков розового и красного.", 
          price=35.00, image_url="/img/tulip_fantasy.png", category="bouquet", rating_score=4.5, format="bouquet", size="average", is_trending=True, main_flower="tulips"
      ),
    ]
    
    db.add_all(products)
    db.commit()
    print("Multi-Vendor Database seeded successfully with real images!")
    db.close()

if __name__ == "__main__":
    seed_db()
