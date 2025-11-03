// Content script for Feedbin Power Tools
// Entry-level classification and filtering

class FeedbinPowerTools {
  constructor() {
    this.initialized = false;
    this.activeFilters = { includeTags: [], excludeTags: [] };
    this.entryTags = {};
    this.settings = {};
    this.classificationQueue = [];
    this.isClassifying = false;
  }

  async init() {
    if (this.initialized) return;

    console.log('[Feedbin Power Tools] Initializing...');

    // Wait for Feedbin to load
    await this.waitForFeedbin();

    // Inject UI immediately (before loading data)
    this.injectFilterUI();

    // Load data from storage (in background)
    await this.loadData();

    // Update UI with loaded data
    await this.renderFilterPills();

    // Apply initial filters
    this.applyFilters();

    // Observe DOM changes for dynamically loaded entries
    this.observeEntries();

    // Listen for storage changes (from popup)
    this.listenForStorageChanges();

    // Auto-classify visible entries if enabled
    if (this.settings.autoClassify) {
      this.queueVisibleEntriesForClassification();
    }

    this.initialized = true;
    console.log('[Feedbin Power Tools] Initialized successfully');
  }

  waitForFeedbin() {
    return new Promise((resolve) => {
      // Check if feed list exists in left nav
      const feedList = document.querySelector('ul.feed-list');

      if (feedList) {
        console.log('[Feedbin Power Tools] Found feed list immediately');
        resolve();
        return;
      }

      // Poll for feed list
      const checkInterval = setInterval(() => {
        const feedList = document.querySelector('ul.feed-list');
        if (feedList) {
          console.log('[Feedbin Power Tools] Found feed list after polling');
          clearInterval(checkInterval);
          resolve();
        }
      }, 50); // Check every 50ms

      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('[Feedbin Power Tools] Timeout waiting for feed list');
        resolve(); // Continue anyway
      }, 3000);
    });
  }

  async loadData() {
    this.entryTags = await Storage.getEntryTags();
    this.activeFilters = await Storage.getActiveFilters();
    this.settings = await Storage.getSettings();
  }

  injectFilterUI() {
    console.log('[Feedbin Power Tools] 🔍 Looking for feed list in left nav...');

    // Find the feed list in the left nav
    const feedList = document.querySelector('ul.feed-list');

    if (!feedList) {
      console.warn('[Feedbin Power Tools] ❌ Could not find feed list, retrying in 1s...');
      console.log('[Feedbin Power Tools] Available elements:', {
        body: !!document.body,
        main: !!document.querySelector('main'),
        feedList: !!document.querySelector('ul.feed-list'),
        nav: !!document.querySelector('nav')
      });
      setTimeout(() => this.injectFilterUI(), 1000);
      return;
    }

    // Check if already injected
    if (document.getElementById('feedbin-power-tools-toolbar')) {
      console.log('[Feedbin Power Tools] ⚠️ Toolbar already injected');
      return;
    }

    console.log('[Feedbin Power Tools] ✅ Found feed list:', feedList);
    console.log('[Feedbin Power Tools] 🔨 Injecting toolbar after feed list...');

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'feedbin-power-tools-toolbar';
    toolbar.className = 'power-tools-toolbar';

    toolbar.innerHTML = `
      <div class="power-tools-header">
        <span class="power-tools-logo">⚡ Power Tools</span>
        <div class="power-tools-actions">
          <button id="classify-visible-btn" class="power-tools-action-btn" title="Classify visible entries">
            🤖 Classify
          </button>
          <button id="power-tools-toggle" class="power-tools-toggle-btn" title="Toggle filters">
            ${this.activeFilters.includeTags.length > 0 || this.activeFilters.excludeTags.length > 0 ? '▼' : '▶'}
          </button>
        </div>
      </div>
      <div id="power-tools-filters" class="power-tools-filters ${this.activeFilters.includeTags.length > 0 || this.activeFilters.excludeTags.length > 0 ? 'active' : ''}">
        <div class="filter-section">
          <label class="filter-label">Show only:</label>
          <div id="include-tags" class="tag-pills"></div>
        </div>
        <div class="filter-section">
          <label class="filter-label">Hide:</label>
          <div id="exclude-tags" class="tag-pills"></div>
        </div>
        <div class="filter-actions">
          <button id="clear-filters-btn" class="filter-action-btn">Clear All</button>
          <button id="manage-tags-btn" class="filter-action-btn primary">Settings</button>
        </div>
      </div>
    `;

    // Insert as sibling after feed list
    feedList.parentNode.insertBefore(toolbar, feedList.nextSibling);

    console.log('[Feedbin Power Tools] ✅ Toolbar injected successfully');

    // Add event listeners immediately
    this.attachToolbarListeners();

    // Note: renderFilterPills() will be called after data loads in init()
  }

  async renderFilterPills() {
    const includeTags = document.getElementById('include-tags');
    const excludeTags = document.getElementById('exclude-tags');

    if (!includeTags || !excludeTags) return;

    // Get all available tags
    const allTags = await Storage.getAllTags();

    // Render include tags
    includeTags.innerHTML = '';
    allTags.forEach(tag => {
      const pill = this.createTagPill(tag, 'include', this.activeFilters.includeTags.includes(tag));
      includeTags.appendChild(pill);
    });

    // Render exclude tags
    excludeTags.innerHTML = '';
    allTags.forEach(tag => {
      const pill = this.createTagPill(tag, 'exclude', this.activeFilters.excludeTags.includes(tag));
      excludeTags.appendChild(pill);
    });

    // Show message if no tags
    if (allTags.length === 0) {
      includeTags.innerHTML = '<span class="no-tags-message">No tags yet. Click "🤖 Classify Visible" to get started.</span>';
      excludeTags.innerHTML = '';
    }
  }

  createTagPill(tag, type, active) {
    const pill = document.createElement('button');
    pill.className = `tag-pill ${active ? 'active' : ''} ${type}`;
    pill.textContent = tag;
    pill.dataset.tag = tag;
    pill.dataset.type = type;

    pill.addEventListener('click', () => {
      this.toggleFilter(tag, type);
    });

    return pill;
  }

  async toggleFilter(tag, type) {
    if (type === 'include') {
      const index = this.activeFilters.includeTags.indexOf(tag);
      if (index > -1) {
        this.activeFilters.includeTags.splice(index, 1);
      } else {
        this.activeFilters.includeTags.push(tag);
        // Remove from exclude if present
        const excludeIndex = this.activeFilters.excludeTags.indexOf(tag);
        if (excludeIndex > -1) {
          this.activeFilters.excludeTags.splice(excludeIndex, 1);
        }
      }
    } else {
      const index = this.activeFilters.excludeTags.indexOf(tag);
      if (index > -1) {
        this.activeFilters.excludeTags.splice(index, 1);
      } else {
        this.activeFilters.excludeTags.push(tag);
        // Remove from include if present
        const includeIndex = this.activeFilters.includeTags.indexOf(tag);
        if (includeIndex > -1) {
          this.activeFilters.includeTags.splice(includeIndex, 1);
        }
      }
    }

    // Save to storage
    await Storage.setActiveFilters(this.activeFilters);

    // Update UI
    await this.renderFilterPills();
    this.updateToggleButton();

    // Apply filters
    this.applyFilters();
  }

  attachToolbarListeners() {
    const toggleBtn = document.getElementById('power-tools-toggle');
    const classifyBtn = document.getElementById('classify-visible-btn');
    const clearBtn = document.getElementById('clear-filters-btn');
    const manageBtn = document.getElementById('manage-tags-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const filtersDiv = document.getElementById('power-tools-filters');
        filtersDiv.classList.toggle('active');
        this.updateToggleButton();
      });
    }

    if (classifyBtn) {
      classifyBtn.addEventListener('click', () => {
        this.queueVisibleEntriesForClassification();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        this.activeFilters = { includeTags: [], excludeTags: [] };
        await Storage.setActiveFilters(this.activeFilters);
        this.renderFilterPills();
        this.updateToggleButton();
        this.applyFilters();
      });
    }

    if (manageBtn) {
      manageBtn.addEventListener('click', () => {
        // Open popup
        chrome.runtime.sendMessage({ action: 'openPopup' });
      });
    }
  }

  updateToggleButton() {
    const toggleBtn = document.getElementById('power-tools-toggle');
    const filtersDiv = document.getElementById('power-tools-filters');
    if (toggleBtn && filtersDiv) {
      const isExpanded = filtersDiv.classList.contains('active');
      toggleBtn.textContent = isExpanded ? '▼' : '▶';
      toggleBtn.title = isExpanded ? 'Hide filters' : 'Show filters';
    }
  }

  applyFilters() {
    const entries = document.querySelectorAll('.entry-summary[data-entry-id]');

    console.log(`[Feedbin Power Tools] Applying filters to ${entries.length} entries`);

    let hiddenCount = 0;
    let shownCount = 0;

    entries.forEach(entryEl => {
      const entryId = entryEl.dataset.entryId;

      if (!entryId) {
        entryEl.style.display = '';
        shownCount++;
        return;
      }

      const shouldShow = this.shouldShowEntry(entryId);

      if (shouldShow) {
        entryEl.style.display = '';
        shownCount++;
      } else {
        entryEl.style.display = 'none';
        hiddenCount++;
      }

      // Add tag indicator or classify button
      this.addTagIndicator(entryEl, entryId);
    });

    console.log(`[Feedbin Power Tools] Shown: ${shownCount}, Hidden: ${hiddenCount}`);
  }

  shouldShowEntry(entryId) {
    const entryTagData = this.entryTags[entryId];

    // If no filters active, show everything
    if (this.activeFilters.includeTags.length === 0 && this.activeFilters.excludeTags.length === 0) {
      return true;
    }

    // If entry has no tags
    if (!entryTagData || !entryTagData.tags || entryTagData.tags.length === 0) {
      // Show untagged entries only if no include filters are active
      return this.activeFilters.includeTags.length === 0;
    }

    const entryTags = entryTagData.tags;

    // Check exclude filters first (higher priority)
    if (this.activeFilters.excludeTags.length > 0) {
      const hasExcludedTag = entryTags.some(tag => this.activeFilters.excludeTags.includes(tag));
      if (hasExcludedTag) {
        return false;
      }
    }

    // Check include filters
    if (this.activeFilters.includeTags.length > 0) {
      const hasIncludedTag = entryTags.some(tag => this.activeFilters.includeTags.includes(tag));
      return hasIncludedTag;
    }

    // No include filters, and passed exclude check
    return true;
  }

  addTagIndicator(entryEl, entryId) {
    // Remove ALL existing power tools elements from this entry
    entryEl.querySelectorAll('.power-tools-tags-container').forEach(el => el.remove());
    entryEl.querySelectorAll('.power-tools-classify-btn').forEach(el => el.remove());

    // Ensure entryId is a string for consistent lookup
    entryId = String(entryId);

    const entryTagData = this.entryTags[entryId];

    // Find the summary-content div where we'll add the button/indicator
    const summaryContent = entryEl.querySelector('.summary-content');
    if (!summaryContent) {
      console.warn('[Feedbin Power Tools] No summary-content found for entry:', entryId);
      return;
    }

    if (!entryTagData || !entryTagData.tags || entryTagData.tags.length === 0) {
      // No tags - show classify button
      const classifyBtn = document.createElement('button');
      classifyBtn.className = 'power-tools-classify-btn';
      classifyBtn.textContent = '🤖 Classify';
      classifyBtn.title = 'Classify this entry';
      classifyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.classifySingleEntry(entryId);
      });

      // Insert at the end of summary-content
      summaryContent.appendChild(classifyBtn);
      return;
    }

    // Has tags - show tag indicators (one per tag with delete button)
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'power-tools-tags-container';

    entryTagData.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'power-tools-tag-pill';

      // Set tooltip with individual reason for this tag
      if (entryTagData.tagReasons && entryTagData.tagReasons[tag]) {
        tagEl.title = entryTagData.tagReasons[tag];
      }

      const labelEl = document.createElement('span');
      labelEl.className = 'power-tools-tag-label';
      labelEl.textContent = tag;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'power-tools-tag-delete';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'Remove tag';
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.removeTagFromEntry(entryId, tag);
      });

      tagEl.appendChild(labelEl);
      tagEl.appendChild(deleteBtn);
      tagsContainer.appendChild(tagEl);
    });

    // Insert at the end of summary-content
    summaryContent.appendChild(tagsContainer);
  }

  async removeTagFromEntry(entryId, tagToRemove) {
    const entryTagData = this.entryTags[entryId];
    if (!entryTagData) return;

    // Remove the tag
    const updatedTags = entryTagData.tags.filter(t => t !== tagToRemove);

    if (updatedTags.length === 0) {
      // No tags left - remove entry from storage
      delete this.entryTags[entryId];
      const allTags = await Storage.getEntryTags();
      delete allTags[entryId];
      await chrome.storage.local.set({ entryTags: allTags });
    } else {
      // Update with remaining tags (preserve reasons for remaining tags)
      const tagReasons = entryTagData.tagReasons || {};
      const updatedTagReasons = {};
      updatedTags.forEach(tag => {
        if (tagReasons[tag]) {
          updatedTagReasons[tag] = tagReasons[tag];
        }
      });
      await Storage.setEntryTags(entryId, updatedTags, updatedTagReasons);
      this.entryTags[entryId] = { tags: updatedTags, tagReasons: updatedTagReasons, updatedAt: Date.now() };
    }

    // Refresh UI
    await this.renderFilterPills();
    this.applyFilters();
  }

  async classifySingleEntry(entryId) {
    const entryEl = document.querySelector(`.entry-summary[data-entry-id="${entryId}"]`);
    if (!entryEl) return;

    // Show loading state
    const btn = entryEl.querySelector('.power-tools-classify-btn');
    if (btn) {
      btn.textContent = '⏳';
      btn.disabled = true;
    }

    // Classify
    await this.classifyEntry(entryId);

    // Update button (will be replaced by tag indicator if successful)
    if (btn && !this.entryTags[entryId]) {
      btn.textContent = '🤖';
      btn.disabled = false;
    }
  }

  observeEntries() {
    const entriesContainer = document.querySelector('.entries');
    if (!entriesContainer) return;

    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      let newEntries = [];

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches('.entry-summary')) {
            shouldReapply = true;
            newEntries.push(node);
          } else if (node.nodeType === 1 && node.querySelector('.entry-summary')) {
            shouldReapply = true;
            newEntries.push(...node.querySelectorAll('.entry-summary'));
          }
        });
      });

      if (shouldReapply) {
        // Debounce to avoid excessive reapplication
        clearTimeout(this.applyFiltersTimeout);
        this.applyFiltersTimeout = setTimeout(() => {
          this.applyFilters();

          // Auto-classify new entries if enabled
          if (this.settings.autoClassify && newEntries.length > 0) {
            newEntries.forEach(entryEl => {
              const entryId = entryEl.dataset.entryId;
              if (entryId && !this.entryTags[entryId]) {
                this.queueEntryForClassification(entryId);
              }
            });
          }
        }, 100);
      }
    });

    observer.observe(entriesContainer, {
      childList: true,
      subtree: true
    });
  }

  listenForStorageChanges() {
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName !== 'local') return;

      let shouldUpdate = false;

      if (changes.entryTags) {
        this.entryTags = changes.entryTags.newValue || {};
        shouldUpdate = true;
      }

      if (changes.activeFilters) {
        this.activeFilters = changes.activeFilters.newValue || { includeTags: [], excludeTags: [] };
        shouldUpdate = true;
      }

      if (changes.settings) {
        this.settings = changes.settings.newValue || {};
      }

      if (shouldUpdate) {
        await this.renderFilterPills();
        this.updateToggleButton();
        this.applyFilters();
      }
    });
  }

  // ===== Classification =====

  async queueVisibleEntriesForClassification() {
    const entries = document.querySelectorAll('.entry-summary[data-entry-id]');
    const entriesToClassify = [];

    entries.forEach(entryEl => {
      const entryId = entryEl.dataset.entryId;
      if (entryId && !this.entryTags[entryId]) {
        entriesToClassify.push(entryId);
      }
    });

    if (entriesToClassify.length === 0) {
      console.log('[Feedbin Power Tools] No entries to classify');
      return;
    }

    console.log(`[Feedbin Power Tools] Queuing ${entriesToClassify.length} entries for classification`);

    // Add to queue
    this.classificationQueue.push(...entriesToClassify);

    // Show status
    this.showClassificationStatus(`Classifying ${entriesToClassify.length} entries...`);

    // Start processing
    this.processClassificationQueue();
  }

  queueEntryForClassification(entryId) {
    if (!this.classificationQueue.includes(entryId)) {
      this.classificationQueue.push(entryId);
      this.processClassificationQueue();
    }
  }

  async processClassificationQueue() {
    if (this.isClassifying || this.classificationQueue.length === 0) {
      return;
    }

    this.isClassifying = true;
    const CONCURRENT_LIMIT = 5; // Process 5 entries at a time

    console.log(`[Feedbin Power Tools] Processing ${this.classificationQueue.length} entries (${CONCURRENT_LIMIT} concurrent)`);

    while (this.classificationQueue.length > 0) {
      // Take up to CONCURRENT_LIMIT entries from the queue
      const batch = this.classificationQueue.splice(0, CONCURRENT_LIMIT);

      // Update status
      const remaining = this.classificationQueue.length + batch.length;
      this.showClassificationStatus(`Classifying ${remaining} entries...`);

      // Classify all entries in this batch concurrently
      const promises = batch.map(entryId =>
        this.classifyEntry(entryId).catch(error => {
          console.error(`[Feedbin Power Tools] Failed to classify entry ${entryId}:`, error);
          // Continue with other entries even if one fails
        })
      );

      // Wait for this batch to complete before starting the next batch
      await Promise.all(promises);

      // Small delay between batches to avoid overwhelming the system
      if (this.classificationQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isClassifying = false;
    this.hideClassificationStatus();

    console.log('[Feedbin Power Tools] Finished classifying all entries');

    // Re-apply filters and update UI
    this.applyFilters();
    await this.renderFilterPills();
  }

  async classifyEntry(entryId) {
    try {
      // Ensure entryId is a string
      entryId = String(entryId);

      // Get entry element
      const entryEl = document.querySelector(`.entry-summary[data-entry-id="${entryId}"]`);
      if (!entryEl) {
        console.warn(`[Feedbin Power Tools] Entry element not found: ${entryId}`);
        return;
      }

      // Extract basic entry data from DOM
      const titleEl = entryEl.querySelector('.title');
      const summaryEl = entryEl.querySelector('.summary');
      const feedTitleEl = entryEl.querySelector('.feed-title');

      const basicEntryData = {
        id: entryId,
        title: titleEl ? titleEl.textContent.trim() : '',
        summary: summaryEl ? summaryEl.textContent.trim() : '',
        feed_title: feedTitleEl ? feedTitleEl.textContent.trim() : ''
      };

      if (!basicEntryData.title) {
        console.warn(`[Feedbin Power Tools] No title found for entry: ${entryId}`);
        return;
      }

      console.log(`[Feedbin Power Tools] Fetching full content for: ${basicEntryData.title}`);

      // Fetch full entry content from Feedbin API
      const credentials = await Storage.getCredentials();
      const fullEntryResponse = await chrome.runtime.sendMessage({
        action: 'fetchFeedData',
        payload: {
          url: `https://api.feedbin.com/v2/entries/${entryId}.json`,
          credentials
        }
      });

      let entryData = basicEntryData;
      let feedId = null;
      if (fullEntryResponse.success && fullEntryResponse.data) {
        // Merge full entry data (including content)
        entryData = {
          id: entryId,
          title: fullEntryResponse.data.title || basicEntryData.title,
          summary: fullEntryResponse.data.summary || basicEntryData.summary,
          content: fullEntryResponse.data.content || '', // Full article HTML/text
          feed_title: basicEntryData.feed_title,
          author: fullEntryResponse.data.author || ''
        };
        feedId = fullEntryResponse.data.feed_id; // Get feed ID for feed tag lookup
        console.log(`[Feedbin Power Tools] Got full content: ${entryData.content ? entryData.content.length : 0} chars`);
      } else {
        console.warn(`[Feedbin Power Tools] Could not fetch full entry, using summary only`);
      }

      // Get existing tags
      const allTags = await Storage.getAllTags();

      // Get feed tags for this entry's feed (to provide context to LLM)
      let feedTags = [];
      if (feedId) {
        const feedTagData = await Storage.getFeedTag(feedId);
        if (feedTagData && feedTagData.tags) {
          feedTags = feedTagData.tags;
          console.log(`[Feedbin Power Tools] Feed tags for context: ${feedTags.join(', ')}`);
        }
      }

      // Classify using background script (to avoid CORS issues)
      console.log(`[Feedbin Power Tools] Classifying: ${entryData.title}`);

      const response = await chrome.runtime.sendMessage({
        action: 'classifyEntry',
        payload: {
          entryData,
          existingTags: allTags,
          settings: this.settings,
          feedTags: feedTags
        }
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const result = response.result;

      if (result.tags && result.tags.length > 0) {
        // Save tags with individual reasons
        await Storage.setEntryTags(entryId, result.tags, result.tagReasons || {});
        this.entryTags[entryId] = {
          tags: result.tags,
          tagReasons: result.tagReasons || {},
          updatedAt: Date.now()
        };

        console.log(`[Feedbin Power Tools] Tagged "${entryData.title}" with: ${result.tags.join(', ')}`);
        if (result.tagReasons) {
          result.tags.forEach(tag => {
            if (result.tagReasons[tag]) {
              console.log(`[Feedbin Power Tools]   ${tag}: ${result.tagReasons[tag]}`);
            }
          });
        }

        // Update UI for this entry
        this.addTagIndicator(entryEl, entryId);
      }
    } catch (error) {
      console.error(`[Feedbin Power Tools] Classification error for entry ${entryId}:`, error);
    }
  }

  showClassificationStatus(message) {
    let statusEl = document.getElementById('classification-status');

    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'classification-status';
      statusEl.className = 'classification-status';

      const toolbar = document.getElementById('feedbin-power-tools-toolbar');
      if (toolbar) {
        toolbar.appendChild(statusEl);
      }
    }

    statusEl.textContent = message;
    statusEl.style.display = 'block';
  }

  hideClassificationStatus() {
    const statusEl = document.getElementById('classification-status');
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  }
}

// Initialize with better timing
console.log('[Feedbin Power Tools] Script loaded at', new Date().toISOString());
console.log('[Feedbin Power Tools] Document ready state:', document.readyState);

const powerTools = new FeedbinPowerTools();

// Function to try initialization
function tryInit() {
  console.log('[Feedbin Power Tools] Attempting initialization...');
  powerTools.init().catch(err => {
    console.error('[Feedbin Power Tools] Init failed:', err);
  });
}

// Try immediately if DOM is ready
if (document.readyState === 'loading') {
  console.log('[Feedbin Power Tools] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', tryInit);
} else {
  console.log('[Feedbin Power Tools] DOM already loaded, initializing now');
  tryInit();
}

// Also try after a short delay as a fallback
setTimeout(() => {
  if (!powerTools.initialized) {
    console.log('[Feedbin Power Tools] Fallback init after 1 second');
    tryInit();
  }
}, 1000);
