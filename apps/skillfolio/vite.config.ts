import { existsSync, readFileSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import netlify from "@netlify/vite-plugin-tanstack-start"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const repositoryRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const skillsRoot = join(repositoryRoot, "skills")

function localReadmePlugin() {
  return {
    name: "skillfolio-local-readmes",
    configureServer(server: {
      middlewares: { use: (handler: Function) => void }
    }) {
      server.middlewares.use((request: any, response: any, next: Function) => {
        const pathname = request.url?.split("?", 1)[0] ?? ""
        const match = pathname.match(
          /^\/__skillfolio\/(readmes|resources)\/([a-z0-9-]+)(?:\/(.*))?$/
        )
        if (!match) return next()

        const skillRoot = resolve(skillsRoot, match[2])
        const requestedPath =
          match[1] === "readmes" ? "README.md" : match[3] || ""
        const filePath = resolve(skillRoot, requestedPath)
        const relativePath = relative(skillRoot, filePath)
        if (
          !existsSync(skillRoot) ||
          relativePath.startsWith(`..${sep}`) ||
          relativePath === ".." ||
          relativePath.startsWith("/") ||
          !existsSync(filePath)
        ) {
          return next()
        }

        const contentType = filePath.endsWith(".md")
          ? "text/markdown; charset=utf-8"
          : filePath.endsWith(".png")
            ? "image/png"
            : filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")
              ? "image/jpeg"
              : "application/octet-stream"
        response.statusCode = 200
        response.setHeader("Content-Type", contentType)
        response.end(readFileSync(filePath))
      })
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    localReadmePlugin(),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
})

export default config
