"""
Cloudinary Service for Video Upload and Management
Handles video storage and delivery via Cloudinary CDN
"""
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from pathlib import Path
from typing import Optional, Dict
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
    secure=True
)


class CloudinaryService:
    """Service for managing video uploads to Cloudinary"""
    
    @staticmethod
    def upload_video(
        video_path: str,
        public_id: Optional[str] = None,
        folder: str = "auto_vlogs",
        resource_type: str = "video"
    ) -> Dict:
        """
        Upload video to Cloudinary
        
        Args:
            video_path: Path to local video file
            public_id: Optional custom public ID for the video
            folder: Cloudinary folder to store the video
            resource_type: Type of resource (default: "video")
        
        Returns:
            Dictionary with upload result including URL and metadata
        """
        try:
            upload_options = {
                "resource_type": resource_type,
                "folder": folder,
                "overwrite": True,
                "eager": [
                    {"quality": "auto", "fetch_format": "mp4"},
                ],
                "eager_async": True,
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            result = cloudinary.uploader.upload(video_path, **upload_options)
            
            return {
                "success": True,
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "duration": result.get("duration"),
                "width": result.get("width"),
                "height": result.get("height"),
                "resource_type": result.get("resource_type"),
                "created_at": result.get("created_at"),
                "bytes": result.get("bytes"),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def get_video_url(public_id: str, transformations: Optional[Dict] = None) -> str:
        """
        Get Cloudinary URL for a video with optional transformations
        
        Args:
            public_id: Public ID of the video
            transformations: Optional transformations (quality, format, etc.)
        
        Returns:
            Cloudinary URL
        """
        try:
            if transformations:
                return cloudinary.CloudinaryVideo(public_id).build_url(**transformations)
            return cloudinary.CloudinaryVideo(public_id).build_url()
        except Exception as e:
            print(f"Error building video URL: {e}")
            return ""
    
    @staticmethod
    def delete_video(public_id: str) -> Dict:
        """
        Delete video from Cloudinary
        
        Args:
            public_id: Public ID of the video to delete
        
        Returns:
            Dictionary with deletion result
        """
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type="video")
            return {
                "success": result.get("result") == "ok",
                "result": result.get("result")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def list_videos(folder: str = "auto_vlogs", max_results: int = 10) -> Dict:
        """
        List videos in a Cloudinary folder
        
        Args:
            folder: Folder to list videos from
            max_results: Maximum number of results to return
        
        Returns:
            Dictionary with list of videos
        """
        try:
            result = cloudinary.api.resources(
                type="upload",
                resource_type="video",
                prefix=folder,
                max_results=max_results
            )
            return {
                "success": True,
                "videos": result.get("resources", [])
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def get_usage_stats() -> Dict:
        """
        Get Cloudinary account usage statistics
        
        Returns:
            Dictionary with usage information (storage, bandwidth, etc.)
        """
        try:
            # Get usage stats
            result = cloudinary.api.usage()
            
            return {
                "success": True,
                "plan": result.get("plan"),
                "storage": {
                    "used_mb": round(result.get("storage", {}).get("usage", 0) / (1024 * 1024), 2),
                    "limit_mb": round(result.get("storage", {}).get("limit", 0) / (1024 * 1024), 2),
                    "used_percent": result.get("storage", {}).get("used_percent", 0)
                },
                "bandwidth": {
                    "used_mb": round(result.get("bandwidth", {}).get("usage", 0) / (1024 * 1024), 2),
                    "limit_mb": round(result.get("bandwidth", {}).get("limit", 0) / (1024 * 1024), 2),
                    "used_percent": result.get("bandwidth", {}).get("used_percent", 0)
                },
                "transformations": {
                    "used": result.get("transformations", {}).get("usage", 0),
                    "limit": result.get("transformations", {}).get("limit", 0),
                    "used_percent": result.get("transformations", {}).get("used_percent", 0)
                },
                "resources": result.get("resources", 0),
                "last_updated": result.get("last_updated")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
