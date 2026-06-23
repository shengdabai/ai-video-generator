# ai-video-generator

Describe a video in one line — AI (Gemini) enhances the prompt and generates a shot-by-shot storyboard. React Native + Expo app, TypeScript backend.

## Business Context

- **Category:** content automation product
- **Audience:** creators and small teams that want repeatable publishing, research, or video-production workflows.
- **Repository status:** Public repository. Keep examples, docs, and issues free of credentials, private data, and machine-specific paths.
- **Topics:** ai, ai-video, expo, gemini, react-native, storyboard, typescript, video-generation

## What This Project Is For

- Describe a video in one line — AI (Gemini) enhances the prompt and generates a shot-by-shot storyboard. React Native + Expo app, TypeScript backend.
- Move content work from ad hoc drafting to an inspectable production pipeline.
- Preserve human review while automating mechanical research, drafting, or publishing steps.

## Where It Fits

This repository turns content work into a repeatable workflow: inputs, processing steps, review points, and outputs are visible enough to audit and improve.

## Technical Overview

- **Primary language:** TypeScript
- **Detected stack:** TypeScript, Node.js, React, Tailwind CSS, Expo
- **Default branch:** `main`
- **Visibility:** `PUBLIC`
- **License:** MIT License

## Repository Map

- `src`
- `server`
- `docs`
- `App.tsx`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `app.json`
- `babel.config.js`
- `demo`
- `package-lock.json`
- `package.json`

## ✨ Features

| Feature | Status | Notes |
|---|---|---|
| AI prompt enhancement | ✅ Real | Gemini 2.0 Flash, with offline fallback |
| Automatic storyboard generation | ✅ Real | 2–8 timed scenes, camera + movement per shot |
| Phone-code auth (register / login / refresh) | ✅ Real | JWT access + refresh tokens (set `JWT_REFRESH_SECRET` for separate-secret isolation in production), secure token storage |
| SMS verification code delivery | 🧪 Simulated | Codes are generated/logged server-side; no real SMS provider wired yet |
| Project & generation tracking | ✅ Real | SQLite-backed projects, progress polling |
| Rate limiting | ✅ Real | Per-route Express rate limiter |
| Style templates, voice & music options | 🔌 API ready | Endpoints exist; content library is a roadmap item |
| Video rendering | 🧪 Simulated | Progress + sample output; real render API is the next plug-in |

## 🧱 Tech stack

**Mobile (`/`, `/src`)**
- React Native `0.73` + Expo `50`
- TypeScript
- Zustand (state) · TanStack React Query (data) · React Navigation `6`
- NativeWind (Tailwind for RN) · Reanimated · Expo SecureStore / AV / Notifications

**Backend (`/server`)**
- Node.js + Express `4` + TypeScript
- `@google/generative-ai` (Gemini 2.0 Flash)
- better-sqlite3 (zero-config embedded DB)
- JWT auth (`jsonwebtoken` + `bcryptjs`) · `zod` validation · `express-rate-limit`

## 🚀 Quick start

### Backend

```bash
cd server
npm install
# Set GEMINI_API_KEY in your environment to enable real AI;
# omit it to run with structured fallbacks.
npm run dev      # starts on http://localhost:8000
```

Backend env (see `server/src/config/env.ts`): `PORT`, `JWT_SECRET`, `GEMINI_API_KEY`, `CORS_ORIGINS`, `DB_PATH`.

### Mobile app

```bash
npm install
npm start        # Expo dev server
npm run ios      # or: npm run android / npm run web
```

App connects to `http://localhost:8000/api/v1` in dev mode.

### All project commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies. |
| `npm run dev` | tsx watch src/index.ts |
| `npm start` | node dist/index.js |
| `npm run build` | tsc |
| `npm run lint` | eslint . --ext .ts,.tsx |

## Operating Notes

- Keep real credentials out of the repository. Use local environment files, GitHub repository secrets, or the deployment platform secret manager.
- If a `.env.example` file exists, treat it as documentation only; never commit filled-in `.env` files.
- Before publishing screenshots, demos, or client examples, remove private names, internal paths, account IDs, and API endpoints.
- The `Repository Hygiene` workflow is a lightweight guardrail, not a replacement for product-specific tests.

