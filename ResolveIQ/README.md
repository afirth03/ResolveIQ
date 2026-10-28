# ResolveIQ

A single-file, local-first IT support companion: guided troubleshooting playbooks, command reference, knowledge base, ticket writer, ticket simulator, labs, skills matrix, career pathways, interview practice and personal playbooks.

## Run it

No build step or dependencies. Open `index.html` in a browser (or use the VS Code Live Server extension), or serve it:

    python3 -m http.server 8000

Then visit http://localhost:8000.

To host on GitHub Pages: Settings, Pages, deploy from the `main` branch root.

## Data and privacy

Preferences, saved sessions, playbooks, lab and skills progress are stored in your browser's local storage (key `riq`). Nothing is sent anywhere. Do not store passwords, tokens or personal data.

## Important limitations

- All command output, labs and scenarios are simulated. Nothing runs on your device.
- The optional AI assistant relies on the `window.claude` runtime provided when the page is published as a Claude artifact. In a standalone repo it shows "not available" and everything else still works. To use AI outside Claude, add a server-side API route, keep the key in an environment variable, and replace `aiRun()`.
- Content is compact: 21 playbooks, 10 articles, 4 labs, 4 scenarios, 8 interview questions. Verify technical details and certification information against official vendor sources.

## Create the repo

    git init
    git add .
    git commit -m "Initial commit: ResolveIQ"
    git branch -M main
    git remote add origin https://github.com/<you>/resolveiq.git
    git push -u origin main

## Project structure: where to make changes

    index.html                    Page shell and script load order
    css/styles.css                All styles. Colour and font tokens are the variables on :root
    js/core.js                    Helpers, the DB object, localStorage, theme
    js/content/playbooks.js       Troubleshooting playbooks (add or edit decision trees here)
    js/content/commands.js        Command reference entries
    js/content/learning.js        Articles, labs, simulator scenarios, skills, careers, interview questions
    js/features/ai.js             Optional AI assistant
    js/features/my-playbooks.js   Personal playbooks and the Progress page
    js/features/learning.js       Knowledge base, labs, simulator, skills, career and interview pages
    js/views/home.js              Home page
    js/views/troubleshoot.js      Diagnostic workspace and playbook engine
    js/views/tools.js             Command explorer and ticket writer
    js/views/settings.js          Settings and data import/export
    js/app.js                     Sidebar, routing, render(), event wiring (loaded last)

Common tasks:

- **Add a playbook:** add an entry in `js/content/playbooks.js` using the `Q`, `O` and `R` helpers, then add its id to `HC` in `js/views/home.js`.
- **Add a command, article, lab or scenario:** add a row to the matching array in `js/content/`.
- **Add a page:** add it to `NAV` and `render()` in `js/app.js`, and write a view function in a `js/views/` or `js/features/` file.
- **Change colours:** edit the variables at the top of `css/styles.css`.

The scripts are plain (non-module) scripts that share globals, so the load order in `index.html` matters.
