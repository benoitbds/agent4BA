from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db, get_current_user
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
