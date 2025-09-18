# AI Chat / Project Chat Manager

一個以 Next.js 15 (App Router) 建構的 AI 對話與專案歸檔應用，整合 GitHub OAuth、Prisma、OpenAI 文字生成功能與串流回傳。提供聊天訊息管理、聊天指派到專案、AI 自動產生標題、即時串流回覆等功能。

---

##  Features

| 類別           | 功能                                                              |
| -------------- | ----------------------------------------------------------------- |
| 認證           | GitHub OAuth via `next-auth` (JWT strategy)                       |
| 使用者資料     | 自動建立 / 對應 GitHub 使用者 (providerId)                        |
| 聊天           | 建立對話、AI 回覆、串流輸出 (`TransformStream`) 保存完整訊息      |
| AI 標題        | 根據第一則訊息自動生成 3 個詞以內標題                             |
| 專案           | 建立 / 重新命名專案，將聊天指派到專案 (多對一)                    |
| UI             | Shadcn UI + Tailwind CSS 4 + 深色 / 淺色主題 `next-themes`        |
| 型別安全       | Prisma Schema + Zod 驗證 + Typed Routes + TypeScript              |
| Server Actions | 使用 `use server` 行為處理資料庫 CRUD 與 redirect                 |
| Streaming      | `/api/chats/[id]/messages/stream` 回傳分段文字並在 flush 後持久化 |
| 測試           | 使用 Vitest + Testing Library (基礎配置)                          |

---

## Tech Stack

- Framework: `Next.js 15` (App Router, Server Actions, Middleware)
- Auth: `next-auth@5 (beta)` with GitHub provider (JWT strategy)
- Database: PostgreSQL + `Prisma 6`
- AI SDK: `ai` + `@ai-sdk/openai` (model: `gpt-4o-mini` 可調整)
- Styling: Shadcn UI, Tailwind CSS 4,
- State (Chat): 自訂 hook + Context Provider
- Validation: `zod`
- Testing: `vitest`, `@testing-library/react`

---

## Domain Models (Prisma)

```
User 1 - * Project
User 1 - * Chat
Project 1 - * Chat (可選, Chat 可無 Project)
Chat 1 - * Message
Message.role ∈ { user, assistant }
```

主要欄位：
- `User`: providerId (GitHub id) 連結登入來源
- `Project`: 使用者分組容器，名稱可改
- `Chat`: 可能屬於某個 Project，儲存標題 (AI 生成或手動) 與訊息集合
- `Message`: 儲存對話文本與角色

---

## Project Structure

```
app/
	(auth)/login        # 登入頁面
	(dashboard)/chats   # 個人聊天列表與詳情
	(dashboard)/projects# 專案與內部聊天
	api/                # REST/Route Handlers (AI / Auth / Chat / Project)
components/           # UI + Chat + Project 元件模組化
lib/                  # prisma, ai-service, actions, schemas, utils
prisma/schema.prisma  # DB Schema 定義
middleware.ts         # 保護 /chats /projects 相關路徑
```

---

## Authentication Flow

1. 使用者透過 GitHub OAuth 登入 (`/api/auth/*` handled by `next-auth` handlers)。
2. `signIn` callback 內 `findOrCreateUser` 以 GitHub id (providerId) 持久化使用者。
3. `jwt` callback 將 `uid` (GitHub id) 與對應資料庫 `dbUserId` 寫入 token。
4. `session` callback 將 `dbUserId` 暴露於 `session.user.dbUserId`。
5. `middleware.ts` 保護受限路徑 (未登入導向 `/login?callbackUrl=...`)。

---

## AI / Chat Flow

1. 前端送出訊息 → 建立 user message → (可選) 呼叫 `/api/chats/[id]/messages/stream`。
2. 從資料庫載入歷史訊息 `getMessagesByChatId`。
3. 建立模型 instance: `createOpenAIModel({ apiKey })`。
4. 串流: `streamChatResponse` 使用 `ai.streamText` → Web Stream → Transform 保存累積文本 (flush 時建立 assistant message)。
5. 標題生成：`/api/chats/[id]/title` 根據第一則 user message 產出 3 個詞以內標題。

---

## Environment Variables

建立 `.env` (或 `.env.local`)：

```
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"  # (選用，用於 Prisma 直連)

# Auth (GitHub OAuth)
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"  # 需固定
NEXTAUTH_URL="http://localhost:3000"          # 部署時更新為正式網址

# OpenAI
OPENAI_API_KEY=sk-...

# Public
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

本專案啟用 `experimental.typedEnv`，請確保在部署環境中亦設定對應值。

---

## Getting Started

```bash
# 1. 安裝依賴
pnpm install

# 2. 資料庫遷移 (會生成 Prisma Client)
npx prisma migrate dev --name init

# 3. (選用) Prisma Studio 檢視資料
npx prisma studio

# 4. 啟動開發伺服器
pnpm dev

# 5. 開啟瀏覽器
open http://localhost:3000
```

登入後即可進入 `/chats` 或 `/projects` 管理界面。

---

## API Endpoints (Route Handlers 摘要)

| Method           | Path                                | 描述                          |
| ---------------- | ----------------------------------- | ----------------------------- |
| GET/POST         | `/api/auth/[...nextauth]`           | NextAuth handlers             |
| POST             | `/api/chats/[id]/messages/generate` | 一次性產生完整 AI 回覆        |
| POST             | `/api/chats/[id]/messages/stream`   | 串流 AI 回覆，flush 後寫入 DB |
| POST             | `/api/chats/[id]/title`             | 產生/更新對話標題             |
| POST             | `/api/projects`                     | 建立專案 (server action 亦可) |
| (Server Actions) | `lib/actions/*.ts`                  | 聊天 / 專案 CRUD, redirect    |

> 備註：聊天建立與指派主要透過 Server Actions (`createChatAndRedirect`, `assignChatToProject`) 而非公開 REST 端點。

---

## 🧩 Key Modules

- `lib/ai-service.ts`: 封裝 OpenAI model 產生、文字生成、串流文本。
- `lib/actions/*.ts`: 使用 `use server` 與 Prisma 實作資料存取。
- `components/chat/*`: 聊天視窗、輸入框、Markdown 渲染、指派專案 Modal。
- `lib/chat/*`: Chat Provider / hook 管理訊息與送出行為。
- `middleware.ts`: 受保護路徑登入檢查與回跳。
- `lib/schemas/validators.ts`: Zod schema 驗證輸入資料。

---

## Prisma Operations 常用指令

```bash
# 產生新的 migration (schema 變更後)
npx prisma migrate dev --name add_xxx

# 僅重新生成 client
npx prisma generate

# 視覺化資料庫
npx prisma studio
```
