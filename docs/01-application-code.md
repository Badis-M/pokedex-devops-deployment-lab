# 01 — Application Code: Node.js, Express, EJS and Frontend Logic

## Purpose

This document explains the application layer of the `pokedex-ci-cd-lab` project.

The goal of the application is to provide a small Pokédex web app used to learn:

- Node.js server basics
- Express routing
- EJS templates and partials
- Static assets
- Browser-side JavaScript
- API consumption
- Query parameters
- DOM rendering
- Jest and Supertest tests
- ESLint quality checks

The app is intentionally simple enough to understand, but realistic enough to support Docker, Terraform, Ansible, HTTPS and CI/CD later.

---

## Final application structure

```text
app/
├── eslint.config.js
├── package-lock.json
├── package.json
├── public
│   ├── css/style.css
│   ├── images/pokeball.png
│   └── js
│       ├── all.js
│       ├── pokedex.js
│       ├── pokemon.js
│       ├── search.js
│       └── utils.js
├── src/server.js
├── tests
│   ├── health.test.js
│   └── pokemon.test.js
└── views
    ├── 404.ejs
    ├── about.ejs
    ├── all.ejs
    ├── index.ejs
    ├── partials
    │   ├── head.ejs
    │   └── navbar.ejs
    ├── pokedex.ejs
    ├── pokemon.ejs
    └── search.ejs
```

---

## High-level flow

```text
Browser
→ Express page route
→ EJS view rendered
→ Browser loads CSS + JS
→ Browser JS calls Express API route
→ Express calls PokéAPI
→ Express formats JSON
→ Browser JS renders UI dynamically
```

Example:

```text
User opens /pokedex?type=fire
→ Express renders views/pokedex.ejs
→ Browser loads /js/pokedex.js
→ pokedex.js reads type=fire from URL
→ pokedex.js fetches /api/pokemon/type/fire
→ Express calls PokéAPI /type/fire
→ JSON response is returned
→ pokedex.js creates Pokémon cards in the DOM
```

---

## `package.json`

Important scripts:

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest",
  "lint": "eslint .",
  "check": "npm run lint && npm test"
}
```

### `npm start`

Runs the app normally:

```bash
node src/server.js
```

### `npm run dev`

Runs the app with Nodemon. Nodemon watches file changes and restarts the server automatically.

### `npm run check`

Runs both linting and tests. This is the command that should be used in CI.

---

## `package-lock.json`

`package.json` describes the dependency ranges the project needs.

`package-lock.json` locks the exact dependency tree that was installed.

This matters because CI, Docker and other machines should install the same dependency versions as the local environment.

Preferred reproducible install command:

```bash
npm ci
```

---

## Express server

Main file:

```text
app/src/server.js
```

Main responsibilities:

1. Configure Express
2. Configure EJS
3. Serve static files
4. Render pages
5. Expose API routes
6. Call PokéAPI
7. Return formatted JSON
8. Export the app for tests

---

## EJS setup

```js
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
```

This tells Express:

```text
Use EJS as the template engine.
Look for templates inside app/views.
```

---

## Static files

```js
app.use(express.static(path.join(__dirname, "../public")));
```

This exposes files from `app/public`, so the browser can load:

```text
/css/style.css
/js/pokedex.js
/images/pokeball.png
```

---

## Page routes

These routes return HTML pages rendered from EJS templates.

| Route | View |
|---|---|
| `/` | `views/index.ejs` |
| `/search` | `views/search.ejs` |
| `/all` | `views/all.ejs` |
| `/about` | `views/about.ejs` |
| `/pokedex` | `views/pokedex.ejs` |
| `/pokemon` | `views/pokemon.ejs` |

---

## API routes

| Route | Purpose |
|---|---|
| `/health` | healthcheck |
| `/api/pokemon` | paginated Pokémon list |
| `/api/pokemon/type/:type` | Pokémon filtered by type |
| `/api/pokemon/:name` | Pokémon details |

---

## Health endpoint

```js
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "pokedex-ci-cd-lab",
    });
});
```

Used by local checks, Docker checks, Ansible deployment validation and public healthchecks.

Expected response:

```json
{"status":"ok","service":"pokedex-ci-cd-lab"}
```

---

## Paginated Pokémon list

Route:

```text
GET /api/pokemon?limit=48&offset=0
```

Concepts:

- query parameters
- validation
- external API call
- response formatting
- pagination

The backend validates:

```text
limit must be between 1 and 100
offset must be >= 0
```

---

## Pokémon by type

Route:

```text
GET /api/pokemon/type/fire?limit=24&offset=0
```

The backend calls:

```text
https://pokeapi.co/api/v2/type/fire
```

Then it slices the result manually:

```js
const pokemonList = typeData.pokemon
    .slice(offset, offset + limit)
    .map((entry) => ({
        name: entry.pokemon.name,
        url: entry.pokemon.url,
    }));
