//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiTrava / AntiCrash de Mensagens
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
  errorBox
} from "./reply.js"

const invisibleRegex =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g

const zalgoRegex =
  /[\u0300-\u036f]/g

const suspiciousUnicodeRegex =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

function textOf(read = {}) {
  return String(read.body || "")
}

function count(regex, text = "") {
  return (text.match(regex) || []).length
}

function longestRepeat(text = "") {
  const match =
    text.match(/(.)\1{25,}/g)

  if (!match)
    return 0

  return Math.max(
    ...match.map(item => item.length)
  )
}

function base64Like(text = "") {
  const matches =
    text.match(/[A-Za-z0-9+/=]{260,}/g) || []

  return matches.length
}

function mentionCount(read = {}) {
  return Array.isArray(read.mentions)
    ? read.mentions.length
    : 0
}

function detectTrava(read = {}, hard = false) {
  const text =
    textOf(read)

  const length =
    text.length

  const invisible =
    count(invisibleRegex, text)

  const zalgo =
    count(zalgoRegex, text)

  const suspicious =
    count(suspiciousUnicodeRegex, text)

  const lines =
    text.split("\n").length

  const repeated =
    longestRepeat(text)

  const b64 =
    base64Like(text)

  const mentions =
    mentionCount(read)

  const reasons = []

  if (length >= (hard ? 2500 : 4500))
    reasons.push("texto gigante")

  if (invisible >= (hard ? 120 : 250))
    reasons.push("caracteres invisíveis")

  if (zalgo >= (hard ? 120 : 300))
    reasons.push("unicode instável")

  if (suspicious >= 10)
    reasons.push("caracteres de controle")

  if (lines >= (hard ? 80 : 160))
    reasons.push("quebras excessivas")

  if (repeated >= (hard ? 80 : 180))
    reasons.push("repetição extrema")

  if (b64 >= 2)
    reasons.push("payload suspeito")

  if (mentions >= (hard ? 20 : 50))
    reasons.push("marcações excessivas")

  return {
    detected:
      reasons.length > 0,

    reasons
  }
}

async function deleteMessage(sock, msg) {
  try {
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        delete:
          msg.key
      }
    )

    return true
  } catch {
    return false
  }
}

async function removeUser(sock, groupJid = "", userJid = "") {
  try {
    await sock.groupParticipantsUpdate(
      groupJid,
      [userJid],
      "remove"
    )

    return true
  } catch {
    return false
  }
}

async function isProtected(sock, groupJid = "", sender = "") {
  if (!sender)
    return true

  if (isOwner(sender))
    return true

  if (await isAdmin(sock, groupJid, sender))
    return true

  return false
}

export async function antiTravaGuard(sock, msg, read = {}) {
  if (!read.isGroup)
    return false

  const enabled =
    getFlag(read.from, "antitrava")

  const hard =
    getFlag(read.from, "antitravaHard")

  if (!enabled && !hard)
    return false

  const sender =
    read.sender

  if (await isProtected(sock, read.from, sender))
    return false

  const result =
    detectTrava(read, hard)

  if (!result.detected)
    return false

  await deleteMessage(sock, msg)

  const botAdmin =
    await isBotAdmin(sock, read.from)

  if (botAdmin) {
    await removeUser(
      sock,
      read.from,
      sender
    )
  }

  await sock.sendMessage(
    read.from,
    {
      text:
        errorBox(
          "AntiTrava",
          `${tag(sender)} foi removido por mensagem suspeita: ${result.reasons.join(", ")}.`
        ),
      mentions:
        [sender]
    }
  )

  return true
}
