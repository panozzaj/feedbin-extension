# Feedbin Extension Codebase Exploration Summary

## Overview

The Feedbin Power Tools extension is a **Chrome extension** that enhances Feedbin with intelligent **entry-level classification and filtering**. It works entirely client-side without requiring any modifications to Feedbin's servers.

**Current Status**: Entry-level classification is already implemented (see "Current Features" below)

---

## Key Architecture Components

### 1. **Content Script** (`content-script.js` - 833 lines)

**What it does**: Runs on feedbin.com pages and provides the UI for filtering

**Key Responsibilities**:

- Injects filter toolbar into Feedbin's sidebar
- Monitors DOM for new entries (MutationObserver)
- Applies/removes CSS display filtering based on tags
- Shows classification buttons on untagged entries
- Displays tag pills and delete buttons on tagged entries
- Auto-classifies visible entries if enabled

**Key Methods**:

- `init()` - Initialize and wait for Feedbin to load
- `injectFilterUI()` - Add toolbar to sidebar
- `applyFilters()` - Show/hide entries based on active filters
- `classifyEntry(entryId)` - Classify single entry via LLM
- `queueVisibleEntriesForClassification()` - Batch classify visible entries
- `processClassificationQueue()` - Process up to 5 concurrent classifications

**How Posts Are Fetched**:

1. DOM extracts basic data: title, summary from `.entry-summary` elements
2. For full content: Calls Feedbin API `/v2/entries/{id}.json` via background script
3. Gets feed ID from entry data, looks up feed-level tags for context
4. Sends to LLM for classification

**Storage Used**:

- `entryTags` - Maps entry ID to tags and reasons
- `activeFilters` - Current include/exclude tag filters
- `settings` - LLM provider configuration

### 2. **Popup UI** (`popup.html` + `popup.js` - 413 lines)

**What it does**: Management interface for settings, credentials, and tag management

**Current Features**:

- Feedbin credential authentication
- LLM provider selection (Local/Claude/OpenAI)
- LLM configuration (API keys, URLs, models)
- Custom tag creation
- Tag management and statistics
- Display of all discovered tags

**Key Methods**:

- `authenticate()` - Save Feedbin credentials
- `saveSettings()` - Save LLM provider settings
- `addCustomTag()` - Create new tag
- `renderAllTags()` - Show all discovered tags
- `renderStats()` - Show classification statistics

### 3. **LLM Integration** (`llm.js` - 657 lines)

**What it does**: Unified interface for multiple LLM providers

**Supported Providers**:

- **Local (Ollama)**: `http://localhost:11434/api/generate`
- **Claude**: `https://api.anthropic.com/v1/messages`
- **OpenAI**: `https://api.openai.com/v1/chat/completions`

**Entry Classification Process**:

1. `classifyEntry(entryData, existingTags, settings, feedTags)` - Routes to appropriate provider
2. `buildEntryPrompt()` - Creates detailed classification prompt with:
   - Entry title, feed name, author
   - Up to 2000 chars of article content/summary
   - Feed-level tags for context
   - List of existing tags (constrains to those if available)
3. `parseTags()` - Extracts JSON array format: `[{"tag": "tech", "reason": "About AI research"}]`

**Key Features**:

- HTML stripping and entity decoding
- Temperature: 0.3 (deterministic)
- Max tokens: 200 (for Ollama), 100 (for cloud APIs)
- Fallback parsing for multiple response formats
- Tag validation against existing tags list
- Comprehensive logging for debugging

### 4. **Background Worker** (`background.js` - 128 lines)

**What it does**: Service worker for background operations

**Responsibilities**:

- Handles inter-component messages
- Proxies Feedbin API calls (avoids CORS issues)
- Routes classification requests to LLM
- Updates extension badge with filter count

**Message Handlers**:

- `fetchFeedData` - Proxy API requests with credentials
- `classifyEntry` - Run LLM classification
- `openPopup` - Open extension popup

**Badge Updates**:

