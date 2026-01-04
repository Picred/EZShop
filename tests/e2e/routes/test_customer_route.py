"""
End-to-end tests for customer routes.
Follows the pattern in tests/acceptance/user_test.py: uses TestClient and authenticates admin/manager/cashier.
"""

import asyncio
import pytest
# suppress SQLAlchemy 'fully NULL primary key identity' warnings for these e2e tests
pytestmark = pytest.mark.filterwarnings("ignore::sqlalchemy.exc.SAWarning")
from fastapi.testclient import TestClient

from main import app
from init_db import reset, init_db


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
    # initialize/reset DB and create default users
    event_loop.run_until_complete(reset())
    event_loop.run_until_complete(init_db())

    users = {
        "admin": {"username": "admin", "password": "admin"},
        "manager": {"username": "ShopManager", "password": "ShManager"},
        "cashier": {"username": "Cashier", "password": "Cashier"},
    }

    tokens = {}
    for role, creds in users.items():
        resp = client.post(BASE_URL + "/auth", json=creds)
        assert resp.status_code == 200
        tokens[role] = f"Bearer {resp.json()['token']}"

    return tokens


def auth_header(tokens, role: str):
    return {"Authorization": tokens[role]}


# Sample payloads
CUSTOMER_SAMPLE = {"name": "John Doe", "card": None}
CUSTOMER_SAMPLE_2 = {"name": "Jane Smith", "card": None}
CUSTOMER_WITHOUT_NAME_SAMPLE = {"name": "", "card": None}
CUSTOMER_WITH_CARD = {"name": "Jane Smith", "card": {"card_id": "1234567890", "points": 0}}
CUSTOMER_UPDATE = {"name": "John Updated", "card": None}


# --- Create customer tests ---

def test_create_customer_success_as_admin(client, auth_tokens):
    resp = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == CUSTOMER_SAMPLE["name"]
    assert "id" in data


def test_create_customer_unauthenticated(client):
    resp = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE)
    assert resp.status_code == 401
    
