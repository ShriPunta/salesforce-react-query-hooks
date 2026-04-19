import { z } from "zod";

export const SObjectRecordSchema = z
	.object({
		attributes: z
			.object({
				type: z.string(),
				url: z.string().optional(),
			})
			.passthrough()
			.optional(),
		Id: z.string().optional(),
	})
	.passthrough();
export type SObjectRecord = z.infer<typeof SObjectRecordSchema>;

export const SOQLQueryResultSchema = z.object({
	totalSize: z.number(),
	done: z.boolean(),
	nextRecordsUrl: z.string().optional(),
	records: z.array(SObjectRecordSchema),
});
export type SOQLQueryResult = z.infer<typeof SOQLQueryResultSchema>;

export const DescribeFieldSchema = z
	.object({
		name: z.string(),
		label: z.string(),
		type: z.string(),
		updateable: z.boolean().optional(),
		createable: z.boolean().optional(),
		nillable: z.boolean().optional(),
	})
	.passthrough();

export const DescribeSObjectResultSchema = z
	.object({
		name: z.string(),
		label: z.string(),
		labelPlural: z.string().optional(),
		fields: z.array(DescribeFieldSchema),
		keyPrefix: z.string().nullable().optional(),
	})
	.passthrough();
export type DescribeSObjectResult = z.infer<typeof DescribeSObjectResultSchema>;

export const SFErrorEntrySchema = z
	.object({
		message: z.string(),
		errorCode: z.string().optional(),
		fields: z.array(z.string()).optional(),
	})
	.passthrough();
export const SFErrorResponseSchema = z.array(SFErrorEntrySchema);
