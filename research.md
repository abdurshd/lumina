Below is a research-backed, implementation-oriented plan for turning **Lumina** into a real multimodal “strengths + direction” system using the **latest Gemini APIs** (Live, multimodal, tool use, File Search RAG, TTS), plus a **ready-to-copy `CLAUDE.md`** you can drop into the repo.

One important blocker first: I **still can’t access** `https://github.com/abdurshd/lumina` — it consistently returns a GitHub 404 from my side. I _can_ access your GitHub profile and other public repos, but **“lumina” doesn’t appear there yet**. So I can’t truthfully describe the current code state of that specific repo. I’ll still give you a detailed plan that fits your described product and Gemini’s current capabilities, and it will be immediately actionable. If you paste the correct repo URL (or upload a ZIP), I can tailor the plan precisely to your codebase structure.

---

## What Gemini APIs can do (and what model mix you actually need) in 2026

### 1) Real-time voice/video calls: **Gemini Live API**

- Gemini’s **Live API** is designed for **low-latency, real-time voice and video interactions** with streaming input/output. ([Google AI for Developers][1])
- Live sessions have **time constraints** (and WebSocket connections also have limits), but Gemini provides **context window compression** and **session resumption** to run longer experiences without losing continuity. ([Google AI for Developers][2])
- Audio in Live API is **raw 16‑bit PCM** (little-endian). Output is **24kHz**, and input is natively **16kHz** (but it can resample). ([Google AI for Developers][3])

### 2) Security for client-side Live connections: **Ephemeral tokens**

- If you connect to Live API **directly from the browser** (recommended for latency), you should not ship a long-lived API key. Gemini provides **ephemeral tokens** that are short-lived and can be constrained (model/config lock-down). ([Google AI for Developers][4])
- These tokens are currently **only compatible with Live API**. ([Google AI for Developers][4])

### 3) Tool use during Live sessions

- Live API supports **function calling** (manual tool-response handling required) and **Google Search grounding** on supported Live models. ([Google AI for Developers][5])
- The key constraint: Live API does **not** provide the same “automatic tool execution” flow as standard `generateContent`; you must implement tool call handling yourself. ([Google AI for Developers][5])

### 4) Gemini 3 Pro / Flash are great for reasoning… but **not Live**

This matters for your architecture:

- **Gemini 3 Pro Preview** and **Gemini 3 Flash Preview** support multimodal input, function calling, structured outputs, etc.
- But they **do not support the Live API**. ([Google AI for Developers][6])
- The currently documented Live model is **Gemini 2.5 Flash Native Audio** (example: `gemini-2.5-flash-native-audio-preview-12-2025`) which _does_ support Live API. ([Google AI for Developers][6])

**Implication:**
You’ll run a **dual-model system**:

- **Live sessions:** `gemini-2.5-flash-native-audio-…` for realtime voice/video
- **Deep analysis + structured career outputs:** `gemini-3-pro-preview` (and/or `gemini-3-flash-preview`) ([Google AI for Developers][6])

### 5) TTS + STT strategy

- Gemini has **TTS generation** via standard Gemini API (separate from Live), including single- and multi-speaker TTS, and it’s explicitly positioned as different from Live speech generation. ([Google AI for Developers][7])
- Gemini can do “audio understanding” tasks like transcription, diarization, etc., but the docs note it **doesn’t support real-time transcription** via the non-Live endpoints; for real-time you use Live API or dedicated Speech-to-Text. ([Google AI for Developers][8])

### 6) “Import everything about the user” via RAG: **Gemini File Search tool**

- Gemini API includes a **File Search tool**: a fully managed RAG system that imports, chunks, indexes your data and retrieves relevant context at query time. ([Google AI for Developers][9])
  This is very relevant for:
- uploaded exports (Notion exports, chat exports, essays)
- transcripts from Live sessions
- resumes, PDFs, school documents

### 7) SDK best practice (important for speed + correctness)

Google strongly recommends using the **Google GenAI SDK** (`google-genai` / `@google/genai`) and avoiding legacy libraries. ([GitHub][10])

---

## Online research: similar products and what to learn from them

