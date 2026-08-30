import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "theme-color", content: "#C04A16" },
      { name: "color-scheme", content: "light" },
      {
        name: "keywords",
        content:
          "AI agent skills, Codex skills, Claude Code skills, developer tools, agent workflows",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://raw.githubusercontent.com" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center px-5 py-20 lg:px-10">
      <p className="font-mono text-eyebrow tracking-[0.18em] text-brand uppercase">
        404 / shelf miss
      </p>
      <h1 className="mt-4 max-w-2xl font-heading text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-page-title">
        That skill is not on the shelf.
      </h1>
      <a
        href="/"
        className="mt-6 font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-brand"
      >
        Return to the library
      </a>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-paper text-ink antialiased selection:bg-brand-soft selection:text-ink">
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          src="https://www.supportkori.com/widget.js"
          data-id="montasim"
          data-message="Support"
          data-color="#c04a16"
          data-position="right"
        ></script>
        <Scripts />
      </body>
    </html>
  )
}
