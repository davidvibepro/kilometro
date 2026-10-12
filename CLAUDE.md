# Kilometro: Project Rules for Claude Code

This file is the single source of truth for this project. It comes from our CTADWEBL proposal (Proposal 2: Kilometro) and the CTADWEBL Final Project instructions and rubric. Read all of it before writing any code.

The group of four shares **one laptop**. Every checkpoint in §12 has an **owner**, taken from the proposal's work assignment. The owner sits at the laptop for that checkpoint, reads your explanation, and commits it under their own GitHub identity (§1).

---

## 0. How you must work (non-negotiable)

1. **Build only what is in this file.** Do not add collections, fields, endpoints, pages or features that are not listed. Do not add authentication, payments, deployment or file uploads.
2. **Never fabricate.** Do not invent requirements, numbers, rules, facts, sample claims, testimonials or statistics. Use names exactly as written: collections, fields, enum values, routes and pages.
3. **Missing detail?** Check §9 Decisions first. If it is still not covered, STOP and ask David. Do not guess.
4. **Work one phase at a time** (§12), and only the phase named in David's prompt.
5. **CHECKPOINTS.** At every checkpoint, stop and print:
   - (a) **Owner: <name>**, taken from §12
   - (b) the files you created or changed
   - (c) a suggested commit message (style: `feat(server): add Vehicle model with validation`)
   - (d) a short plain-English explanation of what the code does and why, written for the owner
   - (e) 3 questions an instructor might ask the owner about this code in the defense, with short answers

   Then say: "<Owner>, read the explanation, then type `commit`." Wait for that.
6. **Git (nobody in the group knows Git; you run the commands).**
   - When the user types `commit`:
     1. Run `git add` on exactly that checkpoint's files.
     2. Commit **as the checkpoint's owner**, using their name and email from the §1 identity table, for that one commit only:
        ```
        git -c user.name="<Name>" -c user.email="<Email>" commit -m "<message>"
        ```
     3. Show the output, including the author line from `git log -1 --format="%an <%ae>"`.
   - If the owner's email in §1 is still a placeholder, STOP and ask for it. Do not commit.
   - Never run `git config` to change anything. Never commit a checkpoint under anyone other than its §12 owner.
   - When the user types `push`, run `git push`. If the push asks for a login, tell David to complete the browser sign-in window, then retry.
   - Never run `git reset --hard`, `git push --force`, `git rebase`, or delete branches.
   - If any git command fails, stop and explain the error in plain words with the exact fix.
7. **Secrets:**
   - The real `MONGO_URI` is given to you **only in David's chat prompt**, never in this file. Write it **only** into `server/.env`, and only after:
     - `.gitignore` contains `.env`, and
     - `git check-ignore server/.env` prints `server/.env`.
   - Never put it in any other file, commit message, log, README or `.env.example`, and never echo it back.
   - `.env.example` files hold placeholders only.
   - Before every commit, confirm `.env` is not staged (`git status`).
8. **Packages:** use only the packages in §2. Ask before installing anything else.
9. **Verify before saying a checkpoint is done:**
   - Server: it starts, and you `curl` every endpoint you wrote, including a success case, a 400 case and a 404 case where they apply.
   - Client: `npm run build` and `npm run lint` pass with no errors.
10. **Readable code:** a 3rd-year IT student must be able to explain every line. Use plain names and short functions, and add comments only where a processing rule is non-obvious.

---

## 1. The project

**Kilometro: a Vehicle Maintenance and Fuel Tracker.**

**Problem:** Most vehicle owners keep track of their change oil with a small sticker on the windshield, if at all. Other services such as tire rotation, brake checks and air filter replacement are easy to forget until something breaks, and a missed service usually turns into a more expensive repair. Fuel and repair receipts are scattered, so owners cannot tell how much a vehicle really costs to run. The problem grows for a small business with several delivery motorcycles.

**What it does:**
- Records each vehicle's services, fuel fill-ups and other expenses.
- Works out from the odometer readings when each service is next due, by distance or by time, whichever comes first.
- Computes fuel efficiency, cost per kilometer and the month the vehicle's registration is due for renewal.

**Target users:**
- Vehicle owners who want to keep one or more personal vehicles in good condition.
- Small fleet managers, for example a small delivery business with several motorcycles, who need to see which vehicles are due for service and which ones cost the most to run.

