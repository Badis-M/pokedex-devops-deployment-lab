# Pokédex CI/CD Node.js — Learning Notes

## 1. Project Overview

This project is a small Node.js and frontend application used to learn how a web application is structured, tested, linted, and validated through a CI pipeline.

The application is a Pokédex: it displays Pokémon data, allows navigation between pages, retrieves data from a Pokémon API, and renders the result dynamically in the browser.

The project is intentionally simple enough to understand every moving part, but complete enough to introduce real development and DevOps habits:

- Node.js application structure
- Static frontend files served by a backend
- JavaScript DOM manipulation
- API calls with `fetch`
- Error handling for missing images or failed requests
- CSS styling and layout
- npm scripts
- automated tests
- ESLint validation
- GitHub Actions CI pipeline
- build and artifact concepts

This document is designed as a learning and revision guide. It explains not only what the project contains, but also why each part exists and what concepts it teaches.

---

## 2. Project Structure

Current structure:

```text
.
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   └── style.css
│   ├── index.html
│   ├── js
│   │   ├── all.js
│   │   ├── pokedex.js
│   │   ├── pokemon.js
│   │   └── search.js
│   └── pages
│       ├── about.html
│       ├── all.html
│       ├── pokedex.html
│       ├── pokemon.html
│       └── search.html
├── src
│   └── server.js
└── tests
    ├── health.test.js
    └── pokemon.test.js
```

### High-level roles

| Path | Role |
|---|---|
| `package.json` | Defines project metadata, npm scripts, dependencies, and dev tools. |
| `package-lock.json` | Locks exact dependency versions for reproducible installs. |
| `src/server.js` | Starts the Node.js server and serves the application. |
| `public/index.html` | Main entry page of the frontend. |
| `public/pages/*.html` | Separate frontend pages for specific views. |
| `public/js/*.js` | Client-side JavaScript split by feature or page. |
| `public/css/style.css` | Global styling for the frontend. |
| `tests/*.test.js` | Automated tests used to validate the application. |
| `node_modules/` | Locally installed dependencies. It should not be committed. |

---

## 3. Why This Project Is Useful for Learning

This project is useful because it connects several layers that are often learned separately:

1. **Application basics**  
   HTML pages, CSS styling, JavaScript behavior, and a Node.js server.

2. **Frontend logic**  
   Fetching data from an API, updating the DOM, handling loading states and errors.

3. **Backend basics**  
   A simple server that can expose health endpoints and serve static assets.

4. **Quality checks**  
   ESLint catches suspicious or invalid JavaScript before runtime.

5. **Automated tests**  
   Tests validate expected behavior and reduce regressions.

6. **CI/CD foundations**  
   GitHub Actions runs linting, tests, and build steps automatically.

The important point is not that the application is complex. The important point is that it introduces a professional workflow around a small codebase.

---

## 4. Node.js Role in the Project

Node.js allows JavaScript to run outside the browser.

In this project, Node.js is mainly used to:

- run the local application server
- serve static frontend files from `public/`
- expose simple backend routes such as a health check
- run development tooling through npm scripts
- run tests
- run linting
- participate in the CI pipeline

### Simple mental model

The browser handles:

- HTML rendering
- CSS styling
- client-side JavaScript
- API requests from the frontend
- DOM updates

Node.js handles:

- starting the web server
- serving frontend files
- exposing backend endpoints
- executing project scripts
- supporting tests and tooling

---

## 5. npm Concepts

npm is the package manager used with Node.js projects.

It handles:

- installing dependencies
- locking dependency versions
- running scripts
- managing project metadata

### `package.json`

`package.json` is the central configuration file of a Node.js project.

