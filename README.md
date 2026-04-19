# salesforce-react-query-examples

Reference patterns for hitting the Salesforce REST API **directly from the browser** using React Query — organised so each pattern is easy to copy, extend, and own.

## Demos

| Tab | Hook | What it shows |
|-----|------|---------------|
| Accounts | `useAccountsQuery` | Infinite SOQL + cursor pagination |
| Profiles | `useProfilesQuery` | 24 h `staleTime` — instant cache hits on revisit |
| Org Limits | `useLimitsQuery` | REST API (non-SOQL) + background refetch |
| Describe | `useDescribeQuery` | SObject schema inspection |
| Edit | `useUpdateSObjectMutation` | Optimistic PATCH + rollback on error |

Every tab shows a `CacheBadge` — a live indicator of whether data came from cache or triggered a network request. This makes React Query's stale-while-revalidate behaviour visible without opening DevTools.

## Quickstart

```bash
bun install
bun run dev
```

Open the app, paste:

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

In production (i.e. a real deployed app) you would either:
- keep a backend proxy, or
- allowlist your origin in **Setup → CORS**.

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

Hooks live in three subdirectories that mirror how the Salesforce API itself is divided.

```
src/hooks/
  soql/
    useSOQLInfiniteQuery.ts   ← base: any SOQL query with pagination
    useAccountsQuery.ts       ← specific: Account records (staleTime 5 m)
    useProfilesQuery.ts       ← specific: Profile records (staleTime 24 h)
  api/
    useDescribeQuery.ts       ← sobjects/{Type}/describe (staleTime 30 m)
    useLimitsQuery.ts         ← /limits endpoint (staleTime 5 m)
  mutations/
    useUpdateSObjectMutation.ts ← PATCH with optimistic update + rollback
```

**Pattern:** one generic base hook per API shape (`useSOQLInfiniteQuery`, `useLimitsQuery`), then thin wrappers that pin the query string and tweak `staleTime` to match how often the data actually changes. Adding a new SOQL-backed hook means copying `useAccountsQuery.ts` and changing the query.

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

MIT — Copyright (c) 2026 Shridhar Puntambekar
