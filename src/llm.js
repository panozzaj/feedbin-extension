// LLM Integration for entry classification

const LLM = {
  // Classify a single entry (article/post)
  async classifyEntry(entryData, existingTags, settings, feedTags = []) {
    const provider = settings.llmProvider || 'local'

    switch (provider) {
      case 'local':
        return await this.classifyEntryWithOllama(entryData, existingTags, settings, feedTags)
      case 'claude':
        return await this.classifyEntryWithClaude(entryData, existingTags, settings, feedTags)
      case 'openai':
        return await this.classifyEntryWithOpenAI(entryData, existingTags, settings, feedTags)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  },

  // Legacy: Classify entire feed (kept for backward compatibility)
  async classify(feedData, existingTags, settings) {
    const provider = settings.llmProvider || 'local'

    switch (provider) {
      case 'local':
        return await this.classifyWithOllama(feedData, existingTags, settings)
      case 'claude':
        return await this.classifyWithClaude(feedData, existingTags, settings)
      case 'openai':
        return await this.classifyWithOpenAI(feedData, existingTags, settings)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  },

  // Strip HTML tags and decode entities
  stripHtml(html) {
    if (!html) return ''

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ')

    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    // Collapse multiple spaces
    text = text.replace(/\s+/g, ' ').trim()

    return text
  },

  // Build prompt for entry classification
  buildEntryPrompt(entryData, existingTags, feedTags = []) {
    const { title, summary, author, feed_title, content } = entryData

    // Use content if available, otherwise use summary
    // Strip HTML and limit to 2000 chars to avoid token limits but get more context
    let rawContent = content || summary || ''
    const textContent = this.stripHtml(rawContent)
    const truncatedContent = textContent.substring(0, 2000)
    const contentLabel = content ? 'Content' : 'Summary'

    // Add feed tags context if available
    const feedTagsContext =
      feedTags.length > 0 ? `\n- Feed Tags (for context): ${feedTags.join(', ')}` : ''

    let prompt

    if (existingTags.length === 0) {
      // No tags yet - allow creating new ones
      prompt = `You are helping classify individual articles/posts into categories. Based on the article content, suggest 1-3 relevant tags.

Article Information:
- Title: ${title}
- Feed: ${feed_title || 'Unknown'}${feedTagsContext}
${author ? `- Author: ${author}` : ''}
${truncatedContent ? `- ${contentLabel}: ${truncatedContent}${textContent.length > 2000 ? '...' : ''}` : ''}

No existing tags yet. Suggest 1-3 simple, broad category tags like:
- tech (software, hardware, cybersecurity, hacking, startups, programming, AI, tech companies)
- politics (government, elections, policy, lawmakers, political campaigns, legislation, White House, Trump administration, Biden administration, Congress, Supreme Court, military policy, drone strikes, executive orders, foreign policy, domestic policy, government agencies)
- science (research papers, scientific studies, methodology, academic research, scientific analysis)
- health, business, sports, entertainment, personal, news, culture, finance, education

IMPORTANT: Articles can have multiple tags. For example:
- An article about a health study should get BOTH "health" AND "science"
- An article about AI research should get BOTH "tech" AND "science"
- An article about government funding of research should get "politics" AND "science"

CRITICAL DISTINCTION:
- "politics" = government/elections/policy/lawmakers/legislation/campaigns/administration/military policy/executive actions/government legal decisions/drone strikes/war powers/presidential actions/congressional actions/Supreme Court decisions
- "tech" = anything related to technology, software, cybersecurity, hacking, tech industry
- Criminal cases involving hackers, cybercrime, tech fraud = "tech" NOT "politics"
- Legal/court cases about technology = "tech" NOT "politics"
- Military drone strikes, war powers, executive branch actions = "politics"
- Government policy debates (healthcare, immigration, etc.) = "politics"
- Only tag "politics" if it's about government officials, elections, policy-making, or government actions

Respond with ONLY valid JSON in this exact format:
[{"tag": "tech", "reason": "Article about cybersecurity breach"}]

Example for hacker arrest: [{"tag": "tech", "reason": "Criminal case involving cybercrime and hacking"}]`
    } else {
      // Have existing tags - must use only those
      prompt = `You are helping classify individual articles/posts into categories. Based on the article content, select 1-3 tags from the existing tags list.

Article Information:
- Title: ${title}
- Feed: ${feed_title || 'Unknown'}${feedTagsContext}
${author ? `- Author: ${author}` : ''}
${truncatedContent ? `- ${contentLabel}: ${truncatedContent}${textContent.length > 2000 ? '...' : ''}` : ''}

AVAILABLE TAGS (you MUST only use these): ${existingTags.join(', ')}

CRITICAL RULES:
- You MUST ONLY use tags from the available list above
- DO NOT create new tags
- If none of the existing tags fit well, respond with empty array []
- Articles can have multiple tags (e.g., "health" + "science" for health research papers)
- "politics" = government/elections/policy/lawmakers/legislation/campaigns/administration/military policy/executive actions/government legal decisions/drone strikes/war powers/presidential actions/congressional actions/Supreme Court decisions
- "tech" = anything related to technology, software, cybersecurity, hacking, tech industry
- "science" = research papers, scientific studies, methodology, academic research, scientific analysis
- Criminal cases involving hackers, cybercrime, tech fraud = "tech" NOT "politics"
- Legal/court cases about technology = "tech" NOT "politics"
- Military drone strikes, war powers, executive branch actions = "politics"
- Government policy debates (healthcare, immigration, etc.) = "politics"
- Articles discussing scientific research or papers should include "science" tag in addition to subject tag
- Only tag "politics" if it's about government officials, elections, policy-making, or government actions

Respond with ONLY valid JSON in this exact format:
[{"tag": "tech", "reason": "Article about cybersecurity breach"}]

Example for hacker arrest: [{"tag": "tech", "reason": "Criminal case involving cybercrime and hacking"}]`
    }

    return prompt
  },

  // Build prompt for feed classification (legacy)
  buildPrompt(feedData, existingTags) {
    const { title, site_url, recent_entries } = feedData

    const prompt = `You are helping classify RSS feeds into categories. Based on the feed information and recent article titles, suggest 1-3 relevant tags.

Feed Information:
- Title: ${title}
- URL: ${site_url}

Recent Article Titles:
${recent_entries.map((entry, i) => `${i + 1}. ${entry.title}`).join('\n')}

Existing tags in use: ${existingTags.length > 0 ? existingTags.join(', ') : 'none yet'}

Please suggest 1-3 tags that best categorize this feed. Consider categories like:
- politics, tech, science, business, sports, entertainment, personal, news, culture, health, finance, education, etc.

If the feed is clearly political in nature (government, elections, policy, politicians, activism), definitely include "politics".
If it's technology-focused (software, hardware, startups, programming), include "tech".

Try to reuse existing tags when appropriate to maintain consistency.

Respond with ONLY a comma-separated list of tags, nothing else. Example: tech, business, startups`

    return prompt
  },

  // Ollama - Classify entry
  async classifyEntryWithOllama(entryData, existingTags, settings, feedTags = []) {
    const url = settings.localLlmUrl || 'http://localhost:11434'
    const model = settings.localLlmModel || 'gemma3:4b'

    // For Qwen3 models, prepend instruction to disable thinking mode
    const isQwen3 = model.startsWith('qwen3')
    let prompt = this.buildEntryPrompt(entryData, existingTags, feedTags)

    if (isQwen3) {
      // Qwen3 has "thinking mode" - explicitly request direct response for speed
      prompt = 'Respond directly without thinking process. ' + prompt
    }

    console.log('[LLM] ===== OLLAMA REQUEST =====')
    console.log('[LLM] Entry Title:', entryData.title)
    console.log('[LLM] Feed:', entryData.feed_title)
    console.log('[LLM] Feed Tags (context):', feedTags)
    console.log('[LLM] Has full content:', !!entryData.content)
    console.log('[LLM] Content length (raw):', entryData.content ? entryData.content.length : 0)
    console.log('[LLM] Summary length:', entryData.summary ? entryData.summary.length : 0)
    console.log('[LLM] Existing tags:', existingTags)
    console.log('[LLM] Full prompt:', prompt)

    try {
      const requestBody = {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 200, // Increased from 100 to handle longer responses
        },
      }

      console.log('[LLM] Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        console.error('[LLM] Ollama HTTP error:', response.status, response.statusText)
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[LLM] ===== OLLAMA RAW RESPONSE =====')
      // Omit 'context' key (just token values) for cleaner logging
      const { context, ...dataWithoutContext } = data
      console.log('[LLM] Full response:', JSON.stringify(dataWithoutContext, null, 2))

      // Qwen3 uses "thinking" field in reasoning mode - check both fields
      const responseText = data.response || data.thinking || ''
      console.log('[LLM] Response text:', responseText)

      if (data.done_reason === 'length') {
        console.warn('[LLM] ⚠️ WARNING: Response was truncated due to token limit!')
      }

      const parsed = this.parseTags(responseText)
      console.log('[LLM] Parsed tags:', parsed.tags)
      console.log('[LLM] Tag reasons:', parsed.tagReasons)

      if (!parsed.tags || parsed.tags.length === 0) {
        console.warn('[LLM] ⚠️ WARNING: No tags were parsed from response!')
      }

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.8,
        provider: 'ollama',
      }
    } catch (error) {
      console.error('[LLM] Ollama error:', error)
      throw new Error(`Ollama classification failed: ${error.message}`)
    }
  },

  // Ollama (local) - Feed classification
  async classifyWithOllama(feedData, existingTags, settings) {
    const url = settings.localLlmUrl || 'http://localhost:11434'
    const model = settings.localLlmModel || 'gemma3:4b'
    const prompt = this.buildPrompt(feedData, existingTags)

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 100,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const parsed = this.parseTags(data.response)

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.8,
        provider: 'ollama',
      }
    } catch (error) {
      console.error('[LLM] Ollama error:', error)
      throw new Error(`Ollama classification failed: ${error.message}`)
    }
  },

  // Claude - Classify entry
  async classifyEntryWithClaude(entryData, existingTags, settings, feedTags = []) {
    const apiKey = settings.claudeApiKey
    if (!apiKey) {
      throw new Error('Claude API key not configured')
    }

    const prompt = this.buildEntryPrompt(entryData, existingTags, feedTags)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          temperature: 0.3,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.content[0].text
      const parsed = this.parseTags(responseText)

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.9,
        provider: 'claude',
      }
    } catch (error) {
      console.error('[LLM] Claude error:', error)
      throw new Error(`Claude classification failed: ${error.message}`)
    }
  },

  // Claude (Anthropic) - Feed classification
  async classifyWithClaude(feedData, existingTags, settings) {
    const apiKey = settings.claudeApiKey
    if (!apiKey) {
      throw new Error('Claude API key not configured')
    }

    const prompt = this.buildPrompt(feedData, existingTags)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          temperature: 0.3,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.content[0].text
      const parsed = this.parseTags(responseText)

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.9,
        provider: 'claude',
      }
    } catch (error) {
      console.error('[LLM] Claude error:', error)
      throw new Error(`Claude classification failed: ${error.message}`)
    }
  },

  // OpenAI - Classify entry
  async classifyEntryWithOpenAI(entryData, existingTags, settings, feedTags = []) {
    const apiKey = settings.openaiApiKey
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = this.buildEntryPrompt(entryData, existingTags, feedTags)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.choices[0].message.content
      const parsed = this.parseTags(responseText)

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.9,
        provider: 'openai',
      }
    } catch (error) {
      console.error('[LLM] OpenAI error:', error)
      throw new Error(`OpenAI classification failed: ${error.message}`)
    }
  },

  // OpenAI - Feed classification
  async classifyWithOpenAI(feedData, existingTags, settings) {
    const apiKey = settings.openaiApiKey
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = this.buildPrompt(feedData, existingTags)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.choices[0].message.content
      const parsed = this.parseTags(responseText)

      return {
        tags: parsed.tags,
        tagReasons: parsed.tagReasons,
        confidence: 0.9,
        provider: 'openai',
      }
    } catch (error) {
      console.error('[LLM] OpenAI error:', error)
      throw new Error(`OpenAI classification failed: ${error.message}`)
    }
  },

  // Parse tags from LLM response
  parseTags(response) {
    // Clean up response
    let cleaned = response.trim()

    // Try to parse as JSON first
    try {
      // Extract JSON array from response (handle cases where LLM adds extra text)
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed)) {
          // Convert to our format: { tags: [...], tagReasons: {...} }
          // Use Set to ensure uniqueness
          const tagSet = new Set()
          const tagReasons = {}

          parsed.forEach((item) => {
            const tag = item.tag.toLowerCase().trim()
            tagSet.add(tag)
            tagReasons[tag] = item.reason
          })

          const tags = Array.from(tagSet)
          return { tags, tagReasons }
        }
      }
    } catch (e) {
      console.warn('[LLM] Failed to parse JSON, falling back to text parsing:', e)
    }

    // Fallback: try old format "Tags: ... Reason: ..."
    const tagsMatch = cleaned.match(/Tags:\s*([^\n]+)/i)
    const reasonMatch = cleaned.match(/Reason:\s*([^\n]+)/i)

    let tags = []
    let reason = ''

    if (tagsMatch) {
      const tagsStr = tagsMatch[1].trim()

      // Handle "none" response
      if (tagsStr.toLowerCase() === 'none' || tagsStr.toLowerCase() === 'no tags') {
        tags = []
      } else {
        // Extract tags (comma or semicolon separated)
        const tagSet = new Set(
          tagsStr
            .split(/[,;]/)
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length < 30)
            .filter((tag) => /^[a-z0-9\s-]+$/i.test(tag)) // Only alphanumeric, spaces, hyphens
        )
        tags = Array.from(tagSet).slice(0, 5) // Max 5 unique tags
      }
    } else {
      // Fallback: try to extract tags from unstructured response
      const firstLine = cleaned.split('\n')[0]
      const tagSet = new Set(
        firstLine
          .replace(/^(tags:\s*|suggested tags:\s*|categories:\s*)/i, '')
          .split(/[,;]/)
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length < 30)
          .filter((tag) => /^[a-z0-9\s-]+$/i.test(tag))
      )
      tags = Array.from(tagSet).slice(0, 5)
    }

    if (reasonMatch) {
      reason = reasonMatch[1].trim()
    }

    // Old format: single reason for all tags
    const tagReasons = {}
    if (reason) {
      tags.forEach((tag) => {
        tagReasons[tag] = reason
      })
    }

    return { tags, tagReasons }
  },

  // Test connection to LLM
  async testConnection(settings) {
    const provider = settings.llmProvider || 'local'

    try {
      switch (provider) {
        case 'local': {
          const url = settings.localLlmUrl || 'http://localhost:11434'
          const response = await fetch(`${url}/api/tags`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) throw new Error('Cannot connect to Ollama')
          const data = await response.json()
          console.log('[LLM] Ollama models:', data)
          return { success: true, message: 'Connected to Ollama' }
        }

        case 'claude': {
          if (!settings.claudeApiKey) {
            throw new Error('Claude API key not configured')
          }
          // Simple test request
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': settings.claudeApiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'Hi' }],
            }),
          })
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Invalid API key')
          }
          return { success: true, message: 'Connected to Claude' }
        }

        case 'openai': {
          if (!settings.openaiApiKey) {
            throw new Error('OpenAI API key not configured')
          }
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              Authorization: `Bearer ${settings.openaiApiKey}`,
            },
          })
          if (!response.ok) throw new Error('Invalid API key')
          return { success: true, message: 'Connected to OpenAI' }
        }

        default:
          throw new Error('Unknown provider')
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LLM = LLM
}
