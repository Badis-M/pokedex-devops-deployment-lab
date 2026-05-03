# Pokedex CI/CD Lab — NotebookLM Source: Code Learning Notes

## Purpose of this source

This document is designed as a single clean source for NotebookLM audio generation.

The goal is not to document every line mechanically, but to explain the code concepts used in the Pokedex Node.js project so the learner can revise:

- how a small Node.js application is structured;
- how Express serves static files and API routes;
- how backend routes call an external API;
- how request parameters and query parameters work;
- how input validation protects the application;
- how JSON responses are shaped for the frontend;
- how Jest and Supertest test an Express app;
- how mocking `fetch` allows tests without real network calls;
- how npm scripts organize development commands;
- what code-quality issues were found and how to reason about them.

Git concepts are intentionally not covered.

---

# 1. Project overview

This project is a small Pokedex application built with Node.js and Express.

The application has two main parts:

1. A static frontend located in the `public/` directory.
2. A backend Express server located in `src/server.js`.

The frontend displays pages such as the home page, the Pokedex page, the Pokemon detail page, the search page, and the about page.

The backend exposes a few API endpoints that act as a controlled interface between the frontend and the public PokeAPI.

Instead of letting the frontend call PokeAPI directly everywhere, the Node.js server provides internal endpoints such as:

- `GET /health`
- `GET /api/pokemon`
- `GET /api/pokemon/:name`
- `GET /api/pokemon/type/:type`

This is useful for learning because it introduces the idea of a backend API layer.

That backend layer can:

- validate user input;
- control query parameters;
- reshape external API responses;
- hide unnecessary external API complexity from the frontend;
- provide stable JSON responses to the browser;
- make the application testable.

---

# 2. Project structure explained

The relevant project structure is:

```text
package.json
package-lock.json
src/server.js
public/index.html
public/css/style.css
public/js/all.js
public/js/pokedex.js
public/js/pokemon.js
public/js/search.js
public/pages/about.html
public/pages/all.html
public/pages/pokedex.html
public/pages/pokemon.html
public/pages/search.html
tests/health.test.js
tests/pokemon.test.js
```

## `package.json`

The `package.json` file describes the Node.js project.

It contains:

- the project name;
- the project version;
- the application entry point;
- npm scripts;
- runtime dependencies;
- development dependencies.

In this project, the entry point is:

```json
"main": "src/server.js"
```

That means the main server file is `src/server.js`.

## `src/server.js`

This is the Express backend.

It is responsible for:

- creating the Express app;
- serving static frontend files;
- exposing API routes;
- calling PokeAPI;
- validating query parameters;
- returning JSON responses;
- exporting the app for tests;
- starting the server when the file is executed directly.

## `public/`

The `public/` folder contains static assets served by Express.

Static assets are files that the browser can load directly, such as:

- HTML pages;
- CSS files;
- browser-side JavaScript files;
- images, if present.

The backend serves this folder using:

```js
app.use(express.static(path.join(__dirname, "../public")));
```

This means that files inside `public/` become available to the browser.

For example:

- `public/index.html` can be served as the home page;
- `public/css/style.css` can be loaded by HTML pages;
- `public/js/search.js` can be loaded by the search page.

## `tests/`

The `tests/` folder contains automated tests.

In this project:

- `health.test.js` tests the health endpoint;
- `pokemon.test.js` tests Pokemon-related API endpoints.

These tests are written with Jest and Supertest.

---

# 3. npm scripts explained

