# Media Upload Feature - Setup Checklist

## Step-by-Step Setup Instructions

### 1. Database Migration
Run this command to add media columns to the database:

```bash
cd backend
node scripts/add-media-support.js
```

Expected output:
```
Adding media support to advice_articles table...
✓ Media columns added successfully
✓ Database migration completed
```

### 2. Restart Backend Server
If your backend is running, restart it:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
npm run dev
```

### 3. Test the Feature

#### As Extension Officer:
1. Login as extension officer
2. Go to "Manage Advice" page
3. Click "New Article"
4. Fill in the form:
   - Title: "Test Article with Image"
   - Category: "Test"
   - Content: "This is a test article"
   - Upload an image file
5. You should see a preview of the image
6. Click "Publish"
7. Verify the article appears in the list with an image badge

#### As Farmer:
1. Login as farmer
2. Go to "Farming Advice" page
3. Find the test article
4. Verify you can see the image
5. Click "Download Image" button
6. Verify the image downloads

### 4. Test All Media Types

Test with:
- ✅ Image (JPG, PNG, GIF)
- ✅ Video (MP4)
- ✅ Audio (MP3)

### 5. Test Edit Functionality
1. Edit an existing article
2. Upload new media (should replace old media)
3. Click "Remove Media" button (should remove media)
4. Save changes

### 6. Test Delete Functionality
1. Delete an article with media
2. Verify the media file is deleted from `backend/uploads/media/`

## Verification

After setup, verify these files exist:

Backend:
- ✅ `backend/config/add-media-columns.sql`
- ✅ `backend/scripts/add-media-support.js`
- ✅ `backend/routes/extension.js` (modified)
- ✅ `backend/uploads/media/` (created automatically on first upload)

Frontend:
- ✅ `frontend/src/pages/extension/ManageAdvice.jsx` (modified)
- ✅ `frontend/src/pages/FarmerAdvice.jsx` (modified)

Documentation:
- ✅ `MEDIA_UPLOAD_GUIDE.md`
- ✅ `MEDIA_FEATURE_SUMMARY.md`
- ✅ `SETUP_CHECKLIST.md` (this file)

## Troubleshooting

### Migration fails
- Check if PostgreSQL is running
- Verify database connection in `.env`
- Check if columns already exist: `\d advice_articles` in psql

### Upload fails
- Check file size (must be < 100MB)
- Verify file type is supported
- Check browser console for errors

### Media not displaying
- Check if file was uploaded to `backend/uploads/media/`
- Verify backend is serving static files from `/api/uploads`
- Check browser network tab for 404 errors

### Download not working
- Check if media_url is correct in database
- Verify file exists in uploads directory
- Check browser console for errors

## Success Criteria

✅ Database migration completed without errors
✅ Can upload images to articles
✅ Can upload videos to articles
✅ Can upload audio to articles
✅ Media previews work in extension officer interface
✅ Media displays correctly in farmer interface
✅ Download buttons work for all media types
✅ Can edit articles and replace media
✅ Can remove media from articles
✅ Deleting articles also deletes media files
✅ File size limit (100MB) is enforced
✅ Invalid file types are rejected

## Next Steps

After successful setup:
1. Test with real content
2. Monitor upload directory size
3. Consider adding image compression for large files
4. Consider adding video transcoding for better compatibility
5. Add analytics to track media engagement

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `MEDIA_UPLOAD_GUIDE.md` for detailed documentation
3. Check backend logs for error messages
4. Verify all files were updated correctly
