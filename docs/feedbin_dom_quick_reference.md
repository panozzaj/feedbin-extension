# Feedbin DOM Quick Reference for Testing

## Essential Classes & Attributes

### Entry List Item
```html
<li class="entry-summary feed-id-123 [read] [selected] [starred]" 
    data-entry-id="456" 
    data-behavior="keyboard_navigable">
```

**Key classes:**
- `.read` - Appears faded
- `.selected` - Highlighted (blue background)
- `.starred` - Shows orange star icon

### Entry Link
```html
<a class="entry-summary-link"
   data-behavior="selectable open_item show_entry_content entry_info"
   data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'
   data-url="https://example.com/article">
```

### Read Status Toggles (in Article View)
```html
<!-- Mark as read/unread -->
<form data-behavior="toggle_read" data-entry-id="456">
  <button class="button-toggle-read"></button>
</form>

<!-- Star/unstar -->
<form data-behavior="toggle_starred" data-entry-id="456">
  <button class="button-toggle-starred"></button>
</form>
```

---

## State Classes Cheat Sheet

| Class | Visual Effect |
|-------|---------------|
| `.read` | Gray text, faded appearance |
| `.selected` | Blue highlight, white text |
| `.starred` | Orange star visible |
| `.media` | Media icon visible |
| `.no-title` | Shows feed name instead |
| `.always-unread` | Never appears faded |

---

## Data Attributes Quick Guide

```html
<!-- On list item -->
data-entry-id="456"              <!-- Unique entry ID -->
data-behavior="keyboard_navigable"

<!-- On entry link -->
data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'
data-behavior="selectable open_item show_entry_content entry_info"
data-url="https://example.com/article"
data-mark-as-read-path="/entries/456/mark_as_read"
data-recently-read-path="/entries/456/recently_read"

<!-- On control forms -->
data-behavior="toggle_read"      <!-- Mark as read form -->
data-behavior="toggle_starred"   <!-- Star form -->
data-entry-id="456"
data-feed-id="123"
data-published="1699000000"      <!-- Unix timestamp -->
```

---

## HTML Structure Template

```html
<ul class="entries">
  <!-- UNREAD ENTRY -->
  <li class="entry-summary feed-id-123" data-entry-id="456" data-behavior="keyboard_navigable">
    <a class="entry-summary-link" 
       href="/entries/456"
       data-behavior="selectable open_item show_entry_content entry_info"
       data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'>
      <div class="entry-summary-inner">
        <div class="title-wrap">
          <div class="title">Article Title</div>
        </div>
        <div class="summary-content">
          <div class="summary light">
            <span>Summary text...</span>
          </div>
          <div class="summary-status light">
            <time class="time timeago" datetime="2024-11-04T10:00:00Z">Nov 4</time>
          </div>
        </div>
      </div>
    </a>
  </li>

  <!-- READ ENTRY -->
  <li class="entry-summary feed-id-123 read" data-entry-id="457" data-behavior="keyboard_navigable">
    <!-- Same structure, but with .read class -->
  </li>

  <!-- SELECTED ENTRY -->
  <li class="entry-summary feed-id-123 selected" data-entry-id="458" data-behavior="keyboard_navigable">
    <!-- Same structure, but with .selected class -->
  </li>

  <!-- STARRED ENTRY -->
  <li class="entry-summary feed-id-123 starred" data-entry-id="459" data-behavior="keyboard_navigable">
    <!-- Same structure, but with .starred class -->
  </li>
</ul>
```

---

## Common Test Scenarios

### Scenario 1: Default List (Mix of States)
```html
<ul class="entries">
  <!-- Unread entry -->
  <li class="entry-summary feed-id-1" data-entry-id="1">...</li>
  <!-- Read entry -->
  <li class="entry-summary feed-id-1 read" data-entry-id="2">...</li>
  <!-- Selected entry -->
  <li class="entry-summary feed-id-1 selected" data-entry-id="3">...</li>
  <!-- Starred, read entry -->
  <li class="entry-summary feed-id-1 read starred" data-entry-id="4">...</li>
</ul>
```

### Scenario 2: Entry Detail View
```html
<div class="read toolbar-wrap" data-behavior="selected_entry_data" data-entry-id="456">
  <div class="entry-toolbar">
    <!-- Toolbar buttons -->
  </div>
</div>

<header class="entry-header">
  <a href="https://example.com" target="_blank" id="source_link">
    <h1>Article Title</h1>
  </a>
  <p class="post-meta">
    <time datetime="2024-11-04T10:00:00Z">November 4, 2024</time>
  </p>
</header>

<div class="content-styles" data-behavior="entry_content_wrap">
  <!-- Article HTML content -->
</div>
```

---

## Critical Data Points

1. **Entry ID**: Used in `data-entry-id` and `data-entry-info`
2. **Feed ID**: Used in class `feed-id-{ID}` and `data-feed-id`
3. **Published timestamp**: Unix timestamp in `data-published` and within `data-entry-info`
4. **Article URL**: In `data-url` and `href` attributes
5. **Feed name**: Shows in `.feed-title` or when entry has `.no-title`

---

## CSS Selectors for Testing

```css
/* Select entry by ID */
li[data-entry-id="456"]

/* Select all read entries */
li.entry-summary.read

/* Select selected entry */
li.entry-summary.selected

/* Select entries from specific feed */
li.entry-summary.feed-id-123

/* Select starred entries */
li.entry-summary.starred

/* Select unread entries */
li.entry-summary:not(.read)
```

---

## API Response (Minimal)

```json
{
  "id": 456,
  "feed_id": 123,
  "title": "Article Title",
  "author": "Author Name",
  "summary": "Summary text...",
  "content": "<p>Article HTML...</p>",
  "url": "https://example.com/article",
  "published": "2024-11-04T10:00:00.000000Z",
  "created_at": "2024-11-04T11:30:00.000000Z"
}
```

---

## Key Entry Points for Extension Interaction

1. **Entry list container**: `.entries` - Main list of articles
2. **Entry items**: `li.entry-summary` - Individual articles
3. **Entry links**: `a.entry-summary-link` - Clickable article
4. **Article view**: `div.read.toolbar-wrap` - Full article display
5. **Toggle buttons**: `form[data-behavior="toggle_read|toggle_starred"]` - Read/star controls

---

## Testing Checklist

- [ ] Entry has correct `data-entry-id`
- [ ] Entry link has correct `data-entry-info` JSON
- [ ] Feed ID class matches feed_id in data
- [ ] `.read` class applied to read entries
- [ ] `.selected` class highlights entry
- [ ] `.starred` class shows star icon
- [ ] Timestamps are ISO8601 format
- [ ] Article URL is fully qualified
- [ ] Toggle forms have correct behavior names
- [ ] Entry renders in list and detail views

---

This quick reference should cover 95% of your testing needs. See FEEDBIN_DOM_STRUCTURE.md for complete details.
