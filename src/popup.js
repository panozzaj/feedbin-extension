// Popup UI logic for Feedbin Power Tools

class PopupUI {
  constructor() {
    this.credentials = null;
    this.settings = null;
    this.entryTags = {};
    this.allTags = [];
  }

  async init() {
    console.log('[Popup] Initializing...');

    // Load data from storage
    await this.loadData();

    // Setup UI
    this.setupEventListeners();
    this.updateLLMSettings();
    this.initializeTomSelect();
    await this.renderAllTags();
    await this.renderStats();

    // Check if authenticated
    if (!this.credentials.email || !this.credentials.password) {
      this.showAuthSection();
    }
  }

  async loadData() {
    this.credentials = await Storage.getCredentials();
    this.settings = await Storage.getSettings();
    this.entryTags = await Storage.getEntryTags();

    // Extract all unique tags from entry tags
    const tagSet = new Set();
    Object.values(this.entryTags).forEach(entryData => {
      if (entryData.tags) {
        entryData.tags.forEach(tag => tagSet.add(tag));
      }
    });
    this.allTags = Array.from(tagSet).sort();

    // Populate form fields
    document.getElementById('email').value = this.credentials.email || '';
    document.getElementById('password').value = this.credentials.password || '';

    document.getElementById('llm-provider').value = this.settings.llmProvider || 'local';
    document.getElementById('local-url').value = this.settings.localLlmUrl || 'http://localhost:11434';
    document.getElementById('local-model').value = this.settings.localLlmModel || 'gemma3:4b';
    document.getElementById('claude-key').value = this.settings.claudeApiKey || '';
    document.getElementById('openai-key').value = this.settings.openaiApiKey || '';
    document.getElementById('auto-classify').checked = this.settings.autoClassify === true;
    // duplicate-detection value will be set by tom-select in initializeTomSelect()

    // Show current user if logged in
    if (this.credentials.email) {
      this.updateAuthDisplay();
    }

    // Show LLM settings summary if configured
    this.updateLLMSettingsSummary();
  }

  updateAuthDisplay() {
    const currentUserEl = document.getElementById('current-user');
    const authSection = document.getElementById('auth-section');

    if (this.credentials.email) {
      currentUserEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: #0369a1; font-weight: 600;">Feedbin Account</div>
            <div style="font-size: 14px; color: #0c4a6e; margin-top: 2px;">${this.credentials.email}</div>
          </div>
          <button id="change-account-btn" class="btn btn-small">Change</button>
        </div>
      `;
      authSection.style.display = 'none';

      // Add event listener for change button
      document.getElementById('change-account-btn').addEventListener('click', () => {
        authSection.style.display = 'block';
        currentUserEl.innerHTML = '';
      });
    } else {
      currentUserEl.innerHTML = '';
      authSection.style.display = 'block';
    }
  }

  setupEventListeners() {
    // Auth
    document.getElementById('auth-btn').addEventListener('click', () => this.authenticate());

    // Settings
    document.getElementById('llm-provider').addEventListener('change', (e) => {
      this.updateLLMSettings();
    });
    document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());

    // Auto-classify toggle (save immediately)
    document.getElementById('auto-classify').addEventListener('change', async (e) => {
      this.settings.autoClassify = e.target.checked;
      await Storage.setSettings(this.settings);
      this.showStatus(`Auto-classification ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
    });

