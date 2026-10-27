# ResolveIQ

A single-file, local-first IT support companion: guided troubleshooting playbooks, command reference, knowledge base, ticket writer, ticket simulator, labs, skills matrix, career pathways, interview practice and personal playbooks.

## Run it

No build step or dependencies. Open `index.html` in a browser, or serve it:

    python3 -m http.server 8000

Then visit http://localhost:8000.

To host on GitHub Pages: Settings, Pages, deploy from the `main` branch root.

## Data and privacy

Preferences, saved sessions, playbooks, lab and skills progress are stored in your browser's local storage (key `riq`). Nothing is sent anywhere. Do not store passwords, tokens or personal data.

## Important limitations

- All command output, labs and scenarios are simulated. Nothing runs on your device.
- The optional AI assistant relies on the `window.claude` runtime provided when the page is published as a Claude artifact. In a standalone repo it shows "not available" and everything else still works. To use AI outside Claude, add a server-side API route, keep the key in an environment variable, and replace `aiRun()`.
- Content is compact: 19 playbooks, 10 articles, 4 labs, 4 scenarios, 8 interview questions. Verify technical details and certification information against official vendor sources.

## Create the repo

    git init
    git add .
    git commit -m "Initial commit: ResolveIQ"
    git branch -M main
    git remote add origin https://github.com/<you>/resolveiq.git
    git push -u origin main