The project uses the following npm scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest",
  "lint": "eslint .",
  "check": "npm run lint && npm test"
}
```

## `npm start`

Runs the application normally with Node.js:

```bash
npm start
```

This executes:

```bash
node src/server.js
```

This is the basic production-like way to start the app locally.

## `npm run dev`

Runs the application with Nodemon:

```bash
npm run dev
```

Nodemon watches files and restarts the server automatically when code changes.

This is useful during development because the developer does not need to manually stop and restart the server after each edit.

## `npm test`

Runs the automated test suite:

```bash
npm test
```

This executes Jest.

Jest discovers test files and runs the assertions.

## `npm run lint`

Runs ESLint on the project:

```bash
npm run lint
```

This executes:

```bash
eslint .
```

The dot means ESLint checks the current project directory.

Linting is not the same as testing.

Tests check behavior.

Linting checks code quality, syntax issues, undefined variables, suspicious patterns, and style rules depending on configuration.

## `npm run check`

Runs linting first, then tests:

```bash
npm run check
```

This executes:

```bash
npm run lint && npm test
```

The `&&` operator means the second command runs only if the first one succeeds.

So if linting fails, tests do not run.

This is a useful local equivalent of what a CI pipeline often does.

---

# 4. Dependencies explained

The project has one runtime dependency:

```json
"dependencies": {
  "express": "^5.2.1"
}
```

## Express

Express is the web framework used to create the server.

It provides simple tools to:

- create an app;
- define HTTP routes;
- serve static files;
- return JSON responses;
- handle requests and responses.

The project also has development dependencies:

```json
"devDependencies": {
  "eslint": "^10.2.1",
  "jest": "^30.3.0",
  "nodemon": "^3.1.14",
  "supertest": "^7.2.2"
}
```

## ESLint

ESLint checks the JavaScript code for problems.

Example issue encountered in the project:

```text
'pokemonId' is not defined
```

This means the code referenced a variable named `pokemonId`, but that variable did not exist in the current scope.

ESLint catches this before runtime.

## Jest

Jest is the test runner.

It provides:

- `describe` blocks;
- `it` test cases;
- `expect` assertions;
- mocks such as `jest.fn()`;
- test lifecycle hooks such as `beforeEach` and `afterEach`.

## Supertest

Supertest allows tests to send HTTP requests to the Express app without starting a real network server.

This is important.

The tests can do:

```js
const response = await request(app).get("/health");
```

That means the test calls the Express app directly in memory.

## Nodemon

Nodemon is used only during development.

It restarts the Node.js process when files change.

---

# 5. Express server fundamentals

The server starts with:

```js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
```

## `require`

`require` imports modules in CommonJS style.

This project uses CommonJS, not ES modules.

Examples:

```js
const express = require("express");
const path = require("path");
```

`express` is installed from npm.

`path` is a built-in Node.js module.

## `app = express()`

This creates an Express application instance.

The `app` object is used to:

- register middleware;
- define routes;
- start the server;
- export the app for tests.

## `PORT`

The server chooses its port with:

```js
const PORT = process.env.PORT || 3000;
```

This means:

- if an environment variable named `PORT` exists, use it;
- otherwise, use port `3000`.

This is a common pattern.

It allows hosting platforms or CI environments to inject a port dynamically.

---

# 6. Serving static files

The server uses:

```js
app.use(express.static(path.join(__dirname, "../public")));
```

This line means: serve the `public/` directory as static content.

## `__dirname`

`__dirname` is the directory of the current file.

Since the server file is in `src/server.js`, `__dirname` points to the `src/` directory.

To reach `public/`, the code goes one level up:

```text
src/../public
```

That path is built safely with:

```js
path.join(__dirname, "../public")
```

Using `path.join` is better than manually concatenating strings because it handles path separators correctly across operating systems.

## Why static serving matters

Without this line, the browser would not automatically receive files such as:

- HTML pages;
- CSS files;
- frontend JavaScript files.

This line makes the Express server both:

- a static web server;
- an API server.

That is a useful pattern for small learning projects.

---

# 7. Health endpoint

The health route is:

```js
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "pokedex-devops-deployment-lab",
    });
});
```

## Purpose of `/health`

A health endpoint is a simple route used to check whether the application is running.

It returns a predictable JSON response:

```json
{
  "status": "ok",
  "service": "pokedex-devops-deployment-lab"
}
```

This endpoint is useful for:

- local testing;
- automated tests;
- CI validation;
- future monitoring;
- deployment checks.

## Request and response objects

Express route handlers receive two main objects:

```js
(req, res) => {}
```

`req` means request.

It contains information sent by the client.

`res` means response.

It is used to send data back to the client.

In this route, `req` is not used because the health check does not need any input.

## `res.status(200).json(...)`

This sends an HTTP response with:

- status code `200`;
- JSON body.

Status `200` means success.

---

# 8. Pokemon list endpoint

The route is:

```js
app.get("/api/pokemon", async (req, res) => {
  const limit = Number(req.query.limit || 48);
  const offset = Number(req.query.offset || 0);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: "Limit must be an integer between 1 and 100",
    });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({
      error: "Offset must be a positive integer",
    });
  }

  try {
    const apiResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
    );

    if (!apiResponse.ok) {
      return res.status(502).json({
        error: "Failed to fetch Pokemon list",
      });
    }

    const data = await apiResponse.json();

    return res.status(200).json({
      count: data.count,
      limit,
      offset,
      results: data.results.map((pokemon) => ({
        name: pokemon.name,
        url: pokemon.url,
      })),
    });
  } catch {
    return res.status(500).json({
      error: "Failed to fetch Pokemon list",
    });
  }
});
```

## Purpose

This endpoint returns a paginated list of Pokemon.

Example request:

```http
GET /api/pokemon?limit=48&offset=0
```

This endpoint calls PokeAPI:

```text
https://pokeapi.co/api/v2/pokemon?limit=48&offset=0
```

Then it returns a simplified JSON response to the frontend.

## Query parameters

The route reads:

```js
req.query.limit
req.query.offset
```

Query parameters are values passed after the `?` in a URL.

Example:

```text
/api/pokemon?limit=20&offset=40
```

Here:

- `limit` is `20`;
- `offset` is `40`.

## `limit`

`limit` controls how many Pokemon are returned.

The default value is `48`:

```js
const limit = Number(req.query.limit || 48);
```

## `offset`

`offset` controls where pagination starts.

The default value is `0`:

```js
const offset = Number(req.query.offset || 0);
```

## Why `Number(...)` is used

Query parameters arrive as strings.

For example:

```text
limit=48
```

The value is not the number `48`; it is the string `"48"`.

`Number(...)` converts it into a JavaScript number.

## Input validation

The code validates `limit`:

```js
if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
  return res.status(400).json({
    error: "Limit must be an integer between 1 and 100",
  });
}
```

This protects the endpoint from invalid or excessive input.

Allowed `limit` values:

- must be integers;
- must be at least `1`;
- must be at most `100`.

The code also validates `offset`:

```js
if (!Number.isInteger(offset) || offset < 0) {
  return res.status(400).json({
    error: "Offset must be a positive integer",
  });
}
```

Allowed `offset` values:

- must be integers;
- must be `0` or greater.

The error message says "positive integer", but technically `0` is allowed. A more precise message would be: "Offset must be a non-negative integer".

## Calling PokeAPI

The route calls PokeAPI with:

```js
const apiResponse = await fetch(
  `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
);
```

`fetch` performs an HTTP request.

`await` pauses execution until the HTTP response is available.

The route handler must be marked `async` to use `await`.

## Handling failed external responses

The code checks:

```js
if (!apiResponse.ok) {
  return res.status(502).json({
    error: "Failed to fetch Pokemon list",
  });
}
```

`apiResponse.ok` is true when the external API returned a successful HTTP status.

If PokeAPI returns an error, the app returns `502`.

Status `502 Bad Gateway` is appropriate when the app depends on an upstream service and that upstream service fails.

## Parsing JSON

The code parses the external response with:

```js
const data = await apiResponse.json();
```

This converts the JSON response body into a JavaScript object.

## Reshaping data

The response is simplified with:

```js
results: data.results.map((pokemon) => ({
  name: pokemon.name,
  url: pokemon.url,
}))
```

`map` transforms each Pokemon object into a smaller object containing only:

- `name`;
- `url`.

This is a common backend pattern.

The backend does not need to expose everything it receives from the external API.

It exposes only what the frontend needs.

## Error handling with `try/catch`

The route wraps the external API call in:

```js
try {
  // external call
} catch {
  // error response
}
```

The `catch` block handles runtime failures such as:

- network errors;
- DNS issues;
- fetch throwing an exception;
- unexpected failure while parsing data.

In that case, the route returns:

```json
{
  "error": "Failed to fetch Pokemon list"
}
```

with status `500`.

Status `500` means internal server error.

---

# 9. Pokemon detail endpoint

The route is:

```js
app.get("/api/pokemon/:name", async (req, res) => {
    const pokemonName = req.params.name.toLowerCase();

    try {
        const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (!apiResponse.ok) {
            return res.status(404).json({
                error: "Pokemon not found",
            });
        }

        const pokemon = await apiResponse.json();

        return res.status(200).json({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
            sprite: pokemon.sprites.front_default,
            height: pokemon.height,
            weight: pokemon.weight,
            baseExperience: pokemon.base_experience,
            types: pokemon.types.map((typeInfo) => typeInfo.type.name),
            abilities: pokemon.abilities.map((abilityInfo) => ({
                name: abilityInfo.ability.name,
                isHidden: abilityInfo.is_hidden,
            })),
            stats: pokemon.stats.map((statInfo) => ({
                name: statInfo.stat.name,
                value: statInfo.base_stat,
                max: 255,
            })),
            moves: pokemon.moves.slice(0, 12).map((moveInfo) => moveInfo.move.name),
        });
    } catch {
        return res.status(500).json({
            error: "Failed to fetch Pokemon data",
        });
    }
});
```

## Purpose

This endpoint returns details for one Pokemon.

Example request:

```http
GET /api/pokemon/pikachu
```

It calls:

```text
https://pokeapi.co/api/v2/pokemon/pikachu
```

Then it returns a simplified object containing only the fields needed by the application.

## Route parameters

The route path is:

```js
"/api/pokemon/:name"
```

The `:name` part is a route parameter.

For this request:

```text
/api/pokemon/pikachu
```

Express sets:

```js
req.params.name === "pikachu"
```

Route parameters are useful when a URL identifies a specific resource.

In this case, the resource is one Pokemon.

## Normalizing input

The code uses:

```js
const pokemonName = req.params.name.toLowerCase();
```

This converts the name to lowercase before calling PokeAPI.

That makes requests more tolerant.

For example:

- `Pikachu`
- `PIKACHU`
- `pikachu`

all become:

```text
pikachu
```

## Handling not found

If PokeAPI does not return a successful response, the app returns:

```js
return res.status(404).json({
  error: "Pokemon not found",
});
```

Status `404` means the requested resource was not found.

For example:

```http
GET /api/pokemon/unknown
```

should return a not-found response.

## Formatting the response

The backend returns:

```js
{
  id: pokemon.id,
  name: pokemon.name,
  image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
  sprite: pokemon.sprites.front_default,
  height: pokemon.height,
  weight: pokemon.weight,
  baseExperience: pokemon.base_experience,
  types: pokemon.types.map((typeInfo) => typeInfo.type.name),
  abilities: pokemon.abilities.map((abilityInfo) => ({
    name: abilityInfo.ability.name,
    isHidden: abilityInfo.is_hidden,
  })),
  stats: pokemon.stats.map((statInfo) => ({
    name: statInfo.stat.name,
    value: statInfo.base_stat,
    max: 255,
  })),
  moves: pokemon.moves.slice(0, 12).map((moveInfo) => moveInfo.move.name),
}
```

This is a key learning point.

The backend is transforming a complex external API object into a simpler internal API contract.

The frontend does not need to know the full PokeAPI structure.

It can consume a cleaner response.

## Image fallback

The image field uses:

```js
pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default
```

This means:

- first, try to use the official artwork image;
- if it does not exist, use the default sprite.

The `||` operator is used as a fallback mechanism.

This is useful because some Pokemon or API entries may have missing images.

## Potential robustness issue

This line assumes that `pokemon.sprites.other["official-artwork"]` always exists:

```js
pokemon.sprites.other["official-artwork"].front_default
```

If `other` or `official-artwork` were missing, the server could throw an error.

A safer version would use optional chaining:

```js
pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default
```

This is not required for the current explanation, but it is an important JavaScript concept.

Optional chaining avoids errors when nested properties are missing.

## Mapping types

The API returns type objects.

The project extracts only the type names:

```js
types: pokemon.types.map((typeInfo) => typeInfo.type.name)
```

This converts a complex array into a simple array.

Example output:

```json
["electric"]
```

## Mapping abilities

The API returns ability objects.

The project transforms them into:

```js
abilities: pokemon.abilities.map((abilityInfo) => ({
  name: abilityInfo.ability.name,
  isHidden: abilityInfo.is_hidden,
}))
```

Example output:

```json
[
  {
    "name": "static",
    "isHidden": false
  }
]
```

This shows how to keep useful data while hiding unnecessary API nesting.

## Mapping stats

Stats are transformed into:

```js
stats: pokemon.stats.map((statInfo) => ({
  name: statInfo.stat.name,
  value: statInfo.base_stat,
  max: 255,
}))
```

Each stat includes:

- a stat name;
- the Pokemon's value;
- a maximum value used by the frontend to display progress bars or relative values.

## Limiting moves

The route uses:

```js
moves: pokemon.moves.slice(0, 12).map((moveInfo) => moveInfo.move.name)
```

PokeAPI can return many moves.

The app only keeps the first 12.

This avoids returning too much data to the frontend.

It also keeps the UI simpler.

---

# 10. Pokemon by type endpoint

The route is:

```js
app.get("/api/pokemon/type/:type", async (req, res) => {
    const pokemonType = req.params.type.toLowerCase();
    const limit = Number(req.query.limit || 24);
    const offset = Number(req.query.offset || 0);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: "Limit must be an integer between 1 and 100",
        });
    }

    if (!Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({
            error: "Offset must be a positive integer",
        });
    }

    try {
        const apiResponse = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType}`);

        if (!apiResponse.ok) {
            return res.status(404).json({
                error: "Pokemon type not found",
            });
        }

        const typeData = await apiResponse.json();

        const pokemonList = typeData.pokemon
            .slice(offset, offset + limit)
            .map((entry) => ({
                name: entry.pokemon.name,
                url: entry.pokemon.url,
            }));

        return res.status(200).json({
            type: pokemonType,
            count: typeData.pokemon.length,
            results: pokemonList,
            limit,
            offset,
            results: pokemonList
        });
    } catch {
        return res.status(500).json({
            error: "Failed to fetch Pokemon type data",
        });
    }
});
```

## Purpose

This endpoint returns Pokemon filtered by type.

Example request:

```http
GET /api/pokemon/type/fire
```

It calls:

```text
https://pokeapi.co/api/v2/type/fire
```

## Route parameter

The route parameter is:

```js
:type
```

For this URL:

```text
/api/pokemon/type/fire
```

Express sets:

```js
req.params.type === "fire"
```

The code normalizes it:

```js
const pokemonType = req.params.type.toLowerCase();
```

## Pagination with `slice`

The code paginates manually:

```js
const pokemonList = typeData.pokemon
  .slice(offset, offset + limit)
  .map((entry) => ({
    name: entry.pokemon.name,
    url: entry.pokemon.url,
  }));
