# Internationalization (i18n) Implementation Plan

> **Status:** proposal — to be reviewed before implementation begins.
> **Initial locales:** `en` (English, default), `uz` (Uzbek, Latin script).
> **Future locales:** `ru`, `tr`, `uz-Cyrl`, `es`, `de` (added once Uzbek pilot is validated).
> **Scope:** the entire user-facing experience must be usable by a monolingual Uzbek speaker. This includes:
> - all UI chrome strings,
> - **all AI-generated content** — report narratives, quiz questions, evidence summaries, micro-challenges, agent decision-log human-readable text, reflection analyses,
> - **the live voice session** — the model speaks Uzbek when locale is `uz`,
> - **imported user data** when surfaced to the user — Gmail/Drive/Notion/ChatGPT/upload quotes shown in evidence drawers, report citations, etc., are translated on display while the original is preserved for verification.
>
> Out of scope for v1: blog/changelog/use-case MDX article bodies (handled per-post in a separate content workflow), the raw imported data itself in storage (we do not rewrite a user's emails — we only translate when rendering).

---

## 1. Goals & non-goals

### Goals
- Every user-facing string in the UI loads from a translation file, never a hardcoded literal.
- English and Uzbek render correctly across every page, including marketing, onboarding, quiz, live session, report, evolution, settings, consent, errors.
- Translation files are **small and topical** — no monolithic `en.json`. Aim ≤ 200 lines per file, broken by feature/domain.
- Locale is detectable from the URL (SEO-friendly), persisted across navigation, and switchable from the UI.
- Type-safe: missing keys are a TypeScript error, not a runtime fallback string.
- Pluralization, date, number, currency formatting follow the active locale (no hand-built `if (count === 1) ...`).
- SEO: each localized URL emits correct `lang` attribute, `hreflang` alternates, and is in the sitemap.
- Lazy-load: a user on `/en/...` should not download `uz` messages.

### Non-goals (v1)
- Translating long-form blog/changelog/use-case MDX article bodies — handled per-post in a separate content workflow once we have a translation pipeline for marketing copy.
- Right-to-left layout — both initial locales are LTR.
- Rewriting the user's raw imported source data in storage (we do not edit their Gmail/Drive content — we only translate at render time).
- Auto-translating user-typed reflections/notes back to English for storage (we keep what the user wrote).

---

## 2. Library choice: `next-intl`

We will use [`next-intl`](https://next-intl-docs.vercel.app/) for the following reasons:

| Need | next-intl support |
|---|---|
| Next.js App Router (server + client components) | First-class |
| ICU MessageFormat (plural, select, gender) | Built-in |
| Namespace splitting (one JSON per topic) | Built-in via `useTranslations('namespace')` and message merging |
| Locale-prefixed routing with middleware | Built-in helper |
| Type-safe messages | Provides `IntlMessages` augmentation pattern |
| Server-side translation in RSC + metadata | `getTranslations`, `getMessages` |
| Bundle splitting per locale | Built-in via dynamic `import(\`../messages/${locale}/...\`)` |
| Active maintenance, Next 16 support | Yes |

Alternatives considered and rejected:
- `next-i18next` — pages-router-centric, awkward in App Router.
- Bare `@formatjs/intl` — too low-level; we'd reinvent loader/middleware.
- Custom solution — wastes time on solved problems and complicates the SEO/routing story.

**Add to `package.json`:**
```
"next-intl": "^3.x"
```

---

## 3. Routing strategy

**Decision:** sub-path routing — `/en/...` and `/uz/...`, with `en` as the default.

| Approach | Verdict |
|---|---|
| Sub-path (`/en/dashboard`, `/uz/dashboard`) | ✅ Chosen — SEO-friendly, shareable, no domain ops |
| Sub-domain (`en.lumina.app`) | ❌ DNS/cert overhead, harder for early-stage |
| Cookie only (no URL change) | ❌ No `hreflang`, breaks share links |

### Behavior
- Visiting `/` redirects via middleware:
  1. If the user has a `NEXT_LOCALE` cookie, honor it.
  2. Else parse `Accept-Language`; if `uz`, redirect to `/uz`; otherwise `/en`.
- All app, marketing, auth, and api-consuming routes move under `/[locale]/...`.
- Marketing OG images (`opengraph-image.tsx`) are regenerated per locale where text appears.
- The existing `src/app/sitemap.ts` is updated to emit one entry per (route × locale) pair with `alternates.languages` so Google sees `hreflang` correctly.
- API routes under `/api/**` are **not** localized (they serve JSON, not HTML).

### Files affected by routing migration
The following directories move from `src/app/...` to `src/app/[locale]/...`:

- `src/app/(app)/**`
- `src/app/(auth)/**`
- `src/app/page.tsx`
- `src/app/about`, `blog`, `changelog`, `help`, `methodology`, `pricing`, `privacy`, `security`, `showcase`, `terms`, `use-cases`
- `src/app/lab`, `r`, `ref`
- `src/app/error.tsx`, `not-found.tsx`, `global-error.tsx`, `layout.tsx`

Files that stay at the top level (no locale prefix):
- `src/app/api/**`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/icon.svg`
- `src/app/opengraph-image.tsx` (root OG)

---

## 4. Directory structure for messages (small, topical files)

We will **not** ship a single `en.json`. Messages are split by feature into many small files, then merged at request time. Target: ≤ 200 lines each.

```
src/messages/
├── en/
│   ├── common.json              # buttons, generic words, time units, "yes/no", "save", "cancel"
│   ├── validation.json          # zod/form validation messages
│   ├── errors.json              # error-page bodies, toast errors, API error mappings
│   ├── nav.json                 # sidebar items, mobile-header, top-nav, breadcrumbs
│   ├── footer.json              # site footer
│   ├── meta.json                # <title>/<meta description> per route
│   ├── language-switcher.json   # the switcher UI itself
│   │
│   ├── landing/
│   │   ├── hero.json
│   │   ├── how-it-works.json
│   │   ├── data-analysis.json
│   │   ├── quiz.json
│   │   ├── session.json
│   │   ├── report.json
│   │   ├── cta.json
│   │   ├── waitlist.json
│   │   └── agent-log-widget.json
│   │
│   ├── auth/
│   │   ├── login.json
│   │   └── consent-gate.json    # age gate, video consent, ToS check
│   │
│   ├── onboarding/
│   │   ├── welcome.json
│   │   ├── connect-sources.json
│   │   ├── consent.json
│   │   └── ready.json
│   │
│   ├── dashboard/
│   │   ├── overview.json        # career-overview, talent-summary-hero
│   │   ├── pre-completion.json  # pre-completion-dashboard
│   │   ├── post-completion.json # post-completion-dashboard
│   │   ├── quick-actions.json
│   │   ├── strengths-summary.json
│   │   ├── action-plan.json
│   │   ├── micro-challenges.json
│   │   └── iteration-history.json
│   │
│   ├── connections/
│   │   ├── index.json           # connections page chrome
│   │   ├── connector-card.json  # generic connector UI
│   │   ├── gmail.json           # provider-specific labels
│   │   ├── drive.json
│   │   ├── notion.json
│   │   ├── chatgpt.json
│   │   └── upload.json
│   │
│   ├── quiz/
│   │   ├── index.json           # quiz page chrome
│   │   ├── module-selector.json
│   │   ├── module-flow.json
│   │   ├── question-card.json
│   │   └── completion.json
│   │
│   ├── session/
│   │   ├── index.json
│   │   ├── controls.json
│   │   ├── timer.json
│   │   ├── transcript.json
│   │   ├── webcam.json
│   │   ├── audio.json
│   │   └── behavioral-timeline.json
│   │
│   ├── report/
│   │   ├── index.json
│   │   ├── strengths-grid.json
│   │   ├── radar-chart.json
│   │   ├── career-paths.json
│   │   ├── confidence.json
│   │   ├── thought-chain.json
│   │   ├── evidence.json
│   │   ├── history.json
│   │   └── satisfaction.json
│   │
│   ├── evolution/
│   │   ├── index.json
│   │   ├── timeline.json
│   │   ├── comparison.json
│   │   ├── trends.json
│   │   ├── challenges.json
│   │   └── reflection.json
│   │
│   ├── agent/
│   │   ├── decision-log.json
│   │   ├── confidence-dashboard.json
│   │   └── stage-gate.json
│   │
│   ├── settings/
│   │   ├── index.json
│   │   ├── profile.json
│   │   ├── byok.json             # bring-your-own-key UI
│   │   ├── referrals.json
│   │   └── danger-zone.json      # delete account, etc.
│   │
│   ├── consent/
│   │   ├── cookie-banner.json
│   │   ├── analytics.json
│   │   └── video-consent.json
│   │
│   └── marketing/
│       ├── about.json
│       ├── blog-index.json       # the blog listing page chrome (not posts)
│       ├── changelog.json
│       ├── help.json
│       ├── methodology.json
│       ├── pricing.json
│       ├── privacy.json
│       ├── security.json
│       ├── showcase.json
│       ├── terms.json
│       └── use-cases.json
│
└── uz/
    └── ... (mirror of en/, same filenames)
```

### Loader

A small loader merges only the namespaces a route needs:

```ts
// src/i18n/load-messages.ts
import { notFound } from 'next/navigation';

const NAMESPACES = [
  'common', 'validation', 'errors', 'nav', 'footer', 'meta', 'language-switcher',
  'landing/hero', 'landing/how-it-works', /* ...etc */
] as const;

export type Namespace = typeof NAMESPACES[number];

export async function loadMessages(locale: string, namespaces: Namespace[]) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    })
  );
  return Object.fromEntries(entries);
}
```

Each route's RSC entry calls `loadMessages(locale, [...needed])` and passes the result into `<NextIntlClientProvider messages={...}>`. This is what keeps each locale bundle small.

### Naming convention inside files
- Top-level keys are namespaced by feature, never by component file name (so renaming a component doesn't break translations).
- `kebab-case` keys: `evidence-drawer-title`, not `evidenceDrawerTitle`, to match the existing project naming style.
- ICU placeholders use named slots: `"You have {count, plural, one {# message} other {# messages}}"`.

---

## 5. Type safety

```ts
// src/i18n/messages.d.ts
type CommonMessages = typeof import('@/messages/en/common.json');
type LandingHero = typeof import('@/messages/en/landing/hero.json');
// ... merge all

