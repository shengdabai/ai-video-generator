# VidCraft AI - 后端架构设计文档

## 一、架构概述

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VidCraft AI 后端架构                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                              客户端                                       │   │
│  │              iOS App  /  Android App  /  Web (Future)                    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      │ HTTPS                                    │
│                                      ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           API Gateway (Kong)                              │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │ 路由分发   │ │ JWT验证    │ │ 限流控制   │ │ 日志记录   │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│         ┌────────────────────────────┼────────────────────────────┐             │
│         │                            │                            │             │
│         ▼                            ▼                            ▼             │
│  ┌────────────────┐        ┌────────────────┐        ┌────────────────┐         │
│  │  User Service  │        │ Script Service │        │ Video Service  │         │
│  │   (NestJS)     │        │   (FastAPI)    │        │   (FastAPI)    │         │
│  │                │        │                │        │                │         │
│  │ • 注册登录     │        │ • Prompt增强   │        │ • 视频生成     │         │
│  │ • 用户管理     │        │ • 分镜生成     │        │ • 任务调度     │         │
│  │ • 会员订阅     │        │ • 内容审核     │        │ • 视频合成     │         │
│  └────────┬───────┘        └────────┬───────┘        └────────┬───────┘         │
│           │                         │                         │                 │
│           │                         │                         │                 │
│           ▼                         ▼                         ▼                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Message Queue (RabbitMQ)                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │   │
│  │  │ video.generate│  │ video.compose│  │ notification │                    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           Worker Service (Python)                         │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                        Video Generation Workers                     │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │   │
│  │  │  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker N │           │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │  │   │
│  │  └────────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│           ┌──────────────────────────┼──────────────────────────┐               │
│           │                          │                          │               │
│           ▼                          ▼                          ▼               │
│  ┌────────────────┐        ┌────────────────┐        ┌────────────────┐         │
│  │   PostgreSQL   │        │     Redis      │        │   OSS / S3     │         │
│  │   (主数据库)   │        │   (缓存/会话)  │        │  (对象存储)    │         │
│  └────────────────┘        └────────────────┘        └────────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 服务划分

| 服务名称 | 技术栈 | 职责 | 端口 |
|---------|-------|------|------|
| **API Gateway** | Kong | 路由、认证、限流 | 80/443 |
| **User Service** | NestJS (TypeScript) | 用户、认证、会员 | 3001 |
| **Script Service** | FastAPI (Python) | Prompt增强、分镜 | 8001 |
| **Video Service** | FastAPI (Python) | 视频生成、合成 | 8002 |
| **Worker Service** | Python + Celery | 异步任务处理 | - |
| **Notification Service** | NestJS | 推送通知 | 3002 |

---

## 二、API 设计

### 2.1 API 规范

| 规范项 | 说明 |
|-------|------|
| **协议** | HTTPS |
| **格式** | JSON |
| **版本** | URL Path (/api/v1) |
| **认证** | Bearer Token (JWT) |
| **编码** | UTF-8 |

### 2.2 统一响应格式

```json
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1705312234567
}

// 错误响应
{
  "code": 40001,
  "message": "Invalid phone number",
  "data": null,
  "timestamp": 1705312234567
}
```

### 2.3 错误码定义

| 错误码 | 说明 | HTTP Status |
|-------|------|-------------|
| 0 | 成功 | 200 |
| 40001 | 参数错误 | 400 |
| 40101 | 未认证 | 401 |
| 40301 | 无权限 | 403 |
| 40401 | 资源不存在 | 404 |
| 42901 | 请求过于频繁 | 429 |
| 50001 | 服务器内部错误 | 500 |
| 50301 | AI 服务不可用 | 503 |

### 2.4 核心 API 列表

#### 认证相关 (Auth)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /api/v1/auth/send-code | 发送验证码 |
| POST | /api/v1/auth/register | 注册 |
| POST | /api/v1/auth/login | 登录 |
| POST | /api/v1/auth/refresh | 刷新Token |
| POST | /api/v1/auth/logout | 登出 |

#### 用户相关 (User)

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/v1/users/me | 获取当前用户信息 |
| PUT | /api/v1/users/me | 更新用户信息 |
| GET | /api/v1/users/me/credits | 获取用户配额 |
| GET | /api/v1/users/me/subscription | 获取订阅状态 |

