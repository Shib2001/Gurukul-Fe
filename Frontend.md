# Gurukul Frontend Guide

## 1. Purpose and scope

This document is the implementation guide for the separate
`gurukul-frontend` repository. It describes how to build, test, optimize, and
deploy the Gurukul web application with **Next.js**.

This document is a guide only. It intentionally does not create frontend
source code in the documentation workspace.

The frontend is responsible for:

- Student, administrator, and content-manager user interfaces
- Accessible and responsive presentation
- Route navigation and layouts
- Form state and client-side validation
- Calling the public FastAPI backend
- Rendering AI chat and voice experiences
- Rendering quiz, progress, and leaderboard experiences
- Optimistic UI where safe
- WebSocket connection lifecycle and reconnection
- Browser analytics and error reporting without leaking private data

The frontend is not responsible for:

- Authentication authority
- Authorization decisions
- Quiz scoring or ranking calculations
- Direct PostgreSQL, Redis, vector database, or object-storage access
- OpenRouter or model-provider calls
- Prompt construction
- Durable conversation or progress storage

The browser communicates with the backend only. The backend communicates with
the separate AI service.

```text
Next.js frontend
        |
        | HTTPS / WebSocket
        v
FastAPI backend
        |
        | authenticated internal contract
        v
AI service
```

---

## 2. Product and UX principles

Gurukul should feel like a school with clear learning paths, not a collection
of disconnected AI tools.

### 2.1 Core user experiences

- Registration and secure login
- Student onboarding and learning preferences
- Subject and teacher selection
- Text conversation with subject teachers
- Voice lesson sessions
- Weekly quizzes and feedback
- Weekly ranking and progress history
- Notifications and learning reminders
- Account, consent, privacy, and accessibility settings
- Administrative catalog, content, quiz, and teacher management

### 2.2 Frontend principles

1. **Reuse first.** Build components and feature primitives once and compose
   them across subjects.
2. **Server authority.** Display backend results; never calculate official
   score, rank, entitlement, or permission locally.
3. **Progressive enhancement.** The app should remain useful if streaming,
   voice, or optional browser features are unavailable.
4. **Accessible by default.** Keyboard navigation, screen readers, contrast,
   reduced motion, focus management, and readable typography are required.
5. **Explicit states.** Every async feature needs loading, empty, success,
   partial, reconnecting, and failure states.
6. **Small client bundles.** Use server rendering by default and add client
   components only where interaction requires them.
7. **Safe boundaries.** No provider credentials or internal AI policies in
   browser code.
8. **Contract-driven.** Generate or validate TypeScript API types from a
   pinned backend OpenAPI contract.
9. **Mobile-aware.** Students may use low-bandwidth mobile devices and voice
   input; avoid assuming a large screen or stable connection.
10. **Distinctive visual identity.** Do not default to a generic AI/SaaS
    template, indigo gradients, or repeated icon-and-card layouts. Establish
    Gurukul's own palette, typography, imagery, and page composition before
    building screens.
11. **Motion with purpose.** Use animation to clarify interaction and add
    character, not as decoration on every element. Respect reduced-motion
    preferences and keep core interactions usable without animation.

---

## 3. Recommended technology stack

Use the current stable Next.js release compatible with the selected React and
TypeScript versions. Pin versions in the lockfile and upgrade intentionally.

### 3.1 Core

| Dependency/category | Purpose |
|---|---|
| Next.js | Routing, server rendering, bundling, metadata, deployment |
| React | UI composition |
| TypeScript | Type safety |
| `zod` | Runtime validation for forms, query data, and environment values |
| `next-safe-action` or equivalent | Optional typed server-action boundary where appropriate |

### 3.2 UI and styling

Use shadcn/ui as the accessible, editable component foundation. Use Magic UI
and React Bits selectively for distinctive animated components, and compose
them into Gurukul's own design system rather than adopting a template wholesale.
Tailwind CSS remains the styling and design-token layer.

| Dependency/category | Purpose |
|---|---|
| Tailwind CSS | Utility styling and design tokens |
| shadcn/ui | Accessible component source added to the app and customized locally |
| Magic UI | Optional animated components installed from its shadcn registry |
| React Bits | Optional reusable motion components installed from its registry |
| `class-variance-authority` | Typed component variants |
| `clsx` and `tailwind-merge` | Class composition |
| Lucide React or another selected icon set | Use icons consistently and only where they improve comprehension |
| `next-themes` | Theme preference and dark mode |
| `sonner` or equivalent | Toast notifications |
| `cmdk` | Command/search palette if needed |
| `recharts` or Tremor | Progress and ranking charts |
| `react-markdown` | Safe Markdown rendering for assistant content |
| `rehype-sanitize` | Sanitize rendered Markdown |
| KaTeX/MathJax adapter | Mathematical notation where required |

Use a design-system layer around third-party components. Do not scatter raw
Radix or vendor-specific props throughout feature code. shadcn/ui, Magic UI,
and React Bits components are source code in this project, not a mandate to
use their default colors, layouts, or component styling.

#### Motion and 3D

| Library | Use |
|---|---|
| GSAP (`gsap`, `@gsap/react`) | Carefully scoped timelines, scroll-linked sequences, and complex interaction choreography |
| Auto Animate (`@formkit/auto-animate`) | Small list and layout insert/remove/reorder transitions |
| Magic UI and React Bits | Selected source components for polished effects, hover treatments, and text or background motion |
| Vanta.js with Three.js (`vanta`, `three`) | Optional interactive 3D background for the landing-page hero only |

Use CSS transitions for ordinary hover and focus feedback. Avoid running more
than one animation system on the same element, global fake cursor effects, and
continuous animation that competes with reading or learning. Make neon/glow
hover effects restrained, theme-aware, keyboard-visible, and disabled or
reduced for touch, low-power, and reduced-motion contexts.