**Group members and Git identities.** Each email must be one listed in that member's GitHub → Settings → Emails, so commits show on their profile. David fills this table in before Phase 1.

| Member | Short name | Git name | Git email |
|---|---|---|---|
| Sabaten, David Joshua L. | David | David Joshua L. Sabaten | davidjoshuasabaten@gmail.com |
| Cabrera, Kurt Sebastien D. | Kurt Sebastien | Kurt Sebastien D. Cabrera | sebastiencabs102226@gmail.com |
| Muldong, Kurt Wayne M. | Kurt Wayne | Kurt Wayne M. Muldong | kwmuldong19@gmail.com |
| Quintanilla, Dirk Dawkins D. | Dirk | Dirk Dawkins D. Quintanilla | dirkquintanilla3@gmail.com |

**Work assignment** (from the proposal; §12 follows it):

| Member | Feature owned | Backend | Frontend |
|---|---|---|---|
| David | Project setup and service schedule | Express app setup, middleware, error handler, database connection, seed script, serviceTypes and serviceLogs, schedule and reminders logic | Vite project, Tailwind theme, router, layout, axios instance, service log pages, reminders page |
| Kurt Sebastien | Vehicles and owners | vehicles and owners models and CRUD, vehicle status rules, registration month | Vehicle list, details and form, owner pages |
| Kurt Wayne | Fuel tracking | fuelLogs model and CRUD, odometer rule, fuel efficiency | Landing page, fuel log pages, service types page |
| Dirk | Expenses and reports | expenses model and CRUD, cost report, fleet statistics | Expenses page, dashboard, reports page, README and API table |

---

## 2. Stack and folder structure

**Required technologies:**
- React (Vite) with TypeScript
- Tailwind CSS (v4 with the `@tailwindcss/vite` plugin; theme in CSS with `@theme`)
- React Router
- React Hook Form, Zod and `@hookform/resolvers`
- axios
- Node.js and Express
- MongoDB Atlas and Mongoose
- `cors` and `dotenv`
- Git and GitHub

**One repository, two top-level folders:**

```
kilometro/
  CLAUDE.md
  README.md
  .gitignore                 # node_modules/, .env, dist/  (keep !.env.example)
  docs/screenshots/
  server/
    package.json             # "type": "module"; scripts: start, dev (node --watch), seed
    .env.example             # PORT, MONGO_URI, CLIENT_ORIGIN (placeholders only)
    server.js                # load env, connect to MongoDB, listen
    app.js                   # ONLY configuration, middleware and route mounting
    config/db.js
    models/                  # Owner.js Vehicle.js ServiceType.js ServiceLog.js FuelLog.js Expense.js
    routes/                  # vehicles.js owners.js serviceTypes.js serviceLogs.js fuelLogs.js
                             #   expenses.js reminders.js stats.js  (each an express.Router())
    middleware/              # logger.js notFound.js errorHandler.js
    services/                # processing logic: odometer.js schedule.js registration.js
                             #   fuelEfficiency.js costs.js
    seed/seed.js
  client/
    .env.example             # VITE_API_URL=http://localhost:5000/api
    src/
      api/axios.ts           # the ONE axios instance (axios.create with baseURL from VITE_API_URL)
      api/                   # small request functions per resource
      hooks/                 # custom hooks (at least: useApi)
      components/            # shared UI (Button, Card, Input, Select, FieldError, PageHeader,
                             #   LoadingState, ErrorState, EmptyState, ConfirmDialog, Toast)
      pages/
      schemas/               # Zod schemas (outside components) + z.infer types
      types/
      utils/                 # formatting (peso, km, liters, dates)
```

---

## 3. Collections (six, all with `timestamps: true`)

### owners: people or businesses that own vehicles
- `fullName`: String, required
- `email`: String, unique (D3)
- `contactNumber`: String, required, pattern (D2)
- `type`: enum `individual`, `business`

### vehicles (MAIN collection): each car or motorcycle
- `owner`: ObjectId ref Owner, required
- `plateNumber`: String, required, unique, pattern (D1)
- `make`: String, required
- `model`: String, required
- `year`: Number, min 1980, max next year (D15)
- `type`: enum `motorcycle`, `car`, `suv`, `van`, `truck`
- `fuelType`: enum `gasoline`, `diesel`
- `startingOdometer`: Number, min 0
- `status`: enum `active`, `in_shop`, `retired`; default `active`

