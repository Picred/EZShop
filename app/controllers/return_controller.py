from typing import List

from app.models.DTO.boolean_response_dto import BooleanResponseDTO
from app.models.DTO.return_transaction_dto import ReturnTransactionDTO
from app.models.DAO.return_transaction_dao import ReturnTransactionDAO
from app.models.errors.bad_request import BadRequestError
from app.models.errors.notfound_error import NotFoundError
from app.models.errors.invalid_state_error import InvalidStateError
from app.models.return_status_type import ReturnStatus
from app.repositories.return_repository import ReturnRepository
from app.services.gtin_service import gtin
from app.services.input_validator_service import (
    validate_field_is_positive,
)
from app.services.mapper_service import return_transaction_dao_to_return_transaction_dto


class ReturnController:
    def __init__(self):
        self.repo = ReturnRepository()

    async def create_return_transaction(self, sale_id: int) -> ReturnTransactionDTO:
        """
        Create a new return transaction.

        - Parameters: return_transaction (ReturnDTO)
        - Returns: ReturnDTO
        """

        new_return_transaction: ReturnTransactionDAO = await self.repo.create_return_transaction(
            sale_id=sale_id
        )
        return return_transaction_dao_to_return_transaction_dto(new_return_transaction)
    
    async def list_returns(self) -> List[ReturnTransactionDTO]:
        """
        List present return transactions.

        - Returns: List of ReturnTransactionDTO
        """

        return_transactions_dao: List[ReturnTransactionDAO] = await self.repo.list_returns()
        return [
            return_transaction_dao_to_return_transaction_dto(rt)
            for rt in return_transactions_dao
        ]
        
    async def get_return_by_id(self, return_id: int) -> ReturnTransactionDTO:
        """
        Returns a Return Transaction given its ID, or NotFound if not present

        - Parameters: return_id as int
        - Returns: ReturnTransactionDTO
        """
        #validate_field_is_positive(sale_id, "product_id")
        return_transaction: ReturnTransactionDAO = await self.repo.get_return_by_id(return_id)
        return return_transaction_dao_to_return_transaction_dto(return_transaction)
    
    async def delete_return(self, return_id: int) -> BooleanResponseDTO:

        return_transaction: ReturnTransactionDTO = await self.get_return_by_id(return_id)
        if return_transaction.status == ReturnStatus.REIMBURSED:
            raise InvalidStateError("Cannot delete a reimbursed return")
        await self.repo.delete_return(return_id)

        return BooleanResponseDTO(success=True)