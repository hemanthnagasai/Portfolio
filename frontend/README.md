# Life Portfolio - React Frontend

The frontend React application built with **Vite** and **TypeScript**.

## Tech Stack
- **Bundler**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS & Custom Vanilla CSS
- **Routing**: React Router DOM (v7)
- **Animations**: Framer Motion

---

## Available Scripts

In the `frontend` directory, you can run:

### `npm run start`
Runs the app in development mode at `http://localhost:5000/`.  
Vite will automatically hot-reload the page when you save code changes.

### `npm run build`
Compiles and bundles the application for production into the `dist/` folder.  
It executes TypeScript compile checks (`tsc`) before building to ensure strict type-safety.

### `npm run preview`
Locally hosts and previews the compiled production bundle (`dist/` folder).

---

## Path Aliases
To avoid deep relative imports, path aliases are configured:
- `@/*` maps directly to `src/*` (e.g. `import Recruiter from "@/pages/Recruiter"`).
- Supported and defined in both [`tsconfig.json`](file:///c:/Users/SRI/Downloads/Portfolio/Portfolio/frontend/tsconfig.json) and [`vite.config.js`](file:///c:/Users/SRI/Downloads/Portfolio/Portfolio/frontend/vite.config.js).

---

## Dev Server API Proxy
Vite is configured to automatically proxy `/api/*` endpoints to the FastAPI backend running on `http://localhost:8000` to prevent CORS issues in local development. See the `server.proxy` section in [`vite.config.js`](file:///c:/Users/SRI/Downloads/Portfolio/Portfolio/frontend/vite.config.js) for details.
