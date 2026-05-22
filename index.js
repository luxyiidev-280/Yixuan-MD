//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Inicialização Principal
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  runtime
} from "#system/config.js"

import {
  logger
} from "#system/logger.js"

import {
  prepareBoot
} from "#system/bootstrap.js"

import {
  flushState
} from "#system/state.js"

import {
  startOptimizer,
  stopOptimizer
} from "#system/optimizer.js"

import {
  loadCommands
} from "#core/loader.js"

import {
  startConnection,
  stopConnection
} from "./connection.js"

let shuttingDown =
  false

function bootInfo() {
  logger.system(
    `${bot.name} • ${bot.core} | Node ${runtime.node} | ${runtime.platform}/${runtime.arch}`
  )
}

function bindProcessGuards() {
  process.on(
    "uncaughtException",
    error => {
      logger.error(
        "UNCAUGHT_EXCEPTION",
        error
      )
    }
  )

  process.on(
    "unhandledRejection",
    reason => {
      logger.error(
        "UNHANDLED_REJECTION",
        reason
      )
    }
  )

  process.once(
    "SIGINT",
    async () => {
      await shutdown(
        "SIGINT"
      )
    }
  )

  process.once(
    "SIGTERM",
    async () => {
      await shutdown(
        "SIGTERM"
      )
    }
  )
}

async function shutdown(reason = "unknown") {
  if (shuttingDown)
    return

  shuttingDown =
    true

  logger.warn(
    `Encerrando processo | motivo: ${reason}`
  )

  try {
    flushState()
  } catch {}

  try {
    stopOptimizer()
  } catch {}

  try {
    await stopConnection()
  } catch {}

  process.exit(0)
}

async function main() {
  prepareBoot()

  bootInfo()

  bindProcessGuards()

  startOptimizer()

  const loaded =
    await loadCommands()

  global.commands =
    loaded.commands

  global.aliases =
    loaded.aliases

  await startConnection(
    loaded
  )

  logger.system(
    `${bot.name} iniciado com sucesso`
  )
}

main().catch(error => {
  logger.error(
    "BOOT",
    error
  )

  process.exit(1)
})