### serviceTypes: kinds of maintenance and how often they are needed
- `name`: String, required, unique
- `intervalKm`: Number, min 0
- `intervalMonths`: Number, min 0, max 60
- `appliesTo`: array of vehicle types (same enum as `vehicles.type`)
- At least one interval is required (custom validator: `intervalKm > 0` or `intervalMonths > 0`)

### serviceLogs: services done on a vehicle
- `vehicle`: ObjectId ref Vehicle, required
- `serviceType`: ObjectId ref ServiceType, required
- `date`: Date, required, not in the future
- `odometer`: Number, required, min 0
- `cost`: Number, min 0
- `shop`: String

### fuelLogs: fuel fill-ups
- `vehicle`: ObjectId ref Vehicle, required
- `date`: Date, required
- `odometer`: Number, required
- `liters`: Number, min 0.1, max 200
- `pricePerLiter`: Number, min 1
- `fullTank`: Boolean, default true

### expenses: other costs of owning the vehicle
- `vehicle`: ObjectId ref Vehicle, required
- `date`: Date, required
- `category`: enum `registration`, `insurance`, `parts`, `parking`, `toll`, `wash`, `other`
- `amount`: Number, min 0

---

## 4. Data processing rules

| Feature | Rule or computation | Endpoint |
|---|---|---|
| Service schedule | For each service type that applies to the vehicle, the last service is taken from serviceLogs (or the starting odometer and the date the vehicle was added, if there is none). Next due km = last km + intervalKm; next due date = last date + intervalMonths. The service is **overdue** when either limit is reached, **due soon** when within 500 km or 14 days, and **OK** otherwise. Details in D6. | GET /api/vehicles/:id/service-schedule |
| Reminders | The same check across all active vehicles, plus registration renewals, sorted from most to least urgent. Details in D7. | GET /api/reminders |
| Registration renewal | The renewal month comes from the last digit of the plate number, following the LTO schedule (1 is January, 2 is February, up to 0 for October). | Part of GET /api/reminders and the vehicle details |
| Odometer rule | A new fuel or service log cannot have a reading lower than an earlier log of the same vehicle or higher than a later one. Logs for retired vehicles are refused. Both return 400. Details in D5. | POST /api/fuel-logs, POST /api/service-logs |
| Fuel efficiency | Kilometers per liter between two full-tank fill-ups (distance driven divided by liters added). Returns the average, best and worst, and flags any fill-up more than 15% below the vehicle's average. Details in D8. | GET /api/vehicles/:id/fuel-efficiency |
| Cost report | Fuel, service and other costs for a date range, a monthly breakdown, and cost per kilometer (total cost divided by distance driven). Details in D9. | GET /api/vehicles/:id/costs |
| Fleet statistics | Spending this month, vehicles ranked by cost per kilometer, the most common service, and the number of vehicles with overdue services. Details in D10. | GET /api/stats/fleet |
| Vehicle status rules | active to in_shop and back; any status to retired; a retired vehicle cannot go back to active. Details in D11. | PATCH /api/vehicles/:id/status |

---

## 5. Endpoints (exactly 34)

| Resource | Endpoints | Count |
|---|---|---|
| /api/vehicles | GET list (with filters), GET /:id, POST, PUT /:id, DELETE /:id, PATCH /:id/status, GET /:id/service-schedule, GET /:id/fuel-efficiency, GET /:id/costs | 9 |
| /api/owners | GET list, GET /:id, POST, PUT /:id, DELETE /:id | 5 |
| /api/service-types | GET list, POST, PUT /:id, DELETE /:id | 4 |
| /api/service-logs | GET list (by vehicle), GET /:id, POST, PUT /:id, DELETE /:id | 5 |
| /api/fuel-logs | GET list (by vehicle), GET /:id, POST, PUT /:id, DELETE /:id | 5 |
| /api/expenses | GET list, POST, PUT /:id, DELETE /:id | 4 |
| /api/reminders | GET list | 1 |
| /api/stats | GET /fleet | 1 |

Full CRUD is on `vehicles`, the main collection. Do not add other endpoints, not even a health check.

---

## 6. API conventions

