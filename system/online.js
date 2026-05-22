//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Sistema Online / Auto Read Global
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "./config.js"

let enabled =
  true

function shouldIgnore(read = {}) {
  if (!read)
    return true

  if (read.fromMe)
    return true

  if (read.isStatus)
    return true

  if (!read.from)
    return true

  return false
}

export function setOnlineMode(value = true) {
  enabled =
    Boolean(value)

  return enabled
}

export function isOnlineMode() {
  return enabled
}

export async function onlineGuard(sock, msg = {}, read = {}) {
  if (!enabled)
    return false

  if (shouldIgnore(read))
    return false

  try {
    await sock.readMessages([
      msg.key
    ])

    return true
  } catch {
    return false
  }
}