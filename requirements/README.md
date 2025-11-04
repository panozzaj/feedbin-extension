# Feedbin Power Tools - Requirements & Future Projects

This folder tracks upcoming features, explorations, and requirements.

## Current Projects

### 🔬 [Faster Classification](faster-classification.md)
**Status:** Research phase
**Goal:** Classify articles 50-100x faster using embeddings instead of full LLM
**Approach:** Use sentence transformers (embeddings) with cosine similarity
**Expected:** < 100ms per article vs current 2-5 seconds

## v1 Complete ✅

- ✅ Entry-level classification (not feed-level)
- ✅ Individual classify buttons per entry
- ✅ Full article content fetching from Feedbin API
- ✅ Feed tags as context for classification
- ✅ Individual tag reasons with hover tooltips
- ✅ Tag removal with × buttons
- ✅ Concurrent batch classification (5 at once)
- ✅ Comprehensive debugging logs
- ✅ Enhanced political keywords (drone strikes, administrations, etc.)
- ✅ Multi-tag support (health + science)
- ✅ Duplicate tag filtering
- ✅ Proper PNG icons

## Future Ideas

- Better tag management UI
- Export/import classifications
- Search within tagged entries
- Tag statistics/analytics
- Keyboard shortcuts
- Custom tag colors
- Save filter presets