- Plural noun paths, and the HTTP method is the verb.
- Only these status codes: **200** (read, update, delete), **201** (create), **400** (validation, invalid ID, rule violation, duplicate key), **404** (record not found, unknown route), **500** (unexpected).
- Every error is JSON `{ "message": "..." }`. No HTML error pages and no stack traces in responses.
- Mongoose `ValidationError` returns 400, and the message names the failing fields.
- An invalid ObjectId (or `CastError`) returns 400 `{ "message": "Invalid ID" }`.
- Duplicate key (code 11000) returns 400, for example `{ "message": "plateNumber already exists" }`.
- Middleware is registered in `app.js` in exactly this order:
  1. `cors({ origin: process.env.CLIENT_ORIGIN })`
  2. `express.json()`
  3. custom request logger (method, path, status, ms)
  4. routes
  5. JSON 404 catch-all
  6. error handler (last)
- `server.js` loads `.env` (`PORT`, `MONGO_URI`, `CLIENT_ORIGIN`), connects, then listens. If `MONGO_URI` is missing, exit with a clear message that does not print the value.

---

## 7. Pages (13, React Router)

| No. | Page | Route | Purpose |
|---|---|---|---|
| 1 | Landing page | / | Introduces Kilometro and links to the dashboard |
| 2 | Dashboard | /dashboard | Spending this month, overdue services and cost per km ranking |
| 3 | Vehicles | /vehicles | Vehicle list with type and status filters |
| 4 | Vehicle details | /vehicles/:id | Service schedule, fuel efficiency, costs and history |
| 5 | Add or edit vehicle | /vehicles/new, /vehicles/:id/edit | Form validated with Zod |
| 6 | Service logs | /service-logs | Service history with add and edit forms |
| 7 | Fuel logs | /fuel-logs | Fill-ups with the km per liter of each entry |
| 8 | Expenses | /expenses | Other costs with add and edit forms |
| 9 | Reminders | /reminders | Overdue and due-soon services and registration renewals |
| 10 | Owners | /owners, /owners/:id | Owner list and each owner's vehicles (with add and edit owner forms) |
| 11 | Service types | /service-types | Manage service intervals |
| 12 | Reports | /reports | Cost breakdown by month and by vehicle |
| 13 | Not found | * | Friendly 404 page |

The landing page uses only content from §1. No fake testimonials, user counts or claims.

---

## 8. Frontend requirements (from the rubric; all mandatory)

**API and data:**
- Every API call goes through the single axios instance in `src/api/axios.ts`.
- At least one custom hook in `src/hooks/`: `useApi` returns `{ data, loading, error, refetch }`.
- Every screen that loads data shows a loading state and an error state. No blank screens and no silent failures. Show the server's `message` on errors.
- Visible empty states. Detail pages show a clear "not found" state when the API returns 404.

**Forms:**
- Create and edit forms use React Hook Form with a Zod schema kept in `src/schemas/`, outside the component.
- Types come from `z.infer<typeof schema>`.
- Each field shows its own error message.
- The submit button is disabled while submitting.
- Server 400 messages are shown in the form.

**Feedback:**
- Every delete asks for confirmation (ConfirmDialog). The vehicle delete dialog says its logs and expenses are removed too (D12).
- Success feedback (Toast) after create, update and delete.

**React fundamentals:**
- Lists render with `map()` and use MongoDB `_id` as the key, never the array index.
- Derived values are computed during render and never stored in state: a fuel row's cost (liters × pricePerLiter), list totals, km remaining, percentages and similar.
- Use conditional rendering for loading, error, empty and content states.

**Design:**
- A deliberate palette defined in the Tailwind theme (`@theme` in `src/index.css`):
  - primary: orange `#BF5A16`
  - ink: navy `#1F2D45`
  - surface: `#EEF2F6`
  - status colors for overdue, due soon and OK
- Consistent corners, shadows, spacing and type hierarchy. Buttons, cards and form fields look the same on every page.
- No leftover Vite starter styles.
- Fully usable at **375px** and on desktop, with **no page-level horizontal scrolling**. Below the `md` breakpoint, tables become stacked cards. The navigation collapses to a mobile menu.

---

## 9. Decisions (details the proposal did not specify)

These are our implementation choices. List them in the README under "Known limitations and assumptions".

**D1. Plate number and renewal month.**
- `plateNumber` is stored trimmed and uppercase.
- Pattern: `^[A-Z0-9]+([ -][A-Z0-9]+)*$`, 4 to 10 characters, with at least one digit.
- The renewal month uses the **last digit character** in the plate: 1 = January … 9 = September, 0 = October.

**D2. contactNumber.** Philippine mobile format `^09\d{9}$`.

**D3. Owner email.** Optional. If given, it must be a valid email format and unique (unique + sparse index).

