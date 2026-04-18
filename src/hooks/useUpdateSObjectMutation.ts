import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSFClient } from "../client";
import { useSFContext } from "../provider";
import { soqlKeys, type SOQLQueryResult, type SOQLRecord } from "./useSOQLInfiniteQuery";

export type UpdateSObjectVariables<TFields extends Record<string, unknown> = Record<string, unknown>> = {
  sobjectType: string;
  id: string;
  fields: TFields;
};

export type UseUpdateSObjectMutationOptions = {
  /** If provided, run optimistic updates against the matching infinite SOQL query */
  optimisticSoql?: { soql: string; tooling?: boolean };
};

type SnapshotEntry = {
  key: readonly unknown[];
  data: { pages: SOQLQueryResult[]; pageParams: (string | null)[] } | undefined;
};

export function useUpdateSObjectMutation<TFields extends Record<string, unknown> = Record<string, unknown>>(
  options: UseUpdateSObjectMutationOptions = {},
) {
  const client = useSFClient();
  const queryClient = useQueryClient();
  const { instanceUrl } = useSFContext();

  return useMutation<
    void,
    Error,
    UpdateSObjectVariables<TFields>,
    { snapshots: SnapshotEntry[] }
  >({
    mutationFn: async ({ sobjectType, id, fields }) => {
      await client.patch<void>(`sobjects/${sobjectType}/${id}`, {
        data: fields,
      });
    },
    onMutate: async (vars) => {
      const snapshots: SnapshotEntry[] = [];
      if (!options.optimisticSoql) return { snapshots };

      const key = soqlKeys.query(
        instanceUrl,
        options.optimisticSoql.soql,
        options.optimisticSoql.tooling ?? false,
      );

      await queryClient.cancelQueries({ queryKey: key });

      const prev = queryClient.getQueryData<{
        pages: SOQLQueryResult[];
        pageParams: (string | null)[];
      }>(key);
      snapshots.push({ key, data: prev });

      if (prev) {
        const next = {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            records: page.records.map((r: SOQLRecord) =>
              r.Id === vars.id ? { ...r, ...vars.fields } : r,
            ),
          })),
        };
        queryClient.setQueryData(key, next);
      }

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach((s) => {
        queryClient.setQueryData(s.key, s.data);
      });
    },
    onSettled: (_data, _err, _vars, context) => {
      context?.snapshots.forEach((s) => {
        queryClient.invalidateQueries({ queryKey: s.key });
      });
    },
  });
}
