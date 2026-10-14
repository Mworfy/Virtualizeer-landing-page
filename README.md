# Virtualizeer website

React (Vite + React Router) marketing site for Virtualizeer — virtual tours, digital twins and web development.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content
Everything you'll want to change lives in **`src/content.js`** — search for `TODO`:
contact details, socials, demo tour URL, projects (with optional `tourUrl` / `image`), stats, testimonials, clients and team.

- Project photos: put them in `public/projects/` and set `image: '/projects/file.jpg'`.
- Team photos: `public/team/` and set `photo`.
- Contact form is UI only — wire it up in `src/pages/Contact.jsx` (look for the `TODO`).

## Brand assets
`public/brand/` holds transparent logos derived from the originals (navy + white horizontal lockup, mark, wordmark, favicon).

## Deploying
Works on any static host. `public/_redirects` (Netlify) and `vercel.json` handle client-side routes.
