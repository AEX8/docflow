import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from app.core.config import settings
import uuid

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def upload_file(file_obj, filename: str, content_type: str, user_id: str) -> str:
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    unique_filename = f"{uuid.uuid4()}.{extension}" if extension else str(uuid.uuid4())
    storage_key = f"uploads/{user_id}/{unique_filename}"
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.S3_BUCKET_NAME,
            storage_key,
            ExtraArgs={"ContentType": content_type}
        )
        return storage_key
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

def generate_presigned_url(storage_key: str, expiry_seconds: int = 3600) -> str:
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": storage_key},
            ExpiresIn=expiry_seconds
        )
        return url
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate URL: {str(e)}")

def delete_file(storage_key: str) -> bool:
    try:
        s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=storage_key)
        return True
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")