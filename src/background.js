// Background service worker for Feedbin Power Tools

// Import LLM helper
importScripts('storage.js', 'llm.js')

console.log('[Background] Service worker initialized')

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Received message:', message)

  switch (message.action) {
    case 'openPopup':
      // Open popup programmatically (if needed)
      chrome.action.openPopup()
      break

    case 'fetchFeedData':
      // Proxy API requests if needed (to avoid CORS issues)
      handleFeedDataRequest(message.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }))
      return true // Keep message channel open for async response

    case 'classifyEntry':
      // Classify entry using LLM (background has no CORS restrictions)
      handleClassifyEntry(message.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ success: false, error: error.message }))
      return true // Keep message channel open for async response

    default:
      console.warn('[Background] Unknown action:', message.action)
  }
})

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed/updated:', details.reason)

  if (details.reason === 'install') {
    // Open welcome page or popup on first install
    chrome.action.openPopup()
  }
})

// Helper function to fetch feed data
async function handleFeedDataRequest(payload) {
  const { url, credentials } = payload

  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error('Credentials not configured')
  }

  const authHeader = 'Basic ' + btoa(credentials.email + ':' + credentials.password)

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[Background] Fetch error:', error)
    return { success: false, error: error.message }
  }
}

// Helper function to classify entry
async function handleClassifyEntry(payload) {
  const { entryData, existingTags, settings, feedTags } = payload

  console.log('[Background] ===== CLASSIFICATION REQUEST =====')
  console.log('[Background] Entry ID:', entryData.id)
  console.log('[Background] Entry Title:', entryData.title)
  console.log('[Background] Feed:', entryData.feed_title)
  console.log('[Background] Feed Tags:', feedTags || [])
  console.log('[Background] Author:', entryData.author)
  console.log('[Background] Entry data keys:', Object.keys(entryData))
  console.log('[Background] Summary length:', entryData.summary ? entryData.summary.length : 0)
  console.log('[Background] Content length:', entryData.content ? entryData.content.length : 0)
  console.log('[Background] Existing tags:', existingTags)

  try {
    const result = await LLM.classifyEntry(entryData, existingTags, settings, feedTags || [])
    console.log('[Background] ===== CLASSIFICATION RESULT =====')
    console.log('[Background] Tags:', result.tags)
    console.log('[Background] Tag reasons:', result.tagReasons)
    return { success: true, result }
  } catch (error) {
    console.error('[Background] ===== CLASSIFICATION ERROR =====')
    console.error('[Background] Error:', error)
    return { success: false, error: error.message }
  }
}

// Badge management - show filter count
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.activeFilters) {
    updateBadge(changes.activeFilters.newValue)
  }
})

async function updateBadge(filters) {
  if (!filters) {
    const result = await chrome.storage.local.get('activeFilters')
    filters = result.activeFilters || { includeTags: [], excludeTags: [] }
  }

  const filterCount = filters.includeTags.length + filters.excludeTags.length

  if (filterCount > 0) {
    chrome.action.setBadgeText({ text: String(filterCount) })
    chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' })
  } else {
    chrome.action.setBadgeText({ text: '' })
  }
}

// Initialize badge on startup
updateBadge()
