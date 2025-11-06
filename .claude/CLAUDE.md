# Feedbin Extension - Project Instructions

## Project Structure
- **Documentation**: Keep all docs in `docs/` folder (use lowercase filenames)
- **Requirements**: Keep all requirements in `requirements/` folder
- **Temporary files**: Use `./tmp` for any temporary scripts or files

## Development Practices

### Dry-Run First ⚠️
For ANY feature that modifies user data (marks entries as read, updates tags, deletes, etc.):
1. **Always implement logging/dry-run mode FIRST**
2. Log clearly what WOULD happen: `[DRY-RUN] Would archive entry ${id}: "${title}" - ${reason}`
3. Test thoroughly with dry-run before enabling actual mutations
4. Only proceed to actual mutations after dry-run validation
5. Keep dry-run mode as a permanent option for safety

### Chrome Extension Specifics
- Content scripts run in page context
- Use `chrome.storage.sync` for user settings
- Use `chrome.storage.local` for cached data (entry tags)
- Background service worker for API proxying
- Always handle storage errors gracefully

### Code Style
- Use async/await for promises
- Add descriptive console logs for debugging
- Prefix feature-specific logs: `[Duplicates]`, `[Classification]`, `[DRY-RUN]`
- Use template literals for string formatting
- Add JSDoc comments for complex functions

### API Integration
- Feedbin API base: `https://api.feedbin.com/v2/`
- Always include authentication headers
- Handle rate limiting gracefully
- Cache API responses when appropriate
- Never expose API credentials in logs

## Testing
- Add unit tests for new features
- Mock DOM structure based on real Feedbin HTML
- Test edge cases thoroughly
- Use Jest for testing (to be set up)

## Related Codebases
- Feedbin source available at: `../feedbin`
- Reference Feedbin source for accurate DOM structure mocking
