# Relationship Leaderboard

An internal relationship-intelligence operating system for Ebb and Flow Media.
Not a CRM template, not a cold-email tool, but a single, explainable,
compounding record of every real relationship the company has, ranked by a
deterministic scoring engine, with a rule-based next-best-action layer
surfaced daily. This is a private, internal tool: no public marketing
surface, no multi-tenant or SaaS features, and no sign-up flow. It is meant
to be run by one team, for one team.

## Running it

Run `npm install` then `npm run dev`. The app is fully functional with zero
configuration: all data lives in your browser's localStorage, seeded on
first load with realistic but clearly fictional demo data. Nothing calls a
real external API by default. Use `npm run lint` for ESLint, `npm run
typecheck` for tsc in no-emit mode, `npm run test` for Vitest, and `npm run
build` for a production build via tsc and vite build.

## Architecture

This is a React, TypeScript, and Vite app with Tailwind CSS, react-router-dom
for routing, react-hook-form and zod for the Add Relationship form, and
lucide-react for icons. `src/types.ts` defines all 17 domain models: Company,
Contact, Relationship, RelationshipMemory, CompanyIntelligence, Activity,
Task, Production, RelationshipProductionMatch, RelationshipAsset,
ScoreFactor, ScoreSnapshot, Recommendation, IntegrationEvent, Message,
DailyProgress, and UserSettings.

`src/lib/storage.ts` is the only module that touches localStorage. It is
versioned via SCHEMA_VERSION, with export, import, and reset built in; read
it first if you are extending the data model. `src/lib/seed-data.ts` is the
only module that manufactures demo content. All companies and contacts are
invented, and two entries (Meridian and Vine Mascot Works, Loop City FC) are
deliberately whimsical to make that obvious at a glance.

`src/lib/scoring.ts` is the deterministic scoring engine, producing a 0-100
capped score plus a separate daily priority score. Every point value is an
explicit constant with an inline explanation string, so any score is always
explainable in the UI via the Score Breakdown panel on a relationship's
detail page. `src/lib/recommendations.ts` is the Next-Best-Action rule
engine: each rule is a plain function with a readable condition, so this is
a rule engine and not an LLM, and every recommendation traces back to a
specific rule.

`src/lib/ai-service.ts` and `src/lib/instantly-service.ts` follow an adapter
pattern. The wired-up default in both cases is a mock implementation that is
deterministic and offline, and is clearly labeled Simulated AI or Mock
Instantly in the UI. Each file's header comment documents exactly what a
real integration would require, including where a server-side proxy route
would need to live so a real API key is never shipped to the browser.
`src/lib/selectors.ts` derives live computed fields such as score, momentum,
priority, and recommendations from raw records, so every page sees the same
numbers.

## Routes

The root path redirects to /dashboard, the Daily Brief with top recommended
actions and streak and progress tracking. /leaderboard is the full ranked
relationship table with filters. /relationships/new is the Add Relationship
flow with duplicate detection. /relationships/:id is the relationship detail
page with score breakdown, human context, activity timeline, tasks,
production matches, and assets. /relationships/:id/interview is the AI
Context Interview. /inbox is the synced message thread view. /tasks lists
every task, whether relationship-linked or standalone. /productions shows
the eight seeded productions along with matched relationships. /settings
covers profile, appearance, gamification, integrations, and data management.

## What is live versus simulated

Everything in this app runs locally and works today with no external
services. Simulated below means the UI is explicit that a real integration
isn't wired up, not that the feature is broken or fake-looking.

Live and fully functional: all CRUD on companies, contacts, and
relationships; the scoring engine; the momentum engine; the recommendation
engine; duplicate detection; local persistence with export, import, and
reset; command palette search; task management; activity logging; and the
AI Context Interview flow, where the UI and storage are real and only the
extraction step uses the mock AI adapter.

Simulated by design: MockAIService, labeled Simulated AI everywhere it
appears; MockInstantlyService, labeled Mock Instantly; and the company
intelligence blurbs in the seed data.

Documented but not wired up: OpenAIService and a real InstantlyService both
throw on use and point to the header comment explaining the server-side
proxy pattern required before enabling them for real.

## Testing

`src/lib/scoring.test.ts` and `src/lib/utils.test.ts` cover the scoring
engine's boundary behavior, including capping, recency, priority
overdue-weighting, and momentum decay, along with duplicate-detection logic,
run via Vitest and jsdom.

## Environment

See `.env.example`. The app runs with it entirely absent, since every value
defaults to the mock and local adapter.

## Known limitations and next steps

First, the Next-Best-Action engine implements the highest-signal subset of
rules rather than an exhaustive rule-for-every-scenario set; extending
`src/lib/recommendations.ts` with more rule entries is the natural next step
as real usage surfaces new patterns. Second, OpenAIService and a real
InstantlyService are documented stubs only, and a small serverless proxy
route is required before either can hold a real key. Third, there is no
multi-user support or server-side database by design, since this is a
single-operator internal tool; if that ever changes, `src/lib/storage.ts` is
the one module that would need to move from localStorage to a real backend,
since everything else already reads through it.
