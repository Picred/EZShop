from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import AsyncSessionLocal
from app.models.DAO.sale_dao import SaleDAO
from app.models.DAO.sold_product_dao import SoldProductDAO
from app.models.errors.notfound_error import NotFoundError
from app.utils import find_or_throw_not_found, throw_conflict_if_found


class SalesRepository:

    def __init__(self, session: Optional[AsyncSession] = None):
        self._session = session

    async def _get_session(self) -> AsyncSession:
        return self._session or AsyncSessionLocal()

    async def create_sale(self) -> SaleDAO:
        async with await self._get_session() as session:
            sale = SaleDAO(
                status="OPEN",
                discount_rate=0.0,
                lines=[],
            )

            session.add(sale)
            await session.commit()
            await session.refresh(sale)
            return sale

    async def list_sales(self) -> List[SaleDAO]:
        """
        Get all sales present in the database
        - Returns: List[SaleDAO]
        """
        async with await self._get_session() as session:
            result = await session.execute(select(SaleDAO))
            return list(result.scalars())
