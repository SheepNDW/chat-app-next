# AI Chat / Project Chat Manager

一個以 Next.js 15 (App Router) 建構的 AI 對話與專案歸檔應用，整合 GitHub OAuth、Prisma、OpenAI 文字生成功能與串流回傳。提供聊天訊息管理、聊天指派到專案、AI 自動產生標題、即時串流回覆等功能。

---

##  Features

| 類別           | 功能                                                              |
| -------------- | ----------------------------------------------------------------- |
| 認證           | GitHub OAuth via `next-auth` (JWT strategy)                       |
| 使用者資料     | 自動建立 / 對應 GitHub 使用者 (providerId)                        |
| 聊天           | 建立對話、AI 回覆、`@ai-sdk/react` 串流 (`DefaultChatTransport`)  |
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
- State (Chat): `@ai-sdk/react (useChat)` + 輕量 Context Provider 封裝
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

## AI / Chat Flow (已遷移至 `@ai-sdk/react`)

Client 端不再自行維護 reducer；改用 `useChat` 提供的 UI message 狀態，並透過自訂 `ChatProvider` 映射到資料庫訊息模型。

1. `ChatProvider` 初始化：將既有資料庫訊息轉為 `UIMessage[]` 傳給 `useChat({ id, transport })`。
2. 使用者送出訊息：`useChat.sendMessage({ text })` 直接呼叫，`DefaultChatTransport` 以 `POST /api/chats/[id]/messages/stream` 串流回傳 token。
3. Server 端 (`/api/chats/[id]/messages/stream`): 使用 `ai.streamText` (OpenAI model) 逐步寫入 `ReadableStream`，並在 stream 結束 (flush) 後一次性持久化完整 assistant message 進資料庫。
4. Client 端即時接收增量 token → `useChat` 合併為最新 `uiMessages` → `ChatProvider` 轉換為 domain `Message` 物件供 UI。
5. 標題生成：當第一則使用者訊息存在且 Chat 尚無標題時，`ChatProvider` 會呼叫 `/api/chats/[id]/title` 取得 ≤ 3 詞標題並更新。
6. 若需非串流一次性回覆，可改呼叫 `/api/chats/[id]/messages/generate`（目前仍保留）。

關鍵差異：
- 過去：client 自行組裝 streaming chunks、reducer 累積與最後寫入。
- 現在：client 交由 `@ai-sdk/react` 處理串流合併；server 還是以 `streamText` 控制 flush 時機與寫入。
- 簡化：少掉自訂 reducer、型別同步成本，並獲得內建錯誤 / status (`status === 'streaming'`) 與停止 `stop()` 能力。

`ChatProvider` 主要責任：
- 將 `uiMessages` (AI SDK) → 專案 `Message` 介面 (加入 `chatId`, 時間戳)
- 包裝 `sendMessage` 以過濾空白輸入
- 自動觸發標題生成
- 暴露 `isStreaming`, `status`, `error`

範例摘錄 (`lib/chat/ChatProvider.tsx`):

```ts
const { messages: uiMessages, sendMessage: aiSendMessage, status } = useChat({
	id: chatId,
	transport: new DefaultChatTransport({ api: `/api/chats/${chatId}/messages/stream` }),
});

const wrappedSendMessage = (text: string) => {
	if (!text.trim()) return;
	aiSendMessage({ text });
};
```

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
- `lib/chat/*`: Chat Provider 將 `@ai-sdk/react` UI messages 映射為資料庫訊息並處理標題生成、輸入過濾。
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
