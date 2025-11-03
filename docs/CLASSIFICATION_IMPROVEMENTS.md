# Classification Improvements

## Recent Changes (Latest Session)

### 1. Full Article Content
- **Before:** Only using 300 chars of summary text from preview
- **After:** Fetching full article content from Feedbin API (`/v2/entries/{id}.json`)
- **Impact:** Now classifying based on up to 2000 chars of actual article body, not just summary

### 2. Feed Tags as Context
- **Added:** Feed-level tags are now passed to the LLM as context
- **Example:** If a feed is tagged "politics", entries from that feed will bias toward political classification
- **How it works:**
  - Fetches feed_id from entry data
  - Looks up feed tags from storage
  - Passes to LLM in prompt as "Feed Tags (for context)"

### 3. Enhanced Political Keywords
- **Added explicit examples:**
  - Trump administration, Biden administration
  - Congress, Supreme Court
  - Military policy, drone strikes
  - Executive orders, foreign policy
  - War powers, presidential actions
  - Congressional actions, Supreme Court decisions

### 4. Clearer Classification Rules
```
POLITICS = government/elections/policy/lawmakers/legislation/campaigns/
           administration/military policy/executive actions/government legal
           decisions/drone strikes/war powers/presidential actions/
           congressional actions/Supreme Court decisions

TECH = technology, software, cybersecurity, hacking, tech industry

Key Rules:
- Criminal cases involving hackers = "tech" NOT "politics"
- Military drone strikes, war powers = "politics"
- Government policy debates = "politics"
```

### 5. Comprehensive Logging
Now logs to browser console:
- Full entry data (title, feed, author)
- Whether we have full content vs summary
- Content lengths (raw HTML and processed text)
- Feed tags being used as context
- Complete prompt sent to Ollama
- Raw Ollama response
- Parsed tags and reasons
- Warnings when no tags returned

## How to Debug

1. **Reload extension:** `chrome://extensions` → Click reload
2. **Open Service Worker console:** Click blue "service worker" link
3. **Classify an entry:** Click classify button on any post
4. **Check console output:**
```
[Background] ===== CLASSIFICATION REQUEST =====
[Background] Feed Tags: ["politics"]
[LLM] ===== OLLAMA REQUEST =====
[LLM] Feed Tags (context): ["politics"]
[LLM] Has full content: true
[LLM] Content length (raw): 15000
[LLM] Full prompt: <entire prompt with 2000 chars of content>
[LLM] ===== OLLAMA RAW RESPONSE =====
[LLM] Response text: [{"tag":"politics","reason":"..."}]
```

## Files Modified

- `src/llm.js` - Prompt improvements, HTML stripping, feed tag context
- `src/content-script.js` - Fetch full entry content, lookup feed tags
- `src/background.js` - Pass feed tags through to LLM
- `debug_ollama.sh` - Helper script (optional, not needed for JS logging)
