from typing import Optional

from pydantic import BaseModel, Field


class SoldProductDTO(BaseModel):
    id: int
    sale_id: int
    quantity: int = 1
    discount_rate: float = 0.0
