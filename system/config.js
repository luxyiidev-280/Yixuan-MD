//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Configuração Principal
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

function env(name, fallback = "") {
  const value =
    process.env[name]

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback
  }

  return String(value).trim()
}

function envBool(name, fallback = false) {
  const value =
    env(name, String(fallback))
      .toLowerCase()

  return [
    "true",
    "1",
    "yes",
    "sim",
    "on"
  ].includes(value)
}

function envNumber(name, fallback = 0) {
  const value =
    Number(env(name, fallback))

  if (Number.isNaN(value))
    return fallback

  return value
}

function envList(name) {
  return env(name, "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
}

function onlyNumbers(value = "") {
  return String(value)
    .replace(/\D/g, "")
}

const ownerNumbers =
  envList("OWNER_NUMBERS")
    .map(onlyNumbers)
    .filter(Boolean)

const ownerLids =
  envList("OWNER_LIDS")
    .map(item => item.trim())
    .filter(item => item.endsWith("@lid"))

export const bot = {
  name:
    env("BOT_NAME", "Yixuan-MD"),

  core:
    env("BOT_CORE", "Auric Core"),

  version:
    "1.0.0",

  prefix:
    env("BOT_PREFIX", "!"),

  footer:
    `_${env("BOT_NAME", "Yixuan-MD")} • ${env("BOT_CORE", "Auric Core")}_`,

  owner: {
    name:
      env("OWNER_NAME", "Luxyii Dev"),

    numbers:
      ownerNumbers,

    lids:
      ownerLids
  },

  mode: {
    private:
      envBool("PRIVATE_MODE", false),

    autoRead:
      envBool("AUTO_READ", false),

    reactCommands:
      envBool("REACT_COMMANDS", false)
  },

  performance: {
    commandCooldownMs:
      envNumber("COMMAND_COOLDOWN_MS", 700),

    saveIntervalMs:
      envNumber("SAVE_INTERVAL_MS", 5000),

    metadataCacheMs:
      envNumber("METADATA_CACHE_MS", 60000),

    maxCommandErrors:
      envNumber("MAX_COMMAND_ERRORS", 3)
  },

  theme: {
    name:
      "Auric",

    emojis: {
      main: "☯️",
      scroll: "📜",
      lotus: "🪷",
      ink: "🖋️",
      error: "❌️",
      success: "✅️"
    },

    colors: {
      auric: "\x1b[38;5;220m",
      jade: "\x1b[38;5;84m",
      sky: "\x1b[38;5;117m",
      white: "\x1b[97m",
      gray: "\x1b[90m",
      red: "\x1b[91m",
      green: "\x1b[92m",
      yellow: "\x1b[93m",
      reset: "\x1b[0m",
      dim: "\x1b[2m"
    }
  }
}

export const paths = {
  commands:
    "./commands",

  database:
    "./database",

  logs:
    "./logs",

  session:
    "./storage/session",

  temp:
    "./storage/temp",

  cache:
    "./storage/cache",

  groupState:
    "./database/groups.json",

  userState:
    "./database/users.json",

  globalState:
    "./database/global.json",

  identityState:
    "./database/identity.json",

  commandHealth:
    "./database/command-health.json",

  menuImage:
    "./media/menu/menu.png",

  adminImage:
    "./media/menu/admin.png",

  donoImage:
    "./media/menu/dono.png",

  creatorImage:
    "./media/menu/criador.png",

  logFile:
    "./logs/yixuan.log",

  commandErrorLog:
    "./logs/commands-error.log"
}

export const runtime = {
  node:
    process.version,

  platform:
    process.platform,

  arch:
    process.arch,

  pid:
    process.pid,

  startedAt:
    Date.now()
}

export const api = {
  defaultHeaders: {
    Accept: "application/json, text/plain"
  },

  mediaHeaders: {}
}