Your product is basically: **career direction + strengths discovery** with a modern multimodal AI coach. The closest existing patterns:

### YouScience (education-focused aptitude + career discovery)

- Designed for students; uses assessments to uncover **aptitudes** and match to **career/education pathways**. ([YouScience][11])
  **Takeaway:** “Interest-only” is weak; mixing **aptitudes + interests + exploration** is stronger.

### Pymetrics (game-based behavioral assessment for hiring)

- Uses **gamified assessments** informed by neuroscience/behavioral signals for matching candidates to roles. ([Digital Data Design Institute at Harvard][12])
  **Takeaway:** Game-like micro-tasks work well to reveal stable tendencies, but you must be careful about **fairness, validity, transparency**.

### O\*NET career exploration tools (highly credible public reference)

- U.S. Department of Labor provides self-directed career exploration tools (like Interest Profiler, work values tools) and explicitly positions them for students exploring school-to-work transitions. ([DOL][13])
  **Takeaway:** Anchor your matching layer in **established taxonomies** (e.g., RIASEC interests, work values, career clusters) so recommendations are explainable and less “LLM vibes-based.”

---

## A fast, correct architecture for Lumina

### Core product loop

1. **Consent + onboarding** (what data you’ll use, what you won’t infer, privacy controls)
2. **Signal collection** (adaptive quizzes + conversation + optional imports)
3. **Profile synthesis** (structured strengths/values/interests/skills with confidence levels)
4. **Recommendations** (career clusters + fields + next experiments)
5. **Iteration loop** (micro-challenges, reflections, updated profile)

### High-level system design (recommended)

**Frontend (Web first)**

- Next.js (or similar) app:
  - “Talk to Lumina” Live call screen (mic + optional camera)
  - Quiz screen (adaptive “smart quizzes”)
  - Data import screen (uploads + OAuth connectors)
  - Results dashboard (profile + career matches + evidence)

**Backend**

- API server (Node/TS recommended if your UI is JS/TS):
  - Auth (user accounts)
  - Ephemeral token minting endpoint for Live API ([Google AI for Developers][4])
  - Tool router for Live function calls ([Google AI for Developers][5])
  - Ingestion pipelines (Gmail/Notion/uploads)
  - “Profile compiler” jobs (Gemini 3 structured outputs)
  - Data store (Postgres) + object store (S3/GCS)

**AI Orchestration**

- **Live Session Agent (2.5 Native Audio)**
  - goal: natural conversation, collect signals, ask follow-ups, run lightweight in-call actions

- **Synthesis Agent (Gemini 3 Pro)**
  - goal: produce validated structured profile + career matches + next steps, with evidence

- **Quiz Builder Agent (Gemini 3 Flash)**
  - goal: generate/adapt quiz items + scoring rubrics + ensure question diversity

**RAG / user-memory**

- Use **File Search** for uploaded documents and transcripts when you want managed RAG. ([Google AI for Developers][9])
- Or use your own vector DB (pgvector) if you want full control.
  My practical recommendation:
- start with **File Search** for speed
- move to pgvector if costs/controls require it

---

## The most important product constraint: don’t “read someone’s destiny from their face”

You mentioned analyzing “face, mimics, body” during video calls.

Be careful: that quickly becomes “biometric + sensitive trait inference,” which is risky and often not scientifically valid for career fit.

**Safer, still powerful approach:**

- Use camera primarily for:
  - showing artifacts (projects, sketches, portfolio work)
  - interactive exercises (“show me something you built”)
  - engagement UX (presence, turn-taking), not personality diagnosis

- Base strengths/career suggestions primarily on:
  - self-report instruments (interests, values)
  - performance tasks (micro-challenges)
  - user history (documents/achievements)
  - conversation content

This also makes your system easier to defend ethically and legally.

---

## Implementation plan: build a real MVP fast, then scale

### Phase 0 — Unblock repo + baseline quality (1–2 days of work)

**Deliverables**

- Monorepo or clean single repo structure
- Environment setup documented
- CI (lint/test/build)

**Tasks**

