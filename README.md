# Lumina

A multimodal talent-discovery platform that helps people find their strongest career direction through connected data sources, adaptive psychometric assessment, live AI video conversation, and evidence-grounded recommendations.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **AI:** Google Gemini (Flash, Pro, Live Audio/Video)
- **Auth & Database:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **State:** Zustand + React Query v5
- **Validation:** Zod
- **Integrations:** Gmail, Google Drive, Notion, ChatGPT exports, file uploads

## Features

**Data Integration** — Connect Gmail, Google Drive, Notion, ChatGPT exports, or upload files directly. Lumina analyzes patterns across your data to surface career-relevant signals.

**Adaptive Quiz** — Five assessment modules (Interests, Work Values, Strengths & Skills, Learning Environment, Constraints) with AI-adaptive questions that respond to your answers in real time. Built on RIASEC + custom psychometric dimensions.

**Live Multimodal Session** — Real-time video + voice conversation with an AI career counselor. Observes engagement, hesitation, confidence, and communication style (with explicit consent only). Uses server-minted ephemeral tokens for security.

**Talent Report** — Personalized report with radar chart, top strengths with evidence and confidence levels, hidden talents, career path matches with scores, and a prioritized action plan.

**Growth Loop** — Micro-challenges across categories (explore, create, connect, learn, reflect), reflection journaling with sentiment analysis, and profile snapshots that track your evolution over time.

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Firestore + Auth)
- Google Gemini API key
- Google OAuth credentials (for Gmail/Drive)
- Notion OAuth app (optional)

### Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
GEMINI_API_KEY=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NEXT_PUBLIC_NOTION_CLIENT_ID=
```

### Development

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run lint      # Run linter
npm run build     # Production build
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (auth, data connectors, Gemini, profile, admin)
│   ├── (auth)/           # Login
│   └── (app)/            # Protected routes
│       ├── dashboard/    # Pre/post-completion dashboard
│       ├── onboarding/   # Initial setup + consent
│       ├── connections/  # Data source connections
│       ├── quiz/         # Adaptive assessment
│       ├── session/      # Live video/audio session
│       ├── report/       # Talent report
│       ├── evolution/    # Growth tracking
│       └── settings/     # User settings
├── components/           # UI components by feature area
├── hooks/                # Custom hooks (API, live session, webcam, mic)
├── lib/
│   ├── gemini/           # Gemini client, models, prompts, audio/video utils
│   ├── firebase/         # Firebase config, admin SDK, Firestore helpers
│   ├── schemas/          # Zod schemas (report, quiz, session, analysis)
│   ├── career/           # RIASEC profile builder, O*NET data, evolution
│   ├── psychometrics/    # Dimension models
│   └── analytics/        # Event tracking
├── stores/               # Zustand stores (auth, assessment, iteration)
└── types/                # TypeScript definitions
```

## Assessment Flow

1. **Connections** — Link data sources (Gmail, Drive, Notion, ChatGPT, files)
2. **Quiz** — Complete the adaptive psychometric assessment
3. **Session** — Live video conversation with AI counselor
4. **Report** — Review your personalized talent report

## Privacy & Security

- API keys are never exposed to the browser; live sessions use server-minted ephemeral tokens
- All consent is explicit: age verification (16+), video consent, behavioral inference consent
- Raw imported content is transient; only derived insights are retained
- Behavioral observations are limited to coaching signals — no identity recognition, medical diagnosis, or immutable personality claims
- Every strong claim includes evidence source and confidence score