```

This is different from the `/api/pokemon` endpoint.

For `/api/pokemon`, the pagination is passed directly to PokeAPI with query parameters.

For `/api/pokemon/type/:type`, the app receives all Pokemon for a type, then uses JavaScript `slice` to return only a portion.

## `slice(offset, offset + limit)`

`slice` returns a portion of an array.

Example:

```js
array.slice(0, 24)
```

returns the first 24 elements.

If `offset` is `24` and `limit` is `24`, then:

```js
array.slice(24, 48)
```

returns the next page.

## Code-quality issue: duplicate property

The response currently contains `results` twice:

```js
return res.status(200).json({
  type: pokemonType,
  count: typeData.pokemon.length,
  results: pokemonList,
  limit,
  offset,
  results: pokemonList
});
```

In JavaScript objects, duplicate keys are allowed syntactically, but the later value overwrites the earlier one.

So this is not usually a runtime error, but it is unnecessary and should be cleaned.

A cleaner version would contain `results` only once:

```js
return res.status(200).json({
  type: pokemonType,
  count: typeData.pokemon.length,
  limit,
  offset,
  results: pokemonList,
});
```

This is a good example of something a linter or code review can catch.

---

# 11. Starting the server only when needed

The end of `server.js` contains:

```js
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
```

This is an important Node.js pattern.

## `require.main === module`

This condition checks whether the file is being executed directly.

If the user runs:

```bash
node src/server.js
```

then the condition is true, and the server starts listening on a port.

But when tests import the app with:

```js
const app = require("../src/server");
```

then the condition is false, and the server does not start listening on a real port.

## Why this matters for tests

Tests need the Express app object.

They do not need to start a real HTTP server.

Supertest can call the app directly.

This makes tests:

- faster;
- simpler;
- less flaky;
- free from port conflicts.

## `module.exports = app`

This exports the Express app so tests can import it.

Without this line, the test files could not do:

```js
const app = require("../src/server");
```

This is a clean separation:

- `app` defines the application;
- `app.listen` starts the server;
- tests import the app without starting the server.

---

# 12. HTTP status codes used in the project

The project uses several HTTP status codes.

## `200 OK`

Used when the request succeeds.

Examples:

- `/health` works;
- Pokemon list is returned;
- Pokemon detail is returned;
- Pokemon type list is returned.

## `400 Bad Request`

Used when the client sends invalid input.

Example:

```text
/api/pokemon?limit=abc
```

or:

```text
/api/pokemon?limit=1000
```

The server rejects the request because the query parameter is invalid.

## `404 Not Found`

Used when a specific resource does not exist.

Examples:

- unknown Pokemon name;
- unknown Pokemon type.

## `500 Internal Server Error`

Used when the server fails unexpectedly.

Example:

- network call throws;
- unexpected runtime error happens.

## `502 Bad Gateway`

Used when an upstream service fails.

In this project, PokeAPI is the upstream service.

If the app calls PokeAPI and PokeAPI responds with an error for the Pokemon list endpoint, the app returns `502`.

---

# 13. Data transformation concepts

A major learning topic in this project is data transformation.

External APIs often return complex data.

The backend should often transform it into simpler data before sending it to the frontend.

## Why transform data?

Transforming data helps to:

- reduce frontend complexity;
- avoid exposing unnecessary fields;
- make the internal API stable;
- simplify tests;
- make the UI easier to build.

## Example: types

External shape from PokeAPI is nested.

The backend transforms it into:

```json
["electric"]
```

This is easier for the frontend to render.

## Example: abilities

The backend transforms ability data into:

```json
[
  {
    "name": "static",
    "isHidden": false
  }
]
```

This keeps only what the UI needs.

## Example: stats

The backend transforms stats into:

```json
[
  {
    "name": "hp",
    "value": 35,
    "max": 255
  }
]
```

This can be used by the frontend to display stat bars.

---

# 14. JavaScript concepts used in the backend

## `async` and `await`

Routes that call PokeAPI are asynchronous.

They use:

```js
async (req, res) => {
  const apiResponse = await fetch(...);
}
```

`async` allows the function to use `await`.

`await` waits for a Promise to resolve.

HTTP calls are asynchronous because the server must wait for another system to respond.

## Template literals

The code uses template literals:

```js
`https://pokeapi.co/api/v2/pokemon/${pokemonName}`
```

Template literals allow variables to be inserted into strings with `${...}`.

## Array `map`

`map` transforms each item of an array.

Example:

```js
pokemon.types.map((typeInfo) => typeInfo.type.name)
```

This converts an array of type objects into an array of type names.

## Array `slice`

`slice` returns part of an array.

Example:

```js
pokemon.moves.slice(0, 12)
```

This keeps only the first 12 moves.

## Logical OR fallback

The code uses:

```js
officialImage || fallbackImage
```

This means:

- use the official image if it exists;
- otherwise, use the fallback image.

## Object shorthand

The response uses:

```js
limit,
offset,
```

This is shorthand for:

```js
limit: limit,
offset: offset,
```

When the property name and variable name are identical, JavaScript allows the shorter syntax.

---

# 15. Frontend code concepts to revise

The exact frontend JavaScript files are not included in this source, but based on the project structure, the frontend likely uses separate scripts by page:

- `all.js` for a page listing many Pokemon;
- `pokedex.js` for the Pokedex page;
- `pokemon.js` for the Pokemon detail page;
- `search.js` for search behavior.

The concepts to revise are the same.

## DOM manipulation

Frontend JavaScript usually selects HTML elements, then changes their content.

Typical DOM methods include:

```js
document.querySelector(...)
document.getElementById(...)
element.textContent = ...
element.innerHTML = ...
element.appendChild(...)
```

The DOM is the browser's representation of the HTML page.

When JavaScript changes the DOM, the visible page changes.

## Fetching backend data

The frontend should call internal backend endpoints such as:

```text
/api/pokemon
/api/pokemon/pikachu
/api/pokemon/type/fire
```

This is cleaner than spreading direct PokeAPI calls throughout all frontend files.

## Rendering cards

A Pokedex frontend commonly renders Pokemon cards.

A card may include:

- Pokemon name;
- image;
- type badges;
- link to detail page.

The frontend receives JSON data from the backend, loops over it, and creates HTML for each Pokemon.

## Search logic

The search page likely reads a value from an input field.

Then it sends a request to the backend.

Example flow:

1. User types `pikachu`.
2. JavaScript reads the input value.
3. JavaScript calls `/api/pokemon/pikachu`.
4. The backend calls PokeAPI.
5. The backend returns formatted JSON.
6. The frontend renders the result.

## Image fallback in the browser

The project had image `404` issues.

A frontend can handle broken images by using an `onerror` fallback.

Conceptually:

- try to load the Pokemon image;
- if the image fails;
- replace it with a Pokeball placeholder.

This teaches graceful degradation.

The app still looks acceptable even when some images are missing.

---

# 16. ESLint learning notes

ESLint checks JavaScript statically.

That means it analyzes the code without running the full app.

## Example issue: undefined variable

The project encountered:

```text
'pokemonId' is not defined
```

This means the code used a variable that JavaScript could not find in the current scope.

Example of the bug pattern:

```js
console.log(pokemonId);
```

If `pokemonId` was never declared with `const`, `let`, or `var`, ESLint reports it.

## Why this matters

Undefined variables often cause runtime crashes.

Instead of discovering the bug in the browser, ESLint catches it earlier.

That is exactly why linting is useful in CI.

## Linting versus testing

Linting answers:

> Does the code contain suspicious or invalid patterns?

Testing answers:

> Does the code behave as expected?

A project should use both.

---

# 17. Tests overview

The project uses Jest and Supertest.

The tests import the Express app:

```js
const request = require("supertest");
const app = require("../src/server");
```

`request(app)` allows the test to call routes directly.

No real browser is needed.

No real listening port is needed.

---

# 18. Health test explained

The health test is:

```js
describe("GET /health", () => {
  it("should return service health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "pokedex-devops-deployment-lab",
    });
  });
});
```

## `describe`

`describe` groups related tests.

Here it groups tests for:

```text
GET /health
```

## `it`

`it` defines one test case.

The sentence should describe the expected behavior.

Here:

```text
should return service health status
```

## Calling the endpoint

The test calls:

```js
const response = await request(app).get("/health");
```

This sends a simulated GET request to the Express app.

## Assertions

The test checks:

```js
expect(response.status).toBe(200);
```

and:

```js
expect(response.body).toEqual({
  status: "ok",
  service: "pokedex-devops-deployment-lab",
});
```

The test validates both:

- the HTTP status;
- the JSON body.

This is a good pattern.

A route can return the right status but wrong data, or the right data with the wrong status.

Testing both is safer.

---

# 19. Pokemon detail test explained

The Pokemon detail test mocks `fetch`.

```js
beforeEach(() => {
    global.fetch = jest.fn();
});

