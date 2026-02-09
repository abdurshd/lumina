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

## Known Launch Constraint
The public Gemini API terms currently require careful legal validation for `16+` deployment.
Treat this as a release gate and document product/legal decision before public launch.
