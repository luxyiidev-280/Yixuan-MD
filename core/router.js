//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Router Seguro / Anti-Crash Runtime
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  paths
} from "#system/config.js"

import {
  logger
} from "#system/logger.js"

import {
  reply,
  errorBox,
  unknownCommandBox
} from "#system/reply.js"

import {
  isOwner,
  checkGroup,
  checkAdmin,
  checkBotAdmin,
  getGroupName
} from "#system/admin.js"

import {
  addUserCount,
  addGroupCount,
  isUserBanned,
  isUserBlocked
} from "#system/state.js"

import {
  readJson,
  writeJson
} from "#system/files.js"

import {
  getCommand
} from "./loader.js"

const cooldowns =
  new Map()

const runtimeErrors =
  new Map()

const quarantinedCommands =
  new Map()

const RUNTIME_HEALTH_FILE =
  "./database/runtime-health.json"

function now() {
  return Date.now()
}

function clean(value = "") {
  return String(value || "")
    .trim()
}

function normalizeName(value = "") {
  return clean(value)
    .toLowerCase()
    .replace(/^\W+/, "")
}

function commandKey(command = {}) {
  return command?.name || "unknown"
}

function cooldownKey(sender = "", command = "") {
  return `${sender}:${command}`
}

function formatError(error = "") {
  return (
    error?.stack ||
    error?.message ||
    String(error || "Erro desconhecido")
  )
}

function shortError(error = "") {
  return String(error || "")
    .split("\n")[0]
    .slice(0, 220)
}

function readRuntimeHealth() {
  return readJson(
    RUNTIME_HEALTH_FILE,
    {
      updatedAt: now(),
      quarantined: {},
      errors: {}
    }
  )
}

function saveRuntimeHealth(data = {}) {
  writeJson(
    RUNTIME_HEALTH_FILE,
    {
      updatedAt: now(),
      quarantined: data.quarantined || {},
      errors: data.errors || {}
    }
  )
}

function loadRuntimeQuarantine() {
  const db =
    readRuntimeHealth()

  for (const [name, data] of Object.entries(db.quarantined || {})) {
    quarantinedCommands.set(
      name,
      data
    )
  }
}

function persistRuntimeError(command = {}, errorText = "") {
  const name =
    commandKey(command)

  const db =
    readRuntimeHealth()

  if (!db.errors)
    db.errors = {}

  if (!db.quarantined)
    db.quarantined = {}

  const current =
    db.errors[name] || {
      count: 0,
      path: command.path || "",
      lastError: "",
      updatedAt: now()
    }

  current.count =
    Number(current.count || 0) + 1

  current.path =
    command.path || current.path || ""

  current.lastError =
    shortError(errorText)

  current.updatedAt =
    now()

  db.errors[name] =
    current

  saveRuntimeHealth(db)

  return current
}

function persistQuarantine(command = {}, reason = "") {
  const name =
    commandKey(command)

  const db =
    readRuntimeHealth()

  if (!db.quarantined)
    db.quarantined = {}

  db.quarantined[name] = {
    name,
    reason,
    path:
      command.path || "",
    time:
      now()
  }

  saveRuntimeHealth(db)
}

function clearRuntimeError(command = {}) {
  const name =
    commandKey(command)

  const db =
    readRuntimeHealth()

  if (db.errors?.[name]) {
    delete db.errors[name]
  }

  if (db.quarantined?.[name]) {
    delete db.quarantined[name]
  }

  saveRuntimeHealth(db)
}

function getCooldownMs(command = {}) {
  const custom =
    Number(command.cooldown || 0)

  if (custom > 0)
    return custom

  return bot.performance.commandCooldownMs
}

function isOnCooldown(sender = "", command = {}) {
  const key =
    cooldownKey(
      sender,
      commandKey(command)
    )

  const last =
    cooldowns.get(key) || 0

  const wait =
    getCooldownMs(command)

  if (!wait)
    return false

  return now() - last < wait
}

function setCooldown(sender = "", command = {}) {
  const key =
    cooldownKey(
      sender,
      commandKey(command)
    )

  cooldowns.set(
    key,
    now()
  )
}

function levenshtein(a = "", b = "") {
  a =
    normalizeName(a)

  b =
    normalizeName(b)

  const matrix =
    Array.from(
      {
        length: b.length + 1
      },
      (_, i) => [i]
    )

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost =
        b[i - 1] === a[j - 1]
          ? 0
          : 1

      matrix[i][j] =
        Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
    }
  }

  return matrix[b.length][a.length]
}

function getSuggestions(input = "", commands = new Map(), aliases = new Map()) {
  const names =
    new Set([
      ...commands.keys(),
      ...aliases.keys()
    ])

  const query =
    normalizeName(input)

  if (!query)
    return []

  return [...names]
    .map(name => ({
      name,
      score:
        levenshtein(query, name)
    }))
    .filter(item =>
      item.score <= Math.max(2, Math.floor(query.length / 2))
    )
    .sort((a, b) =>
      a.score - b.score ||
      a.name.localeCompare(b.name)
    )
    .slice(0, 3)
    .map(item =>
      `${bot.prefix}${item.name}`
    )
}

function getRuntimeErrorCount(commandName = "") {
  return runtimeErrors.get(commandName) || 0
}

function addRuntimeError(commandName = "") {
  const current =
    getRuntimeErrorCount(commandName)

  const next =
    current + 1

  runtimeErrors.set(
    commandName,
    next
  )

  return next
}

