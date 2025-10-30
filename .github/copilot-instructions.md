## Admin Dashboard — Copilot Instructions

Short: This file gives actionable, codebase-specific guidance so an AI coding agent can be productive quickly.

Key architecture (what to read first)
- Next.js (app router, TypeScript). Start with `app/layout.tsx` and `app/providers/ReactQueryProvider.tsx` to see global providers (React Query).
- UI components live in `app/components/` (notably `ProductModal.tsx`). Pages are under `app/` (e.g. `app/products/page.tsx`, `app/orders/page.tsx`).
- Shared client helpers live in `lib/` (see `lib/auth.ts` for API_BASE_URL, token helpers and `authenticatedFetch`).

Important patterns & conventions
- Auth: client stores JWT in localStorage under `STORAGE_KEYS.TOKEN` (value: `auth_token`). Use `getToken()`/`storeAuthData()`/`clearAuthData()` in `lib/auth.ts`.
- API base: `API_BASE_URL` is defined in `lib/auth.ts` (currently `https://pcprimedz.onrender.com`). Many client calls use full URLs.
- Product create/update: `ProductModal.tsx` sends multipart FormData with two keys:
  - `product` — a JSON string (JSON.stringify of product object)
  - `image` — optional File
  Ensure JSON is valid before appending; malformed JSON causes 400 "invalid character '-' in numeric literal" errors.
- Querying: React Query is used. Typical query keys: `['products']` and `['products', id]`. Use `useQueryClient().invalidateQueries({ queryKey: [...] })` after mutations.

Data shapes & domain specifics
- `app/types/products.ts` defines `Product` and `TabType`. Note `etat` is an enum: `"Neuf"|"Excellent"|"Tres Bon"|"Bon"|"Acceptable"` — always coerce values to one of these.
- `SPEC_FIELDS` and many spec keys contain accented or hyphenated names (e.g., `système`, `boîtier`) — JSON keys must be quoted and server must expect these exact keys.

Debugging & developer workflows
- Dev server: `npm run dev` (uses `next dev --turbopack`). Build: `npm run build`. Lint: `npm run lint`.
- Authentication & 401s: Client logs diagnostic output in `lib/auth.ts` (`authenticatedFetch`) and in `app/components/ProductModal.tsx` (create/update). When reproducing 401/400:
  1. Open browser DevTools Console and Network.
  2. Trigger the failing action (Add/Edit product).
  3. Copy the `createProduct: product JSON` console line and the server response body. These show whether Authorization header and `product` payload are correct.
- Quick manual HTTP test examples: `fetch` from browser console or curl/powershell using `Content-Type: application/json` or multipart/form-data for FormData tests.

Where AI agents commonly need to change code
- If adding client-side hooks, prefer React Query mutations placed in `app/components/ProductModal.tsx` and invalidate `['products']` after success.
- If changing auth behavior, update `lib/auth.ts` (centralized). Avoid duplicating token storage keys — use `STORAGE_KEYS.TOKEN`.
- When modifying API payloads, respect the `product` FormData schema (JSON string) and `image` file key. If the server expects raw JSON, update fetch headers accordingly instead of FormData.

Files to inspect for context/examples
- `app/components/ProductModal.tsx` — Product Form, create/update flows, logging, FormData construction.
- `lib/auth.ts` — token helpers, API_BASE_URL, `authenticatedFetch` with logging and 401 handling.
- `app/types/products.ts` — canonical Product type and allowed `etat` values.
- `app/providers/ReactQueryProvider.tsx` and `app/layout.tsx` — how React Query is wired into the app.

If something is unclear
- Paste console logs (product JSON and server response) when reporting API errors. The repo contains explicit logging which the agent should reference when diagnosing 401/400.

Feedback request
- If you want me to include run/debug snippets for Windows PowerShell (curl/powershell examples) or to merge with an existing `.github/copilot-instructions.md`, say so and I'll iterate.
