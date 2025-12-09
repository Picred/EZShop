from app.models.DTO.sale_dto import SaleDTO
from app.models.DTO.sold_product_dto import SoldProductDTO
from app.models.errors.bad_request import BadRequestError
from app.models.errors.invalid_barcode_format_error import InvalidFormatError
from app.repositories.sales_repository import SalesRepository
from app.services.input_validator_service import (
    validate_field_is_positive,
    validate_field_is_present,
)
from app.services.mapper_service import sale_dao_to_dto


class SalesController:
    def __init__(self):
        self.repo = SalesRepository()

    async def create_sale(self) -> SaleDTO:
        """
        Create a sale.

        - Parameters: sale_dto (SaleDTO)
        - Returns: SaleDTO
        """
        created_sale = await self.repo.create_sale()
        return sale_dao_to_dto(created_sale)
