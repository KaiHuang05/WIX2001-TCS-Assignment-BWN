"""
Auto Vlog Generation API Route
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional, Dict, Any
import os
import json
import shutil
from pathlib import Path
import logging
from pydantic import BaseModel
import uuid
import time
import subprocess
import sys

# Import Cloudinary service
from app.services.cloudinary_service import CloudinaryService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory job tracker (simple dict for Render free tier)
# Format: {job_id: {"status": str, "message": str, "video_url": str, "error": str, "created_at": float}}
jobs: Dict[str, Dict[str, Any]] = {}

class AutoVlogRequest(BaseModel):
    images: List[str]  # Base64 encoded images
    music_category: Optional[str] = None  # upbeat, calm, cinematic, corporate, asian, acoustic, electronic


def start_subprocess_worker(job_id: str, images: List[str], music_category: Optional[str] = None):
    """
    Start video generation in a separate subprocess (ISOLATED from Uvicorn)
    This prevents Render from killing the web service during heavy processing
    """
    try:
        # Get path to worker script
        worker_script = Path(__file__).parent.parent.parent / "workers" / "video_worker.py"
        
        if not worker_script.exists():
            raise FileNotFoundError(f"Worker script not found: {worker_script}")
        
        # Write images to temp file (avoids "Argument list too long" error)
        # Base64 images are too large to pass as command line arguments
        tmp_dir = "/tmp" if os.path.exists("/tmp") else "."
        images_file = Path(tmp_dir) / f"job_{job_id}_images.json"
        with open(images_file, 'w') as f:
            json.dump(images, f)
        
        # Build command - pass file path instead of raw data
        cmd = [
            sys.executable,  # Use current Python interpreter
            str(worker_script),
            job_id,
            str(images_file)  # Pass file path, not the data itself
        ]
        
        if music_category:
            cmd.append(music_category)
        
        logger.info(f"Starting subprocess worker for job {job_id}")
        
        # Start subprocess (detached from parent process)
        # stdout/stderr redirected to avoid blocking
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True  # Detach from parent process group
        )
        
        logger.info(f"Subprocess started for job {job_id} with PID {process.pid}")
        
        # Don't wait for process to complete - let it run independently
        # The worker will update the job status file
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to start subprocess worker: {e}", exc_info=True)
        return False


@router.post("/auto-vlog")
async def generate_auto_vlog(request: AutoVlogRequest):
    """
    Start video generation in a separate subprocess and return job_id immediately
    
    The heavy CPU/memory work runs in an ISOLATED subprocess, not in Uvicorn.
    This prevents Render from killing the web service during processing.
    
    Args:
        images: List of base64 encoded images
        music_category: Optional music category (if not provided, AI will select)
    
    Returns:
        JSON with job_id for status tracking
    """
    try:
        # Validate input
        if not request.images or len(request.images) == 0:
            raise HTTPException(status_code=400, detail="At least one image is required")
        
        if len(request.images) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 images allowed")
        
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Initialize job in tracker
        jobs[job_id] = {
            "status": "queued",
            "message": "Job queued for processing",
            "created_at": time.time(),
            "video_url": None,  # Cloudinary URL instead of local path
            "cloudinary_public_id": None,
            "error": None
        }
        
        # Initialize job status file
        job_file = Path(f"/tmp/job_{job_id}.json") if os.path.exists("/tmp") else Path(f"job_{job_id}.json")
        with open(job_file, 'w') as f:
            json.dump(jobs[job_id], f)
        
        logger.info(f"Created job {job_id} for {len(request.images)} images")
        
        # Start subprocess worker (NON-BLOCKING, ISOLATED PROCESS!)
        # MoviePy code runs in video_worker.py - NEVER in Uvicorn
        success = start_subprocess_worker(job_id, request.images, request.music_category)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to start video generation worker")
        
        # Return immediately with job_id (subprocess runs independently)
        # POST returns in <100ms - Render sees a healthy, responsive web service
        return JSONResponse(
            status_code=202,  # Accepted
            content={
                "job_id": job_id,
                "status": "queued",
                "message": "Video generation started in background. Use /auto-vlog/status/{job_id} to check progress."
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating video generation job: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start video generation: {str(e)}")


@router.get("/auto-vlog/status/{job_id}")
async def get_job_status(job_id: str):
    """
    Check the status of a video generation job
    Reads from job status file written by the subprocess worker
    
    Returns:
        Job status: queued, processing, completed, or failed
    """
    # Check if job exists in memory
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Read current status from job file (written by subprocess)
    job_file = Path(f"/tmp/job_{job_id}.json") if os.path.exists("/tmp") else Path(f"job_{job_id}.json")
    
    if job_file.exists():
        try:
            with open(job_file, 'r') as f:
                file_data = json.load(f)
            
            # Update in-memory tracker with latest status from file
            jobs[job_id].update(file_data)
            
        except Exception as e:
            logger.warning(f"Failed to read job file for {job_id}: {e}")
    
    job = jobs[job_id]
    
    return {
        "job_id": job_id,
        "status": job["status"],
        "message": job.get("message", ""),
        "created_at": job.get("created_at"),
        "completed_at": job.get("completed_at"),
        "error": job.get("error")
    }


@router.get("/auto-vlog/result/{job_id}")
async def get_job_result(job_id: str):
    """
    Get the Cloudinary URL for the generated video if job is completed
    
    Returns:
        JSON with video URL and metadata
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Read latest status from file
    job_file = Path(f"/tmp/job_{job_id}.json") if os.path.exists("/tmp") else Path(f"job_{job_id}.json")
    
    if job_file.exists():
        try:
            with open(job_file, 'r') as f:
                file_data = json.load(f)
            jobs[job_id].update(file_data)
        except Exception as e:
            logger.warning(f"Failed to read job file for {job_id}: {e}")
    
    job = jobs[job_id]
    
    if job["status"] == "failed":
        raise HTTPException(status_code=500, detail=f"Job failed: {job.get('error', 'Unknown error')}")
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=425,  # Too Early
            detail=f"Job is still {job['status']}. Check /auto-vlog/status/{job_id} for updates."
        )
    
    video_url = job.get("video_url")
    if not video_url:
        raise HTTPException(status_code=500, detail="Video URL not found")
    
    logger.info(f"Returning video URL for job {job_id}: {video_url}")
    
    # Return video URL and metadata
    return {
        "job_id": job_id,
        "video_url": video_url,
        "cloudinary_public_id": job.get("cloudinary_public_id"),
        "completed_at": job.get("completed_at"),
        "message": "Video available on Cloudinary CDN"
    }


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
