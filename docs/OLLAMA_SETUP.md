# Ollama Setup

## Your Current Models

You have these Ollama models installed:

- `gemma3:4b` ← Recommended (good quality, fast)
- `gemma3:1b` (smaller, faster but less accurate)

## Configuration

1. **In the extension popup**:
   - LLM Provider: "Local (Ollama)" ✓
   - Ollama URL: `http://localhost:11434` ✓
   - Model: `gemma3:4b` ← Use this!
   - Click "Save Settings"

2. **Should see**: "✓ Settings saved! Connected to Ollama"

## Test It

1. Go to feedbin.com/unread
2. Click "🤖 Classify Visible"
3. Entries should start getting classified

## Other Models

If you want to try other models:

```bash
# Fast and good quality
ollama pull llama3.2

# Best quality (larger, slower)
ollama pull llama3.1:8b

# Very fast (less accurate)
ollama pull phi3:mini
```

Then update the "Model" field in settings to match.

## Troubleshooting

**"Cannot connect to Ollama"**:

```bash
# Check if running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

**Classification not working**:

- Check browser console (F12) for errors
- Make sure model name matches exactly: `gemma3:4b`
- Try with a single entry first
