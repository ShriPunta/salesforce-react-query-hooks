# salesforce-react-query-examples

Reference patterns for hitting the Salesforce REST API **directly from the browser** using React Query.

Three demos:

- `useSOQLInfiniteQuery` — `/query?q=...` with `nextRecordsUrl` cursor pagination via `useInfiniteQuery`
- `useDescribeQuery` — `/sobjects/{Type}/describe`
- `useUpdateSObjectMutation` — `PATCH /sobjects/{Type}/{id}` with optimistic update + rollback

No backend, no proxy. You paste a session token + instance URL into the provider.

## Quickstart

```bash
bun install
bun run dev
```

Open the app, paste:

1. **Instance URL** — e.g. `https://yourorg.my.salesforce.com`
2. **Session token** — see below

The credentials live in `sessionStorage` only.

## Getting a session token

Easiest: Salesforce CLI.

```bash
sf org display --target-org <alias>
```

Use the `Access Token` and `Instance Url` it prints. Tokens expire — re-run when you get 401s.

## CORS caveat (REQUIRED)

Salesforce blocks browser fetches from arbitrary origins. You must allowlist your dev origin in the org:

**Setup -> CORS -> New** and add e.g. `http://localhost:5173`.

Without this you'll see CORS errors in DevTools and every request will fail. There is no workaround that doesn't involve a backend proxy.

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

`getToken` may return a `Promise<string>` if you want to wire in a refresh flow.

## Verification status

This repo's TypeScript and build pipelines are verified. Runtime data flow against a real Salesforce org has **not** been verified by the author — you'll need a real token + a CORS-allowlisted origin to test end-to-end.

## Layout

```
src/
  provider.tsx
  client.ts
  hooks/
    useSOQLInfiniteQuery.ts
    useDescribeQuery.ts
    useUpdateSObjectMutation.ts
  examples/
    AccountList.tsx
    DescribeViewer.tsx
    EditAccount.tsx
  App.tsx
  main.tsx
```

## License

MIT — Copyright (c) 2026 Shri
