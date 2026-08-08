# letsplayapp1_backend

NestJS backend for the LET'S PLAY MVP v1 points, progress, rewards, family, and parent dashboard system.

## Stack

- TypeScript
- NestJS
- PostgreSQL
- Prisma
- OpenAPI/Swagger
- JWT auth for MVP

## MVP v1 Scope

- Parent registration and login
- Family creation
- Child profiles
- Stars, hearts, energy, and hidden XP
- Lesson completion scoring
- Daily rewards
- Streaks
- Treasure chests
- Achievements
- Letter collectibles
- Avatar catalog and purchases
- Parent dashboard
- Audit events

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Swagger is available at:

```text
http://localhost:3000/docs
```

## Core Flow

1. Register a parent with `POST /api/v1/auth/register-parent`.
2. Create a family with `POST /api/v1/families`.
3. Create child profiles with `POST /api/v1/families/:familyId/children`.
4. Complete lessons with `POST /api/v1/profiles/:profileId/progress/lessons/complete`.
5. Read the child dashboard with `GET /api/v1/profiles/:profileId/dashboard`.

## Reward Rules

Lesson completion currently awards:

- Correct answer: `+10` stars
- First-attempt correct: `+5` stars
- Lesson completion: `+50` stars
- Perfect lesson: `+25` stars
- No hints: `+15` stars

Daily rewards cycle through seven days:

- Day 1: `100` stars
- Day 2: `150` stars
- Day 3: `200` stars
- Day 4: mystery chest
- Day 5: `250` stars
- Day 6: `300` stars
- Day 7: legendary chest

## Production Notes

- Replace MVP password login with your OIDC/OAuth 2.1 provider when the identity provider is selected.
- Keep reward calculation on the backend.
- Keep all star mutations in `wallet_ledger`.
- Add row-level policy checks before adding classroom or multiplayer features.
