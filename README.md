# First Response Express — Frontend

Proactive triage dashboard for insulin-dependent patients at public health clinics.

## Tech Stack
- React 18 + React Router v6
- Axios with JWT interceptors
- Tailwind CSS
- Mock API layer (swap `USE_MOCK = false` when backend is ready)

## Getting Started

```bash
npm install
cp .env.example .env
npm start
```

## Project Structure

```
src/
├── api/
│   ├── axiosClient.js      # Axios instance with JWT interceptor + 401 handling
│   ├── authApi.js          # Login (mock + real)
│   ├── filingApi.js        # Filing room endpoints
│   └── pharmacyApi.js      # Pharmacy order endpoints
├── components/
│   ├── common/
│   │   ├── Layout.jsx      # Topbar + nav shell
│   │   ├── StatCard.jsx    # Reusable metric card
│   │   └── Toast.jsx       # Notification toast
│   ├── filing/             # (future: split FilingRoomPage into sub-components)
│   └── pharmacy/           # (future: split PharmacyPage into sub-components)
├── context/
│   └── AuthContext.jsx     # JWT auth state, login/logout
├── hooks/
│   ├── useFiling.js        # Filing data + actions
│   └── usePharmacy.js      # Pharmacy data + actions
├── pages/
│   ├── LoginPage.jsx
│   ├── FilingRoomPage.jsx
│   └── PharmacyPage.jsx
└── utils/
    └── helpers.js          # formatDate, getInitials, sanitize

## Connecting to the Real Backend
1. Set REACT_APP_API_URL in .env
2. In each api/*.js file, set USE_MOCK = false
3. Ensure backend returns { access_token, user: { name, role, clinic } } on POST /auth/login

## Security Notes (POPIA Compliance)
- JWT stored in sessionStorage (cleared on tab close) — not localStorage
- Axios interceptor auto-attaches Bearer token to every request
- 401 responses force logout and redirect to /login
- No patient data is ever logged to the console in production