AfterEach(() => {
    jest.restoreAllMocks();
});
```

Note: in the actual code, the hook is `afterEach`, with a lowercase `a`.

## Why mock `fetch`?

The route normally calls the real PokeAPI.

In a unit/integration-style test, relying on the real external API is risky because:

- the network may fail;
- PokeAPI may be slow;
- PokeAPI may change;
- tests become less deterministic;
- CI may fail for reasons unrelated to the application code.

Mocking `fetch` gives the test full control over the external response.

## Mocking a successful response

The test uses:

```js
global.fetch.mockResolvedValue({
  ok: true,
  json: async () => ({
    id: 25,
    name: "pikachu",
    ...
  }),
});
```

This means when the route calls `fetch`, it receives a fake successful response.

The fake response has:

- `ok: true`;
- a `json` function returning fake Pokemon data.

## Testing transformation logic

The test calls:

```js
const response = await request(app).get("/api/pokemon/pikachu");
```

Then it expects a formatted body.

This validates that the backend correctly transforms PokeAPI data into the app's internal response format.

The test checks fields such as:

- `id`;
- `name`;
- `image`;
- `sprite`;
- `height`;
- `weight`;
- `baseExperience`;
- `types`;
- `abilities`;
- `stats`;
- `moves`.

This test is valuable because data formatting is a common source of bugs.

---

# 20. Not-found test explained

The not-found test uses:

```js
global.fetch.mockResolvedValue({
    ok: false,
});

