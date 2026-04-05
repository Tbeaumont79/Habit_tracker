# HabitTracker v2 — CLAUDE.md

## Project Overview

HabitTracker v2 is a habit tracking web application with a candy sweet bento dashboard design. Users can create, track, and visualise daily/weekly habits through a visually playful and colourful interface.

## Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | Vue 3.6 (Composition API) + Vite + Tailwind CSS 4.2 |
| State      | Pinia                                        |
| Routing    | Vue Router 5                                 |
| Icons      | Lucide Vue Next                              |
| Backend    | Express 5 + TypeScript                       |
| ORM        | Prisma 6 (SQLite in dev)                     |
| Auth       | bcryptjs + jsonwebtoken                      |
| Testing    | Vitest + @vue/test-utils (client), Vitest + Supertest (server) |
| Package Manager | pnpm (workspaces)                       |
| Runtime    | Node.js >= 20                                |

## Monorepo Structure

```
habittracker-v2/
├── client/                  # Vue 3.6 frontend
│   ├── src/
│   │   ├── assets/         # CSS, images
│   │   ├── components/     # Reusable Vue components
│   │   │   └── __tests__/  # Component tests
│   │   ├── views/          # Route-level page components
│   │   ├── stores/         # Pinia stores
│   │   ├── router/         # Vue Router config
│   │   ├── App.vue
│   │   └── main.ts
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── package.json
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── app.ts          # Express app factory
│   │   ├── index.ts        # Entry point (starts server)
│   │   └── __tests__/      # API tests
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
├── package.json             # Root workspace config
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## How to Run

### Install dependencies
```bash
pnpm install
```

### Development (both client + server)
```bash
pnpm dev
```

Or individually:
```bash
pnpm --filter client dev    # Vite dev server on http://localhost:5173
pnpm --filter server dev    # Express server on http://localhost:3000
```

### Build
```bash
pnpm build
```

### Run tests
```bash
pnpm test                   # All workspaces
pnpm test:client            # Client only
pnpm test:server            # Server only
```

### Database (server)
```bash
pnpm --filter server db:generate   # Generate Prisma client
pnpm --filter server db:push       # Push schema to DB (dev)
pnpm --filter server db:migrate    # Create migration
pnpm --filter server db:studio     # Open Prisma Studio
```

## Design Tokens

The design system is defined as CSS custom properties in `client/src/assets/main.css`:

| Token             | Value     | Usage                        |
|-------------------|-----------|------------------------------|
| `--bg`            | `#FFF8F0` | Page background (warm cream) |
| `--surface`       | `#FFFFFF` | Card/component surface       |
| `--surface-alt`   | `#FFF0F5` | Alternate surface (pink tint)|
| `--primary`       | `#FF6B9D` | Primary brand pink           |
| `--primary-light` | `#FFB3D0` | Lighter primary              |
| `--primary-dark`  | `#E5456E` | Darker primary (hover)       |
| `--secondary`     | `#B8A9E8` | Secondary lavender           |
| `--secondary-light`| `#DDD4F4`| Lighter secondary            |
| `--accent`        | `#7DD3B4` | Accent mint/teal             |
| `--accent-light`  | `#C5EDE0` | Lighter accent               |
| `--warning`       | `#FFB07A` | Warning orange               |
| `--warning-light` | `#FFD4B5` | Lighter warning              |
| `--error`         | `#E83C3C` | Error red                    |
| `--error-light`   | `#FFB5B5` | Lighter error                |
| `--text`          | `#2D2B3D` | Primary text (dark purple)   |
| `--text-secondary`| `#564A65` | Secondary text               |
| `--text-muted`    | `#7B7192` | Muted/placeholder text       |
| `--border`        | `#F0E4E8` | Border colour (soft pink)    |

### Typography
- **Headings**: Plus Jakarta Sans (Google Fonts)
- **Body**: Inter (Google Fonts)

## Database Models

- **User**: id, email (unique), password (hashed), name, createdAt
- **Habit**: id, userId, name, description, icon, color, frequency (DAILY/WEEKLY/CUSTOM), targetDays, category, position, isArchived, createdAt, updatedAt
- **HabitLog**: id, habitId, date, completed, note, createdAt — unique constraint on (habitId, date)

## Conventions

### Git Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(scope): short description
fix(scope): short description
refactor(scope): short description
test(scope): short description
docs(scope): short description
chore(scope): short description
```

### Vue 3 — Composition API
- Always use `<script setup lang="ts">` syntax (no Options API)
- Use `defineProps`, `defineEmits`, `defineExpose` with TypeScript interfaces
- Composables go in `src/composables/` with `use` prefix (e.g., `useHabits.ts`)
- Keep components small and single-responsibility

### TypeScript
- Strict mode enabled everywhere
- No `any` unless absolutely unavoidable (prefer `unknown`)
- Define interfaces/types for all API payloads

### Testing (TDD)
- Write tests before implementation (TDD)
- Client: use `@vue/test-utils` with jsdom
- Server: use `supertest` for HTTP integration tests
- Aim for high coverage on business logic

### API Design
- RESTful endpoints under `/api/v1/`
- Return `{ data, error, message }` envelope
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)
- Validate request bodies with zod (when added)

### Styling
- Use Tailwind CSS utility classes as primary styling approach
- Use CSS custom properties (design tokens) for brand colours
- Prefer `gap`, `flex`, `grid` over margins for spacing
- Component-scoped styles via `<style scoped>` for complex component-specific CSS

### File Naming
- Vue components: PascalCase (`HabitCard.vue`)
- Composables: camelCase with `use` prefix (`useHabits.ts`)
- Stores: camelCase (`habitStore.ts`)
- Tests: same name as file with `.spec.ts` or `.test.ts` suffix

### Environment Variables
- Never commit `.env` files
- Prefix client env vars with `VITE_` for Vite exposure
- Document all required env vars in `.env.example`
