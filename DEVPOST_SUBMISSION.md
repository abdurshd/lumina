# Devpost Submission — Lumina

> **Tagline:** Discover your strongest career direction through AI-powered multimodal talent discovery.

---

## Inspiration

Career guidance today is broken. Generic personality quizzes produce vague results. School counselors have 15 minutes per student. Career coaches cost hundreds per hour. Meanwhile, people have years of digital footprints — emails, documents, conversations, projects — that reveal more about their strengths than any quiz ever could.

We asked: what if AI could synthesize everything you've already created, combine it with validated psychometric science, and then actually talk to you — face to face — to uncover the career paths where you'd genuinely thrive?

That's Lumina. Not another career quiz. A multimodal talent-discovery system that sees the full picture.

---

## What it does

Lumina guides users through a four-stage talent discovery journey:

**1. Data Integration** — Users connect Gmail, Google Drive, Notion, or upload ChatGPT exports and local files. Gemini 3 Flash analyzes communication patterns, writing style, vocabulary, recurring interests, and hidden skill demonstrations across all connected sources.

**2. Adaptive Psychometric Assessment** — A five-module quiz spanning Interests (RIASEC), Work Values, Strengths & Skills, Learning Environment, and Practical Constraints. Questions are AI-generated and adapt in real time based on previous answers and connected data insights. Freetext responses are scored across multiple psychometric dimensions simultaneously.

**3. Live Multimodal Session** — A real-time video + voice conversation with an AI career counselor powered by Gemini's native audio model. The AI conducts a structured 9-phase coaching conversation, observing engagement patterns, hesitation, confidence, clarity, and collaboration style through behavioral cues — all with explicit user consent. During the conversation, the model autonomously decides when to save insights, fetch the user's profile for personalization, capture talent signals, suggest additional quiz modules for detected gaps, and schedule concrete next steps — all through live tool calling.

**4. Evidence-Grounded Talent Report** — Gemini 3 Pro synthesizes everything into a comprehensive report: a personalized headline talent, 6-axis radar chart, top strengths with evidence chains citing specific quiz answers, session timestamps, and data source excerpts, hidden talents the user doesn't recognize, career path matches scored against O*NET career clusters with RIASEC codes, a prioritized action plan, and explicit confidence notes about data sparsity.

After the initial report, users enter a **growth loop** — completing micro-challenges (explore, create, connect, learn, reflect), journaling reflections analyzed for sentiment, and tracking their profile evolution through snapshots over time.

---

## How we built it

**Tri-Model Architecture** — We strategically route tasks across three Gemini models:
- **Gemini 3 Flash** handles all fast operations: quiz generation, adaptive scoring, data source analysis, and real-time processing
- **Gemini 3 Pro** handles deep synthesis: talent report generation requiring complex multi-source reasoning and evidence correlation
- **Gemini 2.5 Flash Native Audio** powers the live multimodal session with bidirectional audio/video streaming over WebSocket

**Psychometric Foundation** — We built a 31-dimension psychometric framework grounded in career science: 6 RIASEC interest dimensions, 6 work value dimensions, 3 skill confidence dimensions, 3 learning environment dimensions, 5 practical constraint dimensions, 5 behavioral observation factors, and 3 legacy session categories. Scores are computed using winsorized averaging with multi-source evidence weighting.

**Stack** — Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind v4, shadcn/ui, Framer Motion, Firebase (Auth + Firestore), Zustand, React Query v5, and Zod for end-to-end schema validation of every AI output.

**Security** — Live sessions use server-minted ephemeral tokens so the API key never touches the browser. Three consent gates (age 16+, video consent, behavioral inference consent) must be cleared before any session begins.

---

## Challenges we ran into

- **Context window management during live sessions** — Long coaching conversations can exceed token limits. We implemented sliding-window compression that triggers at 65K tokens, preserving conversation coherence while staying within bounds.

