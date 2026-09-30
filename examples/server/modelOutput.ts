import { z } from 'zod';
import { decisionSchema } from '../shared/decisionSchema.ts';

// Provider-independent evidence: exact quotes from the current message only.
export const evidenceSchema = z.strictObject({
  connectionStatus: z.string().min(1).max(1000).nullable(),
  errorType: z.string().min(1).max(1000).nullable(),
  passwordChanged: z.string().min(1).max(1000).nullable(),
  solutionTried: z.string().min(1).max(1000).nullable(),
  issueResolved: z.string().min(1).max(1000).nullable(),
});
export const modelOutputSchema = decisionSchema.extend({ factEvidence: evidenceSchema, startsNewTask: z.boolean() });
export type ModelOutput = z.infer<typeof modelOutputSchema>;
export type FactEvidence = z.infer<typeof evidenceSchema>;
