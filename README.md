# Feedbin Power Tools

A Chrome extension that enhances Feedbin with powerful **entry-level** filtering and LLM-powered classification.

## 🎯 Key Features

- **🏷️ Entry-Level Tagging**: Classify individual posts/articles (not just whole feeds)
- **🤖 LLM-Powered Auto-Tagging**: Use AI to categorize entries based on content
- **⚡ Smart Filtering**: Show/hide entries in Unread based on tags
- **🔄 Multiple LLM Providers**: Support for local (Ollama) and cloud (Claude, OpenAI) models
- **💾 Persistent Tags**: Once classified, entries stay classified (no reclassification needed)
- **🚀 Works with Production**: No modifications to Feedbin needed

## Why Entry-Level?

**Problem**: A blog might post about **both** tech and sports. If you tag the entire feed as "tech", you'll see sports posts when filtering for tech.

**Solution**: Tag **individual entries**. Now you can:
- See only tech posts from any feed
- Hide all politics posts, regardless of source
- Mix and match tags for perfect filtering

## Quick Start

### 1. Install Ollama (Local LLM - Recommended)

```bash
brew install ollama
ollama serve
ollama pull llama3.2
```

### 2. Load Extension

1. Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

### 3. Configure

1. Click extension icon (⚡)
2. Enter Feedbin credentials
3. Verify "Local (Ollama)" is selected
4. Click "Save Settings"

### 4. Use It!

1. Go to feedbin.com/unread
2. Click "🤖 Classify Visible" in the Power Tools toolbar
3. Wait for classification (~1-2 sec per entry)
4. Click tags to filter!

## How It Works

### Classification

```
Entry: "Anthropic Releases Claude 4"
Feed: TechCrunch
Summary: "New AI model with improved reasoning..."

        ↓ LLM analyzes

Tags: tech, ai
```

### Filtering

```
User clicks "tech" under "Show only"
  ↓
Extension checks each entry's tags
  ↓
Shows entries with "tech" tag
Hides everything else
  ↓
Result: Tech-only feed view
```

## Usage Workflows

### Daily Reading Routine

1. Open Unread
2. Click "🤖 Classify Visible"
3. Click "tech" to see only tech
4. Read tech articles
5. Click "business" to see only business
6. Read business articles
7. Clear filters, mark all as read

### Hide Distractions

1. Click "🤖 Classify Visible"
2. Click "politics" under "Hide"
3. Result: Politics-free reading experience

### Mixed Filtering

- **Show only**: tech, science
- **Hide**: sports
- **Result**: Tech and science, but no sports

## Features

### On Feedbin Pages

- **Toolbar**: Injected at top of Unread/Starred/etc.
- **Classify Button**: Classifies visible entries
- **Filter Pills**: Click to show/hide by tag
- **Tag Indicators**: Shows tags next to entry titles
- **Status Messages**: Shows progress during classification

### In Popup

- **Settings**: Configure LLM provider and API keys
- **Feed Tags** (Optional): Bootstrap tags by classifying entire feeds
- **Export/Import**: Backup your tag data
- **Connection Test**: Verify LLM is working

## Settings

### LLM Providers

**Local (Ollama)**:
- ✅ Free, unlimited
- ✅ 100% private (nothing leaves your computer)
- ✅ Works offline
- ⚠️  Requires local installation
- ⚠️  Slower on low-end hardware

**Claude (Anthropic)**:
- ✅ Excellent quality
- ✅ Fast
- ⚠️  Requires API key
- ⚠️  Costs ~$0.005 per entry

**OpenAI**:
- ✅ Good quality
- ✅ Fast
- ⚠️  Requires API key
- ⚠️  Costs ~$0.001 per entry

### Auto-Classify

Enable in settings to automatically classify new entries as they load. Useful for keeping your Unread feed continuously classified.

## Data Storage

### What's Stored

```javascript
{
  entryTags: {
    "12345": { tags: ["tech", "ai"], updatedAt: 1234567890 },
    "12346": { tags: ["politics"], updatedAt: 1234567890 }
  },
  activeFilters: {
    includeTags: ["tech"],
    excludeTags: ["politics"]
  },
  settings: { /* LLM config */ },
  credentials: { /* Feedbin auth */ }
}
```

