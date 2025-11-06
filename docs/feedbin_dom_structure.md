# Feedbin Web Application DOM Structure & API Reference

## Overview
This document describes the Feedbin web application's entry/article structure, CSS classes, data attributes, and API response formats. Use this for creating accurate mocks for Chrome extension testing.

---

## 1. Entry List Item DOM Structure

### Container Element
```html
<li class="entry-summary feed-id-{feedId}" data-entry-id="{entryId}" data-behavior="keyboard_navigable">
  <!-- Entry content -->
</li>
```

### Full Structure Example
```html
<li class="entry-summary feed-id-123 read selected starred" data-entry-id="456" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" 
     href="/entries/456"
     data-behavior="selectable open_item show_entry_content entry_info"
     data-remote="true"
     data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'
     data-mark-as-read-path="/entries/456/mark_as_read"
     data-recently-read-path="/entries/456/recently_read"
     data-url="https://example.com/article">
    
    <div class="entry-summary-inner">
      <!-- Feed title and favicon (mobile/small screens) -->
      <div class="feed-title-inline">
        <span class="favicon-wrap"><!-- Feed favicon image --></span>
        <div class="feed-title"><!-- Feed title --></div>
      </div>
      
      <!-- Title section -->
      <div class="title-wrap">
        <span class="favicon-wrap"><!-- Feed favicon --></span>
        <div class="title">Article Title Text Here</div>
      </div>
      
      <!-- Summary and metadata -->
      <div class="summary-content">
        <!-- Feed title -->
        <div class="feed-title">
          <span class="title-inner">Feed Name</span>
        </div>
        
        <!-- Summary text -->
        <div class="summary light">
          <span>Summary text here. Usually 2 lines max.</span>
        </div>
        
        <!-- Quoted tweet (if applicable) -->
        <div class="quoted-tweet light">
          <strong>Tweet Author</strong> – Tweet text here
        </div>
        
        <!-- Entry image (if applicable) -->
        <span class="entry-image">
          <span data-src="https://example.com/image.jpg" style="background-color: #cccccc"></span>
        </span>
        
        <!-- Status row -->
        <div class="summary-status light">
          <time class="time timeago" datetime="2024-11-04T10:00:00Z">Nov 4</time>
          <svg class="icon-retweet light"><!-- retweet icon --></svg>
          <svg class="icon-media light"><!-- media icon --></svg>
          <svg class="icon-star-on"><!-- star icon --></svg>
        </div>
      </div>
      
      <!-- Inline status (for compact display) -->
      <div class="summary-status summary-status-inline light">
        <time class="time timeago" datetime="2024-11-04T10:00:00Z">Nov 4</time>
        <svg class="icon-retweet light"><!-- retweet icon --></svg>
        <svg class="icon-media light"><!-- media icon --></svg>
        <svg class="icon-star-on"><!-- star icon --></svg>
      </div>
    </div>
  </a>
  
  <!-- Context menu -->
  <div class="summary-menu dropdown-wrap dropdown-right">
    <button class="summary-menu-button" data-behavior="toggle_dropdown">
      <svg><!-- dots icon --></svg>
    </button>
    <div class="dropdown-wrap">
      <div class="dropdown-content">
        <ul class="nav">
          <li>
            <button data-behavior="mark_above_read">
              <span class="icon-wrap"><svg><!-- up arrow --></svg></span>
              <span class="menu-text"><span class="title">Mark above as read</span></span>
            </button>
          </li>
          <li>
            <button data-behavior="mark_below_read">
              <span class="icon-wrap"><svg><!-- down arrow --></svg></span>
              <span class="menu-text"><span class="title">Mark below as read</span></span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</li>
```

---

## 2. CSS Classes & State Indicators