Vanta is an enhancement, not the hero's only background: lazy-load it in a
client component, destroy its instance on unmount, and provide a static
brand-colored or image fallback. Keep it limited to one hero effect and test
its cost and behavior on mobile and WebGL-disabled browsers.

#### Install commands (npm)

Run package installation from the frontend project directory:

```powershell
cd .\gurukul-fe
npm install gsap @gsap/react @formkit/auto-animate vanta three
npx shadcn@latest init
```

shadcn/ui, Magic UI, and React Bits add selected component source files to the
project; they are not all installed as one runtime package. Add only the
components the design needs. For example:

```powershell
npx shadcn@latest add button card dialog
npx shadcn@latest add "https://magicui.design/r/magic-card.json"
npx shadcn@latest add @react-bits/SplitText-TS-TW
```

The React Bits registry suffix selects its JavaScript/TypeScript and
CSS/Tailwind variant. Check each component's current instructions for any
additional dependencies, then commit the resulting source and lockfile.

### 3.3 Forms and validation

| Dependency/category | Purpose |
|---|---|
| React Hook Form | Performant reusable form state |
| `@hookform/resolvers` | Zod integration |
| Zod | Shared client-side input validation |

Client validation improves UX, but the backend remains authoritative.

### 3.4 Data fetching and state

Recommended:

| Dependency/category | Purpose |
|---|---|
| TanStack Query | Server-state fetching, caching, mutation, invalidation |
| Zustand | Small client-only UI state such as sidebar, draft, or audio controls |
| `nuqs` | URL query-string state when filtering/sorting belongs in the URL |

Do not duplicate the complete backend database in Zustand. Server data belongs
in TanStack Query or server-rendered props.

### 3.5 Real-time and voice

Use the browser WebSocket API or a small typed wrapper for chat streaming.
Avoid a large socket abstraction until requirements justify it.

Optional:

| Dependency/category | Purpose |
|---|---|
| `usehooks-ts` | Small browser hooks |
| `recordrtc` or MediaRecorder wrapper | Audio capture fallback |
| `wavesurfer.js` | Audio visualization if needed |
| Web Audio API utilities | Volume/meters and playback control |

Prefer native `MediaRecorder` and WebSocket APIs first.

### 3.6 Testing and quality

| Dependency/category | Purpose |
|---|---|
| Vitest | Unit and component tests |
| Testing Library | User-focused component tests |
| Playwright | Browser and end-to-end tests |
| MSW | API and WebSocket mocking where supported |
| ESLint | Linting |
| Prettier | Formatting if selected by project convention |
| `axe-playwright` or `jest-axe` | Accessibility tests |
| Lighthouse CI | Performance regression checks |
| Sentry or equivalent | Production error reporting |

Use one formatting authority and run it in CI.

---

## 4. Repository structure

Recommended `gurukul-frontend` layout:

```text
gurukul-frontend/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   └── pricing/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── subjects/page.tsx
│   │   ├── subjects/[subjectId]/page.tsx
│   │   ├── teachers/[teacherId]/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── chat/[conversationId]/page.tsx
│   │   ├── voice/[conversationId]/page.tsx
│   │   ├── quizzes/page.tsx
│   │   ├── quizzes/[quizId]/page.tsx
│   │   ├── attempts/[attemptId]/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── profile/page.tsx
│   │       ├── privacy/page.tsx
│   │       └── accessibility/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx
│   │   ├── admin/subjects/page.tsx
│   │   ├── admin/teachers/page.tsx
│   │   ├── admin/content/page.tsx
│   │   ├── admin/quizzes/page.tsx
│   │   ├── admin/users/page.tsx
│   │   └── admin/jobs/page.tsx
│   ├── api/
│   │   └── health/route.ts
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   ├── data-display/
│   ├── forms/
│   ├── chat/
│   ├── voice/
│   ├── quiz/
│   ├── progress/
│   └── accessibility/
│
├── features/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── schemas.ts
│   │   ├── types.ts
│   │   └── components/
│   ├── catalog/
│   ├── conversations/
│   ├── voice/
│   ├── quizzes/
│   ├── progress/
│   ├── leaderboards/
│   ├── notifications/
│   ├── profile/
│   └── admin/
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── generated.ts
│   │   ├── errors.ts
│   │   ├── pagination.ts
│   │   └── query-client.ts
│   ├── auth/
│   │   ├── session.ts
│   │   ├── permissions.ts
│   │   └── redirects.ts
│   ├── websocket/
│   │   ├── client.ts
│   │   ├── protocol.ts
│   │   ├── reconnect.ts
│   │   └── validation.ts
│   ├── voice/
│   │   ├── recorder.ts
│   │   ├── player.ts
│   │   └── permissions.ts
│   ├── analytics/
│   ├── telemetry/
│   ├── accessibility/
│   ├── formatting/
│   └── env.ts
│
├── hooks/
│   ├── use-current-user.ts
│   ├── use-media-query.ts
│   ├── use-online-status.ts
│   ├── use-websocket.ts
│   ├── use-voice-recorder.ts
│   └── use-reduced-motion.ts
│
├── providers/
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   ├── auth-provider.tsx
│   └── telemetry-provider.tsx
│
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── prose.css
│
├── public/
│   ├── icons/
│   ├── illustrations/
│   └── manifest/
│
├── tests/
│   ├── unit/
│   ├── components/
│   ├── integration/
│   ├── e2e/
│   ├── accessibility/
│   ├── fixtures/
│   └── mocks/
│
├── scripts/
│   ├── generate-api-types.ts
│   ├── check-api-contract.ts
│   └── check-bundle.ts
│
├── next.config.ts
├── middleware.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env.local.example
├── .eslintrc
├── components.json
├── playwright.config.ts
├── vitest.config.ts
├── README.md
├── CONTRIBUTING.md
└── .github/
    └── workflows/
        ├── ci.yml
        ├── e2e.yml
        ├── build.yml
        └── deploy.yml
```