**D4. Current odometer** = the highest odometer among the vehicle's fuel logs and service logs. If it has none, use `startingOdometer`.

**D5. Odometer rule** (`services/odometer.js`). Applies to POST and PUT on fuel logs and service logs; on PUT, the log being edited is excluded.
- Compare against **all** fuel logs and service logs of the same vehicle:
  - The new reading must be ≥ the highest reading dated **before** the new log's date.
  - It must be ≤ the lowest reading dated **after** it.
  - Logs on the same date are not compared.
  - It must also be ≥ `startingOdometer`.
- If the vehicle is `retired`, the log is refused.
- Every violation returns 400 with a message that states the allowed range.

**D6. Service schedule** (`services/schedule.js`, a pure function).
- Process only service types whose `appliesTo` includes `vehicle.type`.
- Last service = the most recent serviceLog of that type (by date). If there is none, use baseline km = `startingOdometer` and baseline date = the vehicle's `createdAt`.
- `nextDueKm` = lastKm + intervalKm, only if intervalKm > 0.
- `nextDueDate` = lastDate + intervalMonths, only if intervalMonths > 0.
- `kmRemaining` = nextDueKm − current odometer.
- `daysRemaining` = whole days from today to nextDueDate.
- A limit that does not exist is ignored.
- Status:
  - `overdue` if kmRemaining ≤ 0 or daysRemaining ≤ 0
  - else `due_soon` if kmRemaining ≤ 500 or daysRemaining ≤ 14
  - else `ok`

**D7. Reminders.**
- Only vehicles with status `active` are included.
- Service items: the D6 results with status `overdue` or `due_soon`.
- Registration items: active vehicles whose renewal month is the current month ("due this month") or the next month ("due next month").
- Sort order:
  1. overdue services, most overdue first
  2. due-soon services, nearest first
  3. registration due this month
  4. registration due next month
- Each item includes the vehicle's `_id`, plate, make and model.

**D8. Fuel efficiency.**
- Sort the vehicle's fuel logs by odometer.
- For each `fullTank` log after the first full-tank log:
  - distance = its odometer − the previous full-tank odometer
  - liters = the sum of liters of all logs after the previous full tank, up to and including this one
  - kmPerLiter = distance ÷ liters, rounded to 2 decimals
- `average` = the mean of these values. `best` = the highest. `worst` = the lowest.
- A fill-up is `flagged` when kmPerLiter < average × 0.85.
- Response: `{ average, best, worst, entries: [{ fuelLogId, date, odometer, kmPerLiter, flagged }] }`.
- With fewer than two full-tank fill-ups, return 200 with `average: null` and the message "Need at least two full-tank fill-ups".

**D9. Cost report.**
- Query params `from` and `to` are optional dates; with neither, the report covers all time.
- `fuel` = Σ liters × pricePerLiter. `service` = Σ cost. `other` = Σ expense amount. `total` = the sum of the three.
- `monthly` = one row per `YYYY-MM` with fuel, service, other and total.
- `distance` = the highest reading in the range − the highest reading before the range (or `startingOdometer` if there is none).
- `costPerKm` = total ÷ distance if distance > 0, otherwise `null`.
- Invalid dates, or `from` after `to`, return 400.

**D10. Fleet statistics.**
- `spendingThisMonth` = fuel + service + expenses dated in the current calendar month.
- `ranking` = non-retired vehicles with all-time distance (current odometer − startingOdometer) > 0, sorted by all-time cost per km, **highest first**.
- `mostCommonService` = the service type with the most serviceLogs, and its count.
- `overdueVehicles` = the number of active vehicles with at least one overdue service.

**D11. Vehicle status transitions.**
- Allowed: active→in_shop, in_shop→active, active→retired, in_shop→retired.
- Everything else returns 400 with a message: changing to the same status, or any change from retired.
- PUT /api/vehicles/:id ignores `status`. Status changes only through PATCH.

**D12. Deletes.**
- Deleting an owner who still has vehicles returns 400.
- Deleting a service type that has service logs returns 400.
- Deleting a vehicle also deletes its service logs, fuel logs and expenses. The response message states how many were removed.

**D13. Service type check.** A service log whose serviceType does not apply to the vehicle's type returns 400.

**D14. Dates.** Dates of fuel logs and expenses cannot be in the future either.

**D15. Year range.** The maximum `year` is computed at validation time as the current year + 1.