### Entry State Classes
| Class | Meaning |
|-------|---------|
| `.read` | Entry has been read (appears faded) |
| `.selected` | Entry is currently selected/highlighted |
| `.starred` | Entry is starred/saved |
| `.always-unread` | Entry is marked to always show as unread |
| `.media` | Entry has audio/video enclosure |
| `.no-title` | Entry has no title (uses feed name instead) |
| `.re-tweet` | Entry is a retweet |
| `.feed-id-{ID}` | Feed identifier class (useful for targeting by feed) |

### Visual Styling by State
```scss
// Read entries appear faded
.entry-summary.read:not(.selected):not(.always-unread) .entry-summary-link {
  color: $color-contrast-400;  // Lighter gray
}

// Selected entries are highlighted
.entry-summary.selected .entry-summary-inner {
  color: white;
  background-color: $color-selected-off;  // Blue/highlight color
}

// Starred entries show star icon
.entry-summary.starred .icon-star-on {
  visibility: visible;
  fill: $color-accent-orange-600;  // Orange
}
```

---

## 3. Data Attributes

### Entry Container Data Attributes
```html
<li data-entry-id="456" 
    data-behavior="keyboard_navigable">
```

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `data-entry-id` | `{entryId}` | Unique entry identifier |
| `data-behavior` | `"keyboard_navigable"` | Marks element for keyboard navigation |

### Entry Link Data Attributes
```html
<a data-behavior="selectable open_item show_entry_content entry_info"
   data-remote="true"
   data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'
   data-mark-as-read-path="/entries/456/mark_as_read"
   data-recently-read-path="/entries/456/recently_read"
   data-url="https://example.com/article">
```

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `data-behavior` | Space-separated behaviors | Multiple behaviors (selectable, open_item, show_entry_content, entry_info) |
| `data-remote` | `"true"` | AJAX request (Rails UJS) |
| `data-entry-info` | JSON object | Entry metadata: `{id, feed_id, published (unix timestamp)}` |
| `data-mark-as-read-path` | URL path | AJAX endpoint to mark as read |
| `data-recently-read-path` | URL path | AJAX endpoint to track recently read |
| `data-url` | Full URL | Fully qualified article URL |

---

## 4. Entry Detail View (Full Article)

### Article Container
```html
<div class="read toolbar-wrap" data-behavior="selected_entry_data" data-entry-id="{entryId}">
  <!-- Toolbar -->
  <div class="entry-toolbar">
    <div class="site-info">
      <button class="back-button" data-behavior="show_entries_panel">
        <svg><!-- arrow icon --></svg>
      </button>
      <button class="entry-button button-full-screen" data-behavior="full_screen">
        <svg><!-- close icon --></svg>
      </button>
      <!-- Feed favicon and title -->
    </div>
    
    <div class="entry-buttons">
      <!-- Delete button -->
      <!-- Share button -->
      <!-- Toggle content option -->
      <!-- Star/favorite button -->
      <!-- Mark as read/unread button -->
      <!-- Settings button -->
    </div>
  </div>
  
  <script>
    feedbin.selectedEntryData = {
      id: 456,
      url: "https://example.com/article",
      title: "Article Title",
      feed_id: 123,
      feed_title: "Feed Name",
      twitter_id: ""
    };
  </script>
</div>
```

### Article Header
```html
<header class="entry-header">
  <a href="https://example.com/article" target="_blank" id="source_link">
    <h1>Article Title</h1>
  </a>
  <div class="flex gap-4 space-between items-last-baseline">
    <div class="grow">
      <p class="post-meta">
        <time datetime="2024-11-04T10:00:00Z">November 4, 2024 10:00 AM</time>
        <span class="author">by Author Name</span>
      </p>
      <p class="post-meta feed-title">
        <span data-behavior="user_title" data-feed-id="123">Feed Title</span>
      </p>
    </div>
  </div>
</header>
```

### Article Content Container
```html
<div data-behavior="entry_content_wrap external_links" 
     class="content-styles entry-type-default entry-format-default-html">
  <!-- Article HTML content here -->
</div>
```

---

## 5. Mark as Read/Unread Controls

