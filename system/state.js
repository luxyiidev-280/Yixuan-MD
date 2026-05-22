//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Estado Global / Grupos / Usuários
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

const DEFAULT_GLOBAL = {
  privateMode: bot.mode.private,
  maintenance: false,
  allowedGroups: [],
  blockedUsers: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

const DEFAULT_GROUP = {
  name: "",
  allowed: false,

  flags: {
    welcome: false,
    antilink: false,
    antilinkHard: false,
    antifake: false,
    antispam: false,
    antiflood: false,
    antifloodHard: false,
    antibot: false,
    antibotHard: false,
    antitrava: false,
    antitravaHard: false,
    muted: false
  },

  mutedUsers: {},

  stats: {
    messages: 0,
    commands: 0
  },

  createdAt: Date.now(),
  updatedAt: Date.now()
}

const DEFAULT_USER = {
  name: "",
  number: "",
  lid: "",
  pn: "",

  banned: false,
  premium: false,

  stats: {
    messages: 0,
    commands: 0
  },

  createdAt: Date.now(),
  updatedAt: Date.now()
}

let globalDB = null
let groupsDB = null
let usersDB = null

let dirtyGlobal = false
let dirtyGroups = false
let dirtyUsers = false

let saveTimer = null

function now() {
  return Date.now()
}

function clone(value) {
  return JSON.parse(
    JSON.stringify(value)
  )
}

function normalizeJid(value = "") {
  return String(value || "")
    .trim()
}

function normalizeNumber(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
}

function uniqueArray(items = []) {
  return [
    ...new Set(
      items
        .map(item => String(item || "").trim())
        .filter(Boolean)
    )
  ]
}

function mergeDefaults(base = {}, defaults = {}) {
  const output =
    clone(defaults)

  for (const [key, value] of Object.entries(base || {})) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === "object" &&
      !Array.isArray(output[key])
    ) {
      output[key] =
        mergeDefaults(value, output[key])

      continue
    }

    output[key] = value
  }

  return output
}

function loadGlobal() {
  const db =
    ensureJson(
      paths.globalState,
      clone(DEFAULT_GLOBAL)
    )

  globalDB =
    mergeDefaults(db, DEFAULT_GLOBAL)

  globalDB.allowedGroups =
    uniqueArray(globalDB.allowedGroups)

  globalDB.blockedUsers =
    uniqueArray(globalDB.blockedUsers)

  return globalDB
}

function loadGroups() {
  const db =
    ensureJson(
      paths.groupState,
      {}
    )

  groupsDB =
    db && typeof db === "object"
      ? db
      : {}

  return groupsDB
}

function loadUsers() {
  const db =
    ensureJson(
      paths.userState,
      {}
    )

  usersDB =
    db && typeof db === "object"
      ? db
      : {}

  return usersDB
}

export function getGlobalDB() {
  if (!globalDB)
    return loadGlobal()

  return globalDB
}

export function getGroupsDB() {
  if (!groupsDB)
    return loadGroups()

  return groupsDB
}

export function getUsersDB() {
  if (!usersDB)
    return loadUsers()

  return usersDB
}

export function markGlobalDirty() {
  dirtyGlobal = true
}

export function markGroupsDirty() {
  dirtyGroups = true
}

export function markUsersDirty() {
  dirtyUsers = true
}

export function flushState() {
  try {
    if (dirtyGlobal && globalDB) {
      globalDB.updatedAt = now()

      writeJson(
        paths.globalState,
        globalDB
      )

      dirtyGlobal = false
    }

    if (dirtyGroups && groupsDB) {
      writeJson(
        paths.groupState,
        groupsDB
      )

      dirtyGroups = false
    }

    if (dirtyUsers && usersDB) {
      writeJson(
        paths.userState,
        usersDB
      )

      dirtyUsers = false
    }

    return true
  } catch {
    return false
  }
}

export function startState() {
  getGlobalDB()
  getGroupsDB()
  getUsersDB()

  if (!saveTimer) {
    saveTimer =
      setInterval(
        flushState,
        bot.performance.saveIntervalMs
      )

    saveTimer.unref?.()
  }

  return true
}

export function stopState() {
  if (saveTimer) {
    clearInterval(saveTimer)
    saveTimer = null
  }

  flushState()

  return true
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// GLOBAL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export function getGlobal() {
  return getGlobalDB()
}