It usually contains:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "test": "...",
    "lint": "...",
    "build": "..."
  },
  "dependencies": {},
  "devDependencies": {}
}
```

The exact content depends on the project, but the concept is always the same: `package.json` tells npm how to operate the project.

### npm scripts

npm scripts are shortcuts for common commands.

Examples:

```bash
npm start
npm test
npm run lint
npm run build
```

Instead of remembering long commands, the project exposes standardized commands.

This is especially useful in CI because GitHub Actions can run the same commands as the developer locally.

### `dependencies` vs `devDependencies`

| Type | Purpose | Example |
|---|---|---|
| `dependencies` | Required for the application to run. | Express, runtime libraries. |
| `devDependencies` | Required only for development, testing, linting, or build steps. | ESLint, test framework. |

A useful rule:

- if the app needs it at runtime, it belongs in `dependencies`
- if only developers or CI need it, it belongs in `devDependencies`

### `package-lock.json`

`package-lock.json` records the exact dependency tree installed by npm.

This improves reproducibility.

Without it, two developers could install slightly different dependency versions. With it, npm can reproduce the same dependency versions more reliably.

### `node_modules/`

`node_modules/` contains installed packages.

It is generated by:

```bash
npm install
```

It should usually not be committed because:

- it can be very large
- it is generated automatically
- it is environment-specific
- dependencies are already described in `package.json` and `package-lock.json`

---

## 6. Application Pages

The application uses multiple HTML pages under `public/`.

### Main page

```text
public/index.html
```

Likely role:

- entry point of the application
- navigation to other pages
- general introduction to the Pokédex

### Additional pages

```text
public/pages/about.html
public/pages/all.html
public/pages/pokedex.html
public/pages/pokemon.html
public/pages/search.html
```

Possible roles:

| Page | Role |
|---|---|
| `about.html` | Explains the application or project. |
| `all.html` | Displays a list of Pokémon. |
| `pokedex.html` | Main Pokédex view. |
| `pokemon.html` | Displays details for one Pokémon. |
| `search.html` | Allows Pokémon search. |

Splitting pages like this makes the project easier to understand because each page has a specific responsibility.

---

## 7. Frontend JavaScript Files

The project separates JavaScript files by feature or page:

```text
public/js/all.js
public/js/pokedex.js
public/js/pokemon.js
public/js/search.js
```

This is a good learning structure because it avoids putting all browser logic in one large file.

### `all.js`

Likely responsibility:

- load multiple Pokémon
- render a list or grid
- display Pokémon cards
- handle image loading issues

### `pokedex.js`

Likely responsibility:

- manage the main Pokédex page
- fetch and display Pokémon data
- coordinate UI behavior for the Pokédex view

### `pokemon.js`

Likely responsibility:

- display a single Pokémon details page
- read an ID or name from the URL
- fetch the matching Pokémon
- render details such as name, type, image, stats, or abilities

### `search.js`

Likely responsibility:

- handle user input
- perform search logic
- call the Pokémon API
- render matching results
- display errors when no Pokémon is found

---

## 8. Core Frontend Concepts

### HTML

HTML defines the structure of the page.

Examples of what HTML provides:

- page title
- navigation links
- containers for cards
- forms or search inputs
- buttons
- empty placeholders where JavaScript will inject content

HTML is the skeleton of the page.

### CSS

CSS defines the visual style.

Examples:

- colors
- spacing
- typography
- card layout
- image sizes
- grid display
- responsive behavior

CSS is the presentation layer.

### JavaScript

JavaScript defines behavior.

Examples:

- fetch Pokémon data
- react to a search button click
- create DOM elements
- update the page dynamically
- handle missing images
- handle API errors

JavaScript is the interaction layer.

---

## 9. DOM Manipulation

The DOM is the browser representation of the HTML page.

JavaScript can read and modify the DOM.

Common operations:

```js
const container = document.querySelector("#container");
```

```js
container.innerHTML = "...";
```

```js
const card = document.createElement("div");
```

```js
button.addEventListener("click", handleClick);
```

### Why DOM manipulation matters

Without DOM manipulation, the page would stay static.

With DOM manipulation, the application can:

- display API results
- update content without reloading everything
- show errors
- react to user actions
- generate Pokémon cards dynamically

### Common DOM mistakes

| Mistake | Consequence |
|---|---|
| Wrong selector | JavaScript cannot find the element. |
| Script loaded before HTML exists | DOM elements may be `null`. |
| Typo in an ID or class | Rendering logic breaks. |
| Replacing too much `innerHTML` | Event listeners may be lost. |
| Missing error handling | User sees a broken or empty page. |

---

## 10. API Calls with `fetch`

The frontend uses API calls to retrieve Pokémon data.

A typical API request looks like this:

```js
const response = await fetch(url);
const data = await response.json();
```

### What happens step by step

1. JavaScript sends an HTTP request to an API URL.
2. The API responds with data.
3. The browser receives the response.
4. JavaScript converts the response to JSON.
5. The application uses the JSON data to update the page.

### Important concept: asynchronous code

API requests are not instant.

That is why JavaScript uses:

```js
async function loadPokemon() {
  const response = await fetch(url);
}
```

`async` means the function contains asynchronous work.

`await` means JavaScript waits for the result before continuing inside that function.

### Common `fetch` issues

| Issue | Explanation |
|---|---|
| Wrong URL | The API returns 404 or fails. |
| Network failure | The request does not complete. |
| Missing `await` | Code tries to use data before it exists. |
| API shape changed | The code reads properties that do not exist. |
| Missing error handling | The page breaks silently or displays nothing. |

---

## 11. Rendering Pokémon Cards

A common frontend pattern in this project is:

1. fetch data
2. transform data
3. generate HTML
4. inject HTML into the page

Example mental model:

```text
API data → JavaScript object → HTML card → rendered page
```

A Pokémon card may contain:

- Pokémon name
- Pokémon ID
- Pokémon image
- type
- link to details page

### Why rendering is separated from fetching

Good structure separates responsibilities:

- fetching gets the data
- rendering displays the data
- error handling manages failure cases

This makes the code easier to debug.

---

## 12. Pokémon Detail Page Logic

The detail page likely needs to know which Pokémon to display.

A common approach is to pass an identifier in the URL:

```text
pokemon.html?id=25
```

Then JavaScript can read the URL parameter and fetch the correct Pokémon.

Conceptually:

```text
URL parameter → Pokémon ID → API request → render details
```

### Example concepts involved

- query parameters
- `URLSearchParams`
- input validation
- API request by ID or name
- rendering a detail view
- handling invalid IDs

### Why validation matters

The browser URL can be edited by the user.

So the code should not assume that the ID is always valid.

Possible invalid cases:

- missing ID
- empty ID
- non-numeric ID
- ID that does not exist
- API returns 404

Good behavior:

- show a clear error message
- do not crash the page
- avoid undefined variable errors

---

## 13. Search Logic

Search functionality usually follows this flow:

```text
User input → sanitize/normalize → API request → render result → handle failure
```

### User input

The user enters a Pokémon name or ID.

The code should usually normalize it:

- trim spaces
- convert to lowercase if the API expects lowercase
- check empty input

Example behavior:

```text
" Pikachu " → "pikachu"
```

### Search risks

| Risk | Example |
|---|---|
| Empty input | User clicks search without typing. |
| Invalid name | API returns not found. |
| Typo | User searches `pikach`. |
| Network failure | API cannot be reached. |
| Unexpected API response | Code tries to access missing fields. |

### Good search UX

A good search page should:

- tell the user if input is empty
- show a loading state if needed
- display the result clearly
- show a friendly error if not found
- avoid crashing the page

---

## 14. Image Handling and 404 Errors

One issue encountered in the project was broken Pokémon images returning 404.

A 404 means:

```text
The browser requested an image URL, but the server/API did not find an image at that URL.
```

This can happen when:

- the image URL is wrong
- the Pokémon has no image in that source
- the ID does not match the image path
- the API response has missing image data
- the image host changed its structure

### Placeholder strategy

Instead of showing broken images, the project can use a fallback placeholder, such as a Pokéball image.

The idea:

```text
If Pokémon image fails → show Pokéball placeholder
```

This improves the UI because broken image icons look unfinished.

### Why a placeholder is better

| Without placeholder | With placeholder |
|---|---|
| Broken image icon | Clean UI |
| Looks like a bug | Looks intentional |
| Inconsistent cards | Stable layout |
| Poor user experience | Better fallback behavior |

### CSS weight concern

A good decision was to avoid making the CSS too heavy.

If the placeholder can be handled with a simple image fallback or small reusable CSS class, it is better than adding large amounts of styling for a minor issue.

---

## 15. Error Handling Concepts

Error handling is one of the most important learning points of this project.

Frontend code should assume that things can fail:

- API request fails
- image is missing
- DOM element is not found
- user input is invalid
- JSON data is incomplete
- a variable is not defined

### Good error handling behavior

The application should:

- fail visibly for the developer
- fail gracefully for the user
- avoid blank screens
- show clear messages
- keep layout stable

### Developer error vs user-facing error

| Type | Example | Handling |
|---|---|---|
| Developer error | Undefined variable | Fix code, caught by ESLint/tests. |
| User-facing error | Pokémon not found | Show a message in the UI. |
| Network error | API unavailable | Show fallback message. |
| Asset error | Image 404 | Use placeholder image. |

---

## 16. The `pokemonId is not defined` ESLint Error

The project encountered this error:

```text
public/js/pokemon.js
75:57  error  'pokemonId' is not defined  no-undef
```

This means the code used a variable named `pokemonId`, but JavaScript could not find where it was declared.

### What ESLint detected

ESLint detected a reference to a variable that does not exist in the current scope.

Example:

```js
console.log(pokemonId);
```

If `pokemonId` was never declared with `const`, `let`, or `var`, this is unsafe.

### Why this matters

Without ESLint, this kind of error might only appear when the browser reaches that line.

With ESLint, the error is detected before running or deploying the app.

This is the purpose of linting: catch obvious code problems early.

### Scope concept

JavaScript variables only exist in the scope where they are declared.

Example:

```js
function loadPokemon() {
  const pokemonId = 25;
}

