"""
Test endpoint for verifying frontend-backend connection
"""
from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import Response
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/test-style-guide")
async def test_style_guide(
    image: UploadFile = File(...),
    genre: str = Form(...),
    custom_prompt: str = Form(None),
    fidelity: float = Form(0.5),
    output_format: str = Form("png")
):
    """
    Test endpoint that returns a modified image WITHOUT calling Stability AI.
    This is used to test the frontend-backend connection without using credits.
    
    Returns a simple image with text overlay showing that the connection works.
    """
    logger.info(f"TEST endpoint called: genre={genre}, fidelity={fidelity}, format={output_format}")
    
    try:
        # Read the uploaded image
        image_bytes = await image.read()
        logger.info(f"Received image: {len(image_bytes)} bytes")
        
        # Open the image
        img = Image.open(BytesIO(image_bytes))
        logger.info(f"Image dimensions: {img.size}")
        
        # Create a copy to modify
        img_copy = img.copy()
        
        # Add text overlay to show it's working
        draw = ImageDraw.Draw(img_copy)
        
        # Add a semi-transparent overlay
        overlay = Image.new('RGBA', img_copy.size, (0, 0, 0, 128))
        img_copy = img_copy.convert('RGBA')
        img_copy = Image.alpha_composite(img_copy, overlay)
        
        # Add text
        draw = ImageDraw.Draw(img_copy)
        text = f"✅ CONNECTION TEST SUCCESSFUL!\n\nGenre: {genre}\nFidelity: {fidelity}\n\n(No credits used - this is a test)"
        
        # Use default font
        try:
            # Try to use a larger font if available
            font_size = 30
            bbox = draw.textbbox((0, 0), text)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except:
            text_width = 200
            text_height = 100
        
        # Position text in center
        x = (img_copy.size[0] - text_width) // 2
        y = (img_copy.size[1] - text_height) // 2
        
        # Draw white text
        draw.text((x, y), text, fill=(255, 255, 255, 255))
        
        # Convert back to RGB for PNG
        img_copy = img_copy.convert('RGB')
        
        # Save to bytes
        output_buffer = BytesIO()
        img_copy.save(output_buffer, format=output_format.upper())
        output_bytes = output_buffer.getvalue()
        
        logger.info(f"Test image created: {len(output_bytes)} bytes")
        
        # Return the modified image
        content_type_map = {
            "png": "image/png",
            "jpeg": "image/jpeg",
            "webp": "image/webp"
        }
        
        return Response(
            content=output_bytes,
            media_type=content_type_map.get(output_format, "image/png"),
            headers={
                "Content-Disposition": f'inline; filename="test_image.{output_format}"',
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        logger.error(f"Test endpoint error: {str(e)}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Test endpoint error: {str(e)}"
        )