### Unread Toggle Form
```html
<form action="/entries/456/unread_entries" method="POST" data-remote="true" 
      data-behavior="toggle_read" 
      data-entry-id="456" 
      data-feed-id="123" 
      data-published="1699000000" 
      class="entry-button-wrap">
  <button class="entry-button button-toggle-read" title="Mark as read <i>m</i>">
    <svg><!-- read icon --></svg>
    <svg><!-- unread icon --></svg>
  </button>
</form>
```

### Starred Toggle Form
```html
<form action="/entries/456/starred_entries" method="POST" data-remote="true" 
      data-behavior="toggle_starred" 
      data-entry-id="456" 
      class="entry-button-wrap">
  <button class="entry-button button-toggle-starred" title="Star <i>s</i>">
    <svg><!-- star-on icon --></svg>
    <svg><!-- star-off icon --></svg>
  </button>
</form>
```

---

## 6. API Response Format

### Entry JSON (Default Format)
```json
{
  "id": 456,
  "feed_id": 123,
  "title": "Article Title",
  "author": "Author Name",
  "summary": "Summary text here...",
  "content": "<p>Article HTML content...</p>",
  "url": "https://example.com/article",
  "extracted_content_url": null,
  "published": "2024-11-04T10:00:00.000000Z",
  "created_at": "2024-11-04T11:30:00.000000Z"
}
```

### Entry JSON (Extended Format)
```json
{
  "id": 456,
  "feed_id": 123,
  "title": "Article Title",
  "author": "Author Name",
  "summary": "Summary text here...",
  "content": "<p>Article HTML content...</p>",
  "url": "https://example.com/article",
  "published": "2024-11-04T10:00:00.000000Z",
  "created_at": "2024-11-04T11:30:00.000000Z",
  "original": "original content field",
  "twitter_id": null,
  "twitter_thread_ids": [],
  "extracted_content_url": null,
  "images": {
    "original_url": "https://example.com/image.jpg",
    "size_1": {
      "cdn_url": "https://cdn.example.com/image.jpg",
      "width": 800,
      "height": 600
    }
  },
  "enclosure": {
    "enclosure_url": "https://example.com/audio.mp3",
    "enclosure_type": "audio/mpeg",
    "enclosure_length": "12345",
    "itunes_duration": "3600"
  },
  "extracted_articles": [],
  "json_feed": {}
}
```

### Entry JSON (Private/App Format)
```json
{
  "id": 456,
  "feed_id": 123,
  "title": "Article Title",
  "author": "Author Name",
  "content": "<p>Article HTML content...</p>",
  "content_text": "Plain text version of content...",
  "summary": "Summary text here...",
  "url": "https://example.com/article",
  "published": "2024-11-04T10:00:00.000000Z",
  "created_at": "2024-11-04T11:30:00.000000Z"
}
```

### Enclosure (Media/Podcast)
```json
{
  "enclosure_url": "https://example.com/audio.mp3",
  "enclosure_type": "audio/mpeg",
  "enclosure_length": "12345678",
  "itunes_duration": "3600"
}
```

---

## 7. Entry Metadata Fields

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `456` | Unique entry identifier |
| `feed_id` | integer | `123` | Associated feed ID |
| `title` | string | `"Article Title"` | Entry title (may be empty) |
| `author` | string | `"John Doe"` | Entry author |
| `summary` | string | `"Summary..."` | HTML/text summary |
| `content` | string | `"<p>HTML...</p>"` | Full HTML content |
| `content_text` | string | `"Plain text..."` | Plain text version |
| `url` | string | `"https://..."` | Fully qualified article URL |
| `published` | ISO8601 | `"2024-11-04T10:00:00Z"` | Publication date |
| `created_at` | ISO8601 | `"2024-11-04T11:30:00Z"` | When added to Feedbin |
| `twitter_id` | string/null | `"12345..."` | Twitter post ID (if tweet) |
| `twitter_thread_ids` | array | `[]` | Related tweet thread IDs |
| `extracted_content_url` | string/null | `null` | Extracted/archived URL |

