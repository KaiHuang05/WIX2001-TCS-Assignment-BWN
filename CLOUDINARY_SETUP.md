# Cloudinary Setup for Video Storage

## Why Cloudinary?

Render's free tier has:
- Limited CPU for video processing
- Ephemeral storage (files deleted on restart)
- Memory constraints

Cloudinary solves this by:
- Storing videos on CDN (fast global delivery)
- Free tier: 25 GB storage, 25 GB bandwidth/month
- No local storage needed
- Automatic video optimization

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up for free account
3. Verify your email

### 2. Get API Credentials

1. Log in to Cloudinary Dashboard
2. Go to Dashboard > Settings > API Keys
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

### 3. Add Environment Variables

Add to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Add to Render Environment Variables

In Render Dashboard:
1. Go to your service
2. Click "Environment" tab
3. Add the same three variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## How It Works

1. **Video Generation**: Video is created locally (in `/tmp` on Render)
2. **Automatic Upload**: Video is uploaded to Cloudinary CDN
3. **URL Response**: Client receives Cloudinary URL
4. **Local Cleanup**: Temp file is deleted to save space
5. **Client Playback**: Video streams from Cloudinary CDN

## API Changes

### Before (Local Storage)
```json
{
  "job_id": "abc-123",
  "status": "completed",
  "video_path": "/tmp/video.mp4"
}
```

### After (Cloudinary)
```json
{
  "job_id": "abc-123",
  "status": "completed",
  "video_url": "https://res.cloudinary.com/your-cloud/video/upload/auto_vlogs/video.mp4",
  "cloudinary_public_id": "auto_vlogs/video"
}
```

## Benefits

✅ **No Storage Limits**: Videos stored on Cloudinary, not Render
✅ **Fast Delivery**: Global CDN for fast video playback
✅ **Persistent**: Videos survive Render restarts
✅ **Optimized**: Automatic compression and format conversion
✅ **Free Tier**: 25 GB/month is plenty for testing

## Alternative Options

If you prefer not to use Cloudinary, other options:

1. **AWS S3** - More storage, requires AWS account
2. **Backblaze B2** - Cheaper than S3, simple API
3. **Supabase Storage** - Free 1GB, integrates with PostgreSQL
4. **Vercel Blob** - Serverless storage, integrates with Next.js

All follow similar pattern:
- Generate video locally
- Upload to cloud storage
- Return public URL
- Delete local temp file
