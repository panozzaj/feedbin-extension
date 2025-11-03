# Quick Start Guide - Entry-Level Classification

## 5-Minute Setup

### 1. Install Extension (1 min)

```bash
cd /Users/anthony/Documents/dev/feedbin-extension
```

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `feedbin-extension` folder

### 2. Setup Local LLM (2 min)

**Recommended: Ollama (Free, Private, Unlimited)**

```bash
# Install Ollama
brew install ollama

# Start Ollama (runs in background)
ollama serve

# In a new terminal, pull a model
ollama pull llama3.2
```

### 3. Configure Extension (2 min)

1. Click the extension icon (⚡) in Chrome toolbar
2. **Authenticate**:
   - Enter your Feedbin email and password
   - Click "Connect to Feedbin"
3. **Configure LLM**:
   - Provider: "Local (Ollama)" (already selected)
   - URL: `http://localhost:11434` (already filled)
   - Click "Save Settings"
   - Wait for "✓ Connected to Ollama" message

### 4. Use the Extension

1. Go to feedbin.com/unread
2. See the "⚡ Power Tools" toolbar at the top
3. Click "🤖 Classify Visible" to classify entries you can see
4. Wait while entries are classified (shows progress)
5. Filter by clicking tags!

## How It Works

### Entry-Level Classification

The extension classifies **individual posts/entries**, not entire feeds. This is better because:

- A blog might post about both tech AND politics
- You can see only the tech posts, hide the politics
- More granular control

### Workflow

**Step 1: Classify Entries**
1. Browse your Unread feed
2. Click "🤖 Classify Visible"
3. The LLM analyzes each entry's title and summary
4. Tags appear next to entry titles

**Step 2: Filter**
1. Click a tag under "Show only" → see ONLY that topic
2. Click a tag under "Hide" → hide that topic
3. Mix and match for perfect filtering

## Example Use Cases

**Focus Mode - Tech Only:**
1. Go to Unread
2. Click "🤖 Classify Visible"
3. Click "tech" under "Show only"
4. Result: Only tech posts visible

**Distraction-Free - Hide Politics:**
1. Click "🤖 Classify Visible"
2. Click "politics" under "Hide"
3. Result: Political content hidden

**Mixed Filtering:**
1. Show only: tech, science
2. Hide: politics
3. Result: Tech and science visible, politics hidden

## Tips

- **Classify as you browse**: Click "Classify Visible" on each Feedbin page
- **Tags persist**: Once classified, entries stay classified (saved locally)
- **Unread entries kept**: Only read entries older than 30 days are pruned
- **Auto-classify**: Enable in settings to classify automatically as entries load

## Optional: Feed-Level Bootstrap

You can optionally tag entire feeds to seed your tags:

1. Open extension popup
2. Scroll to "Feed Tags" section
3. Click "🤖 Auto-Tag All Feeds"
4. **Review the proposed tags**
5. Confirm or cancel

This helps establish consistent tag categories, but entry-level tags are what actually matter for filtering.

## Alternative: Cloud LLM

If you prefer not to install Ollama:

**Claude** (Best quality):
1. Get API key: https://console.anthropic.com
2. Extension → Settings → Provider: "Claude"
3. Enter API key → Save

**OpenAI** (Also good):
1. Get API key: https://platform.openai.com
2. Extension → Settings → Provider: "OpenAI"
3. Enter API key → Save

**Note**: Cloud APIs cost money per request (~$0.001-0.01 per entry). Ollama is free and unlimited.

## Troubleshooting

**"Cannot connect to Ollama"**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

**"No entries to classify"**
- Make sure you're on a page with entries (Unread, Starred, etc.)
- Entries may already be classified - check for tags next to titles

**Filters not appearing**
- Refresh the feedbin.com page
- Click "Classify Visible" first to create some tags
- Open browser console (F12) and look for errors

**Classification too slow**
- Local LLM (Ollama): First run downloads model, subsequent runs are faster
- Cloud APIs: May have rate limits
- Classify in smaller batches (scroll less, classify what's visible)

## Next Steps

- Classify entries as you browse
- Build up your tag collection
- Create custom filtering workflows
- Export your tags for backup
- Enjoy a more focused reading experience!
