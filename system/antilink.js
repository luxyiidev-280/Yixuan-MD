//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiLink Hard com Advertência
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

function normalize(text = "") {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function compact(text = "") {
  return normalize(text)
    .replace(/[\s\u200b\u200c\u200d\uFEFF]+/g, "")
    .replace(/[|\\/_\-]+/g, "")
}

function hasLink(text = "") {
  const raw =
    normalize(text)

  const tight =
    compact(text)

  const patterns = [
    /https?:\/\//i,
    /chat\.whatsapp\.com/i,
    /wa\.me\//i,
    /www\./i,
    /\b[a-z0-9-]+\.(com|net|org|br|io|gg|app|dev|xyz|store|site|online|me|tv|co)\b/i
  ]

  if (patterns.some(rx => rx.test(raw)))
    return true

  const hiddenDomains = [
    "instagram.com",
    "tiktok.com",
    "youtube.com",
    "youtu.be",
    "facebook.com",
    "discord.gg",
    "chat.whatsapp.com",
    "wa.me",
    "google.com"
  ]

  return hiddenDomains.some(domain =>
    tight.includes(domain.replace(/\./g, ""))
  )
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

async function banUser(sock, groupJid, userJid) {
  try {
    await sock.groupParticipantsUpdate(
      groupJid,
      [userJid],
      "remove"
    )

    clearWarn(groupJid, userJid)

    return true
  } catch {
    return false
  }
}

export async function antiLinkGuard(sock, msg, read = {}) {
  if (!read.isGroup)
    return false

  if (read.isCmd)
    return false

  if (!getFlag(read.from, "antilink"))
    return false

  const body =
    read.body || ""

  if (!body || !hasLink(body))
    return false

  const sender =
    read.sender

  if (!sender)
    return false

  if (isOwner(sender))
    return false

  if (await isAdmin(sock, read.from, sender))
    return false

  await deleteMessage(sock, msg)

  const botAdmin =
    await isBotAdmin(sock, read.from)

  const warns =
    addWarn(
      read.from,
      sender,
      "Envio de link"
    )

  if (warns >= 2 && botAdmin) {
    await banUser(
      sock,
      read.from,
      sender
    )

    await sock.sendMessage(
      read.from,
      {
        text: errorBox(
          "Membro removido",
          `${tag(sender)} enviou link novamente.`
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
        `${tag(sender)} links não são permitidos. Advertência ${warns}/2.`
      ),
      mentions: [sender]
    }
  )

  return true
}