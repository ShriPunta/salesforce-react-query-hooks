import { useQuery } from "@tanstack/react-query";
import { useSFClient } from "../client";
import { useSFContext } from "../provider";
import { DescribeSObjectResultSchema, type DescribeSObjectResult } from "../schemas";

export type { DescribeSObjectResult };

export const describeKeys = {
  all: ["sf-describe"] as const,
  sobject: (instanceUrl: string, sobjectName: string) =>
    [...describeKeys.all, instanceUrl, sobjectName] as const,
};

export type UseDescribeQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
};

export function useDescribeQuery(
  sobjectName: string,
  options: UseDescribeQueryOptions = {},
) {
  const client = useSFClient();
  const { instanceUrl } = useSFContext();

  return useQuery<DescribeSObjectResult>({
    queryKey: describeKeys.sobject(instanceUrl, sobjectName),
    queryFn: () =>
      client.get(`sobjects/${sobjectName}/describe`, {
        schema: DescribeSObjectResultSchema,
      }),
    enabled: !!sobjectName && options.enabled !== false,
    staleTime: options.staleTime ?? 1000 * 60 * 30,
  });
}
