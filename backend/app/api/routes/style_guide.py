"""
Stability AI Style Guide API Route
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
import requests
import base64
from io import BytesIO
from PIL import Image
from app.core.config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Genre prompt templates
GENRE_PROMPTS = {
    "batik": (
        "Create a cheerful souvenir postcard landscape featuring traditional Malaysian batik patterns "
        "as decorative borders and clothing accents, warm earthy tones, soft natural lighting, "
        "photorealistic preserved facial features, cultural elegance, welcoming travel-memento mood, "
        "and collectible postcard composition."
    ),
    "songket": (
        "Generate an elegant souvenir landscape framed with intricate Malaysian songket gold motifs, "
        "subtle royal glow, refined cinematic color grading, accurate realistic smiling face preserved "
        "from original photo, premium cultural atmosphere, luxurious balance, and a high-quality "
        "commemorative postcard aesthetic."
    ),
    "vintage": (
        "Design a vintage Malaysian travel-style souvenir landscape with muted nostalgic colors, "
        "gentle film grain, classic tourism poster composition, photorealistic face preserved without "
        "distortion, soft illustration-like realism applied only to background, warm retro mood, "
        "and collectible postcard charm."
    )
}


@router.post("/style-guide")
async def generate_style_guide(
    image: UploadFile = File(...),
    genre: str = Form(...),
    custom_prompt: str = Form(None),
    fidelity: float = Form(0.5),
    output_format: str = Form("png")
):
    """
    Generate a styled image using Stability AI Style Guide
    
    Args:
        image: The input image file
        genre: The style genre (batik, songket, vintage, or custom)
        custom_prompt: Custom prompt (required if genre is 'custom')
        fidelity: How closely the output resembles input style (0-1, default 0.5)
        output_format: Output format (png, jpeg, webp)
    
    Returns:
        The generated styled image
    """
    
    logger.info(f"Received style-guide request: genre={genre}, fidelity={fidelity}, format={output_format}")
    
    # Check if API key is configured
    if not settings.STABILITY_AI_API_KEY:
        logger.error("Stability AI API key not configured")
        raise HTTPException(
            status_code=500,
            detail="Stability AI API key not configured"
        )
    
    # Determine the prompt to use
    if genre == "custom":
        if not custom_prompt:
            raise HTTPException(
                status_code=400,
                detail="Custom prompt is required when genre is 'custom'"
            )
        prompt = custom_prompt
    else:
        prompt = GENRE_PROMPTS.get(genre)
        if not prompt:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid genre: {genre}. Must be batik, songket, vintage, or custom"
            )
    
    try:
        # Read and validate the image
        image_bytes = await image.read()
        logger.info(f"Image received: {len(image_bytes)} bytes")
        
        # Optional: Validate image with PIL
        try:
            img = Image.open(BytesIO(image_bytes))
            # Ensure image meets requirements (64px minimum, aspect ratio 1:2.5 to 2.5:1)
            width, height = img.size
            logger.info(f"Image dimensions: {width}x{height}")
            
            if width < 64 or height < 64:
                raise HTTPException(
                    status_code=400,
                    detail="Image dimensions must be at least 64x64 pixels"
                )
            
            aspect_ratio = width / height
            if aspect_ratio < 0.4 or aspect_ratio > 2.5:
                raise HTTPException(
                    status_code=400,
                    detail="Image aspect ratio must be between 1:2.5 and 2.5:1"
                )
            
            # Determine the best aspect ratio for Stability AI
            if aspect_ratio >= 1.7:
                output_aspect_ratio = "16:9"
            elif aspect_ratio >= 1.4:
                output_aspect_ratio = "3:2"
            elif aspect_ratio >= 1.1:
                output_aspect_ratio = "1:1"
            elif aspect_ratio >= 0.8:
                output_aspect_ratio = "4:5"
            elif aspect_ratio >= 0.6:
                output_aspect_ratio = "2:3"
            else:
                output_aspect_ratio = "9:16"
            
            logger.info(f"Input aspect ratio: {aspect_ratio:.2f}, Using output: {output_aspect_ratio}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Image validation error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        # Prepare the API request
        api_url = "https://api.stability.ai/v2beta/stable-image/control/style"
        logger.info(f"Calling Stability AI API...")
        
        headers = {
            "authorization": f"Bearer {settings.STABILITY_AI_API_KEY}",
            "accept": "image/*"
        }
        
        files = {
            "image": (image.filename, image_bytes, image.content_type)
        }
        
        data = {
            "prompt": prompt,
            "fidelity": fidelity,
            "output_format": output_format,
            "aspect_ratio": output_aspect_ratio  # Dynamic aspect ratio based on input
        }
        
        # Call Stability AI API
        response = requests.post(
            api_url,
            headers=headers,
            files=files,
            data=data,
            timeout=60  # 60 second timeout
        )
        
        logger.info(f"Stability AI response: status={response.status_code}")
        
        # Check response status
        if response.status_code == 200:
            logger.info(f"Success! Generated image size: {len(response.content)} bytes")
            # Return the generated image
            content_type_map = {
                "png": "image/png",
                "jpeg": "image/jpeg",
                "webp": "image/webp"
            }
            
            return Response(
                content=response.content,
                media_type=content_type_map.get(output_format, "image/png"),
                headers={
                    "Content-Disposition": f'inline; filename="styled_image.{output_format}"',
                    "Cache-Control": "no-cache"
                }
            )
        elif response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="Content flagged by moderation system"
            )
        elif response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        else:
            # Try to get error details from response
            try:
                error_data = response.json()
                error_message = error_data.get("message", str(error_data))
            except:
                error_message = response.text or "Unknown error"
            
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Stability AI API error: {error_message}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating styled image: {str(e)}"
        )


@router.post("/style-guide-base64")
async def generate_style_guide_base64(
    image: UploadFile = File(...),
    genre: str = Form(...),
    custom_prompt: str = Form(None),
    fidelity: float = Form(0.5),
    output_format: str = Form("png")
):
    """
    Generate a styled image and return as base64 JSON
    
    Same parameters as /style-guide but returns JSON with base64 image
    """
    
    # Check if API key is configured
    if not settings.STABILITY_AI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Stability AI API key not configured"
        )
    
    # Determine the prompt to use
    if genre == "custom":
        if not custom_prompt:
            raise HTTPException(
                status_code=400,
                detail="Custom prompt is required when genre is 'custom'"
            )
        prompt = custom_prompt
    else:
        prompt = GENRE_PROMPTS.get(genre)
        if not prompt:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid genre: {genre}. Must be batik, songket, vintage, or custom"
            )
    
    try:
        # Read and validate the image
        image_bytes = await image.read()
        
        # Validate image and determine aspect ratio
        img = Image.open(BytesIO(image_bytes))
        width, height = img.size
        aspect_ratio = width / height
        
        # Determine the best aspect ratio for Stability AI
        if aspect_ratio >= 1.7:
            output_aspect_ratio = "16:9"
        elif aspect_ratio >= 1.4:
            output_aspect_ratio = "3:2"
        elif aspect_ratio >= 1.1:
            output_aspect_ratio = "1:1"
        elif aspect_ratio >= 0.8:
            output_aspect_ratio = "4:5"
        elif aspect_ratio >= 0.6:
            output_aspect_ratio = "2:3"
        else:
            output_aspect_ratio = "9:16"
        
        # Prepare the API request
        api_url = "https://api.stability.ai/v2beta/stable-image/control/style"
        
        headers = {
            "authorization": f"Bearer {settings.STABILITY_AI_API_KEY}",
            "accept": "application/json"  # Request base64 response
        }
        
        files = {
            "image": (image.filename, image_bytes, image.content_type)
        }
        
        data = {
            "prompt": prompt,
            "fidelity": fidelity,
            "output_format": output_format,
            "aspect_ratio": output_aspect_ratio
        }
        
        # Call Stability AI API
        response = requests.post(
            api_url,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )
        
        # Check response status
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="Content flagged by moderation system"
            )
        elif response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        else:
            try:
                error_data = response.json()
                error_message = error_data.get("message", str(error_data))
            except:
                error_message = response.text or "Unknown error"
            
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Stability AI API error: {error_message}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating styled image: {str(e)}"
        )
