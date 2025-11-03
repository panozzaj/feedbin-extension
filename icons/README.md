# Extension Icons

## Current Status

The icon files (icon-16.png, icon-48.png, icon-128.png) are currently **placeholders**.

## To Create Proper Icons

### Option 1: Use the SVG (icon.svg)

Convert the SVG to PNG at different sizes using a tool like ImageMagick or an online converter:

```bash
# Using ImageMagick (if installed)
convert -background none -resize 16x16 icon.svg icon-16.png
convert -background none -resize 48x48 icon.svg icon-48.png
convert -background none -resize 128x128 icon.svg icon-128.png
```

### Option 2: Design Custom Icons

Create PNG files at these sizes:
- **icon-16.png**: 16x16 pixels (toolbar icon)
- **icon-48.png**: 48x48 pixels (extensions page)
- **icon-128.png**: 128x128 pixels (Chrome Web Store)

**Design Guidelines**:
- Simple, recognizable shape
- Good contrast for both light and dark backgrounds
- Avoid text (too small at 16x16)
- Use the ⚡ lightning bolt theme
- Colors: Blue (#3b82f6) with white accent

### Option 3: Use a Design Tool

Online tools:
- [Figma](https://figma.com) - Free design tool
- [Canva](https://canva.com) - Simple icon maker
- [Favicon.io](https://favicon.io) - Generate from emoji

## Testing

After creating icons:

1. Reload extension in Chrome
2. Check toolbar icon (should be 16x16)
3. Check `chrome://extensions/` page (should be 48x48)
4. Verify clarity and visibility

## Note

The extension works fine with placeholder icons. Proper icons are only needed for:
- Better visual identification
- Chrome Web Store publishing
- Professional appearance

For development and personal use, placeholders are sufficient.
