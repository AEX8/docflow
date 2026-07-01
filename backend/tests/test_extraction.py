from unittest.mock import patch

def test_run_extraction_success(client, auth_headers):
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.pdf"
        import io
        doc = client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", io.BytesIO(b"%PDF test"), "application/pdf")}
        ).json()

    schema = client.post("/schemas/", json={
        "name": "Invoice",
        "fields": [
            {"name": "vendor", "type": "string", "description": "Vendor name", "required": True}
        ]
    }, headers=auth_headers).json()

    with patch("app.api.extraction.fetch_file_from_s3") as mock_fetch, \
         patch("app.api.extraction.extract_from_document") as mock_extract:
        mock_fetch.return_value = (b"%PDF test content", "application/pdf")
        mock_extract.return_value = ({"vendor": "Acme Ltd"}, 1.0)

        response = client.post("/extraction/", json={
            "document_id": doc["id"],
            "schema_id": schema["id"]
        }, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "completed"
    assert data["extracted_data"]["vendor"] == "Acme Ltd"
    assert data["confidence_score"] == 1.0

def test_run_extraction_wrong_document(client, auth_headers):
    schema = client.post("/schemas/", json={
        "name": "Invoice",
        "fields": [{"name": "vendor", "type": "string", "description": "test", "required": True}]
    }, headers=auth_headers).json()

    response = client.post("/extraction/", json={
        "document_id": "nonexistent-id",
        "schema_id": schema["id"]
    }, headers=auth_headers)
    assert response.status_code == 404

def test_get_extraction_results(client, auth_headers):
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.pdf"
        import io
        doc = client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", io.BytesIO(b"%PDF test"), "application/pdf")}
        ).json()

    schema = client.post("/schemas/", json={
        "name": "Invoice",
        "fields": [{"name": "vendor", "type": "string", "description": "test", "required": True}]
    }, headers=auth_headers).json()

    with patch("app.api.extraction.fetch_file_from_s3") as mock_fetch, \
         patch("app.api.extraction.extract_from_document") as mock_extract:
        mock_fetch.return_value = (b"%PDF test", "application/pdf")
        mock_extract.return_value = ({"vendor": "Acme"}, 1.0)
        client.post("/extraction/", json={
            "document_id": doc["id"],
            "schema_id": schema["id"]
        }, headers=auth_headers)

    response = client.get(f"/extraction/results/{doc['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1