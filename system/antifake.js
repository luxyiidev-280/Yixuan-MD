//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiFake BR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  getFlag
} from "./state.js"

import {
  isOwner,
  isBotAdmin,
  tag
} from "./admin.js"

import {
  errorBox
} from "./reply.js"

function onlyNumbers(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
}

function getNumber(jid = "") {
  return onlyNumbers(jid)
}

export async function antiFakeGuard(sock, update = {}) {
  const groupJid =
    update.id

  if (!groupJid?.endsWith?.("@g.us"))
    return false

  if (update.action !== "add")
    return false

  if (!getFlag(groupJid, "antifake"))
    return false

  const botAdmin =
    await isBotAdmin(sock, groupJid)

  if (!botAdmin)
    return false

  const participants =
    update.participants || []

  for (const user of participants) {
    if (isOwner(user))
      continue

    const number =
      getNumber(user)

    if (!number)
      continue

    if (number.startsWith("55"))
      continue

    try {
      await sock.groupParticipantsUpdate(
        groupJid,
        [user],
        "remove"
      )

      await sock.sendMessage(
        groupJid,
        {
          text: errorBox(
            "AntiFake",
            `${tag(user)} removido. Apenas números brasileiros são permitidos.`
          ),
          mentions: [user]
        }
      )
    } catch {}
  }

  return true
}