import { useState } from "react";
import { useUpdateSObjectMutation } from "../hooks/mutations/useUpdateSObjectMutation";
import { useSOQLInfiniteQuery } from "../hooks/soql/useSOQLInfiniteQuery";

type Account = {
	Id: string;
	Name: string;
	Industry?: string | null;
};

const SOQL = "SELECT Id, Name, Industry FROM Account ORDER BY Name LIMIT 10";

export function EditAccount() {
	const q = useSOQLInfiniteQuery<Account>(SOQL);
	const update = useUpdateSObjectMutation<Partial<Account>>({
		optimisticSoql: { soql: SOQL },
	});

	const records = q.data?.pages.flatMap((p) => p.records) ?? [];

	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftName, setDraftName] = useState("");

	function startEdit(r: Account) {
		setEditingId(r.Id);
		setDraftName(r.Name);
	}

	function save(r: Account) {
		update.mutate(
			{ sobjectType: "Account", id: r.Id, fields: { Name: draftName } },
			{
				onSettled: () => setEditingId(null),
			},
		);
	}

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-semibold">
				Edit Account (PATCH + optimistic)
			</h2>
			{q.isLoading && <p className="text-sm text-gray-500">Loading...</p>}
			{q.isError && (
				<p className="text-sm text-red-600">Error: {q.error.message}</p>
			)}
			{update.isError && (
				<p className="text-sm text-red-600">
					Update failed: {update.error?.message}
				</p>
			)}
			<ul className="divide-y rounded border border-gray-200">
				{records.map((r) => (
					<li key={r.Id} className="flex items-center gap-2 p-2 text-sm">
						<span className="font-mono text-xs text-gray-400 w-32 shrink-0">
							{r.Id}
						</span>
						{editingId === r.Id ? (
							<>
								<input
									className="flex-1 rounded border border-gray-300 p-1"
									value={draftName}
									onChange={(e) => setDraftName(e.target.value)}
								/>
								<button
									type="button"
									className="rounded bg-green-600 px-3 py-1 text-white"
									onClick={() => save(r)}
									disabled={update.isPending}
								>
									Save
								</button>
								<button
									type="button"
									className="rounded border px-3 py-1"
									onClick={() => setEditingId(null)}
								>
									Cancel
								</button>
							</>
						) : (
							<>
								<span className="flex-1">{r.Name}</span>
								<button
									type="button"
									className="rounded border px-3 py-1 hover:bg-gray-50"
									onClick={() => startEdit(r)}
								>
									Edit
								</button>
							</>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}
