//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Identidade PN / LID / Dono
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  paths
} from "./config.js"

import {
  ensureJson,
  readJson,
  writeJson
} from "./files.js"

const DEFAULT_DB = {
  numbers: {},
  lids: {},
  pns: {}
}

function now() {
  return Date.now()
}

export function onlyNumbers(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
}

export function isLid(value = "") {
  return String(value || "")
    .endsWith("@lid")
}

export function isPn(value = "") {
  const jid =
    String(value || "")

  return (
    jid.endsWith("@s.whatsapp.net") ||
    jid.endsWith("@c.us")
  )
}

export function isGroupJid(value = "") {
  return String(value || "")
    .endsWith("@g.us")
}

export function normalizeNumber(value = "") {
  const number =
    onlyNumbers(value)

  if (!number)
    return ""

  return number
}

export function normalizeLid(value = "") {
  const jid =
    String(value || "")
      .trim()

  if (!isLid(jid))
    return ""

  return jid
}

export function toPnJid(value = "") {
  const number =
    normalizeNumber(value)

  if (!number)
    return ""

  return `${number}@s.whatsapp.net`
}

export function normalizePn(value = "") {
  const jid =
    String(value || "")
      .trim()

  if (isPn(jid)) {
    const number =
      normalizeNumber(jid)

    return number
      ? `${number}@s.whatsapp.net`
      : ""
  }

  const number =
    normalizeNumber(jid)

  if (!number)
    return ""

  return `${number}@s.whatsapp.net`
}

export function extractNumber(value = "") {
  if (!value)
    return ""

  return normalizeNumber(value)
}

function cloneDefault() {
  return {
    numbers: {},
    lids: {},
    pns: {}
  }
}

export function getIdentityDB() {
  const db =
    ensureJson(
      paths.identityState,
      cloneDefault()
    )

  if (!db.numbers)
    db.numbers = {}

  if (!db.lids)
    db.lids = {}

  if (!db.pns)
    db.pns = {}

  return db
}

export function saveIdentityDB(db = DEFAULT_DB) {
  return writeJson(
    paths.identityState,
    {
      numbers: db.numbers || {},
      lids: db.lids || {},
      pns: db.pns || {}
    }
  )
}

export function getIdentityByNumber(number = "") {
  const clean =
    normalizeNumber(number)

  if (!clean)
    return null

  const db =
    readJson(
      paths.identityState,
      cloneDefault()
    )

  return db.numbers?.[clean] || null
}

export function getIdentityByLid(lid = "") {
  const clean =
    normalizeLid(lid)

  if (!clean)
    return null

  const db =
    readJson(
      paths.identityState,
      cloneDefault()
    )

  return db.lids?.[clean] || null
}

export function getIdentityByPn(pn = "") {
  const clean =
    normalizePn(pn)

  if (!clean)
    return null

  const db =
    readJson(
      paths.identityState,
      cloneDefault()
    )

  return db.pns?.[clean] || null
}

export function bindIdentity({
  number = "",
  pn = "",
  lid = "",
  source = "unknown"
} = {}) {
  const cleanNumber =
    normalizeNumber(number || pn)

  const cleanPn =
    normalizePn(pn || cleanNumber)

  const cleanLid =
    normalizeLid(lid)

  if (!cleanNumber && !cleanLid)
    return null

  const db =
    getIdentityDB()

  const time =
    now()

  if (cleanNumber) {
    const previous =
      db.numbers[cleanNumber] || {}

    db.numbers[cleanNumber] = {
      number: cleanNumber,

      pn:
        cleanPn ||
        previous.pn ||
        toPnJid(cleanNumber),

      lid:
        cleanLid ||
        previous.lid ||
        "",

      source,
      createdAt:
        previous.createdAt || time,

      updatedAt:
        time
    }
  }

  if (cleanLid) {
    const previous =
      db.lids[cleanLid] || {}

    db.lids[cleanLid] = {
      lid: cleanLid,

      number:
        cleanNumber ||
        previous.number ||
        "",

      pn:
        cleanPn ||
        previous.pn ||
        "",

      source,
      createdAt:
        previous.createdAt || time,

      updatedAt:
        time
    }
  }

  if (cleanPn) {
    const previous =
      db.pns[cleanPn] || {}

    db.pns[cleanPn] = {
      pn: cleanPn,

      number:
        cleanNumber ||
        previous.number ||
        "",

      lid:
        cleanLid ||
        previous.lid ||
        "",

      source,
      createdAt:
        previous.createdAt || time,

      updatedAt:
        time
    }
  }

  saveIdentityDB(db)

  return {
    number: cleanNumber,
    pn: cleanPn,
    lid: cleanLid,
    source
  }
}