function quarantineCommand(command = {}, reason = "") {
  const name =
    commandKey(command)

  const data = {
    name,
    reason,
    path:
      command.path || "",
    time:
      now()
  }

  quarantinedCommands.set(
    name,
    data
  )

  persistQuarantine(
    command,
    reason
  )

  logger.error(
    "COMMAND_RUNTIME",
    [
      `❌️ ERRO EM: ${command.path || name}`,
      `❌️ IGNORANDO COMPLETAMENTE O COMANDO ATÉ SER ARRUMADO.`,
      `Motivo: ${reason}`
    ].join(" ")
  )
}

function isQuarantined(command = {}) {
  return quarantinedCommands.has(
    commandKey(command)
  )
}

function getLoaded(input = {}) {
  return {
    commands:
      input.commands ||
      global.commands ||
      new Map(),

    aliases:
      input.aliases ||
      global.aliases ||
      new Map()
  }
}

async function runPermissionChecks(sock, msg, read = {}, command = {}) {
  const from =
    read.from ||
    read.chat ||
    msg?.key?.remoteJid ||
    ""

  const sender =
    read.sender ||
    msg?.key?.participant ||
    from

  if (isUserBlocked(sender) || isUserBanned(sender)) {
    await reply(
      sock,
      msg,
      errorBox(
        "Usuário bloqueado",
        "Você não pode usar comandos."
      ),
      {
        jid: from
      }
    )

    return false
  }

  if (command.ownerOnly && !isOwner(sender)) {
    await reply(
      sock,
      msg,
      errorBox(
        "Permissão negada",
        "Apenas meu dono pode usar isso."
      ),
      {
        jid: from
      }
    )

    return false
  }

  if (command.groupOnly) {
    const ok =
      await checkGroup(
        sock,
        msg,
        read
      )

    if (!ok)
      return false
  }

  if (command.adminOnly) {
    const ok =
      await checkAdmin(
        sock,
        msg,
        read
      )

    if (!ok)
      return false
  }

  if (command.botAdmin) {
    const ok =
      await checkBotAdmin(
        sock,
        msg,
        read
      )

    if (!ok)
      return false
  }

  return true
}

async function buildCtx(sock, msg, read = {}, loaded = {}) {
  const from =
    read.from ||
    read.chat ||
    msg?.key?.remoteJid ||
    ""

  let groupName = ""

  if (read.isGroup) {
    groupName =
      await getGroupName(
        sock,
        from,
        ""
      )
  }

  return {
    ...read,

    from,
    chat:
      from,

    prefix:
      bot.prefix,

    bot,
    sock,
    msg,

    commands:
      loaded.commands,

    aliases:
      loaded.aliases,

    groupName
  }
}

export async function routeCommand(sock, msg, read = {}, loadedInput = {}) {
  const commandName =
    normalizeName(read.command)

  if (!commandName)
    return null

  const loaded =
    getLoaded(loadedInput)

  const command =
    getCommand(
      loaded.commands,
      loaded.aliases,
      commandName
    )

  const from =
    read.from ||
    read.chat ||
    msg?.key?.remoteJid ||
    ""

  if (!command) {
    const suggestions =
      getSuggestions(
        commandName,
        loaded.commands,
        loaded.aliases
      )

    return reply(
      sock,
      msg,
      unknownCommandBox(suggestions),
      {
        jid: from
      }
    )
  }

  if (isQuarantined(command)) {
    return reply(
      sock,
      msg,
      errorBox(
        "Comando indisponível",
        "Este comando foi ignorado até ser corrigido."
      ),
      {
        jid: from
      }
    )
  }

  const sender =
    read.sender ||
    msg?.key?.participant ||
    from

  if (isOnCooldown(sender, command)) {
    return null
  }

  const ctx =
    await buildCtx(
      sock,
      msg,
      read,
      loaded
    )

  const allowed =
    await runPermissionChecks(
      sock,
      msg,
      ctx,
      command
    )

  if (!allowed)
    return null

  setCooldown(
    sender,
    command
  )

  try {
    logger.command({
      command:
        command.name,

      args:
        ctx.args || [],

      sender:
        ctx.sender,

      pushName:
        ctx.pushName,

      groupName:
        ctx.groupName,

      isGroup:
        ctx.isGroup
    })

    addUserCount(
      ctx.sender,
      "commands",
      1
    )

    if (ctx.isGroup) {
      addGroupCount(
        ctx.from,
        "commands",
        1
      )
    }

    const result =
      await command.run(
        sock,
        msg,
        ctx.args || [],
        ctx
      )

    if (getRuntimeErrorCount(command.name) > 0) {
      runtimeErrors.delete(command.name)
      clearRuntimeError(command)
      logger.system(
        `✅️ COMANDO ARRUMADO: ${command.path || command.name}`
      )
    }

    return result
  } catch (error) {
    const errorText =
      formatError(error)

    logger.commandError({
      command:
        command.name,

      filePath:
        command.path || "",

      error:
        errorText
    })

    const memoryCount =
      addRuntimeError(command.name)

    const persisted =
      persistRuntimeError(
        command,
        errorText
      )

    const count =
      Math.max(
        memoryCount,
        persisted.count || 0
      )

    if (
      count >= bot.performance.maxCommandErrors
    ) {
      quarantineCommand(
        command,
        `${count} falhas durante execução`
      )
    }

    await reply(
      sock,
      msg,
      errorBox(
        "Erro interno",
        "O comando falhou e foi registrado."
      ),
      {
        jid:
          ctx.from
      }
    )

    return null
  }
}

export function getRouterStatus() {
  return {
    cooldowns:
      cooldowns.size,

    quarantined:
      [...quarantinedCommands.values()],

    runtimeErrors:
      Object.fromEntries(runtimeErrors)
  }
}

export function clearRouterRuntime() {
  cooldowns.clear()
  runtimeErrors.clear()
  quarantinedCommands.clear()

  try {
    saveRuntimeHealth({
      quarantined: {},
      errors: {}
    })
  } catch {}

  return true
}

loadRuntimeQuarantine()