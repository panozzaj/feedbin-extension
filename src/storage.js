// Storage helper for Chrome extension
const Storage = {
  // Get all feed tags
  async getFeedTags() {
    const result = await chrome.storage.local.get('feedTags')
    return result.feedTags || {}
  },

  // Set tags for a specific feed
  async setFeedTags(feedId, tags) {
    const feedTags = await this.getFeedTags()
    // Ensure tags are unique and lowercase
    const uniqueTags = Array.from(
      new Set((Array.isArray(tags) ? tags : [tags]).map((t) => t.toLowerCase().trim()))
    )
    feedTags[feedId] = {
      tags: uniqueTags,
      updatedAt: Date.now(),
    }
    await chrome.storage.local.set({ feedTags })
    return feedTags[feedId]
  },

  // Get tags for a specific feed
  async getFeedTag(feedId) {
    const feedTags = await this.getFeedTags()
    return feedTags[feedId] || null
  },

  // Get all feeds with a specific tag
  async getFeedsByTag(tag) {
    const feedTags = await this.getFeedTags()
    return Object.entries(feedTags)
      .filter(([_, data]) => data.tags.includes(tag))
      .map(([feedId, _]) => feedId)
  },

  // Get all unique tags (from predefined, feeds, and entries)
  async getAllTags() {
    const predefinedTags = await this.getPredefinedTags()
    const feedTags = await this.getFeedTags()
    const entryTags = await this.getEntryTags()
    const tagSet = new Set()

    // Add predefined tags
    predefinedTags.forEach((tag) => tagSet.add(tag))

    // Add feed tags
    Object.values(feedTags).forEach((data) => {
      data.tags.forEach((tag) => tagSet.add(tag))
    })

    // Add entry tags
    Object.values(entryTags).forEach((data) => {
      data.tags.forEach((tag) => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  },

  // ===== Entry-level tags =====

  // Get all entry tags
  async getEntryTags() {
    const result = await chrome.storage.local.get('entryTags')
    return result.entryTags || {}
  },

  // Set tags for a specific entry
  async setEntryTags(entryId, tags, tagReasons = {}) {
    const entryTags = await this.getEntryTags()
    // Ensure entryId is a string
    entryId = String(entryId)
    // Ensure tags are unique and lowercase
    const uniqueTags = Array.from(
      new Set((Array.isArray(tags) ? tags : [tags]).map((t) => t.toLowerCase().trim()))
    )
    entryTags[entryId] = {
      tags: uniqueTags,
      tagReasons: tagReasons, // Object with tag -> reason mapping
      updatedAt: Date.now(),
    }
    await chrome.storage.local.set({ entryTags })
    return entryTags[entryId]
  },

  // Set multiple entry tags at once (for batch operations)
  async setBatchEntryTags(entryTagsMap) {
    const entryTags = await this.getEntryTags()
    Object.entries(entryTagsMap).forEach(([entryId, tags]) => {
      // Ensure tags are unique and lowercase
      const uniqueTags = Array.from(
        new Set((Array.isArray(tags) ? tags : [tags]).map((t) => t.toLowerCase().trim()))
      )
      entryTags[entryId] = {
        tags: uniqueTags,
        updatedAt: Date.now(),
      }
    })
    await chrome.storage.local.set({ entryTags })
  },

  // Get tags for a specific entry
  async getEntryTag(entryId) {
    const entryTags = await this.getEntryTags()
    // Ensure entryId is a string
    entryId = String(entryId)
    return entryTags[entryId] || null
  },

  // Get all entries with a specific tag
  async getEntriesByTag(tag) {
    const entryTags = await this.getEntryTags()
    return Object.entries(entryTags)
      .filter(([_, data]) => data.tags.includes(tag))
      .map(([entryId, _]) => entryId)
  },

  // Clear old entry tags (to prevent storage bloat)
  // Only prunes read entries older than daysToKeep
  // Keeps unread entries indefinitely to avoid reclassification
  async pruneOldEntryTags(readEntryIds, daysToKeep = 30) {
    const entryTags = await this.getEntryTags()
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    const readSet = new Set(readEntryIds || [])

    const pruned = {}
    Object.entries(entryTags).forEach(([entryId, data]) => {
      // Keep if: unread OR within time window
      if (!readSet.has(entryId) || data.updatedAt > cutoffTime) {
        pruned[entryId] = data
      }
    })

    await chrome.storage.local.set({ entryTags: pruned })
    return Object.keys(entryTags).length - Object.keys(pruned).length // Return count of pruned entries
  },

  // Get active filters
  async getActiveFilters() {
    const result = await chrome.storage.local.get('activeFilters')
    return result.activeFilters || { includeTags: [], excludeTags: [] }
  },

  // Set active filters
  async setActiveFilters(filters) {
    await chrome.storage.local.set({ activeFilters: filters })
    return filters
  },

  // ===== Predefined tags (user-created tags for LLM to use) =====

  // Get predefined tags
  async getPredefinedTags() {
    const result = await chrome.storage.local.get('predefinedTags')
    return result.predefinedTags || []
  },

  // Set predefined tags
  async setPredefinedTags(tags) {
    // Ensure tags are unique and lowercase
    const uniqueTags = Array.from(
      new Set((Array.isArray(tags) ? tags : []).map((t) => t.toLowerCase().trim()))
    )
    await chrome.storage.local.set({ predefinedTags: uniqueTags })
    return uniqueTags
  },

  // Get settings
  async getSettings() {
    const result = await chrome.storage.local.get('settings')
    return (
      result.settings || {
        llmProvider: 'local', // 'local', 'claude', 'openai'
        claudeApiKey: '',
        openaiApiKey: '',
        localLlmUrl: 'http://localhost:11434', // Ollama default
        localLlmModel: 'gemma3:4b', // Default model
        autoClassify: false, // Auto-classify entries (default: off for new users)
        duplicateTimeWindowHours: 1, // Time window for duplicate detection (in hours)
        duplicateDetection: 'none', // 'none', 'log', 'archive'
      }
    )
  },

  // Set settings
  async setSettings(settings) {
    await chrome.storage.local.set({ settings })
    return settings
  },

  // Get Feedbin credentials
  async getCredentials() {
    const result = await chrome.storage.local.get('credentials')
    return result.credentials || { email: '', password: '', pageToken: '' }
  },

  // Set Feedbin credentials
  async setCredentials(credentials) {
    await chrome.storage.local.set({ credentials })
    return credentials
  },

  // Clear all data
  async clearAll() {
    await chrome.storage.local.clear()
  },
}

// Make available to content scripts
if (typeof window !== 'undefined') {
  window.Storage = Storage
}
