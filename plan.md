# Lumina Full Execution Plan

Last updated: 2026-02-09

## Execution Tracker

### Workstream Status
- [x] Workstream A: Security, Consent, and Compliance
- [x] Workstream B: Session-Only Data Architecture
- [x] Workstream C: Psychometric Core v2
- [x] Workstream D: Live Session Intelligence v2
- [x] Workstream E: Connector and Ingestion Robustness
- [x] Workstream F: BYOK and Cost Governance
- [ ] Workstream G: Report, Roadmap, and Portfolio Task Engine
- [ ] Workstream H: Iteration and Evolution Loop
- [ ] Workstream I: Testing and QA
- [ ] Workstream J: Observability and Operations

### Task Checklist

#### Workstream A Tasks
- [x] A1. Keep ephemeral token flow only for Live API.
- [x] A2. Enforce token constraints (`liveConnectConstraints`).
- [x] A3. Require all live consent flags before token issuance and session start.
- [x] A4. Add compliance banner in admin/settings indicating unresolved 16+ legal gate.
- [x] A5. Add audit fields for consent versioning and consent timestamp updates.

#### Workstream B Tasks
- [x] B1. Implement storage adapter interface (`AssessmentStorageAdapter`).
- [x] B2. Add runtime selector (default `session_only`).
- [x] B3. Refactor assessment save/get helpers to adapter.
- [x] B4. Update affected screens and mutations to avoid direct Firestore assumptions.
- [x] B5. Add migration fallback for users with legacy persisted docs.
- [x] B6. Add purge-on-signout/session-expire behaviors.

#### Workstream C Tasks
- [x] C1. Define and lock dimension model (RIASEC/work values/constraints/signals).
- [x] C2. Build scoring normalization and confidence calibration.
- [x] C3. Create synthetic profile benchmark corpus and consistency checks.
- [x] C4. Harden rubric/scoring prompts with strict structured schemas.
- [x] C5. Add confidence/evidence-chain requirements in final report schema.

#### Workstream D Tasks
- [x] D1. Define behavioral signal taxonomy.
- [x] D2. Update live prompt/tool grounding rules.
- [x] D3. Add post-session summarization and deduplication pass.
- [x] D4. Improve reconnect/resumption/compression resilience.
- [x] D5. Add in-session user controls for behavioral capture.

#### Workstream E Tasks
- [x] E1. Standardize ingestion response shape.
- [x] E2. Add per-source token/size/quality metadata.
- [x] E3. Add extraction limits and truncation summaries.
- [x] E4. Add corpus lifecycle management UX.
- [x] E5. Add source deletion and consent revocation handling.

#### Workstream F Tasks
- [x] F1. Add BYOK settings UI.
- [x] F2. Add secure BYOK storage/reference strategy.
- [x] F3. Add request routing policy (BYOK vs platform key).
- [x] F4. Add usage accounting per feature/stage.
- [x] F5. Add soft/hard budget caps and fallback policy.

#### Workstream G Tasks
- [ ] G1. Expand report schema for rationale/evidence/risk.
- [ ] G2. Build 30/60/90-day learning roadmap generator.
- [ ] G3. Build role-specific portfolio task ladders.
- [ ] G4. Close regeneration loop with structured feedback deltas.

#### Workstream H Tasks
- [ ] H1. Complete challenge generation/completion flow.
- [ ] H2. Complete reflection timeline flow.
- [ ] H3. Implement profile snapshot diff engine.
- [ ] H4. Render dimension trend views.
- [ ] H5. Add progression nudges and iteration cadence.

#### Workstream I Tasks
- [ ] I1. Add unit tests for auth/schema guardrails.
- [ ] I2. Add integration tests for critical API routes.
- [ ] I3. Add Playwright E2E for mobile and desktop critical flow.
- [ ] I4. Add psychometric consistency/bias evaluation scripts.
- [ ] I5. Add release smoke-test checklist and CI gate.

#### Workstream J Tasks
- [ ] J1. Add structured logging with request IDs.
- [ ] J2. Add error taxonomy dashboard.
- [ ] J3. Add performance monitoring and latency/error metrics.
- [ ] J4. Add alerting for model and route degradation.

## 0. Objective
Build Lumina into a production-grade multimodal talent discovery platform that helps users identify strengths, career fit, and concrete next actions by combining:
- connected personal data sources,
- adaptive psychometric assessment,
- live multimodal AI counseling,
- evidence-grounded career recommendations,
- iterative growth loop (challenges + reflections + profile updates).

