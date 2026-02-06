from pydantic import BaseModel

class BalanceRequestDTO(BaseModel):
    amount: float