### 4.1 Directory ownership rules

Use these rules consistently:

```text
app/        route composition, layouts, metadata, loading and error states
components/ generic reusable visual components
features/   business-domain UI, hooks, and API orchestration
lib/        infrastructure adapters and pure utilities
hooks/      small cross-feature browser hooks
providers/  React context providers
styles/     design tokens and global styles
tests/      behavior verification
```

Do not put a feature's API calls in arbitrary route files. Do not put
subject-specific business logic into generic UI components.

---

## 5. Next.js application architecture

### 5.1 App Router

Use the Next.js App Router:

- Server Components by default
- Client Components only for browser interaction
- Route groups for layout separation
- Nested layouts for student and admin shells
- `loading.tsx` for route-level loading UI
- `error.tsx` for recoverable route errors
- `not-found.tsx` for missing resources
- Metadata APIs for public pages

### 5.2 Server and client component boundary

Use Server Components for:

- Public marketing pages
- Catalog pages that do not require live interaction
- Initial authenticated page data when the session can be read securely
- Static explanatory content
- Metadata and SEO

Use Client Components for:

- Chat composer and streamed message display
- WebSocket lifecycle
- Voice recording and playback
- Quiz answer interaction
- Form controls with immediate validation
- Interactive charts and filters
- Theme and preference controls

Avoid adding `"use client"` to an entire page when only one child needs it.

### 5.3 Root layout

`app/layout.tsx` should:

- Set global metadata and language.
- Load the design system and global styles.
- Register theme and query providers.
- Configure global accessibility landmarks.
- Avoid loading heavy client libraries globally.

### 5.4 Route group layouts

#### Marketing layout

Use for public pages with navigation, footer, SEO, and responsive content.

#### Auth layout

Use for login, registration, password reset, and verification. Keep it
visually separate from the authenticated student shell.

#### Student layout

Provide:

- Authenticated navigation
- Subject/teacher access
- Breadcrumbs or route context
- Notification access
- Responsive sidebar or bottom navigation
- Skip links and focus management

The layout may render a session-aware shell, but authorization still belongs
to the backend.

#### Admin layout

Provide stronger visual and navigation separation. Hide admin links from
students for usability, but never treat hidden links as security.

---

## 6. Route map

### 6.1 Public routes

```text
/                         Landing page
/about                    Product explanation
/pricing                  Plans if monetization is enabled
/terms                    Terms
/privacy                  Privacy policy
/accessibility            Accessibility statement
```

Public pages should be statically rendered or cached where possible.

### 6.2 Authentication routes

```text
/login
/register
/forgot-password
/reset-password
/verify-email
```

Forms submit to the backend API. Error messages should use stable backend
error codes mapped to friendly text.

### 6.3 Student routes

```text
/dashboard
/onboarding
/subjects
/subjects/[subjectId]
/teachers/[teacherId]
/chat
/chat/[conversationId]
/voice/[conversationId]
/quizzes
/quizzes/[quizId]
/attempts/[attemptId]
/progress
/leaderboard
/notifications
/settings
/settings/profile
/settings/privacy
/settings/accessibility
```

### 6.4 Admin routes

```text
/admin
/admin/subjects
/admin/teachers
/admin/content
/admin/quizzes
/admin/users
/admin/jobs
```

Admin data should use separate query keys, navigation, and permission
boundaries. Do not preload admin data for student routes.

### 6.5 Dynamic route rules

Dynamic pages must:

- Validate route parameters.
- Show a not-found state for backend 404s.
- Avoid exposing raw backend errors.
- Cancel stale requests when the route changes.
- Preserve query state only where it has a clear UX purpose.

---

## 7. Feature-by-feature design

### 7.1 Authentication and onboarding

#### Components

```text
AuthForm
PasswordField
PasswordStrength
VerificationNotice
SessionExpiredDialog
OnboardingStepper
LearningPreferenceForm
```

#### Flow

1. User submits registration.
2. Frontend performs immediate schema validation.
3. Backend validates again and creates the account.
4. Frontend handles verification or authenticated session response.
5. On first login, redirect to onboarding.
6. Save preferences through the backend.
7. Redirect to dashboard or intended destination.

Never store passwords, refresh tokens, or provider keys in client state.

#### Session behavior

Prefer secure HTTP-only cookies managed by the backend. The frontend should
use a `/auth/me` request to determine the current user rather than decoding
untrusted client data as authorization.

Handle:

- Expired session
- Revoked session
- Suspended account
- Network failure
- Concurrent login
- Redirect after login

### 7.2 Subject and teacher catalog

Reusable components:

```text
SubjectCard
TeacherCard
TeacherAvatar
CapabilityBadge
LevelBadge
CatalogGrid
CatalogFilters
```

Catalog data is safe to cache when public and published. Use stable TanStack
Query keys:

```text
["subjects"]
["subjects", subjectId]
["teachers", { subjectId, level, language }]
```

Do not expose prompt versions, model IDs, provider details, or hidden
capabilities in public catalog responses.

### 7.3 Text chat

Suggested component structure:

```text
ChatPage
  ChatShell
    ConversationHeader
    MessageList
      UserMessage
      AssistantMessage
      CitationList
      MessageStatus
    ChatComposer
    ConnectionStatus
    ChatEmptyState
```

Responsibilities:

- Render persisted messages from the backend.
- Open the WebSocket only for an active conversation.
- Send a typed `message.send` event.
- Render deltas without treating them as final persistence.
- Show reconnection and retry controls.
- Stop and clean up streams when leaving the page.
- Recover from missed events through REST history.

Assistant Markdown must be sanitized. Do not render raw HTML from the model.
Math notation should use a controlled renderer with safe delimiters.

### 7.4 WebSocket implementation

Endpoint:

```text
wss://api.gurukul.com/api/v1/ws/conversations/{conversationId}
```

Local:

```text
ws://localhost:8000/api/v1/ws/conversations/{conversationId}
```

The frontend should use a typed protocol in `lib/websocket/protocol.ts`.

#### Client event envelope

```typescript
type ClientEvent =
  | {
      type: "message.send";
      request_id: string;
      data: {
        content: string;
        client_message_id: string;
        stream: boolean;
      };
    }
  | {
      type: "message.cancel";
      request_id: string;
      data: { run_id: string };
    }
  | { type: "ping"; request_id: string };
```

#### Server event envelope

```typescript
type ServerEvent =
  | { type: "connection.ready"; request_id?: string; data: unknown }
  | { type: "assistant.started"; request_id: string; data: unknown }
  | {
      type: "assistant.delta";
      request_id: string;
      sequence: number;
      data: { text: string };
    }
  | { type: "citation.added"; request_id: string; data: unknown }
  | { type: "assistant.completed"; request_id: string; data: unknown }
  | { type: "assistant.failed"; request_id: string; data: unknown }
  | { type: "assistant.interrupted"; request_id: string; data: unknown }
  | { type: "rate_limit.warning"; request_id?: string; data: unknown }
  | { type: "error"; request_id?: string; data: unknown }
  | { type: "pong"; request_id?: string };
```

The frontend should validate incoming events at runtime with Zod. TypeScript
types alone do not validate network data.

#### WebSocket lifecycle

```text
idle
  -> connecting
  -> connected
  -> streaming
  -> connected
  -> closing
  -> closed
```

Additional states:

```text
reconnecting
authentication_expired
server_unavailable
permanently_failed
```

#### Reconnection

Use exponential backoff with jitter:

```text
attempt 1: short delay
attempt 2: longer delay
attempt 3: longer delay
maximum delay: bounded
```

Do not reconnect forever while the browser is offline. Pause on
`navigator.onLine === false` and resume when connectivity returns.

On reconnect:

1. Reopen the socket.
2. Re-authenticate through the browser session.
3. Fetch message history through REST.
4. Reconcile any pending client message IDs.
5. Avoid resending a message unless the backend confirms it was not accepted.

Sequence numbers help detect missing deltas, but REST history is the
authoritative recovery mechanism.

#### Cleanup

When a chat page unmounts:

- Remove WebSocket listeners.
- Cancel active streams if the UX requires it.
- Close the socket.
- Clear only temporary stream state.
- Preserve final persisted messages in TanStack Query.

### 7.5 Voice

Initial voice architecture:

```text
Browser MediaRecorder
  -> backend-authorized upload
  -> backend voice job
  -> WebSocket status events or polling fallback
  -> AI transcription and response
  -> generated audio reference
  -> browser playback
```

Components:

```text
VoiceSession
VoicePermissionPrompt
RecordButton
RecordingTimer
AudioLevelMeter
TranscriptPreview
VoiceProcessingStatus
AudioPlayer
VoiceErrorState
```

Requirements:

- Request microphone permission only after a user action.
- Explain why the microphone is needed.
- Handle permission denial.
- Enforce browser-side duration and size hints.
- Treat backend limits as authoritative.
- Stop tracks after recording.
- Do not upload audio without a clear user action.
- Provide text-chat fallback.
- Respect reduced motion and accessibility preferences.

Use HTTP upload plus status events initially. Full duplex audio streaming
should be introduced only after the backend and AI services support
interruption, moderation, buffering, and cost controls.

### 7.6 Quizzes

Components:

```text
QuizCard
QuizHeader
QuizQuestion
QuestionNavigator
AnswerInput
QuizTimer
QuizProgress
SubmitAttemptDialog
QuizResult
FeedbackPanel
```

Flow:

1. Fetch quiz metadata without answer keys.
2. Start an attempt through the backend.
3. Keep temporary answers in local component or feature state.
4. Autosave only through an explicit backend contract if supported.
5. Submit answers with an idempotency key.
6. Render server-scored results.
7. Fetch AI feedback separately when available.

Do not calculate official score or correct answers in frontend code. Local
answer validation is only a usability aid.

Handle:

- Expired quiz
- Network interruption
- Duplicate submission
- Browser refresh
- Time limit reached
- Backend scoring delay
- AI feedback unavailable

### 7.7 Progress

Components:

```text
ProgressOverview
SubjectProgressCard
LearningStreak
AchievementList
ProgressChart
RecentActivity
```

Use server-provided aggregates. Charts need accessible text summaries and
should not be the only way to understand progress.

### 7.8 Leaderboard

Components:

```text
LeaderboardHeader
WeeklyCountdown
StudentRankCard
LeaderboardTable
NearbyRanks
RankChangeIndicator
LeaderboardEmptyState
```

Display:

- Week boundaries in the user's locale while retaining UTC internally
- Score and rank from the backend
- Privacy-safe display names
- Tie handling as returned by the backend
- Loading and finalization states

Never infer current rank from a paginated subset.

### 7.9 Notifications

Use REST for notification history and WebSocket events for live updates.
Deduplicate by notification ID. Mark as read through an idempotent backend
mutation.

---

## 8. Backend API integration

### 8.1 API client

`lib/api/client.ts` should provide:

- Base URL resolution
- Credentials/cookie behavior
- Request ID generation
- JSON serialization
- Abort signal support
- Standard error parsing
- Response validation
- Safe retry only for idempotent requests