This plan is structured for fast execution while keeping architecture, privacy, and model reliability strong.

## 1. Product Scope (Locked)
- Audience: 16+
- Geography: global
- Platform: web-first, fully mobile responsive
- Live interaction: voice + webcam
- Behavioral inference: enabled (face/body cues), only with explicit consent
- Data connectors in scope:
  - Gmail
  - Google Drive
  - Notion
  - ChatGPT export
  - local file upload
- Output depth:
  - role matching
  - learning roadmap (2026 AI tooling aware)
  - portfolio tasks
- Psychometric rigor target: expert-validated framework
- Privacy target: session-only processed assessment data by default

## 2. Critical Constraint (Release Gate)
Gemini API terms currently include 18+ usage constraints.

Release decision required before public launch:
1. Gate public app to 18+, or
2. Use an enterprise/legal path that supports 16+.

No public release until this is resolved and documented.

## 3. Current State Snapshot

### 3.1 Already present in codebase
- Next.js app with staged funnel (`connections -> quiz -> session -> report`).
- Gemini API routes for analysis, quiz, scoring, report generation, and regeneration.
- Live session client with mic/webcam stream + tool call handling.
- Firestore profile + assessment persistence.
- OAuth and data ingestion routes for all target connectors.
- Newer iteration/evolution/admin feature scaffolding from prior agent changes.

### 3.2 High-priority gaps
1. Session-only privacy mode is not fully enforced; derived data is still persisted in Firestore in many paths.
2. Psychometric model remains partially heuristic and requires validated scoring and calibration.
3. BYOK (bring-your-own Gemini API key) and cost-control policy are not complete.
4. Behavioral inference governance needs stronger rules and confidence/evidence constraints in output pipeline.
5. End-to-end regression tests (especially mobile and cross-stage) are insufficient.

## 4. Technical Architecture (Target)

### 4.1 Frontend
- Framework: Next.js App Router
- State:
  - auth/profile state in Zustand
  - server mutation/query state in React Query
  - assessment ephemeral state in session storage adapter
- UX modules:
  - onboarding + consent
  - data connections
  - adaptive quiz
  - live session
  - report
  - evolution/iteration
  - settings/admin

### 4.2 Backend/API
- API routes under `src/app/api/**`
- Mandatory per protected route:
  1. `verifyAuth(req)`
  2. request Zod validation
  3. typed error handling
  4. response schema validation
- Gemini calls from server only, except Live ephemeral auth token usage on client

### 4.3 Model strategy (single source: `src/lib/gemini/models.ts`)
- Fast: `gemini-2.5-flash`
- Deep: `gemini-2.5-pro`
- Live: `gemini-2.5-flash-native-audio-preview-12-2025`

### 4.4 Data strategy
- Default mode: `session_only`
- Persist long-term:
  - user profile metadata
  - consent metadata
  - non-sensitive settings and feature flags
- Do not persist long-term:
  - raw email/doc/chat content
  - raw video/audio recordings
  - unnecessary derived artifacts when session-only mode enabled

## 5. Workstreams and Milestones

## Workstream A: Security, Consent, and Compliance (Immediate)
Goal: eliminate key leaks, enforce consent, establish legal safety rails.

Tasks:
1. Keep ephemeral token flow only for Live API.
2. Enforce token constraints (`liveConnectConstraints`).
3. Require all live consent flags before token issuance and session start:
   - `consentGiven`
   - `ageGateConfirmed`
   - `videoBehaviorConsent`
4. Add compliance banner in admin/settings indicating unresolved 16+ legal gate.
5. Add audit fields for consent versioning and consent timestamp updates.

Acceptance criteria:
- No route returns raw API key.
- Live cannot start without full consent flags.
- Consent fields are persisted and queryable.

## Workstream B: Session-Only Data Architecture (Highest Priority)
Goal: align product promise with actual persistence behavior.

Tasks:
1. Implement storage adapter interface:
   - `AssessmentStorageAdapter`
   - backends: `SessionStorageAdapter`, `FirestoreAdapter`
2. Add runtime selector (default `session_only`).
3. Refactor all assessment save/get helpers to use adapter:
   - data insights
   - quiz answers/scores
   - session insights/signals
   - generated reports and feedback
4. Update affected screens and mutations to avoid direct Firestore assumptions.
5. Add migration fallback for users with legacy persisted docs.
6. Add purge-on-signout/session-expire behaviors.

Acceptance criteria:
- In `session_only` mode, no writes occur under `users/{uid}/assessment/*` for derived assessment artifacts.
- End-to-end user flow still works without persistence between browser sessions.
- Legacy persisted users can still generate reports.