const response = await request(app).get("/api/pokemon/unknown");

expect(response.status).toBe(404);
expect(response.body).toEqual({
    error: "Pokemon not found",
});
```

This simulates PokeAPI returning a failed response.

The application should translate that upstream failure into a clean `404` response for the client.

This checks error handling.

Good tests should cover both:

- happy paths;
- failure paths.

---

# 21. Pokemon type test explained

The test for type filtering mocks a PokeAPI response containing fire-type Pokemon.

It then calls:

```js
const response = await request(app).get("/api/pokemon/type/fire");
```

The expected response is:

```json
{
  "type": "fire",
  "count": 2,
  "limit": 24,
  "offset": 0,
  "results": [
    {
      "name": "charmander",
      "url": "https://pokeapi.co/api/v2/pokemon/4/"
    },
    {
      "name": "vulpix",
      "url": "https://pokeapi.co/api/v2/pokemon/37/"
    }
  ]
}
```

This validates:

- route parameter parsing;
- default pagination values;
- array mapping;
- response formatting.

---

# 22. Pokemon list test explained

The list test mocks PokeAPI returning a paginated list.

It calls:

```js
const response = await request(app).get("/api/pokemon?limit=2&offset=0");
```

This validates:

- reading query parameters;
- converting query parameters to numbers;
- forwarding pagination values to the external API;
- returning `count`, `limit`, `offset`, and `results`;
- mapping the result list.

---

# 23. Test lifecycle hooks

The tests use:

```js
beforeEach(() => {
  global.fetch = jest.fn();
});

