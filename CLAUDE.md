# Lumina - Project Guidelines

- Use `@google/genai` SDK (NOT deprecated `@google/generative-ai`)
- All Gemini calls go through API routes (never expose API key in client code, except Live API with ephemeral token)
- Use Zod schemas for all structured Gemini outputs
- Firebase Auth: always verify ID token in API routes
- shadcn/ui components only (no custom UI primitives)
- Tailwind only (no CSS modules or styled-components)
- All hooks prefixed with `use-`
- System prompts live in `src/lib/gemini/prompts.ts` only
- TypeScript strict mode, no `any` types
- Keep commits short, no Claude attribution in commits
