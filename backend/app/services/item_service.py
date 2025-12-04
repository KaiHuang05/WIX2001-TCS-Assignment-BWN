"""
Item service - Business logic for item operations
"""
from typing import List, Optional
from datetime import datetime

from app.schemas.item import Item, ItemCreate, ItemUpdate


class ItemService:
    """Service class for item operations"""
    
    def __init__(self):
        # In-memory storage for demonstration
        # Replace with database operations in production
        self.items: List[Item] = [
            Item(
                id=1,
                name="Photo Print",
                description="4x6 printed photo",
                price=5.99,
                is_available=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            Item(
                id=2,
                name="Digital Package",
                description="Digital photos bundle",
                price=19.99,
                is_available=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]
        self.next_id = 3
    
    def get_all_items(self) -> List[Item]:
        """Retrieve all items"""
        return self.items
    
    def get_item_by_id(self, item_id: int) -> Optional[Item]:
        """Retrieve a specific item by ID"""
        return next((item for item in self.items if item.id == item_id), None)
    
    def create_item(self, item_data: ItemCreate) -> Item:
        """Create a new item"""
        new_item = Item(
            id=self.next_id,
            name=item_data.name,
            description=item_data.description,
            price=item_data.price,
            is_available=item_data.is_available,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.items.append(new_item)
        self.next_id += 1
        return new_item
    
    def update_item(self, item_id: int, item_update: ItemUpdate) -> Optional[Item]:
        """Update an existing item"""
        item = self.get_item_by_id(item_id)
        if not item:
            return None
        
        # Update only provided fields
        update_data = item_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        item.updated_at = datetime.utcnow()
        return item
    
    def delete_item(self, item_id: int) -> bool:
        """Delete an item"""
        item = self.get_item_by_id(item_id)
        if not item:
            return False
        
        self.items.remove(item)
        return True