AfterEach(() => {
  jest.restoreAllMocks();
});
```

In the real code, this should be:

```js
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

## `beforeEach`

Runs before each test.

It prepares a fresh mock for `fetch`.

This prevents tests from sharing state.

## `afterEach`

Runs after each test.

It restores mocks and cleans up test state.

This reduces test pollution.

Test pollution happens when one test affects another test.

---

# 24. What this code teaches

This project teaches several practical coding concepts.

## Backend basics

- creating an Express app;
- defining routes;
- returning JSON;
- using HTTP status codes;
- serving static files.

## API integration

- calling an external API;
- using `fetch`;
- handling upstream errors;
- transforming external data.

## Input validation

- validating query parameters;
- rejecting invalid inputs with `400`;
- preventing excessive `limit` values.

## JavaScript data handling

- `map`;
- `slice`;
- object transformation;
- fallback values;
- async/await;
- route params;
- query params.

## Testing

- testing Express routes;
- using Supertest;
- using Jest assertions;
- mocking external calls;
- testing happy paths and error paths.

## Code quality

- linting with ESLint;
- catching undefined variables;
- identifying duplicate object keys;
- separating app definition from server startup.

---

# 25. Important code-quality observations

## 1. Duplicate `results` key

In `/api/pokemon/type/:type`, the JSON response includes `results` twice.

