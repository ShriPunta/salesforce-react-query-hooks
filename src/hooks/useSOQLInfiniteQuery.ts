import { useInfiniteQuery } from "@tanstack/react-query";
import { useSFClient } from "../client";
import { useSFContext } from "../provider";
import { SOQLQueryResultSchema, type SOQLQueryResult as SOQLQueryResultT } from "../schemas";

export type SOQLRecord = Record<string, unknown> & {
  attributes?: { type: string; url?: string };
  Id?: string;
};

export type SOQLQueryResult<T extends SOQLRecord = SOQLRecord> = Omit<SOQLQueryResultT, "records"> & {
  records: T[];
};

export type UseSOQLInfiniteQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  /** If true, hit the Tooling API instead of REST data API */
  tooling?: boolean;
};

export const soqlKeys = {
  all: ["sf-soql"] as const,
  query: (instanceUrl: string, soql: string, tooling: boolean) =>
    [...soqlKeys.all, instanceUrl, tooling ? "tooling" : "data", soql] as const,
};

export function useSOQLInfiniteQuery<T extends SOQLRecord = SOQLRecord>(
  soql: string,
  options: UseSOQLInfiniteQueryOptions = {},
) {
  const client = useSFClient();
  const { instanceUrl } = useSFContext();
  const tooling = options.tooling ?? false;

  return useInfiniteQuery<
    SOQLQueryResult<T>,
    Error,
    { pages: SOQLQueryResult<T>[]; pageParams: (string | null)[] },
    ReturnType<typeof soqlKeys.query>,
    string | null
  >({
    queryKey: soqlKeys.query(instanceUrl, soql, tooling),
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return client.get(pageParam, {
          absolutePath: true,
          schema: SOQLQueryResultSchema,
        }) as Promise<SOQLQueryResult<T>>;
      }
      const endpoint = tooling
        ? `tooling/query?q=${encodeURIComponent(soql)}`
        : `query?q=${encodeURIComponent(soql)}`;
      return client.get(endpoint, { schema: SOQLQueryResultSchema }) as Promise<SOQLQueryResult<T>>;
    },
    getNextPageParam: (lastPage) =>
      lastPage.done ? undefined : lastPage.nextRecordsUrl,
    enabled: !!soql.trim() && options.enabled !== false,
    staleTime: options.staleTime ?? 1000 * 60 * 5,
    gcTime: options.gcTime ?? 1000 * 60 * 60,
  });
}
