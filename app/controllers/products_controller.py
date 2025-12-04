from typing import List, Optional

from app.models.DTO.boolean_response_dto import BooleanResponseDTO
from app.models.DTO.product_dto import ProductTypeDTO
from app.models.errors.bad_request import BadRequestError
from app.models.errors.invalid_barcode_format_error import InvalidFormatError
from app.repositories.products_repository import ProductsRepository
from app.services.gtin_service import gtin
from app.services.mapper_service import productdao_to_product_type_dto


class ProductsController:
    def __init__(self):
        self.repo = ProductsRepository()

    async def create_product(self, product_dto: ProductTypeDTO) -> ProductTypeDTO: 
        """Create user - throws ConflictError if productCode exists"""
        created = await self.repo.create_product(
            product_dto.description,
            product_dto.productCode,
            product_dto.pricePerUnit,
            product_dto.note,
            product_dto.quantity,
            product_dto.position)
        return productdao_to_product_type_dto(created)

    async def list_products(self) -> List[ProductTypeDTO]:
        """Get all products"""
        daos = await self.repo.list_products()
        return [productdao_to_product_type_dto(dao) for dao in daos]

    async def get_product(self, product_id: int) -> Optional[ProductTypeDTO]:
        """Get product by id - throws NotFoundError if not found"""
        dao = await self.repo.get_product(product_id)
        return productdao_to_product_type_dto(dao) if dao else None

    async def get_product_by_barcode(self, barcode: str) -> Optional[ProductTypeDTO]:
        """Get product by barcode.
        - Throws: NotFoundError if not found of InvaliFormatError if GTIN verification fails
        """
        gtin_result = gtin(barcode)
        if not gtin_result:
            raise InvalidFormatError("Wrong barcode format (GTIN)")

        dao = await self.repo.get_product_by_barcode(barcode)
        return productdao_to_product_type_dto(dao) if dao else None

    async def get_product_by_description(self, description: str) -> Optional[ProductTypeDTO]:
        """Get product by description.
        """
        daos = await self.repo.get_product_by_description(description)
        return [productdao_to_product_type_dto(dao) for dao in daos]

    async def update_product(self, product_id: int, product_dto: ProductTypeDTO) -> BooleanResponseDTO:
        """Update existing product.
        - Returns: BooleanResponseDTO
        - Raises:
            - BadRequestError: if product_id < 0 or fields are invalid (description, pricePerUnit, barcode).
            - NotFoundError: if product_id not found.
            - ConflictError: if new barcode already exists
        """
        if len(product_dto.productCode) < 12 or len(product_dto.productCode) > 14:
            raise BadRequestError('productCode must be a string of 12-14 digits')
        gtin_result = gtin(product_dto.productCode)
        if product_id < 0 or product_id is None:
            raise BadRequestError("product_id must be positive")
        if not gtin_result:
            raise BadRequestError("Wrong barcode format (GTIN)")
        if product_dto.description is None or product_dto.description == '':
            raise BadRequestError('description is a mandatory field')
        if product_dto.pricePerUnit is None or product_dto.pricePerUnit == '':
            raise BadRequestError('pricePerUnit type is a mandatory field')
        # TODO: barcode can be updated ONLY IF there aren't returns, oreders or sales associated with it!
        # TODO: 

        updated = await self.repo.update_product(product_dto.description, product_dto.productCode, product_dto.pricePerUnit, product_dto.note, product_dto.quantity, product_dto.position, product_id)
        return BooleanResponseDTO(success=True) if updated else BooleanResponseDTO(success=False)
