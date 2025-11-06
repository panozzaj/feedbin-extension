# Feedbin Extension - Codebase Exploration Index

Complete exploration and implementation guides for the Feedbin Power Tools extension.

## Quick Navigation

### For First-Time Understanding

1. **START HERE**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min read)
   - Quick lookup tables for all key concepts
   - File locations and what they do
   - Key methods and data structures

2. **THEN READ**: [CODEBASE_EXPLORATION.md](CODEBASE_EXPLORATION.md) (20 min read)
   - Complete technical breakdown
   - All 5 core components explained
   - How everything works together
   - Feedbin API endpoints

3. **THEN PLAN**: [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) (15 min read)
   - Step-by-step implementation guides
   - Code examples for each feature
   - Testing strategies
   - Priority-ranked tasks

### For Specific Tasks

- **I want to understand the classify button** → CODEBASE_EXPLORATION.md - "Where the 'Classify' Button Lives"
- **I want to implement duplicates** → IMPLEMENTATION_ROADMAP.md - "Feature 1: Duplicate Post Detection"
- **I want to enable auto-classification** → IMPLEMENTATION_ROADMAP.md - "Feature 2: Automatic Classification"
- **I need a quick API reference** → QUICK_REFERENCE.md - "API Calls" or "Key Methods to Use"

---

## What Was Explored

### Architecture

- Content script (runs on feedbin.com)
- Popup UI (settings management)
- Background worker (service worker)
- LLM integration (Ollama/Claude/OpenAI)
- Storage layer (Chrome storage)
- All 5 components + how they communicate

### Current Features (Implemented ✅)

- Entry-level classification (individual articles)
- Smart filtering (show/hide by tags)
- LLM integration (3 providers)
- Tag management with explanations
- Full article content fetching
- Feed tags as context
- Badge showing active filters
- Real-time CSS filtering

### Missing Features (Not Implemented ❌)

- Duplicate post detection
- Mark as read (for duplicates)
- Auto-classification UI toggle (logic exists, needs UI)
- Background duplicate checking

### Data Structures

- Entry tags (what articles are tagged with)
- Active filters (what user selected)
- Feed tags (for context)
- Settings (LLM config)
- Credentials (Feedbin auth)

### APIs Used

- Feedbin `/v2/entries/{id}.json` (get/mark as read)
- Feedbin `/v2/subscriptions` (list feeds)
- Ollama `POST /api/generate`
- Claude API `POST /v1/messages`
- OpenAI API `POST /v1/chat/completions`

---

## Key Files Reference

### Source Code

```
src/
├── content-script.js (833 lines)
│   └─ Main UI, filtering, classification
├── llm.js (657 lines)
│   └─ LLM providers and prompts
├── background.js (128 lines)
│   └─ Service worker, API proxying
├── storage.js (210 lines)
│   └─ Chrome storage abstraction
├── popup.html/js (413 lines)
│   └─ Settings UI
└── styles.css
    └─ Extension styling
```

### Documentation (What You're Reading)

```
├── QUICK_REFERENCE.md (this folder)
│   └─ Lookup tables and quick reference
├── CODEBASE_EXPLORATION.md
│   └─ Complete technical documentation
├── IMPLEMENTATION_ROADMAP.md
│   └─ Step-by-step implementation guides
├── EXPLORATION_INDEX.md
│   └─ Navigation guide (this file)
└── README.md (existing)
    └─ User-facing documentation
```

---

## Where to Find Things

### Understanding Posts/Entries

- How they're fetched: CODEBASE_EXPLORATION.md - Content Script section
- How they're classified: CODEBASE_EXPLORATION.md - LLM Integration section
- Data structure: QUICK_REFERENCE.md - Entry Data Available
- DOM selectors: CODEBASE_EXPLORATION.md - Important Notes for Implementation

### Understanding Filtering

- How filters work: CODEBASE_EXPLORATION.md - Key Data Flows
- Filter logic: QUICK_REFERENCE.md - Classification Pipeline
- Filter UI: CODEBASE_EXPLORATION.md - Content Script section

### Understanding Classification

- How it works: CODEBASE_EXPLORATION.md - Entry Classification Flow
- LLM prompts: llm.js lines 59-144
- Tag parsing: llm.js lines 502-584
- Response validation: content-script.js lines 722-749

### Understanding Marking as Read

- NOT CURRENTLY IMPLEMENTED
- API endpoint: QUICK_REFERENCE.md - API Calls
- Implementation guide: IMPLEMENTATION_ROADMAP.md - Feature 1, Step 2

