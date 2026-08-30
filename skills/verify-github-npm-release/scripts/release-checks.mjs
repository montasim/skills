import { spawnSync } from 'node:child_process'

export function runCommand(command, args, { cwd, timeoutMs }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
  })
  const timedOut = result.error?.code === 'ETIMEDOUT'
  return {
    ok: result.status === 0 && !timedOut,
    status: result.status,
    timedOut,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    detail: timedOut
      ? `Command timed out after ${timeoutMs}ms.`
      : (result.stderr || result.error?.message || '').trim(),
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokens(command) {
  return (command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [])
    .map((token) => token.replace(/^(['"])(.*)\1$/, '$2'))
}

function packageIsSpecified(commandTokens, spec) {
  return commandTokens.some((token, index) =>
    token === spec ||
    token === `--package=${spec}` ||
    token === `-p=${spec}` ||
    ((token === '--package' || token === '-p') && commandTokens[index + 1] === spec)
  )
}

function isDirectNpx(commandTokens, spec) {
  const npx = commandTokens.findIndex((token) => token === 'npx' || token.endsWith('/npx'))
  return npx !== -1 && commandTokens.slice(npx + 1).includes(spec)
}

function defaultBinIsCompatible(packageName, bin) {
  if (!bin) return null
  if (typeof bin === 'string') return true
  const entries = Object.entries(bin)
  if (entries.length === 1) return true
  const unscopedName = packageName.startsWith('@') ? packageName.split('/')[1] : packageName
  if (Object.hasOwn(bin, unscopedName)) return true
  return new Set(entries.map(([, target]) => target)).size === 1
}

export function evaluateInstallCommand({
  installCommand,
  packageName,
  version,
  distTag,
  npmMetadata,
}) {
  const commandTokens = tokens(installCommand)
  const exactSpec = `${packageName}@${version}`
  const aliasSpec = `${packageName}@${distTag}`
  const exact = packageIsSpecified(commandTokens, exactSpec)
  const alias = !exact && packageIsSpecified(commandTokens, aliasSpec)
  const aliasVerified = alias && npmMetadata?.['dist-tags']?.[distTag] === version

  const bins = !npmMetadata?.bin
    ? null
    : typeof npmMetadata.bin === 'string'
      ? [packageName.startsWith('@') ? packageName.split('/')[1] : packageName]
      : Object.keys(npmMetadata.bin)
  const selectedSpec = exact ? exactSpec : alias ? aliasSpec : null
  const direct = selectedSpec ? isDirectNpx(commandTokens, selectedSpec) : false
  const binMatch = direct
    ? defaultBinIsCompatible(packageName, npmMetadata?.bin)
    : bins
    ? bins.some((bin) => new RegExp(`(^|\\s)${escapeRegExp(bin)}($|\\s)`).test(installCommand))
    : null

  if (!exact && !aliasVerified) {
    return {
      state: 'fail',
      detail: alias
        ? `${aliasSpec} is not proven to resolve to ${version}.`
        : `Command does not pin ${exactSpec} or use the verified ${aliasSpec} alias.`,
    }
  }
  if (binMatch === false) {
    return {
      state: 'fail',
      detail: direct
        ? 'The package does not expose an unambiguous default executable for direct npx invocation.'
        : 'Command does not invoke a published executable.',
    }
  }
  if (exact && binMatch === true) {
    return { state: 'pass', detail: `Command pins immutable ${exactSpec} and invokes a compatible published executable.` }
  }
  if (aliasVerified) {
    return {
      state: 'warning',
      detail: `${aliasSpec} currently resolves to ${version}; the command is valid now but the alias is mutable.`,
    }
  }
  return {
    state: 'warning',
    detail: `Package version is exact, but executable metadata could not be cross-checked.`,
  }
}