It should not contain feature-specific business logic.

### 8.2 Generated types

Generate TypeScript types from the backend's pinned OpenAPI artifact:

```text
Backend OpenAPI
  -> generated.ts
  -> feature API wrappers
  -> TanStack Query hooks
```

Do not hand-maintain duplicate request and response types when generation is
available. Use handwritten types for browser-only state and WebSocket event
unions.

### 8.3 Query keys

Centralize query-key factories:

```text
auth.currentUser()
subjects.list(filters)
teachers.list(filters)
conversations.list(filters)
conversations.detail(id)
messages.list(conversationId, cursor)
quizzes.list(filters)
attempts.detail(id)
progress.me()
leaderboards.current()
notifications.list()
```

Keys must include every scope/filter that changes the response.

### 8.4 Error handling

Map stable backend error codes to UI messages:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
RATE_LIMITED
MESSAGE_TOO_LARGE
AI_UNAVAILABLE
QUIZ_NOT_AVAILABLE
ATTEMPT_ALREADY_SUBMITTED
NETWORK_ERROR
UNKNOWN_ERROR
```

Do not display raw exception messages or provider error bodies.

### 8.5 Request cancellation

Use `AbortController` for:

- Route changes
- Search/filter changes
- Cancelled AI requests
- Unmounted data loaders

Do not cancel mutations after the backend may have accepted them unless
idempotency and reconciliation are implemented.

---

## 9. State management

### 9.1 Server state

TanStack Query should own:

- Current user
- Subjects and teachers
- Conversations and messages
- Quiz metadata and attempts
- Progress
- Leaderboards
- Notifications

Configure:

- Stale times according to resource volatility
- Retry by error category
- Query cancellation
- Mutation invalidation
- Offline behavior deliberately

### 9.2 Client-only state

Zustand or local React state may own:

- Sidebar open/closed state
- Theme preference
- Chat draft
- Active stream status
- Voice recorder state
- Temporary quiz answers
- Modal and command palette state

Do not persist sensitive chat drafts or audio state to local storage unless
explicitly required and documented.

### 9.3 URL state

Put shareable/filterable state in the URL:

- Subject filter
- Leaderboard week
- Quiz filter
- Admin table page and search

Validate URL values before using them in API requests.

---

## 10. Design system and component reuse

### 10.1 Design tokens

Define tokens for:

- Brand colors
- Subject colors
- Surface and text colors
- Spacing
- Typography
- Border radii
- Shadows
- Focus rings
- Motion durations
- Breakpoints

Choose a palette and typography with a recognizable Gurukul identity; do not
use indigo or purple as an unexamined default. Tokens must support light and
dark themes and meet contrast requirements.

### 10.2 Primitive components

Build or configure:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
RadioGroup
Switch
Dialog
Drawer
Popover
Tabs
Tooltip
Toast
Card
Badge
Avatar
Skeleton
Progress
Table
Pagination
EmptyState
ErrorState
ConfirmDialog
```

Use shadcn/ui/Radix foundations and keep local wrappers consistent. Customize
the component styling and composition to the product; do not let the default
shadcn dashboard look determine the visual design.

### 10.3 Feature components

Feature components should compose primitives:

```text
TeacherCard = Card + Avatar + Badge + Button
QuizQuestion = Card + RadioGroup/Textarea + Progress
AssistantMessage = prose renderer + CitationList + MessageActions
```

Do not let generic components know about backend route names or domain
permissions.

### 10.4 Motion and interactive effects

- Use GSAP for complex, coordinated timelines and interactions; use its React
  hook or context cleanup so animations are reverted when components unmount.
- Use Auto Animate for straightforward changes to a list or its immediate
  children, not as a general-purpose animation engine.
- Add Magic UI and React Bits components one at a time, review their
  dependencies and accessibility, and adapt their styles to the design tokens.
- Prefer CSS transitions for simple hover, focus, and press feedback.
- Use pointer-following or neon effects only on components where they reinforce
  an interaction. Provide equivalent focus-visible feedback and avoid
  cursor-following effects on touch devices.
- Honor `prefers-reduced-motion`; remove or substantially reduce nonessential
  movement, including Vanta's animation.
- Do not animate streamed chat text token-by-token with heavyweight timelines.
  Keep streaming readable and avoid layout shifts.

### 10.5 Component API standards

Reusable components should:

- Have typed props.
- Support loading, disabled, and error states where relevant.
- Expose accessible labels.
- Avoid hidden network calls unless clearly documented.
- Prefer composition slots over large boolean prop lists.
- Have stories or focused tests for complex behavior.

---

## 11. Accessibility

### 11.1 Required behavior

- Use semantic headings and landmarks.
- Provide a skip-to-content link.
- Maintain visible keyboard focus.
- Use labels for every form control.
- Announce async status changes with live regions.
- Provide keyboard access to chat send/cancel and quiz navigation.
- Avoid color-only status indicators.
- Provide captions/transcripts for voice content.
- Respect `prefers-reduced-motion`.
- Support zoom and small screens.
- Keep error messages associated with fields.

### 11.2 Chat accessibility

- Announce new assistant responses without interrupting every token.
- Provide a “jump to latest” control.
- Keep streamed content readable while it changes.
- Expose citations as navigable elements.
- Ensure Markdown headings and lists have valid semantics.

### 11.3 Voice accessibility

Voice must never be the only input method. Provide:

- Text alternative
- Transcription display
- Keyboard controls
- Clear recording state
- Permission and failure explanation
- Captions for generated speech where appropriate

### 11.4 Testing

Run automated axe checks and keyboard-focused Playwright flows. Automated
checks do not replace manual screen-reader testing.

---

## 12. Performance and optimization

