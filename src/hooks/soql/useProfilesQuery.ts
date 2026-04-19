import {
	type UseSOQLInfiniteQueryOptions,
	useSOQLInfiniteQuery,
} from "./useSOQLInfiniteQuery";

export type Profile = {
	Id: string;
	Name: string;
};

const SOQL = "SELECT Id, Name FROM Profile ORDER BY Name";

export function useProfilesQuery(options: UseSOQLInfiniteQueryOptions = {}) {
	return useSOQLInfiniteQuery<Profile>(SOQL, {
		// Profiles rarely change — keep in cache for a full day
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24,
		...options,
	});
}
