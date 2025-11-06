# Feedbin DOM Documentation Index

Complete reference documentation for Feedbin web application structure, extracted from the actual codebase at `../feedbin`.

## Documentation Files

### 1. FEEDBIN_DOM_STRUCTURE.md (Main Reference - 604 lines)
**Comprehensive documentation of the complete Feedbin entry/article DOM structure.**

Contains:
- Entry list item DOM structure with full examples
- CSS classes & state indicators (read, selected, starred, media, etc.)
- Data attributes reference (entry-id, feed-id, entry-info, behavior)
- Entry detail view (full article) structure
- Mark as read/unread control HTML
- API response formats (default, extended, private)
- Entry metadata fields reference table
- Entry list container structure
- Keyboard navigation behaviors
- CSS class hierarchy tree
- Mock entry creation guide with 3 examples
- Implementation notes and best practices
- URL patterns for entry operations
- CSS variable reference

**Best for:** Complete understanding of entry structure, creating accurate DOM mocks, understanding state management.

---

### 2. QUICK_REFERENCE.md (Fast Lookup - 239 lines)
**Quick lookup guide for the most commonly needed information.**

Contains:
- Essential classes & attributes summary
- State classes cheat sheet
- Data attributes quick guide
- HTML structure template
- Common test scenarios
- Critical data points
- CSS selectors for testing
- Minimal API response
- Key entry points for extension interaction
- Testing checklist

**Best for:** Quick lookups during development, remembering class names, testing checklist.

---

### 3. MOCK_GENERATORS.md (Implementation Guide - 427 lines)
**Practical code examples for generating test mocks.**

Contains:
- JavaScript helper functions (createEntryMock, createEntryHTML, createEntryListHTML)
- HTML test fixtures with minimal setup
- Jest test suite examples with unit tests
- Cypress test helpers and integration tests
- Python mock generator class
- Command line usage examples

**Best for:** Setting up test infrastructure, writing tests, generating fixtures programmatically.

---

## Quick Start Guide

### For Creating a Test Entry List:
1. Read: QUICK_REFERENCE.md (HTML Structure Template section)
2. Reference: FEEDBIN_DOM_STRUCTURE.md (Section 1 & 2)
3. Implement: MOCK_GENERATORS.md (JavaScript Entry HTML Generator)

### For Understanding Entry States:
1. Quick lookup: QUICK_REFERENCE.md (State Classes Cheat Sheet)
2. Deep dive: FEEDBIN_DOM_STRUCTURE.md (Section 2: CSS Classes)

### For Testing:
1. Setup: MOCK_GENERATORS.md (HTML Test Fixtures or Jest/Cypress examples)
2. Reference: QUICK_REFERENCE.md (Testing Checklist)
3. Validate: FEEDBIN_DOM_STRUCTURE.md (Section 3: Data Attributes)

### For API Integration:
1. Overview: FEEDBIN_DOM_STRUCTURE.md (Section 6: API Response Format)
2. Details: FEEDBIN_DOM_STRUCTURE.md (Section 7: Entry Metadata Fields)
3. Implement: MOCK_GENERATORS.md (Mock generators for API responses)

---

## Key Information by Topic

### CSS Classes
**Primary Classes:**
- `.entry-summary` - Entry list item container
- `.entry-summary-link` - Clickable entry
- `.entry-summary-inner` - Content wrapper

**State Classes:**
- `.read` - Read entries (appear faded)
- `.selected` - Currently selected (blue highlight)
- `.starred` - Starred/saved (shows star icon)
- `.always-unread` - Never marked as read
- `.media` - Has audio/video
- `.no-title` - No title provided
- `.re-tweet` - Is a retweet
- `.feed-id-{ID}` - Feed identifier

### Data Attributes
**Most Important:**
- `data-entry-id="456"` - Unique entry ID
- `data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'` - Entry metadata
- `data-behavior="selectable open_item show_entry_content entry_info"` - Interaction handlers
- `data-url="https://example.com"` - Article URL

