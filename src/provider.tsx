import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";

export type SFContextValue = {
	getToken: () => string | Promise<string>;
	instanceUrl: string;
	apiVersion: string;
};

const SFContext = createContext<SFContextValue | null>(null);

export type SFProviderProps = {
	getToken: () => string | Promise<string>;
	instanceUrl: string;
	apiVersion?: string;
	queryClient?: QueryClient;
	children: ReactNode;
};

export function SFProvider({
	getToken,
	instanceUrl,
	apiVersion = "v62.0",
	queryClient,
	children,
}: SFProviderProps) {
	const client = useMemo(
		() =>
			queryClient ??
			new QueryClient({
				defaultOptions: {
					queries: { retry: false, staleTime: 1000 * 60 * 5 },
				},
			}),
		[queryClient],
	);

	const value = useMemo<SFContextValue>(
		() => ({ getToken, instanceUrl, apiVersion }),
		[getToken, instanceUrl, apiVersion],
	);

	return (
		<SFContext.Provider value={value}>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</SFContext.Provider>
	);
}

export function useSFContext(): SFContextValue {
	const ctx = useContext(SFContext);
	if (!ctx) {
		throw new Error("useSFContext must be used within an <SFProvider>");
	}
	return ctx;
}
