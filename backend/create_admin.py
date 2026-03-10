import sys
sys.path.append('.')
from database import SessionLocal
from models import User, RoleEnum
import security

db = SessionLocal()
admin_user = db.query(User).filter(User.email == 'admin@flower.uz').first()
if not admin_user:
    new_admin = User(
        email='admin@flower.uz',
        hashed_password=security.get_password_hash('admin123'),
        role=RoleEnum.ADMIN,
        display_name='Super Admin'
    )
    db.add(new_admin)
    db.commit()
    print('Created admin account: admin@flower.uz / admin123')
else:
    print('Admin already exists')
