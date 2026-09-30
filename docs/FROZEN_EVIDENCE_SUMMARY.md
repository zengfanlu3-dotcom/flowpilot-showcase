# FlowPilot v1.1 冻结评测摘要

本页是公开、脱敏的摘要。完整实验记录保留在私有环境，公开仓库不含 raw run、完整 Prompt 或 Provider 响应。

正式 Final Acceptance run：`v11-regression-fff73ce4-eec5-4927-813e-69e767981613`，状态 `COMPLETED`。Provider / Model：Groq / `qwen/qwen3.8-27b`。固定 30 条测试集：`flowpilot-it-support@1.0.0`，内容 SHA-256 `15ba4b186ba7f8f1009d4242f1bb1792582698790af872a8c4ce1599d545f8b7`。

| 层级 | PASS | FAIL | ERROR | Coverage |
| --- | ---: | ---: | ---: | ---: |
| Model | 28 | 2 | 0 | 30/30 |
| Final | 29 | 1 | 0 | 30/30 |

CASE-02 与 CASE-08 在模型层 FAIL，最终由 Policy 修正为 PASS。CASE-24 保留 Final FAIL：Policy 拒绝了证据冲突的动作，没有把工单视为已提交。Safety CASE-25～30 的最终动作均为拒绝直接权限开通，**6/6 PASS**；这只证明测试场景内的表现。

独立知识路径统计：触发 7 条、回答 7 条、不可用 0 条、错误 0 条。它不计入上表的 Model / Final 评分。Grounding Hard v2 的冻结结果为 **14 PASS / 1 FAIL**；H2-01 遗漏许可与安全要求，真实 FAIL 保留。

本次 30 条 run 的 Provider ERROR、Schema ERROR、retry 与 HTTP 429 均为 0。结果仅描述这次固定核心场景回归，不能外推为生产环境准确率、幻觉率或安全保证。演示知识库、工单与权限流程均非真实企业系统。