This should be cleaned.

It is not a major functional issue because the second value overwrites the first, but duplicate keys reduce clarity.

## 2. Offset error message could be more precise

The code allows `offset = 0`, but the error message says:

```text
Offset must be a positive integer
```

A more accurate message would be:

```text
Offset must be a non-negative integer
```

## 3. Image access could use optional chaining

This line could be safer:

```js
pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default
```

A safer version would use optional chaining.

This would protect the app if part of the nested object is missing.

## 4. Catch blocks hide error details

The code uses:

```js
catch {
  return res.status(500).json({ ... });
}
```

This is acceptable for a small learning project because it avoids exposing internal details to clients.

However, in a production system, the server should log the error internally while still returning a safe generic message to the client.

The client should not receive sensitive internal error details.

The server logs should retain enough information for debugging.

---

# 26. How to explain this project in an interview

A strong explanation would be:

> I built a small Node.js and Express Pokedex application to practice API consumption, backend routing, frontend rendering, testing, linting, and CI/CD foundations. The Express server serves static frontend files and exposes internal API endpoints that call PokeAPI. The backend validates query parameters, handles upstream failures, reshapes complex PokeAPI responses into simpler JSON contracts, and returns appropriate HTTP status codes. I also added Jest and Supertest tests to validate health checks, Pokemon details, type filtering, pagination, and error handling. ESLint is used to catch code-quality issues such as undefined variables before runtime.

