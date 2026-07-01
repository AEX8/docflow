from unittest.mock import patch, MagicMock
import io

def test_upload_document_success(client, auth_headers):
    file_content = b"%PDF-1.4 test pdf content"
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.pdf"
        response = client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
        )
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test.pdf"
    assert data["file_type"] == "application/pdf"
    assert data["status"] == "uploaded"

def test_upload_document_invalid_type(client, auth_headers):
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.exe"
        response = client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.exe", io.BytesIO(b"fake exe"), "application/octet-stream")}
        )
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"]

def test_upload_document_requires_auth(client):
    response = client.post(
        "/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(b"content"), "application/pdf")}
    )
    assert response.status_code == 401

def test_list_documents_empty(client, auth_headers):
    response = client.get("/documents/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_list_documents_returns_only_own(client, auth_headers):
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.pdf"
        client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", io.BytesIO(b"%PDF test"), "application/pdf")}
        )
    response = client.get("/documents/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_delete_document(client, auth_headers):
    with patch("app.api.documents.upload_file") as mock_upload:
        mock_upload.return_value = "uploads/user-id/test.pdf"
        upload = client.post(
            "/documents/upload",
            headers=auth_headers,
            files={"file": ("test.pdf", io.BytesIO(b"%PDF test"), "application/pdf")}
        )
    doc_id = upload.json()["id"]
    with patch("app.api.documents.delete_file") as mock_delete:
        mock_delete.return_value = True
        response = client.delete(f"/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 204

def test_delete_nonexistent_document(client, auth_headers):
    response = client.delete("/documents/nonexistent-id", headers=auth_headers)
    assert response.status_code == 404