### Storage Management

- **Unread entries**: Kept forever (avoid reclassification)
- **Read entries**: Pruned after 30 days
- **Export**: Backup to JSON anytime
- **Import**: Restore from backup

## Architecture

### Entry-Level Design

```
1. User browses Unread
2. Clicks "Classify Visible"
3. Extension:
   - Reads entry titles/summaries from DOM
   - Sends to LLM for classification
   - Saves tags in Chrome storage
   - Adds tag indicators to UI
4. User clicks tag filters
5. Extension:
   - Checks each entry's tags
   - Shows/hides via CSS display property
```

### Files

```
feedbin-extension/
├── manifest.json           # Extension config
├── src/
│   ├── content-script.js  # Runs on feedbin.com
│   ├── popup.html/js     # Settings UI
│   ├── background.js     # Service worker
│   ├── storage.js        # Chrome storage API
│   ├── llm.js           # LLM integration
│   └── styles.css       # Custom styles
└── icons/               # Extension icons
```

## Privacy

### With Local LLM (Ollama)

- **100% private**: Nothing leaves your computer
- Entry data never sent to cloud
- No tracking, no telemetry

### With Cloud APIs

- Entry titles/summaries sent to Claude/OpenAI
- Only during classification
- Credentials stored locally only
- No other data leaves your browser

## Troubleshooting

### "Cannot connect to Ollama"

```bash
# Check if running
curl http://localhost:11434/api/tags

# Start if needed
ollama serve
```

### "Authentication failed"

- Verify credentials at feedbin.com
- Re-enter in extension popup
- Check browser console for errors

### "No entries to classify"

- Make sure you're on a page with entries
- Check if entries already have tags
- Try refreshing the page

### Classification too slow

- **Ollama**: First run downloads model (one-time)
- **Cloud APIs**: May have rate limits
- **Solution**: Classify in smaller batches

## Development

### Testing Locally

1. Make code changes
2. Go to `chrome://extensions/`
3. Click reload icon for extension
4. Refresh feedbin.com
5. Test changes

### Adding LLM Providers

See `src/llm.js` - implement:
- `classifyEntryWith{Provider}()`
- Add settings UI in `popup.html`
- Update `testConnection()`

## Limitations

- **Chrome only**: Uses Chrome Extensions API (not Firefox compatible yet)
- **Feedbin-specific**: Tightly coupled to Feedbin's DOM structure
- **Client-side filtering**: Hidden entries still load, just CSS hidden
- **Local storage only**: No cross-device sync (can export/import)

## Roadmap

- [ ] Batch classification API calls (faster processing)
- [ ] Custom filter rules (regex, keywords, date ranges)
- [ ] Keyboard shortcuts for quick filtering
- [ ] Reading analytics (time spent per category)
- [ ] Firefox support
- [ ] Optional cloud sync

## FAQ

**Q: Why not classify feeds instead of entries?**
A: Feeds can cover multiple topics. A personal blog might have tech AND politics posts. Entry-level tagging gives you granular control.

**Q: Do I need to reclassify entries every time?**
A: No! Once classified, tags are saved. Unread entries stay classified forever.

**Q: How much does it cost with cloud APIs?**
A: Claude: ~$0.005/entry, OpenAI: ~$0.001/entry. Ollama is free.

**Q: Can I use my own tags?**
A: Yes, add custom tags in popup. LLM will try to reuse existing tags for consistency.

**Q: Does this modify Feedbin's servers?**
A: No! All filtering is client-side via DOM manipulation. Uses Feedbin's public API only.

## Contributing

Pull requests welcome! Key areas:

- Performance optimizations
- Additional LLM providers
- Firefox compatibility
- Better UI/UX
- Bug fixes

## License

MIT License - See LICENSE file

## Credits

Built to enhance [Feedbin](https://feedbin.com) without requiring server changes.

LLM support:
- [Ollama](https://ollama.ai) - Local LLM runtime
- [Anthropic Claude](https://anthropic.com) - Cloud LLM
- [OpenAI](https://openai.com) - Cloud LLM