**D16. Units.** Money is in Philippine pesos (₱, 2 decimals), distance in km and fuel in liters. Formatting happens in the client.

**D17. List filters.**
- `GET /api/vehicles?type=&status=&owner=`
- `GET /api/service-logs?vehicle=`
- `GET /api/fuel-logs?vehicle=`
- `GET /api/expenses?vehicle=&category=`

An invalid ObjectId in a filter returns 400.

**D18. Vehicle detail payload.** GET /api/vehicles/:id populates `owner` and includes `currentOdometer` and `registrationMonth` (the month name).

**D19. Extra required fields.** These fields are required even though §3 does not mark them, because the §4 processing rules need them:
- `vehicles.type` and `vehicles.startingOdometer` (service schedule D6, odometer rule D5)
- `fuelLogs.liters` and `fuelLogs.pricePerLiter` (fuel efficiency D8, cost report D9)
- `expenses.category` and `expenses.amount` (cost report D9)

All other §3 fields without "required" stay optional.

**D20. Reminder urgency.** Inside the overdue group and the due-soon group of D7, reminders are sorted by the share of the interval left:
- shareLeft = the smaller of `kmRemaining ÷ intervalKm` and `daysRemaining ÷ (intervalMonths × 30.44)`; a limit that does not exist is ignored.
- Lower comes first. Example: 500 km past a 5,000 km interval is −10%; 41 days past a 12-month interval is −11%, so it ranks first.

**D21. Money is added in centavos.** Each record is rounded to the centavo before it is added up: a fill-up costs `liters × pricePerLiter` rounded to 2 decimals, and service costs and expense amounts are rounded the same way. Totals by month, by vehicle and for the whole fleet then always match.

---

## 10. Seed data (`npm run seed` in server/)

- Clears all six collections, then inserts:
  - **three owners** (individual and business)
  - about **eight vehicles**, a mix of motorcycles and cars
  - common service types, including **change oil every 5,000 km or 6 months**, plus tire rotation, brake check and air filter replacement with sample intervals
  - **several months** of fuel and service history, plus some expenses
- All dates are **relative to the day the seed runs**. All data obeys every rule in §4 and §9.
- The seed must produce:
  - at least one overdue service, one due-soon service and one OK service
  - one flagged fill-up
  - one `in_shop` vehicle and one `retired` vehicle
  - at least one registration due this month or next month
- Prints counts at the end. Never prints the URI.

---

## 11. README.md (required content)

- Project title, group members (§1) and concept
- What the application does and what data it processes
- Screenshots (from `docs/screenshots/`)
- Setup instructions and the required environment variables (server and client `.env.example`)
- API documentation table with **method, path, purpose, sample request, sample response** for all 34 endpoints, taken from the real running API
- List of features
- Known limitations and assumptions (include the §9 decisions)

Do not write a per-member contribution list in the README. The group writes that themselves.

---

## 12. Phases (one at a time; each checkpoint has ONE owner who commits it; push at the end of each phase)

**Phase 1: Server foundation.**
- **CP1.1 [David]:**
  - root `.gitignore`
  - `server/package.json` with scripts
  - `server/.env.example`
  - `config/db.js`, `server.js`
  - `app.js` (§6 order)
  - `middleware/logger.js`, `middleware/notFound.js`, `middleware/errorHandler.js`
- **CP1.2 [David]:** the 8 route files as empty `express.Router()` stubs, mounted in `app.js`. Confirm that the server starts and that unknown routes return a JSON 404.

**Phase 2: Client foundation.**
- **CP2.1 [David]:** Vite React TypeScript in `client/`, Tailwind v4 with the §8 theme, and `client/.env.example`.
- **CP2.2 [David]:** `api/axios.ts`, `hooks/useApi.ts`, `utils/format.ts`, and the shared components.
- **CP2.3 [David]:** Layout with responsive navigation, and React Router with **all 13 routes** pointing to placeholder page files. The Not Found page is finished.

**Phase 3: Models and services.**
- **CP3.1 [Kurt Sebastien]:** `models/Owner.js`, `models/Vehicle.js`, `services/registration.js` (D1)
- **CP3.2 [David]:** `models/ServiceType.js`, `models/ServiceLog.js`, `services/schedule.js` (D6)
- **CP3.3 [Kurt Wayne]:** `models/FuelLog.js`, `services/odometer.js` (D4, D5), `services/fuelEfficiency.js` (D8)
- **CP3.4 [Dirk]:** `models/Expense.js`, `services/costs.js` (D9, D10 helpers)

