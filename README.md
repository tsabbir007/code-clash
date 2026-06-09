<div align="center">

# ⚔️ CodeClash

**A full-stack online judge & competitive-programming platform — solve problems, run contests, and climb live leaderboards.**

![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Judge0](https://img.shields.io/badge/Judge0-Code_Execution-FF6B00)

</div>

---

## 📖 Overview

**CodeClash** is a full-stack online judge inspired by competitive-programming sites like **LeetCode** and **Codeforces**. Users can solve programming challenges in an in-browser editor, get real-time verdicts from a self-hosted execution engine, take part in timed contests with dynamic leaderboards, and track their submission history. A built-in admin panel lets organizers manage problems, contests, participants, and announcements.

It is designed for **individuals** sharpening their skills, and for **educational institutions and training organizations** running practice sets and competitions.

The entire project is a **single Next.js 15 (App Router) application** — the frontend and the backend API live in the same codebase.

---

## 🖼️ Screenshots

> 📌 _Placeholders — drop real screenshots into the `docs/` folder and they'll render here._

| Home | Problem & Editor |
| :---: | :---: |
| ![Home](docs/home.png) | ![Problem](docs/problem.png) |

| Contest & Leaderboard | Admin Dashboard |
| :---: | :---: |
| ![Contest](docs/contest.png) | ![Admin](docs/admin.png) |

---

## ✨ Features

### 👤 User
- Email/password authentication and session management (BetterAuth)
- **Problem library** with search and filtering by **difficulty** and **category/tags**, plus pagination
- **In-browser code editor** (Monaco) with starter templates for **C++, Java, and Python 3**
- **Real-time judging** — submit code and receive a verdict (AC / WA / TLE / MLE / CE / RE)
- **Detailed results** — per-test-case verdicts with CPU time and memory usage
- **Submission history** per problem, filterable by language
- Light / dark mode

### 🏆 Contests
- Browse contests by status — **Upcoming**, **Active**, **Ended**
- **Register** for upcoming contests; enter active ones directly
- Live **contest timer** showing remaining time
- Dedicated contest workspace with tabs for **Problems, Submissions, Standings, Announcements, and Clarifications**
- **Live leaderboard** ranked by score, problems solved, penalty, and last submission time
- **Announcements** from organizers and a **clarifications** Q&A channel

### 🛠️ Admin
- Dashboard with platform **stats** (total problems, users, active users, submissions, success rate)
- **Problem management** — create, edit, delete problems; manage categories, test cases, limits, and checker type
- **Contest management** — create/edit contests, attach problems with points & ordering, assign moderators
- Manage **participants**, monitor **submissions** and **standings**, post **announcements**, and answer **clarifications**

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 15.3](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI** | [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), [Lucide](https://lucide.dev/) icons, [next-themes](https://github.com/pacocoursey/next-themes) |
| **Code Editor** | [Monaco Editor](https://github.com/suren-atoyan/monaco-react) (the editor that powers VS Code) |
| **Rich Text** | [Tiptap 3](https://tiptap.dev/) (problem statements & announcements) |
| **Database / ORM** | [PostgreSQL](https://www.postgresql.org/) via [Neon serverless](https://neon.tech/), [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit |
| **Auth** | [BetterAuth](https://www.better-auth.com/) (email/password, session-based) |
| **Code Execution** | [Judge0](https://judge0.com/) (self-hosted via Docker) |
| **Forms / Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Data UI** | [TanStack Table](https://tanstack.com/table), [Recharts](https://recharts.org/), [Sonner](https://sonner.emilkowal.ski/) (toasts) |
| **Tooling** | ESLint 9, SASS, [pnpm](https://pnpm.io/) |

---

## 🏗️ Architecture

CodeClash is a monolithic Next.js app. The browser renders App Router pages (mostly React Server Components with client islands for interactive parts like the editor). User actions call **Next.js API routes**, which use **Drizzle ORM** to talk to **PostgreSQL**, and call a **Judge0** instance to compile and run submitted code.

```
                         ┌──────────────────────────────────────────┐
                         │              Browser (React 19)            │
                         │  Pages • Monaco Editor • Tiptap • shadcn   │
                         └───────────────────┬────────────────────────┘
                                             │ fetch
                         ┌───────────────────▼────────────────────────┐
                         │        Next.js App Router (server)          │
                         │   Server Components  +  /api route handlers │
                         └───────┬───────────────────────────┬─────────┘
                                 │ Drizzle ORM               │ HTTP
                         ┌───────▼─────────┐         ┌────────▼─────────┐
                         │   PostgreSQL    │         │     Judge0       │
                         │  (Neon / local) │         │ (Docker, :2358)  │
                         └─────────────────┘         └──────────────────┘
```

**Submitting a solution (request flow):**
1. The user writes code in the Monaco editor and submits.
2. A Next.js API route stores the submission and forwards the source + language ID to **Judge0**.
3. Judge0 compiles and runs the code against each test case.
4. The route records the per-test-case results and an overall verdict in PostgreSQL.
5. The UI polls/refreshes to show the verdict, score, CPU time, and memory usage.

Judge0 language IDs used include: **C (50), C++ (54), Java (62), JavaScript (63), Python 3 (71)**.

---

## 📂 Project Structure

```
code-clash/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Login / register / account
│   │   ├── admin/               # Admin dashboard, problems & contests management
│   │   ├── api/                 # Backend API route handlers (see API Reference)
│   │   ├── problems/            # Problem list + [problemId] solve page
│   │   ├── contests/            # Contest list + [contestId] workspace
│   │   ├── providers/           # React context providers
│   │   ├── layout.tsx           # Root layout (theme, fonts)
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles + theme tokens
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (Radix-based)
│   │   ├── problem/             # code-editor, problem-statement, submission views
│   │   ├── contest/             # contest cards, modals, list, wrapper
│   │   ├── navbar/              # Top navigation
│   │   └── tiptap-*/            # Rich text editor UI, nodes, icons, templates
│   ├── db/
│   │   ├── index.ts             # Drizzle + Postgres connection
│   │   └── schema.ts            # Full database schema
│   ├── lib/
│   │   ├── auth.ts              # BetterAuth server config
│   │   ├── auth-client.ts       # BetterAuth client
│   │   └── utils.ts             # Shared helpers
│   ├── hooks/                   # Custom React hooks (contests, timer, stats, …)
│   ├── modules/auth/            # Auth UI views
│   └── styles/                  # SCSS variables & animations
├── drizzle/                     # Generated migrations
├── public/                      # Static assets
├── drizzle.config.ts            # Drizzle Kit config
├── next.config.ts               # Next.js config
├── components.json              # shadcn/ui config
└── package.json
```

---

## ✅ Prerequisites

- **Node.js 20+**
- **pnpm** (recommended) — `npm install -g pnpm` (npm/yarn also work)
- A **PostgreSQL** database — a free [Neon](https://neon.tech/) database or a local Postgres instance
- **Docker** — to self-host the Judge0 execution engine

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/tsabbir007/code-clash.git
cd code-clash

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# then open .env and fill in the values (see "Environment Variables" below)

# 4. Push the database schema to your PostgreSQL database
pnpm db:push

# 5. Start the development server
pnpm dev
```

The app will be available at **http://localhost:3000**.

> ⚙️ Code execution (running/judging submissions) requires a Judge0 instance — see [Judge0 Setup](#-judge0-setup-docker).

---

## 🔑 Environment Variables

Create a `.env` file in the project root (copy from `.env.example`). The app reads the following variables:

| Variable | Required | Description | Example |
| --- | :---: | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon or local) | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | ✅ | Secret used to sign auth sessions (use a long random string) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Base URL of the app | `http://localhost:3000` |
| `NEXT_PUBLIC_JUDGE0_API_ENDPOINT` | ✅ | URL of your Judge0 instance | `http://localhost:2358` |

> 🔒 Never commit real secrets. `.env` is git-ignored; only `.env.example` (with placeholder values) is tracked.

---

## 🐳 Judge0 Setup (Docker)

Code execution is handled by a self-hosted [Judge0](https://judge0.com/) instance. The quickest way to run it locally:

```bash
# Download the official Judge0 release bundle (check judge0.com for the latest version)
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip
cd judge0-v1.13.1

# Start Judge0 (it ships its own docker-compose.yml + db/redis)
docker compose up -d db redis
sleep 10
docker compose up -d
```

By default Judge0 listens on **port `2358`**. Point the app at it:

```env
NEXT_PUBLIC_JUDGE0_API_ENDPOINT=http://localhost:2358
```

Verify it's up with `curl http://localhost:2358/about`. See the [official Judge0 deployment docs](https://github.com/judge0/judge0/blob/master/CHANGELOG.md) for production hardening (auth tokens, workers, isolation).

---

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server (http://localhost:3000) |
| `pnpm build` | Build the app for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push the Drizzle schema directly to the database |
| `pnpm db:generate` | Generate SQL migration files from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio to browse the database visually |

> npm/yarn equivalents work too — e.g. `npm run dev`.

---

## 🗄️ Database

CodeClash uses **PostgreSQL** with **Drizzle ORM**. The full schema lives in [`src/db/schema.ts`](src/db/schema.ts), and the connection is set up in [`src/db/index.ts`](src/db/index.ts). Browse your data anytime with `pnpm db:studio`.

Main entities, grouped:

- **Auth** — `user`, `session`, `account`, `verification`
- **Problems** — `problem`, `category`, `problem_category`, `problem_moderator`, `test_case`, `solution`, `submission`, `submission_result`
- **Contests** — `contest`, `contest_problem`, `contest_participant`, `contest_standing`, `contest_submission`, `contest_moderator`, `contest_announcement`, `contest_clarification`

---

## 🔌 API Reference

A high-level map of the API routes under `src/app/api/` (not exhaustive request/response docs):

| Group | Endpoints (selected) | Purpose |
| --- | --- | --- |
| **Auth** | `/api/auth/[...all]` | BetterAuth handler (login, register, session) |
| **Problems** | `/api/problems`, `/api/problems/[problemId]`, `/api/problems/[problemId]/{statement,limits,categories,testcases,submissions,solutions}`, `/api/problems/public`, `/api/problems/public/[id]` | Fetch problem data; public listing with search/filter/pagination |
| **Execution** | `/api/problems/[problemId]/solutions/[solutionId]/execute` | Run a solution against test cases via Judge0 |
| **Submissions** | `/api/submissions`, `/api/submissions/[submissionId]` | List and inspect submissions |
| **Contests** | `/api/contests`, `/api/contests/my`, `/api/contests/[contestId]/{full,info,participate,register,submit}` | Browse, register, submit, fetch full contest data |
| **Categories** | `/api/categories` | List problem categories |
| **Admin** | `/api/admin/stats`, `/api/admin/contests`, `/api/admin/contests/[contestId]`, `/api/admin/contests/[contestId]/problems` | Platform stats and contest administration |

---

## 🧭 Routes (Pages)

| Route | Description |
| --- | --- |
| `/` | Home — featured & all contests |
| `/login`, `/register` | Authentication |
| `/problems` | Problem list with search, difficulty/category filters, pagination |
| `/problems/[problemId]` | Solve a problem — statement, editor, test cases, submission history |
| `/contests` | Contest list (Upcoming / Active / Ended) with registration |
| `/contests/[contestId]` | Contest workspace — problems, editor, timer, standings, announcements, clarifications |
| `/contests/[contestId]/info` | Contest details |
| `/admin` | Admin dashboard with platform stats |
| `/admin/problems` | Manage problems & categories |
| `/admin/contests` | Manage contests (overview, problems, participants, standings, submissions, announcements, clarifications, moderators, settings) |

---

## ☁️ Deployment

CodeClash is a standard Next.js app and deploys well on **Vercel** (or any Node host):

1. Set all [environment variables](#-environment-variables) on the host.
2. Use a hosted PostgreSQL database (e.g. **Neon**) for `DATABASE_URL`.
3. Run a publicly reachable **Judge0** instance and point `NEXT_PUBLIC_JUDGE0_API_ENDPOINT` at it.
4. Build with `pnpm build` and serve with `pnpm start`.

> ⚠️ **Heads-up:** `next.config.ts` currently sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to `true`, so production builds succeed even with lint/type errors. Consider tightening these before a real production launch.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes and run `pnpm lint` before committing.
3. Use clear, descriptive commit messages.
4. Open a Pull Request against the `main` branch describing what and why.

---

## 📄 License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Judge0](https://judge0.com/) — code execution engine
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tiptap](https://tiptap.dev/) — rich text editing
- [BetterAuth](https://www.better-auth.com/) — authentication
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe database access
