AI Chat Platform (Vue3 + Vite 6)
这是一个基于 Vue3 和 Vite 6 构建的轻量级 AI 对话 Web 端原型。本项目是我在学习 前端流式渲染 (Streaming) 与 工程化部署 (CI/CD) 过程中的实战产物。

🌈 在线体验 (Live Demo)

🛠️ 我的实战改进
在参考原项目的基础上，我针对实际开发与部署中的痛点进行了以下重构与优化：

DeepSeek-R1 推理流解析：独立编写了基于状态机的正则解析器，解决了推理模型 reasoning_content 的实时提取与异步渲染问题。

工程化部署优化：

CI/CD 自动化：自研 GitHub Actions 脚本，解决跨环境部署时的 pnpm 版本冲突与权限令牌校验问题。

生产环境适配：优化 Vite 静态资源 Base 路径，解决了 GitHub Pages 部署后的 404 及资源加载失效问题。

性能调优：利用 requestAnimationFrame 结合双缓存逻辑，优化了长文本高频输出时的浏览器渲染帧率。

🎉 技术特性
核心引擎：Vue 3.5+ (Composition API) + Vite 6 + TypeScript 5.5

UI 交互：Naive UI 组件库 + UnoCSS 原子化样式

流式输出：支持 SSE (Server-Sent Events) 打字机效果，响应速度极快

渲染增强：集成 markdown-it、highlight.js；支持 Mermaid 图表、KaTeX 数学公式

模型兼容：支持 SiliconFlow、DeepSeek、Ollama (本地运行) 等多种 Provider

🚀 快速上手
1. 安装依赖
Bash

# 建议使用 pnpm v10+
pnpm install
2. 配置环境变量
Bash

cp .env.template .env
# 在 .env 中填入你的 API Key (如 VITE_SILICONFLOW_KEY)
3. 本地开发
Bash

pnpm dev
🔌 核心架构逻辑
本项目通过 统一模型映射机制 实现了多模型的无缝集成。

数据层：src/api/chat.ts 负责发起的 fetch 请求，开启 stream: true。

解析层：src/components/MarkdownPreview/models 中的转换函数负责处理不同厂商的 JSON 片段。

渲染层：MarkdownPreview 组件接收 ReadableStream，通过异步迭代器实现实时追加渲染。

⚖️ 声明与鸣谢
项目起源：本项目深度参考并借鉴了 pdsuwwz/chatgpt-vue3-light-mvp 的优秀架构设计。

致谢：感谢原作者提供的高质量 MVP 模版，为本项目的前期开发提供了宝贵的参考。