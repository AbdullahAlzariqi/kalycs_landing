#!/bin/bash

# GIF to Video Converter (Simplified)
# Converts large GIFs to optimized MP4 videos
# Usage: ./convert-gifs.sh

set -e

CHANGELOG_DIR="assets/changelog"

echo "🎬 Converting GIFs to optimized MP4 videos..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install it with: brew install ffmpeg"
    exit 1
fi

# Convert each GIF
for gif in "$CHANGELOG_DIR"/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif" .gif)
        echo "📹 Converting: $filename.gif"
        
        # Get original size
        original_size=$(du -h "$gif" | cut -f1)
        echo "   Original size: $original_size"
        
        # Convert to MP4 (universal compatibility)
        echo "   → Creating MP4..."
        ffmpeg -i "$gif" \
            -c:v libx264 \
            -pix_fmt yuv420p \
            -crf 23 \
            -preset medium \
            -movflags +faststart \
            -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
            -an \
            "$CHANGELOG_DIR/${filename}.mp4" \
            -y -loglevel warning
        
        # Show new size
        mp4_size=$(du -h "$CHANGELOG_DIR/${filename}.mp4" | cut -f1)
        
        # Calculate compression ratio
        original_bytes=$(stat -f%z "$gif")
        mp4_bytes=$(stat -f%z "$CHANGELOG_DIR/${filename}.mp4")
        ratio=$((original_bytes / mp4_bytes))
        
        echo "   ✅ MP4: $mp4_size (${ratio}x smaller)"
        echo ""
    fi
done

echo "✨ Conversion complete!"
echo ""
echo "📊 File sizes comparison:"
ls -lh "$CHANGELOG_DIR"/ | grep -E '\.(gif|mp4)$'
