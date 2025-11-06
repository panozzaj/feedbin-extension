# Testing Strategy for Feedbin Extension

## Overview

This document outlines the testing strategy for the Feedbin Chrome extension, including unit tests, integration tests, and test organization.

## Testing Framework

### Jest (Recommended)
- **Why**: Industry standard, great Chrome extension support, built-in mocking
- **Setup**: Lightweight, runs in Node.js environment
- **Mocking**: Easy to mock Chrome APIs and DOM

### Alternative: Vitest
- Faster than Jest, similar API
- Better for TypeScript projects

## Project Structure

```
feedbin-extension/
├── src/
│   ├── content-script.js
│   ├── background.js
│   ├── llm.js
│   ├── storage.js
│   ├── popup.js
│   └── popup.html
├── tests/
│   ├── unit/
│   │   ├── content-script.test.js
│   │   ├── llm.test.js
│   │   ├── storage.test.js
│   │   └── duplicates.test.js
│   ├── integration/
│   │   ├── classification.test.js
│   │   └── duplicate-detection.test.js
│   ├── mocks/
│   │   ├── chrome-api.js
│   │   ├── feedbin-dom.js
│   │   └── feedbin-entries.js
│   └── fixtures/
│       ├── entries.json
│       └── settings.json
├── docs/
├── requirements/
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm init -y  # If package.json doesn't exist
npm install --save-dev jest @types/jest @types/chrome
npm install --save-dev jsdom  # For DOM testing
```

### 2. Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 3. Create Test Setup File

Create `tests/setup.js`:

```javascript
// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
};

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### 4. Add NPM Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

## Mock Strategies

### 1. Chrome API Mock (`tests/mocks/chrome-api.js`)

```javascript
export const mockChromeStorage = () => {
  const storage = new Map();

  return {
    get: jest.fn((keys, callback) => {
      const result = {};
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach(key => {
        if (storage.has(key)) {
          result[key] = storage.get(key);
        }
      });
      callback(result);
    }),
    set: jest.fn((items, callback) => {
      Object.entries(items).forEach(([key, value]) => {
        storage.set(key, value);
      });
      if (callback) callback();
    }),
    clear: () => storage.clear(),
  };
};

export const mockChromeRuntime = () => ({
  sendMessage: jest.fn((message, callback) => {
    // Simulate async response
    setTimeout(() => callback({ success: true }), 0);
  }),
  onMessage: {
    addListener: jest.fn(),
  },
});
```

### 2. Feedbin DOM Mock (`tests/mocks/feedbin-dom.js`)

```javascript
/**
 * Creates a mock Feedbin entry element
 * Based on real Feedbin DOM structure from docs/FEEDBIN_DOM_STRUCTURE.md
 */
export function createMockEntry({
  id = 123,
  feedId = 456,
  title = 'Test Article',
  author = 'Test Author',
  feedName = 'Test Feed',
  published = Date.now() / 1000,
  summary = 'This is a test summary',
  isRead = false,
  isStarred = false,
  url = 'https://example.com/article',
}) {
  const entry = document.createElement('li');
  entry.className = `entry-summary feed-id-${feedId}`;
  if (isRead) entry.classList.add('read');
  if (isStarred) entry.classList.add('starred');
  entry.setAttribute('data-entry-id', id);
  entry.setAttribute('data-behavior', 'keyboard_navigable');

  const entryInfo = { id, feed_id: feedId, published };

  entry.innerHTML = `
    <a class="entry-summary-link"
       data-behavior="selectable open_item show_entry_content entry_info"
       data-entry-info='${JSON.stringify(entryInfo)}'
       data-url="${url}">
      <div class="entry-summary-inner">
        <div class="entry-summary-content">
          <div class="entry-summary-title-wrap">
            <h2 class="entry-summary-title">${title}</h2>
          </div>
          <div class="entry-summary-meta">
            <span class="entry-summary-author">${author}</span>
            <span class="entry-summary-feed-name">${feedName}</span>
            <time datetime="${new Date(published * 1000).toISOString()}">
              ${new Date(published * 1000).toLocaleDateString()}
            </time>
          </div>
          <div class="entry-summary-excerpt">${summary}</div>
        </div>
      </div>
    </a>
  `;

  return entry;
}

/**
 * Creates a container with multiple mock entries
 */
export function createMockEntryList(entries) {
  const container = document.createElement('ul');
  container.className = 'entries';

  entries.forEach(entryConfig => {
    const entry = createMockEntry(entryConfig);
    container.appendChild(entry);
  });

  document.body.appendChild(container);
  return container;
}

/**
 * Creates a mock entry content view (article body)
 */