### Understanding Duplicate Detection

- NOT CURRENTLY IMPLEMENTED
- Implementation guide: IMPLEMENTATION_ROADMAP.md - Feature 1, Steps 1-4
- Example code: IMPLEMENTATION_ROADMAP.md - Feature 1

### Understanding Auto-Classification

- Partially implemented (logic exists, UI missing)
- Enable guide: IMPLEMENTATION_ROADMAP.md - Feature 2
- Current code: content-script.js lines 41-43, 502-511
- UI additions needed: popup.html and popup.js

---

## Implementation Priorities

### Quick Wins (Do This First)

1. Add auto-classify toggle to popup
   - 20 lines of code
   - Logic already works
   - 2-3 hours including testing

### Medium Effort (Do This Next)

2. Implement mark-as-read API calls
   - 30 lines in background.js
   - Foundation for duplicate detection
   - 4-6 hours including testing

### Complex (Do This Last)

3. Implement duplicate detection
   - 80-100 lines across files
   - Highest value feature
   - 6-8 hours including testing

---

## Testing Checklist

Before starting implementation:

- [ ] Load extension in chrome://extensions
- [ ] See toolbar on feedbin.com
- [ ] Click "Classify Visible" and verify classification works
- [ ] Check Service Worker logs for errors

For each feature implemented:

- [ ] Test with test data
- [ ] Check console for errors
- [ ] Verify Service Worker logs
- [ ] Test with actual Feedbin account
- [ ] Check data persists after reload

---

## Documentation Quality

### QUICK_REFERENCE.md

- **Purpose**: Quick lookup, not a guide
- **Best for**: "Where is X?" questions
- **Length**: ~5 KB
- **Reading time**: 5 minutes

### CODEBASE_EXPLORATION.md

- **Purpose**: Complete technical reference
- **Best for**: Understanding how things work
- **Length**: ~16 KB
- **Reading time**: 20 minutes

### IMPLEMENTATION_ROADMAP.md

- **Purpose**: Step-by-step implementation guides
- **Best for**: Building features
- **Length**: ~9.5 KB
- **Reading time**: 15 minutes

### EXPLORATION_INDEX.md

- **Purpose**: Navigation and overview (this file)
- **Best for**: Knowing what you need to read
- **Length**: ~3 KB
- **Reading time**: 5 minutes

---

## Key Takeaways

1. **Entry classification already works** - You can classify individual articles
2. **Filtering already works** - You can show/hide by tags
3. **Three LLMs supported** - Ollama (free), Claude (paid), OpenAI (paid)
4. **Auto-classification logic exists** - Just needs UI toggle
5. **Duplicate detection doesn't exist** - Would be valuable feature
6. **Mark-as-read doesn't exist** - Needed for duplicate handling

---

## Common Questions

**Q: How do I enable auto-classification?**
A: The logic exists but UI is missing. Follow IMPLEMENTATION_ROADMAP.md - Feature 2

**Q: How do I detect duplicates?**
A: Not implemented yet. Follow IMPLEMENTATION_ROADMAP.md - Feature 1

**Q: How do I mark entries as read?**
A: Not implemented yet. Follow IMPLEMENTATION_ROADMAP.md - Feature 1, Step 2

**Q: How does classification work?**
A: Read CODEBASE_EXPLORATION.md - Classification Flow section

**Q: How do I debug?**
A: Check console (F12) and Service Worker logs (chrome://extensions)

**Q: Where's the "Classify" button?**
A: Two places: toolbar in sidebar AND per-entry. See CODEBASE_EXPLORATION.md

**Q: How are entries filtered?**
A: CSS display:none on the DOM. See QUICK_REFERENCE.md - Filtering Flow

---

## Generated Files

Created during exploration:

- QUICK_REFERENCE.md (2025-11-04 10:19)
- CODEBASE_EXPLORATION.md (2025-11-04 10:18)
- IMPLEMENTATION_ROADMAP.md (2025-11-04 10:19)
- EXPLORATION_INDEX.md (this file)

---

## Next Steps

1. Read QUICK_REFERENCE.md (5 min)
2. Read CODEBASE_EXPLORATION.md (20 min)
3. Read IMPLEMENTATION_ROADMAP.md (15 min)
4. Start implementing from priority list
5. Use QUICK_REFERENCE.md for quick lookups during coding

---

**Created**: November 4, 2025
**Status**: Complete exploration and documentation
**Ready for**: Implementation of duplicate detection and auto-classification features