declare interface IntlMessages extends
  CommonMessages, LandingHero /* etc */ {}
```

`useTranslations('landing/hero')` will then complete and type-check keys at build time. CI fails if a translation key referenced in code is missing from `en/`.

A linter script `scripts/validate-i18n.ts` (added in Phase 1) walks `src/messages/uz/**` and confirms every key in `en/` has a counterpart, and warns on unused keys.

---

## 6. Locale detection, persistence, switcher

### Middleware (`src/middleware.ts`)
```ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',          // /en/... and /uz/..., never bare /
  localeDetection: true,            // honors Accept-Language on first hit
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

The CSP nonce middleware that already exists must be composed with this — both run on the same request. Confirm composition works (single middleware function calling both) before merging.

### Persistence
- next-intl writes `NEXT_LOCALE` cookie on locale change.
- Cookie path `/`, `SameSite=Lax`, 1-year max-age.
- Logged-in users: locale also stored on the Firestore profile (`user.preferences.locale`) so we honor it across devices. Reconciliation rule: client cookie wins for the active session; on login we write the cookie value to Firestore if it differs.

### Switcher UI
- Lives in `src/components/layout/language-switcher.tsx` (new).
- A small dropdown with the language native names: **English** and **Oʻzbekcha**.
- Mounted in:
  - `src/components/layout/sidebar.tsx` (authenticated app)
  - `src/components/layout/mobile-header.tsx`
  - `src/components/landing/sticky-top-nav.tsx`
  - `src/components/landing/site-footer.tsx`
- On change, calls `router.replace(pathname, { locale })` from next-intl's navigation helpers, preserving the current path.

---

## 7. Server vs client component patterns

| Context | API |
|---|---|
| Server component | `const t = await getTranslations('namespace');` |
| Server component metadata | `const t = await getTranslations({ locale, namespace });` |
| Client component | `const t = useTranslations('namespace');` |
| Outside React (zod errors, util fns) | Pass `t` in or use `getTranslator()` in server actions; for pure utility translations, prefer ICU strings + format on the call site |

**Rule for the codebase:** never call `useTranslations` inside a hook that runs in a non-React context. Validation messages from Zod are produced by a `makeSchema(t)` factory rather than a static `schema` constant.

---

## 8. Pluralization, dates, numbers

- Use ICU directly inside JSON values:
  - `"strength-count": "{count, plural, one {# strength} other {# strengths}}"`
- For dates and numbers use `next-intl`'s `useFormatter()`:
  - `format.dateTime(date, { dateStyle: 'long' })`
  - `format.number(value, { style: 'currency', currency: 'USD' })`
- Replace ad-hoc `toLocaleDateString()` calls in components with `useFormatter` so the same formatter is used everywhere.

---

## 9. Uzbek-specific decisions

- **Script:** Latin (`uz-Latn`, but BCP-47 tag `uz` since Latin is the de-facto modern default in Uzbekistan). Cyrillic (`uz-Cyrl`) added later if user demand appears — the namespace structure already accommodates it (just a third folder under `src/messages/`).
- **Tone / register:** semi-formal "siz" address (the polite second-person), consistent across the product. We do not switch between "sen" and "siz" because Lumina addresses adults (16+) in a coaching context.
- **Domain vocabulary:** career/psychometric terms often have weak Uzbek equivalents. Glossary file lives at `docs/i18n-glossary-uz.md` and is the canonical source for translators. Examples to lock down before bulk translation:
  - "talent" → *isteʼdod*
  - "strength" → *kuchli tomon*
  - "career path" → *kasb yoʻnalishi*
  - "assessment" → *baholash*
  - "psychometric" → *psixometrik*
  - "live session" → *jonli sessiya*
  - "consent" → *rozilik*
- **Plural rules:** Uzbek uses CLDR category `other` only. ICU handles this automatically — translators only fill the `other` slot.
- **Date/number formats:** Uzbek uses `DD.MM.YYYY` and space-as-thousand-separator; both come "free" via `Intl.DateTimeFormat('uz')` and `Intl.NumberFormat('uz')`.
- **Accept-Language matching:** browsers commonly send `uz`, `uz-UZ`, `uz-Latn-UZ`. All three should resolve to our `uz` locale — next-intl handles this via its negotiator.

---

## 10. SEO

- `<html lang={locale}>` set in `src/app/[locale]/layout.tsx` (replaces hardcoded `lang="en"` in current `src/app/layout.tsx`).
- Each page emits `alternates.languages` in `generateMetadata`:
  ```ts
  alternates: {
    canonical: `/${locale}${pathname}`,
    languages: { en: `/en${pathname}`, uz: `/uz${pathname}` },
  }
  ```
- `src/app/sitemap.ts` emits both URLs per route with `alternates`.
- `src/app/robots.ts` unchanged (still allows everything).
- OpenGraph images that contain text (e.g. `src/app/about/opengraph-image.tsx`) get a `[locale]` parameter and read the correct title from messages.

---

## 11. Build & lint guards

Add to `npm run ci`:
- `tsx scripts/validate-i18n.ts` — fails if any `uz` namespace is missing a key present in `en`, or vice versa.
- An ESLint rule `no-literal-jsx-text` (custom or via `eslint-plugin-i18n-json`) enforced in `src/app/[locale]/**` and `src/components/**` (allowlist for `<code>`, brand strings like "Lumina", icon-only elements). This catches future regressions where someone hardcodes a string.

---

## 12. Migration phases

The work splits into two parallel tracks. Track **U** is UI strings (the original §4 plan). Track **A** is AI/content (§13). The phases below interleave them so the product is always shippable. Each phase is a self-contained PR. After each phase the app builds, type-checks, and runs end-to-end in both locales — for any not-yet-translated UI string we land a stub `[uz]` prefixed copy so QA can spot it; the validator allows this prefix only behind an env flag and refuses to allow it when `NODE_ENV=production`.

### Phase 0 — Scaffold (no user-visible change)
- Install `next-intl`.
- Create `src/i18n/config.ts` (locales list, default, names).
- Create `src/i18n/request.ts` (next-intl request config).
- Create `src/i18n/load-messages.ts`.
- Create `src/middleware.ts` and compose with the existing CSP middleware.
- Create empty namespace files under `src/messages/en/` and `src/messages/uz/` matching the layout in §4.
- Add `validate-i18n.ts` script and wire into `npm run ci`.
- Add `messages.d.ts` augmentation.
- Update `tsconfig.json` if needed (`resolveJsonModule` is already on by default in Next).

### Phase 1 — Routing migration
- Move every page under `src/app/[locale]/...` (preserving `(app)` and `(auth)` route groups).
- Update `src/app/[locale]/layout.tsx` to wrap with `NextIntlClientProvider`, set `<html lang={locale}>`.
- Update sitemap to emit both locales.
- No string changes yet — pages still contain English literals; this phase only proves routing works.
- Acceptance: `/`, `/en`, `/uz` all 200; share links resolve; auth flow still works.

### Phase 2 — Common, nav, footer, errors
- Translate the smallest, highest-impact namespaces:
  - `common.json` — buttons, generic words, "save/cancel/yes/no/loading"
  - `nav.json` — sidebar, mobile-header, top-nav, breadcrumbs
  - `footer.json`
  - `errors.json` — `error.tsx`, `not-found.tsx`, `global-error.tsx`, toast errors, common API error messages
  - `language-switcher.json`
- Build the language switcher and mount it.
- Acceptance: switching locale on any page changes navigation, footer, and global errors immediately.

### Phase 3 — Marketing surface
- `landing/*`, `marketing/*`, `meta.json`.
- Why early: marketing is what unauthenticated visitors see first, so this validates the SEO/hreflang/sitemap pipeline before the heavier app surface.
- Update OG images for translated titles.
- Acceptance: `/uz`, `/uz/about`, `/uz/pricing` etc. fully Uzbek; `hreflang` validates in Search Console preview.

### Phase 4 — Auth, onboarding, consent
- `auth/*`, `onboarding/*`, `consent/*`.
- This is the path a brand-new user takes from landing → app, so doing it together lets us run a full localized signup walkthrough in QA.
- Acceptance: full Uzbek signup, age gate, video consent, cookie banner.

### Phase 5 — Core app: dashboard, connections, settings
- `dashboard/*`, `connections/*`, `settings/*`.
- Acceptance: a returning user with a profile sees a fully Uzbek dashboard.

### Phase 6 — Quiz & session UI
- `quiz/*`, `session/*`.
- Locale switcher disabled while `useLiveSession().status === 'connected'`, with a tooltip explaining why. Switcher during an in-progress quiz module shows a confirmation modal (see §13.3).
- Acceptance: full Uzbek quiz + full Uzbek live session chrome. AI content still English at this point — Track A handles that.

### Phase 7 — Report, evolution, agent, profile UI
- `report/*`, `evolution/*`, `agent/*`, `settings/profile.json`.
- All chrome translated; AI-generated bodies still in original language until Track A phases land.
- Acceptance: a Uzbek user sees Uzbek labels around still-English narratives. Pre-A4 acceptable, post-A4 requires Uzbek narratives too.

### Phase A0 — Live-audio verification (gate)
- Spike: connect to `gemini-2.5-flash-native-audio-preview-12-2025` with a Uzbek-only system instruction across each prebuilt voice. Record samples. Have a native Uzbek speaker rate intelligibility on a 1–5 scale.
- Decision recorded in `docs/i18n-live-audio-decision.md`: ship-as-is, ship-with-disclaimer, or fall back to text-only / cascade TTS.
- This phase is a **gate** — A2 cannot ship live voice in Uzbek until this decision is made.
- No user-visible change.

### Phase A1 — AI prompt locale wiring
- Convert every prompt constant in `src/lib/gemini/prompts.ts` to a function taking `{ locale }`.
- Add `src/lib/gemini/locale-directives.ts`.
- Thread `locale` through `src/lib/agent/**` (orchestrator, data-analyzer, correlator, report-agent, evaluate-client, behavioral-timeline).
- Update Zod request schemas under `src/app/api/**` to require `locale`.
- Update API routes to read and forward the locale through to model calls.
- Add `locale` field to every Firestore document type listed in §13.6 and update writers.
- Acceptance: when an `en` user calls any AI route, output stays English (no regression). When a `uz` user calls quiz generation, the quiz comes back in Uzbek (verified manually).

### Phase A2 — Live session in Uzbek
- Pass locale into `LiveSession` constructor; live system instruction switches based on locale.
- Function-call `description` strings localized in `src/lib/gemini/live-session.ts`.
- `speechConfig.voiceName` selected per locale per the A0 decision.
- If A0 chose "text-only fallback": gate the live audio button when `locale === 'uz'`, route those users into a text-mode live session; the rest of the session UX stays.
- Acceptance: a Uzbek user opens `/uz/session`, the model greets and converses in Uzbek; transcript shows Uzbek text.

### Phase A3 — Quiz, challenges, reflections in Uzbek
- Quiz generation/scoring and challenge generation honor locale (already wired in A1, just verify).
- Reflection analyses honor locale.
- Confirmation modal for mid-quiz locale switch implemented (see §13.3).
- Acceptance: Uzbek user takes a full quiz module → score → feedback in Uzbek. Generated micro-challenges in Uzbek.

### Phase A4 — Report generation in Uzbek
- `REPORT_GENERATION_PROMPT`, `REPORT_CRITIQUE_PROMPT`, `REPORT_REFINEMENT_PROMPT`, `REPORT_VALIDATION_PROMPT`, `REPORT_REGENERATION_PROMPT` all honor locale.
- Self-correction loop runs in the user's locale (critique and refinement prompts are also localized so the model can criticize Uzbek output meaningfully).
- Each report is stored with its `locale`.
- Acceptance: a Uzbek user requests a report; every section narrative is in Uzbek; evidence quotes show translated text by default with the original behind a "Show original" affordance.

### Phase A5 — Translation cache + imported source data
- Implement `src/lib/i18n/translator.ts` and the Firestore `translations` cache.
- Update evidence drawer, report citations, and any other surface that quotes user data to render via the translator.
- Background-translate freshly-generated reports to the user's other locale opportunistically (so a switch is instant).
- Acceptance: a Uzbek user imports an English Gmail account, requests a report, sees Uzbek summary text and Uzbek-translated evidence quotes; clicking "Show original" reveals the English source verbatim.

### Phase A6 — Glossary, native-speaker review of AI outputs
- Native Uzbek speaker reviews 20+ generated reports, 20+ quiz modules, and 5+ live session transcripts. Discrepancies fed back into the glossary and prompt directives.
- Iterate prompt directives until subjective quality is acceptable.
- Acceptance: native reviewer signs off; sample outputs attached to the release notes.

### Phase 8 — Polish, QA, lint enforcement
- Turn on the `no-literal-jsx-text` rule.
- Visual QA: long Uzbek strings (~1.4× English length on average) — verify no overflow on mobile (sidebar items, buttons, toasts, modal headers especially).
- Performance check: each locale's bundle should not exceed the previous English baseline + 5%; translation cache hit rate ≥ 80% in QA replays.
- Final monolingual-Uzbek-user walkthrough — see §15.

---

## 13. AI-generated content must follow the user's locale

This is now a **first-class** part of the i18n work, not a follow-up. A monolingual Uzbek user must be able to use Lumina end-to-end and never see English. That requires four interlocking subsystems below.

### 13.1 Locale-aware prompt construction

All Gemini prompt builders in `src/lib/gemini/prompts.ts` (`LIVE_SESSION_SYSTEM_PROMPT`, `QUIZ_GENERATION_PROMPT`, `getModuleQuizPrompt`, `QUIZ_SCORING_PROMPT`, `DATA_ANALYSIS_PROMPT`, `REPORT_GENERATION_PROMPT`, `REPORT_CRITIQUE_PROMPT`, `REPORT_REFINEMENT_PROMPT`, `REPORT_VALIDATION_PROMPT`, `CHALLENGE_GENERATION_PROMPT`, `REFLECTION_ANALYSIS_PROMPT`, `AGENT_DATA_ANALYSIS_PROMPT`, `AGENT_CORRELATION_PROMPT`, `REPORT_REGENERATION_PROMPT`) become **functions that take a `locale` parameter** instead of static string constants. Callers in `src/lib/agent/**` and `src/app/api/**` thread the locale through.

A single helper, `src/lib/gemini/locale-directives.ts`, exports:

```ts
export function localeDirective(locale: 'en' | 'uz'): string {
  if (locale === 'uz') {
    return [
      '# OUTPUT LANGUAGE — STRICT',
      'Respond exclusively in Uzbek (Latin script, "lotin yozuvi"). Use BCP-47 "uz".',
      'Do NOT use Cyrillic. Do NOT mix English. Do NOT include English in parentheses.',
      'If the source material you are reasoning over is in another language (English, Russian, etc.),',
      'translate the relevant content into Uzbek before quoting it. When you must quote source material verbatim',
      'for evidence, provide the original verbatim AND a Uzbek translation in the same evidence object',
      '(fields: `quoteOriginal`, `quoteTranslated`, `quoteOriginalLanguage`).',
      'Use the polite "siz" form throughout. Career and psychometric vocabulary follows docs/i18n-glossary-uz.md.',
      'Numbers: use space as thousands separator. Dates: DD.MM.YYYY.',
    ].join('\n');
  }
  return '# OUTPUT LANGUAGE\nRespond in clear, professional English (BCP-47 "en").';
}
```

This directive is **prepended** to every system prompt the platform sends. It is duplicated at the top **and** the bottom of long prompts, because language adherence drift in long contexts is a known failure mode for every frontier model.

For structured outputs validated by Zod (most of our pipeline), the schema fields stay English (e.g. `strengths[].title`, `careerPaths[].name`) but the **values** are written in the target locale. Schema-level field documentation may instruct the model to translate enum-like values that are user-visible (e.g. dimension labels) while leaving stable internal identifiers untranslated.

### 13.2 Live voice session in Uzbek

The Live API session (`src/lib/gemini/live-session.ts`) gains a `locale` parameter. When `locale === 'uz'`:

- The system instruction begins with a maximally explicit Uzbek-only directive, repeated at the top and bottom of the instruction. Example: *"Siz faqat oʻzbek tilida (lotin yozuvi) gapirasiz. Hech qanday holatda ingliz, rus yoki boshqa tilga oʻtmang. Foydalanuvchi boshqa tilda gapirsa ham, javobingiz oʻzbekcha boʻladi."*
- All function-call descriptions in `tools.functionDeclarations` (e.g. `SaveInsightFunctionDeclaration`) get Uzbek `description` strings so the model emits Uzbek-language `insight.text` arguments.
- `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName` is selected per locale. **Open question (must verify in Phase A0):** does `gemini-2.5-flash-native-audio-preview-12-2025` produce intelligible Uzbek with any prebuilt voice? See §13.5.
- Live transcript UI (`transcript-panel.tsx`) renders model audio transcripts in the model's spoken language — i.e. Uzbek when locale is Uzbek. No retranslation needed there because the model already speaks Uzbek.
- The ephemeral-token mint endpoint (`/api/gemini/ephemeral-token`) accepts a `locale` field, validates it, and embeds it into the live config so a tampered client cannot widen language scope.

### 13.3 Quiz generation in Uzbek

- Quiz module prompts (`getModuleQuizPrompt`, `QUIZ_GENERATION_PROMPT`) take locale; emitted question text, choices, helper hints, and dimension descriptions are all Uzbek when locale is Uzbek.
- Each quiz session record in Firestore gets a `locale` field at creation. Once a quiz is started in Uzbek, it stays Uzbek even if the user switches the UI locale mid-quiz — we don't retranslate completed questions because that would change the assessment instrument's validity.
- Locale switcher behavior: if the user has an in-progress quiz module, the switcher shows a confirmation modal: *"Switching language will start a new quiz module in {target}. Your current progress in {source} will be saved."* The user can either (a) finish the current module in the original language, then continue in the new language, or (b) abandon and restart.
- Quiz scoring (`QUIZ_SCORING_PROMPT`) accepts answers in either locale — the scorer is locale-tagged so the model knows what it's reading.

### 13.4 Imported source data — translate at render, not at storage

This is the most important rule: **we never overwrite the user's data.** A Uzbek user's English Gmail message is still stored as the original English text. Translation happens at render time on user-facing surfaces and is cached.

Affected surfaces:

| Surface | Source | Translation behavior |
|---|---|---|
| Evidence drawer (`src/components/report/evidence-drawer.tsx`) | quotes from Gmail / Drive / Notion / ChatGPT export / uploads | quote shown in user's locale; "Show original" link reveals source language verbatim |
| Report citations | same | same — translated by default, original on demand |
| Live session context (built into `dataContext` in `live-session.ts`) | summarized source data passed to the model | summarized in user's locale during analysis (so the model already speaks about it correctly) |
| Agent decision log human-readable lines | analyzer output | locale-stamped at write time |
| Transcript playback | user's spoken words | preserve verbatim what the user said in whatever language they spoke; provide an opt-in "translate" button per turn |

How translation cache works:

- New library: `src/lib/i18n/translator.ts` — `translate({ text, sourceLocale, targetLocale, kind }): Promise<string>`.
- Backed by `gemini-3-flash-preview` for quality + cost balance. Calls go through the same `verifyAuth` + rate-limit layer as other Gemini routes.
- Cache key: `sha256(text + sourceLocale + targetLocale + kind)`. Stored in a Firestore `translations` collection with TTL of 90 days for source-data quotes (since users can re-import) and indefinite for AI-generated content (since it's tied to a fixed report version).
- For long-form content (a 2k-word report), translation runs as a background job kicked off the moment the report is generated; on-demand fallback translates synchronously with a streaming UI if the cache misses.
- Translation prompt itself includes the glossary (`docs/i18n-glossary-uz.md`) so domain vocabulary stays consistent.

### 13.5 Honest risk: Uzbek native-audio support

The Gemini Live native audio model has a finite list of supported output languages and prebuilt voices. **I do not have authoritative confirmation that Uzbek (any script) is currently supported for native-audio output on `gemini-2.5-flash-native-audio-preview-12-2025`.** This must be verified empirically in Phase A0 (one of the very first tasks) before we promise users a fully-Uzbek voice experience.

Outcomes and mitigations:

| Verification result | Plan |
|---|---|
| Uzbek voice works with reasonable quality | Ship as designed; pick the highest-quality voice and ship. |
| Voice synthesizes Uzbek text but with poor pronunciation | Ship with a quality disclaimer in the consent step; queue an upgrade once Google adds first-class Uzbek voices. |
| Voice cannot produce Uzbek at all | Two-tier fallback: **(a)** text-only Uzbek live mode — model responds in Uzbek text, no audio out, user can still type or speak input; **(b)** behind a feature flag, route Live audio through cascade: Gemini Live in text mode → external Uzbek TTS service (e.g. Google Cloud TTS `uz-UZ` voice if available, or a third-party). Cascade adds ~500–800ms latency and complicates barge-in; defer until pilot demand justifies the cost. |

Phase A0 is gated on running a 30-minute manual exploration with the Live API in Uzbek mode and recording the result. The decision is documented in `docs/i18n-live-audio-decision.md` before any user-facing Uzbek live mode ships.

### 13.6 Locale on every AI-produced record

Every Firestore document that contains AI-produced human-readable text gains a `locale: 'en' | 'uz'` field, written at generation time. Affected models in `src/types/index.ts`:

- `Report` and `ReportSection`
- `QuizSession`, `QuizQuestion`, `QuizAnswer`
- `Evidence` (gains `quoteOriginal`, `quoteOriginalLanguage`, `quoteTranslated` per locale; index by `locale`)
- `MicroChallenge`, `ActionPlanItem`
- `AgentDecision` (only the human-readable `reason`/`narrative` field is locale-tagged; structured fields like `action` stay locale-free)
- `Reflection` analyses
- `BehavioralTimelineEntry` summaries

Display rule: if `record.locale === userLocale`, render directly. Else, fetch from translation cache; on miss, translate and write back.

### 13.7 Updated API route pattern

The CLAUDE.md "API Route Pattern" gains one step:

1. `verifyAuth(req)`
2. Parse and validate request (Zod) — request schema **must** include `locale`
3. Read user locale from request body, falling back to the `NEXT_LOCALE` cookie, falling back to the user's stored profile preference, falling back to `en`
4. Call Gemini model with locale-aware prompt builders
5. Parse response (`safeParseJson` where applicable)
6. Validate response schema (Zod)
7. Persist with `locale` field on every AI-produced record
8. Return typed success/error responses (errors are translated by the client using `errors.json`)

---

## 14. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Long Uzbek strings break tight UI (sidebar, buttons, tabs) | Phase 8 visual QA; add `min-w-0` / `truncate` defensively in nav; use `text-balance` where helpful |
| Translator unavailable, machine-only translation ships for UI | Phase 8 gates UI release on native-speaker review; `[uz]` stub prefix during dev so QA spots untranslated strings |
| Middleware composition with existing CSP middleware breaks | Phase 0 adds an integration test that asserts both nonce header and locale cookie are set on a single request |
| Bundle size regression from per-locale loading | Loader uses dynamic `import()` per namespace; webpack code-splits per locale folder; monitor bundle analyzer in CI |
| Locale stuck in cookie after user changes browser language | Switcher exposes "use browser default" option; cookie max-age is 1 year not infinite |
| Search engines index both locales as duplicate content | `hreflang` + per-locale `canonical` set in `generateMetadata`; sitemap declares alternates |
| Mid-live-session locale switch corrupts transcript | Switcher disabled while `useLiveSession` is connected (Phase 6) |
| Hardcoded UI strings reintroduced silently | ESLint `no-literal-jsx-text` rule (Phase 8) prevents regression |
| **Uzbek native-audio voice quality is poor or unsupported** | Phase A0 verification gate; documented decision in `docs/i18n-live-audio-decision.md`; text-only fallback or external TTS cascade as Plan B / C |
| **Model drifts back to English mid-response in long contexts** | Locale directive duplicated at top and bottom of every system prompt; report-critique step adds an explicit "language adherence" check that flags any non-Uzbek text in Uzbek output and triggers refinement |
| **AI generates Uzbek of poor quality / mistranslates domain terms** | Phase A6 native-speaker review gate; glossary file pinned in prompt directives; critique loop catches flagrant errors |
| **Translation cost balloons for high-traffic Uzbek users** | All translations content-hash cached in Firestore with TTL; `gemini-3-flash-preview` chosen for translator (cheap); rate-limited per user; observability dashboard tracks translation tokens per session |
| **Cyrillic creeps into Uzbek output (Cyrillic-trained data is more abundant)** | Locale directive explicitly forbids Cyrillic; output validator does a script check (`/[Ѐ-ӿ]/`) and triggers a refinement pass on hit |
| **Source data PII leaks into translation cache** | Translator receives only the snippet to translate, not full documents; cache entries carry the same access controls as the parent record; cache is keyed per-user (no cross-user reuse) for source-data quotes |
| **Uzbek user sees mixed Uzbek/English in one report** | Every AI-produced record has a `locale` field; render layer translates if `record.locale !== userLocale`; no "best effort" fallback to original |
| **Quiz validity damaged by mid-quiz translation** | Quiz is locked to its origin locale; switcher requires explicit confirmation modal that starts a new module |

---

## 15. Acceptance criteria for "i18n is done" (v1)

The defining test is a **monolingual Uzbek user walkthrough**. A Uzbek-only speaker, with the browser set to `uz`, must complete the full product journey without seeing English anywhere except the immutable brand word "Lumina" and out-of-scope MDX article bodies.

- [ ] `npm run lint`, `npm run typecheck`, `npm run build`, `npm run validate:routes`, `npm run ci` all pass.
- [ ] Monolingual Uzbek walkthrough: landing → signup → consent → onboarding → connect Gmail (English account) → take quiz → take live voice session → read report → review evidence → set up evolution challenges → adjust settings. **At every step**, every visible string is Uzbek (Latin), including:
  - all UI chrome,
  - quiz questions and choices,
  - the AI's spoken voice in the live session (or, if A0 mandated text-only fallback, the AI's text replies in Uzbek),
  - report narratives, section titles, headings, body text,
  - evidence quotes from the user's English Gmail (translated, with "Show original" available),
  - micro-challenges and reflection prompts,
  - agent decision-log human-readable lines,
  - error messages and toasts.
- [ ] Switching locale persists across reload and across browser sessions.
- [ ] Switching locale mid-quiz triggers the confirmation modal; existing quiz progress is preserved in its origin locale.
- [ ] Live session locale switcher is disabled while connected.
- [ ] `lighthouse --preset=desktop` scores within 3 points of pre-migration baseline on `/en` and `/uz`.
- [ ] `view-source: /uz/about` shows `lang="uz"` and `<link rel="alternate" hreflang="en">`.
- [ ] `npm run ci`'s i18n validator reports zero missing keys.
- [ ] No string exceeds the design width on iPhone SE (375px).
- [ ] Every Firestore record produced during the walkthrough carries the correct `locale` field.
- [ ] Translation cache hit rate ≥ 80% on a second walkthrough of the same content.
- [ ] Native Uzbek speaker has reviewed and signed off on the AI outputs sampled in Phase A6.
- [ ] `docs/i18n-live-audio-decision.md` exists and documents the A0 outcome.

---

## 16. Open questions to resolve before Phase 0

1. Confirm the chosen locale code: `uz` (Latin) vs `uz-Latn-UZ`. **Default proposal:** `uz`.
2. Native-speaker translator engagement — who reviews? Is there an internal Uzbek-speaking team member, or do we engage a contractor (e.g. Gengo/Smartcat)?
3. Should the locale prefix be `'always'` (`/en/...`) or `'as-needed'` (`/about` for default, `/uz/about` for Uzbek)? **Default proposal:** `'always'` for consistency and predictable analytics.
4. Are there any product copy strings in Firestore or remote config today? If yes, those need a parallel translation strategy (out of scope here, but flag any found during Phase 0 audit).
5. Do we want analytics events (PostHog/Vercel Analytics) tagged with `locale` for cohort analysis? **Default proposal:** yes, set as a super-property in Phase 2.

---

## 17. Implementation order summary (one-line per phase)

Track **U** (UI strings) and Track **A** (AI/content) interleave. The order below is the recommended landing sequence.

0. **U** — Scaffold next-intl, middleware, empty namespace tree, validator script.
1. **U** — Move every page to `[locale]` route segment; sitemap emits both locales.
2. **U** — Translate `common`, `nav`, `footer`, `errors`, `language-switcher`; ship the switcher.
3. **U** — Translate marketing + landing.
4. **U** — Translate auth, onboarding, consent.
5. **U** — Translate dashboard, connections, settings.
A0. **A** — Live-audio Uzbek verification spike + decision doc (gate for A2). Can run in parallel with U2–U5.
A1. **A** — Wire `locale` through every prompt builder, agent module, API route, and Firestore record.
6. **U** — Translate quiz + session UI (with mid-session switch lockout).
A2. **A** — Live session speaks Uzbek (or text-only fallback per A0).
A3. **A** — Quiz, challenges, reflections generated in Uzbek.
7. **U** — Translate report, evolution, agent UI chrome.
A4. **A** — Report generation (and self-correction loop) in Uzbek.
A5. **A** — Translation cache + imported source data translated on display.
A6. **A** — Native-speaker review of AI outputs; glossary and prompt iteration.
8. **U** — Native-speaker UI review pass; enable `no-literal-jsx-text`; bundle/perf audit; final monolingual-Uzbek walkthrough.
