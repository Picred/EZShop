from typing import Optional

from pydantic import BaseModel, Field


class ProductTypeDTO(BaseModel):
    id: Optional[int] = None
    description: str = None
    productCode: str = None
    pricePerUnit: float = None
    note: str = Field(min_length=1)
    quantity: int
    position: str
