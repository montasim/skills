#!/usr/bin/env node

import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const viteBin = resolve(appRoot, "node_modules", "vite", "bin", "vite.js")

async function availablePort() {
  const server = createServer()
  await new Promise((resolveListen, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolveListen)
  })
  const address = server.address()
  const port = typeof address === "object" && address ? address.port : undefined
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())))
  if (!port) throw new Error("Could not reserve a local port")
  return port
}

async function stop(child) {
  if (child.exitCode !== null) return
  child.kill("SIGTERM")
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 1_000)),
  ])
  if (child.exitCode === null) child.kill("SIGKILL")
}

const port = await availablePort()
const child = spawn(process.execPath, [viteBin, "dev", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  cwd: appRoot,
  env: { ...process.env, NO_COLOR: "1" },
  stdio: ["ignore", "pipe", "pipe"],
})

let output = ""
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding("utf8")
  stream.on("data", (chunk) => {
    output = `${output}${chunk}`.slice(-12_000)
  })
}

const deadline = Date.now() + 15_000
let ready = false

try {
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vite exited before becoming ready.\n${output.trim()}`)
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(500) })
      if (response.ok) {
        ready = true
        break
      }
    } catch {
      // The server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 150))
  }
  if (!ready) throw new Error(`Vite did not become ready within 15 seconds.\n${output.trim()}`)
  console.log(`Skillfolio dev server became ready on port ${port}.`)
} finally {
  await stop(child)
}
