# Feedbin Extension Requirements

## 1. Duplicate Post Detection and Archiving

### Goal
Automatically detect and archive duplicate unread posts to reduce inbox clutter.

### Duplicate Criteria
Two posts are considered duplicates if:
1. **Title similarity**: Titles match (case-insensitive, whitespace-normalized)
2. **Time proximity**: Published within 1 hour of each other

### Archive Priority (which one to mark as read)
When duplicates are found, mark the **least helpful** one as read, determined by:
1. **Primary criterion**: Body text length - shorter body = less helpful
2. **Secondary criterion**: Publication time - earlier published = less helpful (if body lengths are similar)

### Implementation Phases

#### Phase 1: Dry-Run Mode (Logging Only) ⚠️
**IMPORTANT**: Start with logging only - do NOT actually archive anything yet.

- Detect duplicates on page load and during periodic checks
- Log to console what WOULD be archived:
  - Entry IDs
  - Titles
  - Body lengths
  - Publication times
  - Decision rationale
- Format: `[DRY-RUN] Would archive entry ${id}: "${title}" (${bodyLength} chars, published ${time}) - ${reason}`

#### Phase 2: Manual Trigger
- Add UI button to execute archiving based on dry-run logs
- Require explicit user confirmation

#### Phase 3: Automatic Archiving
- Only enable after Phase 1 validation proves accurate
- Add user setting to enable/disable
- Continue logging all actions

### Technical Details
- Use Feedbin API: `PUT /v2/entries/${id}.json` with `{"entry": {"read": true}}`
- Check only unread entries (`.entries .entry:not(.read)`)
- Run detection:
  - On page load
  - After new entries are added to DOM
  - Periodically (e.g., every 60 seconds if page visible)

---

## 2. Background/Automatic Classification

### Goal
Classify posts automatically in the background to reduce need for manual "Classify" button presses.

### Current State
- Classification logic exists and works
- Manual "Classify" button in settings panel
- No automatic triggering

### Requirements

#### Auto-Classify Trigger Conditions
Classify unread, unclassified entries when:
1. **On page load**: After entries are rendered
2. **On new entries**: When DOM observer detects new `.entry` elements
3. **Debounced**: Wait 2-3 seconds after last DOM change to avoid over-triggering
4. **Respect limits**: Don't auto-classify more than N entries at once (configurable, default: 10)

#### User Controls
- Settings toggle: "Auto-classify new entries" (default: off for safety)
- Settings input: "Max entries to auto-classify" (default: 10)
- Manual "Classify All" button remains for bulk operations
- Visual feedback: Show "Auto-classifying..." indicator

#### Behavior
- Only classify unread entries without existing tags
- Use same LLM provider and settings as manual classification
- Maintain rate limiting to avoid API quota issues
- Log auto-classification actions to console
- Store setting in `chrome.storage.sync`

---

## 3. Development Practices

### Dry-Run First Principle
For any feature that modifies data (marks as read, updates tags, etc.):
1. **Always** implement logging/dry-run mode first
2. Test thoroughly with dry-run before enabling actual mutations
3. Document what would happen before making it happen
4. Provide easy way to review dry-run logs

### Documentation
- Keep all documentation in `docs/` folder
- Update docs when adding new features
- Include code examples in documentation

### Testing
- Add unit tests for new features
- Mock Feedbin DOM structure for testing
- Test edge cases (empty bodies, identical timestamps, etc.)

---

## Future Enhancements

### Duplicate Detection
- Fuzzy title matching (handle slight variations)
- Cross-feed duplicate detection
- User-configurable similarity threshold
- Duplicate "clustering" (3+ similar posts)

### Classification
- Batch classification API for efficiency
- Smart scheduling (classify during idle time)
- Learning from user corrections
- Per-feed classification rules

### General
- Export/import settings
- Classification analytics
- Undo functionality for archiving
