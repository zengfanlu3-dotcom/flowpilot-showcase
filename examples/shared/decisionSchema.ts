import { z } from 'zod';

export const intentSchema = z.enum([
  'network_access_issue', 'vpn_issue', 'software_request', 'account_issue',
  'hardware_issue', 'permission_request', 'unknown',
]);
export const clarificationTargetSchema = z.enum([
  'connection_status', 'error_type', 'password_changed', 'problem_scope',
]);
export const factsSchema = z.strictObject({
  connectionStatus: z.enum(['disconnected', 'connected_but_inaccessible', 'unknown']),
  errorType: z.enum(['authentication_failed', 'other', 'unknown']),
  passwordChanged: z.boolean().nullable(),
  solutionTried: z.boolean().nullable(),
  issueResolved: z.boolean().nullable(),
});
export const decisionSchema = z.strictObject({
  intent: intentSchema,
  confidence: z.number().min(0).max(1),
  needClarification: z.boolean(),
  clarificationQuestion: z.string().max(500).nullable(),
  clarificationTarget: clarificationTargetSchema.nullable(),
  nextAction: z.enum([
    'ask_clarification', 'show_vpn_solution', 'show_basic_guidance',
    'prepare_ticket', 'refuse_permission', 'complete', 'unsupported',
  ]),
  knowledgeNeeded: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  facts: factsSchema,
});
export const contextSchema = z.strictObject({
  step: z.enum(['idle', 'error', 'password', 'solution', 'ticket', 'done']),
  intent: intentSchema,
  facts: factsSchema,
  clarificationTarget: clarificationTargetSchema.nullable(),
  solutionShown: z.boolean(),
});
export const decisionRequestSchema = z.strictObject({
  requestId: z.string().min(1).max(80),
  message: z.string().trim().min(1).max(1000),
  history: z.array(z.strictObject({
    role: z.enum(['user', 'assistant']), text: z.string().max(1000),
  })).max(6),
  context: contextSchema,
});
export const fallbackReasonSchema = z.enum([
  'static_mode', 'missing_key', 'timeout', 'rate_limited', 'output_token_budget_exceeded', 'provider_error',
  'invalid_output', 'incomplete_output', 'network_error', 'invalid_response',
  'policy_rejected', 'service_rejected_after_policy', 'provider_5xx', 'connection_error',
  'structured_output_generation_error',
]);
export const policyTraceSchema = z.strictObject({
  status: z.enum(['policy_passed', 'policy_modified', 'policy_rejected', 'service_rejected_after_policy']),
  reasonCode: z.string().regex(/^[a-z][a-z0-9_]*$/).nullable(),
  modelDecision: decisionSchema,
  factEvidence: z.strictObject({
    connectionStatus: z.string().max(1000).nullable(), errorType: z.string().max(1000).nullable(),
    passwordChanged: z.string().max(1000).nullable(), solutionTried: z.string().max(1000).nullable(),
    issueResolved: z.string().max(1000).nullable(),
  }),
  startsNewTask: z.boolean(), policyNotes: z.array(z.string()), policyDecision: decisionSchema.nullable(),
});
export const providerDiagnosticSchema = z.strictObject({
  httpStatus: z.number().int().nullable(), sdkErrorName: z.string().nullable(), sdkErrorCode: z.string().nullable(),
  errorType: z.string().nullable().optional(), errorCode: z.string().nullable().optional(),
  errorMessage: z.string().max(240).nullable().optional(), failedGenerationReason: z.string().nullable().optional(),
  failedGenerationCategory: z.enum(['unclosed_json', 'trailing_text', 'markdown_fence', 'invalid_json_syntax', 'truncated_json',
    'schema_type_mismatch', 'enum_mismatch', 'missing_required', 'unknown_malformed_json']).nullable().optional(),
  failedGenerationSummary: z.string().max(240).nullable().optional(),
  schemaIssues: z.array(z.strictObject({ path: z.string().max(120), code: z.string().max(80), expected: z.string().max(80).nullable() })).max(8).optional(),
  reasonCode: fallbackReasonSchema, summary: z.string(), hasUpstreamResponse: z.boolean(), receivedModelContent: z.boolean(),
});
const providerMetadataShape = {
  provider: z.enum(['gemini', 'groq']).optional(), model: z.string().optional(), latencyMs: z.number().nonnegative().optional(),
  providerMetadata: z.strictObject({ rateLimit: z.record(z.string(), z.string().nullable()).nullable(), usage: z.strictObject({ promptTokens: z.number().nonnegative(), completionTokens: z.number().nonnegative(), totalTokens: z.number().nonnegative() }).nullable(), diagnostic: providerDiagnosticSchema.nullable().optional() }).optional(),
  policyTrace: policyTraceSchema.optional(),
};
export const decisionResponseSchema = z.union([
  z.strictObject({
    source: z.literal('llm'), requestId: z.string(), decision: decisionSchema,
    resetContext: z.boolean().optional(),
    debug: z.strictObject({ modelDecision: decisionSchema, policyNotes: z.array(z.string()) }),
    ...providerMetadataShape,
  }),
  z.strictObject({ source: z.literal('static_fallback'), requestId: z.string(), reasonCode: fallbackReasonSchema, resetContext: z.boolean().optional(), ...providerMetadataShape }),
  // A provider refusal is still source=llm, but has NO executable decision.
  z.strictObject({ source: z.literal('llm'), requestId: z.string(), reasonCode: z.literal('safety_refusal'), blocked: z.literal(true), ...providerMetadataShape }),
]);

export type Decision = z.infer<typeof decisionSchema>;
export type Facts = z.infer<typeof factsSchema>;
export type DecisionContext = z.infer<typeof contextSchema>;
export type DecisionRequest = z.infer<typeof decisionRequestSchema>;
export type DecisionResponse = z.infer<typeof decisionResponseSchema>;
export type FallbackReason = z.infer<typeof fallbackReasonSchema>;
export type ClarificationTarget = z.infer<typeof clarificationTargetSchema>;
export const emptyFacts = (): Facts => ({
  connectionStatus: 'unknown', errorType: 'unknown', passwordChanged: null,
  solutionTried: null, issueResolved: null,
});

// Kept separate from the model's prose: these are the ONLY displayed questions.
export const clarificationTemplates: Record<ClarificationTarget, string> = {
  connection_status: '你现在是 VPN 无法连接，还是 VPN 已连接但公司内网打不开？',
  error_type: '连接 VPN 时，出现了什么报错信息？',
  password_changed: '你最近是否修改过公司账号密码？',
  problem_scope: '你遇到的是网络访问、账号登录、软件安装，还是电脑硬件问题？请补充具体情况。',
};

export function mergeFacts(previous: Facts, incoming: Facts): Facts {
  return {
    connectionStatus: incoming.connectionStatus === 'unknown' ? previous.connectionStatus : incoming.connectionStatus,
    errorType: incoming.errorType === 'unknown' ? previous.errorType : incoming.errorType,
    passwordChanged: incoming.passwordChanged ?? previous.passwordChanged,
    solutionTried: incoming.solutionTried ?? previous.solutionTried,
    issueResolved: incoming.issueResolved ?? previous.issueResolved,
  };
}