#### 脚本相关 (Script)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /api/v1/scripts/enhance | Prompt 增强 |
| POST | /api/v1/scripts/storyboard | 生成分镜 |
| PUT | /api/v1/scripts/storyboard/{id} | 更新分镜 |

#### 视频相关 (Video)

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | /api/v1/videos | 创建视频项目 |
| GET | /api/v1/videos | 获取视频列表 |
| GET | /api/v1/videos/{id} | 获取视频详情 |
| POST | /api/v1/videos/{id}/generate | 开始生成视频 |
| GET | /api/v1/videos/{id}/progress | 获取生成进度 |
| DELETE | /api/v1/videos/{id} | 删除视频 |

#### 模板相关 (Template)

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/v1/templates/styles | 获取风格模板 |
| GET | /api/v1/templates/voices | 获取配音选项 |
| GET | /api/v1/templates/music | 获取音乐列表 |

---

## 三、详细 API 文档

### 3.1 发送验证码

```
POST /api/v1/auth/send-code
```

**Request:**
```json
{
  "phone": "13800138000",
  "type": "register"  // register | login | reset
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "expires_in": 300
  }
}
```

### 3.2 用户注册

```
POST /api/v1/auth/register
```

**Request:**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "Abc123456"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "138****8000",
      "nickname": "用户123456",
      "avatar_url": null,
      "membership": "free",
      "credits": 3
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200
  }
}
```

### 3.3 Prompt 增强

```
POST /api/v1/scripts/enhance
Authorization: Bearer {token}
```

**Request:**
```json
{
  "prompt": "一个人在海边看日落",
  "style": "cinematic",  // optional
  "language": "zh"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "original_prompt": "一个人在海边看日落",
    "enhanced_prompt": "镜头缓缓推进，一位穿着白色亚麻衬衫的年轻人独自站在金色沙滩上...",
    "style_suggestions": ["cinematic", "warm"],
    "mood": "peaceful",
    "duration_suggestion": 45
  }
}
```

### 3.4 生成分镜

```
POST /api/v1/scripts/storyboard
Authorization: Bearer {token}
```

**Request:**
```json
{
  "enhanced_prompt": "镜头缓缓推进，一位穿着白色亚麻衬衫的年轻人...",
  "target_duration": 45,
  "scene_count": 3
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "storyboard_id": "uuid",
    "total_duration": 45,
    "scenes": [
      {
        "index": 1,
        "prompt": "广角远景：年轻人站在金色沙滩上，面朝大海，夕阳染红天空",
        "duration": 15,
        "camera": "wide shot",
        "movement": "slow push in"
      },
      {
        "index": 2,
        "prompt": "中景特写：海浪拍打岸边，人物侧脸剪影",
        "duration": 20,
        "camera": "medium shot",
        "movement": "static"
      },
      {
        "index": 3,
        "prompt": "特写：太阳沉入海平面，天空渐变",
        "duration": 10,
        "camera": "close up",
        "movement": "tilt down"
      }
    ]
  }
}
```

### 3.5 创建视频项目

```
POST /api/v1/videos
Authorization: Bearer {token}
```

**Request:**
```json
{
  "title": "海边日落",
  "original_prompt": "一个人在海边看日落",
  "enhanced_prompt": "镜头缓缓推进...",
  "storyboard_id": "uuid",
  "style_template": "cinematic",
  "aspect_ratio": "16:9",
  "voice_config": {
    "enabled": true,
    "voice_id": "male_01",
    "text": "夕阳西下，海风轻拂..."
  },
  "music_config": {
    "enabled": true,
    "music_id": "ambient_01",
    "volume": 0.4
  }
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "project_id": "uuid",
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3.6 开始生成视频

```
POST /api/v1/videos/{id}/generate
Authorization: Bearer {token}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "project_id": "uuid",
    "task_id": "uuid",
    "status": "queued",
    "estimated_time": 180,
    "queue_position": 3
  }
}
```

### 3.7 获取生成进度

```
GET /api/v1/videos/{id}/progress
Authorization: Bearer {token}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "project_id": "uuid",
    "status": "processing",
    "progress": 45,
    "current_step": "generating_scene_2",
    "steps": [
      {"name": "analyzing", "status": "completed", "progress": 100},
      {"name": "generating_scene_1", "status": "completed", "progress": 100},
      {"name": "generating_scene_2", "status": "processing", "progress": 65},
      {"name": "generating_scene_3", "status": "pending", "progress": 0},
      {"name": "audio_synthesis", "status": "pending", "progress": 0},
      {"name": "video_composition", "status": "pending", "progress": 0}
    ],
    "estimated_remaining": 120
  }
}
```

### 3.8 WebSocket 进度推送

```
WS /ws/videos/{project_id}/progress
Authorization: Bearer {token}
```

**推送消息:**
```json
{
  "type": "progress",
  "data": {
    "progress": 67,
    "current_step": "generating_scene_3",
    "message": "正在生成第3个分镜..."
  }
}

{
  "type": "completed",
  "data": {
    "video_url": "https://cdn.example.com/videos/xxx.mp4",
    "thumbnail_url": "https://cdn.example.com/thumbnails/xxx.jpg",
    "duration": 45
  }
}

{
  "type": "error",
  "data": {
    "code": 50301,
    "message": "视频生成失败，请重试"
  }
}
```

---

## 四、数据库设计

### 4.1 ER 图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              数据库 ER 图                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌───────────────────┐                           ┌───────────────────┐         │
│   │      users        │                           │   subscriptions   │         │
│   ├───────────────────┤                           ├───────────────────┤         │
│   │ id (PK)           │──────────────────────────►│ id (PK)           │         │
│   │ phone             │                           │ user_id (FK)      │         │
│   │ password_hash     │                           │ plan              │         │
│   │ nickname          │                           │ status            │         │
│   │ avatar_url        │                           │ start_date        │         │
│   │ membership        │                           │ end_date          │         │
│   │ credits           │                           │ payment_id        │         │
│   │ created_at        │                           │ created_at        │         │
│   │ updated_at        │                           └───────────────────┘         │
│   └─────────┬─────────┘                                                         │
│             │                                                                    │
│             │ 1:N                                                                │
│             │                                                                    │
│             ▼                                                                    │
│   ┌───────────────────┐                           ┌───────────────────┐         │
│   │  video_projects   │                           │  generation_tasks │         │
│   ├───────────────────┤                           ├───────────────────┤         │
│   │ id (PK)           │──────────────────────────►│ id (PK)           │         │
│   │ user_id (FK)      │                           │ project_id (FK)   │         │
│   │ title             │                           │ storyboard_id (FK)│         │
│   │ original_prompt   │                           │ engine            │         │
│   │ enhanced_prompt   │                           │ status            │         │
│   │ style_template    │                           │ progress          │         │
│   │ aspect_ratio      │                           │ result_url        │         │
│   │ voice_config      │                           │ error_message     │         │
│   │ music_config      │                           │ started_at        │         │
│   │ status            │                           │ completed_at      │         │
│   │ duration          │                           │ created_at        │         │
│   │ video_url         │                           └───────────────────┘         │
│   │ thumbnail_url     │                                                         │
│   │ created_at        │                                                         │
│   │ updated_at        │                                                         │
│   └─────────┬─────────┘                                                         │
│             │                                                                    │
│             │ 1:N                                                                │
│             │                                                                    │
│             ▼                                                                    │
│   ┌───────────────────┐                           ┌───────────────────┐         │
│   │   storyboards     │                           │   style_templates │         │
│   ├───────────────────┤                           ├───────────────────┤         │
│   │ id (PK)           │                           │ id (PK)           │         │
│   │ project_id (FK)   │                           │ name              │         │
│   │ scene_index       │                           │ description       │         │
│   │ prompt            │                           │ preview_url       │         │
│   │ duration          │                           │ config            │         │
│   │ camera_type       │                           │ is_active         │         │
│   │ movement          │                           │ sort_order        │         │
│   │ video_clip_url    │                           │ created_at        │         │
│   │ status            │                           └───────────────────┘         │
│   │ created_at        │                                                         │
│   └───────────────────┘                                                         │
│                                                                                  │
│   ┌───────────────────┐                           ┌───────────────────┐         │
│   │   voice_options   │                           │   music_library   │         │
│   ├───────────────────┤                           ├───────────────────┤         │
│   │ id (PK)           │                           │ id (PK)           │         │
│   │ name              │                           │ name              │         │
│   │ gender            │                           │ artist            │         │
│   │ language          │                           │ duration          │         │
│   │ sample_url        │                           │ mood              │         │
│   │ provider          │                           │ genre             │         │
│   │ provider_voice_id │                           │ file_url          │         │
│   │ is_active         │                           │ is_active         │         │
│   │ created_at        │                           │ created_at        │         │
│   └───────────────────┘                           └───────────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 完整建表 SQL

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 用户相关表 ====================

-- 用户表
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(20) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    nickname        VARCHAR(50) DEFAULT '',
    avatar_url      VARCHAR(500),
    membership      VARCHAR(20) DEFAULT 'free' CHECK (membership IN ('free', 'pro', 'business')),
    credits         INTEGER DEFAULT 3 CHECK (credits >= 0),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_membership ON users(membership);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 订阅记录表
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan            VARCHAR(20) NOT NULL CHECK (plan IN ('pro', 'business')),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date        TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_id      VARCHAR(100),
    auto_renew      BOOLEAN DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 订阅索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ==================== 视频项目相关表 ====================

-- 视频项目表
CREATE TABLE video_projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) DEFAULT '未命名项目',
    original_prompt TEXT,
    enhanced_prompt TEXT,
    style_template  VARCHAR(50) DEFAULT 'cinematic',
    aspect_ratio    VARCHAR(10) DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1', '4:3')),
    voice_config    JSONB DEFAULT '{"enabled": false}',
    music_config    JSONB DEFAULT '{"enabled": false}',
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    duration        INTEGER,  -- 视频时长（秒）
    video_url       VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    view_count      INTEGER DEFAULT 0,
    is_public       BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 项目索引
