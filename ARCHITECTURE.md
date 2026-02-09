# Lumina — Agent Architecture

```
                              ┌─────────────────────────────────────────┐
                              │         AGENT ORCHESTRATOR              │
                              │    src/lib/agent/orchestrator.ts        │
                              │                                         │
                              │  ┌───────────────────────────────────┐  │
                              │  │  evaluateState()                  │  │
                              │  │  • Compute per-dimension conf.    │  │
                              │  │  • Identify knowledge gaps        │  │
                              │  │  • Rank recommended actions       │  │
                              │  │  • Gate stage transitions         │  │
                              │  └───────────────────────────────────┘  │
                              └──────┬──────┬──────┬──────┬─────────────┘
                                     │      │      │      │
                    ┌────────────────┘      │      │      └────────────────┐
                    │                       │      │                       │
                    ▼                       ▼      ▼                       ▼
   ┌────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────┐
   │  STAGE 1: DATA INGEST  │  │  STAGE 2: ASSESSMENT     │  │  STAGE 3: LIVE SESSION │
   │                        │  │                          │  │                        │
   │  Gmail, Drive, Notion, │  │  5 Adaptive Modules      │  │  Video + Voice         │
   │  ChatGPT, File Upload  │  │  Agent selects next      │  │  Autonomous Tool Use   │
   │                        │  │  module by lowest conf.  │  │                        │
   │  ┌──────────────────┐  │  │  ┌────────────────────┐  │  │  ┌──────────────────┐  │
   │  │ Gemini 3 Flash   │  │  │  │ Gemini 3 Flash     │  │  │  │ Gemini Native    │  │
   │  │ Extract signals  │  │  │  │ Generate & Score   │  │  │  │ Audio (Live)     │  │
   │  └──────────────────┘  │  │  └────────────────────┘  │  │  └──────────────────┘  │
   └───────────┬────────────┘  └────────────┬─────────────┘  └───────────┬────────────┘
               │                            │                            │
               │                            │                            │
               ▼                            ▼                            ▼
   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │                        CONFIDENCE ENGINE                                        │
   │                   src/lib/agent/confidence.ts                                   │
   │                                                                                 │
   │  31 Dimensions  ×  Source Diversity Multipliers  ×  Freshness Weighting         │
   │                                                                                 │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
   │  │ RIASEC  │  │  Work   │  │  Skill  │  │Learning │  │Behavior │              │
   │  │6 dims   │  │ Values  │  │ Conf.   │  │  Env.   │  │  Obs.   │              │
   │  │         │  │ 6 dims  │  │ 3 dims  │  │ 3 dims  │  │ 5 dims  │              │
   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘              │
   └────────────────────────────────────┬────────────────────────────────────────────┘
                                        │
                      ┌─────────────────┤
                      │                 │
                      ▼                 ▼
   ┌──────────────────────┐  ┌──────────────────────────────────────────────────────┐
   │  CONFIDENCE GATES    │  │  STAGE 4: REPORT AGENT (Self-Correcting Loop)       │
   │                      │  │  src/lib/agent/report-agent.ts                      │
   │  threshold met?      │  │                                                      │
   │  ┌──┐    ┌──┐       │  │  ┌──────────┐    ┌──────────┐    ┌──────────────┐   │
   │  │≥T│───▶│GO│       │  │  │ 1. DRAFT ├───▶│2. CRITIC ├───▶│3. FIND WEAK  │   │
   │  └──┘    └──┘       │  │  │Gen. 3 Pro│    │Gen. 3 Fla│    │  SECTIONS    │   │
   │  ┌──┐    ┌───────┐  │  │  └──────────┘    └──────────┘    └──────┬───────┘   │
   │  │<T│───▶│SUGGEST│  │  │                                          │           │
   │  └──┘    │ MORE  │  │  │  ┌──────────┐    ┌──────────────────┐   │           │
   │          │ DATA  │  │  │  │5. VALIDAT│◀───│ 4. REFINE WEAK   │◀──┘           │
   │          └───────┘  │  │  │Gen. 3 Fla│    │   Gen. 3 Pro     │               │
   │  (user can override)│  │  └──────────┘    └──────────────────┘               │
   └──────────────────────┘  └──────────────────────────────────────────────────────┘
                                        │
                                        ▼
                ┌───────────────────────────────────────────────────┐
                │          CROSS-STAGE EVIDENCE CORRELATOR          │
                │         src/lib/agent/correlator.ts               │
                │                                                   │
                │  ┌─────────────┐ ┌────────────┐ ┌─────────────┐ │
                │  │ Convergent  │ │ Divergent  │ │   Hidden    │ │
                │  │  Patterns   │ │  Signals   │ │  Talents    │ │
                │  └─────────────┘ └────────────┘ └─────────────┘ │
                │                Gemini 3 Pro                      │
                └───────────────────────┬───────────────────────────┘
                                        │
                                        ▼
                ┌───────────────────────────────────────────────────┐
                │              TALENT REPORT OUTPUT                 │
                │                                                   │
                │  Headline · Radar Chart · Strengths · Careers    │
                │  Hidden Talents · Action Plan · Confidence Notes │
                │                                                   │
                │  + Thought Chain Visualization (all 5 steps)     │
                │  + Confidence-Gated Career Badges                │
                │  + Evidence Citations (quiz IDs, timestamps)     │
                └───────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                       AGENT DECISION LOG                                    │
    │                     src/stores/agent-store.ts                               │
    │                                                                             │
    │  Every autonomous action logged:                                            │
    │  { action, reason, confidenceBefore, confidenceAfter, timestamp, data }    │
    │                                                                             │
    │  Visible in persistent side panel across all assessment pages               │
    │  Includes confidence dashboard + decision timeline                          │
    └─────────────────────────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        GEMINI MODEL ROUTING                                 │
    │                                                                             │
    │   ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────────┐    │
    │   │ Gemini 3 Flash  │  │ Gemini 3 Pro    │  │ Gemini Native Audio    │    │
    │   │                 │  │                 │  │                        │    │
    │   │ • Quiz gen      │  │ • Report draft  │  │ • Live video+voice    │    │
    │   │ • Quiz score    │  │ • Refinement    │  │ • Autonomous tools    │    │
    │   │ • Data analysis │  │ • Correlation   │  │ • Real-time coaching  │    │
    │   │ • Self-critique │  │ • Deep synth.   │  │ • Behavioral observe  │    │
    │   │ • Validation    │  │                 │  │                        │    │
    │   └─────────────────┘  └─────────────────┘  └────────────────────────┘    │
    │                                                                             │
    │   Fast tasks ─────────▶ Deep reasoning ────▶ Live multimodal               │
    └─────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Principles

1. **Loops, not lines** — The report agent self-corrects. The orchestrator re-evaluates after every stage. Nothing is single-shot.
2. **Confidence gates** — Stage transitions are gated by evidence quality. The agent recommends when to proceed.
3. **Human-in-the-loop** — The orchestrator recommends but never auto-executes. Users can override gates.
4. **Full transparency** — Every agent decision is logged and visible. The thought chain shows the report's construction.
5. **Multi-model routing** — Tasks are routed to the right model based on complexity, not just API availability.
