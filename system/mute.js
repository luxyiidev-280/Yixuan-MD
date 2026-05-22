//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Guard: Mute por Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isMuted
} from "#system/state.js"

import {
  isOwner,
  isAdmin
} from "#system/admin.js"

export async function muteGuard(sock, msg = {}, read = {}) {
  if (!read?.isGroup)
    return false

  if (!read?.sender)
    return false

  if (isOwner(read.sender))
    return false

  const admin =
    await isAdmin(
      sock,
      read.from,
      read.sender
    )

  if (admin)
    return false

  if (!isMuted(read.from, read.sender))
    return false

  try {
    await sock.sendMessage(
      read.from,
      {
        delete:
          msg.key
      }
    )
  } catch {}

  return true
}
