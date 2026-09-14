# Development Modeler

A working Next.js application for time-driven development financial modeling.

## Run

```sh
npm install
npx playwright install chromium
npm run dev
```

Open http://127.0.0.1:3100. The demo opens directly; no account is required for device-local work.

```sh
npm test
npm run typecheck
npm run build
npm start
```

Production builds use Webpack because Turbopack's CSS worker cannot bind its internal port in this desktop sandbox. Next.js is pinned by package-lock.json. Use `npm ci` in CI.

## Implemented

- Models, project creation wizard, project duplication, deletion and ordering.
- Shared form/timeline state, PBG dependencies, project shifts, stage dragging and edge resizing.
- Land control independent from full payment, full/installment/custom land schedules.
- Unit mix, unlimited UI pricing tiers, automatic integer sales allocation and manual monthly sales.
- Full-cash, installment and custom buyer collections; completion-limited installment terms.
- Simple/advanced construction budgets, spending curves, development cost drivers and timing.
- Company payroll, corporate overhead and shared non-staff resource allocation.
- Project and portfolio cash flow, lifetime management P&L, peak funding and warnings.
- Scenario adjustments and comparison, what-if controls, local autosave and version restore with backup.
- Excel export with 14 worksheets, formula cash roll-forward, conditional formatting and summary cross-links.
- Server-side Playwright PDF export and a separate printable report route.
- Supabase Auth UI, RLS migration, revision-checked snapshot save, cloud load and debounced autosave after attaching a synchronized model.

## Supabase setup

No Supabase project or credentials are included. Cloud provisioning requires the account owner to sign in at https://supabase.com/dashboard.

1. Create a project in the desired region.
2. Apply the migrations in `supabase/migrations/`, in numeric order.
3. Copy `.env.example` to `.env.local` and set the public project URL and anon/publishable key. Never use a service-role key in the browser.
4. Restart Next.js. Sign up/sign in from Settings or `/login`.
5. Save the local models to cloud once. The client then attaches revision-checked debounced saves. Cloud conflicts stop autosave and preserve the device-local copy.

The canonical persistence unit is the entire model snapshot in `financial_models.data`. Related normalized tables are provisioned and protected by RLS but are not currently synchronized; they are reserved for future reporting APIs. Named versions save locally and to cloud when available. Cloud versions can be loaded in Settings. Share issues a read-only link to the last cloud-saved model with a seven-day expiry; token hashes are stored server-side. Model-specific access requests, approval/revocation and independent local copies are implemented in migration 003 and the sharing UI. Apply and verify migration 003 before using collaboration. See DEPLOYMENT.md.

## Financial conventions

- Month indices are one-based. Project start is relative to the model start date. Project offsets are zero-based unless a label says project month.
- PBG ends at start + duration - 1. Dependent sales/construction start the following month plus their offsets.
- Buyer installment balance is split over `min(maxTerm, deadline - saleMonth + 1)` months, including the signing month. The down payment is additional in the signing month. A sale after a deadline is collected at signing and flagged.
- Currency is a single-currency planning assumption; UI and report formatting follow the selected currency. Changing currency does not change the numerical assumptions. Currency conversion is not implemented. Do not mix currencies.
- Sales quantities use largest-remainder integer allocation. Monetary distributions conserve cents by adjusting the final installment.
- The calculation horizon automatically extends to include all obligations. No scheduled future cash is silently truncated.
- Revenue is actual scheduled sales contract value. P&L is lifetime management economics, not statutory IFRS/GAAP recognition or monthly accrual accounting.
- Financing inflows, debt interest, IRR and NPV are outside the requested implementation.
- Invalid custom percentages raise warnings; the construction curve is normalized for budget conservation. Buyer custom payments are not normalized, exposing collection discrepancies to model health.
- Auxiliary timeline stages support their own start anchors and duration in both the form and drag view. Link a development cost to `Timeline Stage` to schedule that budget with the stage. A stage without a linked budget changes the schedule without inventing costs.
- Scenario adjustments act on common project assumptions. Fully divergent per-scenario project structures are not implemented.
- Excel payment schedules are calculated snapshots, with formula-based roll-forward and summary totals. Editing Excel assumptions does not rerun the full TypeScript allocation engine.

## Validation

- 19 unit/export tests cover the demo totals, land installments/control, PBG dependencies, shortened buyer plans, construction conservation, payroll, shared resources, cash roll-forward, peak funding, inventory warnings, consolidation and export validation.
- `tests/browser.mjs` covers editing PBG, drag interaction, Cash Flow, scenario creation, Excel downloads, version persistence and a 390px mobile viewport; it uses an isolated browser context.
- `artifacts/` contains QA screenshots and example XLSX/PDF output, not user data.

