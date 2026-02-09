# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (v9 flat config)
```

No test framework is configured.

## Project Guidelines

- Use `@google/genai` SDK (NOT deprecated `@google/generative-ai`)
- All Gemini calls go through API routes (never expose API key in client code, except Live API with ephemeral token)
- Use Zod schemas for all structured Gemini outputs
- Firebase Auth: always verify ID token in API routes via `verifyAuth(req)` from `src/lib/api-helpers.ts`
- shadcn/ui components only (no custom UI primitives)
- Tailwind v4 only (no CSS modules or styled-components)
- All hooks prefixed with `use-`
- System prompts live in `src/lib/gemini/prompts.ts` only — this is the single source of truth
- TypeScript strict mode, no `any` types
- Keep commits short, no Claude attribution in commits

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Firebase (Auth + Firestore), Gemini AI, Tailwind v4, shadcn/ui

**What Lumina does:** Multimodal AI talent discovery app. Users authenticate with Google, connect data sources (Gmail, ChatGPT exports, Drive, Notion), take an AI-adaptive quiz, do a live video session with an AI counselor, and receive a talent report.

### Route Groups

- `(app)/` — Authenticated pages with sidebar layout. Auth enforced client-side in layout.tsx via `AuthContext`, redirects to `/login` if unauthenticated. Wraps children in `AssessmentProvider` for stage progression.
- `(auth)/` — Login page, no sidebar.

### API Route Pattern

All routes in `src/app/api/` follow this pattern:
1. `verifyAuth(req)` for Firebase ID token verification
2. Validate request body with Zod
3. Call Gemini via `getGeminiClient()` with `responseMimeType: 'application/json'`
4. Parse response with `safeParseJson()` (handles markdown code blocks)
5. Validate response with Zod schema
6. Return structured JSON or error with code (`GEMINI_ERROR`, `VALIDATION_ERROR`, etc.)

### Gemini Models

- `gemini-2.5-flash-preview-05-20` — Quiz generation, data analysis
- `gemini-2.5-pro-preview-06-05` — Report generation
- `gemini-live-2.5-flash-preview` — Live video session (WebSocket via `src/lib/gemini/live-session.ts`)

### State Management

React Context only (no Redux/Zustand):
- `AuthContext` (`src/contexts/auth-context.tsx`) — User auth, Google OAuth tokens, profile
- `AssessmentContext` (`src/contexts/assessment-context.tsx`) — Stage progression, assessment data

### Firestore Structure

- `users/{uid}` — User profile, Google access tokens
- `users/{uid}/assessment/dataInsights` — Gemini analysis of connected data
- `users/{uid}/assessment/quizAnswers` — Quiz responses
- `users/{uid}/assessment/sessionInsights` — Live session observations
- `users/{uid}/assessment/talentReport` — Final generated report

Firestore helpers are in `src/lib/firebase/firestore.ts`.

### Key Files

- `src/lib/gemini/prompts.ts` — All AI system prompts (only place to add/edit prompts)
- `src/lib/api-helpers.ts` — `verifyAuth()`, error response helpers, `safeParseJson()`
- `src/lib/gemini/client.ts` — `getGeminiClient()` factory
- `src/lib/gemini/live-session.ts` — WebSocket manager for Gemini Live API
- `src/lib/schemas/` — Zod schemas for quiz, analysis, report, session
- `src/lib/env.ts` — Server-side environment variable validation
- `src/lib/fetch-client.ts` — Authenticated fetch wrapper (attaches Firebase ID token)

### Styling

Tailwind v4 with CSS variables defined in `globals.css`. Dark cosmic theme with custom utilities: `.glass`, `.glow-amber`, `.text-gradient-gold`, `.text-gradient-violet`, `.grain-overlay`. Fonts: Instrument Serif (headings), Outfit (sans), Geist Mono (mono).
