# taskra-client

Redesigned frontend for **Taskra / Pixlo** — a UK photography & videography marketplace
(Bark-style lead generation) fused with a professional CRM (Studio Ninja-style pipeline,
agreements, invoices). This app replaces `pixlo-frontend/` visually while keeping the same
folder structure, code patterns, route paths, and backend (`pixlo-backend`) untouched.

- Marketing pages: warm, editorial, photography-forward (cream + Fraunces serif + orange pills).
- Dashboard: clean, data-dense app UI (white cards on a cool canvas, capsule charts, tinted pills).
- Single accent color everywhere: **#FE6D06**.

## Getting started

```bash
npm install
cp .env.example .env   # fill in values (this repo's .env was copied from pixlo-frontend)
npm run dev            # Vite dev server
npm run build          # production build to dist/
npm run preview        # serve the built dist/
npm run lint           # ESLint (flat config)
```

The app expects the companion API (`pixlo-backend`: Express + MongoDB + Socket.io + Mollie)
running at `VITE_API_URL`.

## Environment variables (names only — values are secret-ish, ship-to-browser config)

| Variable | Purpose |
| :-- | :-- |
| `VITE_API_URL` | Backend REST base URL (used by `useAxios`) |
| `VITE_SOCKET_URL` | Socket.io server URL (used by `connectSkt`) |
| `VITE_STRIPE_PK` | Stripe publishable key (checkout scaffolding) |
| `VITE_IMGBB_KEY` | ImgBB key for image hosting (WebP uploads) |
| `VITE_WEB3FORMS_KEY` | Web3Forms access key (notification emails) |
| `VITE_FIREBASE_*` | Firebase web config (API key, auth domain, project id, storage bucket, sender id, app id, measurement id) |

## Folder overview

```
src/
├─ main.jsx                  # router + providers + page() lazy helper (the only route table)
├─ index.css                 # design tokens + mk-*/tk-* component classes
└─ components/
   ├─ Root/                  # Navbar, Footer, Root layout, Error, Loading, About
   ├─ Home/  Service/        # landing sections + ServiceSearch lead wizard
   ├─ Firebase/              # AuthProvider, firebase.config, Login, Register
   ├─ Hooks/                 # useAxios + one hook per resource (+ connectSkt)
   ├─ utils/                 # uploadImage (WebP→ImgBB), confirmToast, NoData, firebaseErrors
   ├─ Freelencer/ Jobs/      # public discovery + job pages ("Freelencer" spelling is intentional)
   ├─ Pricing/ Contact/ Professional/ Review/
   ├─ Chat/                  # /chat/:id realtime messaging (HTTP-first, socket enhancement)
   ├─ payments/              # Mollie checkout (Payment, CheckoutForm, Confirm)
   ├─ DashboardTutorial/     # TutorialModal first-visit overlay (single canonical copy)
   └─ Dashboard/
      ├─ Dashboard.jsx       # dashboard shell (moved out of AdminPanel/ — see below)
      ├─ AllThing.jsx        # role-aware dashboard home (moved out of AdminPanel/)
      ├─ Routes/             # ClientRoute, FreelencerRout, AdminRoute sidebars
      ├─ ClientPanel/  FreelencerPanel/  AdminPanel/  Profile/  SharedPanel/
```

### Files intentionally relocated vs pixlo-frontend

Per repo-owner instruction ("put files in their relevant folder"):

| Old location (pixlo-frontend) | New location (taskra-client) | Why |
| :-- | :-- | :-- |
| `Dashboard/AdminPanel/Dashboard.jsx` | `Dashboard/Dashboard.jsx` | The shell serves all three roles, not just admin |
| `Dashboard/AdminPanel/AllThing.jsx` | `Dashboard/AllThing.jsx` | Role-aware home for all roles |
| `SharedPanel/TutorialModal.jsx` (duplicate) | `DashboardTutorial/TutorialModal.jsx` only | One canonical component |

Everything else keeps its original folder and (intentionally misspelled) names —
`Freelencer/`, `FreelencerRout.jsx`, `Calender.jsx`, `UserManagment/`, `useFrelencerStat.jsx` —
so both codebases read the same.

## Key docs

- `CODE_PATTERNS.md` — the conventions every new file must follow (audited from pixlo-frontend).
- `DESIGN.md` — design tokens, component classes, chart rules, before/after notes.
- `API_CONTRACT.md` — every backend endpoint this app calls (verbs, payloads, response shapes).
- `SKILL.md` — how to add a new page/hook/feature without breaking the patterns.
