# Ollama Models for Fast Article Classification

**Last Updated:** November 2, 2025 (verified with online search)

Current model: **gemma3:4b** (~2-5 seconds per article)

## 🆕 Latest Models (2025)

### **NEW: Qwen3 Series** (Released April 2025) ⭐⭐⭐
The newest generation, now available on Ollama!

```bash
ollama pull qwen3:0.6b   # Smallest (600M params)
ollama pull qwen3:1.7b   # Small (1.7B params)
ollama pull qwen3:4b     # Medium (4B params)
ollama pull qwen3:8b     # Larger (8B params)
```

**Why Qwen3 is Best for Classification:**
- **Latest technology** - Released April 2025, beats DeepSeek-R1 and Llama4 in benchmarks
- **"Non-Thinking Mode"** - Fast, direct responses for simpler queries (perfect for classification)
- **Excellent output structuring** - Better at following JSON format instructions
- **Multiple sizes** - From 0.6B (ultra-fast) to 8B (more accurate)

**Recommended:** Start with **`qwen3:1.7b`** or **`qwen3:4b`**

### **NEW: DeepSeek-R1 with Qwen3 Base** (Released May 2025)
```bash
ollama pull deepseek-r1:1.5b    # Smallest distilled
ollama pull deepseek-r1:7b      # Distilled
ollama pull deepseek-r1:8b      # Qwen3-based (latest version)
```

**Good for:** Complex reasoning tasks, but **overkill for simple classification**
**Speed:** Slightly slower than Qwen3 due to reasoning overhead
**Note:** The 8B version is based on Qwen3 but optimized for reasoning, not speed

## Recommended Models for Classification

### 🥇 **qwen3:1.7b** - NEW Best Choice (2025) ⭐⭐⭐
```bash
ollama pull qwen3:1.7b
```
- **Size:** 1.1GB (1.7B parameters)
- **Speed:** Extremely fast (smaller than qwen2.5)
- **Accuracy:** Excellent (latest generation)
- **Strengths:** Non-thinking mode for fast classification, excellent JSON output
- **Why it's good:** Latest Qwen model, specifically designed for efficiency
- **Expected speed:** 0.5-1 second per article (5x faster than current!)
- **Released:** April 2025

### 🥈 **qwen3:4b** - Best Balance (2025)
```bash
ollama pull qwen3:4b
```
- **Size:** 2.5GB (4B parameters)
- **Speed:** Very fast
- **Accuracy:** Excellent for nuanced classification
- **Strengths:** Handles edge cases well, latest generation
- **Why it's good:** Sweet spot between speed and accuracy
- **Expected speed:** 1-2 seconds per article (3x faster than current)
- **Released:** April 2025

### 🥉 **qwen2.5:3b** - Previous Best Choice
```bash
ollama pull qwen2.5:3b
```
- **Size:** 2.0GB
- **Speed:** Very fast (3B parameters)
- **Accuracy:** Excellent for classification tasks
- **Strengths:** Strong instruction following, JSON output, reasoning
- **Why it's good:** Qwen2.5 series specifically optimized for reasoning tasks
- **Expected speed:** 1-2 seconds per article (2-3x faster than current)

### 🥈 **phi3:mini** - Best Speed/Accuracy Ratio
```bash
ollama pull phi3:mini
```
- **Size:** 2.2GB (3.8B parameters)
- **Speed:** Very fast
- **Accuracy:** Excellent for structured tasks
- **Strengths:** Microsoft trained, strong at following instructions, good with JSON
- **Why it's good:** Specifically designed for efficiency
- **Expected speed:** 1-2 seconds per article

### 🥉 **gemma2:2b** - Fastest Option
```bash
ollama pull gemma2:2b
```
- **Size:** 1.6GB
- **Speed:** Extremely fast (smallest viable model)
- **Accuracy:** Good for simple classification
- **Strengths:** Very low resource usage, fast inference
- **Trade-off:** May struggle with nuanced cases (politics vs tech edge cases)
- **Expected speed:** 0.5-1 second per article (5x faster than current)

## If You Want More Accuracy

### **qwen2.5:7b** - Best Accuracy
```bash
ollama pull qwen2.5:7b
```
- **Size:** 4.7GB
- **Speed:** Moderate (slower than 3B models)
- **Accuracy:** Excellent reasoning and classification
- **Why it's good:** Better at handling edge cases, nuanced content
- **Expected speed:** 2-3 seconds per article (similar to current)

### **llama3.2:3b** - Good Alternative
```bash
ollama pull llama3.2:3b
```
- **Size:** 2.0GB
- **Speed:** Fast
- **Accuracy:** Very good, Meta's latest small model
- **Strengths:** Good instruction following, recent model
- **Expected speed:** 1-2 seconds per article

## Quantization for Speed

All models available in different quantizations:

```bash
# Faster variants (less accurate, but faster)
ollama pull qwen2.5:3b-q4_0      # 4-bit quantization (faster)
ollama pull qwen2.5:3b-q4_K_M    # 4-bit K-quant medium (balanced)
ollama pull qwen2.5:3b-q8_0      # 8-bit quantization (more accurate)

# Default (when no suffix) is usually Q4_K_M
```

**Recommendation:** Stick with default quantization unless you need extreme speed.

## Comparison Table