- Add `.env.example`
- Add a “system architecture” doc (short)
- Add `CLAUDE.md` (provided below)
- Ensure you’re using **Google GenAI SDK** consistently ([GitHub][10])

---

### Phase 1 — Live voice agent (the wow moment)

**Goal:** user can talk to Lumina in real time and it feels good.

**Key decisions**

- Use **Live API** for real-time voice (and optional camera). ([Google AI for Developers][1])
- Use **ephemeral tokens** so the browser can connect securely without exposing your long-lived key. ([Google AI for Developers][4])
- Implement **session resumption** + handle `GoAway` messages so calls don’t abruptly die. ([Google AI for Developers][2])

**Tasks**

- Frontend audio capture → PCM stream
- Connect to Live API with `@google/genai` live client (or raw WS if needed)
- Render streaming audio output
- Store:
  - transcript
  - key extracted “signals” (interests mentioned, dislikes, achievements)

- Add “call summary” button:
  - after call ends, run Gemini 3 Flash to produce a structured summary

**Technical gotchas to handle**

- Live audio format requirements (PCM 16-bit; output 24k). ([Google AI for Developers][3])
- Connection lifetime ~10 minutes; implement resumption. ([Google AI for Developers][2])

---

### Phase 2 — Smart quizzes (adaptive + explainable)

**Goal:** the system can collect structured signals quickly even without a call.

**Quiz modules (suggested)**

1. **Interests (RIASEC-inspired)**
2. **Work values** (autonomy, stability, helping others, etc.)
3. **Strengths & skills** (self-report + mini scenarios)
4. **Learning style / environment preferences** (not “personality typing,” more practical)
5. **Constraint capture** (location, money, time, family constraints)

**Implementation approach**

- Use Gemini 3 Flash to generate question sets in JSON schema
- Score with explicit rubrics:
  - deterministic scoring for multiple-choice
  - rubric-based scoring for open ended (Gemini 3 Pro with structured output)

**Deliverables**

- `/quiz` UI
- `/api/quiz/generate` and `/api/quiz/score`
- User profile DB tables: `signals`, `quiz_responses`, `profile_versions`

---

### Phase 3 — Data ingestion: uploads first, connectors second

**Goal:** let users import “evidence,” but keep it controlled.

**Start with Uploads**

- Upload:
  - resume PDF
  - portfolio PDF
  - Notion export (zip/html/markdown)
  - “Chat export” files (user-provided)

- Feed into File Search store for retrieval. ([Google AI for Developers][9])

**Then add OAuth connectors**

- Gmail, Calendar (Google APIs) — only if you can do consent + scopes cleanly
- Notion OAuth
- “Computer files” is hardest—treat as an on-device optional agent later

**Critical design rule**

- Make ingestion **opt-in per source**
- Show exactly what you imported
- Allow deletion per source and “delete all”

---

### Phase 4 — Career matching engine (structured + grounded)

**Goal:** give results that don’t feel random.

**Data model**

- `UserSignal`: atomic facts (e.g., “likes organizing events”, “hates repetitive tasks”, “did robotics club”)
- `Evidence`: link to transcript segment / doc snippet
- `Profile`: computed aggregate with confidence scores
- `Recommendation`: career cluster + “why” + “try next”

**How to generate results**

- Use Gemini 3 Pro with **structured outputs**:
  - `ProfileSchema`
  - `RecommendationSchema`

- Use RAG over the user’s own docs/transcripts (File Search) to cite evidence
- Optionally ground to public career databases later (O\*NET), but keep MVP simple and explainable

**Output UI**

- Top 5 career clusters
- For each: “why you,” “what you’d do,” “how to test cheaply,” “skills to build”

---

### Phase 5 — Live agent + tools: make the conversation actionable

**Goal:** Lumina can do things mid-call.

Examples of Live function calls:

- `start_quiz_module(moduleId)`
- `save_user_signal(signal)`
- `fetch_user_profile()`
- `schedule_next_step()` (if you integrate calendar later)

Live tool use notes:

- You must manually handle tool calls and send `FunctionResponse` back. ([Google AI for Developers][5])

---

