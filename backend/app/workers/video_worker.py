"""
Video Generation Worker
Runs video generation in a separate subprocess to avoid blocking the main FastAPI server
"""
import sys
import json
import base64
import tempfile
import shutil
from pathlib import Path
import time
import traceback

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.ai_vid import auto_vlog_generator


def update_job_status(job_id: str, status: str, message: str = "", **kwargs):
    """Update job status in the status file"""
    tmp_dir = "/tmp" if Path("/tmp").exists() else "."
    job_file = Path(tmp_dir) / f"job_{job_id}.json"
    
    try:
        # Read current status
        if job_file.exists():
            with open(job_file, 'r') as f:
                job_data = json.load(f)
        else:
            job_data = {}
        
        # Update status
        job_data.update({
            "status": status,
            "message": message,
            **kwargs
        })
        
        if status == "completed":
            job_data["completed_at"] = time.time()
        
        # Write updated status
        with open(job_file, 'w') as f:
            json.dump(job_data, f)
        
        print(f"Updated job {job_id}: {status} - {message}")
    except Exception as e:
        print(f"Failed to update job status: {e}")


def main():
    """Main worker function"""
    if len(sys.argv) < 3:
        print("Usage: video_worker.py <job_id> <images_file> [music_category]")
        sys.exit(1)
    
    job_id = sys.argv[1]
    images_file = sys.argv[2]
    music_category = sys.argv[3] if len(sys.argv) > 3 else None
    
    print(f"Worker started for job {job_id}")
    print(f"Images file: {images_file}")
    print(f"Music category: {music_category}")
    
    temp_dir = None
    
    try:
        # Update status to processing
        update_job_status(job_id, "processing", "Loading images...")
        
        # Read images from file
        with open(images_file, 'r') as f:
            images_b64 = json.load(f)
        
        print(f"Loaded {len(images_b64)} images")
        
        # Create temporary directory for processing
        temp_dir = Path(tempfile.mkdtemp(prefix=f"autovlog_{job_id}_"))
        input_dir = temp_dir / "input"
        output_dir = temp_dir / "output"
        input_dir.mkdir()
        output_dir.mkdir()
        
        update_job_status(job_id, "processing", f"Decoding {len(images_b64)} images...")
        
        # Decode and save images
        for i, img_b64 in enumerate(images_b64):
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
                
                print(f"Saved image {i+1}/{len(images_b64)}")
                
            except Exception as e:
                print(f"Failed to decode image {i}: {e}")
                raise
        
        # Update status
        update_job_status(job_id, "processing", "Generating video with AI effects...")
        
        # Determine music category
        music_cat = None if music_category == "auto" else music_category
        
        # Generate vlog with Cloudinary upload
        print(f"Generating vlog (music: {music_category or 'auto'})...")
        result = auto_vlog_generator.generate_vlog(
            input_dir=input_dir,
            output_dir=output_dir,
            music_category=music_cat,
            upload_to_cloudinary=True
        )
        
        print(f"Video generation complete: {result}")
        
        # Check if Cloudinary upload succeeded
        if "cloudinary_url" in result:
            # Success! Update job with Cloudinary URL
            update_job_status(
                job_id,
                "completed",
                "Video generated and uploaded to Cloudinary CDN",
                video_url=result["cloudinary_url"],
                cloudinary_public_id=result.get("cloudinary_public_id"),
                duration=result.get("duration"),
                resolution=result.get("resolution"),
                clips_count=result.get("clips_count")
            )
            print(f"✓ Video uploaded to Cloudinary: {result['cloudinary_url']}")
        else:
            # Cloudinary upload failed, return local path
            update_job_status(
                job_id,
                "completed",
                "Video generated but Cloudinary upload failed",
                video_path=result.get("local_path"),
                cloudinary_error=result.get("cloudinary_error"),
                duration=result.get("duration"),
                resolution=result.get("resolution"),
                error="Cloudinary upload failed"
            )
            print(f"⚠ Cloudinary upload failed: {result.get('cloudinary_error')}")
        
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"Error generating video: {error_msg}")
        print(error_trace)
        
        update_job_status(
            job_id,
            "failed",
            f"Video generation failed: {error_msg}",
            error=error_msg
        )
    
    finally:
        # Cleanup temporary directory
        if temp_dir and temp_dir.exists():
            try:
                shutil.rmtree(temp_dir)
                print(f"Cleaned up temp directory: {temp_dir}")
            except Exception as e:
                print(f"Failed to cleanup temp directory: {e}")
        
        # Cleanup images file
        try:
            Path(images_file).unlink()
            print(f"Cleaned up images file: {images_file}")
        except Exception as e:
            print(f"Failed to cleanup images file: {e}")


if __name__ == "__main__":
    main()
