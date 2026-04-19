import { useCallback, useState } from "react";
import { AccountList } from "./examples/AccountList";
import { DescribeViewer } from "./examples/DescribeViewer";
import { EditAccount } from "./examples/EditAccount";
import { OrgLimits } from "./examples/OrgLimits";
import { ProfileList } from "./examples/ProfileList";
import { SFProvider } from "./provider";

type Tab = "accounts" | "profiles" | "limits" | "describe" | "edit";

const TABS: [Tab, string, string][] = [
	["accounts", "Accounts", "infinite SOQL + pagination"],
	["profiles", "Profiles", "long staleTime (24 h cache)"],
	["limits", "Org Limits", "REST API + progress bars"],
	["describe", "Describe", "schema inspection"],
	["edit", "Edit", "optimistic mutation"],
];

type Creds = {
	token: string;
	instanceUrl: string;
	apiVersion: string;
};

const STORAGE_KEY = "sf-rq-examples-creds";

function loadCreds(): Creds | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as Creds;
	} catch {
		return null;
	}
}

function CredsForm({ onSubmit }: { onSubmit: (c: Creds) => void }) {
	const [token, setToken] = useState("");
	const [instanceUrl, setInstanceUrl] = useState("");
	const [apiVersion, setApiVersion] = useState("v62.0");

	return (
		<form
			className="mx-auto mt-16 max-w-xl space-y-4 rounded border border-gray-200 p-6"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit({
					token: token.trim(),
					instanceUrl: instanceUrl.trim().replace(/\/+$/, ""),
					apiVersion: apiVersion.trim() || "v62.0",
				});
			}}
		>
			<h1 className="text-2xl font-bold">Salesforce + React Query Examples</h1>
			<p className="text-sm text-gray-600">
				Paste a Salesforce session token and instance URL. Stored in
				sessionStorage only.
			</p>
			<label className="block">
				<span className="text-sm font-medium">Instance URL</span>
				<input
					className="mt-1 w-full rounded border border-gray-300 p-2"
					placeholder="https://yourorg.my.salesforce.com"
					value={instanceUrl}
					onChange={(e) => setInstanceUrl(e.target.value)}
					required
				/>
			</label>
			<label className="block">
				<span className="text-sm font-medium">Session Token</span>
				<input
					className="mt-1 w-full rounded border border-gray-300 p-2 font-mono text-xs"
					placeholder="00D…"
					value={token}
					onChange={(e) => setToken(e.target.value)}
					required
				/>
			</label>
			<label className="block">
				<span className="text-sm font-medium">API Version</span>
				<input
					className="mt-1 w-full rounded border border-gray-300 p-2"
					value={apiVersion}
					onChange={(e) => setApiVersion(e.target.value)}
				/>
			</label>
			<button
				type="submit"
				className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Continue
			</button>
			<p className="text-xs text-gray-500">
				Tip: <code>sf org display --target-org &lt;alias&gt;</code> shows Access
				Token + Instance URL.
			</p>
		</form>
	);
}

export default function App() {
	const [creds, setCreds] = useState<Creds | null>(loadCreds);
	const [tab, setTab] = useState<Tab>("accounts");

	const getToken = useCallback(() => creds?.token ?? "", [creds]);

	if (!creds) {
		return (
			<CredsForm
				onSubmit={(c) => {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c));
					setCreds(c);
				}}
			/>
		);
	}

	return (
		<SFProvider
			getToken={getToken}
			instanceUrl={creds.instanceUrl}
			apiVersion={creds.apiVersion}
		>
			<div className="mx-auto max-w-5xl space-y-6 p-6">
				<header className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">SF + React Query Examples</h1>
					<button
						type="button"
						className="text-xs text-gray-500 underline"
						onClick={() => {
							sessionStorage.removeItem(STORAGE_KEY);
							setCreds(null);
						}}
					>
						Reset credentials
					</button>
				</header>
				<p className="text-xs text-gray-500">
					Connected to <code>{creds.instanceUrl}</code> ({creds.apiVersion})
				</p>
				<nav className="flex gap-1 border-b overflow-x-auto">
					{TABS.map(([k, label, hint]) => (
						<button
							type="button"
							key={k}
							title={hint}
							className={`shrink-0 border-b-2 px-3 py-2 text-sm ${
								tab === k
									? "border-blue-600 font-medium text-blue-700"
									: "border-transparent text-gray-600 hover:text-gray-900"
							}`}
							onClick={() => setTab(k)}
						>
							{label}
						</button>
					))}
				</nav>
				{tab === "accounts" && <AccountList />}
				{tab === "profiles" && <ProfileList />}
				{tab === "limits" && <OrgLimits />}
				{tab === "describe" && <DescribeViewer />}
				{tab === "edit" && <EditAccount />}
			</div>
		</SFProvider>
	);
}