export function setGlobal(key, value) {
  const db =
    getGlobalDB()

  db[key] = value
  db.updatedAt = now()

  markGlobalDirty()

  return db
}

export function isMaintenance() {
  return Boolean(
    getGlobalDB().maintenance
  )
}

export function setMaintenance(status = false) {
  return setGlobal(
    "maintenance",
    Boolean(status)
  )
}

export function isPrivateMode() {
  return Boolean(
    getGlobalDB().privateMode
  )
}

export function setPrivateMode(status = true) {
  return setGlobal(
    "privateMode",
    Boolean(status)
  )
}

export function getAllowedGroups() {
  return getGlobalDB().allowedGroups || []
}

export function isGroupAllowed(jid = "") {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return false

  const global =
    getGlobalDB()

  return global.allowedGroups
    .includes(groupJid)
}

export function allowGroup(jid = "") {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return false

  const global =
    getGlobalDB()

  global.allowedGroups =
    uniqueArray([
      ...global.allowedGroups,
      groupJid
    ])

  global.updatedAt = now()

  const group =
    getGroup(groupJid)

  group.allowed = true
  group.updatedAt = now()

  markGlobalDirty()
  markGroupsDirty()

  return true
}

export function disallowGroup(jid = "") {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return false

  const global =
    getGlobalDB()

  global.allowedGroups =
    global.allowedGroups
      .filter(item => item !== groupJid)

  global.updatedAt = now()

  const group =
    getGroup(groupJid)

  group.allowed = false
  group.updatedAt = now()

  markGlobalDirty()
  markGroupsDirty()

  return true
}

export function isUserBlocked(jid = "") {
  const user =
    normalizeJid(jid)

  if (!user)
    return false

  return getGlobalDB()
    .blockedUsers
    .includes(user)
}

export function blockUser(jid = "") {
  const user =
    normalizeJid(jid)

  if (!user)
    return false

  const global =
    getGlobalDB()

  global.blockedUsers =
    uniqueArray([
      ...global.blockedUsers,
      user
    ])

  global.updatedAt = now()

  markGlobalDirty()

  return true
}

export function unblockUser(jid = "") {
  const user =
    normalizeJid(jid)

  if (!user)
    return false

  const global =
    getGlobalDB()

  global.blockedUsers =
    global.blockedUsers
      .filter(item => item !== user)

  global.updatedAt = now()

  markGlobalDirty()

  return true
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// GROUPS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export function getGroup(jid = "") {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return clone(DEFAULT_GROUP)

  const db =
    getGroupsDB()

  if (!db[groupJid]) {
    db[groupJid] =
      clone(DEFAULT_GROUP)

    db[groupJid].createdAt = now()
    db[groupJid].updatedAt = now()

    markGroupsDirty()
  }

  db[groupJid] =
    mergeDefaults(
      db[groupJid],
      DEFAULT_GROUP
    )

  return db[groupJid]
}

export function setGroup(jid = "", data = {}) {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return null

  const db =
    getGroupsDB()

  const current =
    getGroup(groupJid)

  db[groupJid] =
    mergeDefaults(
      {
        ...current,
        ...data,
        updatedAt: now()
      },
      DEFAULT_GROUP
    )

  markGroupsDirty()

  return db[groupJid]
}

export function deleteGroup(jid = "") {
  const groupJid =
    normalizeJid(jid)

  if (!groupJid)
    return false

  const db =
    getGroupsDB()

  if (db[groupJid]) {
    delete db[groupJid]
    markGroupsDirty()
  }

  disallowGroup(groupJid)

  return true
}

export function getFlag(jid = "", flag = "") {
  const group =
    getGroup(jid)

  return Boolean(
    group.flags?.[flag]
  )
}

export function setFlag(jid = "", flag = "", value = false) {
  if (!flag)
    return false

  const group =
    getGroup(jid)

  if (!group.flags)
    group.flags = {}

  group.flags[flag] =
    Boolean(value)

  group.updatedAt =
    now()

  markGroupsDirty()

  return group.flags[flag]
}

export function toggleFlag(jid = "", flag = "") {
  const current =
    getFlag(jid, flag)

  return setFlag(
    jid,
    flag,
    !current
  )
}

export function setGroupName(jid = "", name = "") {
  return setGroup(
    jid,
    {
      name: String(name || "").trim()
    }
  )
}

