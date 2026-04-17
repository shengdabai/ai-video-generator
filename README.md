# VidCraft AI - AI 视频生成工具

<p align="center">
  <img src="assets/icon.png" width="120" alt="VidCraft AI Logo">
</p>

<p align="center">
  <strong>让想象变成视频</strong>
</p>

<p align="center">
  通过 AI 将文字描述转化为专业级视频，降低视频创作门槛
</p>

---

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| **智能描述增强** | AI 自动补充场景细节，让简单描述变成专业脚本 |
| **分镜自动生成** | 根据描述自动拆分场景，生成完整分镜脚本 |
| **多风格模板** | 电影、动画、商务、赛博朋克等多种视觉风格 |
| **AI 配音配乐** | 多种音色的 AI 配音 + 版权安全背景音乐 |
| **一键生成导出** | 自动生成视频，支持多种格式导出 |

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VidCraft AI 架构                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Mobile App (React Native + Expo)                                   │
│   ├── UI Components (NativeWind)                                    │
│   ├── State Management (Zustand)                                    │
│   └── API Client (Axios + React Query)                              │
│                                                                      │
│   Backend Services                                                   │
│   ├── API Gateway (Kong)                                            │
│   ├── User Service (NestJS)                                         │
│   ├── Script Service (FastAPI + GPT-4)                              │
│   ├── Video Service (FastAPI + Runway/可灵)                         │
│   └── Worker Service (Celery)                                       │
│                                                                      │
│   Infrastructure                                                     │
│   ├── Database (PostgreSQL)                                         │
│   ├── Cache (Redis)                                                 │
│   ├── Queue (RabbitMQ)                                              │
│   └── Storage (OSS + CDN)                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📱 移动端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.73 | 跨平台框架 |
| Expo | 50 | 开发工具链 |
| TypeScript | 5.1 | 类型安全 |
| Zustand | 4.5 | 状态管理 |
| React Query | 5.17 | 数据请求 |
| React Navigation | 6.x | 页面导航 |
| NativeWind | 2.0 | 样式方案 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS Simulator 或 Android Emulator

### 安装依赖

```bash
cd ai-video-generator
npm install
```

### 启动开发服务器

```bash
npm start
```

### 运行应用

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📁 项目结构

```
ai-video-generator/
├── docs/                     # 文档目录
│   ├── PRD.md               # 产品需求文档
│   ├── USER_STORIES.md      # 用户故事
│   ├── TECH_STACK.md        # 技术栈选型
│   ├── UI_PROTOTYPE.md      # UI原型设计
│   └── BACKEND_ARCHITECTURE.md  # 后端架构
├── src/
│   ├── components/          # 通用组件
│   │   ├── ui/             # 基础UI组件
│   │   └── ProgressTracker.tsx
│   ├── screens/            # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── CreateScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── services/           # API服务
│   │   └── api.ts
│   ├── store/              # 状态管理
│   │   ├── authStore.ts
│   │   └── projectStore.ts
│   ├── types/              # 类型定义
│   │   └── index.ts
│   └── utils/              # 工具函数
├── assets/                 # 静态资源
├── App.tsx                 # 应用入口
├── app.json               # Expo配置
├── package.json
└── tsconfig.json
```

## 🎯 核心流程

```
用户输入描述 → AI增强描述 → 生成分镜 → 选择风格 → 配音配乐 → 生成视频 → 预览导出
```

## 🔧 配置

### 环境变量

创建 `.env` 文件：

```bash
# API
API_BASE_URL=https://api.vidcraft.ai/api/v1

# AI Services
OPENAI_API_KEY=sk-xxx
RUNWAY_API_KEY=xxx

# Storage
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
```

## 📖 文档

- [产品需求文档 (PRD)](docs/PRD.md)
- [用户故事](docs/USER_STORIES.md)
- [技术栈选型](docs/TECH_STACK.md)
- [UI原型设计](docs/UI_PROTOTYPE.md)
- [后端架构设计](docs/BACKEND_ARCHITECTURE.md)

## 🛣️ 路线图

### MVP (v0.1)
- [x] 基础UI框架
- [x] 用户认证流程
- [x] 文字描述输入
- [x] AI Prompt增强
- [x] 分镜生成
- [x] 视频生成进度
- [ ] 视频预览播放
- [ ] 视频下载导出

### v0.2
- [ ] 风格模板选择
- [ ] AI配音
- [ ] 背景音乐
- [ ] 简单编辑功能

### v0.3
- [ ] 会员订阅系统
- [ ] 批量生成
- [ ] 社区分享
- [ ] 企业版功能

## 💰 商业模式

| 版本 | 价格 | 功能 |
|------|------|------|
| 免费版 | ¥0 | 3次/月, 720p, 30秒, 带水印 |
| 专业版 | ¥99/月 | 30次/月, 1080p, 3分钟, 无水印 |
| 企业版 | ¥499/月 | 无限次, 4K, 5分钟, API访问 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

<p align="center">
  Made with ❤️ by VidCraft Team
</p>

