# Lumina Implementation Plan (2026-02-09)

## 1. Product Target
Lumina is a multimodal talent-discovery system for users who are unsure about their direction after school. It combines:
- connected digital data (Gmail, Drive, Notion, ChatGPT export, local file upload),
- adaptive psychometric assessment,
- live video+voice AI counseling,
- evidence-grounded career/role matching,
- learning roadmap + portfolio tasks.

User constraints confirmed:
- Age policy target: `16+`
- Geography: global
- Platform: web-first, fully mobile responsive
- Live: full video-avatar experience
- Behavioral inference: required from facial/body cues (with explicit consent)
- Privacy default target: session-only processed data retention
- Outcome depth: role matching + learning roadmap + portfolio tasks
- Psychometric level: expert-validated framework

## 2. Current Codebase Audit (what already exists)

### Implemented
- Next.js app with staged flow: `connections -> quiz -> session -> report`.
- Gemini server routes for analyze/quiz/quiz-score/report/regenerate.
- Live session manager with webcam + mic streaming and tool calls.
- OAuth/data connectors for Gmail, Drive, Notion, ChatGPT export, file upload.
- Firestore persistence for profile, assessment artifacts, feedback, report history.
- Zod schemas for core structured outputs.

### High-risk gaps found
1. `src/app/api/gemini/ephemeral-token/route.ts` returned the raw `GEMINI_API_KEY` to client.
2. Live model IDs in `src/lib/gemini/models.ts` were older/non-canonical.
3. No hard gate that user explicitly consented to behavioral video inference before live session.
4. Privacy target (session-only processed data) is not fully implemented; many derived artifacts still persist in Firestore.

## 3. Latest Gemini + Market Research (2026)

### Gemini capabilities relevant to Lumina
- Live API supports low-latency audio/video and tool calls: [Live API](https://ai.google.dev/gemini-api/docs/live)
- Ephemeral auth tokens are supported for Live sessions (`auth_tokens`) and require `v1alpha` in SDK flow: [Ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)
- Session resumption and context window compression are documented for longer interactions: [Session management](https://ai.google.dev/gemini-api/docs/live-session)
- Current model list shows `gemini-2.5-pro`, `gemini-2.5-flash`, and Live-native-audio previews: [Models](https://ai.google.dev/gemini-api/docs/models)
- Managed retrieval via File Search exists and is suitable for user document corpora: [File Search](https://ai.google.dev/gemini-api/docs/file-search)
- Pricing and rate-tier constraints must be planned early: [Pricing](https://ai.google.dev/gemini-api/docs/pricing)

### Key policy/availability constraints
- Gemini API Additional Terms include an age clause (Google account user must be 18+): [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
- Regional availability is not universal and must be checked per launch market: [Available regions](https://ai.google.dev/gemini-api/docs/available-regions)

### Similar product patterns
- YouScience emphasizes aptitude + interest matching, not only preference quizzes: [YouScience](https://www.youscience.com)
- O*NET tools provide credible public taxonomy for career fit/exploration: [CareerOneStop assessment tools](https://www.careeronestop.org/ExploreCareers/Assessments/assessments.aspx)

## 4. Architecture Decision Record

## 4.1 Model strategy (recommended)
- Live counseling: `gemini-2.5-flash-native-audio-preview-12-2025`
- Fast scoring/generation: `gemini-2.5-flash`
- Deep synthesis/report: `gemini-2.5-pro`

Rationale: this matches currently documented model capabilities and Live support.

## 4.2 Data architecture
Target state:
- Raw imported source data: transient processing only
- Derived assessment data: browser `sessionStorage` by default
- Firestore: minimal identity/consent/settings metadata only

Current state:
- Derived artifacts are stored in Firestore; migration required.

## 4.3 Consent architecture
Live session start must require all:
- base consent given,
- age gate confirmation,
- explicit behavioral-video consent.

## 4.4 Psychometric architecture (expert-validated)
Use an evidence model that combines:
- RIASEC/Holland dimensions,
- work values,
- skills and constraints,
- conversational behavioral signals,
- confidence weighting + evidence chain.

No recommendation without explicit evidence references.

## 5. Phased Delivery Plan

## Phase 0: Security + consent hardening (completed/started in this pass)
- Replace raw API key return with minted ephemeral auth tokens.
- Lock live token constraints to allowed model.
- Enforce consent gating at ephemeral token endpoint.
- Enforce consent check at live session UI start.
- Update model IDs to current 2.5 family.

## Phase 1: Session-only data mode (highest remaining privacy task)
Deliverables:
- Introduce `session_only` persistence adapter for derived assessment artifacts.
- Refactor all save/get helpers in `src/lib/firebase/firestore.ts` to route derived data to session storage when enabled.
- Keep only profile + consent + feature flags in Firestore.
- Add server route behavior when no Firestore assessment docs exist (regenerate/report fallback to payload context).

Acceptance criteria:
- no `users/{uid}/assessment/*` writes for insights/quiz/session/report in session-only mode,
- app remains functional across page transitions in a single browser session,
- logout/close clears derived data.

## Phase 2: BYOK + cost controls
Deliverables:
- Settings UI and secure storage path for user-provided Gemini key (BYOK).
- Request routing policy:
  - use BYOK key when present,
  - fallback to platform key when absent.
- Budget controls:
  - per-user monthly token cap,
  - usage dashboard by feature (connections/quiz/live/report),
  - graceful degradation (e.g., Flash fallback).

Acceptance criteria:
- no plaintext key exposure in client logs,
- overridable per-user model tier,
- hard monthly spend guardrails.

## Phase 3: Psychometric rigor uplift
Deliverables:
- Replace ad hoc quiz dimensions with validated constructs and calibrated scoring.
- Add psychometric QA harness (internal benchmark personas + consistency checks).
- Add confidence calibration and explainability cards in report.

Acceptance criteria:
- stable score reproducibility,
- clear evidence chain per recommendation,
- measurable reduction in generic/low-confidence recommendations.

## Phase 4: Global rollout readiness
Deliverables:
- Region-aware availability checks and fallback UX.
- age/consent and biometric-policy localization.
- legal gate for 16-17 users depending on deployment contract path.

Acceptance criteria:
- explicit blocked-country behavior,
- policy-consistent experience by locale,
- documented legal mode matrix.

## 6. Critical Open Constraint (must resolve before production)
Your target is `16+`, but Gemini API terms currently include an 18+ condition tied to Google account users.

Decision needed before public launch:
1. Keep public Gemini Developer API path and gate users to 18+,
2. Or move to an enterprise/legal path that explicitly supports your 16+ requirement.

Without this decision, a strict 16+ global production launch is compliance-risky.

## 7. Immediate Engineering Backlog (next 7 days)
1. Implement session-only persistence adapter and remove derived-assessment Firestore writes.
2. Add report/regenerate endpoints that accept full client context payloads (no server Firestore dependency).
3. Add BYOK settings schema + server key resolution path.
4. Add model fallback and retry strategy by tier/rate limits.
5. Add Playwright mobile viewport test for onboarding/session/report critical flow.
6. Add safety layer for behavioral inference outputs (avoid deterministic psych claims; include confidence).

## 8. Success Metrics
- Completion rate: onboarding -> report
- Time-to-first-report
- Recommendation acceptance score (user feedback agree/disagree)
- Confidence-weighted evidence coverage
- Spend per completed user journey
- Session-only compliance rate (zero derived Firestore writes)
