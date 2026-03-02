# ECE 493 CMS

This project implements the ECE 493 Conference Management System using a vanilla HTML/CSS/JavaScript MVC structure.

## Project Layout
- `src/models/`
- `src/controllers/`
- `src/views/`
- `src/services/`
- `src/assets/`
- `tests/acceptance/`

## Scope Guardrails
- Use only behavior defined in `use_cases/` and `acceptance_tests/`.
- Keep MVC separation strict.
- Do not introduce frontend or CSS frameworks.

## Run Local Server
- Start server: `node src/server.js`
- Default URL: `http://127.0.0.1:3000`
- Entry pages: `/login`, `/register`, `/pricing`, `/conference/register`

## Run Tests
- Full test run (unit + acceptance): `npm test`
- Lint placeholder command: `npm run lint`

Demo accounts are auto-seeded on server startup:
- `author@example.com / Author123!`
- `editor@example.com / Editor123!`
- `reviewer1@example.com / Reviewer123!`
- `attendee@example.com / Attendee123!`
