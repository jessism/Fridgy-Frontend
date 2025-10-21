# Public Video Assets

## Quick Setup for Onboarding Videos

### Required Videos:
1. **`snap-groceries-demo.mp4`** - For the "Snap Your Groceries" feature (screen content only)
2. **`ai-recipes-demo-noframe.mp4`** - For the "AI-Powered Recipe Suggestions" feature (screen content only)

### Step 1: Add Your Videos
Place both video files in this folder with the exact names above.

That's it! The videos will automatically appear in the onboarding flow.

### Video Recommendations
- **Format**: MP4 (best compatibility)
- **Size**: Under 5MB
- **Dimensions**: Square format works best (e.g., 400x400px)
- **Duration**: 5-10 seconds (it will loop)

### Why the Public Folder?
React serves files from the `public` folder directly, making it the easiest way to add static assets like videos without dealing with webpack imports.

### Testing
1. Add both video files here
2. Go to http://localhost:3000/onboarding
3. Navigate to the "Discover what Trackabite can do" screen
4. First slide: "Snap Your Groceries" video should autoplay
5. Second slide: "AI-Powered Recipe Suggestions" video should autoplay

### Troubleshooting
- If videos don't show, check browser console for 404 errors
- Ensure the filenames are exactly:
  - `snap-groceries-demo.mp4`
  - `ai-recipes-demo-noframe.mp4`
- Try refreshing the page (Ctrl/Cmd + Shift + R for hard refresh)

### Important Notes
- Both videos should contain ONLY the screen content (no iPhone frame)
- The CSS iPhone frame will be applied automatically in the code
- This ensures consistent styling across all features