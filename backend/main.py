"""FastAPI backend for deployment test project."""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, engine
from models import Base, Item

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Deploy Test API",
    description="A simple FastAPI + PostgreSQL backend for testing one-click deployment",
    version="1.0.0",
)

# CORS - allow all origins for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Pydantic Schemas ----------

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Routes ----------

@app.get("/")
def root():
    return {"status": "ok", "message": "Deploy Test API is running 🚀"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check that also verifies DB connectivity."""
    try:
        db.execute("SELECT 1")  # type: ignore
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}


@app.get("/items", response_model=list[ItemResponse])
def list_items(db: Session = Depends(get_db)):
    return db.query(Item).order_by(Item.created_at.desc()).all()


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    item = Item(name=payload.name, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if payload.name is not None:
        item.name = payload.name
    if payload.description is not None:
        item.description = payload.description
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return None
