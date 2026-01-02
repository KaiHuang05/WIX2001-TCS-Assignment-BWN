"""
Simple Auto Vlog API - Direct Processing with Cloudinary Upload
Use this simpler version if subprocess approach is causing issues
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import base64
import os
import tempfile
import shutil
from pathlib import Path
import logging
from pydantic import BaseModel
import uuid

from app.ai_vid import auto_vlog_generator
from app.services.cloudinary_service import CloudinaryService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class AutoVlogRequest(BaseModel):
    images: List[str]  # Base64 encoded images
    music_category: Optional[str] = "auto"  # upbeat, calm, cinematic, corporate, asian, acoustic, electronic, or auto


@router.post("/auto-vlog/generate")
async def generate_vlog_direct(request: AutoVlogRequest):
    """
    Generate auto vlog directly (no subprocess) and upload to Cloudinary
    
    Suitable for:
    - Development/testing
    - Low-traffic deployments  
    - When subprocess approach has issues
    
    Note: On Render free tier, requests timeout after 30s.
    For production, use the subprocess /auto-vlog endpoint instead.
    
    Args:
        images: List of base64 encoded images
        music_category: Music category or "auto" for AI selection
    
    Returns:
        JSON with Cloudinary video URL
    """
    temp_dir = None
    
    try:
        # Validate input
        if not request.images or len(request.images) == 0:
            raise HTTPException(status_code=400, detail="At least one image is required")
        
        if len(request.images) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 images allowed")
        
        # Create temporary directory for processing
        temp_dir = Path(tempfile.mkdtemp(prefix="autovlog_"))
        input_dir = temp_dir / "input"
        output_dir = temp_dir / "output"
        input_dir.mkdir()
        output_dir.mkdir()
        
        logger.info(f"Processing {len(request.images)} images in {temp_dir}")
        
        # Decode and save images
        for i, img_b64 in enumerate(request.images):
            try:
                # Remove data URL prefix if present
                if "," in img_b64:
                    img_b64 = img_b64.split(",", 1)[1]
                
                # Decode base64
                img_data = base64.b64decode(img_b64)
                
                # Save to file
                img_path = input_dir / f"image_{i:03d}.jpg"
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                
                logger.info(f"Saved image {i+1}/{len(request.images)}")
                
            except Exception as e:
                logger.error(f"Failed to decode image {i}: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid image data at index {i}")
        
        # Determine music category
        music_cat = None if request.music_category == "auto" else request.music_category
        
        # Generate vlog with Cloudinary upload
        logger.info(f"Generating vlog (music: {request.music_category})...")
        result = auto_vlog_generator.generate_vlog(
            input_dir=input_dir,
            output_dir=output_dir,
            music_category=music_cat,
            upload_to_cloudinary=True  # Enable Cloudinary upload
        )
        
        # Check if Cloudinary upload succeeded
        if "cloudinary_url" not in result:
            # Cloudinary upload failed, but video was generated locally
            logger.warning("Cloudinary upload failed, returning local path")
            return {
                "success": True,
                "local_path": result.get("local_path"),
                "cloudinary_error": result.get("cloudinary_error"),
                "duration": result.get("duration"),
                "resolution": result.get("resolution"),
                "message": "Video generated but Cloudinary upload failed. Check environment variables."
            }
        
        # Success! Return Cloudinary URL
        logger.info(f"Video uploaded successfully: {result['cloudinary_url']}")
        
        return {
            "success": True,
            "video_url": result["cloudinary_url"],
            "cloudinary_public_id": result["cloudinary_public_id"],
            "duration": result.get("duration"),
            "resolution": result.get("resolution"),
            "clips_count": result.get("clips_count"),
            "message": "Video generated and uploaded to Cloudinary CDN"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating vlog: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate vlog: {str(e)}")
    
    finally:
        # Cleanup temporary directory
        if temp_dir and temp_dir.exists():
            try:
                shutil.rmtree(temp_dir)
                logger.info(f"Cleaned up temp directory: {temp_dir}")
            except Exception as e:
                logger.warning(f"Failed to cleanup temp directory: {e}")


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


@router.get("/cloudinary/usage")
async def get_cloudinary_usage():
    """
    Get Cloudinary account usage statistics
    
    Returns storage, bandwidth, and transformation usage
    """
    try:
        stats = CloudinaryService.get_usage_stats()
        
        if not stats.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get Cloudinary usage: {stats.get('error')}"
            )
        
        return stats
    
    except Exception as e:
        logger.error(f"Error getting Cloudinary usage: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve usage stats: {str(e)}"
        )


@router.get("/cloudinary/videos")
async def list_cloudinary_videos(folder: str = "auto_vlogs", max_results: int = 10):
    """
    List videos stored in Cloudinary
    
    Args:
        folder: Cloudinary folder to list (default: auto_vlogs)
        max_results: Maximum number of videos to return (default: 10)
    
    Returns:
        List of videos with URLs and metadata
    """
    try:
        result = CloudinaryService.list_videos(folder=folder, max_results=max_results)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list videos: {result.get('error')}"
            )
        
        return {
            "folder": folder,
            "count": len(result.get("videos", [])),
            "videos": result.get("videos", [])
        }
    
    except Exception as e:
        logger.error(f"Error listing Cloudinary videos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list videos: {str(e)}"
        )
