from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from pydantic import BaseModel
import models
from database import get_db

router = APIRouter(
    tags=["delivery"]
)

geolocator = Nominatim(user_agent="tashkent_flora_delivery")

class DeliveryEstimateRequest(BaseModel):
    branch_id: int
    user_address: str

class DeliveryEstimateResponse(BaseModel):
    distance_km: float
    estimated_minutes: int
    delivery_fee: float

@router.post("/estimate", response_model=DeliveryEstimateResponse)
def estimate_delivery(req: DeliveryEstimateRequest, db: Session = Depends(get_db)):
    branch = db.query(models.Branch).filter(models.Branch.id == req.branch_id).first()
    if not branch or not branch.latitude or not branch.longitude:
        raise HTTPException(status_code=400, detail="Branch location not configured properly")

    try:
        user_loc = geolocator.geocode(req.user_address + ", Uzbekistan")
        if not user_loc:
            raise HTTPException(status_code=400, detail="Could not resolve user address")

        branch_coords = (branch.latitude, branch.longitude)
        user_coords = (user_loc.latitude, user_loc.longitude)
        
        distance_km = geodesic(branch_coords, user_coords).kilometers
        
        # Logic: 5 mins per km + 10 mins prep. $1 per km fee.
        estimated_minutes = int((distance_km * 5) + 10)
        delivery_fee = round(distance_km * 1.0, 2)
        
        return {
            "distance_km": round(distance_km, 2),
            "estimated_minutes": estimated_minutes, 
            "delivery_fee": delivery_fee
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