### 12.1 Rendering strategy

Use:

- Static rendering for marketing and stable content.
- Server rendering for session-aware initial pages where practical.
- Client rendering for chat, voice, quizzes, and live dashboards.
- Streaming UI for route loading where it improves perceived performance.

Do not make the entire authenticated shell a client component.

### 12.2 Bundle optimization

- Import heavy charts only on pages that use them.
- Dynamically import audio visualizers and math renderers.
- Dynamically load GSAP and Vanta only on routes/components that use them;
  never initialize a Vanta/WebGL background globally.
- Avoid importing entire utility libraries.
- Use `next/image` for optimized images.
- Use `next/font` or a controlled font strategy.
- Analyze bundles in CI.
- Keep admin-only dependencies out of student routes.
- Lazy-load voice and chart code.

### 12.3 Data optimization

- Cache catalog data.
- Paginate messages and rankings.
- Use cursor pagination for high-volume histories.
- Prefetch the next route only when likely to be used.
- Avoid refetching unchanged data on every navigation.
- Invalidate only affected query keys after mutations.
- Do not poll chat while a WebSocket is healthy.

### 12.4 Chat performance

- Render only a bounded visible message window for long conversations.
- Consider virtualization after measuring message-list size.
- Batch or throttle visual updates for high-frequency deltas.
- Do not update expensive layout state on every token.
- Persist final messages through backend responses, not local stream text.

### 12.5 Core Web Vitals

Monitor:

- Largest Contentful Paint
- Interaction to Next Paint
- Cumulative Layout Shift
- First Contentful Paint
- Total blocking time
- JavaScript transfer size

Set budgets and investigate regressions rather than optimizing blindly.

### 12.6 Low-bandwidth behavior

- Show useful skeletons and progress states.
- Avoid autoplay video or audio.
- Offer text mode when voice is slow.
- Compress images.
- Retry only safe requests.
- Preserve drafts during temporary connectivity loss where privacy allows.
- Make WebSocket reconnection visible but not disruptive.

---

## 13. Environment and configuration

### 13.1 Browser-safe variables

Only variables prefixed for public browser exposure may be included in client
bundles. Example:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.gurukul.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.gurukul.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SENTRY_DSN=
```

Never expose:

- OpenRouter keys
- AI service keys
- Database credentials
- Redis credentials
- Object-storage secret keys
- Backend signing keys

### 13.2 `.env.example`

Document safe placeholders. Do not commit `.env.local` or real credentials.

### 13.3 Runtime versus build-time configuration

Next.js public environment variables are often embedded at build time.
Determine whether each deployment uses build-time or runtime configuration
and avoid promoting an image with the wrong API origin.

Prefer a deployment strategy that makes environment separation explicit.

---

## 14. Security

### 14.1 Authentication

Use the backend's secure session pattern. The browser should not implement
its own authorization authority.

For cookie-based sessions:

- Send credentials only to the intended API origin.
- Use CSRF protection as required by the backend.
- Avoid cross-origin wildcard configuration.
- Handle session expiry centrally.

### 14.2 XSS and content safety

- Sanitize Markdown output.
- Do not use `dangerouslySetInnerHTML` for model output.
- If raw HTML is required, sanitize with a strict allowlist.
- Validate URLs before rendering links.
- Use safe external-link attributes.
- Do not execute code from assistant responses.

### 14.3 Sensitive data

Do not put the following in analytics, URLs, local storage, or error reports:

- Passwords
- Session tokens
- Full student conversations
- Raw voice data
- Provider keys
- Hidden prompts
- Private source documents

Use opaque IDs where an identifier is required.

### 14.4 Browser permissions

Request microphone permission only on explicit action. Stop and release media
tracks after use. Explain permission failures in accessible language.

### 14.5 Security headers

Configure through the hosting layer or Next.js:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Frame-ancestors or equivalent clickjacking protection

The policy must allow only required API, WebSocket, image, font, and telemetry
origins.

### 14.6 Dependency security

- Use lockfiles.
- Run dependency vulnerability scans.
- Review component packages before adoption.
- Keep packages updated on a planned schedule.
- Use secret scanning in CI.

---

## 15. Error, loading, and empty states

Every feature must define:

```text
initial loading
background refetch
empty
partial data
validation error
permission error
not found
rate limited
network offline
server unavailable
retrying
success
```

### 15.1 Route-level errors

Use:

- `loading.tsx` for route loading
- `error.tsx` for recoverable errors
- `not-found.tsx` for missing resources
- Global error boundary for unrecoverable UI failures

### 15.2 Error messages

Messages should explain:

1. What happened.
2. Whether the user's data was saved.
3. What the user can do next.

For example:

```text
Your message could not be completed. It was saved as failed, so you can
retry it without creating a duplicate.
```

Do not claim that a message failed if the backend may have accepted it.
Reconcile through the backend before retrying mutations.

---

## 16. API and WebSocket contracts

### 16.1 Backend API source of truth

The backend publishes a versioned OpenAPI document. Frontend CI should:

1. Download or receive the pinned contract artifact.
2. Generate TypeScript types.
3. Run compatibility checks.
4. Fail on unexpected breaking changes.

The frontend should not silently regenerate types from an arbitrary production
server during a build.

### 16.2 WebSocket protocol

WebSocket events should have:

```text
type
request_id
sequence when applicable
data
```

Validate every incoming message. Ignore or safely report unknown event types;
do not crash the entire chat page.

### 16.3 Version handling

The client should send a supported protocol version during connection or
message negotiation if the backend requires it. The client should show a
controlled update-required state if the server rejects an incompatible
protocol.

---

## 17. Testing strategy

### 17.1 Unit tests

Test:

- Formatters and pure utilities
- Zod schemas
- Permission-aware display helpers
- Query-key factories
- WebSocket protocol parsing
- Reconnection backoff
- Stream event reduction
- Voice state transitions
- Quiz timer and local-answer behavior

### 17.2 Component tests

Use Testing Library to test user behavior:

- Forms show validation errors.
- Buttons expose accessible names.
- Loading and error states render.
- Chat deltas accumulate correctly.
- Terminal events finalize a response.
- Quiz answers are selectable and reviewable.
- Voice permission denial is actionable.

Do not test implementation details such as internal React state names.

### 17.3 API integration tests

Use MSW or a typed mock server to test:

- Authentication success and expiry
- Catalog loading
- Conversation pagination
- Quiz submission
- Error-code mapping
- Cache invalidation
- Retry behavior

### 17.4 WebSocket tests

Cover:

1. Successful connection.
2. Authentication/session failure.
3. `connection.ready`.
4. Multiple assistant deltas.
5. Missing sequence detection.
6. Completed response.
7. Failed response.
8. User cancellation.
9. Reconnect after network loss.
10. REST history reconciliation.
11. Duplicate client message ID.
12. Server protocol version mismatch.

### 17.5 End-to-end tests

Use Playwright for:

- Registration and login
- Onboarding
- Subject and teacher selection
- Chat streaming
- Chat reconnect/recovery
- Voice permission and fallback
- Quiz attempt and result
- Progress dashboard
- Leaderboard view
- Session expiry
- Admin route protection

Run against a staging-like backend with deterministic AI fixtures where
possible. Avoid expensive live model calls in every CI run.

### 17.6 Accessibility tests

Run automated checks on critical pages and manually verify:

- Keyboard-only navigation
- Focus order
- Screen-reader announcements
- Modal focus trapping
- Chat streaming announcements
- Quiz timer announcements
- Voice controls

### 17.7 Visual regression

Use screenshots selectively for:

- Auth pages
- Student shell
- Teacher cards
- Chat states
- Quiz states
- Leaderboard
- Responsive navigation

Do not make every small visual change a brittle snapshot.

### 17.8 Performance tests

Run Lighthouse or equivalent checks for:

- Landing page
- Login
- Dashboard
- Subject catalog
- Chat initial load

Measure bundle size and route-level JavaScript changes in CI.

---

## 18. Local development

### 18.1 Startup

```text
1. Copy .env.example to .env.local.
2. Start the local backend and AI services.
3. Install locked Node dependencies.
4. Initialize shadcn/ui if it has not already been configured, then add only
   the required component sources from shadcn/ui, Magic UI, and React Bits.
