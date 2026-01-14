# Changelog GIF Optimization

## Problem
The changelog page was loading very slowly on Netlify due to large GIF files:
- ApplyRules.gif: 18 MB
- CompositeRules.gif: 44 MB
- UploadFile.gif: 52 MB
- **Total: 114 MB**

## Solution
Converted GIFs to optimized MP4 videos using H.264 encoding.

## Results
- ApplyRules.mp4: 1.9 MB (9x smaller)
- CompositeRules.mp4: 4.4 MB (10x smaller)
- UploadFile.mp4: 4.5 MB (11x smaller)
- **Total: 10.8 MB (10.5x reduction!)**

## Changes Made

### 1. Created Conversion Script (`convert-gifs.sh`)
- Automatically converts all GIFs in `assets/changelog/` to MP4
- Uses ffmpeg with optimized H.264 settings
- Shows compression ratios and file sizes

### 2. Updated `changelog.html`
- Replaced `<img>` tags with `<video>` tags for GIF content
- Added autoplay, loop, muted, and playsinline attributes
- Implemented lazy loading
- Added video playback control (only plays visible carousel slide)
- Maintains fallback support for PNG images

### 3. Performance Optimizations
- Videos only play when visible in carousel
- Inactive videos are paused to save bandwidth
- Added `loading="lazy"` attribute for better initial page load

## Usage

To convert new GIFs in the future:
```bash
./convert-gifs.sh
```

The script will automatically:
1. Find all .gif files in assets/changelog/
2. Convert them to .mp4 format
3. Show compression statistics

## Browser Compatibility
MP4 with H.264 codec is supported by all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Additional Notes
- Original GIF files are kept in the repository for reference
- Consider using Git LFS for large media files (`.gitattributes` configured)
- Videos maintain the same visual quality as GIFs
