# api-template

A foundation API template built to serve as a starting point for new projects

---

## Tech Stack

- Bun
- Express
- Prisma
- Zod
- JSON Web Token

---

## Getting Started

1. Clone the repo and install dependencies
2. Set up Postgres database
3. Duplicate .env.example file to .env and fill in your variables
4. Run db migrations using Prisma
5. Start the development server

---

## Environment Variables

| Variable       | Description                               | Default         |
| -------------- | ----------------------------------------- | --------------- |
| NODE_ENV       | Sets the application environment          | development     |
| PORT           | The port the Express server binds to      | 8080            |
| DATABASE_URL   | PostgreSQL connection string              | None (Required) |
| ACCESS_SECRET  | Secret key for signing JWT Access Tokens  | 123             |
| REFRESH_SECRET | Secret key for signing JWT Refresh Tokens | abc             |
| ACCESS_EXPIRY  | Lifespan of the Access Token              | 30m             |
| REFRESH_EXPIRY | Lifespan of the Refresh Token             | 7d              |
