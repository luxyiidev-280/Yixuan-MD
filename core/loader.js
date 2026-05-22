//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Loader Inteligente / Anti-Crash de Comandos
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import path from "path"
import { pathToFileURL } from "url"

import {
  paths
} from "#system/config.js"

import {
  listFiles,
  writeJson,
  readJson
} from "#system/files.js"

import {
  logger
} from "#system/logger.js"

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

function normalizePath(filePath = "") {
  return "./" + path
    .relative(process.cwd(), filePath)
    .replace(/\\/g, "/")
}

function normalizeAliases(aliases = []) {
  if (!Array.isArray(aliases))
    return []

  return [
    ...new Set(
      aliases
        .map(alias => normalizeName(alias))
        .filter(Boolean)
    )
  ]
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

function readPreviousHealth() {
  return readJson(
    paths.commandHealth,
    {
      brokenPaths: [],
      fixedPaths: [],
      errors: []
    }
  )
}

function getPreviousBrokenSet() {
  const previous =
    readPreviousHealth()

  const oldBroken =
    new Set()

  if (Array.isArray(previous.brokenPaths)) {
    for (const item of previous.brokenPaths) {
      if (item)
        oldBroken.add(item)
    }
  }

  if (Array.isArray(previous.errors)) {
    for (const item of previous.errors) {
      if (item?.path)
        oldBroken.add(item.path)
    }
  }

  return oldBroken
}

function validateCommand(command, filePath = "") {
  if (!command) {
    throw new Error(
      "export default não encontrado"
    )
  }

  if (
    typeof command !== "object" ||
    Array.isArray(command)
  ) {
    throw new Error(
      "export default precisa ser um objeto"
    )
  }

  const name =
    normalizeName(command.name)

  if (!name) {
    throw new Error(
      "command.name precisa ser uma string válida"
    )
  }

  if (
    !command.run ||
    typeof command.run !== "function"
  ) {
    throw new Error(
      "command.run precisa ser uma função"
    )
  }

  const aliases =
    normalizeAliases(command.aliases || [])

  const category =
    normalizeName(command.category || "members") ||
    "members"

  return {
    ...command,

    name,
    aliases,
    category,

    description:
      clean(command.description || ""),

    usage:
      clean(command.usage || ""),

    cooldown:
      Number(command.cooldown || 0),

    ownerOnly:
      Boolean(command.ownerOnly),

    groupOnly:
      Boolean(command.groupOnly),

    adminOnly:
      Boolean(command.adminOnly),

    botAdmin:
      Boolean(command.botAdmin),

    hidden:
      Boolean(command.hidden),

    path:
      normalizePath(filePath),

    loadedAt:
      now()
  }
}

function saveCommandHealth({
  success = [],
  failed = [],
  fixed = [],
  ignoredAliases = []
} = {}) {
  const data = {
    updatedAt:
      now(),

    success:
      success.length,

    failed:
      failed.length,

    fixed:
      fixed.length,

    ignoredAliases:
      ignoredAliases.length,

    brokenPaths:
      failed.map(item => item.path),

    fixedPaths:
      fixed.map(item => item.path),

    commands:
      success.map(item => ({
        name:
          item.name,

        category:
          item.category,

        path:
          item.path,

        aliases:
          item.aliases || []
      })),

    errors:
      failed.map(item => ({
        path:
          item.path,

        error:
          item.error,

        time:
          item.time
      })),

    aliases:
      ignoredAliases
  }

  try {
    writeJson(
      paths.commandHealth,
      data
    )
  } catch {}

  return data
}

async function importCommand(filePath = "") {
  const absolutePath =
    path.resolve(filePath)

  const url =
    pathToFileURL(absolutePath).href +
    `?update=${Date.now()}`

  const imported =
    await import(url)

  return imported.default
}

function logBrokenCommand(filePath = "", error = "") {
  logger.error(
    "COMMAND_LOADER",
    [
      `❌️ ERRO EM: ${filePath}`,
      `❌️ IGNORANDO COMPLETAMENTE O COMANDO ATÉ SER ARRUMADO.`,
      `Motivo: ${shortError(error)}`
    ].join(" ")
  )
}

function logFixedCommand(filePath = "") {
  logger.system(
    `✅️ COMANDO ARRUMADO: ${filePath}`
  )
}

export async function loadCommands(commandsPath = paths.commands) {
  const commands =
    new Map()

  const aliases =
    new Map()

  const success =
    []

  const failed =
    []

  const fixed =
    []

  const ignoredAliases =
    []

  const previousBroken =
    getPreviousBrokenSet()

  const files =
    listFiles(
      commandsPath,
      ".js"
    )

  for (const filePath of files) {
    const displayPath =
      normalizePath(filePath)

    try {
      const commandModule =
        await importCommand(filePath)

      const command =
        validateCommand(
          commandModule,
          filePath
        )

      if (commands.has(command.name)) {
        throw new Error(
          `comando duplicado: ${command.name}`
        )
      }

      commands.set(
        command.name,
        command
      )

      for (const alias of command.aliases) {
        if (!alias)
          continue

        if (alias === command.name)
          continue

        if (commands.has(alias)) {
          ignoredAliases.push({
            alias,
            command:
              command.name,

            path:
              command.path,

            reason:
              "alias tem o mesmo nome de um comando"
          })

          continue
        }

        if (aliases.has(alias)) {
          ignoredAliases.push({
            alias,
            command:
              command.name,

            path:
              command.path,

            reason:
              `alias já usado por ${aliases.get(alias)}`
          })

          continue
        }

        aliases.set(
          alias,
          command.name
        )
      }

      success.push({
        name:
          command.name,

        category:
          command.category,

        path:
          command.path,

        aliases:
          command.aliases
      })

      if (previousBroken.has(displayPath)) {
        fixed.push({
          path:
            displayPath,

          time:
            now()
        })

        logFixedCommand(displayPath)
      }
    } catch (error) {
      const err =
        formatError(error)

      failed.push({
        path:
          displayPath,

        error:
          err,

        time:
          now()
      })

      logBrokenCommand(
        displayPath,
        err
      )
    }
  }

  logger.loader({
    success:
      success.length,

    failed:
      failed.length
  })

  if (ignoredAliases.length) {
    for (const item of ignoredAliases) {
      logger.warn(
        `Alias ignorado: ${item.alias} | ${item.reason} | ${item.path}`
      )
    }
  }

  const health =
    saveCommandHealth({
      success,
      failed,
      fixed,
      ignoredAliases
    })

  return {
    commands,
    aliases,
    success,
    failed,
    fixed,
    ignoredAliases,
    health,

    total:
      success.length + failed.length
  }
}

export function getCommand(commands = new Map(), aliases = new Map(), name = "") {
  const commandName =
    normalizeName(name)

  if (!commandName)
    return null

  if (commands.has(commandName)) {
    return commands.get(commandName)
  }

  const aliasTarget =
    aliases.get(commandName)

  if (aliasTarget && commands.has(aliasTarget)) {
    return commands.get(aliasTarget)
  }

  return null
}

export function listLoadedCommands(commands = new Map()) {
  return [...commands.values()]
    .map(command => ({
      name:
        command.name,

      aliases:
        command.aliases || [],

      category:
        command.category || "members",

      description:
        command.description || "",

      path:
        command.path || ""
    }))
}

export function groupLoadedCommands(commands = new Map()) {
  const grouped =
    {}

  for (const command of commands.values()) {
    const category =
      command.category || "members"

    if (!grouped[category])
      grouped[category] = []

    grouped[category].push(command)
  }

  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  return grouped
}