def test_create_customer_without_name(client, auth_tokens):
    resp = client.post(BASE_URL + "/customers", json=CUSTOMER_WITHOUT_NAME_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code in (400, 422)
   


# --- List customers ---

def test_list_customers(client, auth_tokens):
    # ensure at least one customer exists
    client.post(BASE_URL + "/customers", json={"name": "List Test", "card": None}, headers=auth_header(auth_tokens, "admin"))
    resp = client.get(BASE_URL + "/customers", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(c.get("name") == "List Test" for c in data)
    
def test_create_customer_unauthenticated(client):
    resp = client.get(BASE_URL + "/customers")
    assert resp.status_code == 401


# --- Get customer ---

def test_get_customer_success(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.get(f"{BASE_URL}/customers/{cid}", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 200
    assert resp.json()["id"] == cid


def test_get_customer_not_found(client, auth_tokens):
    resp = client.get(BASE_URL + "/customers/999999", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 404
    
def test_get_customer_unauthenticated(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.get(f"{BASE_URL}/customers/{cid}")

    assert resp.status_code == 401


# --- Update customer ---

def test_update_customer_success(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.put(f"{BASE_URL}/customers/{cid}", json=CUSTOMER_UPDATE, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 201
    assert resp.json()["name"] == CUSTOMER_UPDATE["name"]
    

def test_update_customer_not_found(client, auth_tokens):
    resp = client.put(BASE_URL + "/customers/999999", json=CUSTOMER_UPDATE, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 404

def test_update_customer_invalid(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.put(f"{BASE_URL}/customers/{cid}", json=CUSTOMER_WITHOUT_NAME_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code in (400, 422)
    
def test_update_customer_unauthenticated(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.put(f"{BASE_URL}/customers/{cid}", json=CUSTOMER_UPDATE)

    assert resp.status_code == 401

# --- Delete customer ---

def test_delete_customer_success(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.delete(f"{BASE_URL}/customers/{cid}", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 204
    # verify gone
    get_resp = client.get(f"{BASE_URL}/customers/{cid}", headers=auth_header(auth_tokens, "admin"))
    assert get_resp.status_code == 404

def test_delete_customer_with_card(client, auth_tokens):
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    card_id = card_resp.json()["card_id"]
    create = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    attach = client.patch(f"{BASE_URL}/customers/{cid}/attach-card/{card_id}", headers=auth_header(auth_tokens, "admin"))
    assert attach.status_code == 201
    
    
    resp = client.delete(f"{BASE_URL}/customers/{cid}", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 204
    # verify gone
    get_resp = client.get(f"{BASE_URL}/customers/{cid}", headers=auth_header(auth_tokens, "admin"))
    assert get_resp.status_code == 404
    
    # verify card is also gone
    resp = client.patch(f"{BASE_URL}/customers/cards/{card_id}", params={"points": 42}, headers=auth_header(auth_tokens, "admin"))
    assert get_resp.status_code == 404
     
def test_delete_customer_not_found(client, auth_tokens):
    resp = client.delete(BASE_URL + "/customers/999999", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 404


# --- Card management ---

def test_create_card(client, auth_tokens):
    # create card
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    assert card_resp.status_code == 201
    

def test_create_card_unauthenticated(client):
    # create card
    card_resp = client.post(BASE_URL + "/customers/cards")
    assert card_resp.status_code == 401


def test_create_card_and_attach(client, auth_tokens):
    # create customer
    create = client.post(BASE_URL + "/customers", json={"name": "CardAttach Test", "card": None}, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    # create card
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    assert card_resp.status_code == 201
    card_id = card_resp.json()["card_id"]
    # attach
    attach = client.patch(f"{BASE_URL}/customers/{cid}/attach-card/{card_id}", headers=auth_header(auth_tokens, "admin"))
    assert attach.status_code == 201
    data = attach.json()
    assert data.get("card") is not None
    assert data["card"]["card_id"] == card_id
    assert data["card"]["points"] == 0
    
def test_update_customer_with_card_attached_to_diff_customer(client, auth_tokens):
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    create_1 = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE, headers=auth_header(auth_tokens, "admin"))
    create_2 = client.post(BASE_URL + "/customers", json=CUSTOMER_SAMPLE_2, headers=auth_header(auth_tokens, "admin"))

    card_id = card_resp.json()["card_id"]
    cid_1 = create_1.json()["id"]
    cid_2 = create_2.json()["id"]

    attach = client.patch(f"{BASE_URL}/customers/{cid_1}/attach-card/{card_id}", headers=auth_header(auth_tokens, "admin"))
    assert attach.status_code == 201
    
    attach_to_other_customer = client.patch(f"{BASE_URL}/customers/{cid_2}/attach-card/{card_id}", headers=auth_header(auth_tokens, "admin"))

    assert attach_to_other_customer.status_code == 409

def test_create_card_and_attach_unauthenticated(client, auth_tokens):
    # create customer
    create = client.post(BASE_URL + "/customers", json={"name": "CardAttach Test", "card": None}, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    # create card
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    assert card_resp.status_code == 201
    card_id = card_resp.json()["card_id"]
    # attach
    attach = client.patch(f"{BASE_URL}/customers/{cid}/attach-card/{card_id}")
    assert attach.status_code == 401



def test_modify_points(client, auth_tokens):
    # create card
    card_resp = client.post(BASE_URL + "/customers/cards", headers=auth_header(auth_tokens, "admin"))
    card_id = card_resp.json()["card_id"]
    # modify
    resp = client.patch(f"{BASE_URL}/customers/cards/{card_id}", params={"points": 42}, headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code == 201
    assert resp.json()["points"] == 42


def test_attach_card_invalid_format(client, auth_tokens):
    create = client.post(BASE_URL + "/customers", json={"name": "InvalidFormat", "card": None}, headers=auth_header(auth_tokens, "admin"))
    cid = create.json()["id"]
    resp = client.patch(f"{BASE_URL}/customers/{cid}/attach-card/invalid_id", headers=auth_header(auth_tokens, "admin"))
    assert resp.status_code in (400, 422)
