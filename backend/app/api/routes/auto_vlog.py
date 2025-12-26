"""
Auto Vlog Generation API Route
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import base64
import tempfile
import shutil
from pathlib import Path
import logging
from pydantic import BaseModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Import auto_vlog generation logic
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))

class AutoVlogRequest(BaseModel):
    images: List[str]  # Base64 encoded images
    music_category: Optional[str] = None  # upbeat, calm, cinematic, corporate, asian, acoustic, electronic


def cleanup_temp_directory(temp_dir: str):
    """Background task to clean up temporary files after response is sent"""
    try:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
            logger.info(f"Cleaned up temporary directory: {temp_dir}")
    except Exception as e:
        logger.warning(f"Cleanup warning: {e}")


@router.post("/auto-vlog")
async def generate_auto_vlog(request: AutoVlogRequest, background_tasks: BackgroundTasks):
    """
    Generate an auto vlog from multiple images with AI-powered music selection
    
    Args:
        images: List of base64 encoded images
        music_category: Optional music category (if not provided, AI will select)
    
    Returns:
        Generated video file
    """
    temp_dir = None
    
    try:
        # Validate input
        if not request.images or len(request.images) == 0:
            raise HTTPException(status_code=400, detail="At least one image is required")
        
        if len(request.images) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 images allowed")
        
        # Create temporary directory for processing
        temp_dir = tempfile.mkdtemp()
        input_dir = Path(temp_dir) / "input"
        output_dir = Path(temp_dir) / "output"
        input_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Processing {len(request.images)} images for auto vlog generation")
        
        # Save base64 images to temp input directory
        for idx, img_base64 in enumerate(request.images):
            try:
                # Remove data URL prefix if present
                if ',' in img_base64:
                    img_base64 = img_base64.split(',')[1]
                
                img_data = base64.b64decode(img_base64)
                img_path = input_dir / f"image_{idx:03d}.jpg"
                
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                    
                logger.info(f"Saved image {idx + 1}/{len(request.images)}")
                
            except Exception as e:
                logger.error(f"Error saving image {idx}: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid image data at index {idx}")
        
        # Import and run auto_vlog generation
        from app.ai_vid import auto_vlog_generator
        
        video_path = auto_vlog_generator.generate_vlog(
            input_dir=input_dir,
            output_dir=output_dir,
            music_category=request.music_category
        )
        
        if not video_path or not os.path.exists(video_path):
            raise HTTPException(status_code=500, detail="Video generation failed")
        
        logger.info(f"Auto vlog generated successfully: {video_path}")
        
        # Schedule cleanup AFTER response is sent
        background_tasks.add_task(cleanup_temp_directory, temp_dir)
        
        # Return video file
        return FileResponse(
            path=video_path,
            media_type="video/mp4",
            filename="auto_vlog.mp4"
        )
        
    except HTTPException:
        # Clean up immediately on error
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise
    except Exception as e:
        # Clean up immediately on error
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        logger.error(f"Auto vlog generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate auto vlog: {str(e)}")


@router.get("/auto-vlog/music-categories")
async def get_music_categories():
    """
    Get available music categories for auto vlog generation
    """
    return {
        "categories": [
            {"id": "auto", "name": "AI Auto-Select", "description": "Let AI analyze your photos and pick the best music"},
            {"id": "upbeat", "name": "Upbeat", "description": "Happy, energetic, fun"},
            {"id": "calm", "name": "Calm", "description": "Peaceful, relaxing, gentle"},
            {"id": "cinematic", "name": "Cinematic", "description": "Epic, dramatic, powerful"},
            {"id": "corporate", "name": "Corporate", "description": "Professional, motivational"},
            {"id": "asian", "name": "Asian", "description": "Traditional Asian influences"},
            {"id": "acoustic", "name": "Acoustic", "description": "Folk, guitar, organic"},
            {"id": "electronic", "name": "Electronic", "description": "Modern, digital, energetic"}
        ]
    }
