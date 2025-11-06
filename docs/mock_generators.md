# Mock Generator Examples for Testing

## JavaScript Helper Functions

### Entry Mock Generator
```javascript
function createEntryMock(options = {}) {
  const defaults = {
    id: Math.floor(Math.random() * 100000),
    feedId: Math.floor(Math.random() * 1000),
    title: 'Test Article Title',
    summary: 'This is a test summary of the article content.',
    url: 'https://example.com/article',
    published: new Date().toISOString(),
    read: false,
    starred: false
  };

  const config = { ...defaults, ...options };

  return {
    id: config.id,
    feed_id: config.feedId,
    title: config.title,
    summary: config.summary,
    content: `<p>${config.summary}</p>`,
    url: config.fully_qualified_url || config.url,
    published: config.published,
    created_at: new Date().toISOString(),
    author: options.author || null,
    twitter_id: options.twitter_id || null
  };
}
```

### Entry HTML Generator
```javascript
function createEntryHTML(entryData = {}) {
  const entry = createEntryMock(entryData);
  const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
  const isRead = entryData.read ? 'read' : '';
  const isSelected = entryData.selected ? 'selected' : '';
  const isStarred = entryData.starred ? 'starred' : '';
  
  const classes = `entry-summary feed-id-${entry.feed_id} ${isRead} ${isSelected} ${isStarred}`.trim();
  
  return `
    <li class="${classes}" data-entry-id="${entry.id}" data-behavior="keyboard_navigable">
      <a class="entry-summary-link" 
         href="/entries/${entry.id}"
         data-behavior="selectable open_item show_entry_content entry_info"
         data-remote="true"
         data-entry-info='{"id":${entry.id},"feed_id":${entry.feed_id},"published":${timestamp}}'
         data-mark-as-read-path="/entries/${entry.id}/mark_as_read"
         data-recently-read-path="/entries/${entry.id}/recently_read"
         data-url="${entry.url}">
        <div class="entry-summary-inner">
          <div class="title-wrap">
            <div class="title">${entry.title}</div>
          </div>
          <div class="summary-content">
            <div class="summary light">
              <span>${entry.summary}</span>
            </div>
            <div class="summary-status light">
              <time class="time timeago" datetime="${entry.published}">
                ${new Date(entry.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </time>
              ${isStarred ? '<svg class="icon-star-on" width="12" height="12" fill="#FF9500"><!-- star --></svg>' : ''}
            </div>
          </div>
        </div>
      </a>
    </li>
  `.trim();
}
```

### Entry List Generator
```javascript
function createEntryListHTML(entries = []) {
  if (entries.length === 0) {
    // Create 5 default entries
    entries = [
      { id: 1, title: 'Unread Article 1' },
      { id: 2, title: 'Read Article', read: true },
      { id: 3, title: 'Selected Article', selected: true },
      { id: 4, title: 'Starred Article', starred: true },
      { id: 5, title: 'Read & Starred', read: true, starred: true }
    ];
  }

  const html = entries
    .map(entry => createEntryHTML(entry))
    .join('\n');

  return `<ul class="entries">\n${html}\n</ul>`;
}
```

---

## HTML Test Fixtures

### Minimal Setup
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .entry-summary { margin: 8px 0; padding: 8px; border-bottom: 1px solid #ccc; }
    .entry-summary.read .entry-summary-link { color: #999; }
    .entry-summary.selected .entry-summary-inner { background: #0078d4; color: white; padding: 8px; }
    .entry-summary.starred .icon-star-on { visibility: visible; }
    .icon-star-on { visibility: hidden; }
    .title { font-weight: bold; font-size: 15px; margin: 8px 0; }
    .summary { font-size: 14px; color: #666; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="entries-container">
    <ul class="entries" id="entries-list"></ul>
  </div>

  <script>
    // Load mock data
    const mockEntries = [
      { id: 1, feedId: 100, title: 'Breaking News', summary: 'Important update about...', read: false },
      { id: 2, feedId: 100, title: 'Tech News', summary: 'Latest in technology...', read: true },
      { id: 3, feedId: 100, title: 'Featured', summary: 'This article is starred', read: false, starred: true },
      { id: 4, feedId: 101, title: 'Another Feed', summary: 'From different feed...', read: true }
    ];

    const list = document.getElementById('entries-list');
    mockEntries.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = createEntryHTML(entry);
      list.appendChild(li);
    });
  </script>
</body>
</html>
```

---

## Jest Test Suite Examples

### Test Entry Creation
```javascript
describe('Entry Mock Generator', () => {
  test('creates entry with default values', () => {
    const entry = createEntryMock();
    expect(entry.id).toBeGreaterThan(0);
    expect(entry.title).toBe('Test Article Title');
    expect(entry.feed_id).toBeGreaterThan(0);
  });

  test('creates entry with custom values', () => {
    const entry = createEntryMock({
      id: 123,
      feedId: 456,
      title: 'Custom Title',
      read: true
    });
    expect(entry.id).toBe(123);
    expect(entry.feed_id).toBe(456);
    expect(entry.title).toBe('Custom Title');
  });

  test('generates valid ISO8601 timestamp', () => {
    const entry = createEntryMock();
    expect(new Date(entry.published)).not.toBeNaN();
  });
});

describe('Entry HTML Generation', () => {
  test('renders entry with correct data attributes', () => {
    const entry = createEntryMock({ id: 123, feedId: 456 });
    const html = createEntryHTML(entry);
    expect(html).toContain('data-entry-id="123"');
    expect(html).toContain('feed-id-456');
  });

  test('applies read class when entry is read', () => {
    const html = createEntryHTML({ id: 1, read: true });
    expect(html).toContain('class="entry-summary feed-id');
    expect(html).toContain('read');
  });

  test('applies selected class when entry is selected', () => {
    const html = createEntryHTML({ id: 1, selected: true });
    expect(html).toContain('selected');
  });

  test('shows star icon when entry is starred', () => {
    const html = createEntryHTML({ id: 1, starred: true });
    expect(html).toContain('icon-star-on');
  });
});

describe('Entry List Generation', () => {
  test('generates list with multiple entries', () => {
    const html = createEntryListHTML([
      { id: 1, title: 'Article 1' },
      { id: 2, title: 'Article 2' }
    ]);
    expect(html).toContain('<ul class="entries">');
    expect(html).toContain('Article 1');
    expect(html).toContain('Article 2');
  });

  test('generates default list when no entries provided', () => {
    const html = createEntryListHTML();
    expect(html).toContain('feed-id-');
    expect(html).toContain('entry-summary');
  });
});
```

---

## Cypress Test Helpers

### Create Test Fixtures
```javascript
// cypress/support/entry-helpers.js

export function createMockEntry(overrides = {}) {
  return {
    id: 456,
    feed_id: 123,
    title: 'Test Article',
    summary: 'Test summary',
    url: 'https://example.com/article',
    published: new Date().toISOString(),
    ...overrides
  };
}

export function createMockEntries(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    feed_id: Math.floor(i / 2) + 1,
    title: `Article ${i + 1}`,
    summary: `Summary for article ${i + 1}`,
    url: `https://example.com/article/${i + 1}`,
    published: new Date(Date.now() - i * 86400000).toISOString()
  }));
}

export function mountEntryList(entries = []) {
  const html = entries
    .map(entry => generateEntryHTML(entry))
    .join('\n');
  
  cy.document().then(doc => {
    const container = doc.createElement('div');
    container.innerHTML = `<ul class="entries">${html}</ul>`;
    doc.body.appendChild(container);
  });
}

function generateEntryHTML(entry) {
  const timestamp = Math.floor(new Date(entry.published).getTime() / 1000);
  return `
    <li class="entry-summary feed-id-${entry.feed_id}" data-entry-id="${entry.id}">
      <a class="entry-summary-link" 
         data-entry-info='{"id":${entry.id},"feed_id":${entry.feed_id},"published":${timestamp}}'>
        <div class="entry-summary-inner">
          <div class="title-wrap"><div class="title">${entry.title}</div></div>
          <div class="summary-content">
            <div class="summary light"><span>${entry.summary}</span></div>
          </div>
        </div>
      </a>
    </li>
  `;
}
```

### Cypress Test Examples
```javascript
// cypress/e2e/entry-tests.cy.js

import { createMockEntry, createMockEntries, mountEntryList } from '../support/entry-helpers';

describe('Entry Rendering', () => {
  beforeEach(() => {
    cy.visit('/');
    mountEntryList(createMockEntries(5));
  });

  it('displays entry list', () => {
    cy.get('.entries').should('exist');
    cy.get('.entry-summary').should('have.length', 5);
  });

  it('shows entry title', () => {
    cy.get('.entry-summary').first().contains('Article 1');
  });

  it('applies read class when marked read', () => {
    cy.get('[data-entry-id="1"]').addClass('read');
    cy.get('[data-entry-id="1"]').should('have.class', 'read');
  });

  it('toggles selected state', () => {
    cy.get('[data-entry-id="1"]').click();
    cy.get('[data-entry-id="1"]').should('have.class', 'selected');
  });

  it('toggles starred state', () => {
    cy.get('[data-entry-id="1"]').then($el => {
      $el[0].classList.add('starred');
    });
    cy.get('[data-entry-id="1"]').should('have.class', 'starred');
  });
});
```

---

## Python Mock Generator (if needed)

```python
import json
from datetime import datetime, timedelta

class EntryMock:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 123)
        self.feed_id = kwargs.get('feed_id', 456)
        self.title = kwargs.get('title', 'Test Article')
        self.summary = kwargs.get('summary', 'Test summary')
        self.content = kwargs.get('content', '<p>Test content</p>')
        self.url = kwargs.get('url', 'https://example.com/article')
        self.published = kwargs.get('published', datetime.now().isoformat())
        self.created_at = kwargs.get('created_at', datetime.now().isoformat())
        self.read = kwargs.get('read', False)
        self.starred = kwargs.get('starred', False)
        self.selected = kwargs.get('selected', False)

    def to_dict(self):
        return {
            'id': self.id,
            'feed_id': self.feed_id,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'url': self.url,
            'published': self.published,
            'created_at': self.created_at
        }

    def to_json(self):
        return json.dumps(self.to_dict())

    def to_html(self):
        timestamp = int(datetime.fromisoformat(self.published).timestamp())
        classes = f'entry-summary feed-id-{self.feed_id}'
        if self.read:
            classes += ' read'
        if self.selected:
            classes += ' selected'
        if self.starred:
            classes += ' starred'

        return f'''
        <li class="{classes}" data-entry-id="{self.id}" data-behavior="keyboard_navigable">
          <a class="entry-summary-link"
             href="/entries/{self.id}"
             data-behavior="selectable open_item show_entry_content entry_info"
             data-entry-info='{{"id":{self.id},"feed_id":{self.feed_id},"published":{timestamp}}}'>
            <div class="entry-summary-inner">
              <div class="title-wrap">
                <div class="title">{self.title}</div>
              </div>
              <div class="summary-content">
                <div class="summary light">
                  <span>{self.summary}</span>
                </div>
              </div>
            </div>
          </a>
        </li>
        '''

# Usage
entry = EntryMock(id=1, title='My Article', read=True)
print(entry.to_json())
print(entry.to_html())
```

---

## Quick Command Line Usage

### Generate HTML to clipboard
```bash
# Copy mock entry HTML to clipboard
node -e "
function createEntryHTML(entry) {
  // ... function definition ...
}
const entry = { id: 1, feedId: 100, title: 'Test', summary: 'Summary' };
console.log(createEntryHTML(entry));
" | pbcopy
```

### Generate Test Data
```bash
# Generate 10 random entries as JSON
node -e "
const entries = Array.from({length: 10}, (_, i) => ({
  id: i + 1,
  feed_id: Math.floor(i/2) + 1,
  title: \`Article \${i+1}\`,
  summary: \`Summary \${i+1}\`
}));
console.log(JSON.stringify(entries, null, 2));
"
```

---

These examples should give you a solid foundation for generating consistent, accurate test mocks for the Feedbin Chrome extension.