## Delivery Checklist

- [ ] README describes the user, business outcome, and operating boundary.
- [ ] Setup or preview commands are current and do not rely on private machine state.
- [ ] No real secrets, private user data, or machine-local state are tracked.
- [ ] Screenshots, demos, or sample outputs are safe to share publicly when the repository is public.
- [ ] Product-specific tests or smoke checks are documented before production use.

## Roadmap

- Tighten the fastest path from clone to useful demo.
- Add project-specific screenshots, sample outputs, or a short walkthrough where useful.
- Promote repeated manual steps into scripts, tests, or documented workflows.
- Keep security, privacy, and licensing boundaries explicit as the project evolves.

## Maintainer Notes

Maintained by [Tony Sheng](https://github.com/shengdabai). This README is written as a business-facing handoff: it should help a future collaborator, client, or reviewer understand why the repository exists, how to inspect it, and what must be true before it is reused or shipped.

## 🤝 Connect & about

Built in public by **Tony (Sheng)** — a Chinese-language teacher with 6,000+ students, building AI + Chinese-teaching tools out loud.

If the idea of "describe it, let AI direct it" resonates, **⭐ Star this repo and [follow @shengdabai](https://github.com/shengdabai)** to follow along.

Sibling projects worth a look:
- [ai-video-workflow](https://github.com/shengdabai/ai-video-workflow) — pipeline / workflow side of AI video
- [content-creator-hub](https://github.com/shengdabai/content-creator-hub) — tools for content creators
- [chinese-teaching-video-system](https://github.com/shengdabai/chinese-teaching-video-system) — AI for Chinese-language teaching

## License

Released under the MIT License. See [`LICENSE`](./LICENSE).

---

<a name="中文"></a>

# 🎥 AI 视频生成器

> [English](#-ai-video-generator) | 中文

<p align="center">
  <img src="https://img.shields.io/github/last-commit/shengdabai/ai-video-generator" alt="最近提交">
  <img src="https://img.shields.io/github/stars/shengdabai/ai-video-generator?style=social" alt="Star">
  <img src="https://img.shields.io/github/followers/shengdabai?style=social" alt="关注">
</p>

**一句话，生成一份分镜脚本。** 一个跨平台移动应用：你用大白话描述想要的视频，AI 把它扩写成电影级提示词，再拆解成逐镜头的分镜脚本——也就是真正动手渲染之前，最难的那部分创作。

🌐 **项目主站：** [zturnsgo.com](https://zturnsgo.com)

---

## 为什么做这个

大多数人能用一句话说清想要什么视频——「暴风雨清晨里一座孤独的灯塔」——但完全不知道怎么把它翻译成镜头、光线、节奏和场景切换。视频项目往往就死在这道鸿沟里。

AI 视频生成器要填平它:你出想法,应用来「导演」。它把你的描述扩写成专业、细节丰富的场景提示词,再拆成一个个带时长、带运镜方向的独立镜头——这正是真实摄制组开工前要先搭好的分镜。

## 它实际上做了什么

这是一个**能跑起来的移动端 + 后端**,围绕「当下 AI 真正能稳定做到的事」诚实地搭建:

- **提示词增强是真的。** 后端调用 **Google Gemini 2.0 Flash**,把你的想法改写成生动的电影级提示词(光线、色调、镜头视角、情绪),并生成带每镜头运镜的多场景分镜。
- **优雅降级。** 没配 API key?服务端会返回结构化的 fallback 结果,整套流程在演示和开发时依然能跑通。
- **视频渲染是模拟的。** 生成流水线(进度步骤、计时、状态)已经完整接好,由一个模拟 worker 在完成时返回示例片段——这里就是真实渲染 API(如 Runway、可灵)未来接入的位置。这一点如实说明,绝不误导。

> 由一位中文老师以「公开构建」的方式打造,探索 AI + 媒体创作到底在哪里真正有用、哪里还不行。

## ✨ 功能

| 功能 | 状态 | 说明 |
|---|---|---|
| AI 提示词增强 | ✅ 真实 | Gemini 2.0 Flash,含离线 fallback |
| 自动分镜生成 | ✅ 真实 | 2–8 个带时长场景,每镜头含运镜 |
| 手机验证码登录(注册/登录/刷新) | ✅ 真实 | JWT 双 token(生产环境设置 `JWT_REFRESH_SECRET` 即可实现独立密钥隔离),安全存储 |
| 短信验证码下发 | 🧪 模拟 | 验证码在服务端生成/打印,尚未接入真实短信服务商 |
| 项目与生成进度跟踪 | ✅ 真实 | SQLite 存储项目,进度轮询 |
| 限流 | ✅ 真实 | 基于 Express 的按路由限流 |
| 风格模板、配音、配乐 | 🔌 接口就绪 | 接口已有,内容库属于路线图 |
| 视频渲染 | 🧪 模拟 | 进度 + 示例输出,真实渲染 API 待接入 |

## 🧱 技术栈

**移动端(`/`、`/src`)**
- React Native `0.73` + Expo `50`
- TypeScript
- Zustand(状态)· TanStack React Query(数据)· React Navigation `6`
- NativeWind(RN 版 Tailwind)· Reanimated · Expo SecureStore / AV / Notifications

**后端(`/server`)**
- Node.js + Express `4` + TypeScript
- `@google/generative-ai`(Gemini 2.0 Flash)
- better-sqlite3(零配置嵌入式数据库)
- JWT 鉴权(`jsonwebtoken` + `bcryptjs`)· `zod` 校验 · `express-rate-limit`

## 🚀 快速开始

### 后端

```bash
cd server
npm install
# 设置环境变量 GEMINI_API_KEY 以启用真实 AI;
# 不设置则以结构化 fallback 运行。
npm run dev      # 启动于 http://localhost:8000
```

后端环境变量(见 `server/src/config/env.ts`):`PORT`、`JWT_SECRET`、`GEMINI_API_KEY`、`CORS_ORIGINS`、`DB_PATH`。

### 移动端

```bash
npm install
npm start        # Expo 开发服务器
npm run ios      # 或:npm run android / npm run web
```

开发模式下应用访问 `http://localhost:8000/api/v1`。

## 📖 使用流程

1. 用手机号 + 验证码**登录**。
2. 在创建页用**一句话描述**你的视频。
3. **查看 AI 增强后的提示词**,接受或微调。
4. **拿到分镜**——场景被拆出时长、镜头与运镜。
5. **选择风格与音频**,启动生成并实时看进度。
6. **预览**结果(当前为模拟渲染器返回的示例片段)。

REST 接口包含 `/auth/*`、`/users/me`、`/scripts/enhance`、`/scripts/storyboard`、`/videos`、`/videos/:id/generate`、`/videos/:id/progress`,以及 `/templates/{styles,voices,music}`。

## 🗺️ 状态

这是一个**早期、持续构建中的原型**。创作型 AI 核心(提示词增强 + 分镜)与完整的应用/后端流程今天就能用。视频渲染步骤刻意做成模拟,也是最重要的下一步。

- ✅ 移动端框架、导航、鉴权
- ✅ AI 提示词增强 + 分镜(Gemini)
- ✅ 项目跟踪、进度、限流
- 🔜 接入真实视频渲染 API
- 🔜 风格/配音/配乐内容库
- 🔜 应用内预览与导出

PRD、用户故事、技术选型、UI 原型与后端架构见 `/docs`。

## 🤝 联系与关于

由 **Tony(盛)** 公开构建——一位拥有 6000+ 学员的中文老师,正在公开地打造 AI + 中文教学工具。

如果「你来描述,AI 来导演」这个想法戳中了你,**给本仓库点个 ⭐ Star,并[关注 @shengdabai](https://github.com/shengdabai)** 一起同行。

值得一看的姊妹项目:
- [ai-video-workflow](https://github.com/shengdabai/ai-video-workflow) —— AI 视频的流水线/工作流方向
- [content-creator-hub](https://github.com/shengdabai/content-creator-hub) —— 内容创作者工具集
- [chinese-teaching-video-system](https://github.com/shengdabai/chinese-teaching-video-system) —— 面向中文教学的 AI

## 许可证

基于 MIT 许可证发布。详见 [`LICENSE`](./LICENSE)。
