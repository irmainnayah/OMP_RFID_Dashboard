# OMP RFID Dashboard

## Project Overview

OMP RFID Dashboard is a workshop service monitoring dashboard for heavy equipment maintenance operations. It presents bay occupancy, equipment identifiers, service timing, and overdue status on a single screen. The intended display is a 16:9 Smart Display at 1920 × 1080; these are target dimensions, not technical runtime restrictions.

The application currently loads bay data through a server-side API request and includes local dummy data as a fallback. Although the dashboard is intended for real-time operational monitoring, it does not automatically poll the API for updated service records.

## Project Objectives

- Give workshop teams a single view of indoor and outdoor bay activity.
- Make active service, overdue work, and empty bays easy to scan from a wall display.
- Present equipment and service timing information in a consistent bay-card layout.

## Key Features

- Eight bay cards, grouped into indoor and outdoor sections.
- Summary counts for total, in-service, overdue, and empty bays.
- Equipment identifier, assigned mechanic, start time, estimated finish, and countdown when the data is available.
- Header date and clock, with the displayed time refreshed every second.
- Local dummy-data fallback when the API request fails or its response does not contain the expected success flag and data array.
- Responsive card grids that adapt to smaller viewport widths.

## Dashboard Layout

The page is arranged as a header, a four-metric summary bar, and two bay sections. The indoor section contains BAY 01, BAY 02, BAY 07, and BAY 08. The outdoor section contains the same four bay numbers, for eight cards total.

Each populated card can show the bay number, service status, equipment ID and image, assigned mechanic, start time, estimated finish, and a countdown. Empty bays show an empty-state label. The summary bar counts total bays, active service, overdue service, and empty bays.

## Technology Stack

Versions below come from `package.json` and the lockfile. Ranges are shown where the project declares a range rather than a pinned version.

| Technology | Declared version |
| --- | --- |
| Next.js | 16.3.8 |
| React | 19.2.8 |
| React DOM | 19.2.8 |
| TypeScript | `^5` |
| Tailwind CSS | `^4` |
| ESLint | `^9` |

The application uses the Next.js App Router, with route content in `app/`. Tailwind CSS is integrated through its PostCSS plugin.

## Project Structure

```text
app/
  globals.css                 Global styles and local animations
  layout.tsx                  Root layout, fonts, and page metadata
  page.tsx                    Dashboard page and data loading
components/
  dashboard/
    BayCard.tsx               Individual bay card and countdown
    BayGrid.tsx               Indoor and outdoor bay sections
    EquipmentVisual.tsx       Equipment image display
    FooterLegend.tsx          Legacy component; currently renders nothing
    Header.tsx                 Dashboard title and live date/clock
    StatusBadge.tsx           Service status indicator
    SummaryBar.tsx             Aggregate bay counts
data/
  dummyBays.ts                Local fallback bay dataset
public/
  images/                     Dashboard logo and equipment images
services/
  bayService.ts                API request, mapping, fallback, and summaries
types/
  bay.ts                       Bay and summary data types
```

Root configuration includes `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, and `eslint.config.mjs`.

## Data Flow and API Integration

1. `app/page.tsx` calls `getBays()` from `services/bayService.ts` on the server when the page is requested.
2. The service sends an HTTP request to the project’s configured upstream API and includes the `API_KEY` environment variable in the request header. The upstream address is defined in the service code and is not configurable through an environment variable.
3. The service expects a successful response with a `success` field and a `data` array. It matches returned bay locations against the four configured indoor bay numbers and maps available equipment and service timing fields into the dashboard’s bay model.
4. The service appends four empty outdoor bays. The current API mapping does not populate outdoor bay records.
5. If the request fails, returns a non-success HTTP status, or has an unexpected response shape, the service uses `data/dummyBays.ts` instead.
6. The page calculates the initial summary and passes the data to client-side dashboard components.

The request uses `cache: 'no-store'`, so Next.js does not serve a cached result for that fetch. However, the browser does not poll or automatically re-request the API. Client-side clocks, countdowns, and summary calculations update every second using the data already loaded. Updated service records require a new page request or reload.

## Environment Configuration

The service reads `API_KEY` from the server environment and sends its value in the API request header. Keep the value private and do not commit real credentials. The upstream API address is hard-coded in `services/bayService.ts`.

Create a local `.env` file in the project root and set the variable:

```dotenv
API_KEY=
```

Add the value supplied for your environment after `=`. The repository includes `.env.example` as a variable-name template. The application sends an empty string if `API_KEY` is not set; whether the upstream service accepts that request depends on that service’s configuration.

## Installation and Setup

Install the dependencies recorded in the lockfile:

```bash
npm ci
```

Create `.env` with the `API_KEY` value if API access is configured for your environment. No Node.js version is declared by the project, so use a version supported by the installed Next.js release and your deployment environment.

## Development

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. The server loads bay data for each page request. Refresh the page to request updated API data.

Run the configured lint command with:

```bash
npm run lint
```

## Production Build and Deployment

Create a production build:

```bash
npm run build
```

Run the built application with:

```bash
npm run start
```

The production runtime needs access to the upstream API and the `API_KEY` environment variable. Configure the secret in the hosting environment rather than committing it to the repository. The repository does not specify a deployment platform or deployment procedure; configure deployment according to the chosen host’s Next.js requirements.

## Important Notes and Troubleshooting

- **Data does not change automatically:** the dashboard does not poll the API. Reload or request the page again to load updated records.
- **Dummy records appear:** check API availability, the server logs, and whether the response has `success: true` and a `data` array. Request failures and invalid response shapes use `DUMMY_BAYS`.
- **API authentication fails:** confirm that `API_KEY` is set in the server environment and that the value is valid for the upstream service. Do not put the secret in client-side code.
- **Outdoor cards remain empty:** this is the current service behavior. The API response is mapped only to indoor bays; outdoor bays are appended as empty placeholders.
- **Status values:** populated API bays are classified as `OVERDUE` when their estimated finish time has passed, otherwise as `IN_SERVICE`. Empty bays have a `null` status. The current API mapping does not produce a `COMPLETE` status.
- **Target display size:** 16:9 at 1920 × 1080 is the intended wallboard target. The responsive layout can render at other viewport sizes, with a different number of columns on narrower screens.
