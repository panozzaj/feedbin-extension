# Architecture Overview

## High-Level Design

The extension works entirely client-side, with no modifications needed to Feedbin's servers. It uses:

1. **Content Script**: Injected into feedbin.com pages to add filtering UI
2. **Popup**: Management interface for tagging feeds and configuring settings
3. **Background Worker**: Service worker for badge updates and message handling
4. **Chrome Storage**: Local storage for tags, filters, and settings
5. **Feedbin API**: Standard REST API for fetching feeds and entries
6. **LLM APIs**: Ollama/Claude/OpenAI for automatic classification

## Data Flow

```
┌─────────────────┐
│  Feedbin.com    │
│  (Production)   │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐      ┌──────────────┐
│   Extension     │◄────►│ LLM Provider │
│   Background    │      │ (Ollama/etc) │
└────────┬────────┘      └──────────────┘
         │
         │ Chrome Messages
         ▼
┌─────────────────┐      ┌──────────────┐
│  Content Script │◄────►│ Chrome       │
│  (Filter UI)    │      │ Storage      │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Popup UI      │
│  (Management)   │
└─────────────────┘
```

## Components

### 1. Content Script (content-script.js)

**Purpose**: Enhance Feedbin's UI with filtering capabilities

**Responsibilities**:
- Wait for Feedbin to load
- Inject filter toolbar into the page
- Read feed IDs from entry DOM elements
- Apply show/hide filters based on feed tags
- Add visual tag indicators to entries
- Listen for storage changes to update filters in real-time

**Key Methods**:
- `init()` - Initialize and inject UI
- `injectFilterUI()` - Add toolbar to page
- `applyFilters()` - Show/hide entries based on active filters
- `shouldShowEntry(feedId)` - Determine if entry should be visible
- `observeEntries()` - Watch for dynamically loaded content

**DOM Integration**:
- Targets: `.entries-column`, `.entry-summary`
- Extracts feed ID from: `.entry-feed-{id}` class or feed title matching
- Injects toolbar before: `.entries-header`

### 2. Popup (popup.html + popup.js)

**Purpose**: Management interface for tagging and settings

**Responsibilities**:
- Authenticate with Feedbin
- Fetch user's feed subscriptions
- Configure LLM provider and API keys
- Manual and automatic feed tagging
- Export/import tag configurations
- Display all tags and manage them

**Key Methods**:
- `authenticate()` - Verify Feedbin credentials
- `loadFeeds()` - Fetch subscriptions from Feedbin API
- `autoTagFeed(feedId)` - Use LLM to classify single feed
- `autoTagAllFeeds()` - Batch classify all feeds
- `editFeedTags(feedId)` - Manual tag editing
- `exportTags()` / `importTags()` - Backup/restore

**API Integration**:
- `GET /v2/subscriptions` - List feeds
- `GET /v2/entries?per_page=100` - Recent entries for context
- Uses HTTP Basic Auth with user credentials

### 3. LLM Integration (llm.js)

**Purpose**: Unified interface for multiple LLM providers

**Responsibilities**:
- Build classification prompts with feed context
- Call appropriate LLM API based on settings
- Parse and normalize LLM responses
- Test connectivity to LLM providers

**Providers**:

#### Ollama (Local)
- Endpoint: `http://localhost:11434/api/generate`
- Model: `llama3.2` (configurable)
- Pros: Free, private, unlimited, no API key
- Cons: Requires local installation, slower on low-end hardware

#### Claude (Anthropic)
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-3-5-sonnet-20241022`
- Pros: Excellent quality, fast
- Cons: Requires API key, costs per request

#### OpenAI
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini`
- Pros: Good quality, widely available
- Cons: Requires API key, costs per request

**Classification Prompt Template**:
```
You are helping classify RSS feeds into categories.

Feed Information:
- Title: {feed_title}
- URL: {feed_url}

Recent Article Titles:
1. {article_1}
2. {article_2}
...

Existing tags in use: {existing_tags}

Suggest 1-3 tags that best categorize this feed.
Respond with ONLY comma-separated tags.
```

**Tag Parsing**:
- Extracts comma/semicolon separated values
- Normalizes to lowercase
- Filters invalid characters
- Limits to 5 tags max

### 4. Storage Layer (storage.js)

**Purpose**: Abstraction over Chrome Storage API

**Schema**:

```javascript
{
  // Feed ID → Tag data
  feedTags: {
    "12345": {
      tags: ["tech", "ai"],
      updatedAt: 1699999999999
    },
    "67890": {
      tags: ["politics", "news"],
      updatedAt: 1699999999999
    }
  },

  // Currently active filters
  activeFilters: {
    includeTags: ["tech"],    // Show only these
    excludeTags: ["politics"] // Hide these
  },

  // LLM settings
  settings: {
    llmProvider: "local",
    localLlmUrl: "http://localhost:11434",
    claudeApiKey: "",
    openaiApiKey: ""
  },

  // Feedbin credentials
  credentials: {
    email: "user@example.com",
    password: "password",
    pageToken: ""  // Not currently used
  }
}
```

**Key Methods**:
- `getFeedTags()` - All feed tag mappings
- `setFeedTags(feedId, tags)` - Update tags for a feed
- `getAllTags()` - Unique list of all tags
- `getActiveFilters()` / `setActiveFilters()` - Filter state
- `getSettings()` / `setSettings()` - LLM configuration
- `getCredentials()` / `setCredentials()` - Feedbin auth

### 5. Background Worker (background.js)

**Purpose**: Service worker for background tasks

**Responsibilities**:
- Handle cross-component messages
- Update extension badge with filter count
- Proxy API requests if needed (CORS)
- Initialize on install

