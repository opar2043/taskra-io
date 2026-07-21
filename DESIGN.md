# DESIGN.md — Taskra design system (taskra-client)

Two moods, one token set:
- **Marketing / public pages** — warm, editorial, photography-forward (Travelar reference):
  cream backgrounds, Fraunces serif display headings, pill CTAs, framed imagery.
- **Dashboard** — clean, data-dense, efficient (Finexy reference): white surfaces on a cool
  light canvas, Inter only (never the serif), rounded cards, tinted status pills, capsule bars.

## 1. Tokens (CSS variables in `src/index.css`, mirrored in `tailwind.config.js`)

| Token | Value | Tailwind alias | Use |
|---|---|---|---|
| `--color-primary` | `#FE6D06` | `primary` | CTAs, active states, key numbers — THE accent |
| `--color-primary-hover` | `#E55F00` | `primary-hover` | hover state of primary |
| `--color-primary-tint` | `#FFF1E6` | `primary-tint` | badge/pill/icon-chip backgrounds, nav active tint |
| `--color-ink` | `#14141F` | `ink` | headings, dark buttons, chart "actual" series |
| `--color-body` | `#4B4B57` | `body-text` | body copy, secondary text |
| `--color-bg-cream` | `#F7F5F1` | `cream` | marketing section backgrounds |
| `--color-bg-app` | `#F5F6F8` | `app-bg` | dashboard canvas |
| `--color-surface` | `#FFFFFF` | `surface` | cards, sidebar, topbar |
| `--color-border` | `#ECEAE5` | `line` | hairlines on cream/white (marketing) |
| `--color-border-app` | `#E7E9EE` | `line-app` | hairlines in dashboard |
| `--color-success-bg/-text` | `#E7F7EC` / `#1E9E4D` | `success-bg/success-text` | completed/paid pills |
| `--color-danger-bg/-text` | `#FDEAEA` / `#E13B3B` | `danger-bg/danger-text` | error/cancelled pills |
| `--color-pending-bg/-text` | `#FDECEC` / `#E2685F` | `pending-bg/pending-text` | pending pills |

**Single accent rule:** `#FE6D06` is the only accent. Everything else stays neutral.

## 2. Typography

- **Display (marketing H1/H2 only):** Fraunces — class `font-display`. Never in the dashboard.
- **UI/body (everywhere):** Inter — default `font-sans`.
- Scale: H1 44–56px/1.1 (`text-5xl md:text-6xl`), H2 32–36px/1.15, H3 22–24px,
  body 15–16px/1.6, eyebrow/labels 12–13px uppercase tracked (`tk-eyebrow`, `tk-nav-section`).

## 3. Shape & elevation

- Cards: `rounded-2xl`, soft shadow `0 4px 20px rgba(20,20,31,0.06)` (`shadow-soft`), optional
  hairline border only.
- Buttons: **pill** (`rounded-full`) for marketing CTAs; `rounded-xl` for dashboard actions.
- Signature image treatment (marketing): **offset double-frame** — image inside a white/cream
  padded frame (`.frame-img`) with soft shadow, optional slight rotate on the backing layer.
- Icon chips: `rounded-xl` square, solid primary fill, white icon (`.icon-chip`).
- Status pills: fully rounded, tinted bg + colored text (`tk-badge-*`), never solid fill.

## 4. Charts (Recharts, dashboard)

- Bars: fully rounded capsules (`radius={[12,12,12,12]}`, narrow `barSize`).
- Primary series `#FE6D06` (target/budget variant may use the striped pattern fill),
  comparison series `#14141F`.
- Tooltip: dark rounded bubble, white text (shared `chartTooltip` style).
- Grid: horizontal only, `#E7E9EE` dashed; no vertical gridlines.

## 5. Layout language

- **Marketing:** generous whitespace, centered section headers (eyebrow → serif heading →
  subheading), 3–4 col card grids, subtle dotted-grid / wavy-line SVG decorations in corners
  (low opacity), footer with newsletter pill input and social pills.
- **Dashboard:** fixed left sidebar `w-64` (grouped nav via `tk-nav-section` / `tk-nav-link`,
  off-canvas below `md`), sticky topbar (search, `NotificationBar`, messages, avatar dropdown),
  content `tk-page`: KPI stat row → chart row → `tk-table` data table.

## 6. Component classes (in `index.css`, same names as pixlo-frontend, restyled)

`tk-page` `tk-page-title` `tk-eyebrow` `tk-section-title` `tk-card` `tk-btn` `tk-btn-primary`
(orange, was navy) `tk-btn-secondary` `tk-btn-dark` `tk-icon-btn` `tk-input` `tk-table-wrap`
`tk-table` `tk-thead` `tk-th` `tk-row` `tk-td` `tk-td-muted` `tk-badge` `tk-badge-success`
`tk-badge-error` `tk-badge-warning` `tk-badge-info` (orange-tint, was blue) `tk-badge-neutral`
`tk-nav-section` `tk-nav-link` (+`.active` orange tint) `tk-nav-icon`
Marketing extras: `mk-eyebrow` `mk-h1` `mk-h2` `mk-lead` `btn-pill` `btn-pill-outline`
`frame-img` `icon-chip` `dot-grid`.

## 7. Before / after vs pixlo-frontend

| Aspect | Before (pixlo-frontend) | After (taskra-client) | Why |
|---|---|---|---|
| Accent | Marketing orange `#FC6A03` + dashboard blue/navy `#2563EB`/`#1E3A8A` — two systems | One accent `#FE6D06` everywhere | One brand, orange keeps its punch |
| Headings | Sans everywhere, navy `#111651` | Fraunces serif on marketing, ink `#14141F`; Inter in dashboard | Editorial warmth vs data clarity |
| Backgrounds | White marketing, `#F8F9FB` dashboard | Cream `#F7F5F1` marketing, `#F5F6F8` dashboard | Warm vs cool separation, shared tokens |
| Colors in JSX | Raw hex literals everywhere | Tailwind token classes (`text-primary`…) | Rethemable, consistent |
| Buttons | Mixed rounded-lg/xl/full | Pills on marketing, rounded-xl in app | Signature language from references |
| Status | tk-badge blue/green/red on saturated tints | Softer tinted pills from token table | Finexy reference |
| Confirms | window.confirm in places | confirmToast everywhere | §6 of the brief |
| Socket URL | hardcoded in connectSkt.js | `VITE_SOCKET_URL` env | config over constants |
| Logo | https://i.ibb.co/G4k8xvLB/taskra-logo.png (navbar, sidebar, auth) | same | brand continuity |
