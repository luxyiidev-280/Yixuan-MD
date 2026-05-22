//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiBot Comportamental
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

const activityMap =
  new Map()

const WINDOW_MS =
  5000

const FAST_DELTA_MS =
  420

const BOT_SCORE_LIMIT =
  5

const BOT_SCORE_HARD =
  4

const CLEAN_INTERVAL_MS =
  1000 * 60 * 3

let lastClean =
  0

function now() {
  return Date.now()
}

function key(group = "", user = "") {
  return `${group}:${user}`
}

function cleanMaps() {
  const time =
    now()

  if (time - lastClean < CLEAN_INTERVAL_MS)
    return

  lastClean =
    time

  for (const [id, data] of activityMap.entries()) {
    const events =
      (data.events || [])
        .filter(item => time - item.time <= WINDOW_MS * 3)

    if (!events.length) {
      activityMap.delete(id)
      continue
    }

    data.events = events
    activityMap.set(id, data)
  }
}

function textOf(read = {}) {
  return String(read.body || "")
    .trim()
}

function messageType(msg = {}) {
  const message =
    msg.message || {}

  return Object.keys(message)[0] || "unknown"
}

function hasSuspiciousId(msg = {}) {
  const id =
    String(msg.key?.id || "")

  if (!id)
    return false

  return (
    id.startsWith("BAE5") ||
    id.startsWith("3EB0") ||
    id.length > 32
  )
}

function hasAutomationPattern(read = {}, msg = {}) {
  const body =
    textOf(read)

  const lower =
    body.toLowerCase()

  const type =
    messageType(msg)

  const commandLike =
    /^[.!/#][a-z0-9_]{2,}/i.test(body)

  const manySymbols =
    (body.match(/[{}()[\]<>|~=^`]/g) || []).length >= 8

  const payloadLike =
    body.length > 600 &&
    /https?:\/\//i.test(body) &&
    /[{}]/.test(body)

  const botWords =
    /(^|\s)(menu|ping|play|sticker|fig|start|help)(\s|$)/i.test(lower)

  return {
    commandLike,
    manySymbols,
    payloadLike,
    botWords,
    type
  }
}

function updateActivity(group = "", user = "", read = {}, msg = {}) {
  const id =
    key(group, user)

  const time =
    now()

  const current =
    activityMap.get(id) || {
      events: [],
      lastTime: 0,
      fastCount: 0,
      score: 0
    }

  const delta =
    current.lastTime
      ? time - current.lastTime
      : 999999

  const pattern =
    hasAutomationPattern(read, msg)

  let score =
    0

  if (delta <= FAST_DELTA_MS)
    score += 2

  if (hasSuspiciousId(msg))
    score += 1

  if (pattern.commandLike && delta <= 900)
    score += 1

  if (pattern.payloadLike)
    score += 3

  if (pattern.manySymbols)
    score += 1

  if (pattern.botWords && delta <= 800)
    score += 1

  current.events =
    current.events
      .filter(item => time - item.time <= WINDOW_MS)

  current.events.push({
    time,
    delta,
    score
  })

  current.lastTime =
    time

  current.fastCount =
    current.events
      .filter(item => item.delta <= FAST_DELTA_MS)
      .length

  current.score =
    current.events
      .reduce((sum, item) => sum + item.score, 0)

  activityMap.set(id, current)

  return current
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

export async function antiBotGuard(sock, msg, read = {}) {
  cleanMaps()

  if (!read.isGroup)
    return false

  const enabled =
    getFlag(read.from, "antibot")

  const hard =
    getFlag(read.from, "antibotHard")

  if (!enabled && !hard)
    return false

  const sender =
    read.sender

  if (await isProtected(sock, read.from, sender))
    return false

  const data =
    updateActivity(
      read.from,
      sender,
      read,
      msg
    )

  const limit =
    hard
      ? BOT_SCORE_HARD
      : BOT_SCORE_LIMIT

  const detected =
    data.score >= limit &&
    (
      data.fastCount >= 2 ||
      data.events.length >= 4
    )

  if (!detected)
    return false

  await deleteMessage(sock, msg)

  const botAdmin =
    await isBotAdmin(sock, read.from)

  if (hard && botAdmin) {
    const removed =
      await removeUser(
        sock,
        read.from,
        sender
      )

    if (removed) {
      clearWarn(read.from, sender)

      await sock.sendMessage(
        read.from,
        {
          text:
            errorBox(
              "AntiBot",
              `${tag(sender)} foi removido por comportamento automatizado.`
            ),
          mentions:
            [sender]
        }
      )

      return true
    }
  }

  const warns =
    addWarn(
      read.from,
      sender,
      "Comportamento de bot"
    )

  if (warns >= 2 && botAdmin) {
    const removed =
      await removeUser(
        sock,
        read.from,
        sender
      )

    if (removed) {
      clearWarn(read.from, sender)

      await sock.sendMessage(
        read.from,
        {
          text:
            errorBox(
              "AntiBot",
              `${tag(sender)} repetiu comportamento automatizado e foi removido.`
            ),
          mentions:
            [sender]
        }
      )

      return true
    }
  }

  await sock.sendMessage(
    read.from,
    {
      text:
        errorBox(
          "AntiBot",
          `${tag(sender)} comportamento suspeito detectado. Advertência ${warns}/2.`
        ),
      mentions:
        [sender]
    }
  )

  return true
}
