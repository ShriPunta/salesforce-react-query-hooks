import { useEffect, useState } from "react";

type Props = {
	dataUpdatedAt: number;
	isFetching: boolean;
};

function useSecondsAgo(ts: number) {
	const [secs, setSecs] = useState(() => Math.floor((Date.now() - ts) / 1000));
	useEffect(() => {
		const id = setInterval(
			() => setSecs(Math.floor((Date.now() - ts) / 1000)),
			1000,
		);
		return () => clearInterval(id);
	}, [ts]);
	return secs;
}

export function CacheBadge({ dataUpdatedAt, isFetching }: Props) {
	const secs = useSecondsAgo(dataUpdatedAt);

	if (isFetching) {
		return (
			<span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
				<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
				fetching…
			</span>
		);
	}

	if (!dataUpdatedAt) return null;

	return (
		<span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
			<span className="h-1.5 w-1.5 rounded-full bg-green-400" />
			cached · {secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`}
		</span>
	);
}
