# agents.md — AI Agent Coordination

> This file coordinates work between multiple AI agents (Claude, Cursor, Copilot, etc.) working on Lumina.
> Every agent MUST read this file before starting work.

---

## How This Works

1. **Before starting any task:** Read `plan.md` to find available tasks (status `[ ]`, lock `UNLOCKED`)
2. **Claim a task:** Edit `plan.md` — change status to `[~]`, set LOCK to your agent name + timestamp
3. **While working:** Follow the task description exactly. All context you need is in the task.
4. **When done:** Change status to `[x]` (or `[!]` if needs review), set LOCK to `UNLOCKED`
5. **If blocked:** Change status to `[-]`, note the blocker, move to another task

---

## Active Agents

| Agent | Current Task | Started | Notes |
|-------|-------------|---------|-------|
| — | — | — | No agents currently active |

When you start working, add yourself here. When you finish, remove yourself.

---

## Task Dependencies (Quick Reference)

```
1.2 Confidence ──┬──→ 1.1 Orchestrator ──→ 1.3 Decision Log Store
                 │         │
                 │         ├──→ 2.1 Data Analyzer ──→ 2.2 Gap Detection
                 │         │                      └──→ 2.3 Evidence Correlator
                 │         │
                 │         ├──→ 3.1 Quiz Adaptation ──→ 3.2 Module Selection
                 │         │
                 │         ├──→ 4.1 Session Tools ──→ 4.2 Behavioral Timeline
                 │         │
                 │         ├──→ 5.1 Report Agent ──→ 5.2 Confidence Gates
                 │         │
                 │         ├──→ 7.1 Agent Dashboard
                 │         └──→ 7.2 Stage Gates
                 │
                 └──→ 3.1, 5.1, 5.2, 7.2 (also need confidence directly)

1.3 Decision Log Store ──→ 6.1 Decision Log UI ──→ 6.2 Thought Chain
                                                 └──→ 6.3 Page Integration

All implementation ──→ 8.1 Devpost Update
                   └──→ 8.2 Architecture Diagram
```

**Parallelizable tasks** (can be worked on simultaneously by different agents):
- 1.2 has no dependencies — start here
- After 1.1 is done: 2.1, 3.1, 4.1, 5.1, 7.1, 7.2 can all start in parallel
- After 6.1 is done: 6.2 and 6.3 can start in parallel

---

## Context for New Agents

If you're an AI agent picking up a task and have NO prior context about this project, here's what you need to know:

### What is Lumina?
A web app that helps people discover their best career direction through:
1. Connecting data sources (Gmail, Drive, Notion, ChatGPT exports, file uploads)
2. Taking an adaptive psychometric quiz (5 modules, 31 dimensions)
3. Having a live video/voice session with an AI career counselor
4. Receiving a comprehensive talent report with career matches

### Why are we making changes?
We're submitting to the **Gemini 3 Hackathon** ($100K prize pool). The hackathon strongly discourages:
- Generic chatbots / personality quizzes
- Prompt-only wrappers (system prompt + UI)
- Single-prompt solutions
- Simple vision analyzers

Currently Lumina falls into these categories because:
- Report = single Gemini call (prompt wrapper)
- Quiz = stateless question generation (prompt wrapper)
- Live session = personality analysis chatbot
- Workflow = user-driven linear steps (not autonomous)

We're transforming it into a **genuine agentic system** with:
- An orchestrator that evaluates confidence and decides next actions
- Self-correcting report generation (generate → critique → refine)
- Confidence-gated stage transitions
- Temporal behavioral analysis (not snapshot)
- Visible agent reasoning (decision log UI)

### Tech Stack
- Next.js 16 + React 19 + TypeScript (strict, no `any`)
- Tailwind v4 + shadcn/ui + Framer Motion
- Firebase (Auth + Firestore)
- Zustand + React Query v5
- Zod for schema validation
- `@google/genai` for all Gemini API calls

