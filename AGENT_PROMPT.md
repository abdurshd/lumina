You are working on the Lumina project. Your job is to implement the next available task from the implementation plan.

## Step 1: Read coordination files

Read these files in order. They contain ALL context you need:

1. `CLAUDE.md` — Project rules, engineering constraints, model policy, quality bar
2. `agents.md` — Your coordination protocol, tech stack, key files, full project context for agents with no prior knowledge
3. `plan.md` — The master implementation plan with all tasks, statuses, locks, dependencies, and detailed descriptions

Do NOT skip reading these files. Do NOT assume you know what the project does. Read them first.

## Step 2: Find the next available task

Scan `plan.md` for the first task that meets ALL of these criteria:

1. **Status is `[ ]`** (pending — not started)
2. **Lock is `UNLOCKED`**
3. **All tasks listed in `DEPENDS ON` have status `[x]`** (completed)

If multiple tasks qualify, pick the one with the highest priority in this order: `CRITICAL` > `HIGH` > `MEDIUM` > `LOW`. If priorities are equal, pick the lowest task number (e.g., 1.2 before 2.1).

If NO tasks are available (all are done, locked, or blocked), report this and stop.

## Step 3: Claim the task

Edit `plan.md`:

- Change the task's `STATUS: [ ]` to `STATUS: [~]`
- Change `LOCK: UNLOCKED` to `LOCK: <your-agent-name> | <current-date> <current-time>`

Edit `agents.md`:

- Add yourself to the Active Agents table with the task ID and current timestamp

## Step 4: Implement the task

Follow the task description in `plan.md` EXACTLY. Each task specifies:

- **What** to build
- **Why** we're building it (hackathon context)
- **Implementation** details (specific logic, functions, patterns)
- **Files to create** and **Files to modify**
- **Acceptance criteria** that must ALL be met

### Implementation rules (from CLAUDE.md and agents.md):

- TypeScript strict mode, no `any` types
- Use `@google/genai` SDK only for all Gemini calls
- Never expose `GEMINI_API_KEY` to browser/client code
- All API routes must call `verifyAuth(req)` for protected data
- All structured Gemini outputs must be validated with Zod schemas
- All system prompts go in `src/lib/gemini/prompts.ts` (single source of truth)
- All new agent logic goes in `src/lib/agent/`
- All new agent API routes go in `src/app/api/agent/`
- All new agent UI components go in `src/components/agent/`
- shadcn/ui components only, Tailwind v4 only
- All hooks prefixed with `use-`
- Gemini models must use constants from `src/lib/gemini/models.ts`:
  - `GEMINI_MODELS.FAST` = `gemini-3-flash-preview`
  - `GEMINI_MODELS.DEEP` = `gemini-3-pro-preview`
  - `GEMINI_MODELS.LIVE` = `gemini-2.5-flash-native-audio-preview-12-2025`
- Every agent action MUST log to the agent decision store with: action, reason, confidence before/after

### When adding types:

- Add to `src/types/index.ts`
- Export everything from that file
- If modifying shared types, check git status first for conflicts

### When adding API routes:

- Follow the pattern: `verifyAuth(req)` → Zod parse request → call Gemini → `safeParseJson()` → Zod validate response → return typed response
- Use `getGeminiClientForUser()` from `src/lib/gemini/client.ts`
- Import helpers from `src/lib/api-helpers.ts`

### When adding UI components:

- Use shadcn/ui primitives (Card, Button, Badge, etc.)
- Use Framer Motion for animations
- Must be mobile responsive
- Dark theme by default (neutral dark gray, green primary)
- Use `.glass` utility class for card backgrounds

### When adding Zustand stores:

- Follow the pattern in `src/stores/assessment-store.ts`
- Use `create<StateType>((set) => ({...}))` pattern
- Export a `use___Store` hook

## Step 5: Verify your work

After implementation, verify ALL acceptance criteria from the task description are met. Then run:

```bash
npm run lint    # Must pass with no new errors
npm run build   # Must pass
```

If lint or build fails, fix the issues before marking the task as done.

## Step 6: Mark the task as done

Edit `plan.md`:

- Change the task's `STATUS: [~]` to `STATUS: [x]`
- Change the LOCK back to `LOCK: UNLOCKED`

Edit `agents.md`:

- Remove yourself from the Active Agents table

## Step 7: Check for newly unblocked tasks

After completing your task, scan `plan.md` again. Your completion may have unblocked other tasks (tasks that had yours in their `DEPENDS ON` list). If there is another available task and you have capacity, go back to Step 2 and continue with the next task.

## Important: What NOT to do

- Do NOT skip reading `plan.md`, `agents.md`, and `CLAUDE.md`
- Do NOT work on a task whose dependencies are not completed
- Do NOT work on a task that is locked by another agent
- Do NOT generate reports in a single prompt call (the whole point is multi-step agent loops)
- Do NOT make things look like a generic chatbot or personality quiz
- Do NOT add test files, test variables, or console.logs — delete them after testing
- Do NOT include Claude/AI attribution in commits
- Do NOT modify files outside the scope of your current task unless the task description explicitly lists them
- Do NOT re-implement something that already exists — read existing code first

## Commit convention

When committing your work:

- Short commit message, prefixed with task ID: `[1.2] add confidence scoring system`
- No AI attribution in commits
- Only commit files related to your task
