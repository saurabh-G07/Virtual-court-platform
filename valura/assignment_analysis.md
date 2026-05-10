# Valura AI Assignment: Final Deep Dive Analysis (Top 5% Lead Engineer Mindset)

This document represents the ultimate, pragmatic breakdown of the Valura AI assignment. It synthesizes the core business requirements with strict determinism, latency optimization, and "failure-first" engineering decisions.

---

## 1. The "Pragmatic Lead Engineer" Architecture
A top-tier Lead Engineer knows when *not* to over-engineer. We prioritize system stability, ultra-low latency (<2s), and absolute determinism.

**Why This Architecture Works Long-Term:**
- **Failure-First Design:** We design fallback paths before happy paths.
- **Cost & Determinism First:** The entire pipeline uses **exactly one LLM call** per query. We aggressively avoid secondary LLM calls.
- **Decoupled Execution:** Agents are pure plug-and-play modules. Safety is an isolated, zero-cost layer.

---

## 2. Core Components & Pragmatic Strategies

### Component 1: The Safety Guard
- **Role:** Synchronous, zero-cost filter (< 10ms).
- **Mechanism:** Pattern detection alongside intent framing, with strict **allowlist overrides** to pass educational queries (e.g., block "how to do insider trading", allow "what is insider trading?").

### Component 2: The Intent Classifier (The Brain)
- **Role:** The routing brain and entity extractor.
- **Prompt Design Strategy:** A simple prompt will fail. We will enforce strict JSON schemas (`response_format={"type": "json_object"}`), explicitly provide the allowed taxonomy list (agent names), and use few-shot examples to guarantee the 85% routing threshold.
- **Classifier Accuracy Strategy (>=85%):** A prompt is not enough. We implement strict post-processing:
  1. *Context Extraction:* If no ticker in query, extract from history.
  2. *Normalization:* Aggressive post-processing (e.g., `ticker.upper().split(".")[0]`).
  3. *Fallback:* If still missing or low confidence, fallback to the support agent instead of guessing.

### Component 3: Agents & Standardized Contracts
- **Agent Contract Standardization:** A scalable system relies on strict contracts. ALL agents (including stubs and Portfolio Health) will emit a standardized schema: `{"agent": "...", "intent": "...", "entities": {...}, "output": {...}, "status": "success|not_implemented"}`. This makes debugging and scaling trivial.
- **The Pragmatic Decision (Portfolio Health):** We will **NOT** use an LLM for the observations. Using an LLM adds a second network call, doubling cost and latency, and risking flaky tests. Instead, observations will be purely **rule-based** (e.g., `if top_position > 50%: return "A large portion of your money is in one stock, which can be risky..."`).
- **The Market Data Decision:** We will **NOT** use live `yfinance` calls. Live APIs add unpredictable latency and CI instability. We will use simplified deterministic logic and fixed FX normalization factors, explicitly stating in the README that we chose determinism and speed for the demo.

### Component 4: The HTTP Layer & Streaming Protocol
- **Honest Latency Strategy (<2s first token):** Since classification is required before routing, first-token latency is mathematically bounded by the initial classifier LLM call. To optimize *perceived* latency, we ensure immediate streaming begins the exact millisecond the agent produces output, avoiding any post-processing delays.
- **Backpressure Handling:** Streaming is implemented using async generators to ensure backpressure handling—clients consume data at their own pace without blocking the server.
- **Strict Timeouts:** Wrapping calls in `asyncio.wait_for(llm_call, timeout=5)`.
- **SSE Error Protocol:** Errors are never stack traces. We define a strict schema:
  ```json
  event: error
  data: {"type": "timeout", "message": "Request took too long"}
  ```

### Component 5: Session Memory Design
- **Bounded In-Memory Structure:** We prevent memory bloat by strictly capping history.
  ```python
  sessions = {
    session_id: [
      {"role": "user", "content": "..."},
      {"role": "assistant", "content": "..."}
    ] # Capped at last N messages
  }
  ```

---

## 3. Explicit Failure Mode Handling

We define exact behaviors for the following critical failures:
1. **LLM returns invalid JSON:** Caught by Pydantic; routes to safe fallback.
2. **Timeout from LLM:** Caught by `asyncio`; returns formatted SSE error.
3. **Empty or Corrupt Portfolio:** Validated via strict Pydantic user models; $0 portfolios pivot to educational "BUILD" paths.
4. **Unknown Intent:** Fallback routing asking the user for clarification.
5. **SSE Stream breaks:** Async exception boundaries clean up resources silently.

---

## 4. Stretch Goals & Evaluation Metrics
- **Testing:** Offline `pytest` mocking all LLM calls. Custom matcher for subset normalization.
- **Stretch Goals:** Dedupe cache, Embedding pre-classifier, Per-tenant model selection, Rate limiting.
