This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 管理画面（/admin）の設定

管理画面を使うには、以下の環境変数を設定してください（Vercel の場合は Project Settings → Environment Variables）。

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | ✅ | 管理者ログイン用パスワード。未設定の場合、管理者ログインは無効になります。推測されにくい長い値にしてください。 |
| `ADMIN_SESSION_SECRET` | 任意 | ログイン後のトークン署名に使う秘密鍵。未設定時は `ADMIN_PASSWORD` を使います。 |
| `ALLOWED_IPS` | 任意 | `/admin` と `/api/admin` へのアクセスを許可する IP（カンマ区切り）。未設定時は IP 制限なし。 |

ログイン後のトークンは 12 時間で失効します。`ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` を変更すると、発行済みのトークンはすべて無効になります。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