### State Management
**Entry States:**
1. Unread (no `.read` class) - Normal contrast
2. Read (`.read` class) - Faded/gray text
3. Selected (`.selected` class) - Blue highlight, white text
4. Starred (`.starred` class) - Orange star visible

**Toggling:**
- Read status: Form with `data-behavior="toggle_read"`
- Star status: Form with `data-behavior="toggle_starred"`

---

## Documentation Structure Map

```
FEEDBIN_DOM_STRUCTURE.md (Complete Reference)
├── Section 1: Entry List Item DOM Structure
│   └── Full HTML example with all possible elements
├── Section 2: CSS Classes & State Indicators
│   └── Class definitions and visual effects
├── Section 3: Data Attributes
│   └── All data-* attributes explained
├── Section 4: Entry Detail View
│   └── Full article display structure
├── Section 5: Mark as Read/Unread Controls
│   └── Form HTML for toggling states
├── Section 6: API Response Format
│   └── JSON response structures (default, extended, private)
├── Section 7: Entry Metadata Fields
│   └── Table of all data fields
├── Section 8: Entry List Container
│   └── List structure and behavior
├── Section 9: Keyboard Navigation Behaviors
│   └── Behavior attributes reference
├── Section 10: CSS Class Hierarchy
│   └── Visual tree of class structure
├── Section 11: Mock Entry Creation Guide
│   └── 3 example mocks (minimal, rich, read)
├── Section 12: Implementation Notes
│   └── Best practices and important details
├── Section 13: URL Patterns
│   └── REST API endpoints
└── Section 14: CSS Variables
    └── Color and style variables

QUICK_REFERENCE.md (Quick Lookup)
├── Essential Classes & Attributes
├── State Classes Cheat Sheet
├── Data Attributes Quick Guide
├── HTML Structure Template
├── Common Test Scenarios
├── Critical Data Points
├── CSS Selectors for Testing
├── API Response (Minimal)
├── Key Entry Points for Extension
└── Testing Checklist

MOCK_GENERATORS.md (Implementation)
├── JavaScript Helper Functions
├── HTML Test Fixtures
├── Jest Test Suite Examples
├── Cypress Test Helpers
├── Python Mock Generator
└── Quick Command Line Usage
```

---

## Real-World Example: Complete Entry Mock

### Minimal
```html
<li class="entry-summary feed-id-123" data-entry-id="456" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'>
    <div class="entry-summary-inner">
      <div class="title-wrap"><div class="title">Article</div></div>
      <div class="summary-content">
        <div class="summary light"><span>Summary</span></div>
      </div>
    </div>
  </a>
</li>
```

### Rich (with media, feed info, timestamp)
```html
<li class="entry-summary feed-id-123 starred" data-entry-id="456" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" 
     data-behavior="selectable open_item show_entry_content entry_info"
     data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'
     data-url="https://example.com/article">
    <div class="entry-summary-inner">
      <div class="title-wrap">
        <span class="favicon-wrap"><img src="favicon.png" alt=""></span>
        <div class="title">Article With Image</div>
      </div>
      <div class="summary-content">
        <div class="feed-title"><span>Feed Name</span></div>
        <div class="summary light">
          <span class="inline-title">Article With Image</span>
          <span class="summary-inner">Rich summary text here</span>
        </div>
        <span class="entry-image">
          <span data-src="https://example.com/image.jpg" style="background-color: #b3d9ff"></span>
        </span>
        <div class="summary-status light">
          <time class="time timeago" datetime="2024-11-04T10:00:00Z">Nov 4</time>
          <svg class="icon-star-on" width="12" height="12" fill="#FF9500"></svg>
        </div>
      </div>
    </div>
  </a>
</li>
```

### Read
```html
<li class="entry-summary feed-id-123 read" data-entry-id="457" data-behavior="keyboard_navigable">
  <!-- Same structure, with .read class -->
</li>
```

---

## Source Code References

### From Feedbin Repository (../feedbin)