CREATE INDEX idx_projects_user_id ON video_projects(user_id);
CREATE INDEX idx_projects_status ON video_projects(status);
CREATE INDEX idx_projects_created_at ON video_projects(created_at DESC);
CREATE INDEX idx_projects_is_public ON video_projects(is_public) WHERE is_public = true;

-- 分镜表
CREATE TABLE storyboards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
    scene_index     INTEGER NOT NULL,
    prompt          TEXT NOT NULL,
    duration        INTEGER NOT NULL,  -- 时长（秒）
    camera_type     VARCHAR(50),  -- wide, medium, close-up
    movement        VARCHAR(50),  -- static, pan, zoom, track
    video_clip_url  VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, scene_index)
);

-- 分镜索引
CREATE INDEX idx_storyboards_project_id ON storyboards(project_id);
CREATE INDEX idx_storyboards_status ON storyboards(status);

-- 生成任务表
CREATE TABLE generation_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
    storyboard_id   UUID REFERENCES storyboards(id) ON DELETE CASCADE,
    task_type       VARCHAR(20) NOT NULL CHECK (task_type IN ('scene', 'audio', 'compose')),
    engine          VARCHAR(50),  -- runway, pika, kling
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'running', 'completed', 'failed')),
    progress        INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result_url      VARCHAR(500),
    error_message   TEXT,
    retry_count     INTEGER DEFAULT 0,
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任务索引
CREATE INDEX idx_tasks_project_id ON generation_tasks(project_id);
CREATE INDEX idx_tasks_status ON generation_tasks(status);
CREATE INDEX idx_tasks_created_at ON generation_tasks(created_at);

