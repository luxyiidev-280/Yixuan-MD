//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Sistema de Advertências
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  ensureJson,
  readJson,
  writeJson
} from "./files.js"

const WARN_FILE =
  "./database/warnings.json"

function now() {
  return Date.now()
}

function jid(value = "") {
  return String(value || "").trim()
}

function defaultDB() {
  return {
    groups: {}
  }
}

function normalizeDB(db = {}) {
  if (!db || typeof db !== "object")
    db = {}

  if (!db.groups || typeof db.groups !== "object")
    db.groups = {}

  return db
}

export function getWarningsDB() {
  return normalizeDB(
    ensureJson(
      WARN_FILE,
      defaultDB()
    )
  )
}

export function saveWarningsDB(db = defaultDB()) {
  return writeJson(
    WARN_FILE,
    normalizeDB(db)
  )
}

export function getWarn(groupJid = "", userJid = "") {
  const db =
    normalizeDB(
      readJson(WARN_FILE, defaultDB())
    )

  return Number(
    db.groups?.[jid(groupJid)]?.[jid(userJid)]?.count || 0
  )
}

export function addWarn(groupJid = "", userJid = "", reason = "Advertência") {
  const group =
    jid(groupJid)

  const user =
    jid(userJid)

  if (!group || !user)
    return 0

  const db =
    getWarningsDB()

  if (!db.groups[group])
    db.groups[group] = {}

  if (!db.groups[group][user]) {
    db.groups[group][user] = {
      count: 0,
      reasons: [],
      createdAt: now(),
      updatedAt: now()
    }
  }

  db.groups[group][user].count++
  db.groups[group][user].updatedAt = now()
  db.groups[group][user].reasons.push({
    reason,
    time: now()
  })

  saveWarningsDB(db)

  return db.groups[group][user].count
}

export function clearWarn(groupJid = "", userJid = "") {
  const group =
    jid(groupJid)

  const user =
    jid(userJid)

  const db =
    getWarningsDB()

  if (db.groups?.[group]?.[user]) {
    delete db.groups[group][user]
    saveWarningsDB(db)
  }

  return true
}

export function clearGroupWarns(groupJid = "") {
  const group =
    jid(groupJid)

  const db =
    getWarningsDB()

  if (db.groups?.[group]) {
    delete db.groups[group]
    saveWarningsDB(db)
  }

  return true
}