## Workstream C: Psychometric Core v2 (Validated)
Goal: produce stable, explainable, evidence-grounded recommendations.

Tasks:
1. Define dimension model:
   - RIASEC
   - work values
   - skill confidence
   - constraints
   - communication/behavioral signal factors
2. Build scoring normalization layer:
   - per-source signal weighting
   - confidence calibration
   - outlier handling
3. Create benchmark corpus:
   - synthetic profiles
   - expected recommendations
   - consistency thresholds
4. Add rubric and scoring prompt hardening with structured schemas.
5. Add confidence + evidence chain requirements in final report schema.

Acceptance criteria:
- Repeat runs on same profile produce stable rankings within tolerance.
- Every top recommendation includes evidence and confidence.
- Low-confidence recommendations are clearly marked.

## Workstream D: Live Session Intelligence v2
Goal: improve quality of multimodal signal collection without overclaiming.

Tasks:
1. Define behavioral signal taxonomy:
   - engagement
   - hesitation
   - emotional intensity
   - clarity/structure
   - collaboration orientation
2. Update live system prompt/tool instructions to keep outputs grounded.
3. Add post-session summarization pass:
   - aggregate live tool signals
   - deduplicate
   - assign confidence and source refs
4. Improve resilience:
   - reconnection strategy
   - session resumption handling
   - context compression thresholds
5. Add user-visible controls:
   - pause behavioral inference
   - disable camera while continuing voice

Acceptance criteria:
- Live session survives temporary disconnects.
- Behavioral signals are structured, confidence-tagged, and auditable.
- User can control behavioral capture in-session.

## Workstream E: Connector and Ingestion Robustness
Goal: make data import reliable and transparent.

Tasks:
1. Standardize ingestion response shape across connectors.
2. Add per-source token/size and parse quality metadata.
3. Add extraction limits and truncation summaries to avoid oversized prompt contexts.
4. Add upload corpus management UX and document lifecycle.
5. Add source-level deletion and consent revocation handling.

Acceptance criteria:
- Connector failures return typed actionable errors.
- Users can see exactly what source categories were ingested.
- Source revocation reliably removes future access.

## Workstream F: BYOK + Cost Governance
Goal: prevent runaway cost and enable user-controlled usage.

Tasks:
1. Settings UI for BYOK key enablement.
2. Secure storage pattern for BYOK references (never raw key in plaintext logs).
3. Request router policy:
   - use user key when configured
   - fallback to platform key
4. Add usage accounting:
   - requests
   - tokens
   - estimated cost by feature/stage
5. Add budgets and enforcement:
   - soft warning threshold
   - hard stop threshold
   - model fallback policy

Acceptance criteria:
- BYOK works for major flows.
- Usage dashboard updates correctly.
- Budget caps block over-limit requests gracefully.

## Workstream G: Report, Roadmap, and Portfolio Task Engine
Goal: upgrade output utility from "insight" to "action".

Tasks:
1. Expand report schema to enforce:
   - role rationale
   - evidence chain
   - risk/uncertainty notes
2. Build learning roadmap generator:
   - 30/60/90-day plan
   - contemporary AI tools per path
3. Build portfolio task generator:
   - beginner/intermediate/advanced task ladders
   - measurable outcomes
4. Add feedback loop:
   - user agrees/disagrees by recommendation
   - regenerate report with structured feedback

Acceptance criteria:
- Every recommendation includes practical next steps.
- Roadmap and tasks are testable and role-specific.
- Feedback measurably changes regeneration output.

## Workstream H: Iteration and Evolution Loop
Goal: maintain user growth over time.

Tasks:
1. Complete challenge generation and completion endpoints.
2. Persist and render reflection timelines.
3. Add profile snapshot diff engine.
4. Surface trend charts for dimension movement.
5. Add cadence nudges for continued progress.

Acceptance criteria:
- Users can complete challenge cycles end-to-end.
- Snapshot deltas are visible and accurate.
- New recommendations adapt to evolution history.

## Workstream I: Testing and QA
Goal: reduce regressions and increase confidence.

Tasks:
1. Add route-level unit tests for schema and auth behavior.
2. Add integration tests for critical API routes:
   - analyze
   - quiz
   - report
   - ephemeral-token
3. Add Playwright E2E for mobile + desktop:
   - onboarding
   - connection
   - quiz
   - live start gate
   - report generation
4. Add evaluation scripts for psychometric consistency/bias checks.
5. Define release smoke test checklist.

