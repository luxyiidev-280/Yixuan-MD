//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono / Admin / Bot Admin
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "./config.js"

import {
  isOwner as identityIsOwner,
  isOwnerIdentity,
  resolveIdentity,
  normalizePn,
  normalizeLid,
  isLid,
  isPn,
  onlyNumbers
} from "./identity.js"

import {
  errorBox,
  infoBox,
  reply
} from "./reply.js"

const metadataCache =
  new Map()

function now() {
  return Date.now()
}

function clean(value = "") {
  return String(value || "")
    .trim()
}

function jidBase(jid = "") {
  const value =
    clean(jid)

  if (!value.includes("@"))
    return value

  const [left, domain] =
    value.split("@")

  const baseLeft =
    left.split(":")[0]

  return `${baseLeft}@${domain}`
}

function jidNumber(jid = "") {
  return onlyNumbers(
    jidBase(jid)
  )
}

function sameJid(a = "", b = "") {
  const jidA =
    jidBase(a)

  const jidB =
    jidBase(b)

  if (!jidA || !jidB)
    return false

  if (jidA === jidB)
    return true

  const numberA =
    jidNumber(jidA)

  const numberB =
    jidNumber(jidB)

  if (
    numberA &&
    numberB &&
    numberA === numberB
  ) {
    return true
  }

  return false
}

function normalizeParticipant(participant = {}) {
  const rawId =
    clean(
      participant.id ||
      participant.jid ||
      ""
    )

  const rawLid =
    clean(
      participant.lid ||
      ""
    )

  const rawPhone =
    clean(
      participant.phoneNumber ||
      participant.phoneNumberJid ||
      ""
    )

  const id =
    rawId ||
    rawLid ||
    rawPhone

  const lid =
    rawLid ||
    (
      isLid(rawId)
        ? rawId
        : ""
    ) ||
    (
      isLid(rawPhone)
        ? rawPhone
        : ""
    )

  const pn =
    rawPhone ||
    (
      isPn(rawId)
        ? rawId
        : ""
    )

  return {
    ...participant,

    id:
      clean(id),

    lid:
      clean(lid),

    pn:
      clean(pn),

    admin:
      participant.admin || null
  }
}

function participantMatches(participant = {}, jid = "") {
  const target =
    clean(jid)

  if (!target)
    return false

  const p =
    normalizeParticipant(participant)

  const candidates = [
    p.id,
    p.jid,
    p.lid,
    p.pn,
    p.phoneNumber,
    p.phoneNumberJid
  ]
    .map(clean)
    .filter(Boolean)

  for (const candidate of candidates) {
    if (sameJid(candidate, target))
      return true

    if (
      isLid(candidate) &&
      isLid(target) &&
      normalizeLid(candidate) === normalizeLid(target)
    ) {
      return true
    }

    if (
      isPn(candidate) &&
      isPn(target) &&
      normalizePn(candidate) === normalizePn(target)
    ) {
      return true
    }
  }

  const targetIdentity =
    resolveIdentity({
      sender: target,
      participant: target
    })

  for (const candidate of candidates) {
    const candidateIdentity =
      resolveIdentity({
        sender: candidate,
        participant: candidate
      })

    if (
      targetIdentity.lid &&
      candidateIdentity.lid &&
      targetIdentity.lid === candidateIdentity.lid
    ) {
      return true
    }

    if (
      targetIdentity.number &&
      candidateIdentity.number &&
      targetIdentity.number === candidateIdentity.number
    ) {
      return true
    }
  }

  return false
}

function isParticipantAdmin(participant = {}) {
  const admin =
    participant?.admin

  return (
    admin === "admin" ||
    admin === "superadmin"
  )
}

export function number(value = "") {
  return jidNumber(value)
}

export function tag(value = "") {
  const num =
    number(value)

  if (num)
    return `@${num}`

  const text =
    clean(value)

  if (!text)
    return "@desconhecido"

  return `@${text.split("@")[0]}`
}

export function isOwner(value = "") {
  if (!value)
    return false

  if (typeof value === "object")
    return isOwnerIdentity(value)

  return identityIsOwner(value)
}

export function getBotJid(sock) {
  const user =
    sock?.user || {}

  return jidBase(
    user.id ||
    user.jid ||
    ""
  )
}

export function getBotLid(sock) {
  const user =
    sock?.user || {}

  const id =
    clean(user.id || "")

  const lid =
    clean(
      user.lid ||
      (
        isLid(id)
          ? id
          : ""
      )
    )

  return lid
}

export function isBotJid(sock, jid = "") {
  const botJid =
    getBotJid(sock)

  const botLid =
    getBotLid(sock)

  if (botJid && sameJid(botJid, jid))
    return true

  if (
    botLid &&
    isLid(jid) &&
    normalizeLid(botLid) === normalizeLid(jid)
  ) {
    return true
  }

  return false
}

export async function getMetadata(sock, jid = "", force = false) {
  const groupJid =
    clean(jid)

  if (!groupJid.endsWith("@g.us"))
    return null

  const cached =
    metadataCache.get(groupJid)

  if (
    !force &&
    cached &&
    now() - cached.time < bot.performance.metadataCacheMs
  ) {
    return cached.data
  }

  try {
    const metadata =
      await sock.groupMetadata(groupJid)

    metadataCache.set(
      groupJid,
      {
        time: now(),
        data: metadata
      }
    )

    return metadata
  } catch {
    return cached?.data || null
  }
}

