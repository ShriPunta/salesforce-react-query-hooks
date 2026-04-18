import { useState } from "react";
import { useSOQLInfiniteQuery } from "../hooks/useSOQLInfiniteQuery";

type Account = {
  Id: string;
  Name: string;
  Industry?: string | null;
};

const DEFAULT_SOQL =
  "SELECT Id, Name, Industry FROM Account ORDER BY CreatedDate DESC LIMIT 50";

export function AccountList() {
  const [soql, setSoql] = useState(DEFAULT_SOQL);
  const [activeSoql, setActiveSoql] = useState(DEFAULT_SOQL);

  const q = useSOQLInfiniteQuery<Account>(activeSoql);

  const records = q.data?.pages.flatMap((p) => p.records) ?? [];
  const totalSize = q.data?.pages[0]?.totalSize ?? 0;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Infinite SOQL: Accounts</h2>

      <div className="flex gap-2">
        <textarea
          className="flex-1 rounded border border-gray-300 p-2 font-mono text-sm"
          rows={3}
          value={soql}
          onChange={(e) => setSoql(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => setActiveSoql(soql)}
        >
          Run
        </button>
      </div>

      {q.isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {q.isError && (
        <p className="text-sm text-red-600">Error: {q.error.message}</p>
      )}

      {q.data && (
        <>
          <p className="text-sm text-gray-600">
            Loaded {records.length} of {totalSize} records
          </p>
          <ul className="divide-y rounded border border-gray-200">
            {records.map((r) => (
              <li key={r.Id} className="p-2 text-sm">
                <span className="font-mono text-xs text-gray-400">{r.Id}</span>{" "}
                <span className="font-medium">{r.Name}</span>
                {r.Industry && (
                  <span className="ml-2 text-gray-500">[{r.Industry}]</span>
                )}
              </li>
            ))}
          </ul>
          {q.hasNextPage && (
            <button
              className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={q.isFetchingNextPage}
              onClick={() => q.fetchNextPage()}
            >
              {q.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
