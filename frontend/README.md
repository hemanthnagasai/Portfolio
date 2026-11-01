# Life Portfolio - React Frontend

The frontend React application built with **Vite** and **TypeScript**.

## Tech Stack
- **Bundler**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS & Custom Vanilla CSS
- **Routing**: React Router DOM (v7)
- **Animations**: Framer Motion
- **E2E tests**: Playwright

---

## Available Scripts

In the `frontend` directory, you can run:

### `npm run start`
Runs the app in development mode at `http://localhost:5000/`.  
Vite will automatically hot-reload the page when you save code changes.

### `npm run build`
Compiles and bundles the application for production into the `dist/` folder.

### `npm run preview`
Locally hosts and previews the compiled production bundle (`dist/` folder).

### `npm run test:e2e`
Runs the Playwright end-to-end smoke suite. It builds the app, boots the FastAPI backend serving the built `dist/` (production shape), and drives a headless browser through the key flows. No Gemini key needed.

> Type-safety is enforced separately with `npx tsc --noEmit` (run in CI on every push), not as part of `build`.

---

## Path Aliases
To avoid deep relative imports, path aliases are configured:
- `@/*` maps directly to `src/*` (e.g. `import Recruiter from "@/pages/Recruiter"`).
- Supported and defined in both [`tsconfig.json`](./tsconfig.json) and [`vite.config.mjs`](./vite.config.mjs).

---

## Dev Server API Proxy
Vite is configured to automatically proxy `/api/*` endpoints to the FastAPI backend running on `http://localhost:8000` to prevent CORS issues in local development. See the `server.proxy` section in [`vite.config.mjs`](./vite.config.mjs) for details.
