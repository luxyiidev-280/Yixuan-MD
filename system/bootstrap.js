//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Bootstrap Automático
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"

import {
  bot,
  paths
} from "#system/config.js"

import {
  ensureDir,
  ensureJson,
  writeJson
} from "#system/files.js"

import {
  logger
} from "#system/logger.js"

import {
  environment
} from "#system/environment.js"

function now() {
  return Date.now()
}

function touch(file = "") {
  try {
    ensureDir(
      path.dirname(file)
    )

    if (!fs.existsSync(file)) {
      fs.writeFileSync(
        file,
        ""
      )
    }

    return true
  } catch {
    return false
  }
}

function cleanDirectory(dir = "", keep = []) {
  try {
    if (!fs.existsSync(dir))
      return false

    const protectedNames =
      new Set(keep)

    for (const item of fs.readdirSync(dir)) {
      if (protectedNames.has(item))
        continue

      fs.rmSync(
        path.join(dir, item),
        {
          recursive: true,
          force: true
        }
      )
    }

    return true
  } catch {
    return false
  }
}

export function ensureRuntimeStructure() {
  const dirs = [
    paths.session,
    paths.temp,
    paths.cache,
    paths.logs,
    paths.database,
    paths.commands,
    "./commands/menus",
    "./commands/members",
    "./commands/admins",
    "./commands/admins/modos",
    "./commands/dono",
    "./commands/downloads",
    "./media",
    "./media/menu",
    "./dados",
    "./dados/org",
    "./dados/org/funcoes",
    "./storage",
    "./storage/session",
    "./storage/temp",
    "./storage/cache"
  ]

  for (const dir of dirs) {
    ensureDir(dir)
  }

  touch("./storage/session/.gitkeep")
  touch("./storage/temp/.gitkeep")
  touch("./storage/cache/.gitkeep")
  touch("./logs/.gitkeep")
  touch("./media/menu/.gitkeep")

  return true
}

export function ensureRuntimeJson() {
  ensureJson(
    paths.globalState,
    {
      privateMode: false,
      maintenance: false,
      allowedGroups: [],
      blockedUsers: [],
      createdAt: now(),
      updatedAt: now()
    }
  )

  ensureJson(paths.groupState, {})
  ensureJson(paths.userState, {})

  ensureJson(
    paths.identityState,
    {
      numbers: {},
      lids: {},
      pns: {}
    }
  )

  ensureJson(
    paths.commandHealth,
    {
      updatedAt: now(),
      success: 0,
      failed: 0,
      commands: [],
      errors: [],
      fixed: []
    }
  )

  ensureJson(
    "./database/runtime-health.json",
    {
      updatedAt: now(),
      quarantined: {},
      errors: {}
    }
  )

  ensureJson("./database/antipv3.json", { enabled: false })
  ensureJson("./database/warnings.json", { groups: {} })

  return true
}

export function normalizeEmptyJsonDatabases() {
  const files = [
    paths.globalState,
    paths.groupState,
    paths.userState,
    paths.identityState,
    paths.commandHealth,
    "./database/runtime-health.json",
    "./database/antipv3.json",
    "./database/warnings.json"
  ]

  for (const file of files) {
    try {
      if (!fs.existsSync(file))
        continue

      const raw =
        fs.readFileSync(file, "utf8")

      if (!raw.trim()) {
        writeJson(file, {})
      }
    } catch {}
  }
}

export function prepareBoot() {
  ensureRuntimeStructure()
  ensureRuntimeJson()
  normalizeEmptyJsonDatabases()

  cleanDirectory(
    paths.temp,
    [
      ".gitkeep"
    ]
  )

  logger.system(
    `Boot automático | ${bot.name} • ${bot.core} | ${environment.name}`
  )

  return {
    environment,
    paths,
    bot
  }
}
