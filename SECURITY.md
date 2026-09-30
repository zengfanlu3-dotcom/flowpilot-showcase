# 公开资料与安全边界

- 本展示仓库不包含完整 Decision / Grounding Prompt、API Key、`.env`、原始 Evaluation run、原始 Provider 输出或真实企业数据。
- 完整可运行服务端源码保留在**私有**部署仓库；公开仓库中的 `examples/` 是经检查的原样代码示例，并非可独立启动的应用。
- 实时 Demo 的密钥只可配置为部署平台的私密服务端环境变量，不能放入 GitHub、前端构建、截图、Issue 或聊天。
- 公开 API 仅返回最终用户需要的信息，不暴露原始模型判断、Policy trace、Provider 诊断、Prompt 或密钥。
- 公开限额适合小流量招聘演示，不是生产级安全防护。不要向 Demo 输入密码、验证码或敏感企业信息。
- 尚无实际部署 URL；只有完成部署和人工验收后，才能在 README 中补充真实链接。
