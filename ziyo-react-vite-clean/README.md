# ZIYO — React + Vite

This version is written entirely with technologies you already know:

- React
- JavaScript
- CSS
- Vite
- React Router

There is no TypeScript and no UI framework.

## Run locally

```bash
npm install
npm run dev
```

Open the address printed by Vite, usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  components/     reusable UI elements
  data/           course and navigation data
  layouts/        shared header/sidebar layout
  pages/          page components grouped by role
  styles/         global CSS
  App.jsx         all application routes
  main.jsx        React entry point
```

## Deploy to Vercel

1. Upload the folder to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Vercel detects Vite automatically.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**.

The included `vercel.json` makes React Router URLs work after refreshing.