---

## 8. Entry List Container

```html
<ul class="entries">
  <li class="entry-summary feed-id-123"><!-- Entry item --></li>
  <li class="entry-summary feed-id-123 read"><!-- Read entry --></li>
  <li class="entry-summary feed-id-124 selected"><!-- Selected entry --></li>
</ul>
```

### Container Data
- **Class**: `.entries` - Main entry list container
- **Structure**: Unordered list `<ul>` with `<li>` items
- **Scroll behavior**: Auto-loads more entries when scrolled near bottom
- **Selection**: Only one entry should have `.selected` class at a time

---

## 9. Keyboard Navigation Behaviors

The application uses several data-behavior attributes for keyboard interaction:

| Behavior | Element | Key Binding | Action |
|----------|---------|------------|--------|
| `keyboard_navigable` | Entry item `<li>` | Arrow keys | Item selection |
| `selectable` | Entry link | Enter/Click | Open entry |
| `open_item` | Entry link | Enter/Click | Show entry content |
| `show_entry_content` | Entry link | Enter/Click | Display full article |
| `toggle_read` | Unread form | `m` | Toggle read status |
| `toggle_starred` | Star form | `s` | Toggle star status |
| `mark_above_read` | Menu button | Menu click | Mark all above as read |
| `mark_below_read` | Menu button | Menu click | Mark all below as read |

---

## 10. CSS Class Hierarchy

```
.entries                           // Entry list container
├── .entry-summary                 // Entry list item
│   ├── .feed-id-{ID}             // Feed identifier
│   ├── .read                      // Read state
│   ├── .selected                  // Selected state
│   ├── .starred                   // Starred state
│   ├── .no-title                  // No title variant
│   ├── .media                     // Has media
│   ├── .re-tweet                  // Retweet
│   ├── .always-unread             // Marked unread
│   │
│   └── .entry-summary-link        // Main link wrapper
│       ├── .entry-summary-inner   // Content wrapper
│       │   ├── .feed-title-inline // Feed title (mobile)
│       │   ├── .title-wrap        // Title section
│       │   │   └── .title         // Actual title text
│       │   ├── .summary-content   // Summary section
│       │   │   ├── .feed-title    // Feed name
│       │   │   ├── .summary       // Summary text
│       │   │   │   ├── .inline-title
│       │   │   │   └── .summary-inner
│       │   │   ├── .quoted-tweet  // Tweet quote (if applicable)
│       │   │   ├── .entry-image   // Featured image
│       │   │   ├── .link-preview  // Link preview card
│       │   │   └── .summary-status // Meta (time, icons)
│       │   └── .summary-status-inline
│       │
│       └── .summary-menu          // Context menu
│           ├── .dropdown-wrap
│           └── .dropdown-content
```

---

## 11. Mock Entry Creation Guide

### Minimal Mock Entry
```html
<li class="entry-summary feed-id-123" data-entry-id="456" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" 
     href="/entries/456"
     data-behavior="selectable open_item show_entry_content entry_info"
     data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'>
    <div class="entry-summary-inner">
      <div class="title-wrap">
        <div class="title">Test Article Title</div>
      </div>
      <div class="summary-content">
        <div class="summary light">
          <span>Test summary text</span>
        </div>
        <div class="summary-status light">
          <time class="time timeago">Nov 4</time>
        </div>
      </div>
    </div>
  </a>
</li>
```

