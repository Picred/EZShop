from typing import List, Optional
from pydantic import BaseModel

class KPIDTO(BaseModel):
    value: float
    change: float

class ChartDataPointDTO(BaseModel):
    label: str
    value: float

class ProductStatDTO(BaseModel):
    barcode: str
    description: str
    quantity_sold: int
    revenue: float

class DashboardDTO(BaseModel):
    total_revenue: KPIDTO
    total_sales: KPIDTO
    active_orders: KPIDTO
    total_products: KPIDTO
    earnings_trend: List[ChartDataPointDTO]
    top_products: List[ProductStatDTO]
