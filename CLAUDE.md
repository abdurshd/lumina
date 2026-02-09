# CLAUDE.md

Repository guardrails for building Lumina.

## Mission
Build a multimodal talent-discovery platform that helps people find their strongest career direction using:
- connected personal data sources,
- adaptive psychometric assessment,
- live multimodal AI conversation,
- evidence-grounded recommendations.

## Product Scope (Current)
- Audience: `16+`
- Geography: global
- Platform: web-first, fully mobile responsive
- Live mode: video + voice
- Behavioral inference: enabled from face/body cues, but only with explicit consent
- Data sources in scope:
  - Gmail
  - Google Drive
  - Notion
  - ChatGPT export
  - local file upload
- Output depth: role matching + learning roadmap + portfolio tasks
- Psychometrics: expert-validated framework (not generic personality-only quiz)

## Required Engineering Rules
- Use `@google/genai` only.
- Never expose `GEMINI_API_KEY` to browser clients.
- Live sessions must use server-minted ephemeral tokens.
- All API routes that require user data must call `verifyAuth(req)`.
- All structured model outputs must use Zod validation.
- Keep all system prompts in `src/lib/gemini/prompts.ts`.
- TypeScript strict mode, no `any`.
- shadcn/ui components only.
- Tailwind v4 only.
- All hooks prefixed with `use-`.

## Gemini Model Policy
Use centralized constants from `src/lib/gemini/models.ts` only.

Current canonical model mapping:
- Fast tasks: `gemini-3-flash-preview`
- Deep synthesis: `gemini-3-pro-preview`
- Live sessions: `gemini-2.5-flash-native-audio-preview-12-2025`

## Live Session Security Policy
- `/api/gemini/ephemeral-token` must mint ephemeral `auth_tokens` server-side.
- Do not return raw API key.
- Ephemeral token must constrain live model via `liveConnectConstraints`.
- Starting a live session requires:
  - `consentGiven`
  - `ageGateConfirmed`
  - `videoBehaviorConsent`

## Consent and Behavioral Inference Rules
Behavioral inference is allowed only for conversational/career coaching signals, such as:
- engagement,
- hesitation,
- confidence patterns,
- communication style.

Never claim:
- identity recognition,
- medical diagnosis,
- immutable personality certainty,
- legally/academically consequential decisions from video alone.

Every strong claim in output should include evidence and confidence.

## Data Governance
Target privacy mode:
- raw imported source content is transient,
- derived assessment data should default to session-only storage,
- persistent storage should hold minimal profile/consent/settings data unless product explicitly requires otherwise.

Never persist raw long-term copies of:
- full email content,
- full document text dumps,
- raw chat exports,
- raw video recordings.

## API Route Pattern
For Gemini-backed API routes:
1. `verifyAuth(req)`
2. Parse and validate request (Zod)
3. Call Gemini model
4. Parse response (`safeParseJson` where applicable)
5. Validate response schema (Zod)
6. Return typed success/error responses

## Update Checklist for New User Fields
When adding profile/consent fields, update all:
- `src/types/index.ts`
- API request schemas
- Firestore helper typings and writes
- API client request typings
- UI onboarding/settings forms

## Quality Bar
Changes are not done until:
- lint passes (warnings may exist from unrelated work but no new errors),
- build passes,
- no key leakage or consent bypass is introduced,
- mobile layout remains usable.

## Commands
```bash
npm run dev
npm run lint
npm run build
```

## Agentic Transformation (Active — Gemini 3 Hackathon)

Lumina is undergoing an agentic transformation for the Gemini 3 Hackathon submission.
All implementation details, task statuses, and locks are tracked in **`plan.md`** at the project root.
Agent coordination rules are in **`agents.md`** at the project root.

### Key Architecture Additions
- **Agent orchestrator** at `src/lib/agent/orchestrator.ts` — evaluates state, recommends actions, drives autonomous decisions
- **Confidence scoring** at `src/lib/agent/confidence.ts` — tracks per-dimension confidence, identifies gaps, gates stage transitions
- **Report agent loop** at `src/lib/agent/report-agent.ts` — generate → critique → refine → validate (NOT single-shot)
- **Agent decision log** at `src/stores/agent-store.ts` — persists all agent reasoning for UI display
- **Behavioral timeline** at `src/lib/agent/behavioral-timeline.ts` — temporal tracking during live sessions

### Rules for Agentic Code
- All agent logic lives in `src/lib/agent/`
- Agent API routes live in `src/app/api/agent/`
- Agent UI components live in `src/components/agent/`
- Every autonomous action MUST log to the agent decision store with: action, reason, confidence before/after
- Report generation MUST go through the multi-step agent loop, never a single prompt call
- Confidence thresholds must gate stage transitions (user can override, but agent recommends)
- The orchestrator recommends actions but does NOT auto-execute — human-in-the-loop always

### What NOT to Build
- Do NOT make it look like a generic chatbot or personality quiz
- Do NOT generate reports in a single prompt call
- Do NOT skip the self-correction loop
- Do NOT remove the agent decision log — it's the primary differentiator for judges

## Known Launch Constraint
The public Gemini API terms currently require careful legal validation for `16+` deployment.
Treat this as a release gate and document product/legal decision before public launch.