### Rich Mock Entry with Media
```html
<li class="entry-summary feed-id-123 starred" data-entry-id="456" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" 
     href="/entries/456"
     data-behavior="selectable open_item show_entry_content entry_info"
     data-entry-info='{"id":456,"feed_id":123,"published":1699000000}'>
    <div class="entry-summary-inner">
      <div class="title-wrap">
        <span class="favicon-wrap">
          <img src="https://example.com/favicon.png" alt="">
        </span>
        <div class="title">Test Article with Image</div>
      </div>
      <div class="summary-content">
        <div class="feed-title">
          <span class="title-inner">Test Feed</span>
        </div>
        <div class="summary light">
          <span class="inline-title">Test Article with Image</span>
          <span class="summary-inner">This is a test summary with rich content and media.</span>
        </div>
        <span class="entry-image">
          <span data-src="https://example.com/image.jpg" style="background-color: #b3d9ff"></span>
        </span>
        <div class="summary-status light">
          <time class="time timeago" datetime="2024-11-04T10:00:00Z">Nov 4</time>
          <svg class="icon-media light" width="12" height="12" viewBox="0 0 12 12"><!-- media icon --></svg>
          <svg class="icon-star-on" width="12" height="12" viewBox="0 0 12 12" fill="#FF9500"><!-- star icon --></svg>
        </div>
      </div>
    </div>
  </a>
</li>
```

### Read Entry Mock
```html
<li class="entry-summary feed-id-123 read" data-entry-id="457" data-behavior="keyboard_navigable">
  <a class="entry-summary-link" 
     href="/entries/457"
     data-behavior="selectable open_item show_entry_content entry_info"
     data-entry-info='{"id":457,"feed_id":123,"published":1698900000}'>
    <div class="entry-summary-inner">
      <div class="title-wrap">
        <div class="title">Already Read Article</div>
      </div>
      <div class="summary-content">
        <div class="summary light">
          <span>This entry appears faded because it's marked as read</span>
        </div>
        <div class="summary-status light">
          <time class="time timeago">Nov 3</time>
        </div>
      </div>
    </div>
  </a>
</li>
```

---

## 12. Important Implementation Notes

1. **Entry ID Data**: The `data-entry-info` attribute contains a JSON object with `id`, `feed_id`, and `published` (as Unix timestamp)

2. **Read State Styling**: 
   - Unread: Normal contrast text
   - Read: Lighter gray text (`.read` class)
   - Selected: Highlighted background with white text (`.selected` class)

3. **Star Icon Visibility**:
   - Only visible when entry has `.starred` class
   - Icon appears orange (`fill: #FF9500`)

4. **Timestamp Format**:
   - ISO8601 in `datetime` attribute: `"2024-11-04T10:00:00Z"`
   - Display text uses "timeago" format: `"Nov 4"`

5. **Feed ID Class**:
   - Every entry has `feed-id-{ID}` class for CSS targeting
   - Useful for styling entries by feed

6. **Behavior Attributes**:
   - Space-separated: `data-behavior="selectable open_item show_entry_content entry_info"`
   - Each behavior triggers different handlers

7. **AJAX Paths**:
   - Mark as read: `data-mark-as-read-path="/entries/{id}/mark_as_read"`
   - Recently read tracking: `data-recently-read-path="/entries/{id}/recently_read"`

---

## 13. URL Patterns

| Path | Purpose | Method |
|------|---------|--------|
| `/entries/{id}` | View entry detail | GET |
| `/entries/{id}/mark_as_read` | Mark as read | POST |
| `/entries/{id}/recently_read` | Track as recently read | POST |
| `/entries/{id}/unread_entries` | Toggle unread status | POST |
| `/entries/{id}/starred_entries` | Toggle star status | POST |
| `/api/v2/entries/{id}` | Get entry JSON (default) | GET |
| `/api/v2/entries/{id}?mode=extended` | Get entry JSON (extended) | GET |
| `/api/v2/entries/{id}?private=true` | Get entry JSON (app) | GET |

---

## 14. Helpful CSS Variables

Common color variables used:
- `$color-contrast-600` - Default text (darkest)
- `$color-contrast-500` - Secondary text
- `$color-contrast-400` - Read/faded text
- `$color-selected-off` - Unselected highlight
- `$color-selected` - Selected item highlight
- `$color-accent-orange-600` - Star icon color (#FF9500)
- `$color-borders` - Border colors

---

This comprehensive reference should provide everything needed to create accurate DOM mocks for testing the Chrome extension with the Feedbin web application.
