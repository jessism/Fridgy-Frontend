# Public Video Assets

## Quick Setup for Snap Groceries Demo Video

### Step 1: Add Your Video
Place your video file in this folder with the name: **`snap-groceries-demo.mp4`**

That's it! The video will automatically appear in the onboarding flow.

### Video Recommendations
- **Format**: MP4 (best compatibility)
- **Size**: Under 5MB
- **Dimensions**: Square format works best (e.g., 400x400px)
- **Duration**: 5-10 seconds (it will loop)

### Why the Public Folder?
React serves files from the `public` folder directly, making it the easiest way to add static assets like videos without dealing with webpack imports.

### Testing
1. Add your video file here
2. Go to http://localhost:3000/onboarding
3. Navigate to the "Discover what Trackabite can do" screen
4. Your video should autoplay in the first feature slide

### Troubleshooting
- If video doesn't show, check browser console for 404 errors
- Ensure the filename is exactly: `snap-groceries-demo.mp4`
- Try refreshing the page (Ctrl/Cmd + Shift + R for hard refresh)