| Model | Size | Speed | Accuracy | Best For | Command |
|-------|------|-------|----------|----------|---------|
| **qwen3:1.7b** ⭐⭐⭐ NEW | 1.1GB | ⚡⚡⚡⚡ | ★★★★☆ | Speed + accuracy | `ollama pull qwen3:1.7b` |
| **qwen3:4b** ⭐⭐ NEW | 2.5GB | ⚡⚡⚡☆ | ★★★★★ | Best accuracy | `ollama pull qwen3:4b` |
| **qwen2.5:3b** ⭐ | 2.0GB | ⚡⚡⚡ | ★★★★☆ | Previous best | `ollama pull qwen2.5:3b` |
| **phi3:mini** | 2.2GB | ⚡⚡⚡ | ★★★★☆ | Structured output | `ollama pull phi3:mini` |
| **gemma2:2b** | 1.6GB | ⚡⚡⚡⚡ | ★★★☆☆ | Maximum speed | `ollama pull gemma2:2b` |
| **qwen2.5:7b** | 4.7GB | ⚡⚡☆☆ | ★★★★★ | Best accuracy | `ollama pull qwen2.5:7b` |
| **llama3.2:3b** | 2.0GB | ⚡⚡⚡☆ | ★★★★☆ | Meta's latest | `ollama pull llama3.2:3b` |
| gemma3:4b (current) | 2.6GB | ⚡⚡☆☆ | ★★★★☆ | Current baseline | - |

## NOT Recommended for Classification

❌ **Vision/Multimodal models** (we don't need image understanding)
- `llama3.2-vision:11b` - Overkill, includes vision
- `llava:7b` - Multimodal, slower

❌ **Large models** (too slow for batch classification)
- `llama3.1:70b` - Way too slow
- `qwen2.5:32b` - Overkill

## 🎯 Recommendation: Try This Order (Updated 2025)

1. **Start with `qwen3:1.7b`** ⭐⭐⭐ - Latest model, excellent speed/accuracy balance
2. If not accurate enough → Try `qwen3:4b` (same generation, more parameters)
3. If still need more accuracy → Try `qwen3:8b` or fallback to `qwen2.5:7b`
4. Alternative: `phi3:mini` or `gemma2:2b` (older but proven)

## 💡 BONUS: Qwen3-Embedding for Instant Classification

For MAXIMUM SPEED, consider using **Qwen3-Embedding** instead of full LLM:

```bash
ollama pull qwen3-embedding:0.6b    # Ultra-fast embeddings
```

**How it works:**
- Generate embeddings (vector representations) for each tag description once
- Generate embedding for each article
- Compare similarity (cosine distance) - takes milliseconds!
- **50-100x faster than full LLM** (milliseconds vs seconds)

**Trade-off:** Slightly less nuanced than full LLM reasoning

See `faster-classification.md` for full embedding approach details.

## Testing Commands

```bash
# Pull the model
ollama pull qwen2.5:3b

# Quick test
ollama run qwen2.5:3b "Classify this article into politics or tech: Trump administration announces new drone strike policy"

# In your extension settings
# Change: localLlmModel: 'qwen2.5:3b'
```

## Expected Real-World Performance

With **5 concurrent classifications**:

| Model | Per Article | 50 Articles | 100 Articles |
|-------|-------------|-------------|--------------|
| gemma3:4b (current) | 2-5s | ~60s | ~120s |
| **qwen2.5:3b** | 1-2s | ~30s | ~60s |
| **phi3:mini** | 1-2s | ~30s | ~60s |
| **gemma2:2b** | 0.5-1s | ~15s | ~30s |
| qwen2.5:7b | 2-3s | ~50s | ~100s |

## 🎯 My Updated Recommendation (Nov 2025)

**⚠️ UPDATED: `qwen3:1.7b` is too small for complex classification prompts**

After testing: qwen3:1.7b doesn't follow instructions reliably (returns tags not in list, slow thinking mode).

**NEW Recommendation: Try `gemma2:2b` first** ⭐⭐⭐

Why:
- **Proven to work** - Well-tested, reliable instruction following
- **Very fast** - 1.6GB, smaller than gemma3:4b (3-5x faster expected)
- **No thinking mode** - Direct responses
- **Handles complex prompts** - Better at following "only use these tags" rule
- **Expected speed:** 0.5-1s per article

**Quick Test:**
```bash
ollama pull gemma2:2b

# Test it
ollama run gemma2:2b "Classify as politics or tech: Trump administration announces new drone strike policy"
```

Then in popup settings, change model to: `gemma2:2b`

**If you need more accuracy:** Try `qwen2.5:3b` or `phi3:mini` (2-3x faster than current)
**If accuracy is most important:** Stick with `gemma3:4b` (current baseline)

## Real-World Performance Estimates (Updated)

With **5 concurrent classifications**:

| Model | Per Article | 50 Articles | 100 Articles | vs Current | Notes |
|-------|-------------|-------------|--------------|------------|-------|
| gemma3:4b (current) | 2-5s | ~60s | ~120s | baseline | Reliable |
| **gemma2:2b** ⭐ | 0.5-1s | ~15s | ~30s | **4x faster** | Best for speed |
| **qwen2.5:3b** ⭐ | 1-2s | ~30s | ~60s | **2x faster** | Best balance |
| phi3:mini | 1-2s | ~30s | ~60s | 2x faster | Good alt |
| qwen3:1.7b ❌ | slow | n/a | n/a | - | Too small, breaks rules |
| deepseek-r1:8b | 2-3s | ~50s | ~100s | similar | Overkill |

**For instant classification:** Consider `qwen3-embedding` (milliseconds!) - see embedding approach in `faster-classification.md`