## Deployment boundary

The local application is runnable and the production build passes. It is not yet a provisioned production SaaS: Supabase needs account setup, live RLS/auth/concurrency testing, shared-link permissions, and cloud version synchronization against the live database. The PDF route requires a Node.js host with Playwright Chromium; it cannot run unchanged in a Cloudflare Worker. `REPORT_ORIGIN` should point to this application's trusted internal origin on the deployment host. When Supabase is configured, PDF requests require a valid bearer session. Bind a local-only unconfigured deployment to loopback.

Before serving large custom portfolios, extend report pagination for long unit/cost tables; the current fixed-page report is verified against the supplied three-project demo. Do not expose the unauthenticated local demo PDF endpoint to the public internet.

### Employees and landscape reports

All salaries are managed in **Employees**, grouped into departments, including management and shared teams. Each department has one working period (anchor, offset, duration); moving or resizing it in Timeline changes salary payments for every member. All departments work across the portfolio. Salaries are company costs, never allocated to projects. Project duplication or deletion does not change the workforce. Dependencies use the earliest portfolio milestone. Salaries appear once under Payroll in cash flow and P&L, and in the Payroll Excel sheet.

Legacy salary entries migrate automatically without changing monthly cash flow. The browser retains a “Before Employees migration” version. Workforce data is included in the existing cloud model JSON document; no new database migration is required.

Downloadable and printable PDF reports use **A4 landscape (297 × 210 mm)** with paginated tables. `node tests/report-landscape.mjs` checks page layout and writes `artifacts/report-landscape.pdf` from an isolated demo session. Financial/export suite: 38 tests; production build and typecheck pass.

Sales and construction support negative start offsets: the default remains the month after PBG, while dragging can overlap PBG. Offsets follow later PBG changes and starts are clamped to model month 1. Project settings also allow switching the timing anchor to project start. `node tests/timeline-overlap.mjs` verifies both drags and persistence after reload.

Land supports Manual pricing or a Leasehold calculator for USD projects: years × area in are × IDR per are per year ÷ IDR per USD. The exchange rate is a user-entered assumption. Missing rates retain the manual price with an explicit notice. Calculated cost drives automatic land payments and scenario adjustments; custom schedules retain their entered amounts and are checked against the total. Inputs persist in model JSON and appear in Excel/PDF reports. `node tests/leasehold.mjs` checks entry, installments and persistence.

The default model calendar starts on 2027-01-01. Monthly sales provides a calendar-year selector and total units sold in January–December of the selected year. Charts, project detail calculations, cash flow and exports use the model start date; manual sales headers include calendar month labels.

### Interface languages
The top-right RU / EN control switches the main application interface and remembers the preference on this device. Translations are maintained in `lib/i18n/ru.ts`; internal enum values and financial data remain stable. PDF and Excel output currently remain in English. `node tests/languages.mjs` checks both languages, reload persistence and form values across switching.

Numeric inputs use a shared editing component across forms, tables, employees and timeline. Focus selects the whole value; empty or partial input remains an editing draft without writing zero into the model. Leaving an empty field restores its latest valid value; Enter commits by leaving the field. `node tests/number-editing.mjs` covers replacement, blank editing, limits, tabular values and negative offsets.

The model header now exposes “Model start · M1” as a month selector. Project editors require that shared start date and display both M1 and the project's effective start; timelines and manual-sales headers derive calendar labels from it. Store v4 corrects only the active model's legacy 2026-01-01 default to 2027-01-01 once, retaining a complete pre-change version. Later user-selected dates are preserved. `node tests/calendar-start.mjs` checks calendar changes across sales, cash flow, timeline and reload.

Manual sales displays per-tier allocated / planned unit counts directly above each monthly grid. Only exact equality is marked balanced; both shortages and excesses show their size and remain in model warnings. Validation sums every entered month, including entries beyond the current horizon. `node tests/sales-allocation.mjs` verifies shortage, excess and equality in both interface languages.

Financial colors distinguish income/positive results (green), expenses/losses (terracotta) and funding requirements (amber), with neutral zeros. Cost rows remain expense-colored even when stored as positive amounts. Dashboard KPIs, project profit, P&L/cash-flow tables, scenario comparison, staff/land costs and chart segments use these semantics. Financial-table row data is memoized to prevent table-state reset loops when opening P&L.