**Phase 4: Endpoints.** Each checkpoint includes curl tests for success, 400 and 404.
- **CP4.1 [Kurt Sebastien]:** `routes/owners.js` (5 endpoints, D12)
- **CP4.2 [Kurt Sebastien]:** `routes/vehicles.js`: GET list (D17), GET /:id (D18), POST, PUT (D11), DELETE (D12), PATCH /:id/status (D11)
- **CP4.3 [David]:** `routes/serviceTypes.js` (4 endpoints, D12)
- **CP4.4 [David]:** `routes/serviceLogs.js` (5 endpoints; D5 via `services/odometer.js`, D13)
- **CP4.5 [Kurt Wayne]:** `routes/fuelLogs.js` (5 endpoints, D5, D14)
- **CP4.6 [Dirk]:** `routes/expenses.js` (4 endpoints, D14, D17)
- **CP4.7 [David]:** GET /api/vehicles/:id/service-schedule (added to `routes/vehicles.js`)
- **CP4.8 [Kurt Wayne]:** GET /api/vehicles/:id/fuel-efficiency (added to `routes/vehicles.js`)
- **CP4.9 [Dirk]:** GET /api/vehicles/:id/costs (added to `routes/vehicles.js`)
- **CP4.10 [David]:** `routes/reminders.js` (D7)
- **CP4.11 [Dirk]:** `routes/stats.js` (D10)
- Confirm the total is 34 endpoints.

**Phase 5: Seed.**
- **CP5.1 [David]:** `seed/seed.js` (§10). Run it, then show that reminders, stats, fuel-efficiency and schedule return the required demo cases.

**Phase 6: Pages.** Each checkpoint is checked against §8 at 375px and on desktop, and includes its Zod schemas and request functions.
- **CP6.1 [Kurt Wayne]:** Landing page
- **CP6.2 [Kurt Sebastien]:** Owners and owner details, with the owner form
- **CP6.3 [Kurt Sebastien]:** Vehicles, Add/Edit vehicle
- **CP6.4 [Kurt Sebastien]:** Vehicle details
- **CP6.5 [Kurt Wayne]:** Service types page
- **CP6.6 [David]:** Service logs page
- **CP6.7 [Kurt Wayne]:** Fuel logs page
- **CP6.8 [Dirk]:** Expenses page
- **CP6.9 [David]:** Reminders page
- **CP6.10 [Dirk]:** Dashboard
- **CP6.11 [Dirk]:** Reports page

**Phase 7: Finish.**
- **CP7.1 [Dirk]:** README (§11) with the API table, and the screenshots in `docs/screenshots/`.
- **CP7.2:** Run the §13 checklist and report pass or fail. Each fix is its own checkpoint, owned by whoever owns that file in the phases above.

## 13. Definition of done (rubric checklist)

**Collections and validation**
- [ ] 6 related collections with required, min, max, enum, default and unique rules and timestamps.
- [ ] The seed makes the app look complete.

**API structure**
- [ ] 34 endpoints, all working. Full CRUD on vehicles. Correct REST naming.
- [ ] 8 processing features (§4), correct including the §9 edge cases.
- [ ] Status codes are only 200, 201, 400, 404 and 500. JSON errors are `{ message }`.
- [ ] Invalid IDs and validation errors return 400.
- [ ] Logger, 404 catch-all and error handler are in the right order. CORS is set.
- [ ] `.env` and `node_modules` are not tracked. `.env.example` is committed.
- [ ] Clean structure: routes, models, middleware, services; components, hooks, schemas, pages.

**Frontend**
- [ ] 13 pages, including the landing page and the 404 page.
- [ ] One axios instance.
- [ ] Loading, error and empty states everywhere.
- [ ] Zod schemas outside components with `z.infer`, per-field errors and gated submit.
- [ ] Delete confirmation and success feedback.
- [ ] `_id` keys, derived values computed in render, and the custom hook.
- [ ] Usable at 375px with no horizontal scroll. Consistent design from the Tailwind theme.

**README and demo**
- [ ] README has every item in §11.
- [ ] The demo can show a validation error: a fuel log with a lower odometer shows the 400 message in the UI, and an empty form shows Zod errors.
- [ ] The demo can show a not-found case: `/vehicles/000000000000000000000000` shows "not found", and an unknown URL shows the 404 page.
