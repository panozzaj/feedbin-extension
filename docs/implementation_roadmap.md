# Implementation Roadmap for Your Features

## Feature 1: Duplicate Post Detection & Marking

### Requirements

- Detect posts with same title
- Within 1 hour of each other
- Mark the one with less body text (or earlier publish date) as read

### Implementation Steps

#### Step 1: Add Duplicate Detection Function (storage.js or new file)

```javascript
// Add to Storage object
async function findDuplicates(entryId) {
  const allEntries = await this.getEntryTags(); // Already tracks updatedAt

  // Need to fetch full entry data from DOM cache or API
  const entry = ... // Get entry data

  return Object.entries(allEntries)
    .filter(([otherId, otherData]) => {
      if (otherId === entryId) return false;
      // Time window: 1 hour = 3600000 ms
      if (Math.abs(entry.publishedAt - other.publishedAt) > 3600000) return false;
      // Same title (simple exact match for now)
      if (entry.title !== other.title) return false;
      // Different feed
      if (entry.feedId === other.feedId) return false;
      return true;
    });
}
```

#### Step 2: Add Mark-as-Read Function (background.js)

```javascript
// Add handler in chrome.runtime.onMessage
case 'markAsRead':
  handleMarkAsRead(message.payload)
    .then(sendResponse)
    .catch(error => sendResponse({ success: false, error: error.message }));
  return true;

async function handleMarkAsRead(payload) {
  const { entryIds, credentials } = payload;

  const authHeader = 'Basic ' + btoa(credentials.email + ':' + credentials.password);

  try {
    // Mark each entry as read
    const promises = entryIds.map(id =>
      fetch(`https://api.feedbin.com/v2/entries/${id}.json`, {
        method: 'PATCH',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read: true })
      })
    );

    const results = await Promise.all(promises);
    return { success: true, marked: results.length };
  } catch (error) {
    throw new Error(`Failed to mark as read: ${error.message}`);
  }
}
```

#### Step 3: Add Duplicate Detection to Content Script (content-script.js)

```javascript
// In observeEntries(), after a new entry is added:
async checkForDuplicates(entryId) {
  const duplicateIds = await Storage.findDuplicates(entryId);

  if (duplicateIds.length > 0) {
    // Decide which to mark as read
    const toMarkAsRead = this.selectDuplicateToArchive(entryId, duplicateIds);

    if (toMarkAsRead) {
      await chrome.runtime.sendMessage({
        action: 'markAsRead',
        payload: { entryIds: [toMarkAsRead], credentials }
      });

      // Tag both as duplicates
      await Storage.setEntryTags(entryId, ['duplicate']);
      duplicateIds.forEach(id => {
        Storage.setEntryTags(id, ['duplicate']);
      });
    }
  }
}

selectDuplicateToArchive(primaryId, duplicateIds) {
  // Logic: mark the one with LESS body text as read
  // Or if equal: mark the one with EARLIER publish date as read

  // Get content lengths and publish dates from stored data
  // Return the ID to mark as read
}
```

#### Step 4: Add Duplicate Tagging

```javascript
// Extend predefined tags to always include "duplicate"
// When a duplicate is detected, both entries get "duplicate" tag
// User can then filter/hide duplicates if desired
```

### Key Locations

- **Detection**: `storage.js` - new `findDuplicates()` method
- **Mark as read**: `background.js` - new handler + helper function
- **Content integration**: `content-script.js` - new check in `observeEntries()`
- **Popup UI**: `popup.html/js` - optional: checkbox to enable/disable duplicate detection

### Challenges

- Entry data (title, content, published_at) must be available in storage or fetchable
- Large number of entries = slow duplicate checking (optimize by checking only recent entries)
- Fuzzy title matching needed (e.g., "Anthropic releases Claude 4" vs "Claude 4 Released by Anthropic")

---

## Feature 2: Automatic Classification

### Current Status

- **Partial implementation exists**: `settings.autoClassify` flag + queueing logic
- **Missing**: UI toggle + proper lifecycle management

### Implementation Steps

#### Step 1: Add UI Toggle (popup.html)

```html
<!-- Add to settings section -->
<div class="form-group">
  <label class="form-label" for="auto-classify-toggle">
    <input type="checkbox" id="auto-classify-toggle" />
    Auto-classify new entries while browsing
  </label>
  <div class="help-text">Automatically classify visible entries as they load</div>
</div>
```

#### Step 2: Add Event Handler (popup.js)

```javascript
// In setupEventListeners():
document.getElementById('auto-classify-toggle').addEventListener('change', async (e) => {
  const settings = await Storage.getSettings()
  settings.autoClassify = e.target.checked
  await Storage.setSettings(settings)
  this.showStatus(
    e.target.checked ? 'Auto-classification enabled' : 'Auto-classification disabled',
    'success'
  )
})

