# FounderLink Frontend TS

TypeScript version of the FounderLink frontend built with React, Redux Toolkit, React Router, Tailwind CSS, and Cypress.

## Tech Stack

- React 19
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- React Hook Form + Yup
- Cypress

## Requirements

- Node.js 18+ recommended
- npm

## Setup

Install dependencies:

```bash
npm install
```

## Run In Development

Start the app:

```bash
npm start
```

The development server runs on:

```text
http://localhost:3002
```

Note:
- Port `3002` is configured intentionally to avoid conflict with Grafana on `3001`.
- If the frontend depends on backend services, make sure those APIs are also running.

## Available Scripts

Start development server:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

Run unit tests:

```bash
npm test
```

Run test coverage:

```bash
npm run test:coverage
```

Run ESLint:

```bash
npm run lint
```

Auto-fix ESLint issues:

```bash
npm run lint:fix
```

Format files with Prettier:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Open Cypress:

```bash
npm run cypress:open
```

Run Cypress headlessly:

```bash
npm run cypress:run
```

## Build Output

Running:

```bash
npm run build
```

generates a production-ready `build/` folder.

- `build/index.html` is the entry HTML file
- `build/static/js` contains the compiled JavaScript bundles
- `build/static/css` contains the compiled CSS

Do not edit files inside `build/` manually because they are generated automatically.

## Cypress

The Cypress setup in this project is also TypeScript-based:

- `cypress.config.ts`
- `cypress/e2e/*.cy.ts`
- `cypress/support/*.ts`

## Project Notes

- App source code lives in `src/`
- Shared types live in `src/types`
- API modules live in `src/api`
- Redux store lives in `src/store`
- Generated production files live in `build/`

## Status

Current state of this frontend:

- TypeScript migration completed for app source
- Cypress files converted to TypeScript
- `npm run lint` passes
- `npm run build` passes
