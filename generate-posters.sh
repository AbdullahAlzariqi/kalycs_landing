#!/bin/bash

# Generate poster images (thumbnails) from videos
# Creates lightweight JPG thumbnails for lazy loading

set -e

CHANGELOG_DIR="assets/changelog"

echo "🖼️  Generating poster images from videos..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    exit 1
fi

# Generate poster for each MP4
for video in "$CHANGELOG_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        filename=$(basename "$video" .mp4)
        poster="$CHANGELOG_DIR/${filename}-poster.jpg"
        
        echo "📸 Creating poster: $filename-poster.jpg"
        
        # Extract first frame as JPG with good compression
        ffmpeg -i "$video" \
            -vframes 1 \
            -vf "scale=iw:ih" \
            -q:v 5 \
            "$poster" \
            -y -loglevel error
        
        # Show size
        poster_size=$(du -h "$poster" | cut -f1)
        echo "   ✅ Size: $poster_size"
        echo ""
    fi
done

echo "✨ Poster generation complete!"
echo ""
echo "📊 Poster images:"
ls -lh "$CHANGELOG_DIR"/*-poster.jpg 2>/dev/null || echo "No posters found"
