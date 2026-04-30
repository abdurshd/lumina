# Lumina — Age-Gate Decision

**Date:** 2026-04-29
**Status:** LOCKED for v1 launch
**Owner:** Operator
**Revisit:** Phase 4 (post-legal-review) — 16+ expansion is a future possibility, not a launch dependency.

---

## Decision

**Lumina launches at 18+ only.** The signup flow rejects any user whose declared date of birth is under 18. Marketing copy never targets minors. The Terms of Service and Privacy Policy reflect 18+ as the minimum.

The original 16+ aspiration is preserved as a Phase 4 expansion item, contingent on a documented legal review covering: Gemini API consumer terms, regional minor-data laws (COPPA, GDPR-K, UK Age Appropriate Design Code), parental-consent UX requirements, and the specific behavioral-inference posture acceptable for minors.

## Why 18+ at launch

Lumina at launch combines four characteristics that, when stacked, are individually regulated and collectively far more so:

1. **Multimodal AI live conversation** — voice + video, real-time, session-length on the order of 5–15 minutes.
2. **Behavioral inference from face/body cues** — even with explicit consent, minors-data regulators treat this as elevated risk.
3. **Personal-data corpus integration** — Gmail, Drive, Notion, ChatGPT exports may contain PII the user would not knowingly share.
4. **AI-generated career recommendations** — outputs that influence consequential decisions (major selection, first job).

Each one alone has compliance answers. Together, for minors, the compliance bar moves from "table stakes for a careful operator" to "requires affirmative legal sign-off on a documented data-protection impact assessment." That sign-off is not in hand and is not something Lumina launches without.

## How the gate is implemented

**Signup form (Phase 1):**
- Date-of-birth field is required at signup. Calculation: `today - dob >= 18 years`.
- Server-side enforcement in `src/app/api/auth/[provider]` and the corresponding Firestore write — client-side validation alone is not enough.
- Stored in `users/{uid}.age_verified_at` with the timestamp; not the DOB itself (we don't need the DOB after verification).
- Rejection copy is friendly: "Lumina is currently available for ages 18 and up. We're working on a version for younger users — join the notify list and we'll let you know when it's available."

**Terms of Service:**
- Section "Eligibility" states 18+ minimum.
- Section "Children's Privacy" reaffirms we do not knowingly collect data from anyone under 18 and provides a deletion path if such data is identified.

**Marketing copy:**
- No imagery of identifiable minors anywhere.
- No copy targeting "students" without qualifying the age (e.g., never "for high schoolers" — instead "for university students and beyond").
- The persona pages from Phase 2.5 (`/for-self-discovery`, `/for-career-pivots`, `/for-coaches`, `/for-schools`, `/for-hr-teams`) keep `/for-schools` scoped to **higher education** at launch, not K–12.

**Privacy Policy:**
- COPPA notice present even though we don't intend to collect minor data — it's the standard pattern for any consumer-data product.
- Data deletion path documented (`/api/user/delete-data` already exists).

## What changes at the 16+ revisit

When the legal review is complete and the 16+ expansion ships, the following must be in place:

1. Parental-consent flow (verifiable, not just a checkbox).
2. Minor-specific data retention defaults (shorter than adult defaults).
3. Behavioral-inference disabled-by-default for minors regardless of explicit consent toggle.
4. Live-session features either disabled or supervisor-required.
5. Region-specific gating (some jurisdictions require >16 even with parental consent).
6. A separate minor-targeted Privacy Policy section.
7. Updated copy + persona pages (`/for-schools` can then expand to high schools).

None of this is launch-blocking; all of it is launch-blocking for the 16+ tier.

## Acceptance for closing 0.2

- [ ] Signup form has a DOB field with 18+ enforcement, both client and server.
- [ ] `users/{uid}.age_verified_at` is set on signup.
- [ ] ToS section "Eligibility" reads 18+.
- [ ] Privacy Policy includes the COPPA notice and the deletion path.
- [ ] No copy in `src/app/page.tsx`, `src/components/landing/*`, or any persona page targets minors.
- [ ] A red-team pass attempts signup with DOB calculations that would yield 17.99 years; the server rejects.

## What this does not block

- Adult sign-up, payment, full assessment, full live session, full report.
- B2B sales to schools as long as the school's deployment is to staff/faculty (adult), not students.
- Future 16+ expansion at any time the legal review concludes.