Acceptance criteria:
- CI blocks merges on failing critical tests.
- Core path is green on mobile and desktop.
- Bias and consistency reports generated for each release candidate.

## Workstream J: Observability and Operations
Goal: make incidents debuggable and usage visible.

Tasks:
1. Structured logs with request IDs for all AI routes.
2. Error taxonomy dashboard (`AUTH`, `VALIDATION`, `MODEL`, `RATE_LIMIT`, `INTERNAL`).
3. Performance monitoring:
   - route latency
   - timeout rates
   - reconnect rate
4. Alerting for degraded model performance or rising error patterns.

Acceptance criteria:
- Top errors are discoverable within minutes.
- Regression spikes are alert-driven.

## 6. Detailed API/Schema Upgrade Plan

### 6.1 API contracts to update
- `/api/gemini/ephemeral-token`
- `/api/user/update-profile`
- `/api/gemini/report`
- `/api/gemini/regenerate-report`
- iteration/corpus/profile endpoints newly added in repo

### 6.2 Schema hardening checklist
For each route:
1. Request schema in Zod
2. Model response schema in Zod
3. Fallback/partial data handling
4. Consistent error response with code

## 7. File-Level Implementation Sequence
Execute in this order to minimize conflicts:
1. `src/lib/storage/*` (new adapter layer)
2. `src/lib/firebase/firestore.ts` (adapter integration)
3. `src/stores/*` and `src/hooks/*` consumers
4. API routes depending on assessment persistence
5. report/session/quiz pages
6. settings/onboarding consent and retention UI
7. tests and CI scripts
8. docs update

## 8. Delivery Phases (Execution Cadence)

### Phase 1 (Week 1)
- Session-only adapter foundation
- Consent and retention gating finalization
- API contract alignment
- Initial regression tests

### Phase 2 (Week 2)
- Psychometric scoring v2
- Report schema upgrades + confidence/evidence enforcement
- Connector robustness pass

### Phase 3 (Week 3)
- BYOK + budget controls
- Iteration loop completion
- Mobile E2E stabilization

### Phase 4 (Week 4)
- Observability, analytics, admin insights
- Bias/stability evaluations
- Launch readiness checklist and legal gate resolution

## 9. Definition of Done (Per Feature)
A feature is complete only if all are true:
1. Auth + consent rules enforced.
2. Request/response schemas validated.
3. No key leakage or unsafe persistence behavior introduced.
4. Mobile and desktop UX verified.
5. Lint/build pass.
6. Relevant tests added/updated.
7. Docs updated (`CLAUDE.md`, `plan.md`, endpoint docs where needed).

## 10. Risk Register and Mitigation

Risk: 16+ legal mismatch with Gemini terms.
- Mitigation: release gate + legal decision log + fallback 18+ mode.

Risk: model output inconsistency.
- Mitigation: rubric constraints, calibration, benchmark harness.

Risk: privacy mismatch (session-only promise vs persistence reality).
- Mitigation: adapter architecture + storage integration tests.

Risk: connector fragility and token expiration.
- Mitigation: typed errors, retry/backoff, reconnect UX.

Risk: cost overrun under heavy usage.
- Mitigation: BYOK, caps, fallback models, stage-level budgets.

## 11. KPI Framework
Product KPIs:
- onboarding completion rate
- report completion rate
- recommendation agreement rate
- challenge completion rate

Quality KPIs:
- recommendation confidence coverage
- psychometric stability score
- regeneration improvement delta

Operational KPIs:
- p95 API latency
- live reconnect rate
- model error rate
- cost per completed user journey

## 12. Immediate Next 10 Tasks (Actionable)
1. Implement `AssessmentStorageAdapter` with session backend.
2. Refactor `save/get*` assessment helpers to adapter calls.
3. Add retention mode toggle and wire to user profile.
4. Update report routes to accept client-provided context payload fallback.
5. Add tests for session-only no-persistence behavior.
6. Harden live behavioral signal schema (confidence + evidence required).
7. Add recommendation evidence-chain strict validation.
8. Add BYOK form + backend key resolution strategy.
9. Add usage/cost counters per Gemini route.
10. Add Playwright flow for onboarding -> live -> report on mobile viewport.

## 13. Notes for Contributors
- Do not revert unrelated file changes from other agents.
- Prefer additive, compatibility-safe migrations.
- Keep model IDs centralized and avoid hardcoding in route files.
- Keep prompts centralized in `src/lib/gemini/prompts.ts`.
- Treat legal/compliance gates as first-class blockers, not post-launch chores.