- **Multi-source score normalization** — Combining scores from quizzes, behavioral observations, data analysis signals, and session insights into one coherent profile required careful statistical design. We settled on winsorized averaging with quartile outlier removal and source-weighted confidence scoring.

- **Behavioral observation ethics** — We had to carefully scope what the AI can and cannot claim from video observation. We limited it to 5 evidence-based categories (engagement, hesitation, emotional intensity, clarity, collaboration) and explicitly prohibit identity recognition, medical diagnosis, or immutable personality claims.

- **Adaptive quiz generation** — Making questions feel natural while ensuring they map cleanly to psychometric dimensions and adapt based on prior answers required extensive prompt engineering and structured output validation.

---

## Accomplishments that we're proud of

- **Every career recommendation is evidence-grounded** — No generic advice. Every strength, career match, and action item cites specific quiz question IDs, session transcript timestamps, and data source excerpts with confidence scores.

- **The live session feels like a real coaching conversation** — The 9-phase conversational structure with autonomous tool calling creates a natural flow where the AI genuinely adapts to the person in front of it.

- **True multimodal fusion** — We don't just use text OR voice OR video. We fuse written data analysis, psychometric scoring, live behavioral observation, and conversational insights into a single coherent talent profile.

- **Privacy-first by design** — Raw imported content is transient. Session data defaults to session-only storage. Behavioral inference requires explicit opt-in. The system is built around minimal data retention from the ground up.

---

## What we learned

- Gemini 3's structured output capabilities with tool calling during live sessions are transformative — the model can autonomously decide when to save an insight vs. fetch more context vs. suggest a quiz module, creating genuinely adaptive conversations.

- Career science (RIASEC, O*NET clusters) combined with AI produces dramatically better results than either alone. The psychometric framework grounds the AI's recommendations in validated career research.

- Evidence chains change everything. When users can see exactly why a career was recommended — "you scored 87 on Investigative, mentioned data analysis 4 times in your emails, and showed high engagement when discussing problem-solving at 3:42 in your session" — trust and engagement increase massively.

---

## What's next for Lumina

- **More data integrations** — LinkedIn, GitHub, Spotify listening patterns, and calendar analysis
- **Team talent mapping** — Organizations can map complementary strengths across team members
- **Longitudinal tracking** — Multi-month profile evolution with milestone celebrations
- **Mentor matching** — Connect users with professionals in their recommended career paths
- **Mobile native app** — Bring the live session experience to mobile with on-device audio processing

---

## Built With

`gemini-3-flash` · `gemini-3-pro` · `gemini-native-audio` · `next.js` · `react` · `typescript` · `tailwind-css` · `firebase` · `zustand` · `framer-motion` · `zod` · `shadcn-ui` · `google-apis` · `notion-api`

---

## Gemini 3 Feature Usage (~200 words)

Lumina is built entirely on the Gemini 3 API with a strategic tri-model architecture. **Gemini 3 Flash** powers all fast-path operations: generating adaptive psychometric quiz questions that respond to prior answers, scoring freetext responses across multiple dimensions simultaneously, and analyzing connected data sources (Gmail, Drive, Notion, ChatGPT exports) to extract communication patterns, skill demonstrations, and hidden interests.

**Gemini 3 Pro** handles deep synthesis — generating comprehensive talent reports that correlate evidence across quiz scores, behavioral observations, data insights, and session transcripts. Every career recommendation must cite specific evidence (quiz question IDs, session timestamps, data excerpts) with confidence scores, requiring Pro's superior reasoning capabilities.

**Gemini's Native Audio model** powers the live multimodal session — a real-time video + voice coaching conversation streamed over WebSocket. The model conducts a structured 9-phase career exploration while autonomously using 5 tool declarations (saveInsight, fetchUserProfile, saveSignal, startQuizModule, scheduleNextStep) to dynamically save behavioral observations, personalize based on user history, capture talent signals, suggest assessments for detected gaps, and record action items — all during live conversation without interrupting flow.

Gemini 3 is not a feature we added — it is the core intelligence layer that makes multimodal talent discovery possible.

---