function pickJids(input = {}) {
  const list = []

  const add = value => {
    if (!value)
      return

    if (Array.isArray(value)) {
      for (const item of value)
        add(item)

      return
    }

    if (typeof value === "object") {
      for (const item of Object.values(value))
        add(item)

      return
    }

    const text =
      String(value || "").trim()

    if (!text)
      return

    if (
      text.includes("@s.whatsapp.net") ||
      text.includes("@c.us") ||
      text.includes("@lid")
    ) {
      list.push(text)
    }
  }

  add(input)

  return [...new Set(list)]
}

export function resolveIdentity(input = {}) {
  const jids =
    pickJids(input)

  let number = ""
  let pn = ""
  let lid = ""

  for (const jid of jids) {
    if (isLid(jid)) {
      lid = normalizeLid(jid)
      continue
    }

    if (isPn(jid)) {
      pn = normalizePn(jid)
      number = normalizeNumber(jid)
      continue
    }
  }

  if (!number && input.number)
    number = normalizeNumber(input.number)

  if (!pn && number)
    pn = toPnJid(number)

  if (number) {
    const saved =
      getIdentityByNumber(number)

    if (saved?.lid && !lid)
      lid = saved.lid
  }

  if (lid) {
    const saved =
      getIdentityByLid(lid)

    if (saved?.number && !number)
      number = saved.number

    if (saved?.pn && !pn)
      pn = saved.pn
  }

  if (pn) {
    const saved =
      getIdentityByPn(pn)

    if (saved?.lid && !lid)
      lid = saved.lid

    if (saved?.number && !number)
      number = saved.number
  }

  if (number || lid) {
    bindIdentity({
      number,
      pn,
      lid,
      source: "resolve"
    })
  }

  return {
    number,
    pn,
    lid,
    jids
  }
}

export function syncIdentityFromMessage(msg = {}) {
  const key =
    msg.key || {}

  const data = {
    remoteJid:
      key.remoteJid,

    participant:
      key.participant,

    remoteJidAlt:
      key.remoteJidAlt,

    participantAlt:
      key.participantAlt,

    senderLid:
      key.senderLid,

    senderPn:
      key.senderPn
  }

  return resolveIdentity(data)
}

export function isOwnerNumber(value = "") {
  const number =
    normalizeNumber(value)

  if (!number)
    return false

  return bot.owner.numbers
    .map(normalizeNumber)
    .includes(number)
}

export function isOwnerLid(value = "") {
  const lid =
    normalizeLid(value)

  if (!lid)
    return false

  return bot.owner.lids
    .map(normalizeLid)
    .includes(lid)
}

export function isOwnerPn(value = "") {
  const number =
    normalizeNumber(value)

  return isOwnerNumber(number)
}

export function isOwnerIdentity(input = {}) {
  const identity =
    resolveIdentity(input)

  if (identity.number && isOwnerNumber(identity.number))
    return true

  if (identity.pn && isOwnerPn(identity.pn))
    return true

  if (identity.lid && isOwnerLid(identity.lid))
    return true

  return false
}

export function isOwner(value = "") {
  if (!value)
    return false

  if (typeof value === "object")
    return isOwnerIdentity(value)

  if (isLid(value))
    return isOwnerLid(value)

  if (isPn(value))
    return isOwnerPn(value)

  return isOwnerNumber(value)
}

export function getOwnerJids() {
  const numbers =
    bot.owner.numbers
      .map(normalizeNumber)
      .filter(Boolean)

  const pns =
    numbers.map(toPnJid)

  const lids =
    bot.owner.lids
      .map(normalizeLid)
      .filter(Boolean)

  return {
    numbers,
    pns,
    lids,
    all: [
      ...pns,
      ...lids
    ]
  }
}

export function seedOwners() {
  const owners =
    getOwnerJids()

  for (const number of owners.numbers) {
    bindIdentity({
      number,
      pn: toPnJid(number),
      source: "owner-seed"
    })
  }

  for (const lid of owners.lids) {
    bindIdentity({
      lid,
      source: "owner-seed"
    })
  }

  return owners
}

seedOwners()