```

This teaches that sometimes an external API does not provide exactly the pagination shape needed, so the backend adapts it.

---

## Pokémon detail route

Route:

```text
GET /api/pokemon/charizard
```

The backend calls PokéAPI, then returns a smaller, cleaner object containing only the data needed by the frontend.

This is useful because the browser does not need to know PokéAPI's full response structure.

---

## Route ordering issue

Important route order:

```js
app.get("/api/pokemon/type/:type", ...)
app.get("/api/pokemon/:name", ...)
```

The type route must appear before the name route.

If `/api/pokemon/:name` came first, Express could interpret `/api/pokemon/type/fire` incorrectly.

---

## EJS partials

Partials avoid repeated HTML.

| Partial | Role |
|---|---|
| `views/partials/head.ejs` | shared `<head>`, favicon, CSS |
| `views/partials/navbar.ejs` | shared navigation |

One change updates all pages.

---

## Frontend JavaScript files

| File | Page | Role |
|---|---|---|
| `all.js` | `/all` | Load all Pokémon by batches |
| `pokedex.js` | `/pokedex?type=...` | Load Pokémon by selected type |
| `pokemon.js` | `/pokemon?name=...` | Load detail page |
| `search.js` | `/search` | Redirect search input to detail page |
| `utils.js` | shared | Common browser functions |

---

## Query parameters

Example:

```text
/pokedex?type=water
```

Code:

```js
const params = new URLSearchParams(window.location.search);
return params.get("type");
```

With `/pokedex?type=water`, this returns `water`.

The earlier fallback `|| "fire"` was removed so `/pokedex` shows an empty state instead of silently displaying Fire Pokémon.

---

## Dynamic back button

When opening a Pokémon from a type page:

```text
/pokemon?name=charizard&type=fire
```

`pokemon.js` reads both `name` and `type`.

If `type=fire`, the back button becomes:

```text
← Back to Fire Pokémon
```

If no type is present, it falls back to:

```text
← Back to all Pokémon
```

This teaches state passed through URL query parameters.

---

## Shared frontend utilities

File:

```text
public/js/utils.js
```

It exposes shared functions through:

```js
window.pokedexUtils = {
    formatPokemonName,
    extractPokemonId,
    createSpritePlaceholder,
};
```

Other files use:

```js
const { formatPokemonName } = window.pokedexUtils;
```

This avoids duplicate code.

---

## DOM rendering

The frontend dynamically creates HTML elements:

```text
create <a>
create <img>
create <h2>
create <p>
append them to the grid
```

Concepts:

- `document.querySelector`
- `document.createElement`
- `element.textContent`
- `element.appendChild`
- `element.classList`
- `element.innerHTML`

---

## Image fallback

If a sprite fails to load:

```js
image.onerror = () => {
    image.replaceWith(createSpritePlaceholder(pokemonId));
};
```

This avoids broken image icons.

---

## Tests

Tests use:

```text
Jest + Supertest
```

Supertest allows testing Express routes without starting a real HTTP server.

`server.js` exports the app:

```js
module.exports = app;
```

This makes tests import the app directly.

---

## `require.main === module`

```js
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
```

Meaning:

```text
If this file is run directly, start the server.
If this file is imported by tests, do not start the server.
```

---

## Mocking `fetch`

Tests mock external API calls:

```js
global.fetch = jest.fn();
```

Why:

- tests do not depend on internet
- tests are faster
- tests are deterministic
- tests do not depend on PokéAPI availability

---

## ESLint

ESLint caught issues such as:

- undefined variables
- unused functions
- scope errors after refactor
- duplicated utility functions

Command:

```bash
npm run lint
```

Full validation:

```bash
npm run check
```

---

## Main lessons

```text
Express serves HTML pages and JSON APIs.
EJS avoids duplicated HTML.
Browser JS reads URL state and fetches backend APIs.
The backend protects the frontend from messy external API responses.
Tests mock external services.
ESLint catches mistakes early.
Small refactors can break frontend contracts if IDs or script order are wrong.
```