// In loadData():
document.getElementById('auto-classify-toggle').checked = this.settings.autoClassify || false
```

#### Step 3: Auto-Classification Already Works in Content Script

```javascript
// content-script.js lines 41-43 already do this:
if (this.settings.autoClassify) {
  this.queueVisibleEntriesForClassification()
}

// And in observeEntries() lines 502-511:
// Auto-classify new entries if enabled
if (this.settings.autoClassify && newEntries.length > 0) {
  newEntries.forEach((entryEl) => {
    const entryId = entryEl.dataset.entryId
    if (entryId && !this.entryTags[entryId]) {
      this.queueEntryForClassification(entryId)
    }
  })
}
```

#### Step 4: Add Status Indicator (content-script.js)

```javascript
// Show indicator when auto-classification is active
injectAutoClassifyIndicator() {
  if (!this.settings.autoClassify) return;

  const indicator = document.createElement('div');
  indicator.className = 'auto-classify-indicator';
  indicator.textContent = '🤖 Auto-classifying...';
  document.body.appendChild(indicator);
}

// Update it as queue processes
updateAutoClassifyIndicator(remaining) {
  const indicator = document.querySelector('.auto-classify-indicator');
  if (indicator) {
    if (remaining === 0) {
      indicator.style.display = 'none';
    } else {
      indicator.textContent = `🤖 Auto-classifying (${remaining} left)...`;
    }
  }
}
```

### Key Locations

- **UI**: `popup.html` - checkbox toggle
- **Logic**: `popup.js` - event handler
- **Implementation**: `content-script.js` - already mostly done, just needs UI
- **Styling**: `styles.css` - add styles for indicator

### Notes

- Auto-classification only works when page is open (limitation of MutationObserver)
- Background worker doesn't have access to page content
- Could be enhanced with periodic polling from background, but complex

---

## Implementation Priority

### High Priority (Core Features)

1. **Duplicate detection** - Most complex, highest value
2. **Auto-classification UI toggle** - Simple, already mostly implemented
3. **Mark as read for duplicates** - Moderate complexity, dependencies on #1

### Medium Priority (Polish)

4. Duplicate detection status messages
5. Fuzzy title matching for better duplicate detection
6. Batch mark-as-read optimization

### Low Priority (Future)

7. Background duplicate checking (requires service worker improvements)
8. Duplicate detection settings (time window, match threshold)

---

## Data You'll Need

### For Duplicate Detection

- Entry ID: ✓ `data-entry-id` attribute
- Entry title: ✓ `.title` element in DOM
- Entry content/summary: ✓ Fetchable via API `/v2/entries/{id}.json`
- Feed ID: ✓ In entry data from API
- Publish date: ✓ In entry data as `published_at`
- Entry body length: ✓ From API response `content` field

### For Auto-Classification

- Settings flag: ✓ Already in `Storage.settings`
- LLM configuration: ✓ Already in storage
- Entry classification queue: ✓ Already implemented

---

## Testing Strategy

### Duplicate Detection Testing

```
1. Create test entries with same title in different feeds
2. Publish within 1 hour window
3. Click "🤖 Classify Visible"
4. Check console for duplicate detection logs
5. Verify one is marked as read (check Feedbin UI)
6. Verify both tagged with "duplicate"
```

### Auto-Classification Testing

```
1. Enable "Auto-classify" in popup
2. Reload feedbin.com
3. Open new entries
4. Should see classification happen automatically
5. Check console for queueing logs
6. Verify tags appear without manual "Classify" button
```

---

## File Changes Summary

| File              | Changes                            | Lines          |
| ----------------- | ---------------------------------- | -------------- |
| storage.js        | Add `findDuplicates()`             | +20            |
| background.js     | Add `markAsRead` handler           | +30            |
| content-script.js | Add duplicate checking logic       | +50            |
| popup.html        | Add auto-classify toggle           | +5             |
| popup.js          | Add toggle event handler           | +15            |
| styles.css        | Add auto-classify indicator styles | +20            |
| **Total**         |                                    | **~140 lines** |

---

## Implementation Checklist

### Duplicate Detection

- [ ] Add `findDuplicates()` to Storage
- [ ] Add `markAsRead` message handler to background.js
- [ ] Add duplicate checking in `observeEntries()`
- [ ] Test with duplicate posts
- [ ] Add UI messages for user feedback
- [ ] Implement fuzzy title matching

### Auto-Classification

- [ ] Add checkbox to popup.html
- [ ] Add event handler to popup.js
- [ ] Test toggle functionality
- [ ] Add visual indicator in content script
- [ ] Test with new entries

### Cleanup

- [ ] Remove console.logs or make configurable
- [ ] Add error handling for mark-as-read failures
- [ ] Update ARCHITECTURE.md with new features
- [ ] Test on production feedbin.com
