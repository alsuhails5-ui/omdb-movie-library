# FRAME — Movie Library

A responsive React movie discovery application powered by the [OMDb API](https://www.omdbapi.com/).

## Features
- Search movies and series by title
- Browse curated starter searches
- View movie details, plot, cast, director, genre and ratings
- Save and remove favourites (persisted with Local Storage)
- Responsive layout, loading skeletons and friendly error states
- Keyboard-friendly search and modal interactions

## Run locally
1. Install Node.js 18+.
2. Get a free OMDb API key: https://www.omdbapi.com/apikey.aspx
3. Copy `.env.example` to `.env` and add your key:
   `VITE_OMDB_API_KEY=your_key`
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Push this project to a GitHub repository.
2. Import that repository at https://vercel.com/new.
3. Framework preset: **Vite**; build command: `npm run build`; output directory: `dist`.
4. Add `VITE_OMDB_API_KEY` under Project Settings → Environment Variables.
5. Redeploy after adding the environment variable.

## API note
The browser calls OMDb directly. A Vite environment variable is bundled into client-side code, so it is not a secret. Use a server-side proxy if you later need to protect a paid/private key. OMDb free keys have request limits; check the current terms on the OMDb website.

## Built with
React, Vite, JavaScript, CSS and OMDb API.
