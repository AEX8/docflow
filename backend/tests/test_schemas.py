def test_create_schema_success(client, auth_headers):
    response = client.post("/schemas/", json={
        "name": "Invoice Extractor",
        "description": "Extracts invoice fields",
        "fields": [
            {"name": "vendor", "type": "string", "description": "Vendor name", "required": True},
            {"name": "amount", "type": "number", "description": "Total amount", "required": True}
        ]
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Invoice Extractor"
    assert len(data["fields"]) == 2
    assert "id" in data

def test_create_schema_requires_auth(client):
    response = client.post("/schemas/", json={
        "name": "Test",
        "fields": []
    })
    assert response.status_code == 401

def test_list_schemas_empty(client, auth_headers):
    response = client.get("/schemas/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_list_schemas(client, auth_headers):
    client.post("/schemas/", json={
        "name": "Schema 1",
        "fields": [{"name": "field1", "type": "string", "description": "test", "required": True}]
    }, headers=auth_headers)
    client.post("/schemas/", json={
        "name": "Schema 2",
        "fields": [{"name": "field2", "type": "number", "description": "test", "required": False}]
    }, headers=auth_headers)
    response = client.get("/schemas/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_delete_schema(client, auth_headers):
    create = client.post("/schemas/", json={
        "name": "To Delete",
        "fields": [{"name": "f", "type": "string", "description": "test", "required": True}]
    }, headers=auth_headers)
    schema_id = create.json()["id"]
    response = client.delete(f"/schemas/{schema_id}", headers=auth_headers)
    assert response.status_code == 204

def test_delete_nonexistent_schema(client, auth_headers):
    response = client.delete("/schemas/nonexistent-id", headers=auth_headers)
    assert response.status_code == 404

def test_get_schema(client, auth_headers):
    create = client.post("/schemas/", json={
        "name": "My Schema",
        "fields": [{"name": "f", "type": "string", "description": "test", "required": True}]
    }, headers=auth_headers)
    schema_id = create.json()["id"]
    response = client.get(f"/schemas/{schema_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "My Schema"