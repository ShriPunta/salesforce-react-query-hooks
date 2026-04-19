import { CacheBadge } from "../components/CacheBadge";
import { type Limits, useLimitsQuery } from "../hooks/api/useLimitsQuery";

const PRIORITY_LIMITS = [
	"DailyApiRequests",
	"DailyBulkApiBatches",
	"DailyBulkV2QueryFileStorageMB",
	"DailyDurableStreamingApiEvents",
	"DailyGenericStreamingApiEvents",
	"HourlyTimeBasedWorkflow",
	"DataStorageMB",
	"FileStorageMB",
	"ActiveScratchOrgs",
	"DailyScratchOrgs",
];

function usagePercent(max: number, remaining: number) {
	if (max === 0) return 0;
	return Math.round(((max - remaining) / max) * 100);
}

function barColor(pct: number) {
	if (pct >= 90) return "bg-red-500";
	if (pct >= 70) return "bg-yellow-400";
	return "bg-green-500";
}

function LimitRow({
	name,
	max,
	remaining,
}: {
	name: string;
	max: number;
	remaining: number;
}) {
	const pct = usagePercent(max, remaining);
	const used = max - remaining;

	return (
		<li className="space-y-1 p-3">
			<div className="flex items-center justify-between text-sm">
				<span className="font-mono text-xs">{name}</span>
				<span className="text-gray-500 text-xs">
					{used.toLocaleString()} / {max.toLocaleString()} used ({pct}%)
				</span>
			</div>
			<div className="h-1.5 w-full rounded-full bg-gray-100">
				<div
					className={`h-1.5 rounded-full ${barColor(pct)}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</li>
	);
}

function partitionLimits(limits: Limits) {
	const priority: [string, Limits[string]][] = [];
	const rest: [string, Limits[string]][] = [];
	for (const [k, v] of Object.entries(limits)) {
		(PRIORITY_LIMITS.includes(k) ? priority : rest).push([k, v]);
	}
	priority.sort(
		(a, b) => PRIORITY_LIMITS.indexOf(a[0]) - PRIORITY_LIMITS.indexOf(b[0]),
	);
	rest.sort((a, b) => a[0].localeCompare(b[0]));
	return { priority, rest };
}

export function OrgLimits() {
	const q = useLimitsQuery();
	const { priority, rest } = q.data
		? partitionLimits(q.data)
		: { priority: [], rest: [] };

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Org Limits</h2>
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
				staleTime: 5 min — click Refetch to force a background refresh; the UI
				stays responsive while the new data loads.
			</p>

			{q.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
			{q.isError && (
				<p className="text-sm text-red-600">Error: {q.error.message}</p>
			)}

			{q.data && (
				<div className="space-y-4">
					<div>
						<h3 className="mb-1 text-sm font-medium text-gray-700">
							Key limits
						</h3>
						<ul className="divide-y rounded border border-gray-200">
							{priority.map(([name, v]) => (
								<LimitRow
									key={name}
									name={name}
									max={v.Max}
									remaining={v.Remaining}
								/>
							))}
						</ul>
					</div>
					<details className="rounded border border-gray-200">
						<summary className="cursor-pointer p-3 text-sm text-gray-600 hover:bg-gray-50">
							All limits ({rest.length} more)
						</summary>
						<ul className="divide-y">
							{rest.map(([name, v]) => (
								<LimitRow
									key={name}
									name={name}
									max={v.Max}
									remaining={v.Remaining}
								/>
							))}
						</ul>
					</details>
				</div>
			)}
		</section>
	);
}