export function createMockEntryContent({
  id = 123,
  title = 'Test Article',
  body = '<p>Test body content</p>',
  url = 'https://example.com/article',
}) {
  const content = document.createElement('div');
  content.className = 'entry-content';
  content.setAttribute('data-entry-id', id);

  content.innerHTML = `
    <article>
      <header>
        <h1 class="entry-title">${title}</h1>
        <a href="${url}" class="entry-final-url">${url}</a>
      </header>
      <div class="entry-body">
        ${body}
      </div>
    </article>
  `;

  document.body.appendChild(content);
  return content;
}

/**
 * Cleanup function for tests
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
}
```

### 3. Test Fixtures (`tests/fixtures/entries.json`)

```json
{
  "duplicates": [
    {
      "id": 1,
      "feedId": 100,
      "title": "Breaking News: Important Event",
      "published": 1699000000,
      "summary": "Full detailed article with lots of information...",
      "body": "<p>Full detailed article with lots of information and context. This is the premium version with complete coverage.</p>"
    },
    {
      "id": 2,
      "feedId": 101,
      "title": "Breaking News: Important Event",
      "published": 1699000300,
      "summary": "Brief summary only...",
      "body": "<p>Brief summary only.</p>"
    }
  ],
  "normalEntries": [
    {
      "id": 3,
      "feedId": 100,
      "title": "Unique Article 1",
      "published": 1699001000,
      "summary": "This is a unique article",
      "body": "<p>This is a unique article with unique content.</p>"
    },
    {
      "id": 4,
      "feedId": 102,
      "title": "Unique Article 2",
      "published": 1699002000,
      "summary": "Another unique article",
      "body": "<p>Another unique article with different content.</p>"
    }
  ]
}
```

## Test Examples

### Unit Test: Duplicate Detection

Create `tests/unit/duplicates.test.js`:

```javascript
import { createMockEntry, createMockEntryList, cleanupDOM } from '../mocks/feedbin-dom.js';
import fixtures from '../fixtures/entries.json';

// Mock the duplicate detection module
// (We'll need to refactor content-script.js to export functions)
import { findDuplicates, shouldArchive, getEntryBody } from '../../src/duplicates.js';

describe('Duplicate Detection', () => {
  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('findDuplicates', () => {
    test('identifies duplicates by title and time proximity', () => {
      const entries = createMockEntryList(fixtures.duplicates);
      const duplicates = findDuplicates(entries);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0]).toHaveLength(2);
      expect(duplicates[0].map(e => e.dataset.entryId)).toContain('1');
      expect(duplicates[0].map(e => e.dataset.entryId)).toContain('2');
    });

    test('does not identify non-duplicates', () => {
      const entries = createMockEntryList(fixtures.normalEntries);
      const duplicates = findDuplicates(entries);

      expect(duplicates).toHaveLength(0);
    });

    test('handles entries with different titles', () => {
      const entries = createMockEntryList([
        { id: 1, title: 'Article A', published: 1699000000 },
        { id: 2, title: 'Article B', published: 1699000100 },
      ]);
      const duplicates = findDuplicates(entries);

      expect(duplicates).toHaveLength(0);
    });

    test('handles entries published more than 1 hour apart', () => {
      const entries = createMockEntryList([
        { id: 1, title: 'Same Title', published: 1699000000 },
        { id: 2, title: 'Same Title', published: 1699003700 }, // 1hr 1min later
      ]);
      const duplicates = findDuplicates(entries);

      expect(duplicates).toHaveLength(0);
    });

    test('groups multiple duplicates correctly', () => {
      const entries = createMockEntryList([
        { id: 1, title: 'News', published: 1699000000 },
        { id: 2, title: 'News', published: 1699000100 },
        { id: 3, title: 'News', published: 1699000200 },
      ]);
      const duplicates = findDuplicates(entries);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0]).toHaveLength(3);
    });
  });

  describe('shouldArchive', () => {
    test('archives entry with shorter body', () => {
      const entry1 = { body: 'Short', published: 1699000000 };
      const entry2 = { body: 'Much longer body content here', published: 1699000100 };

      const toArchive = shouldArchive([entry1, entry2]);

      expect(toArchive).toBe(entry1);
    });

    test('archives earlier entry when body lengths are equal', () => {
      const entry1 = { body: 'Same length', published: 1699000000 };
      const entry2 = { body: 'Same length', published: 1699000100 };

      const toArchive = shouldArchive([entry1, entry2]);

      expect(toArchive).toBe(entry1);
    });

    test('handles empty bodies', () => {
      const entry1 = { body: '', published: 1699000000 };
      const entry2 = { body: 'Has content', published: 1699000100 };

      const toArchive = shouldArchive([entry1, entry2]);

      expect(toArchive).toBe(entry1);
    });
  });

  describe('getEntryBody', () => {
    test('extracts body from entry content', () => {
      const entry = createMockEntry({
        id: 123,
        summary: 'Test summary',
      });

      // Mock fetching full entry content
      const body = getEntryBody(entry);

      expect(body).toBeTruthy();
    });

    test('returns empty string for entries without body', () => {
      const entry = createMockEntry({
        id: 123,
        summary: '',
      });

      const body = getEntryBody(entry);

      expect(body).toBe('');
    });
  });
});
```

### Unit Test: Storage Operations

Create `tests/unit/storage.test.js`:

```javascript
import { mockChromeStorage } from '../mocks/chrome-api.js';
import Storage from '../../src/storage.js';

describe('Storage', () => {
  let storage;

  beforeEach(() => {
    // Reset Chrome API mock
    global.chrome.storage.local = mockChromeStorage();
    global.chrome.storage.sync = mockChromeStorage();
    storage = new Storage();
  });

  test('saves and retrieves entry tags', async () => {
    await storage.saveEntryTags('123', ['tech', 'news']);
    const tags = await storage.getEntryTags('123');

    expect(tags).toEqual(['tech', 'news']);
  });

  test('saves and retrieves settings', async () => {
    const settings = {
      provider: 'ollama',
      autoClassify: true,
      maxAutoClassify: 10,
    };

    await storage.saveSettings(settings);
    const retrieved = await storage.getSettings();

    expect(retrieved).toEqual(settings);
  });

  test('handles missing data gracefully', async () => {
    const tags = await storage.getEntryTags('nonexistent');

    expect(tags).toEqual([]);
  });
});
```

### Integration Test: Duplicate Detection Flow

Create `tests/integration/duplicate-detection.test.js`:

```javascript
import { createMockEntryList, cleanupDOM } from '../mocks/feedbin-dom.js';
import { mockChromeStorage } from '../mocks/chrome-api.js';
import fixtures from '../fixtures/entries.json';

// Import the main module (once refactored to be testable)
// import { initDuplicateDetection } from '../../src/content-script.js';

describe('Duplicate Detection Integration', () => {
  beforeEach(() => {
    cleanupDOM();
    global.chrome.storage.local = mockChromeStorage();
    global.console.log = jest.fn();
  });

  afterEach(() => {
    cleanupDOM();
  });

  test('logs duplicates in dry-run mode', async () => {
    // Create DOM with duplicates
    createMockEntryList(fixtures.duplicates);

    // Initialize duplicate detection
    // initDuplicateDetection({ dryRun: true });

    // Wait for detection to run
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify logging
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[DRY-RUN] Would archive entry')
    );

    // Verify no entries were actually archived
    const readEntries = document.querySelectorAll('.entry.read');
    expect(readEntries).toHaveLength(0);
  });

  test('does not log when no duplicates found', async () => {
    // Create DOM with unique entries
    createMockEntryList(fixtures.normalEntries);

    // Initialize duplicate detection
    // initDuplicateDetection({ dryRun: true });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify no duplicate logging
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('[DRY-RUN] Would archive')
    );
  });
});
```

## Code Refactoring for Testability

To enable testing, we need to refactor the existing code to export testable functions. Here's how:

### Before (content-script.js)

```javascript
// Everything in one big IIFE
(function() {
  // ... lots of code ...

  function findDuplicates() {
    // implementation
  }

  // More code...
})();
```

### After (content-script.js)

```javascript
// Export testable functions
export function findDuplicates(container = document) {
  const entries = Array.from(container.querySelectorAll('.entry:not(.read)'));
  // ... implementation
  return duplicates;
}

export function shouldArchive(duplicateGroup) {
  // ... implementation
  return entryToArchive;
}

export function getEntryBody(entry) {
  // ... implementation
  return body;
}

// Main initialization (not exported, runs on page load)
function init() {
  // Use the exported functions
  const duplicates = findDuplicates();
  // ...
}

// Run init if not in test environment
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  init();
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (during development)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npm test -- duplicates.test.js
```

## Coverage Goals

- **Unit tests**: >80% coverage for core logic
- **Integration tests**: Cover main user flows
- **Critical paths**: 100% coverage for duplicate detection and archiving

## Continuous Integration

Add to GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: success()
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how
2. **Use descriptive test names**: `test('archives entry with shorter body', ...)`
3. **One assertion per test** (when possible)
4. **Cleanup after tests**: Use `beforeEach`/`afterEach`
5. **Mock external dependencies**: Chrome APIs, network requests, timers
6. **Test edge cases**: Empty values, nulls, large datasets
7. **Keep tests fast**: Avoid real network calls, use fake timers

## Next Steps

1. ✅ Set up Jest configuration
2. ✅ Create mock utilities
3. ✅ Write test fixtures
4. Refactor `content-script.js` to export testable functions
5. Write unit tests for duplicate detection
6. Write unit tests for classification
7. Write integration tests
8. Set up CI/CD pipeline
9. Achieve >80% code coverage

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_testing/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- Feedbin DOM structure: `docs/FEEDBIN_DOM_STRUCTURE.md`
- Mock generators: `docs/MOCK_GENERATORS.md`