-- ==================== 模板与资源表 ====================

-- 风格模板表
CREATE TABLE style_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    description     TEXT,
    preview_url     VARCHAR(500),
    config          JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN DEFAULT true,
    is_premium      BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 配音选项表
CREATE TABLE voice_options (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female', 'child')),
    language        VARCHAR(10) DEFAULT 'zh-CN',
    sample_url      VARCHAR(500),
    provider        VARCHAR(50) NOT NULL,  -- aliyun, azure
    provider_voice_id VARCHAR(100) NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    is_premium      BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 音乐库表
CREATE TABLE music_library (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    artist          VARCHAR(100),
    duration        INTEGER NOT NULL,  -- 时长（秒）
    mood            VARCHAR(50),  -- peaceful, energetic, sad
    genre           VARCHAR(50),  -- ambient, electronic, classical
    file_url        VARCHAR(500) NOT NULL,
    preview_url     VARCHAR(500),
    is_active       BOOLEAN DEFAULT true,
    is_premium      BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 积分与消费记录表 ====================

-- 积分消费记录表
CREATE TABLE credit_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES video_projects(id) ON DELETE SET NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('consume', 'recharge', 'reward', 'refund')),
    amount          INTEGER NOT NULL,  -- 正数增加，负数减少
    balance_after   INTEGER NOT NULL,
    description     VARCHAR(200),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 积分记录索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- ==================== 初始数据 ====================

-- 插入默认风格模板
INSERT INTO style_templates (name, display_name, description, config, sort_order) VALUES
('cinematic', '电影质感', '电影级色彩、浅景深、2.35:1 画幅感', '{"color_grade": "cinematic", "depth_of_field": "shallow"}', 1),
('anime', '动画卡通', '扁平/3D 动画、鲜艳色彩', '{"style": "anime", "color": "vibrant"}', 2),
('business', '商务专业', '简洁大气、蓝色主调', '{"color_grade": "corporate", "tone": "professional"}', 3),
('cyberpunk', '赛博朋克', '霓虹、暗调、未来感', '{"color_grade": "neon", "tone": "dark"}', 4),
('japanese', '日系治愈', '柔和光影、清新色调', '{"color_grade": "soft", "tone": "warm"}', 5),
('vintage', '复古胶片', '颗粒感、褪色、老电影', '{"color_grade": "vintage", "grain": true}', 6),
('nature', '自然纪录', '高清写实、自然光', '{"style": "realistic", "lighting": "natural"}', 7),
('minimal', '极简主义', '纯色背景、聚焦主体', '{"style": "minimal", "background": "solid"}', 8);

-- 插入默认配音选项
INSERT INTO voice_options (name, gender, language, provider, provider_voice_id, sort_order) VALUES
('男声-沉稳', 'male', 'zh-CN', 'aliyun', 'zhitian_emo', 1),
('男声-磁性', 'male', 'zh-CN', 'aliyun', 'zhiyan_emo', 2),
('女声-甜美', 'female', 'zh-CN', 'aliyun', 'zhixiao_emo', 3),
('女声-温柔', 'female', 'zh-CN', 'aliyun', 'zhimi_emo', 4),
('童声-活泼', 'child', 'zh-CN', 'aliyun', 'sitong', 5);

-- ==================== 触发器函数 ====================

-- 更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON video_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 五、消息队列设计

### 5.1 队列定义

| 队列名称 | 用途 | 消费者 |
|---------|------|-------|
| video.generate | 视频片段生成任务 | Video Worker |
| video.compose | 视频合成任务 | Compose Worker |
| audio.generate | 音频生成任务 | Audio Worker |
| notification.push | 推送通知 | Notification Service |

### 5.2 消息格式

```json
// 视频生成任务消息
{
  "task_id": "uuid",
  "project_id": "uuid",
  "storyboard_id": "uuid",
  "prompt": "场景描述...",
  "style": "cinematic",
  "duration": 15,
  "engine": "runway",
  "priority": 1,
  "created_at": "2024-01-15T10:30:00Z"
}

// 视频合成任务消息
{
  "task_id": "uuid",
  "project_id": "uuid",
  "clips": [
    {"url": "https://...", "duration": 15, "order": 1},
    {"url": "https://...", "duration": 20, "order": 2}
  ],
  "audio": {
    "voice_url": "https://...",
    "music_url": "https://...",
    "voice_volume": 0.7,
    "music_volume": 0.4
  },
  "output_format": "mp4",
  "resolution": "1080p"
}
```

### 5.3 任务流程图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            视频生成任务流程                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   用户请求                                                                       │
│      │                                                                           │
│      ▼                                                                           │
│   ┌──────────────┐                                                              │
│   │ Video Service│  1. 创建任务记录                                             │
│   │              │  2. 检查用户配额                                             │
│   │              │  3. 扣减配额                                                 │
│   └──────┬───────┘                                                              │
│          │                                                                       │
│          │ 发布消息                                                              │
│          ▼                                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                         RabbitMQ                                          │  │
│   │  ┌─────────────────┐                                                     │  │
│   │  │ video.generate  │ ───► 分镜1任务、分镜2任务、分镜3任务...              │  │
│   │  └─────────────────┘                                                     │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                       │
│                          │ 消费消息                                              │
│                          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                       Video Workers (并行)                                │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │  │
│   │  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │                               │  │
│   │  │ 分镜1    │  │ 分镜2    │  │ 分镜3    │                               │  │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘                               │  │
│   │       │             │             │                                      │  │
│   │       │  调用 AI API│             │                                      │  │
│   │       ▼             ▼             ▼                                      │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │  │
│   │  │ Runway   │  │ Runway   │  │ Runway   │                               │  │
│   │  │ API      │  │ API      │  │ API      │                               │  │
│   │  └──────────┘  └──────────┘  └──────────┘                               │  │
│   │       │             │             │                                      │  │
│   │       │  返回视频片段│             │                                      │  │
│   │       ▼             ▼             ▼                                      │  │
│   │  ┌─────────────────────────────────────┐                                │  │
│   │  │         上传到 OSS                   │                                │  │
│   │  └─────────────────────────────────────┘                                │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                       │
│                          │ 所有分镜完成                                          │
│                          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                         RabbitMQ                                          │  │
│   │  ┌─────────────────┐                                                     │  │
│   │  │ video.compose   │ ───► 合成任务                                       │  │
│   │  └─────────────────┘                                                     │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                       │
│                          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                       Compose Worker                                      │  │
│   │  1. 下载所有视频片段                                                      │  │
│   │  2. 合成音频（配音 + 配乐）                                               │  │
│   │  3. FFmpeg 合成最终视频                                                   │  │
│   │  4. 上传到 OSS                                                           │  │
│   │  5. 生成缩略图                                                           │  │
│   │  6. 更新数据库状态                                                        │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                       │
│                          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                         RabbitMQ                                          │  │
│   │  ┌─────────────────┐                                                     │  │
│   │  │ notification    │ ───► 推送通知                                       │  │
│   │  └─────────────────┘                                                     │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                       │
│                          ▼                                                       │
│                    用户收到通知                                                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 六、缓存设计

### 6.1 Redis 缓存策略

| 缓存键 | 用途 | TTL | 策略 |
|-------|------|-----|------|
| `user:{id}` | 用户信息 | 30分钟 | Cache Aside |
| `user:credits:{id}` | 用户配额 | 5分钟 | Write Through |
| `session:{token}` | 用户会话 | 7天 | TTL |
| `progress:{project_id}` | 生成进度 | 1小时 | Write Through |
| `templates:styles` | 风格模板列表 | 1天 | Cache Aside |
| `rate_limit:{user_id}:{api}` | 限流计数 | 1分钟 | 滑动窗口 |
| `sms_code:{phone}` | 验证码 | 5分钟 | TTL |

### 6.2 缓存键设计

```python
# Redis Key 命名规范
class CacheKeys:
    # 用户相关
    USER_INFO = "user:{user_id}"
    USER_CREDITS = "user:credits:{user_id}"
    USER_SESSION = "session:{token}"
    
    # 项目相关
    PROJECT_PROGRESS = "progress:{project_id}"
    PROJECT_DETAIL = "project:{project_id}"
    
    # 模板相关
    STYLE_TEMPLATES = "templates:styles"
    VOICE_OPTIONS = "templates:voices"
    MUSIC_LIST = "templates:music:{mood}"
    
    # 限流相关
    RATE_LIMIT = "rate_limit:{user_id}:{api_path}"
    
    # 验证码
    SMS_CODE = "sms_code:{phone}"
    SMS_RATE_LIMIT = "sms_rate:{phone}"
```

---

## 七、安全设计

### 7.1 认证流程

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              JWT 认证流程                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   登录成功                                                                       │
│      │                                                                           │
│      ▼                                                                           │
│   ┌────────────────────────────────────────────┐                                │
│   │  生成 Token 对                              │                                │
│   │  • Access Token  (有效期: 2小时)           │                                │
│   │  • Refresh Token (有效期: 30天)            │                                │
│   └────────────────────────────────────────────┘                                │
│      │                                                                           │
│      │ 返回给客户端                                                              │
│      ▼                                                                           │
│   ┌────────────────────────────────────────────┐                                │
│   │  客户端存储 Token                           │                                │
│   │  • Access Token  → 内存/安全存储           │                                │
│   │  • Refresh Token → Keychain/安全存储       │                                │
│   └────────────────────────────────────────────┘                                │
│                                                                                  │
│   ─────────────────── 请求 API ───────────────────                               │
│                                                                                  │
│   ┌────────────────────────────────────────────┐                                │
│   │  Authorization: Bearer {access_token}      │                                │
│   └────────────────────────────────────────────┘                                │
│      │                                                                           │
│      ▼                                                                           │
│   ┌─────────────────┐    有效     ┌─────────────────┐                           │
│   │ 验证 Token      │ ──────────► │  处理请求       │                           │
│   └─────────────────┘             └─────────────────┘                           │
│      │                                                                           │
│      │ 过期                                                                      │
│      ▼                                                                           │
│   ┌─────────────────┐    有效     ┌─────────────────┐                           │
│   │ 使用 Refresh    │ ──────────► │  签发新 Token   │                           │
│   │ Token 刷新      │             │  对             │                           │
│   └─────────────────┘             └─────────────────┘                           │
│      │                                                                           │
│      │ 也过期                                                                    │
│      ▼                                                                           │
│   ┌─────────────────┐                                                           │
│   │  要求重新登录   │                                                           │
│   └─────────────────┘                                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 JWT Token 结构

```json
// Access Token Payload
{
  "sub": "user_uuid",
  "type": "access",
  "membership": "pro",
  "iat": 1705312234,
  "exp": 1705319434
}

// Refresh Token Payload
{
  "sub": "user_uuid",
  "type": "refresh",
  "jti": "unique_token_id",
  "iat": 1705312234,
  "exp": 1707904234
}
```

### 7.3 API 限流规则

| API 类型 | 限制规则 | 说明 |
|---------|---------|------|
| 验证码发送 | 1次/分钟/手机号 | 防止轰炸 |
| 登录尝试 | 5次/5分钟/IP | 防止暴力破解 |
| Prompt 增强 | 30次/小时/用户 | 防止滥用 |
| 视频生成 | 取决于会员等级 | 配额限制 |
| 普通 API | 60次/分钟/用户 | 通用限制 |

---

## 八、监控与日志

### 8.1 监控指标

| 指标类型 | 监控项 | 告警阈值 |
|---------|-------|---------|
| **系统指标** | CPU 使用率 | > 80% |
| | 内存使用率 | > 85% |
| | 磁盘使用率 | > 90% |
| **应用指标** | API 响应时间 | > 1s (P99) |
| | 错误率 | > 1% |
| | QPS | < 50 |
| **业务指标** | 视频生成成功率 | < 95% |
| | 生成队列积压 | > 100 |
| | 用户注册转化率 | 异常波动 |

### 8.2 日志规范

```json
// 结构化日志格式
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "video-service",
  "trace_id": "abc123",
  "user_id": "user_uuid",
  "action": "video_generate_start",
  "project_id": "project_uuid",
  "duration_ms": 150,
  "metadata": {
    "engine": "runway",
    "style": "cinematic"
  }
}
```

---

## 九、部署配置

### 9.1 Docker Compose (开发环境)

```yaml
version: '3.8'

services:
  # API Gateway
  kong:
    image: kong:3.5
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
    ports:
      - "8000:8000"
      - "8443:8443"
    volumes:
      - ./kong/kong.yml:/kong/kong.yml

  # User Service
  user-service:
    build: ./services/user-service
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/vidcraft
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  # Script Service
  script-service:
    build: ./services/script-service
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/vidcraft
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8001:8001"
    depends_on:
      - postgres
      - redis

  # Video Service
  video-service:
    build: ./services/video-service
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/vidcraft
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
      RUNWAY_API_KEY: ${RUNWAY_API_KEY}
    ports:
      - "8002:8002"
    depends_on:
      - postgres
      - redis
      - rabbitmq

  # Worker Service
  worker:
    build: ./services/worker
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/vidcraft
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
      RUNWAY_API_KEY: ${RUNWAY_API_KEY}
      OSS_ACCESS_KEY: ${OSS_ACCESS_KEY}
      OSS_SECRET_KEY: ${OSS_SECRET_KEY}
    depends_on:
      - rabbitmq
      - postgres
    deploy:
      replicas: 3

  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vidcraft
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### 9.2 环境变量配置

```bash
# .env.example

# 数据库
DATABASE_URL=postgres://user:password@localhost:5432/vidcraft
REDIS_URL=redis://localhost:6379

# 认证
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES=7200
JWT_REFRESH_EXPIRES=2592000

# AI 服务
OPENAI_API_KEY=sk-xxx
RUNWAY_API_KEY=xxx
KLING_API_KEY=xxx

# 存储
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
OSS_BUCKET=vidcraft-media
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
CDN_DOMAIN=cdn.vidcraft.ai

# 短信
ALIYUN_SMS_ACCESS_KEY=xxx
ALIYUN_SMS_SECRET_KEY=xxx
ALIYUN_SMS_SIGN_NAME=VidCraft
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxx

# 消息队列
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# 监控
SENTRY_DSN=https://xxx@sentry.io/xxx
```