### Gemini Models (from `src/lib/gemini/models.ts`)
- `gemini-3-flash-preview` — fast tasks (quiz, scoring, analysis, critique)
- `gemini-3-pro-preview` — deep synthesis (report generation, refinement)
- `gemini-2.5-flash-native-audio-preview-12-2025` — live audio/video sessions

### Key Files
- `src/lib/gemini/prompts.ts` — ALL system prompts (centralized)
- `src/lib/gemini/models.ts` — model constants
- `src/lib/gemini/client.ts` — Gemini client factory
- `src/types/index.ts` — all TypeScript types
- `src/stores/assessment-store.ts` — assessment state (Zustand)
- `src/lib/firebase/firestore.ts` — Firestore read/write helpers
- `src/lib/api-helpers.ts` — `verifyAuth()`, error response helpers, `safeParseJson()`

### Engineering Rules
- Use `@google/genai` only (not Vertex AI, not OpenAI)
- Never expose `GEMINI_API_KEY` to browser
- All API routes call `verifyAuth(req)` for protected data
- All structured outputs validated with Zod
- All system prompts in `src/lib/gemini/prompts.ts`
- New agent logic goes in `src/lib/agent/`
- New agent API routes go in `src/app/api/agent/`
- New agent UI components go in `src/components/agent/`
- Every autonomous action MUST log to agent decision store

### Styling
- Neutral dark gray theme with green primary
- Custom utilities: `.glass`, `.glass-heavy`, `.text-gradient-gold`
- Fonts: Outfit (headings + body), Geist Mono (mono)
- Keep UI static and clean — no glow/blur effects

### Quality Bar
- `npm run lint` must pass (no new errors)
- `npm run build` must pass
- No API key leakage
- Mobile layout must remain usable

---

## Commit Convention

- Short commit messages, no Claude/AI attribution
- Prefix with task ID when applicable: `[1.1] add agent orchestrator core`
- Delete test files/vars after testing

---

## How to Pick Up a Task

```
1. Read plan.md
2. Find a task with STATUS: [ ] and LOCK: UNLOCKED
3. Check DEPENDS ON — all dependencies must be STATUS: [x]
4. Edit plan.md:
   - Change STATUS: [ ] → STATUS: [~]
   - Change LOCK: UNLOCKED → LOCK: <your-name> | <date> <time>
5. Add yourself to the Active Agents table above
6. Do the work following the task description
7. When done, edit plan.md:
   - Change STATUS: [~] → STATUS: [x]
   - Change LOCK: ... → LOCK: UNLOCKED
8. Remove yourself from Active Agents table
9. Check if your completion unblocks other tasks
```

---

## Conflict Resolution

- If two agents claim the same task, the first one to edit `plan.md` wins
- If a task has been locked for >2 hours with no file changes, it can be force-unlocked
- If you find a bug in a completed task, create a comment in `plan.md` under that task rather than re-opening it
- Cross-task type changes (e.g., modifying `src/types/index.ts`) — coordinate by checking git status before editing shared files

---

## Firestore Structure (Existing + New)

### Existing
- `users/{uid}` — User profile, tokens, consent
- `users/{uid}/assessment/dataInsights` — Connected data analysis
- `users/{uid}/assessment/quizAnswers` — Quiz responses
- `users/{uid}/assessment/sessionInsights` — Live session observations
- `users/{uid}/assessment/talentReport` — Generated report

### New (from agentic transformation)
- `users/{uid}/agent_decisions` — Agent decision log (Task 1.3)
- `users/{uid}/assessment/confidenceProfile` — Per-dimension confidence scores (Task 1.2)
- `users/{uid}/assessment/correlatedInsights` — Cross-source patterns (Task 2.3)
- `users/{uid}/assessment/behavioralTimeline` — Temporal session data (Task 4.2)
- `users/{uid}/assessment/reportTrace` — Report generation steps (Task 5.1)
