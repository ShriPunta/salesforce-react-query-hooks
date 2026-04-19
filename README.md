# Salesforce React Query Examples

![Screenshot of the App](assets/screenshot.png)

A structured set of React Query hooks and live demo patterns for hitting the Salesforce REST API directly from the browser. Copy any hook into your own app or use this as a seed repo to build from.

Stack: **Bun** · Vite · React · TanStack Query · Zod · TypeScript.

> [!WARNING]
> **This is a learning and code-organisation demo — not a production pattern.**
>
> - The UI accepts a plain-text access token and holds it in page state. This is **not safe** for real users or sensitive orgs.
> - The dev server uses the **Vite dev proxy** to work around Salesforce's CORS restrictions. This proxy does not exist in a production build — the app will not work as-is when deployed.
>
> For a production app you need a proper OAuth 2.0 PKCE flow with a backend that handles token exchange and refresh securely. See the companion template: **[salesforce-oauth-pkce-hono-bun](https://github.com/ShriPunta/salesforce-oauth-pkce-hono-bun)**.

## Inspiration

While building [SFDevTools](https://www.sfdevtools.com), I leaned heavily on React Query — it made async Salesforce calls dramatically simpler and the app noticeably snappier. I couldn't find any existing hook libraries or seed repos targeting the Salesforce REST API, so I built this: a minimal, copy-paste-friendly reference for anyone learning React Query with a well-structured API like Salesforce's, or anyone who wants a head start on a real app.

## What it provides

- **Live cache visualisation** — every tab shows a `CacheBadge` that indicates whether data came from cache or a fresh network request, making React Query's stale-while-revalidate behaviour visible without opening DevTools.
- **Generic base hooks** — one reusable hook per API shape (`useSOQLInfiniteQuery`, `useDescribeQuery`, `useUpdateSObjectMutation`); specific hooks are thin wrappers that pin the query and set an appropriate `staleTime`.
- **Full mutation example** — optimistic PATCH with automatic rollback on error.
- **Zero CORS config needed** — the dev server proxies all Salesforce requests, so you can point the app at any org with just a session token.

## Demos

| Tab | Hook | What it shows |
|-----|------|---------------|
| Accounts | `useSOQLInfiniteQuery` | Infinite SOQL + cursor pagination |
| Profiles | `useSOQLInfiniteQuery` | 24 h `staleTime` — instant cache hits on revisit |
| Org Limits | `useLimitsQuery` | REST API (non-SOQL) + background refetch |
| Describe | `useDescribeQuery` | SObject schema inspection |
| Edit | `useUpdateSObjectMutation` | Optimistic PATCH + rollback on error |

## Quickstart

```bash
bun install
bun run dev
```

Open the app and paste:

1. **Instance URL** — e.g. `https://yourorg.my.salesforce.com`
2. **Session token** — see below

Credentials live in `sessionStorage` only.

## Getting a session token

```bash
sf org display --target-org <alias>
```

Use the `Access Token` and `Instance Url` it prints. Tokens expire — re-run when you get 401s.

## CORS

The dev server includes a dynamic proxy. All Salesforce requests are forwarded server-side, so **no CORS configuration is needed in your org** during local development. The proxy reads the `X-SF-Instance` header from each request to determine the target org — the instance URL you enter in the UI is forwarded automatically.

In production you would either keep a backend proxy or allowlist your origin in **Setup → CORS**.

## Provider

```tsx
import { SFProvider } from "./provider";

<SFProvider
  getToken={() => mySessionToken}
  instanceUrl="https://yourorg.my.salesforce.com"
  apiVersion="v62.0"
>
  <App />
</SFProvider>
```

`getToken` may return a `Promise<string>` to support async token refresh.

## Hook organisation

```
src/hooks/
  soql/
    useSOQLInfiniteQuery.ts     ← base: any SOQL query with pagination
    useAccountsQuery.ts         ← specific: Account records (staleTime 5 m)
    useProfilesQuery.ts         ← specific: Profile records (staleTime 24 h)
  api/
    useDescribeQuery.ts         ← sobjects/{Type}/describe (staleTime 30 m)
    useLimitsQuery.ts           ← /limits endpoint (staleTime 5 m)
  mutations/
    useUpdateSObjectMutation.ts ← PATCH with optimistic update + rollback
```

**Pattern:** one generic base hook per API shape, then thin wrappers that pin the query string and tune `staleTime` to how often the data actually changes. Adding a new SOQL-backed hook means copying `useAccountsQuery.ts` and changing the query.

## Layout

```
src/
  provider.tsx
  client.ts
  schemas.ts
  hooks/
    soql/
    api/
    mutations/
  examples/
    AccountList.tsx
    ProfileList.tsx
    OrgLimits.tsx
    DescribeViewer.tsx
    EditAccount.tsx
  components/
    CacheBadge.tsx
  App.tsx
  main.tsx
```

## License

MIT — Copyright (c) 2026 Shridhar Puntambekar.
