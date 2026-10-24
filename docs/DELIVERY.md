# Delivery notes

> Check each section against your course's shared guide; I only had the project brief.

## 1. API notes (planned REST API; prototype uses local sample data)

| Method | Path | Purpose |
|---|---|---|
| GET | /api/facilities?sport=&q=&sort=rate | list, search, filter, sort |
| GET | /api/facilities/:id | facility details |
| POST | /api/facilities | add (validate rate > 0, whole capacity, unique slotIds) |
| PUT | /api/facilities/:id | edit |
| DELETE | /api/facilities/:id | delete |
| POST | /api/reservations | sample booking (reject participants > capacity) |

Record: `{ id, name, sportCategory, hourlyRateAFN, capacity, slotIds, description }`

## 2. Foundation evidence
- Screenshots: each page on desktop and phone width
- Output of `npm test` (acceptance checks)
- Screenshot of the sample data file and of the component folder
- Short list of requirements → file that implements it

## 3. Responsive QA (test at 360, 768, 1280 px)

| Page | 360 | 768 | 1280 | Notes |
|---|---|---|---|---|
| Home | | | | |
| Facilities (filters wrap, cards in 1–3 columns) | | | | |
| Facility details | | | | |
| Reservation Plan | | | | |
| Manage Facilities (table scrolls sideways) | | | | |
| About / Contact | | | | |

## 4. Git history (suggested small commits)
1. `chore: create Vite React project`
2. `feat: sample data and planLogic with tests`
3. `feat: facilities page, filters, cards`
4. `feat: facility details and HourSlotPicker`
5. `feat: reservation summary and total cost`
6. `feat: manage facilities with validation`
7. `feat: booking form and preview`
8. `style: responsive layout`
9. `docs: README and delivery notes`

## 5. Two deployments
- Netlify: connect the GitHub repo, build `npm run build`, publish `dist`
- Vercel or GitHub Pages as the second one (the build uses `base: "./"` and HashRouter, so both work)
- Put both links in the README and portfolio

## 6. Portfolio
Project title, 2-sentence summary, tech list, screenshots, both live links, repo link, what you learned.

## 7. Ten-minute presentation
- 0:00 Problem and goal (1 min)
- 1:00 Live demo: search, filter, pick hours, cost, remove, reset (3 min)
- 4:00 Code tour: App.jsx state, planLogic.js, one component (3 min)
- 7:00 Validation and acceptance checks, run `npm test` (1.5 min)
- 8:30 Responsive QA, Git history, deployments (1 min)
- 9:30 What I learned and next steps (0.5 min)

## Likely questions
- Why is state in App.jsx? So all pages share the same plan.
- Why planLogic.js? Rules are plain functions, easy to test without React.
- How is the four-hour limit enforced? `getHours` + check in `addSlots`.
- How is a duplicate found? `hasSlot` uses `plan.some(...)`.
- Why `key` on FacilityForm? Resets the form when the edited facility changes.
