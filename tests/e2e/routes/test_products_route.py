import asyncio

import pytest
from fastapi.testclient import TestClient

from init_db import init_db, reset
from main import app


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


BASE_URL = "http://127.0.0.1:8000/api/v1"


@pytest.fixture(scope="session", autouse=True)
def auth_tokens(event_loop, client):
    """Authenticate users once and return their JWT tokens."""

    event_loop.run_until_complete(reset())
    event_loop.run_until_complete(init_db())
    users = {
        "admin": {"username": "admin", "password": "admin"},
        "shop_manager": {"username": "ShopManager", "password": "ShManager"},
        "cashier": {"username": "Cashier", "password": "Cashier"},
    }

    tokens = {}
    for role, creds in users.items():
        response = client.post(BASE_URL + "/auth", json=creds)
        assert response.status_code == 200, f"Login failed for {role}"
        tokens[role] = f"Bearer {response.json()['token']}"

    return tokens


def auth_header(tokens, role: str):
    return {"Authorization": tokens[role]}


class TestProductsRouter:

    @pytest.mark.parametrize(
        "role, expected_exception_code",
        [
            ("admin", 200),  # success
            ("cashier", 200),  # success
            ("shop_manager", 200),  # success
            (None, 401),  # unauthenticated
        ],
    )
    def test_list_all_products(
        self, client, auth_tokens, role, expected_exception_code
    ):

        headers = auth_header(auth_tokens, role) if role else None
        resp = client.get(
            BASE_URL + "/products",
            headers=headers,
        )

        assert resp.status_code == expected_exception_code

        payload = resp.json()

        if role != None:
            assert payload == []

    @pytest.mark.parametrize(
        "role, expected_exception_code",
        [
            ("admin", 400),  # success, but no product provided
            ("cashier", 403),  # fail - insufficient rights
            ("shop_manager", 400),  # success, but no product provided
            (None, 401),  # unauthenticated
        ],
    )
    def test_create_new_product_authentication(
        self, client, auth_tokens, role, expected_exception_code
    ):

        headers = auth_header(auth_tokens, role) if role else None
        resp = client.post(
            BASE_URL + "/products",
            headers=headers,
        )

        if resp.status_code == 422:
            resp.status_code = 400

        assert resp.status_code == expected_exception_code

    @pytest.mark.parametrize(
        "product, expected_exception_code",
        [
            (
                {  # correct product
                    "description": "Test product",
                    "barcode": "123456789012",
                    "price_per_unit": 9.99,
                    "note": "",
                    "quantity": 10,
                    "position": "A-1-1",
                },
                201,
            ),
            (
                {  # invalid barcode
                    "description": "Test product",
                    "barcode": "123",
                    "price_per_unit": 9.99,
                    "note": "",
                    "quantity": 10,
                    "position": "A-1-1",
                },
                400,
            ),
            (
                {  # empty description
                    "description": "",
                    "barcode": "123456789012",
                    "price_per_unit": 9.99,
                    "note": "",
                    "quantity": 10,
                    "position": "A-1-1",
                },
                400,
            ),
            (
                {  # wrong position format
                    "description": "test product",
                    "barcode": "123456789012",
                    "note": "",
                    "quantity": 10,
                    "position": "A-1",
                },
                400,
            ),
        ],
    )
    def test_create_new_product(
        self, client, auth_tokens, product, expected_exception_code
    ):

        headers = auth_header(auth_tokens, "admin")
        resp = client.post(
            BASE_URL + "/products",
            json=product,
            headers=headers,
        )

        if resp.status_code == 422:
            resp.status_code = 400

        assert resp.status_code == expected_exception_code

    @pytest.mark.parametrize(
        "input_id, expected_exception_code",
        [
            (1, 200),  # success
            (-1, 400),  # invalid id
            (12345, 404),  # no product found
            ("abc", 400),  # invalid id
        ],
    )
    def test_get_product_by_id(
        self, client, auth_tokens, input_id, expected_exception_code
    ):

        headers = auth_header(auth_tokens, "admin")
        product = {
            "description": "Test product",
            "barcode": "123456789012",
            "price_per_unit": 9.99,
            "note": "",
            "quantity": 10,
            "position": "A-1-1",
        }

        client.post(
            BASE_URL + "/products",
            json=product,
            headers=headers,
        )

        resp = client.get(
            BASE_URL + "/products/" + str(input_id),
            headers=headers,
        )

        if resp.status_code == 422:
            resp.status_code = 400

        assert resp.status_code == expected_exception_code
