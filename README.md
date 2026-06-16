# First Response Express Frontend

First Response Express is a HealthTech Hackathon frontend for a proactive, predictive queueing and triage system for public health clinics. The app focuses on insulin-dependent patients who usually wait hours for cold-chain medication by helping clinic teams pre-pull files, pre-pack insulin, manage fast-track pickup references, and monitor fridge temperature.

The current version is a React frontend with mock API data, role-aware routing, and operational dashboards for filing room staff, pharmacy staff, and admins.

## Current Features

- Role-aware login and routing for filing, pharmacy, and admin users
- Filing Room dashboard for fast-track file preparation
- Pharmacy Kanban workflow for incoming, ready, and collected insulin orders
- Admin Command Center with clinic-wide oversight
- Manual fridge temperature update flow for Pharmacy and Admin
- New pharmacy order form for backend-ready order payloads
- New fast-track filing form for backend-ready patient file payloads
- SVG icon buttons for modern, encoding-safe UI actions
- Toast notifications for user feedback
- Axios client with JWT bearer-token interceptor
- Mock API layer that can be swapped for real backend endpoints

## Demo Credentials

```txt
filing@clinic.gov.za / password123
pharmacy@clinic.gov.za / password123
admin@clinic.gov.za / password123
```

The clinic name displayed in the navbar comes from the mock user object in `src/api/authApi.js`.

## Tech Stack

- React 18
- React Router v6
- Axios
- Tailwind CSS setup
- Create React App
- Mock API modules for frontend-backend integration planning

## Getting Started

```bash
npm install
npm start
```

Optional environment setup:

```bash
cp .env.example .env
```

The app defaults to:

```txt
http://localhost:3000
```

## Project Structure

```txt
src/
  api/
    authApi.js          Mock login and future auth endpoint
    axiosClient.js      Axios instance with JWT interceptor and 401 handling
    filingApi.js        Filing room mock API and future filing endpoints
    pharmacyApi.js      Pharmacy mock API and future pharmacy endpoints
  components/
    common/
      Icon.jsx          Inline SVG icons used by action buttons
      Layout.jsx        Topbar, role-aware nav, and page shell
      StatCard.jsx      Reusable dashboard metric card
      Toast.jsx         Notification toast
  context/
    AuthContext.jsx     Session auth state, login, logout
  hooks/
    useFiling.js        Filing data loading and actions
    usePharmacy.js      Pharmacy data loading and actions
  pages/
    AdminPage.jsx       Admin command center
    FilingRoomPage.jsx  Filing room dashboard and fast-track form
    LoginPage.jsx       Staff login page
    PharmacyPage.jsx    Pharmacy Kanban and order form
  utils/
    helpers.js          Shared helper utilities
    roleRoutes.js       Role home routes and access checks
```

## Role Access

Role access is controlled in `src/utils/roleRoutes.js`.

- `filing` users land on `/filing` and only see Filing Room
- `pharmacy` users land on `/pharmacy` and only see Pharmacy Kanban
- `admin` users land on `/admin` and can access Admin, Filing Room, and Pharmacy Kanban

## Backend Integration Notes

Mock mode is currently enabled inside the API files. When the backend is ready:

1. Set `REACT_APP_API_URL` in `.env`
2. Change `USE_MOCK` to `false` in the API modules
3. Connect endpoints to the backend responses

Expected auth response:

```js
{
  access_token: "jwt-token",
  user: {
    name: "Admin User",
    role: "admin",
    clinic: "Tshwane Municipality Clinic"
  }
}
```

Suggested backend endpoints:

```txt
POST  /auth/login
GET   /filing/files
POST  /filing/files
PATCH /filing/files/:id/pull
POST  /filing/files/:id/remind
GET   /pharmacy/orders
POST  /pharmacy/orders
PATCH /pharmacy/orders/:id/status
PATCH /clinic/fridge-temperature
```

Pharmacy order payload:

```js
{
  name: "Nomsa Dlamini",
  ref: "FRE-0041",
  medication: "Insulin Glargine",
  pickup_time: "Today 10:00",
  temp: "2-8 C"
}
```

Filing fast-track payload:

```js
{
  name: "Nomsa Dlamini",
  ref: "FRE-0041",
  pickup_date: "2026-06-16",
  medication: "Insulin Glargine",
  status: "today",
  pulled: false
}
```

Fridge temperature payload:

```js
{
  temperature_celsius: 4.2,
  recorded_by_role: "pharmacy"
}
```

## Security And POPIA Notes

- JWT is stored in `sessionStorage`, not `localStorage`
- Axios attaches `Authorization: Bearer <token>` on API requests
- 401 responses clear session data and redirect to login
- Patient data should not be logged to the browser console in production
- Backend should enforce role-based access even though the frontend also guards routes
- Backend should use parameterized SQL or ORM query binding to prevent SQL injection
- Health data shown in dashboards should stay minimal and purpose-specific
- Admin audit trails should record operational actions without exposing unnecessary patient details

## Repository

GitHub:

```txt
https://github.com/AshlyVuba/The-Insulin-Express
```
