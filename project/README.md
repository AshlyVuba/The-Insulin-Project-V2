# First Response Express — Frontend v2

A role-based clinic staff portal for managing patient file pulls and pharmacy dispensing workflows at Tshwane Municipality Clinic.

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Routing | React Router v7 (HashRouter) |
| Styling | Tailwind CSS v3 with custom design tokens |
| HTTP client | Axios v1 |
| State | React Context API + useState/useEffect hooks |

---

## Project structure

```
src/
├── api/
│   ├── client.js         # Axios instance — reads REACT_APP_API_URL from .env
│   ├── filing.js         # Filing Room endpoints (GET slots, PATCH send)
│   └── pharmacy.js       # Pharmacy endpoints (GET incoming/ready, PATCH pack/collect)
├── components/
│   └── common/
│       ├── FetchState.jsx # LoadingState + ErrorState UI components
│       ├── Icon.jsx       # Lightweight inline SVG icon set
│       ├── Layout.jsx     # Top navbar + sub-nav + page outlet
│       ├── StatCard.jsx   # Summary metric card
│       └── Toast.jsx      # Temporary notification banner
├── context/
│   └── AuthContext.jsx   # Auth state — login, logout, token, user
├── hooks/
│   └── useFetch.js       # Reusable data-fetching hook (loading/error/data/refetch)
├── pages/
│   ├── FilingRoomPage.jsx   # Filing clerk view — slot panels + send to pharmacy
│   ├── LoginPage.jsx        # Login form with role-based redirect
│   ├── PharmacyPage.jsx     # Pharmacist Kanban — Incoming → Ready → Collected
│   └── PlaceholderPages.jsx # Admin page (coming next sprint)
├── utils/
│   ├── helpers.js        # getInitials, formatDate
│   └── roleRoutes.js     # canAccessRoute, getHomeRouteForRole
├── App.jsx               # Route definitions + role guards
├── index.css             # Tailwind base + custom component classes
└── index.js              # App entry point
```

---

## Design tokens

Defined in `tailwind.config.js`:

| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#F8FAFC` | Page backgrounds |
| `navy` | `#1A365D` | Navigation, headings, primary text |
| `sky` | `#00B4D8` | Primary interactions, badges |
| `green` | `#2d8a4e` | Success actions, confirmed states |
| `amber` | `#b07218` | Warnings, urgent indicators |
| `muted` | `#718096` | Secondary text |
| `border` | `#e2e8f0` | Dividers, card borders |

---

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment setup

Create a `.env.local` file in the root and set your backend URL:

```
REACT_APP_API_URL=http://localhost:8000/api
```

The app falls back to `http://localhost:8000/api` if this is not set.

### Running locally

```bash
npm start
```

Opens at `http://localhost:3000`

---

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Filing Clerk | filing@clinic.gov.za | password123 |
| Pharmacist | pharmacy@clinic.gov.za | password123 |
| Admin | admin@clinic.gov.za | password123 |

Each role is restricted to its own route. Attempting to access another role's page redirects back to home.

---

## API endpoints expected

The frontend expects the following REST endpoints from the backend:

### Filing Room
| Method | Endpoint | Description |
|---|---|---|
| GET | `/filing/slots` | Returns today's arrival slots with patient files |
| PATCH | `/filing/files/:id/send` | Marks a file as sent to pharmacy |

### Pharmacy
| Method | Endpoint | Description |
|---|---|---|
| GET | `/pharmacy/incoming` | Returns cards in the To Pack column |
| GET | `/pharmacy/ready` | Returns cards ready for patient pickup |
| PATCH | `/pharmacy/cards/:id/pack` | Moves a card from Incoming → Ready |
| PATCH | `/pharmacy/cards/:id/collect` | Marks a card as collected |

All requests include a `Bearer` token in the `Authorization` header pulled from `sessionStorage`.

---

## Role-based access

| Route | Role |
|---|---|
| `/filing` | filing |
| `/pharmacy` | pharmacy |
| `/admin` | admin |

Admin users can access all routes. Non-matching roles are redirected to their home route.

---

## Notes for backend team

- Auth token is stored in `sessionStorage` under the key `fre_token`
- User object is stored under `fre_user` as JSON
- The frontend performs optimistic UI updates on PATCH actions and rolls back on failure
- Loading and error states are handled per-page — no blank screens on network failure
