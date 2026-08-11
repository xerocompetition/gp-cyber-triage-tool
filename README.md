# GP Cyber Incident Triage Tool

A browser based, rule driven cyber incident triage tool for NHS General
Practice staff, with a small Node/Express backend for logging completed
incidents.

## What's in here

```
public/                 front end (static, no build step)
  index.html
  css/styles.css
  js/data.js             categories, stages, app state, FLOWS registry
  js/categories/*.js      one file per incident category, each traces
                           back to a specific cited source (NCSC, ICO,
                           NHS DSPT — see the rule mapping tables)
  js/icons.js             hand drawn line icons, no external dependency
  js/app.js               render engine + backend calls

server/
  server.js               Express app: serves the front end, exposes the API
  store.js                JSON file backed data store (see note below)

data/
  incidents.json           created automatically on first save, gitignored
```

## Running it

You need [Node.js](https://nodejs.org) installed (18 or later is fine).
From the project folder:

```
npm install
npm start
```

Then open **http://localhost:3000** in a browser. Don't open `index.html`
directly by double clicking it, the "Save this log" and "View incident log"
features need the server running to talk to.

## What the backend actually does

Every category's rule table ends with the same instruction: record a
logged entry (what happened, who was told, when, what was decided). That
requirement traces to the NHS DSPT. Previously that was just text shown
on screen. Now, pressing "Save this log" on the result screen sends the
completed playbook to `POST /api/incidents`, and "View incident log" on
the home screen reads it back from `GET /api/incidents`.

## Honest limitation

The data store (`server/store.js`) is a single JSON file on disk, not a
real database. That's a deliberate simplification for a single practice
running this on one machine as a prototype, not something to run in
production or with more than one person writing to it at once. A real
deployment would need a proper database and, importantly, authentication
in front of the API, which this prototype does not implement.

## Status of the seven categories

4 of 7 have gone through full source verification and are implemented:
personal data breach, ransomware, phishing, business email compromise.
3 remain: account compromise, malware, lost or stolen device. These are
shown in the tool as "Pending verification" rather than guessed at.
