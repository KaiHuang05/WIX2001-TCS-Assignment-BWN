import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.api

load_dotenv()

cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {'*' * 10}{api_secret[-4:] if api_secret else 'NOT SET'}")

# Try to configure and test
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True
)

print("\nTesting Cloudinary API...")
try:
    result = cloudinary.api.usage()
    print("✓ Connection successful!")
    print(f"Plan: {result.get('plan')}")
    print(f"Resources: {result.get('resources')}")
except Exception as e:
    print(f"✗ Error: {e}")
