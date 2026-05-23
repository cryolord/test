"""SQLAlchemy ORM models."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Item id={self.id} name={self.name!r}>"
