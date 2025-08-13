import NewsIndexClient from "./NewsIndexClient"

export const metadata = {
  title: "Notícias",
  description: "Acompanhe as últimas notícias e atualizações da comunidade.",
}

export default function NoticiasIndexPage() {
  return (
    <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        <h1 className="text-3xl/tight font-semibold tracking-tight sm:text-4xl/tight">Notícias</h1>
      </div>
      <NewsIndexClient />
    </div>
  )
}