**Templates:**
- `/app/views/entries/_entry.html.erb` - Main entry list item template
- `/app/views/entries/_show.html.erb` - Entry detail view
- `/app/views/unread_entries/_form.html.erb` - Mark as read control
- `/app/views/starred_entries/_form.html.erb` - Star control
- `/app/views/shared/_entry_status.html.erb` - Status indicators

**Models & Presenters:**
- `/app/models/entry.rb` - Entry model with attributes
- `/app/presenters/entry_presenter.rb` - Presentation logic

**API Views:**
- `/app/views/api/v2/entries/_entry_default.json.jbuilder` - Default API response
- `/app/views/api/v2/entries/_entry_extended.json.jbuilder` - Extended API response
- `/app/views/api/v2/entries/_entry_private.json.jbuilder` - Private/app API response

**Styles:**
- `/app/assets/stylesheets/application.scss` - All CSS (lines 1790-2150 for entry styles)

**JavaScript:**
- `/app/assets/javascripts/web/_site.js.coffee` - Main behavior handlers
- `/app/assets/javascripts/web/keyboard.js.coffee` - Keyboard navigation
- `/app/assets/javascripts/web/entries.js.coffee` - Entry-specific handlers

---

## Testing Tips

### Visual Testing Checklist
- [ ] Unread entries show normal contrast text
- [ ] Read entries show faded/gray text
- [ ] Selected entry has blue background with white text
- [ ] Starred entries show orange star icon
- [ ] Entry title is visible and properly truncated
- [ ] Summary shows 1-2 lines of text
- [ ] Timestamp displays in short format (e.g., "Nov 4")
- [ ] Feed favicon (if present) displays correctly
- [ ] Entry image placeholder shows with correct background color

### Data Attribute Validation
- [ ] `data-entry-id` is unique per entry
- [ ] `data-entry-info` contains valid JSON
- [ ] `feed_id` in JSON matches `feed-id-{ID}` class
- [ ] `published` is Unix timestamp
- [ ] `data-url` is fully qualified URL
- [ ] `data-behavior` contains expected behavior names

### Interactive Testing
- [ ] Clicking entry opens detail view
- [ ] Toggle read button changes state
- [ ] Toggle star button changes state
- [ ] Keyboard navigation works (arrows, j/k)
- [ ] Entry scrolls into view when selected

---

## Integration with Extension

The extension can interact with Feedbin entries through:

1. **DOM Queries:** Use CSS selectors to find entries
2. **Data Attributes:** Extract metadata via `data-*` attributes
3. **Class Names:** Determine entry state via CSS classes
4. **Event Listeners:** Monitor user interactions with entries
5. **API Calls:** Fetch entry data via Feedbin API endpoints

Example extension interaction:
```javascript
// Get currently selected entry
const selectedEntry = document.querySelector('li.entry-summary.selected');
const entryId = selectedEntry.dataset.entryId;
const entryInfo = JSON.parse(selectedEntry.querySelector('a').dataset.entryInfo);

// Check if entry is read
const isRead = selectedEntry.classList.contains('read');

// Check if entry is starred
const isStarred = selectedEntry.classList.contains('starred');

// Get article URL
const articleUrl = selectedEntry.querySelector('a').dataset.url;
```

---

## Notes

1. **Always use the most specific class:** Use `.entry-summary` + state classes, not just state classes
2. **Data attributes are JSON:** Parse `data-entry-info` as JSON
3. **Timestamps are Unix:** Convert `published` from Unix timestamp to Date
4. **URLs are fully qualified:** Don't need to construct base URL
5. **Feed ID is critical:** Used for filtering and display logic
6. **Real app uses Rails UJS:** Forms have `data-remote="true"` for AJAX

---

## Document Version

- Created: 2024-11-04
- Feedbin Commit: Latest from main branch
- Coverage: Entry list view, entry detail view, API responses
- Accuracy: Verified against actual Feedbin source code

Last updated from source: `/Users/anthony/Documents/dev/feedbin/`

---

For detailed information on any topic, refer to the specific section in FEEDBIN_DOM_STRUCTURE.md or the quick lookup in QUICK_REFERENCE.md.
