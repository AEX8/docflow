def test_register_success(client):
    response = client.post("/auth/register", json={
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["name"] == "John Doe"
    assert data["role"] == "user"
    assert "hashed_password" not in data
    assert "id" in data

def test_register_duplicate_email(client):
    client.post("/auth/register", json={
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    })
    response = client.post("/auth/register", json={
        "name": "Jane Doe",
        "email": "john@example.com",
        "password": "password456"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_register_invalid_email(client):
    response = client.post("/auth/register", json={
        "name": "John Doe",
        "email": "notanemail",
        "password": "password123"
    })
    assert response.status_code == 422

def test_login_success(client, registered_user):
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, registered_user):
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]

def test_login_nonexistent_user(client):
    response = client.post("/auth/login", json={
        "email": "nobody@example.com",
        "password": "password123"
    })
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.get("/documents/")
    assert response.status_code == 401

def test_protected_route_with_token(client, auth_headers):
    response = client.get("/documents/", headers=auth_headers)
    assert response.status_code == 200