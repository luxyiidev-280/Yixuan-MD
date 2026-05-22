//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Sistema de Bem-vindo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  getFlag
} from "./state.js"

import {
  isBotJid,
  tag
} from "./admin.js"

import {
  hour
} from "./clock.js"

import {
  logger
} from "./logger.js"

import {
  createWelcomeCanvas
} from "../dados/org/funcoes/welcomeCanvas.js"

const welcomeCooldown =
  new Map()

const COOLDOWN_MS =
  8000

function now() {
  return Date.now()
}

function clean(value = "") {
  return String(value || "").trim()
}

function key(groupJid = "", userJid = "") {
  return `${groupJid}:${userJid}`
}

function onCooldown(groupJid = "", userJid = "") {
  const id =
    key(groupJid, userJid)

  const last =
    welcomeCooldown.get(id) || 0

  if (now() - last < COOLDOWN_MS)
    return true

  welcomeCooldown.set(id, now())
  return false
}

function number(jid = "") {
  return clean(jid)
    .split("@")[0]
    .split(":")[0]
}

function resolveParticipant(participant) {
  if (typeof participant === "string") {
    return {
      raw: participant,
      jid: participant,
      mention: participant,
      photo: participant
    }
  }

  const id =
    clean(participant?.id)

  const phone =
    clean(
      participant?.phoneNumber ||
      participant?.phoneNumberJid ||
      participant?.jid
    )

  const jid =
    phone || id

  return {
    raw: participant,
    jid,
    mention: phone || id,
    photo: phone || id,
    lid: id
  }
}

async function getUserPhoto(sock, userJid = "") {
  try {
    const url =
      await sock.profilePictureUrl(
        userJid,
        "image"
      )

    if (!url)
      return null

    const response =
      await fetch(url)

    if (!response.ok)
      return null

    return Buffer.from(
      await response.arrayBuffer()
    )
  } catch {
    return null
  }
}

async function getGroupInfo(sock, groupJid = "") {
  try {
    const metadata =
      await sock.groupMetadata(groupJid)

    return {
      name:
        metadata?.subject || "Grupo",

      count:
        metadata?.participants?.length || 0
    }
  } catch {
    return {
      name:
        "Grupo",

      count:
        0
    }
  }
}

function welcomeText(userJid = "") {
  return [
    "〔 🌙 *_Bem-vindo(a)_* 〕",
    `〔 ☯️ _${tag(userJid)} chegou ao grupo._ 〕`,
    "〔 📜 _Leia as regras e aproveite a conversa._ 〕"
  ].join("\n")
}

async function sendTextFallback(sock, groupJid = "", userJid = "") {
  return sock.sendMessage(
    groupJid,
    {
      text:
        welcomeText(userJid),

      mentions:
        [userJid]
    }
  )
}

export async function welcomeGuard(sock, update = {}) {
  const groupJid =
    update.id

  if (!groupJid?.endsWith?.("@g.us"))
    return false

  if (update.action !== "add")
    return false

  if (!getFlag(groupJid, "welcome"))
    return false

  const participants =
    Array.isArray(update.participants)
      ? update.participants
      : []

  if (!participants.length)
    return false

  const group =
    await getGroupInfo(
      sock,
      groupJid
    )

  let sent =
    0

  for (const participant of participants) {
    const user =
      resolveParticipant(participant)

    if (!user.jid)
      continue

    if (isBotJid(sock, user.jid) || isBotJid(sock, user.lid))
      continue

    if (onCooldown(groupJid, user.jid)) {
      logger.warn(
        `Welcome ignorado por cooldown: ${user.jid}`
      )
      continue
    }

    try {
      logger.system(
        `Welcome enviando para: ${user.jid}`
      )

      const avatar =
        await getUserPhoto(
          sock,
          user.photo
        )

      const image =
        await createWelcomeCanvas({
          avatar,
          userName:
            tag(user.jid),
          groupName:
            group.name,
          memberCount:
            group.count,
          time:
            hour()
        })

      await sock.sendMessage(
        groupJid,
        {
          image,
          caption:
            welcomeText(user.jid),
          mentions:
            [user.mention]
        }
      )

      sent++
    } catch (error) {
      logger.error(
        "WELCOME_IMAGE",
        error
      )

      try {
        await sendTextFallback(
          sock,
          groupJid,
          user.mention
        )

        sent++
      } catch (fallbackError) {
        logger.error(
          "WELCOME_TEXT",
          fallbackError
        )
      }
    }
  }

  return sent > 0
}