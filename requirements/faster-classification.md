# Faster Article Classification - Requirements & Exploration

## Current State (v1)

**Method:** Full LLM inference with Ollama (gemma3:4b)
- **Speed:** ~2-5 seconds per article
- **Accuracy:** Good (with proper prompts)
- **Concurrency:** 5 articles at once
- **Content:** Uses up to 2000 chars of article text

## Problem Statement

Can we classify articles faster while maintaining accuracy?

## Potential Approaches

### 1. **Embedding-Based Classification** ⭐ Most Promising
**How it works:**
- Use sentence embeddings (vector representations) of articles
- Compare article embedding to tag description embeddings
- Fast cosine similarity comparison instead of full LLM inference
- Can run entirely in browser with ONNX runtime

**Pros:**
- 10-100x faster than LLM (milliseconds vs seconds)
- Can run in browser (no server needed)
- Deterministic results
- Very low resource usage

**Cons:**
- Initial setup complexity
- Need to define tag descriptions clearly
- May be less nuanced than LLM
- Requires downloading embedding model (~25-50MB)

**Libraries:**
- `transformers.js` - Run models in browser with ONNX
- `all-MiniLM-L6-v2` - Popular small embedding model (23MB)
- `sentence-transformers` - If using Python backend

**Example flow:**
```javascript
// One-time: Generate tag embeddings
const tagEmbeddings = {
  "tech": embed("Technology, software, hardware, cybersecurity..."),
  "politics": embed("Government, elections, policy, legislation..."),
  "science": embed("Research, scientific studies, methodology...")
};

// Per article (fast):
const articleEmbedding = embed(articleText);
const scores = computeSimilarity(articleEmbedding, tagEmbeddings);
const topTags = getTopN(scores, 2);
```

### 2. **Two-Stage Classification**
**How it works:**
- Stage 1: Fast embedding-based classification (milliseconds)
- Stage 2: LLM verification only for uncertain cases (low confidence scores)

**Pros:**
- Best of both worlds: speed + accuracy
- Most articles classified instantly
- LLM only for edge cases

**Cons:**
- More complex implementation
- Need to determine confidence threshold

### 3. **Smaller/Quantized Models**
**How it works:**
- Use quantized models (4-bit, 8-bit) like `gemma3:2b-q4`
- Trade slight accuracy loss for 2-3x speed gain

**Pros:**
- Easy to implement (just change model name)
- Still full LLM reasoning
- Lower memory usage

**Cons:**
- Still slower than embeddings
- May reduce accuracy

### 4. **Keyword-Based Pre-filtering**
**How it works:**
- Check for obvious keywords first
- If clear match, skip LLM entirely
- Example: "Trump", "Congress" → politics (no LLM needed)

**Pros:**
- Instant for obvious cases
- Easy to implement
- No additional dependencies

**Cons:**
- Only helps with obvious articles
- Brittle (keywords must be maintained)
- Doesn't help with nuanced content

### 5. **Caching**
**How it works:**
- Hash article content + tags
- Cache classification results
- Reuse for identical/similar articles

**Pros:**
- Instant for duplicates
- Zero accuracy loss
- Easy to implement

**Cons:**
- Limited benefit (most articles unique)
- Storage overhead
- Cache invalidation complexity

## Recommended Approach

**Phase 1: Embedding-Based Classification** ⭐

Implement embedding-based classification as primary method:

1. Use `transformers.js` to run `all-MiniLM-L6-v2` in browser
2. Generate embeddings for tag descriptions once
3. Classify articles using cosine similarity
4. Add confidence threshold

**Benefits:**
- 50-100x faster (milliseconds instead of seconds)
- No external API calls needed
- Works offline after model download
- Can classify entire feed instantly

**Implementation complexity:** Medium
**Expected timeline:** 1-2 days

**Phase 2: Hybrid Approach (Optional)**

Add LLM fallback for low-confidence cases:
- Confidence > 0.7 → Use embedding result
- Confidence < 0.7 → Fall back to LLM

## Open Questions

1. **How accurate are embeddings compared to LLM?**
   - Need to test on sample of 50-100 articles
   - Compare embedding classifications vs LLM classifications

2. **What's the actual speed difference?**
   - Benchmark both approaches
   - Measure: load time, classification time, memory usage

3. **Model size tradeoff?**
   - `all-MiniLM-L6-v2`: 23MB, very fast
   - `all-mpnet-base-v2`: 438MB, more accurate
   - Which is better for browser extension?

4. **Tag description quality?**
   - How should we phrase tag descriptions for best embedding matching?
   - Example: "politics" → "Government, elections, policy, lawmakers, legislation..."

## Success Metrics

- **Speed:** < 100ms per article (vs current 2-5 seconds)
- **Accuracy:** > 90% match with LLM classifications
- **UX:** Classify entire feed page instantly on load
- **Size:** < 50MB model download

## Next Steps

1. [ ] Research `transformers.js` integration
2. [ ] Prototype embedding-based classification
3. [ ] Benchmark speed on 100 articles
4. [ ] Compare accuracy vs LLM on same 100 articles
5. [ ] Decide: embeddings only, or hybrid approach?

## References

- [transformers.js](https://github.com/xenova/transformers.js) - Run transformers in browser
- [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) - Small embedding model
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) - Run ML models in browser
