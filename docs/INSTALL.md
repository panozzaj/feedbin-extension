# Installation Instructions

## Quick Fix for "Failed to fetch"

The extension works, but Chrome's permissions system is finicky. Here's the fix:

### Step 1: Remove Old Extension

1. Go to `chrome://extensions/`
2. Find "Feedbin Power Tools"
3. Click **Remove**

### Step 2: Reinstall

1. Still on `chrome://extensions/`
2. Make sure "Developer mode" is ON (toggle in top right)
3. Click "Load unpacked"
4. Select: `/Users/anthony/Documents/dev/feedbin-extension`

### Step 3: Verify Permissions

1. Click "Details" under the extension
2. Scroll to "Site access"
3. Should say: "On specific sites"
4. Expand it - should list:
   - feedbin.com
   - api.feedbin.com

### Step 4: Save Credentials

1. Click extension icon (⚡)
2. Enter Feedbin email and password
3. Click "Connect to Feedbin"

**Expected result**:

- ✓ "Credentials saved!" (even if verification fails)
- Shows your email address
- You can now use the extension on feedbin.com

### Step 5: Test on Feedbin

1. Go to https://feedbin.com/unread
2. Look for "⚡ Power Tools" toolbar at top
3. Click "🤖 Classify Visible"
4. Should start classifying entries

## If It Still Fails

The popup might have CORS issues. The extension will still work on feedbin.com itself:

1. Just save your credentials (they're stored locally)
2. Go to feedbin.com/unread
3. The content script will use your saved credentials
4. Classification will work there

## Manual Test

To verify your credentials are correct:

1. Open https://api.feedbin.com/v2/subscriptions in a new tab
2. When prompted, enter your Feedbin email and password
3. If you see JSON data → credentials are good!
4. If you see "Access denied" → wrong credentials