export function clearMetadataCache(jid = "") {
  if (!jid) {
    metadataCache.clear()
    return true
  }

  metadataCache.delete(jid)

  return true
}

export async function getParticipants(sock, jid = "", force = false) {
  const metadata =
    await getMetadata(
      sock,
      jid,
      force
    )

  return Array.isArray(metadata?.participants)
    ? metadata.participants
    : []
}

export async function getGroupName(sock, jid = "", fallback = "") {
  const metadata =
    await getMetadata(sock, jid)

  return (
    metadata?.subject ||
    fallback ||
    ""
  )
}

export async function getParticipant(sock, groupJid = "", userJid = "", force = false) {
  const participants =
    await getParticipants(
      sock,
      groupJid,
      force
    )

  return participants.find(participant =>
    participantMatches(
      participant,
      userJid
    )
  ) || null
}

export async function isAdmin(sock, groupJid = "", userJid = "") {
  if (!groupJid?.endsWith?.("@g.us"))
    return false

  if (!userJid)
    return false

  if (isOwner(userJid))
    return true

  const participant =
    await getParticipant(
      sock,
      groupJid,
      userJid
    )

  return isParticipantAdmin(participant)
}

export async function isBotAdmin(sock, groupJid = "") {
  if (!groupJid?.endsWith?.("@g.us"))
    return false

  const botJid =
    getBotJid(sock)

  const botLid =
    getBotLid(sock)

  const participants =
    await getParticipants(
      sock,
      groupJid
    )

  const botParticipant =
    participants.find(participant =>
      participantMatches(participant, botJid) ||
      participantMatches(participant, botLid)
    )

  return isParticipantAdmin(botParticipant)
}

export async function checkGroup(sock, msg, ctx = {}) {
  const from =
    ctx.from ||
    ctx.chat ||
    msg?.key?.remoteJid ||
    ""

  if (from.endsWith("@g.us"))
    return true

  await reply(
    sock,
    msg,
    infoBox(
      "Comando exclusivo para grupos"
    ),
    {
      jid: from
    }
  )

  return false
}

export async function checkAdmin(sock, msg, ctx = {}) {
  const from =
    ctx.from ||
    ctx.chat ||
    msg?.key?.remoteJid ||
    ""

  const sender =
    ctx.sender ||
    msg?.key?.participant ||
    from

  if (!from.endsWith("@g.us")) {
    await reply(
      sock,
      msg,
      infoBox(
        "Comando exclusivo para grupos"
      ),
      {
        jid: from
      }
    )

    return false
  }

  if (isOwner(sender))
    return true

  const admin =
    await isAdmin(
      sock,
      from,
      sender
    )

  if (admin)
    return true

  await reply(
    sock,
    msg,
    errorBox(
      "Permissão negada",
      "Apenas administradores podem usar isso."
    ),
    {
      jid: from
    }
  )

  return false
}

export async function checkBotAdmin(sock, msg, ctx = {}) {
  const from =
    ctx.from ||
    ctx.chat ||
    msg?.key?.remoteJid ||
    ""

  if (!from.endsWith("@g.us")) {
    await reply(
      sock,
      msg,
      infoBox(
        "Comando exclusivo para grupos"
      ),
      {
        jid: from
      }
    )

    return false
  }

  const botAdmin =
    await isBotAdmin(
      sock,
      from
    )

  if (botAdmin)
    return true

  await reply(
    sock,
    msg,
    errorBox(
      "Permissão insuficiente",
      "Eu preciso ser admin para fazer isso."
    ),
    {
      jid: from
    }
  )

  return false
}

export function getMentioned(read = {}) {
  if (Array.isArray(read.mentions))
    return read.mentions

  const context =
    read?.message?.extendedTextMessage?.contextInfo ||
    {}

  return Array.isArray(context.mentionedJid)
    ? context.mentionedJid
    : []
}

export function getQuotedParticipant(read = {}) {
  return (
    read?.quoted?.participant ||
    read?.quoted?.sender ||
    ""
  )
}

export function getTarget(read = {}) {
  const quoted =
    getQuotedParticipant(read)

  if (quoted)
    return quoted

  const mentioned =
    getMentioned(read)

  if (mentioned.length)
    return mentioned[0]

  const arg =
    clean(read?.args?.[0] || "")

  if (arg) {
    if (isLid(arg))
      return normalizeLid(arg)

    if (isPn(arg))
      return normalizePn(arg)

    const num =
      onlyNumbers(arg)

    if (num.length >= 8)
      return `${num}@s.whatsapp.net`
  }

  return read.sender || ""
}

export async function requireTarget(sock, msg, ctx = {}, text = "") {
  const target =
    getTarget(ctx)

  if (target)
    return target

  const from =
    ctx.from ||
    ctx.chat ||
    msg?.key?.remoteJid ||
    ""

  await reply(
    sock,
    msg,
    text ||
      errorBox(
        "Marque ou responda alguém"
      ),
    {
      jid: from
    }
  )

  return ""
}