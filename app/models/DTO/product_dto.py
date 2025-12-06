from typing import Optional

from pydantic import BaseModel


class ProductTypeDTO(BaseModel):
    id: Optional[int] = None
    description: str = None
    productCode: str = None
    pricePerUnit: float = None
    note: str = None
    quantity: int
    position: str
