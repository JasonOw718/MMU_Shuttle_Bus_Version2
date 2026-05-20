# MMU Shuttle Admin

Admin dashboard for the MMU Shuttle Bus platform. Built with **React + TypeScript + Vite**.

---

## Prerequisites

- **Node.js** `>= 20.x` (LTS recommended)
- **npm** `>= 10.x` (or `pnpm` / `yarn` if you prefer)
- A running instance of the [`shuttle-backend`](../shuttle-backend) (REST + WebSocket endpoints)

---

## 1. Environment Variables

Create a `.env` file in this directory (`mmu_shuttle_admin/`) with the following keys:

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_ID=your_google_maps_id
```

> Vite only exposes variables prefixed with `VITE_` to the client bundle.
> They are inlined at **build time**, so restart the dev server after changing them.

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Run the Dev Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (Vite's default port).

The dev server supports **Hot Module Replacement (HMR)** — edits to `.tsx`/`.ts`/`.css` files reload instantly.

---

## 4. Available Scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR                 |
| `npm run build`   | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the built `dist/` locally for smoke-testing  |
| `npm run lint`    | Run ESLint over the project                        |

---
