# Devpost Submission — Lumina

> **Tagline:** An autonomous career intelligence agent that orchestrates multi-source analysis, adaptive assessment, live multimodal coaching, and self-correcting synthesis to discover your strongest career direction.

---

## Inspiration

Career guidance today is broken. Generic assessments produce vague results. School counselors have 15 minutes per student. Career coaches cost hundreds per hour. Meanwhile, people have years of digital footprints — emails, documents, conversations, projects — that reveal more about their strengths than any single test ever could.

We asked: what if an autonomous AI agent could gather evidence from everything you've already created, identify gaps in its own understanding, adaptively probe the dimensions where it's least confident, hold a face-to-face conversation to observe what no written test can capture, and then critique and refine its own conclusions before presenting them?

That's Lumina. Not a linear tool. An autonomous intelligence agent that drives its own assessment loop, knows what it doesn't know, and self-corrects until it reaches high-confidence career recommendations.

---

## What it does

Lumina is an **agent orchestrator** that autonomously manages a multi-stage career intelligence pipeline. At its core, an orchestrator evaluates the current state of evidence, computes per-dimension confidence scores, identifies gaps, and decides the next best action — without waiting for the user to navigate a menu.

**Stage 1: Multi-Source Evidence Gathering** — The agent ingests data from Gmail, Google Drive, Notion, ChatGPT exports, and file uploads. Gemini 3 Flash extracts behavioral signals: communication patterns, recurring interests, skill demonstrations, and vocabulary analysis. The orchestrator computes initial confidence across 31 psychometric dimensions and identifies which dimensions lack evidence.

**Stage 2: Adaptive Assessment with Autonomous Module Selection** — Rather than running a fixed assessment, the agent recommends which assessment module to complete next based on where confidence is lowest. Five modules (Interests, Work Values, Strengths & Skills, Learning Environment, Practical Constraints) can be completed in any order — the agent prioritizes the one that will produce the largest confidence gain. Questions adapt in real time based on prior answers and data insights. The agent gates progression: if confidence is too low, it recommends additional modules before moving forward. Users can override, but the agent makes the recommendation.

**Stage 3: Live Multimodal Coaching with Behavioral Timeline** — A real-time video + voice conversation powered by Gemini's native audio model. During the session, the agent autonomously saves insights, fetches user profiles for personalization, captures talent signals, suggests additional assessment modules for detected gaps, and schedules next steps — all through live tool calling. A behavioral timeline tracks engagement, hesitation, confidence, clarity, and collaboration patterns over time, computing trends and cross-dimension correlations rather than single-point snapshots.

**Stage 4: Self-Correcting Report Synthesis** — This is where Lumina fundamentally differs from single-shot generation. The report agent executes a five-step loop:
1. **Generate Draft** — Gemini 3 Pro synthesizes all evidence into a comprehensive report
2. **Self-Critique** — Gemini 3 Flash scores every section for evidence quality, identifying weak areas
3. **Identify Refinement Targets** — Sections below the evidence quality threshold are flagged
4. **Targeted Refinement** — Gemini 3 Pro re-generates only the weak sections with explicit instructions to strengthen evidence chains
5. **Final Validation** — A consistency check ensures the refined report is coherent

Every step is traced. Users see a "How I Built This Report" visualization showing exactly what was critiqued, what was improved, and how confidence changed at each step. Career recommendations include confidence-gated badges — high confidence (strong evidence), moderate (more data recommended), or low (needs more evidence) — with actionable tips for improvement.

After the initial report, users enter a **growth loop** — completing micro-challenges, journaling reflections analyzed for sentiment, and tracking profile evolution through snapshots over time.

---

## How we built it

**Agent Orchestrator Architecture** — At the center of Lumina is an orchestrator (`src/lib/agent/orchestrator.ts`) that evaluates the current state of all evidence, computes per-dimension confidence using source diversity multipliers, identifies knowledge gaps, and produces a ranked list of recommended actions. The orchestrator recommends but never auto-executes — maintaining human-in-the-loop control while driving autonomous decision-making.

**Confidence-Gated Decision Making** — Every stage transition is gated by confidence thresholds. A confidence scoring engine (`src/lib/agent/confidence.ts`) tracks 31 dimensions across all data sources, computing weighted scores based on evidence freshness, source diversity, and cross-validation. The agent recommends when to proceed and when to gather more data. Users see real-time confidence dashboards and can override gates, but the agent's reasoning is always visible.

**Self-Correcting Report Generation** — The report agent (`src/lib/agent/report-agent.ts`) implements a generate → critique → refine → validate loop. Each step produces a trace entry with confidence changes and timing. The thought chain visualization on the report page shows judges exactly how the agent improved its own output — proving this is not a single-call wrapper.

**Cross-Stage Evidence Correlation** — A dedicated correlator agent (`src/lib/agent/correlator.ts`) finds convergent patterns, divergent signals, and hidden talents by analyzing evidence across all three stages (data analysis, assessment, live session). This produces insights that no single stage could generate alone.

**Tri-Model Routing** — Tasks are routed across three Gemini models based on complexity:
- **Gemini 3 Flash** — fast operations: assessment generation, scoring, data analysis, critique
- **Gemini 3 Pro** — deep synthesis: report generation, targeted refinement, evidence correlation
- **Gemini 2.5 Flash Native Audio** — live multimodal sessions with autonomous tool calling

**Agent Decision Log** — Every autonomous action is logged with: what was decided, why, confidence before and after, and the data that informed the decision. This log is visible in a persistent side panel across all assessment pages, giving users (and judges) full transparency into the agent's reasoning.