    // Tag management
    document.getElementById('add-tag-btn').addEventListener('click', () => this.addCustomTag());
    document.getElementById('new-tag-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addCustomTag();
    });

    // Listen for storage changes to update UI
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.entryTags) {
        this.loadData().then(() => {
          this.renderAllTags();
          this.renderStats();
        });
      }
    });
  }

  updateLLMSettings() {
    const provider = document.getElementById('llm-provider').value;

    document.getElementById('local-settings').style.display = provider === 'local' ? 'block' : 'none';
    document.getElementById('claude-settings').style.display = provider === 'claude' ? 'block' : 'none';
    document.getElementById('openai-settings').style.display = provider === 'openai' ? 'block' : 'none';
  }

  initializeTomSelect() {
    const select = document.getElementById('duplicate-detection');

    // Build options with help text from data attributes
    const options = Array.from(select.options).map(opt => ({
      value: opt.value,
      text: opt.text,
      help: opt.dataset.help || ''
    }));

    this.duplicateSelect = new TomSelect(select, {
      options: options,
      labelField: 'text',
      valueField: 'value',
      searchField: ['text'],
      render: {
        option: (data, escape) => {
          return `<div>
            <div style="font-weight: 500;">${escape(data.text)}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${escape(data.help)}</div>
          </div>`;
        },
        item: (data, escape) => {
          return `<div>${escape(data.text)}</div>`;
        }
      },
      onChange: async (value) => {
        this.settings.duplicateDetection = value;
        await Storage.setSettings(this.settings);
        const labels = { none: 'disabled', log: 'logging only', archive: 'enabled with auto-archive' };
        this.showStatus(`Duplicate detection: ${labels[value]}`, 'success');
      }
    });

    // Set initial value
    this.duplicateSelect.setValue(this.settings.duplicateDetection || 'none', true);
  }

  updateLLMSettingsSummary() {
    const summaryEl = document.getElementById('llm-settings-summary');
    const settingsSection = document.getElementById('settings-section');

    // Check if settings are configured
    const isConfigured = this.settings.llmProvider &&
      (this.settings.llmProvider === 'local' ||
       this.settings.claudeApiKey ||
       this.settings.openaiApiKey);

    if (isConfigured) {
      let providerText = '';
      let detailsText = '';

      switch (this.settings.llmProvider) {
        case 'local':
          providerText = 'Local (Ollama)';
          detailsText = `Model: ${this.settings.localLlmModel || 'gemma3:4b'}`;
          break;
        case 'claude':
          providerText = 'Claude (Anthropic)';
          detailsText = `API Key: ${this.settings.claudeApiKey ? '••••' + this.settings.claudeApiKey.slice(-4) : 'Not set'}`;
          break;
        case 'openai':
          providerText = 'OpenAI';
          detailsText = `API Key: ${this.settings.openaiApiKey ? '••••' + this.settings.openaiApiKey.slice(-4) : 'Not set'}`;
          break;
      }

      summaryEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: #15803d; font-weight: 600;">LLM Provider</div>
            <div style="font-size: 14px; color: #166534; margin-top: 2px; font-weight: 500;">${providerText}</div>
            <div style="font-size: 12px; color: #16a34a; margin-top: 4px;">${detailsText}</div>
          </div>
          <button id="edit-llm-settings-btn" class="btn btn-small">Edit</button>
        </div>
      `;

      // Hide full settings form
      settingsSection.style.display = 'none';

      // Add event listener for edit button
      document.getElementById('edit-llm-settings-btn').addEventListener('click', () => {
        settingsSection.style.display = 'block';
        summaryEl.innerHTML = '';
      });
    } else {
      summaryEl.innerHTML = '';
      settingsSection.style.display = 'block';
    }
  }

  async saveSettings() {
    const settings = {
      llmProvider: document.getElementById('llm-provider').value,
      localLlmUrl: document.getElementById('local-url').value,
      localLlmModel: document.getElementById('local-model').value,
      claudeApiKey: document.getElementById('claude-key').value,
      openaiApiKey: document.getElementById('openai-key').value,
      autoClassify: document.getElementById('auto-classify').checked
    };

    try {
      await Storage.setSettings(settings);
      this.settings = settings;

      this.showStatus('Settings saved successfully!', 'success');

      // Test connection (don't fail if it doesn't work)
      try {
        const result = await LLM.testConnection(settings);
        if (result.success) {
          this.showStatus(`✓ Settings saved! ${result.message}`, 'success');
        } else {
          this.showStatus(`✓ Settings saved! (Warning: ${result.message})`, 'success');
        }
      } catch (testError) {
        console.warn('[Popup] Could not test connection:', testError);
        this.showStatus('✓ Settings saved! (Could not test connection - will verify when classifying)', 'success');
      }

      // Update summary display
      this.updateLLMSettingsSummary();
    } catch (error) {
      console.error('[Popup] Failed to save settings:', error);
      this.showStatus(`Failed to save settings: ${error.message}`, 'error');
    }
  }

  async authenticate() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showStatus('Please enter both email and password', 'error');
      return;
    }

    // Simple validation
    if (!email.includes('@') || password.length < 3) {
      this.showStatus('Please enter a valid email and password', 'error');
      return;
    }

    this.showStatus('Saving credentials...', 'info');

    try {
      console.log('[Popup] Saving credentials for:', email);

      // Save credentials first (they'll be verified when actually used)
      await Storage.setCredentials({ email, password });
      this.credentials = { email, password };

      // Try to verify, but don't fail if we can't
      try {
        const response = await fetch('https://api.feedbin.com/v2/subscriptions', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(email + ':' + password)
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Popup] ✓ Verified! Got', data.length, 'subscriptions');
          this.showStatus(`✓ Credentials saved and verified! (${data.length} subscriptions)`, 'success');
        } else if (response.status === 401) {
          this.showStatus('⚠️ Credentials saved but may be incorrect. Please verify at feedbin.com', 'error');
        } else {
          throw new Error('Could not verify');
        }
      } catch (verifyError) {
        console.warn('[Popup] Could not verify:', verifyError);
        this.showStatus('✓ Credentials saved! (Could not verify - will test when you use the extension)', 'success');
      }

      this.updateAuthDisplay();

    } catch (error) {
      console.error('[Popup] Save error:', error);
      this.showStatus(`Failed to save credentials: ${error.message}`, 'error');
    }
  }

  showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    this.showStatus('Please authenticate with your Feedbin account to get started.', 'info');
  }

  async addCustomTag() {
    const input = document.getElementById('new-tag-input');
    const tagName = input.value.trim().toLowerCase();

    if (!tagName) return;

    // Store as a predefined tag that LLM can use
    const predefinedTags = await Storage.getPredefinedTags() || [];
    if (!predefinedTags.includes(tagName)) {
      predefinedTags.push(tagName);
      await Storage.setPredefinedTags(predefinedTags);
    }

    input.value = '';
    this.showStatus(`✓ Tag "${tagName}" added - will be available for classification`, 'success');

    await this.loadData();
    await this.renderAllTags();
  }

  async renderAllTags() {
    const tagsListEl = document.getElementById('all-tags-list');

    // Get both predefined and discovered tags
    const predefinedTags = await Storage.getPredefinedTags() || [];
    const allTags = [...new Set([...predefinedTags, ...this.allTags])].sort();

    if (allTags.length === 0) {
      tagsListEl.innerHTML = '<span style="color: #9ca3af; font-size: 13px;">No tags yet - classify some entries to get started</span>';
      return;
    }

    tagsListEl.innerHTML = '';

    allTags.forEach(tag => {
      const isPredefined = predefinedTags.includes(tag);
      const isUsed = this.allTags.includes(tag);

      const tagEl = document.createElement('span');
      tagEl.className = 'entry-tag-item';
      if (isPredefined && !isUsed) {
        tagEl.classList.add('unused');
        tagEl.title = 'Predefined tag (not yet used)';
      }

      const labelEl = document.createElement('span');
      labelEl.className = 'entry-tag-label';
      labelEl.textContent = tag;

      // Only show remove button for predefined tags
      if (isPredefined) {
        const removeEl = document.createElement('button');
        removeEl.className = 'entry-tag-remove';
        removeEl.textContent = '×';
        removeEl.title = 'Remove tag';
        removeEl.addEventListener('click', () => this.removeTag(tag));
        tagEl.appendChild(labelEl);
        tagEl.appendChild(removeEl);
      } else {
        tagEl.appendChild(labelEl);
      }

      tagsListEl.appendChild(tagEl);
    });
  }

  async removeTag(tag) {
    const predefinedTags = await Storage.getPredefinedTags() || [];
    const filtered = predefinedTags.filter(t => t !== tag);
    await Storage.setPredefinedTags(filtered);

    await this.loadData();
    await this.renderAllTags();
  }

  async renderStats() {
    const statsEl = document.getElementById('entry-stats');

    const totalEntries = Object.keys(this.entryTags).length;
    const tagCounts = {};

    Object.values(this.entryTags).forEach(entryData => {
      if (entryData.tags) {
        entryData.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    if (totalEntries === 0) {
      statsEl.innerHTML = 'No entries classified yet. Click "🤖 Classify" in the sidebar to get started.';
      return;
    }

    const statsHtml = `
      <div style="margin-bottom: 8px;"><strong>${totalEntries}</strong> entries tagged</div>
      <div style="font-size: 12px; margin-top: 8px;">
        ${Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => `<div style="margin: 4px 0;"><span class="feed-tag" style="font-size: 11px;">${tag}</span> × ${count}</div>`)
          .join('')}
      </div>
    `;

    statsEl.innerHTML = statsHtml;
  }

  showStatus(message, type = 'info') {
    const container = document.getElementById('status-container');

    // Remove existing messages
    container.innerHTML = '';

    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;

    container.appendChild(statusDiv);

    // Fade in
    setTimeout(() => statusDiv.classList.add('show'), 10);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusDiv.classList.remove('show');
      setTimeout(() => {
        if (statusDiv.parentElement) {
          statusDiv.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupUI();
  popup.init();
});