5. Generate API types from the pinned backend contract.
6. Start Next.js in development mode.
7. Run unit/component tests.
8. Run Playwright tests against local services.
```

### 18.2 Mock mode

Provide a development mock mode for:

- Authentication
- Catalog
- Chat stream
- Voice processing
- Quiz results
- Leaderboards

Mock mode must be clearly visible and must not be enabled in production.

### 18.3 Browser tools

Use browser developer tools to inspect:

- Network requests
- WebSocket frames
- Cache behavior
- Core Web Vitals
- Accessibility tree
- Media permissions

Do not copy tokens or private conversation content into issue reports.

---

## 19. Deployment architecture

### 19.1 Recommended hosting

The frontend can be deployed as:

1. A managed Next.js platform, or
2. A container running Next.js behind a CDN/load balancer.

Use a managed Next.js platform for the initial release if it satisfies
regional, compliance, WebSocket, and runtime requirements. Use a container
when the team requires consistent networking and deployment across services.

### 19.2 Production topology

```text
Browser
  |
  v
CDN / WAF
  |
  +--> Next.js frontend
  |
  +--> FastAPI backend
          |
          +--> AI service
          +--> PostgreSQL
          +--> Redis
```

The browser's WebSocket connects to the backend domain, not the AI service.

### 19.3 WebSocket hosting requirements

The hosting layer must support:

- WebSocket upgrade
- Long-lived connections
- Idle timeout configuration
- TLS termination
- Correct proxy headers
- Sufficient connection limits
- Graceful deploy draining

If the platform cannot support reliable WebSockets, use an approved SSE or
polling fallback for streaming status rather than silently degrading.

### 19.4 Environments

Use separate:

- Domains
- API origins
- WebSocket origins
- Public environment variables
- Analytics projects
- Error-reporting projects

At minimum:

```text
development: localhost
staging: staging.gurukul.example
production: gurukul.example
```

Do not point a staging frontend to production APIs.

### 19.5 Containerization

The frontend `Dockerfile` should:

1. Use a supported Node base image.
2. Install from the lockfile.
3. Build with environment configuration appropriate to the target.
4. Run as a non-root user.
5. Use standalone output if deploying a container.
6. Avoid development mode.
7. Include no server or provider secrets.

### 19.6 CDN and caching

Cache:

- Public static assets
- Optimized images
- Public marketing pages where safe

Do not publicly cache:

- Authenticated HTML with student data
- Chat pages containing private content
- Quiz attempts
- Progress
- Notifications
- Admin pages

Use cache-control headers that prevent private data from being shared.

### 19.7 CI/CD

Pull request checks:

1. Install from lockfile.
2. Type-check.
3. Lint and format check.
4. Unit and component tests.
5. API contract compatibility.
6. Accessibility checks.
7. Production build.
8. Bundle-size checks.
9. Dependency and secret scans.

Staging:

1. Build immutable artifact using the pinned contract.
2. Deploy to staging.
3. Run Playwright smoke tests.
4. Test login, catalog, chat, WebSocket, quiz, and leaderboard flows.
5. Verify security headers and public environment values.

Production:

1. Promote the exact tested artifact.
2. Confirm API and WebSocket origins.
3. Perform rolling or blue-green deployment.
4. Drain active WebSocket connections gracefully.
5. Run smoke checks.
6. Monitor error rate, WebSocket disconnects, and Core Web Vitals.

---

## 20. WebSocket deployment behavior

Deployments must not abruptly discard active learning sessions without a
recoverable state.

Before shutdown:

1. Stop accepting new connections.
2. Send a server-restart or reconnect event if possible.
3. Allow a short graceful period.
4. Close connections.
5. Let clients reconnect with backoff.
6. Let clients reconcile message history through REST.

The backend must persist final message state independently of the frontend
socket lifetime.

---

## 21. Analytics and observability

### 21.1 Frontend metrics

Track:

- Route load performance
- Core Web Vitals
- API latency by safe route category
- WebSocket connection, reconnect, and terminal failure counts
- Chat time to first token
- Chat completion time
- Voice permission and processing outcomes
- Quiz completion funnel
- Frontend error rate

Do not use raw user messages, full URLs containing sensitive data, or audio
contents as analytics properties.

### 21.2 Error reporting

Capture:

- Route and component errors
- API error code
- WebSocket close code and state
- Browser and app version
- Correlation/request ID

Redact:

- Cookies
- Authorization headers
- Message content
- Audio
- Form passwords
- Private query data

### 21.3 Correlation IDs

Generate or propagate a request ID for API and WebSocket actions:

```text
frontend request
  -> backend request
  -> AI run
  -> persisted result
