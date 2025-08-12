This is the Ballistic Hub web app (Next.js + Firebase + shadcn/ui + Blookie.io).

## Getting Started

Setup:
- Crie `.env.local` com as variáveis abaixo (Firebase + Blookie):
  - `NEXT_PUBLIC_FIREBASE_API_KEY=`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=`
  - `NEXT_PUBLIC_FIREBASE_APP_ID=`
  - `NEXT_PUBLIC_BLOOKIE_SCRIPT_URL=`

- Instale as dependências e suba o servidor de dev:

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Página de login em /login.

### Observações
- Autenticação: Google pronto; Discord via `OAuthProvider("oidc.discord")` (configure no Firebase Console um provedor OIDC para Discord e ajuste `.env.local`).
- Firestore: as seções usam coleções `news` (status: "published"), `streamers` (isFeatured: true) e `tournaments` (ordenado por `startDate`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