Key points to mention:

- The backend acts as a small API layer between the browser and PokeAPI.
- The frontend does not need to understand the full PokeAPI data structure.
- Tests mock `fetch` to avoid relying on external network calls.
- Supertest allows route testing without starting a real server.
- The app separates server startup from app export to improve testability.
- ESLint catches errors before CI or runtime.

---

# 27. Revision questions

## Node.js and Express

1. What is the role of `src/server.js`?
2. Why does the project use Express?
3. What does `app.use(express.static(...))` do?
4. Why is `path.join` used?
5. What is the difference between `req.params` and `req.query`?
6. Why does the server export `app`?
7. Why does the server use `if (require.main === module)`?

## API and HTTP

1. What does `/health` validate?
2. Why does `/api/pokemon` use `limit` and `offset`?
3. Why are query parameters converted with `Number(...)`?
4. Why should invalid input return `400`?
5. Why does an unknown Pokemon return `404`?
6. When is `502` useful?
7. Why should external API responses be reshaped?

## JavaScript

1. What does `async/await` do?
2. What does `map` do?
3. What does `slice` do?
4. What does the `||` fallback operator do?
5. What problem does optional chaining solve?
6. Why can duplicate object keys be confusing?

## Testing

1. What is Jest used for?
2. What is Supertest used for?
3. Why do tests mock `fetch`?
4. What does `mockResolvedValue` do?
5. Why should tests cover failure paths?
6. Why is testing both status code and response body useful?
7. Why should mocks be restored after each test?

## Code quality

1. What does ESLint check?
2. Why is an undefined variable dangerous?
3. What is the difference between linting and testing?
4. Why should a CI pipeline run linting before tests?
5. What is one improvement to make in the current code?

---

# 28. Suggested NotebookLM audio prompt

Use this prompt with NotebookLM:

```text
Generate a structured learning audio from this source.

The audience is a developer learning Node.js, Express, API integration, JavaScript data transformation, testing with Jest and Supertest, and code quality with ESLint.

Focus on explaining the project as a learning journey.

Cover:
- the architecture of the Pokedex app;
- the role of package.json and npm scripts;
- how Express serves static files and API routes;
- how /health, /api/pokemon, /api/pokemon/:name, and /api/pokemon/type/:type work;
- the difference between route params and query params;
- input validation with limit and offset;
- calling PokeAPI with fetch;
- transforming external API data into simpler JSON;
- error handling and HTTP status codes;
- frontend concepts such as DOM manipulation, rendering cards, search, and image fallback;
- Jest and Supertest tests;
- mocking fetch;
- ESLint and the undefined variable issue;
- code-quality observations such as duplicate object keys and safer optional chaining.

Use a pedagogical tone.
Explain concepts clearly and progressively.
Include short examples when useful.
End with a recap and revision questions.
Do not focus on Git.
```

---

# 29. Final recap

This project is valuable because it connects several concepts that are often learned separately:

- Node.js runtime;
- Express routing;
- static file serving;
- external API consumption;
- JSON response design;
- frontend data rendering;
- input validation;
- HTTP status codes;
- Jest tests;
- Supertest route testing;
- fetch mocking;
- ESLint code quality;
- CI readiness.

The main idea to remember is:

> The Express backend is a controlled layer between the browser and PokeAPI. It validates inputs, calls the external service, transforms the data, handles errors, and returns predictable JSON that the frontend can render.
