from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from .auth import get_current_user
import uuid
import os
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

router = APIRouter()

@router.get("/", response_model=list[schemas.OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get all orders belonging to the logged in user"""
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    return orders

@router.post("/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Find the order
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check if user is the owner of the order OR the seller/owner of the branch
    if current_user.role == models.RoleEnum.CUSTOMER and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
        
    if current_user.role == models.RoleEnum.SELLER:
        # Verify seller owns the branch
        branch = db.query(models.Branch).filter(models.Branch.id == order.branch_id).first()
        if not branch:
             raise HTTPException(status_code=404, detail="Branch not found")
        shop = db.query(models.Shop).filter(models.Shop.id == branch.shop_id).first()
        if shop.owner_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized to cancel this branch's order")

    # Only pending orders can be cancelled.
    if order.payment_status != models.PaymentStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail="Cannot cancel an order that is not pending")

    # Update payment status
    order.payment_status = models.PaymentStatusEnum.CANCELLED
    db.commit()
    db.refresh(order)
    
    return order

def send_telegram_notification(order_id: int, total: float, address: str, customer: str):
    """Notify vendor via Telegram Bot"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram configuration missing. Skipping notification.")
        return
        
    message = (
        f"🌸 *New Order #{order_id}*\n\n"
        f"👤 *Customer:* {customer}\n"
        f"💰 *Total:* ${total:.2f}\n"
        f"📍 *Address:* {address}\n\n"
        f"Please confirm the order in the dashboard."
    )
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")

@router.post("/", response_model=schemas.OrderResponse)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new order and notify the vendor via Telegram"""
    
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items.append(models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_time=product.price
        ))
        
        # Update stock
        product.stock_quantity -= item.quantity

    # Add flat delivery fee (mock)
    delivery_fee = 4.20
    
    new_order = models.Order(
        user_id=current_user.id,
        branch_id=order_data.branch_id,
        total_amount=total_amount + delivery_fee,
        delivery_fee=delivery_fee,
        recipient_name=order_data.recipient_name,
        recipient_phone=order_data.recipient_phone,
        is_anonymous=order_data.is_anonymous,
        gift_message=order_data.gift_message,
        delivery_time_slot=order_data.delivery_time_slot,
        items=order_items
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Trigger Telegram Notification
    branch = db.query(models.Branch).filter(models.Branch.id == new_order.branch_id).first()
    address = branch.address if branch else "Unknown Address"
    customer_name = current_user.display_name or current_user.email
    
    send_telegram_notification(new_order.id, new_order.total_amount, address, customer_name)
    
    
    return new_order

@router.post("/telegram/webhook")
async def telegram_webhook(update: dict, db: Session = Depends(get_db)):
    """Handle incoming messages from Telegram Bot (Callback for confirmations)"""
    # Simply log for now - in production we would verify hash
    print(f"TELEGRAM WEBHOOK RECEIVED: {update}")
    
    if "message" in update and "text" in update["message"]:
        text = update["message"]["text"]
        if text.startswith("/confirm_"):
            try:
                order_id = int(text.split("_")[1])
                order = db.query(models.Order).filter(models.Order.id == order_id).first()
                if order:
                    order.payment_status = models.PaymentStatusEnum.PAID # Or CONFIRMED
                    db.commit()
                    return {"status": "success", "message": f"Order {order_id} confirmed"}
            except Exception:
                pass
                
    return {"status": "ignored"}

@router.get("/telegram/test")
def test_telegram_connectivity():
    """Temporary testing endpoint to verify Telegram Bot configuration"""
    import os
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not token or not chat_id or token.startswith("7734827104:AAH_MOCK"):
        raise HTTPException(status_code=400, detail="Please configure real TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env first")
        
    try:
        # Re-import requests just in case
        import requests 
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": "🌸 *Hello Florence!* \n\nYour Telegram Bot integration is successfully connected and ready to receive real orders!",
            "parse_mode": "Markdown"
        }
        res = requests.post(url, json=payload, timeout=5)
        
        if res.status_code == 200:
            return {"status": "success", "message": "Test message sent to Telegram successfully!"}
        else:
            return {"status": "error", "message": f"Telegram API returned {res.status_code}: {res.text}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send request: {str(e)}")

