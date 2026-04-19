import {
	type UseSOQLInfiniteQueryOptions,
	useSOQLInfiniteQuery,
} from "./useSOQLInfiniteQuery";

export type Account = {
	Id: string;
	Name: string;
	Industry?: string | null;
};

const SOQL =
	"SELECT Id, Name, Industry FROM Account ORDER BY CreatedDate DESC LIMIT 50";

export function useAccountsQuery(options: UseSOQLInfiniteQueryOptions = {}) {
	return useSOQLInfiniteQuery<Account>(SOQL, options);
}
