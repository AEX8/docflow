import sys
import os

# add backend/ to Python path
sys.path.insert(0, os.path.dirname(__file__))

# set test environment variables before importing anything
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")
os.environ.setdefault("AWS_REGION", "ap-southeast-2")
os.environ.setdefault("S3_BUCKET_NAME", "test-bucket")
os.environ.setdefault("ANTHROPIC_API_KEY", "test")