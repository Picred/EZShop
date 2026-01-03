import asyncio

import pytest

from app.models.errors.conflict_error import ConflictError
from app.repositories.products_repository import ProductDAO, ProductsRepository
from init_db import init_db, reset


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
def reset_db(event_loop):
    event_loop.run_until_complete(reset())
    event_loop.run_until_complete(init_db())


# Tests
class TestProductsRepository:
    expected_products: list[ProductDAO] = []
    created_products: list[ProductDAO] = []

    @pytest.fixture(scope="session")
    def repo(self):
        return ProductsRepository()

    @pytest.fixture(scope="session", autouse=True)
    async def populate_product_repository(self, repo):
        self.expected_products.append(
            ProductDAO(
                description="coffe",
                barcode="4006381333931",
                price_per_unit=1.5,
                quantity=150,
                position="A-1-1",
                note="",
            )
        )
        self.expected_products.append(
            ProductDAO(
                description="milk",
                barcode="9780201379624",
                price_per_unit=1,
                quantity=100,
                position="A-1-2",
                note="",
            )
        )
        self.expected_products.append(
            ProductDAO(
                description="beer",
                barcode="5901234123457",
                price_per_unit=2,
                quantity=80,
                position="A-1-3",
                note="",
            )
        )

        for product in self.expected_products:
            self.created_products.append(
                await repo.create_product(
                    product.description,
                    product.barcode,
                    product.price_per_unit,
                    product.note,
                    product.quantity,
                    product.position,
                )
            )
        return

    @pytest.mark.asyncio
    async def test_create_new_product(self, repo):
        product: ProductDAO = ProductDAO(
            description="apple",
            barcode="7501031311309",
            price_per_unit=1,
            quantity=135,
            position="A-1-4",
            note="",
        )
        created_product: ProductDAO = await repo.create_product(
            product.description,
            product.barcode,
            product.price_per_unit,
            product.note,
            product.quantity,
            product.position,
        )
        assert created_product.barcode == product.barcode  # type: ignore
        assert created_product.price_per_unit == product.price_per_unit  # type: ignore
        assert created_product.quantity == product.quantity  # type: ignore
        assert created_product.description == product.description  # type: ignore

    @pytest.mark.asyncio
    async def test_create_duplicate_products(self, repo):
        product_barcode_duplicate: ProductDAO = ProductDAO(
            description="coffe",
            barcode="4006381333931",
            price_per_unit=1.5,
            quantity=150,
            position="A-1-0",
            note="",
        )
        product_position_duplicate: ProductDAO = ProductDAO(
            description="beer",
            barcode="8806085724013",
            price_per_unit=1,
            quantity=135,
            position="A-1-1",
            note="",
        )
        with pytest.raises(ConflictError) as result:
            await repo.create_product(
                product_barcode_duplicate.description,
                product_barcode_duplicate.barcode,
                product_barcode_duplicate.price_per_unit,
                product_barcode_duplicate.note,
                product_barcode_duplicate.quantity,
                product_barcode_duplicate.position,
            )

        with pytest.raises(ConflictError) as result:
            await repo.create_product(
                product_position_duplicate.description,
                product_position_duplicate.barcode,
                product_position_duplicate.price_per_unit,
                product_position_duplicate.note,
                product_position_duplicate.quantity,
                product_position_duplicate.position,
            )
