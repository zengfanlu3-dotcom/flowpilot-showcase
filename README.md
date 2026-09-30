# FlowPilot

**Evaluation-driven enterprise IT support AI Agent prototype.**

FlowPilot 是面向企业 IT 支持场景的受控 AI Agent 原型：模型理解问题并建议下一步，程序核对事实、权限和状态；知识回答需要来源依据；固定评测同时检查模型判断和最终产品行为。

**Live Demo：尚未部署** · [60–90 秒演示脚本](docs/DEMO_VIDEO_SCRIPT.md) · [架构说明](docs/ARCHITECTURE.md) · [冻结评测摘要](docs/FROZEN_EVIDENCE_SUMMARY.md)

> 这是**不含完整 Prompt 的公开展示仓库**，并非可独立运行的完整源码。完整服务端代码保留在私有部署仓库。当前没有真实公网 Demo 或视频 URL；发布后才会添加经过验收的链接。

## 为什么做

企业 IT 支持会遇到信息不足、多轮事实纠正、知识缺口和权限边界。FlowPilot 将模型的结构化建议与最终产品动作分开，让程序检查证据和前置条件；在需要知识时检索演示文档，并检查回答是否有依据。

## 产品架构

`用户 → 结构化模型判断 → Policy / 状态 → 知识检索 → 有依据的回答 → 证据校验 → 用户界面`

生产 Demo 设计为同一个 Node 服务提供 API 与前端静态页面。公开访问层限制单 IP 与全局调用量、输入长度和请求时间；Provider 不可用时明确提示实时 AI 暂不可用。详见[架构说明](docs/ARCHITECTURE.md)。

## v1.1 冻结验收

| 固定 30 条核心场景回归 | 结果 |
| --- | ---: |
| Model PASS | **28/30** |
| Final PASS | **29/30** |
| Coverage | **30/30** |
| Safety CASE-25～30 | **6/6** |
| 知识回答路径 | **7/7** |

独立 Grounding Hard v2 为 **14/15**。H2-01 与核心场景 CASE-24 均保留真实 FAIL。这些是**固定核心场景的回归结果**，不代表开放分布 Benchmark、生产准确率或绝对安全。口径与运行身份见[冻结评测摘要](docs/FROZEN_EVIDENCE_SUMMARY.md)。

## 演示内容

- VPN 故障：先澄清错误信息，必要时展示有来源的知识回答。
- 知识不足：回答有依据的部分，并说明缺少依据的部分。
- 管理员权限：拒绝直接授权，引导正式审批。

录屏仍待制作；[演示脚本](docs/DEMO_VIDEO_SCRIPT.md)提供 60–90 秒顺序。公开截图会在实际部署和脱敏验收后补充。

## 技术与边界

完整项目使用 React、TypeScript、Vite、Node.js、Zod、Groq 官方 SDK 与 Qwen，演示知识检索采用 BM25 风格排序。本仓库的 [examples](examples/) 仅展示已审查的类型约束与公开访问保护代码，不能单独构建或部署产品。

知识库和测试数据均为 synthetic IT 演示内容；没有真实企业工单、权限执行工具或生产环境部署。未实现 Tool Use。公开 Demo 不应输入密码、验证码或企业敏感信息。

[安全与源码边界](SECURITY.md)
