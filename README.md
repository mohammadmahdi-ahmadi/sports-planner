# Sports Facility Planner

An image-led sports facility planner built with React, Vite, and a small Node.js API. Browse courts and training spaces, build a session plan, save a reservation, and manage facilities.

## Run locally

Install the existing dependencies, then start both the frontend and API:

```sh
npm install
npm run dev:all
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:3001`. To run them separately, use `npm run api` and `npm run dev` in two terminals.

## Accounts and CMS

Visitors can browse facilities and the Herat nearby finder without an account. Create an account or sign in to save reservations. Facility management is restricted to the administrator account.



This is a local classroom/demo login system. Sessions are held in memory and expire when the API restarts. Change the demo password and add persistent sessions, HTTPS, and production-grade account protections before public deployment.

## Find sports venues in Herat

Open **نزدیک من**, enter a Herat neighborhood/address, or allow browser location access. Address lookup uses OpenStreetMap Nominatim. Results are sorted by distance and include a Google Maps search link. Venue pins are approximate demo coordinates; confirm a venue's exact location before traveling. Venue names were sourced from public Herat sports listings.

Directory references for example venue names: [Cybo sports clubs in Herat](https://www.cybo.com/AF/herat/sports-clubs/) and [Cybo fitness centers in Herat](https://www.cybo.com/AF/herat/fitness-centers/).

The API creates `api/data/facilities.json`, `api/data/reservations.json`, `api/data/messages.json`, and `api/data/users.json` on first launch. These JSON files hold local demo data; do not use this prototype for real payments or sensitive customer data. Facility images are served from Unsplash and need an internet connection.

## Features

- Three-image hero slideshow with manual navigation and pause control.
- Sports imagery on category tiles, facility cards, details, About, and Contact.
- Facility search and filters, hourly planning, cost summary, and capacity checks.
- JSON-backed REST API for facility CRUD, reservations, and contact messages.
- Responsive layouts with reduced-motion support.

## API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | API status |
| GET | `/api/facilities?sport=&q=&sort=rate` | List/filter facilities |
| GET | `/api/facilities/:id` | Read one facility |
| POST | `/api/facilities` | Create facility |
| PUT | `/api/facilities/:id` | Update facility |
| DELETE | `/api/facilities/:id` | Delete facility |
| POST | `/api/reservations` | Validate and save a reservation |
| POST | `/api/messages` | Validate and save a contact message |

Production build: `npm run build`. Acceptance checks: `npm test`.
