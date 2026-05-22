//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiSpam Leve
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  getFlag
} from "./state.js"

import {
  isOwner,
  isAdmin,
  isBotAdmin,
  tag
} from "./admin.js"

import {
  addWarn,
  clearWarn
} from "./warnings.js"

import {
  errorBox
} from "./reply.js"

const spamMap =
  new Map()

const WINDOW_MS =
  8000

const LIMIT =
  7

function now() {
  return Date.now()
}

function key(group, user) {
  return `${group}:${user}`
}

async function deleteMessage(sock, msg) {
  try {
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        delete: msg.key
      }
    )
  } catch {}
}

export async function antiSpamGuard(sock, msg, read = {}) {
  if (!read.isGroup)
    return false

  if (!getFlag(read.from, "antispam"))
    return false

  const sender =
    read.sender

  if (!sender)
    return false

  if (isOwner(sender))
    return false

  if (await isAdmin(sock, read.from, sender))
    return false

  const id =
    key(read.from, sender)

  const time =
    now()

  const history =
    (spamMap.get(id) || [])
      .filter(t => time - t <= WINDOW_MS)

  history.push(time)
  spamMap.set(id, history)

  if (history.length < LIMIT)
    return false

  await deleteMessage(sock, msg)

  const warns =
    addWarn(
      read.from,
      sender,
      "Spam de mensagens"
    )

  const botAdmin =
    await isBotAdmin(sock, read.from)

  if (warns >= 2 && botAdmin) {
    try {
      await sock.groupParticipantsUpdate(
        read.from,
        [sender],
        "remove"
      )

      clearWarn(read.from, sender)
    } catch {}

    await sock.sendMessage(
      read.from,
      {
        text: errorBox(
          "Membro removido",
          `${tag(sender)} repetiu spam.`
        ),
        mentions: [sender]
      }
    )

    return true
  }

  await sock.sendMessage(
    read.from,
    {
      text: errorBox(
        "Advertência",
        `${tag(sender)} evite spam. Advertência ${warns}/2.`
      ),
      mentions: [sender]
    }
  )

  return true
}