**Stack** — Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind v4, shadcn/ui, Framer Motion, Firebase (Auth + Firestore), Zustand, React Query v5, Zod for end-to-end schema validation of every AI output.

**Security** — Live sessions use server-minted ephemeral tokens. Three consent gates (age 16+, video consent, behavioral inference consent) must be cleared before sessions begin.

---

## Challenges we ran into

- **Making the agent genuinely autonomous without being opaque** — The orchestrator needs to drive decisions independently, but users must understand and trust those decisions. We solved this with the agent decision log — every action is transparent, every recommendation shows its reasoning, and users can always override.

- **Self-correction without infinite loops** — The report critique → refine loop could theoretically run forever. We implemented a fixed 5-step pipeline with an evidence quality threshold (60%) that determines which sections need refinement, ensuring bounded execution with meaningful improvement.

- **Cross-stage evidence correlation** — Finding patterns that span data analysis, assessment responses, and live session observations required careful evidence structuring. The correlator agent uses Gemini 3 Pro to identify convergent patterns, divergent signals, and hidden talents that no single source reveals.

- **Confidence scoring across heterogeneous sources** — Computing meaningful confidence from quiz scores, behavioral observations, data analysis signals, and session insights required source diversity multipliers and freshness weighting — not just raw averaging.

- **Behavioral timeline vs. snapshots** — Instead of single-point behavioral observations, we built temporal tracking that computes trends (increasing/decreasing/stable) and cross-dimension correlations during live sessions, revealing patterns that snapshots miss entirely.

---

## Accomplishments that we're proud of

- **The self-correcting report loop is visible** — Users see exactly how the agent critiqued and improved its own output. The thought chain visualization proves the system does real multi-step reasoning, not single-shot generation.

- **Confidence gates create genuine autonomy** — The agent doesn't just process stages in order. It evaluates what it knows, identifies what it doesn't, recommends what to do next, and gates progression based on evidence quality. This is an agent making decisions, not a pipeline executing steps.

- **Every recommendation cites specific evidence** — Career matches, strengths, and action items cite quiz question IDs, session timestamps, and data source excerpts with confidence scores. Confidence-gated badges tell users exactly how much to trust each recommendation.

- **The agent decision log shows all reasoning** — A persistent panel shows every autonomous decision the agent has made: what action, why, and how confidence changed. Full transparency into the agent's thought process.

- **True multimodal fusion with behavioral trends** — Written data analysis, psychometric scoring, live behavioral observation with temporal trend analysis, and conversational insights are fused into a single coherent talent profile through cross-stage evidence correlation.

---

## What we learned

- Gemini 3's structured output capabilities combined with multi-step agent loops produce dramatically better results than single-shot generation. The self-critique step alone catches evidence gaps that would otherwise produce unfounded recommendations.

- Confidence scoring changes everything about how an agent system behaves. When the system knows what it doesn't know, it can make genuinely intelligent decisions about what to do next — turning a linear pipeline into an adaptive intelligence loop.

- Career science (RIASEC, O*NET clusters) combined with agentic AI produces better results than either alone. The psychometric framework grounds the agent's recommendations in validated career research, while the agent's multi-source analysis reveals patterns that no fixed assessment can capture.

- Showing the agent's reasoning builds trust. When users can see the decision log and thought chain, they engage more deeply and provide better feedback — creating a virtuous cycle of improving recommendations.

---

## What's next for Lumina

- **Multi-agent specialization** — Dedicated sub-agents for different career domains (tech, creative, healthcare) with domain-specific evidence evaluation
- **Longitudinal confidence tracking** — The agent monitors confidence evolution over weeks and months, proactively suggesting new evidence gathering when confidence decays
- **Team talent mapping** — An orchestrator that maps complementary strengths across team members
- **More data integrations** — LinkedIn, GitHub, Spotify listening patterns, and calendar analysis
- **Mentor matching** — Connect users with professionals in their recommended career paths based on evidence-grounded compatibility

---

## Built With

`gemini-3-flash` · `gemini-3-pro` · `gemini-native-audio` · `next.js` · `react` · `typescript` · `tailwind-css` · `firebase` · `zustand` · `framer-motion` · `zod` · `shadcn-ui` · `google-apis` · `notion-api`

---

## Gemini 3 Feature Usage (~200 words)

Lumina is an autonomous agent system built entirely on the Gemini 3 API with strategic multi-model routing. The agent orchestrator evaluates state and routes tasks based on complexity.

**Gemini 3 Flash** powers all fast-path agent operations: generating adaptive assessment questions that respond to confidence gaps, scoring freetext responses across 31 psychometric dimensions, analyzing connected data sources to extract behavioral signals, and running the self-critique step of the report generation loop — evaluating every section for evidence quality and identifying refinement targets.

**Gemini 3 Pro** handles deep synthesis requiring complex multi-source reasoning: generating comprehensive talent reports that correlate evidence across assessment scores, behavioral observations, and data insights; performing targeted refinement of weak report sections with explicit evidence-strengthening instructions; and running cross-stage evidence correlation to discover convergent patterns, divergent signals, and hidden talents across all data sources.

**Gemini's Native Audio model** powers the live multimodal coaching session — a real-time video + voice conversation streamed over WebSocket. The model conducts structured career exploration while autonomously using 5 tool declarations (saveInsight, fetchUserProfile, saveSignal, startQuizModule, scheduleNextStep) to dynamically save behavioral observations, personalize based on evidence history, capture talent signals, trigger additional assessments for detected confidence gaps, and record action items — all during live conversation.

Gemini 3 is not a feature we added — it is the autonomous intelligence layer that drives every decision Lumina makes.

---