### Phase 6 — Safety, trust, evaluation (this is what makes it real)

**Trust features**

- “Why am I seeing this recommendation?”
- “What evidence supports this?”
- Confidence meter
- “Disagree” button → updates model

**Evaluation**

- Create a small internal benchmark:
  - 20 synthetic user profiles
  - expected cluster outputs
  - regression test the `ProfileCompiler` prompt+schema

- Track:
  - completion rate
  - user satisfaction
  - recommendation stability over time
  - bias audits (at minimum: check for gender/race stereotypes in outputs)

---

## Recommended tech stack (fast + production-credible)

- **Frontend:** Next.js + Web Audio API + (optional) camera capture
- **Backend:** Node.js (Fastify/Express) or Next API routes
- **DB:** Postgres (user + signals + profile versions)
- **Queue:** BullMQ / Cloud Tasks
- **Storage:** S3/GCS for uploads
- **AI:**
  - Live: `gemini-2.5-flash-native-audio-preview-12-2025` ([Google AI for Developers][6])
  - Reasoning/synthesis: `gemini-3-pro-preview` ([Google AI for Developers][6])
  - Fast quiz generation: `gemini-3-flash-preview` ([Google AI for Developers][6])
  - TTS (non-live): `gemini-2.5-…-preview-tts` as needed ([Google AI for Developers][7])

- **RAG:** Gemini File Search initially ([Google AI for Developers][9])

---

# `CLAUDE.md` (copy/paste into your repo)

```md
# Lumina – Claude Code Instructions

You are working in the **Lumina** repository: a multimodal AI app that helps users discover strengths, interests, values, and best-fit career/field directions using:

- real-time voice/video conversation (Gemini Live API)
- adaptive quizzes
- optional user data imports (uploads + OAuth connectors)
- structured profile + recommendations

## Golden Rules

1. **Do not expose secrets**:
   - Never hardcode API keys, OAuth client secrets, service account JSON, or tokens.
   - Use environment variables and `.env.example`.
2. **Use the current Google GenAI SDK**:
   - JavaScript/TypeScript: `@google/genai`
   - Python: `google-genai`
   - Do NOT use legacy `google-generativeai`.
3. **Live API must use ephemeral tokens in production**:
   - The browser should connect using a short-lived token minted by the backend.
4. **No biometric-based “destiny” inference**:
   - Do not infer personality, mental health, intelligence, or “career fit” from face/video.
   - Camera can be used for conversational context (showing artifacts) and UX (turn-taking), but not sensitive trait inference.
5. **Explainability over vibes**:
   - Recommendations must include “why” + evidence links to user-provided signals or quiz answers.

## Repo Workflow Expectations

- Prefer small PR-sized changes.
- Add/update tests for core logic (scoring, schema validation, profile compilation).
- Keep TypeScript types strict; avoid `any`.
- Prefer pure functions in scoring and profile compilation for testability.

## Architecture (target)

- `apps/web`: Next.js UI (call screen, quiz screen, dashboard)
- `apps/api`: API server (auth, ephemeral tokens, connectors, profile jobs)
- `packages/core`: shared types + scoring + schemas
- `packages/ai`: Gemini wrappers (Live connection + generateContent helpers)
- `packages/db`: migrations + DB client

If current repo differs, adapt incrementally—do not do a massive restructure unless asked.

## Gemini Usage Requirements

### Live API (real-time call)

- Model: `gemini-2.5-flash-native-audio-...` (Live-capable)
- Implement:
  - session resumption
  - GoAway handling
  - context window compression (when needed)
- Tool calls:
  - Must be handled manually; return `FunctionResponse` back to the session.
- Audio:
  - Send raw 16-bit PCM (little-endian).
  - Expect 24kHz output.

### Deep reasoning + structured outputs

Use Gemini 3 models for:

- profile compilation
- quiz generation (JSON schema)
- recommendation generation (JSON schema)

Always enforce JSON schema where correctness matters.

### File Search / RAG

If the project uses Gemini File Search:

- Store only user-approved documents.
- Maintain a deletion path (delete document/store).
- Never upload private data without explicit consent.

## Data Safety & Privacy

- All imports (Gmail/Notion/uploads) must be opt-in and revocable.
- Provide “Delete my data” support at minimum:
  - delete uploads
  - delete transcripts
  - delete profile versions and signals
- Store minimal data:
  - transcripts should be optional; prefer storing summaries + extracted signals.

## Product Guardrails

Lumina is not a medical, psychological, or legal advisor.

- Do not diagnose.
- Do not claim scientific certainty.
- Avoid deterministic statements like “you ARE X”.
  Use calibrated language:
- “Signals suggest…”
- “Based on your answers so far…”
- “A good experiment to test this is…”

## Coding Conventions

- TS/JS:
  - Use `zod` (or equivalent) to validate all external inputs.
  - Keep Gemini prompts in versioned files (e.g., `packages/ai/prompts/...`).
- API endpoints:
  - Return consistent error envelopes.
  - Log request IDs; never log raw secrets.
- DB:
  - Use migrations.
  - Encrypt sensitive fields if stored.

## Deliverable Standards (when implementing a feature)

Each feature should include:

1. UI changes (if needed)
2. API endpoint changes (if needed)
3. types/schemas
4. tests
5. brief docs update (README or /docs)

## When uncertain

- Make the smallest change that unblocks progress.
- Prefer adding TODOs + guardrails over guessing complex behavior.
```