- Shows count of active filters (include + exclude)
- Blue badge (#3b82f6) when filters active

### 5. **Storage Layer** (`storage.js` - 210 lines)

**What it does**: Abstraction over Chrome Storage API

**Schema**:

```javascript
{
  // Entry ID → Tag mappings (MAIN DATA FOR YOUR FEATURES)
  entryTags: {
    "12345": {
      tags: ["tech", "ai"],
      tagReasons: {"tech": "About AI technology", "ai": "Mentions artificial intelligence"},
      updatedAt: 1699999999999
    }
  },

  // Feed ID → Tag mappings (context for classification)
  feedTags: {
    "67890": {
      tags: ["politics", "news"],
      updatedAt: 1699999999999
    }
  },

  // Currently active filters
  activeFilters: {
    includeTags: ["tech"],     // Show only these
    excludeTags: ["politics"]  // Hide these
  },

  // LLM settings
  settings: {
    llmProvider: "local",      // "local", "claude", "openai"
    localLlmUrl: "http://localhost:11434",
    localLlmModel: "gemma3:4b",
    claudeApiKey: "",
    openaiApiKey: "",
    autoClassify: false
  },

  // Feedbin credentials
  credentials: {
    email: "user@example.com",
    password: "password"
  },

  // User-created predefined tags
  predefinedTags: ["tech", "politics", "personal"]
}
```

**Key Methods**:

- `getEntryTags()` / `setEntryTags()` - Entry tag management
- `getFeedTags()` / `setFeedTags()` - Feed tag management
- `getAllTags()` - Combines all tag sources
- `pruneOldEntryTags(readEntryIds)` - Cleanup old read entries
- `getActiveFilters()` / `setActiveFilters()` - Filter state

---

## Current Features Implemented

### ✅ Entry-Level Classification

- Individual articles are classified with 1-3 tags
- Tags stored with individual reasons/explanations
- Full article content fetched for better classification
- Feed-level tags used as context for classification

### ✅ Smart Filtering

- **Include filters**: Show only entries with specific tags
- **Exclude filters**: Hide entries with specific tags
- Real-time filtering via CSS (display: none)
- Filter state persists across sessions
- Badge shows active filter count

### ✅ LLM Integration

- Local Ollama support (private, free, unlimited)
- Claude API support (costs per request)
- OpenAI support (costs per request)
- Batch classification (5 concurrent, 100ms delays)
- Automatic feed context usage

### ✅ Tag Management

- Custom tag creation
- Per-entry tag display with delete buttons
- Individual reason/explanation per tag
- Statistics on tag usage

---

## How Posts Are Marked as Read

**IMPORTANT**: The extension does NOT currently mark posts as read automatically.

**Current Behavior**:

- User manually marks entries as read in Feedbin UI (e.g., clicking/swiping)
- Extension only filters visibility with CSS (doesn't touch read status)
- Read status is managed entirely by Feedbin's API

**To Implement "Mark as Read"**:
Would need to:

1. Call Feedbin API endpoint: `PATCH /v2/entries/{id}.json` with `"read": true`
2. Add credentials check and API call wrapper
3. Trigger after marking duplicate or after auto-classification
4. Update read count badges

---

## Where the "Classify" Button Lives

### Location 1: Sidebar Toolbar (In Content Script)

- **File**: `content-script.js` lines 121-123
- **HTML**: Button with id `classify-visible-btn`
- **Label**: "🤖 Classify"
- **Action**: `queueVisibleEntriesForClassification()` → Classifies all visible untagged entries
- **Visible to user**: In the "⚡ Power Tools" toolbar injected above the feed list

### Location 2: Per-Entry Classify Button

- **File**: `content-script.js` lines 371-385
- **Triggered by**: `addTagIndicator()` when entry has no tags
- **Label**: "🤖 Classify"
- **Action**: `classifySingleEntry(entryId)` → Classifies single entry
- **Visible to user**: On each untagged entry in the post preview

### Classification Flow

```
User clicks "🤖 Classify" button
  ↓
queueVisibleEntriesForClassification() adds entries to queue
  ↓
processClassificationQueue() processes in batches of 5 concurrent
  ↓
classifyEntry(entryId) fetches full content from API
  ↓
LLM.classifyEntry() calls appropriate provider (Ollama/Claude/OpenAI)
  ↓
Parse response and validate tags
  ↓
Storage.setEntryTags() saves to Chrome storage
  ↓
applyFilters() and renderFilterPills() update UI
```

---

## Duplicate Detection - Currently NOT Implemented

**What Would Need to Be Built**:

### 1. Duplicate Detection Logic

```javascript
// Detect duplicates by:
// - Same title (exact or fuzzy match)
// - Within 1 hour publish time window
// - From different feeds

async function findDuplicates(entryId) {
  const entry = await getEntryData(entryId)
  const allEntries = await Storage.getEntryTags() // Has timestamps

  return Object.entries(allEntries).filter(([otherEntryId, data]) => {
    if (otherEntryId === entryId) return false

    const isSameTitle = fuzzyMatchTitle(entry.title, otherEntry.title)
    const isWithinHour = Math.abs(entry.published - otherEntry.published) < 3600000
    const isDifferentFeed = entry.feed_id !== otherEntry.feed_id

    return isSameTitle && isWithinHour && isDifferentFeed
  })
}
```

### 2. Mark Duplicate as Read

```javascript
// Mark one as read and tag both
async function handleDuplicate(primaryId, duplicateIds) {
  // Mark duplicates as read
  duplicateIds.forEach(id => {
    await markAsRead(id); // Would need to implement with Feedbin API
  });

  // Tag both as duplicates
  await Storage.setEntryTags(primaryId, ["duplicate"]);
  duplicateIds.forEach(id => {
    await Storage.setEntryTags(id, ["duplicate"]);
  });
}
```

### 3. Integration Points

- Content script: Add to `observeEntries()` to detect new entries
- Background: Call Feedbin API to mark as read
- Storage: Extend to track publish dates

---

## Automatic Classification

**Currently Partially Implemented**:

### ✅ What Works

- `settings.autoClassify` flag exists (defaults to false)
- If enabled, new entries are queued for classification
- Batch processing works (5 concurrent, 100ms delays)

### ❌ What's Missing

- **No background job**: Only works when page is open
- **UI toggle**: No way to enable/disable from popup
- **Scheduling**: No periodic checking for unclassified entries

### To Enable Auto-Classification

1. Add toggle in `popup.html` to set `settings.autoClassify = true`
2. In `content-script.js` line 41-43, auto-classification is already queued for new entries
3. Process continues in background while user browses

---

## File Structure

```
/Users/anthony/Documents/dev/feedbin-extension/
├── manifest.json                          # Extension configuration
├── README.md                              # User documentation
│
├── docs/
│   ├── ARCHITECTURE.md                    # Detailed technical docs
│   ├── SUMMARY.md                         # Feature overview
│   ├── CLASSIFICATION_IMPROVEMENTS.md     # Recent improvements
│   ├── QUICKSTART.md                      # Setup guide
│   └── INSTALL.md
│
├── src/
│   ├── content-script.js                  # Feedbin page enhancement (833 lines)
│   ├── popup.html                         # Settings UI (113 lines)
│   ├── popup.js                           # Settings logic (413 lines)
│   ├── background.js                      # Service worker (128 lines)
│   ├── storage.js                         # Chrome storage wrapper (210 lines)
│   ├── llm.js                             # LLM integration (657 lines)
│   └── styles.css                         # Styling
│
└── icons/                                 # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

**Total Code**: ~2,200 lines of JavaScript

---

## Feedbin API Endpoints Used

```javascript
// Fetch entry full content
GET /v2/entries/{id}.json
Response: {
  id, title, summary, content, author, feed_id, published_at, ...
}

// Mark entry as read (NOT YET USED)
PATCH /v2/entries/{id}.json
Body: { "read": true }

// Get feed subscriptions (for reference in popup)
GET /v2/subscriptions
Response: [{ id, title, site_url, ... }]

// Get recent entries (for context during classification)
GET /v2/entries?per_page=100
Response: [...]
```

**Authentication**: HTTP Basic Auth with email:password

---

## Key Data Flows

### Entry Classification Flow

```
Content Script
  ↓ user clicks "Classify" button
  ↓
queue untagged entries
  ↓
for each entry:
  - Fetch full content from API via background script
  - Get entry's feed ID
  - Look up feed tags for context
  - Send to LLM.classifyEntry()
  ↓
LLM Response
  ↓
Parse tags + reasons
  ↓
Validate against existing tags
  ↓
Storage.setEntryTags()
  ↓
Update UI: show tags, update filter pills
```

### Filtering Flow

```
User clicks tag in toolbar
  ↓
toggleFilter() adds/removes from activeFilters
  ↓
Storage.setActiveFilters()
  ↓
applyFilters()
  ↓
For each entry:
  - Check shouldShowEntry(entryId)
  - If passes: display
  - If fails: display: none
  ↓
Result: Filtered view
```

### Storage Change Propagation

```
Storage changes in content script
  ↓
chrome.storage.onChanged event fires
  ↓
Background script updates badge
  ↓
Popup UI re-renders if open
```

---

## Important Notes for Implementation

### 1. EntryID Data Type

- Must be stored as **string** (not number)
- Feedbin returns numeric IDs but JavaScript has issues with large numbers
- See `Storage.setEntryTags()` line 73: `entryId = String(entryId)`

### 2. Tag Validation

- LLMs sometimes return invalid tags
- Must validate against `Storage.getAllTags()` before saving
- See `content-script.js` lines 722-749

### 3. Entry Element Selection

- Entry elements use selector `.entry-summary[data-entry-id]`
- Feed ID extracted from data attribute or class name
- Must handle dynamically loaded entries

### 4. Post Timestamps

- Entry data includes `published_at` field
- Use for duplicate detection time window calculations
- Stored in ISO 8601 format

### 5. Feed vs Entry Tags

- **Feed tags**: Applied to entire feed (context for classification)
- **Entry tags**: Applied to individual posts (for filtering)
- Both maintained separately in storage

---

## What's Missing for Your Requirements

### Duplicate Detection ❌

- No current duplicate detection
- Would need:
  - Title fuzzy matching (use string library or simple comparison)
  - Time window checking (< 1 hour)
  - Cross-feed comparison logic
  - Mark-as-read integration

### Automatic Mark as Read ❌

- No automatic marking as read
- Would need:
  - Feedbin API call: `PATCH /v2/entries/{id}.json` with `read: true`
  - Decision logic: which duplicate to keep (more body text or later publish date)
  - Call in response to duplicate detection

### Background Processing ❌

- Auto-classification only works when page is open
- Would need:
  - Service worker message from popup at intervals
  - Periodic check for unclassified entries
  - OR: Focus on making UI toggle to enable/disable

---

## Quick Reference: Key Code Locations

| Feature                    | File              | Lines        |
| -------------------------- | ----------------- | ------------ |
| Filter toolbar injection   | content-script.js | 85-154       |
| Apply filtering logic      | content-script.js | 286-318      |
| Entry classification       | content-script.js | 631-775      |
| Batch classification queue | content-script.js | 551-629      |
| Tag indicators on entries  | content-script.js | 354-422      |
| LLM routing                | llm.js            | 5-18         |
| Entry prompt building      | llm.js            | 59-144       |
| Tag parsing                | llm.js            | 502-584      |
| Storage schema             | storage.js        | entire file  |
| Settings UI                | popup.html/js     | entire files |

---

## Testing the Extension

```bash
# 1. Load in Chrome
chrome://extensions/ → Load unpacked → Select folder

# 2. Open Feedbin and check for toolbar
feedbin.com → Should see "⚡ Power Tools" in sidebar

# 3. Click "🤖 Classify Visible" to test classification

# 4. Debug via console
chrome://extensions → Find extension → "Details" → "Service worker"
```

---

## Environment

- **Working Directory**: `/Users/anthony/Documents/dev/feedbin-extension`
- **Git Repo**: Yes (main branch, clean)
- **Recent Commits**:
  - `4ba085c` Tweak models
  - `c41df27` Add documentation
  - `0b5e4db` Add basic version of post classification
