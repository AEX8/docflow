import anthropic
import base64
import json
from app.core.config import settings
from app.services.s3 import s3_client
from fastapi import HTTPException

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

def fetch_file_from_s3(storage_path: str) -> tuple[bytes, str]:
    try:
        response = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=storage_path
        )
        file_bytes = response["Body"].read()
        content_type = response["ContentType"]
        return file_bytes, content_type
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch file from S3: {str(e)}")

def build_extraction_prompt(fields: list[dict]) -> str:
    field_descriptions = []
    for field in fields:
        required_text = "required" if field.get("required", True) else "optional"
        field_descriptions.append(
            f"- {field['name']} ({field['type']}, {required_text}): {field['description']}"
        )
    fields_text = "\n".join(field_descriptions)
    return f"""You are a document data extraction assistant. Extract the following fields from the document and return them as a JSON object.

Fields to extract:
{fields_text}

Rules:
- Return ONLY a valid JSON object, no other text
- If a required field cannot be found, set its value to null
- If an optional field cannot be found, omit it from the response
- For dates, use ISO 8601 format (YYYY-MM-DD)
- For numbers, return numeric values not strings
- Be precise and extract exact values from the document

Return the JSON object now:"""

def extract_from_document(
    file_bytes: bytes,
    content_type: str,
    fields: list[dict]
) -> tuple[dict, float]:
    prompt = build_extraction_prompt(fields)
    
    if content_type == "application/pdf":
        file_data = base64.standard_b64encode(file_bytes).decode("utf-8")
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": file_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
    else:
        file_data = base64.standard_b64encode(file_bytes).decode("utf-8")
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": content_type,
                                "data": file_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

    response_text = message.content[0].text.strip()
    
    try:
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        extracted_data = json.loads(response_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse extraction response as JSON"
        )

    extracted_count = sum(1 for f in fields if extracted_data.get(f["name"]) is not None)
    confidence_score = extracted_count / len(fields) if fields else 0.0

    return extracted_data, confidence_score