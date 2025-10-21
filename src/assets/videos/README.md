# Video Assets for Onboarding

## Adding the Snap Groceries Demo Video

To add your video to the onboarding flow:

1. **Add your video file** to this folder with the name: `snap-groceries-demo.mp4`

2. **Video Requirements:**
   - Format: MP4 (for best browser compatibility)
   - Recommended dimensions: Square format (e.g., 400x400, 600x600)
   - File size: Keep under 5MB for fast loading
   - Duration: 5-10 seconds (since it loops)

3. **Alternative formats** (if needed):
   - You can also add `.webm` format for better compression
   - Add multiple sources in the video element for fallback

## Video Configuration in FeatureTourScreen.js

The video is configured with the following attributes:
- `autoPlay` - Starts playing automatically
- `loop` - Loops continuously
- `muted` - Required for autoplay to work in most browsers
- `playsInline` - Prevents fullscreen on mobile devices

## Using a Different Video File

If your video has a different name:

1. Update the import statement in `FeatureTourScreen.js`:
```javascript
import snapGroceriesVideo from '../../../../assets/videos/your-video-name.mp4';
```

2. Update the video source:
```javascript
<source src={snapGroceriesVideo} type="video/mp4" />
```

## Troubleshooting

If the video doesn't show:
1. Check that the video file exists in this folder
2. Check browser console for any loading errors
3. Ensure the video format is supported (MP4 with H.264 codec is most compatible)
4. The fallback icon will show if the video fails to load