**Badge Updates**:
- Shows count of active filters (include + exclude)
- Updates when filters change
- Blue badge (#3b82f6) when active

## Security Considerations

### Credentials Storage
- Feedbin email/password stored in Chrome's local storage
- Only sent to Feedbin's official API (api.feedbin.com)
- Never transmitted elsewhere
- Uses HTTPS for all API calls

### API Keys
- LLM API keys stored locally
- Only sent to respective provider APIs
- User can use local LLM (Ollama) to avoid cloud providers
- No telemetry or analytics

### Content Script Injection
- Only runs on feedbin.com domain
- Read-only access to page content
- Does not modify Feedbin's data on server
- All filtering is client-side (DOM manipulation)

## Performance Optimizations

### DOM Mutations
- Debounced filter application (100ms)
- MutationObserver for dynamic content
- Efficient querySelector caching

### API Calls
- Batch fetch recent entries (100 at a time)
- Cache feed metadata from `window.feedbin.data`
- Rate limiting for bulk LLM classification (500ms between calls)

### Storage
- Local storage only (no sync overhead)
- Minimal data stored (just tags and settings)
- No entry content stored, only feed-level metadata

## Feedbin API Integration

### Authentication
```javascript
// HTTP Basic Auth
const authHeader = 'Basic ' + btoa(email + ':' + password);
```

### Endpoints Used

```
GET  /v2/subscriptions
     → List user's feed subscriptions
     Response: [{ feed_id, title, site_url, ... }]

GET  /v2/entries?per_page=100
     → Get recent entries for context
     Response: [{ id, feed_id, title, ... }]
```

### Feed ID Extraction

From entry DOM:
1. **CSS Class**: `.entry-feed-{feed_id}`
2. **Feed Title Matching**: `.feed-title` text → cached feed metadata
3. **Global Data**: `window.feedbin.entries[entry_id].feed_id`

## Extensibility

### Adding New LLM Providers

1. Add provider option to `settings.llmProvider`
2. Implement `classifyWith{Provider}()` in `llm.js`
3. Add settings UI fields in `popup.html`
4. Update `testConnection()` for new provider

### Adding New Filter Types

Current: Include/Exclude by tag

Future possibilities:
- Regex matching on titles
- Date range filters
- Read/unread status
- Keyword highlighting
- Custom feed groups

Implementation:
1. Add filter fields to `activeFilters` in storage.js
2. Update `shouldShowEntry()` logic in content-script.js
3. Add UI controls in `injectFilterUI()`

### Entry-Level Classification

Current: Feed-level only

To add entry-level:
1. Store `entryTags` in addition to `feedTags`
2. Fetch full entry content for classification
3. Update `shouldShowEntry()` to check entry tags
4. Add entry-level UI (buttons on each entry)

## Limitations

### Current Constraints

1. **Feed-level only**: Classifies entire feeds, not individual entries
2. **Client-side filtering**: Hidden entries still load, just CSS hidden
3. **No server sync**: Tags only stored locally, no cross-device sync
4. **Feedbin-specific**: Tightly coupled to Feedbin's DOM structure
5. **Chrome only**: Uses Chrome Extensions API (not Firefox compatible)

### Potential Issues

1. **DOM Changes**: If Feedbin changes HTML structure, selectors may break
2. **Performance**: Large feed lists (1000+) may be slow to classify
3. **Rate Limits**: Cloud LLM APIs have request limits
4. **Feed ID Detection**: May fail on some entry types (tweets, microposts)

## Testing Strategy

### Manual Testing Checklist

- [ ] Load extension in Chrome
- [ ] Authenticate with Feedbin
- [ ] Configure LLM provider
- [ ] Auto-tag all feeds
- [ ] Manually edit feed tags
- [ ] Apply include filters
- [ ] Apply exclude filters
- [ ] Clear all filters
- [ ] Export tags
- [ ] Import tags
- [ ] Test on Unread view
- [ ] Test on Starred view
- [ ] Test on individual feed view
- [ ] Verify filters persist after page reload
- [ ] Check badge count updates

### Edge Cases

- Empty feed list
- Feeds with no recent entries
- Very long feed titles
- Special characters in tags
- Multiple rapid filter changes
- Browser restart with active filters
- Invalid LLM API keys
- Ollama not running
- Network timeout during classification

## Future Enhancements

### Planned Features

1. **Smart Suggestions**: "You might want to tag X as Y"
2. **Reading Analytics**: Track reading time by category
3. **Scheduled Filters**: "Hide politics on weekends"
4. **Keyboard Shortcuts**: Quick filter toggles
5. **Entry-Level Classification**: Tag individual articles
6. **Custom Filter Rules**: Complex boolean logic
7. **Visual Themes**: Different color schemes
8. **Cross-Browser Support**: Firefox, Safari
9. **Optional Cloud Sync**: Sync tags across devices
10. **Bulk Actions**: Mark category as read, star all, etc.

### Technical Debt

- Replace placeholder icons with proper SVG→PNG conversion
- Add comprehensive error handling and retry logic
- Implement telemetry (opt-in) for debugging
- Add unit tests for core functions
- Create E2E tests with Puppeteer
- Optimize bundle size (currently vanilla JS, no bundler)
- Add TypeScript for better type safety
- Implement proper logging framework

## Contributing

### Code Style

- Use ES6+ features
- Async/await for promises
- Clear function names (verb-noun pattern)
- JSDoc comments for public APIs
- 2-space indentation

### Pull Request Process

1. Test locally with multiple LLM providers
2. Verify no console errors
3. Check performance on large feed lists
4. Update README if adding features
5. Add to ARCHITECTURE.md if changing structure

## License

MIT - See LICENSE file
