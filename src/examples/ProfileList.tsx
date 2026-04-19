import { CacheBadge } from "../components/CacheBadge";
import { useProfilesQuery } from "../hooks/soql/useProfilesQuery";

export function ProfileList() {
	const q = useProfilesQuery();
	const records = q.data?.pages.flatMap((p) => p.records) ?? [];
	const totalSize = q.data?.pages[0]?.totalSize ?? 0;

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Profiles</h2>
				<div className="flex items-center gap-2">
					<CacheBadge
						dataUpdatedAt={q.dataUpdatedAt}
						isFetching={q.isFetching}
					/>
					<button
						type="button"
						className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
						disabled={q.isFetching}
						onClick={() => q.refetch()}
					>
						Refetch
					</button>
				</div>
			</div>

			<p className="text-xs text-gray-500">
				staleTime: 24 h — navigate away and back; data loads instantly from
				cache without a network request.
			</p>

			{q.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
			{q.isError && (
				<p className="text-sm text-red-600">Error: {q.error.message}</p>
			)}

			{q.data && (
				<>
					<p className="text-sm text-gray-600">
						{records.length} of {totalSize} profiles
					</p>
					<ul className="divide-y rounded border border-gray-200">
						{records.map((r) => (
							<li key={r.Id} className="flex items-center gap-3 p-2 text-sm">
								<span className="font-mono text-xs text-gray-400">{r.Id}</span>
								<span>{r.Name}</span>
							</li>
						))}
					</ul>
					{q.hasNextPage && (
						<button
							type="button"
							className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
							disabled={q.isFetchingNextPage}
							onClick={() => q.fetchNextPage()}
						>
							{q.isFetchingNextPage ? "Loading…" : "Load more"}
						</button>
					)}
				</>
			)}
		</section>
	);
}
