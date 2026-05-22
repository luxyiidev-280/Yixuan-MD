//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// AntiFlood Rigoroso
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

const floodMap =
  new Map()

const muteMap =
  new Map()

const WINDOW_MS =
  3500

const LIMIT_NORMAL =
  6

const LIMIT_HARD =
  4

const MUTE_MS =
  9000

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

  for (const [id, data] of floodMap.entries()) {
    const recent =
      (data.times || [])
        .filter(t => time - t <= WINDOW_MS * 3)

    if (!recent.length) {
      floodMap.delete(id)
      continue
    }

    data.times = recent
    floodMap.set(id, data)
  }

  for (const [id, until] of muteMap.entries()) {
    if (time > until)
      muteMap.delete(id)
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

function getBody(read = {}) {
  return String(read.body || "")
    .trim()
    .toLowerCase()
}

function updateHistory(group = "", user = "", body = "") {
  const id =
    key(group, user)

  const time =
    now()

  const current =
    floodMap.get(id) || {
      times: [],
      lastBodies: [],
      strikes: 0,
      lastStrike: 0
    }

  current.times =
    current.times
      .filter(t => time - t <= WINDOW_MS)

  current.times.push(time)

  current.lastBodies =
    [
      ...current.lastBodies,
      body
    ]
      .filter(Boolean)
      .slice(-5)

  floodMap.set(id, current)

  return current
}

function repeatedBodyScore(bodies = []) {
  if (bodies.length < 3)
    return 0

  const last =
    bodies[bodies.length - 1]

  if (!last)
    return 0

  return bodies
    .filter(item => item === last)
    .length
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

export async function antiFloodGuard(sock, msg, read = {}) {
  cleanMaps()

  if (!read.isGroup)
    return false

  const enabled =
    getFlag(read.from, "antiflood")

  const hard =
    getFlag(read.from, "antifloodHard")

  if (!enabled && !hard)
    return false

  const sender =
    read.sender

  if (await isProtected(sock, read.from, sender))
    return false

  const id =
    key(read.from, sender)

  if (muteMap.has(id)) {
    await deleteMessage(sock, msg)
    return true
  }

  const body =
    getBody(read)

  const data =
    updateHistory(
      read.from,
      sender,
      body
    )

  const limit =
    hard
      ? LIMIT_HARD
      : LIMIT_NORMAL

  const repeated =
    repeatedBodyScore(data.lastBodies)

  const triggered =
    data.times.length >= limit ||
    repeated >= 4

  if (!triggered)
    return false

  await deleteMessage(sock, msg)

  muteMap.set(
    id,
    now() + MUTE_MS
  )

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
              "Flood detectado",
              `${tag(sender)} foi removido por flood extremo.`
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
      "Flood de mensagens"
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
              "Membro removido",
              `${tag(sender)} repetiu flood após advertência.`
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
          "AntiFlood",
          `${tag(sender)} pare de enviar mensagens em sequência. Advertência ${warns}/2.`
        ),
      mentions:
        [sender]
    }
  )

  return true
}
