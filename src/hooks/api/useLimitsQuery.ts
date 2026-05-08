import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useSFClient } from "../../client";
import { useSFContext } from "../../provider";

export const LimitEntrySchema = z.object({
	Max: z.number(),
	Remaining: z.number(),
});
export const LimitsSchema = z.record(z.string(), LimitEntrySchema);
export type LimitEntry = z.infer<typeof LimitEntrySchema>;
export type Limits = z.infer<typeof LimitsSchema>;

export const limitsKeys = {
	all: ["sf-limits"] as const,
	org: (instanceUrl: string) => [...limitsKeys.all, instanceUrl] as const,
};

export type UseLimitsQueryOptions = {
	enabled?: boolean;
	staleTime?: number;
};

export function useLimitsQuery(options: UseLimitsQueryOptions = {}) {
	const client = useSFClient();
	const { instanceUrl } = useSFContext();

	return useQuery({
		queryKey: limitsKeys.org(instanceUrl),
		queryFn: () => client.get<Limits>("limits", { schema: LimitsSchema }),
		enabled: options.enabled !== false,
		staleTime: options.staleTime ?? 1000 * 60 * 5,
	});
}
