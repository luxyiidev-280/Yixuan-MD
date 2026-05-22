//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Auto Reinício Seguro
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  flushState
} from "./state.js"

import {
  logger
} from "./logger.js"

const MINUTES =
  Number(process.env.AUTO_RESTART_MINUTES || 20)

const RESTART_MS =
  Math.max(15, MINUTES) * 60 * 1000

let timer =
  null

let startedAt =
  0

export function startAutoRestart() {
  if (timer)
    return false

  startedAt =
    Date.now()

  logger.system(
    `Auto reinício ativo: ${Math.floor(RESTART_MS / 60000)} minutos`
  )

  timer =
    setTimeout(async () => {
      logger.warn(
        "Auto reinício iniciado. Salvando dados..."
      )

      try {
        flushState()
      } catch {}

      setTimeout(() => {
        process.exit(0)
      }, 1200)
    }, RESTART_MS)

  timer.unref?.()

  return true
}

export function stopAutoRestart() {
  if (!timer)
    return false

  clearTimeout(timer)
  timer = null

  return true
}

export function getAutoRestartStatus() {
  return {
    active:
      Boolean(timer),

    minutes:
      Math.floor(RESTART_MS / 60000),

    startedAt,

    uptimeMs:
      startedAt
        ? Date.now() - startedAt
        : 0
  }
}