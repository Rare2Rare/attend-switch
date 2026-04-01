# 参加表明スイッチ

ワンクリックで「参加 / 不参加 / 保留」を表明できる軽量Webアプリ。
募集者がスレッドを作成し、参加者がURLにアクセスして状態を登録する。
ログイン不要・URL共有だけで運用可能。

## 主な機能

- スレッド作成（公開URL + 管理URL発行）
- 参加 / 不参加 / 保留のワンクリック登録
- 同一ブラウザからの状態更新・取り消し
- 管理URLによるスレッド編集・手動リセット・個別削除
- 毎日自動リセット（cron対応）
- 締切日時設定
- CSV出力
- PC / スマホ両対応

## 技術スタック

- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **DB**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **デプロイ**: Vercel

## セットアップ

### 前提条件

- Node.js 18+
- Supabase プロジェクト（無料枠OK）

### 1. インストール

```bash
git clone <repo-url>
cd attend-switch
npm install
```

### 2. Supabase 設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Settings > Database > Connection string > Transaction pooler (port 6543) の接続文字列を取得

### 3. 環境変数

`.env.local` を作成（`.env.example` を参照）:

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
CRON_SECRET="任意のランダム文字列"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Supabase Postgres 接続文字列（Transaction pool mode, port 6543） |
| `CRON_SECRET` | 自動リセットAPI認証用シークレット |
| `NEXT_PUBLIC_APP_URL` | アプリの公開URL |

### 4. DB マイグレーション

```bash
npx drizzle-kit generate   # マイグレーションSQL生成
npx drizzle-kit migrate     # DB適用
```

### 5. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。

## Vercel デプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定:
   - `DATABASE_URL`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_APP_URL`（デプロイ先のURL、例: `https://attend-switch.vercel.app`）
3. デプロイ

### 自動リセットジョブ

`vercel.json` に cron 設定済み（5分おき）:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**注意**: Vercel Hobby プランは1日1回のcron制限があります。
5分おきの実行にはProプラン、または外部cronサービス（cron-job.org等）を使用してください。

外部cronから手動で叩く場合:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/reset
```

## 管理URL方式

- スレッド作成時に「公開URL」と「管理URL」の2つが発行されます
- **公開URL**: 参加者に共有。名前入力 + 状態登録用
- **管理URL**: 作成者専用。編集・リセット・削除が可能
- 管理URLは推測困難なランダムトークン（32文字）を含みます
- パスワード不要。URLを知っている人だけが管理操作できます
- 管理URLは安全に保管してください

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # / スレッド一覧
│   ├── not-found.tsx           # 404
│   ├── create/page.tsx         # /create スレッド作成
│   ├── thread/[publicId]/
│   │   └── page.tsx            # /thread/[id] 詳細+参加
│   ├── manage/[manageToken]/
│   │   └── page.tsx            # /manage/[token] 管理
│   └── api/cron/reset/
│       └── route.ts            # 自動リセットcron
├── db/
│   ├── schema.ts               # Drizzle スキーマ定義
│   └── index.ts                # DB接続
├── actions/
│   ├── thread.ts               # スレッド CRUD
│   └── response.ts             # 参加登録・取り消し
├── lib/
│   ├── id.ts                   # ID生成 (nanoid)
│   ├── validators.ts           # Zodバリデーション
│   ├── date.ts                 # JST日時ユーティリティ
│   └── participant.ts          # localStorage トークン管理
└── components/
    ├── thread-form.tsx          # 作成/編集フォーム
    ├── thread-card.tsx          # 一覧カード
    ├── response-panel.tsx       # 参加ボタン群
    ├── response-list.tsx        # 参加者一覧+集計
    ├── manage-actions.tsx       # 管理操作(リセット/CSV/個別削除)
    ├── status-badge.tsx         # 状態バッジ
    └── copy-url-button.tsx      # URLコピー
```

## DBスキーマ

### threads

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | PK |
| public_id | VARCHAR(16) | 公開URL用ID (unique) |
| manage_token | VARCHAR(64) | 管理用トークン (unique) |
| title | VARCHAR(100) | タイトル |
| description | TEXT | 説明 (nullable) |
| is_public | BOOLEAN | 一覧公開フラグ (default: true) |
| reset_time_jst | VARCHAR(5) | 自動リセット時刻 "HH:MM" (nullable) |
| deadline_at | TIMESTAMPTZ | 締切日時 (nullable) |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |
| last_reset_at | TIMESTAMPTZ | 最終リセット日時 (nullable) |

### responses

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | PK |
| thread_id | UUID | FK → threads.id |
| participant_token | VARCHAR(64) | ブラウザ識別トークン |
| display_name | VARCHAR(50) | 表示名 |
| status | ENUM | attending / absent / pending |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |
| deleted_at | TIMESTAMPTZ | 論理削除日時 (nullable) |

**制約**: `(thread_id, participant_token) WHERE deleted_at IS NULL` で一意

## 制約事項

- **本人識別はブラウザ単位**: localStorage のトークンで判定するため、別ブラウザ・別端末では別人扱い
- **ログインなし**: 認証機能は未実装。URLの共有のみで運用
- **管理URLの紛失**: 復旧手段なし。作成時に安全に保存してください
- **同名ユーザー**: 同じ名前の別人は許容される（内部的にはトークンで区別）

## 未実装・今後の拡張候補

- [ ] 認証ログイン（管理者向け）
- [ ] メール通知
- [ ] QRコード生成
- [ ] リアルタイム更新（WebSocket/Supabase Realtime）
- [ ] スレッドアーカイブ・自動削除
- [ ] 多言語対応
- [ ] カスタム状態ラベル
