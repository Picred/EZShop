from typing import Optional

from pydantic import BaseModel


class ProductTypeDTO(BaseModel):
    id: Optional[int] = None
    description: str = None
    barcode: str = None
    price_per_unit: float = None
    note: str = None
    quantity: int
    position: str