---

## What I still need to tailor this to _your actual Lumina repo_

Because the `abdurshd/lumina` URL still returns 404 for me, I can’t do a “current state” audit yet. If you want, paste **any one** of these and I’ll adapt the plan precisely to your code:

- the correct GitHub URL
- a ZIP upload of the repo
- or even just the repo tree + README

---

## Quick confirmations (not required to start building)

I’m not waiting on these to give you value, but answering them will let me tighten the plan:

1. Are you targeting **Web first** (Next.js) or **Mobile first**?
2. Do you want recommendations to be:
   - (A) “career clusters + next experiments” (safer MVP), or
   - (B) “specific jobs + probability-fit scoring” (riskier claims)?

3. For Gmail/Notion: are you okay starting with **uploads only** first, then OAuth connectors?

If you paste the correct Lumina repo link, I’ll do a concrete “here’s what you have now / here’s exactly what to change next” roadmap mapped onto your folders and code.

[1]: https://ai.google.dev/gemini-api/docs/live "https://ai.google.dev/gemini-api/docs/live"
[2]: https://ai.google.dev/gemini-api/docs/live-session "https://ai.google.dev/gemini-api/docs/live-session"
[3]: https://ai.google.dev/gemini-api/docs/live-guide "https://ai.google.dev/gemini-api/docs/live-guide"
[4]: https://ai.google.dev/gemini-api/docs/ephemeral-tokens "https://ai.google.dev/gemini-api/docs/ephemeral-tokens"
[5]: https://ai.google.dev/gemini-api/docs/live-tools "https://ai.google.dev/gemini-api/docs/live-tools"
[6]: https://ai.google.dev/gemini-api/docs/models "https://ai.google.dev/gemini-api/docs/models"
[7]: https://ai.google.dev/gemini-api/docs/speech-generation "https://ai.google.dev/gemini-api/docs/speech-generation"
[8]: https://ai.google.dev/gemini-api/docs/audio "https://ai.google.dev/gemini-api/docs/audio"
[9]: https://ai.google.dev/gemini-api/docs/file-search "https://ai.google.dev/gemini-api/docs/file-search"
[10]: https://github.com/googleapis/python-genai "https://github.com/googleapis/python-genai"
[11]: https://www.youscience.com/education/brightpath/discovery/ "https://www.youscience.com/education/brightpath/discovery/"
[12]: https://d3.harvard.edu/platform-digit/submission/pymetrics-using-neuroscience-ai-to-change-the-age-old-hiring-process/ "https://d3.harvard.edu/platform-digit/submission/pymetrics-using-neuroscience-ai-to-change-the-age-old-hiring-process/"
[13]: https://www.dol.gov/agencies/eta/onet/tools "https://www.dol.gov/agencies/eta/onet/tools"
