# SKILL.md — how to work in taskra-client

Read `CODE_PATTERNS.md` first; this file is the "how do I add X" cookbook.

## Add a new page

1. Create `src/components/<Feature>/<PageName>.jsx` — PascalCase, arrow function,
   default export. Dashboard pages start with:
   ```jsx
   const PageName = () => {
     const { currentUser } = useLoginUser();
     const [data, refetch, isLoading] = useSomething();
     if (isLoading) return <Loading />;
     return (
       <div className="tk-page">
         <TutorialModal componentName="page-name" title="..." description="..." listItems={[...]} />
         <div>
           <p className="tk-eyebrow">Section</p>
           <h1 className="tk-page-title">Page Title</h1>
         </div>
         {/* content in tk-card blocks */}
       </div>
     );
   };
   export default PageName;
   ```
2. Register the route in `src/main.jsx`: add a `lazy()` import at the top and a
   `{ path, element: page(<PageName />) }` entry in the right tree (public under `Root`,
   app under `/dashboard`, standalone otherwise).
3. If it's a dashboard page, add a `NavLink` in the right sidebar
   (`Dashboard/Routes/ClientRoute.jsx` | `FreelencerRout.jsx` | `AdminRoute.jsx`) using
   `tk-nav-link` + a `react-icons/fa` icon with class `tk-nav-icon`.

## Add a new data hook

Create `src/components/Hooks/use<Resource>.jsx`:

```jsx
import useAxios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

const useResource = () => {
  const axiosSecure = useAxios();
  const { data: resource, refetch, isLoading } = useQuery({
    queryKey: ["resource"],
    queryFn: async () => {
      const res = await axiosSecure.get("/resource");
      return res.data;
    },
  });
  return [resource, refetch, isLoading];   // tuple is the convention for new hooks
};

export default useResource;
```

Parameterized hooks take the param, put it in the `queryKey`, and set `enabled: !!param`.

## Mutations

No `useMutation`. Inside the handler:

```jsx
try {
  await axiosSecure.patch(`/jobs/${id}`, payload);   // check the verb in API_CONTRACT.md (CMS = PUT!)
  toast.success("Job updated");
  refetch();
} catch (err) {
  toast.error(err.response?.data?.message || err.response?.data?.error || "Something went wrong");
}
```

Destructive/high-stakes actions must gate on `confirmToast`:

```jsx
if (await confirmToast({ title: "Delete this job?", confirmText: "Yes, delete it", danger: true })) { ... }
```

## Images

Always `const url = await uploadImage(file)` (WebP conversion + ImgBB). Never post raw files.
Static imagery should be `.webp` URLs.

## Styling rules

- Marketing pages: `mk-h1/mk-h2/mk-eyebrow/mk-lead`, `btn-pill`, `frame-img`, `icon-chip`,
  cream backgrounds, Fraunces headings only here.
- Dashboard pages: `tk-*` classes only, Inter only, white `tk-card` on `bg-app-bg`.
- Never introduce a second accent color; use token classes, not raw hex.
- Charts: Recharts, capsule bars (#FE6D06 primary / #14141F comparison), dark rounded tooltip.

## Adding a heavy dependency

Add it to `manualChunks` in `vite.config.js` so it gets its own cacheable chunk,
and ask before introducing any new state manager / UI kit.