export function addGroupCount(jid = "", type = "messages", amount = 1) {
  const group =
    getGroup(jid)

  if (!group.stats)
    group.stats = {}

  group.stats[type] =
    Number(group.stats[type] || 0) + amount

  group.updatedAt =
    now()

  markGroupsDirty()

  return group.stats[type]
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// USERS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export function getUser(jid = "", extra = {}) {
  const userJid =
    normalizeJid(jid)

  if (!userJid)
    return clone(DEFAULT_USER)

  const db =
    getUsersDB()

  if (!db[userJid]) {
    db[userJid] =
      clone(DEFAULT_USER)

    db[userJid].createdAt = now()
    db[userJid].updatedAt = now()

    markUsersDirty()
  }

  db[userJid] =
    mergeDefaults(
      db[userJid],
      DEFAULT_USER
    )

  if (extra.name) {
    db[userJid].name =
      String(extra.name || "").trim()
  }

  if (extra.number) {
    db[userJid].number =
      normalizeNumber(extra.number)
  }

  if (extra.lid) {
    db[userJid].lid =
      normalizeJid(extra.lid)
  }

  if (extra.pn) {
    db[userJid].pn =
      normalizeJid(extra.pn)
  }

  if (
    extra.name ||
    extra.number ||
    extra.lid ||
    extra.pn
  ) {
    db[userJid].updatedAt = now()
    markUsersDirty()
  }

  return db[userJid]
}

export function setUser(jid = "", data = {}) {
  const userJid =
    normalizeJid(jid)

  if (!userJid)
    return null

  const db =
    getUsersDB()

  const current =
    getUser(userJid)

  db[userJid] =
    mergeDefaults(
      {
        ...current,
        ...data,
        updatedAt: now()
      },
      DEFAULT_USER
    )

  markUsersDirty()

  return db[userJid]
}

export function addUserCount(jid = "", type = "messages", amount = 1) {
  const user =
    getUser(jid)

  if (!user.stats)
    user.stats = {}

  user.stats[type] =
    Number(user.stats[type] || 0) + amount

  user.updatedAt =
    now()

  markUsersDirty()

  return user.stats[type]
}

export function isUserBanned(jid = "") {
  return Boolean(
    getUser(jid).banned
  )
}

export function banUser(jid = "") {
  return setUser(
    jid,
    {
      banned: true
    }
  )
}

export function unbanUser(jid = "") {
  return setUser(
    jid,
    {
      banned: false
    }
  )
}

export function isPremium(jid = "") {
  return Boolean(
    getUser(jid).premium
  )
}

export function setPremium(jid = "", value = true) {
  return setUser(
    jid,
    {
      premium: Boolean(value)
    }
  )
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// MUTE POR GRUPO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export function getMutedUsers(jid = "") {
  const group =
    getGroup(jid)

  if (!group.mutedUsers)
    group.mutedUsers = {}

  return group.mutedUsers
}

export function isMuted(groupJid = "", userJid = "") {
  const group =
    getGroup(groupJid)

  if (!group.mutedUsers)
    return false

  return Boolean(
    group.mutedUsers[normalizeJid(userJid)]
  )
}

export function muteUser(groupJid = "", userJid = "", reason = "") {
  const user =
    normalizeJid(userJid)

  if (!user)
    return false

  const group =
    getGroup(groupJid)

  if (!group.mutedUsers)
    group.mutedUsers = {}

  group.mutedUsers[user] = {
    reason:
      String(reason || "").trim(),

    createdAt:
      now()
  }

  group.updatedAt =
    now()

  markGroupsDirty()

  return true
}

export function unmuteUser(groupJid = "", userJid = "") {
  const user =
    normalizeJid(userJid)

  if (!user)
    return false

  const group =
    getGroup(groupJid)

  if (!group.mutedUsers)
    group.mutedUsers = {}

  if (group.mutedUsers[user]) {
    delete group.mutedUsers[user]
    group.updatedAt = now()
    markGroupsDirty()
  }

  return true
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// BOOT / EXIT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

startState()

process.once("beforeExit", () => {
  flushState()
})

process.once("SIGINT", () => {
  stopState()
  process.exit(0)
})

process.once("SIGTERM", () => {
  stopState()
  process.exit(0)
})