console.log(pokemonId); // invalid outside the function
```

Here, `pokemonId` exists only inside `loadPokemon()`.

Trying to use it outside causes a scope error.

### Fixing this type of issue

The fix is not to silence ESLint.

The fix is to make the data flow explicit:

- declare the variable before using it
- pass it as a function parameter
- keep it in the correct scope
- avoid relying on implicit globals

---

## 17. ESLint

ESLint is a static analysis tool for JavaScript.

It reads the code without executing it and reports issues.

It can detect:

- undefined variables
- unused variables
- suspicious syntax
- style inconsistencies
- potentially unsafe patterns

### Linting vs testing

| Tool | Checks | Example |
|---|---|---|
| ESLint | Code quality and static mistakes | Undefined variable. |
| Tests | Runtime behavior | Health endpoint returns 200. |

Both are useful because they catch different classes of problems.

### Why ESLint belongs in CI

If linting runs only locally, developers may forget it.

If linting runs in CI, every pull request or push is checked consistently.

A failing lint step prevents broken or suspicious code from being accepted.

---

## 18. Automated Tests

The project contains:

```text
tests/health.test.js
tests/pokemon.test.js
```

Tests are automated checks that validate expected behavior.

### `health.test.js`

Likely purpose:

- verify that the application server is reachable
- check that a health endpoint responds correctly
- confirm the app can start and respond

A health check is useful in real systems because it tells whether the application is alive.

Typical expected behavior:

```text
GET /health → HTTP 200
```

### `pokemon.test.js`

Likely purpose:

- verify Pokémon-related behavior
- validate a route or function that deals with Pokémon data
- ensure expected Pokémon data is returned or handled correctly

Depending on implementation, this test may validate:

- API endpoint behavior
- parsing logic
- response status
- expected JSON shape
- error handling

### What tests teach in this project

Tests teach that code should not only work manually in the browser.

It should also be validated automatically by repeatable commands.

That matters because CI can run tests on every change.

---

## 19. Test Types in This Project

This project probably focuses on basic automated tests rather than advanced test architecture.

Useful categories:

| Test type | Purpose | Example |
|---|---|---|
| Health test | Check app availability | Server responds with 200. |
| Route test | Check endpoint behavior | `/api/pokemon/:id` returns expected data. |
| Logic test | Check pure functions | Format Pokémon names correctly. |
| Error test | Check failure behavior | Invalid Pokémon returns 404 or error message. |

For a learning project, the most important thing is not test volume. It is understanding what each test protects.

---

## 20. Running the Project Locally

Typical workflow:

```bash
npm install
npm start
```

Then open the local application in the browser.

The exact port depends on `src/server.js` or the project configuration.

Common local validation steps:

```bash
npm run lint
npm test
npm run build
```

### Why local validation matters

Before pushing code, a developer should verify the same checks that CI will run.

Local checks reduce failed CI runs and make debugging faster.

Recommended local loop:

```text
change code → run lint → run tests → open browser → validate manually → push
```

---

## 21. Build Concept

A build step prepares the project for delivery.

In this project, the build may be simple because the app is mostly static frontend plus Node.js.

A build step can mean:

- copy files to a `dist/` directory
- validate that required files exist
- bundle assets
- prepare deployable output
- generate an artifact for CI

### Build vs run

| Command | Purpose |
|---|---|
| `npm start` | Runs the application. |
| `npm test` | Runs automated tests. |
| `npm run lint` | Checks code quality. |
| `npm run build` | Prepares output for delivery. |

### Artifact concept

An artifact is an output produced by a build.

Examples:

- `dist/` folder
- packaged application
- generated frontend files
- test reports

In CI, artifacts can be uploaded temporarily so they can be downloaded after the pipeline run.

If no artifact upload step exists, the build output exists only during the CI job and is discarded when the runner is cleaned up.

---

## 22. GitHub Actions CI Pipeline

The project uses a CI pipeline that runs checks automatically.

A typical CI pipeline for this project is:

```text
checkout code → install dependencies → lint → test → build
```

### Why CI matters

CI ensures that the project is validated the same way every time.

Instead of relying on memory, the pipeline enforces the quality gates.

### Common GitHub Actions steps

| Step | Purpose |
|---|---|
| Checkout | Download the repository into the runner. |
| Setup Node.js | Install the correct Node.js version. |
| npm install / npm ci | Install dependencies. |
| npm run lint | Run ESLint. |
| npm test | Run automated tests. |
| npm run build | Validate/build application output. |

### `npm ci` vs `npm install`

In CI, `npm ci` is often preferred.

| Command | Best use | Behavior |
|---|---|---|
| `npm install` | Local development | May update lockfile. |
| `npm ci` | CI environments | Installs exactly from lockfile and fails if lockfile is inconsistent. |

This improves reproducibility in automated pipelines.

---

## 23. CI Failure Examples

### Lint failure

Example:

```text
'pokemonId' is not defined  no-undef
```

Meaning:

- CI ran ESLint
- ESLint detected invalid JavaScript
- the pipeline failed before build/deploy

### Test failure

Meaning:

- code did not behave as expected
- a route may return the wrong status
- the server may not start
- Pokémon logic may be broken

### Build failure

Meaning:

- build command failed
- required file may be missing
- script may be misconfigured
- output generation failed

### Why failure is good

A failed CI pipeline is not a disaster.

It is a safety mechanism.

It prevents problematic changes from being accepted silently.

---

## 24. CSS Organization

The project currently has one main CSS file:

```text
public/css/style.css
```

This is appropriate for a small project.

### What CSS should handle

- page layout
- spacing
- typography
- Pokémon cards
- buttons
- inputs
- images
- responsive behavior
- error messages

### Avoiding CSS bloat

A useful principle:

```text
Add reusable classes, not one-off styling for every small case.
```

For example, instead of creating many image-specific styles, use a generic class such as:

```text
pokemon-card-image
placeholder-image
error-message
```

### CSS risks

| Risk | Consequence |
|---|---|
| Too many one-off classes | CSS becomes hard to maintain. |
| Unclear naming | Hard to understand what a class is for. |
| Over-specific selectors | Difficult to override styles later. |
| No responsive rules | Poor mobile display. |
| Fixed image sizes without fallback | Broken layout when images fail. |

---

## 25. Code Organization Principles

This project introduces basic separation of concerns.

### Good separation

| Concern | File type |
|---|---|
| Structure | HTML |
| Styling | CSS |
| Behavior | JavaScript |
| Server | Node.js |
| Validation | Tests |
| Quality | ESLint |
| Automation | GitHub Actions |

### Why this matters

When responsibilities are separated, debugging is easier.

If the problem is visual, check CSS.  
If the problem is data loading, check JavaScript and API calls.  
If the problem is app startup, check Node.js server.  
If the problem appears only in CI, check scripts, versions, and pipeline configuration.

---

## 26. Debugging Method Used in the Project

A clean debugging process is:

1. Reproduce the issue.
2. Read the error message carefully.
3. Identify the failing layer.
4. Make the smallest safe fix.
5. Run lint/tests again.
6. Validate manually in the browser.

### Example: broken images

Layer:

```text
Frontend asset/API rendering
```

Likely checks:

- inspect the image URL in browser devtools
- confirm whether the API returns an image
- check if the URL returns 404
- add a fallback placeholder

### Example: ESLint undefined variable

Layer:

```text
JavaScript code quality/static analysis
```

Likely checks:

- find where the variable is used
- find where it should be declared
- check scope
- pass the value explicitly if needed

---

## 27. Common Troubleshooting Checklist

### App does not start

Check:

```bash
npm install
npm start
```

Then verify:

- Node.js is installed
- dependencies are installed
- `src/server.js` exists
- port is not already in use
- npm script points to the correct file

### Page loads but no Pokémon appears

Check:

- browser console errors
- network tab API calls
- script path in HTML
- DOM selectors
- API response shape
- rendering function

### Search does not work

Check:

- input selector
- event listener
- form default submission behavior
- normalized search value
- API URL
- error handling

### Images are broken

Check:

- image URL
- API image field
- browser network 404
- placeholder fallback
- CSS image sizing

### CI fails on lint

Check:

```bash
npm run lint
```

Then fix the exact reported file and line.

### CI fails on tests

Check:

```bash
npm test
```

Then inspect:

- failing test name
- expected result
- actual result
- server startup logic
- route behavior

---

## 28. Security and Reliability Notes

Even for a small learning project, some security and reliability habits matter.

### Do not commit secrets

This project should not contain:

- API keys
- tokens
- credentials
- `.env` files with secrets

The Pokémon API is public, so it should not require secrets.

### Validate user input

Search input should be validated before use.

Basic checks:

- empty string
- excessive spaces
- unexpected characters if relevant
- invalid Pokémon name or ID

### Avoid silent failures

Do not write code that hides errors completely.

Bad pattern:

```js
try {
  // risky code
} catch (error) {}
```

Better pattern:

- log useful developer information
- display a safe user-facing message
- keep the UI stable

---

## 29. What This Project Teaches About CI/CD

This project teaches the CI part more than the CD part.

### CI: Continuous Integration

CI means validating changes automatically when code changes.

In this project, CI likely includes:

- installing dependencies
- linting code
- running tests
- building the project

### CD: Continuous Delivery or Deployment

CD would mean preparing or deploying the application automatically.

This project can later evolve toward CD by adding:

- deployment to GitHub Pages, Render, Railway, Fly.io, or a small cloud instance
- Docker image build
- Docker image push to a registry
- automated deployment after successful CI

For now, the foundation is correct: first validate code automatically, then deploy only after quality checks pass.

---

## 30. Interview Talking Points

A concise way to explain the project:

> I built a small Node.js Pokédex application to practice frontend JavaScript, API calls, testing, linting, and CI automation. The app serves static pages, retrieves Pokémon data from an API, renders dynamic content in the browser, handles broken images with a fallback strategy, and validates code quality through ESLint and automated tests in GitHub Actions.

### Technical points to mention

- Node.js server serves the application.
- Frontend is split into multiple pages and JS files.
- JavaScript uses API calls and DOM manipulation.
- ESLint catches code issues such as undefined variables.
- Tests validate basic app behavior.
- GitHub Actions runs lint, test, and build automatically.
- The project is intentionally small but uses professional workflow habits.

### Good interview angle

This project is not about building a complex product.

It is about demonstrating:

- clean structure
- understanding of code flow
- debugging ability
- automated validation
- CI/CD foundations
- ability to explain technical decisions

---

## 31. Possible Improvements

Future improvements could include:

### Application improvements

- loading state while fetching Pokémon
- better error UI
- pagination for Pokémon lists
- type filters
- favorite Pokémon feature
- more detailed Pokémon stats
- improved responsive design

### Code improvements

- shared utility functions
- avoid duplicated API logic
- central API client file
- stronger input validation
- better separation between data fetching and rendering

### Testing improvements

- more route tests
- tests for invalid Pokémon
- tests for search logic
- tests for API error behavior
- frontend unit tests if the project evolves

### CI/CD improvements

- cache npm dependencies
- upload build artifacts
- add security audit step
- add Docker build step
- deploy automatically after successful CI

---

## 32. Key Concepts to Remember

### npm

npm manages dependencies and runs scripts.

### `package.json`

Defines how the project is run, tested, linted, and built.

### `package-lock.json`

Locks exact dependency versions.

### Node.js

Runs JavaScript outside the browser and starts the server.

### HTML

Defines page structure.

### CSS

Defines visual presentation.

### JavaScript

Defines browser behavior and dynamic rendering.

### DOM

The browser representation of the HTML page that JavaScript can modify.

### `fetch`

Used to retrieve data from APIs.

### API

A service that returns data to the application.

### ESLint

Detects JavaScript problems before runtime.

### Tests

Validate expected behavior automatically.

### CI

Runs checks automatically on code changes.

### Artifact

A generated output from a build process.

---

## 33. Revision Questions

Use these questions to test understanding.

### Node.js and npm

1. What is the role of `package.json`?
2. Why should `node_modules/` not be committed?
3. What is the difference between `npm install` and `npm ci`?
4. Why does CI use npm scripts?

### Frontend

1. What is the role of HTML, CSS, and JavaScript?
2. What is the DOM?
3. Why do we use `fetch`?
4. What can cause an image 404?
5. Why is a placeholder image useful?

### JavaScript

1. What does `async/await` solve?
2. What is a variable scope issue?
3. Why did ESLint complain about `pokemonId`?
4. Why is user input validation important?

### Tests and CI

1. What does a health test validate?
2. What is the difference between linting and testing?
3. Why should linting run in CI?
4. What happens to build files if CI does not upload artifacts?
5. Why is a failed pipeline useful?

---

## 34. Final Learning Summary

This project is a good learning project because it combines code and DevOps fundamentals in a concrete way.

On the coding side, it teaches:

- page structure
- styling
- JavaScript behavior
- API calls
- DOM updates
- error handling
- variable scope

On the tooling side, it teaches:

- npm scripts
- dependency management
- ESLint
- automated tests
- build steps

On the DevOps side, it teaches:

- CI pipeline structure
- automated quality gates
- artifact concept
- repeatable validation
- troubleshooting through pipeline feedback

The main value of the project is that it creates a controlled environment to practice professional development habits on a small and understandable application.