```

Show a short support reference to users when useful, but do not expose
internal traces.

---

## 22. Security and privacy

### 22.1 Browser boundary

The frontend bundle must contain only public configuration. A browser user can
inspect everything shipped to the client, including JavaScript and
`NEXT_PUBLIC_*` values.

### 22.2 Content rendering

Assistant content is untrusted:

- Sanitize Markdown.
- Restrict links.
- Do not render arbitrary HTML.
- Do not execute code blocks.
- Treat citations as data.
- Avoid leaking private source metadata.

### 22.3 Local storage

Do not store:

- Access or refresh tokens unless the chosen security design explicitly
  requires it and has been reviewed.
- Passwords
- Full chat history
- Raw audio
- Sensitive profile information

If a draft is persisted locally, encrypting browser storage is not a complete
security boundary; make the retention and deletion behavior clear.

### 22.4 CSRF and CORS

Coordinate frontend behavior with backend cookie and CSRF configuration.
Cross-origin credentials require explicit origins, not wildcards.

### 22.5 Privacy controls

Provide UI for:

- Account deletion request
- Conversation deletion where supported
- Audio deletion
- Consent preferences
- Data export
- Privacy-policy access

The backend remains authoritative for execution and status.

---

## 23. Implementation sequence

### Step 1: Project foundation

- Create the Next.js TypeScript repository.
- Add Tailwind and shadcn/ui, define a distinctive Gurukul design system, and
  add only the reusable Magic UI/React Bits components needed by the product.
- Add GSAP and Auto Animate for intentional interaction motion. Add Vanta.js
  and Three.js only if the landing-page hero needs the optional 3D background.
- Configure linting, formatting, testing, and environment validation.
- Add public marketing and error/loading shells.

### Step 2: API contract and authentication

- Pin the backend OpenAPI contract.
- Generate TypeScript types.
- Implement API client and error mapping.
- Implement login, registration, session lookup, logout, and protected
  layouts.

### Step 3: Catalog and student shell

- Implement dashboard, subjects, teachers, onboarding, profile, and
  navigation.
- Add TanStack Query and query-key factories.
- Add loading, empty, error, and accessibility states.

### Step 4: Text chat

- Implement conversation list and detail pages.
- Implement typed WebSocket client.
- Add streaming deltas, terminal events, cancellation, reconnection, and REST
  reconciliation.
- Add sanitized Markdown, citations, and message status.

### Step 5: Quizzes and progress

- Implement quiz list, attempt flow, timer, results, feedback, progress, and
  leaderboard.
- Ensure official scores and ranks come only from the backend.

### Step 6: Voice

- Implement microphone permission, MediaRecorder, upload, processing status,
  transcript, playback, and text fallback.
- Add retention and error messaging.

### Step 7: Admin

- Add admin layout, permissions, subjects, teachers, content, quizzes, users,
  and job views.
- Add explicit mutation confirmations and audit-aware messaging.

### Step 8: Quality and deployment

- Add Playwright critical journeys.
- Add accessibility and performance checks.
- Configure CDN, WebSocket proxying, security headers, error reporting, and
  production deployment.

---

## 24. Definition of done

The frontend is ready for its first production release when:

- It is independently buildable and deployable.
- Backend OpenAPI types and WebSocket contracts are versioned and tested.
- Authentication uses the approved secure backend session pattern.
- No OpenRouter, AI, database, Redis, or storage secret reaches the browser.
- Student, catalog, chat, voice, quiz, progress, and leaderboard routes have
  complete loading, error, empty, and accessibility states.
- Chat streaming supports terminal states, cancellation, reconnect, and REST
  recovery.
- Voice has permission handling, text fallback, and retention-aware behavior.
- Quiz scores and leaderboard ranks are rendered from backend results only.
- Markdown and citations are sanitized.
- Critical pages pass keyboard and automated accessibility checks.
- Unit, component, contract, WebSocket, and end-to-end tests pass.
- Production builds meet bundle and performance budgets.
- WebSocket hosting, graceful deploy draining, and reconnect behavior are
  tested in staging.
- Security headers, CORS/CSRF behavior, and error redaction are verified.
- Analytics and error reporting do not capture sensitive student data.
- Account, consent, privacy, and deletion workflows are represented in the
  UI and connected to backend contracts.

