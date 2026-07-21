# CODE_PATTERNS.md — ground truth for taskra-client

Derived from a full audit of `pixlo-frontend/` (2026-07-21). **Every file in taskra-client
must conform to these patterns.** Where this document conflicts with generic React best
practice, this document wins. Where the master redesign prompt conflicted with the existing
repo, the repo pattern was kept (per the prompt's own rule) — those decisions are recorded
at the bottom.

## Folder structure (mirrors pixlo-frontend exactly)

```
taskra-client/
├─ src/
│  ├─ main.jsx                  # entry: router + providers + page() helper — the ONLY route table
│  ├─ index.css                 # Tailwind layers + design tokens + .tk-* component classes
│  └─ components/
│     ├─ Root/                  # App shell: Root, Navbar, Footer, Error, Loading, ScrollToTop, About
│     ├─ Home/                  # Landing sections (Home composes leaf sections)
│     ├─ Firebase/              # AuthProvider, firebase.config.js, Login, Register
│     ├─ Hooks/                 # useAxios + one useXxx.jsx per resource + connectSkt.js
│     ├─ utils/                 # imageToWebp.js, uploadImage.js, toastConfirm.jsx, NoData.jsx, firebaseErrors.js
│     ├─ Freelencer/            # Public professional discovery + profile (spelling is intentional)
│     ├─ Jobs/                  # Public job list/detail + cards
│     ├─ Service/               # ServiceSearch lead-capture wizard (home hero)
│     ├─ Review/                # Review cards
│     ├─ Chat/                  # ChatLayout, ChatWindow, ConversationList, MessageBubble, QuoteModal
│     ├─ payments/              # Payment, CheckoutForm, Confirm (lowercase folder is intentional)
│     ├─ Pricing/  Contact/  Professional/
│     ├─ DashboardTutorial/     # TutorialModal first-visit overlay
│     └─ Dashboard/
│        ├─ AdminPanel/         # Dashboard.jsx (SHELL), AllThing.jsx (home), Analytics/, AdminJobs/,
│        │                      #   UserManagment/, Orders/, AdminSetting/
│        ├─ ClientPanel/        # Jobs/ (PostJob, MyJobs, EditJobs), ActiveJobs/, FreelenceQuery/
│        ├─ FreelencerPanel/    # BrowseJob/, Proposal/, Projects/, Agreements/, Questionnaire/,
│        │                      #   EmailTemplate/, EarningFreelence/, utils/
│        ├─ Profile/            # Profile, Setting, Calender, ViewProfile
│        ├─ SharedPanel/        # Invoice, NotificationBar, TutorialModal
│        └─ Routes/             # ClientRoute.jsx, FreelencerRout.jsx, AdminRoute.jsx (sidebars)
```

## Naming

- Components: **PascalCase**, one component per file, `.jsx`, arrow function + default export:
  `const MyJobs = () => { ... }; export default MyJobs;`
- Feature folders often name the main file after the folder (`BrowseJob/BrowseJob.jsx`).
- Hooks: `useXxx.jsx` (JSX extension even without JSX), camelCase filename = exported hook name.
  Non-hook helper in Hooks/ is plain `.js` (`connectSkt.js`).
- utils: `.js` for pure helpers, `.jsx` when returning React elements.
- **Legacy spellings are kept on purpose** so both codebases read the same:
  `Freelencer` (not Freelancer) in file/folder names, `FreelencerRout.jsx`, `Calender.jsx`,
  `UserManagment/`, `useFrelencerStat.jsx`. Internal variables may use correct spelling.
- Role booleans are lowercase: `isadmin`, `isclient`, `isfreelancer`.
- Roles are `admin` | `client` | `professional` (admin check also accepts `owner`).

## Data layer

- One shared axios instance (`Hooks/useAxios.jsx`), `baseURL = import.meta.env.VITE_API_URL`,
  no interceptors, no auth header. Consumed as `const axiosSecure = useAxios();`.
- One TanStack Query hook per resource in `Hooks/`: array `queryKey`, inline async `queryFn`
  returning `res.data`. Global defaults (main.jsx): `staleTime: 5*60*1000`,
  `refetchOnWindowFocus: false`, `retry: 1`.
- Return shapes (match originals — do not "fix"):
  - `useJobs` → tuple `[jobs, refetch, isLoading]`
  - `useUser` → object `{ users, refetch, isLoading }`
  - `useLoginUser` → `{ currentUser }` (finds DB user by Firebase email)
  - New resource hooks default to the tuple form `[data, refetch, isLoading]`.
- Mutations: **no useMutation** — call `axiosSecure.post/patch/put/delete(...)` directly inside
  the handler, then `toast.success/error(...)` and `refetch()`.
- Watch the backend verb per endpoint: most updates are PATCH, but faqs / pricing /
  featured-creatives / how-it-works use **PUT**, chat message edit is `PUT /messages/:id`,
  soft delete is `PUT /messages/delete/:id`. See API_CONTRACT.md.
- Most backend writes return the raw Mongo driver result (`{acknowledged, insertedId}` etc.),
  NOT the document — refetch after mutating. Exceptions: `POST /inbox-quote`,
  `POST /conversations`, `POST /messages` return the document.

## Auth

- Firebase Auth via `Firebase/AuthProvider.jsx` exposing `AuthContext` with:
  `{ user, loading, handleRegister, handleLogin, handleLogout, handleGoogle, resetPass, setUser }`.
- `useAuth()` = `useContext(AuthContext)`.
- App user record (role, profile) comes from the backend: `useLoginUser()` matches
  `users.find(u => u.email === firebaseUser.email)`.
- `firebase.config.js` reads `VITE_FIREBASE_*` env names, guards HMR:
  `getApps().length ? getApp() : initializeApp(cfg)`.
- Role gating: `useAdmin` / `useClient` / `useFreelencer` booleans; the Dashboard shell renders
  only the matching sidebar. taskra-client additionally redirects unauthenticated users from
  `/dashboard` to `/login` in the shell.

## Feedback / confirmations

- Toasts: **react-hot-toast** only. Global `<Toaster position="top-center" toastOptions={{duration:3500}} />`
  in main.jsx. `toast.success(...)` / `toast.error(...)`; warnings via `toast(msg, { icon: "⚠️" })`.
- Confirms: `confirmToast({ title, message, confirmText, danger })` from `utils/toastConfirm.jsx`
  (SweetAlert2, resolves boolean). **Never `window.confirm` / `alert`.**
- Empty states: shared `utils/NoData.jsx`.
- Loading: shared `Root/Loading.jsx` for page-level; small inline spinners are fine inside cards.
- First-visit page intro: `DashboardTutorial/TutorialModal.jsx` with
  `componentName / title / description / listItems` props on dashboard pages.

## Images

- Every upload goes through `await uploadImage(file)` (`utils/uploadImage.js`):
  client-side **WebP** conversion (`imageToWebp.js`, quality 0.82, max width 1600) → ImgBB
  (`VITE_IMGBB_KEY`) → returns hosted URL. Never post a raw file.
- Static imagery uses `.webp` URLs.

## Routing

- All routes declared in `src/main.jsx` via `createBrowserRouter`; every element is
  `React.lazy` wrapped by `page(el)` (Suspense + `<Loading/>`).
- Route paths are IDENTICAL to pixlo-frontend (payment redirects and questionnaire links from
  the backend depend on them): see main.jsx for the table.
- Provider stack: `QueryClientProvider` → `AuthProvider` → `Toaster` + `Suspense` → `RouterProvider`.

## Styling

- Tailwind 3 + DaisyUI, Inter (UI everywhere) + Fraunces (marketing H1/H2 only, `font-display`).
- Design tokens live as CSS variables + Tailwind theme colors — see DESIGN.md. Prefer Tailwind
  token classes (`text-primary`, `bg-cream`, `border-line`) over raw hex in JSX.
- Dashboard chrome uses the `.tk-*` component classes from `index.css`
  (`tk-page`, `tk-card`, `tk-btn-primary`, `tk-table*`, `tk-badge-*`, `tk-nav-*`, `tk-input`…).
  Reuse them — do not re-invent per page.
- The single accent color is Taskra orange `#FE6D06`. No second accent.

## Sockets

- `connectSkt()` in `Hooks/connectSkt.js` → `io(import.meta.env.VITE_SOCKET_URL)`.
- Chat treats HTTP as source of truth (`POST /messages`, `GET /messages/:conversationId`);
  socket events (`joinConversation`, `receiveMessage`, `messageEdited`, `messageDeleted`) are a
  realtime enhancement (serverless prod has no persistent socket server).

## Decisions where master prompt conflicted with the repo (repo won)

| Topic | Master prompt | Repo / taskra-client |
|---|---|---|
| Toasts | shadcn Sonner | react-hot-toast (already global) |
| Confirm hook | new `useConfirmAction` | existing `confirmToast` util |
| Lazy routes | avoid React.lazy | every route lazy + `page()` (repo convention) |
| Folder shape | features/ pages/ lib/ | `src/components/<Feature>/` (repo convention) |
| Brand orange | `#FE6D06` | **#FE6D06 adopted** (design directive, not code pattern) |
