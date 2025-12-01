from pydantic import BaseModel, Field
from typing import Optional


class ProductTypeDTO(BaseModel):
    id: Optional[int] = None
    description: str = None
    productCode: str = None
    pricePerUnit: float = None
    note: str = Field(min_length=1)
    quantity: int
    position: str
