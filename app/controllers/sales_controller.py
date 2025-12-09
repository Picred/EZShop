from typing import List, Optional

from app.models.DAO.sale_dao import SaleDAO
from app.models.DTO.sale_dto import SaleDTO
from app.models.DTO.sold_product_dto import SoldProductDTO
from app.models.errors.bad_request import BadRequestError
from app.models.errors.invalid_barcode_format_error import InvalidFormatError
from app.models.errors.notfound_error import NotFoundError
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

        - Parameters: none
        - Returns: SaleDTO
        """
        created_sale: SaleDAO = await self.repo.create_sale()
        return sale_dao_to_dto(created_sale)

    async def list_sales(self) -> List[SaleDTO]:
        """
        Returns a list of sales present in the database

        - Parameters: none
        - Returns: List[SaleDTO]
        """
        sales_dao: Optional[List[SaleDAO]] = await self.repo.list_sales()
        sales_dto: List[SaleDTO] = list()
        if not sales_dao:
            raise NotFoundError("Product not found")
        for sale_dao in sales_dao:
            sales_dto.append(sale_dao_to_dto(sale_dao))

        return sales_dto

    async def get_sale_by_id(self, sale_id: int) -> SaleDTO:
        """
        Returns a sale given its ID

        - Parameters: sale_id as int
        - Returns: SaleDTO
        """
        validate_field_is_positive(sale_id, "product_id")
        sale: SaleDAO = await self.repo.get_sale_by_id(sale_id)
        return sale_dao_to_dto(sale)
