# Media Upload Feature

## Overview
Extension officers can upload images, videos, and audio files to their advice articles. Farmers can view and download these media files.

---

## Quick Start

### 1. Run Database Migration
```bash
cd backend
node scripts/add-media-support.js
```

### 2. Restart Backend
```bash
npm start
```

### 3. Start Using
- Extension officers can now upload media when creating/editing advice
- Farmers can view and download media from advice articles

---

## Features

### For Extension Officers
- ✅ Upload images (JPG, PNG, GIF)
- ✅ Upload videos (MP4, AVI, MOV)
- ✅ Upload audio files (MP3, WAV, OGG)
- ✅ Maximum file size: 100MB
- ✅ Preview media before publishing
- ✅ Edit articles and replace media
- ✅ Remove media from articles
- ✅ Media files automatically deleted when articles are deleted

### For Farmers
- ✅ View images inline
- ✅ Play videos with browser controls
- ✅ Play audio with browser controls
- ✅ Download any media file
- ✅ Filter articles by category
- ✅ See media type badges on articles

---

## Usage

### Extension Officer Workflow
1. Navigate to "Manage Advice" page
2. Click "New Article"
3. Fill in title, category, and content
4. Click "Choose File" under Media section
5. Select an image, video, or audio file
6. Preview appears automatically
7. Click "Publish" to create the article

### Farmer Workflow
1. Navigate to "Farming Advice" page
2. Browse articles or filter by category
3. View media inline (images, videos, audio players)
4. Click "Download" button to save media to device

---

## Technical Details

### Database Changes
New columns added to `advice_articles` table:
- `media_type` VARCHAR(20) - Values: 'none', 'image', 'video', 'audio'
- `media_url` VARCHAR(500) - Path to the uploaded file

### File Storage
- **Location**: `backend/uploads/media/`
- **Naming**: Unique names using timestamp + random number
- **Example**: `media-1234567890-123456789.jpg`

### API Endpoints

#### Create Article with Media
```
POST /api/extension/advice
Content-Type: multipart/form-data

Fields:
- title (required)
- content (required)
- category (optional)
- media (optional file)
```

#### Update Article with Media
```
PATCH /api/extension/advice/:id
Content-Type: multipart/form-data

Fields:
- title
- content
- category
- media (optional file)
- removeMedia (boolean, set to 'true' to remove existing media)
```

#### Delete Article
```
DELETE /api/extension/advice/:id
```
Note: This will also delete the associated media file from the server.

---

## Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### Videos
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)

### Audio
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)

---

## Security

- ✅ File type validation (only images, videos, and audio allowed)
- ✅ File size limit (100MB maximum)
- ✅ Files stored with unique names to prevent conflicts
- ✅ Only extension officers can upload media
- ✅ Only the article author can delete their media
- ✅ Authentication required for all operations

---

## Files Modified

### Backend
1. **backend/routes/extension.js**
   - Added multer configuration for file uploads
   - Updated POST /api/extension/advice to handle media uploads
   - Updated PATCH /api/extension/advice/:id to handle media updates
   - Updated DELETE /api/extension/advice/:id to delete media files
   - Added file type validation and size limits

### Frontend
2. **frontend/src/pages/extension/ManageAdvice.jsx**
   - Added file input for media uploads
   - Added media preview functionality (images, videos, audio)
   - Added remove media button
   - Updated form submission to use FormData
   - Added media type badges to article list

3. **frontend/src/pages/FarmerAdvice.jsx**
   - Added media rendering for images, videos, and audio
   - Added download buttons for all media types
   - Added media type badges to articles
   - Improved styling and layout

---

## Troubleshooting

### Upload Fails
- Check file size (must be under 100MB)
- Verify file type is supported
- Ensure `uploads/media/` directory has write permissions

### Media Not Displaying
- Verify the file was uploaded successfully
- Check browser console for errors
- Ensure the backend server is serving static files from `/api/uploads`

### Database Migration Issues
- Ensure PostgreSQL is running
- Check database connection in `.env` file
- Run migration script with proper permissions

---

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Upload an image to an article
- [ ] Upload a video to an article
- [ ] Upload an audio file to an article
- [ ] Preview media before publishing
- [ ] Edit article and replace media
- [ ] Remove media from article
- [ ] Delete article (verify media file is deleted)
- [ ] View article as farmer
- [ ] Download media as farmer
- [ ] Test file size limit (try uploading >100MB)
- [ ] Test invalid file types

---

## Notes

- Multer package was already installed in package.json
- Backend already serves static files from /api/uploads
- No changes needed to server.js
- No changes needed to database.js
- Feature is backward compatible (existing articles without media work fine)

