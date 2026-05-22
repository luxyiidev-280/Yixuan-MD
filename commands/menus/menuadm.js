//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Menu Administrativo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  paths
} from "#system/config.js"

import {
  hour,
  date,
  uptime
} from "#system/clock.js"

import {
  readBuffer
} from "#system/files.js"

import {
  title,
  text,
  field,
  command,
  menuBlock
} from "#system/ui.js"

const ADMIN_SECTIONS = {
  grupos: {
    title: "GRUPOS",
    icon: "📜"
  },

  protecoes: {
    title: "PROTEÇÕES",
    icon: "🛡️"
  },

  modos: {
    title: "MODOS",
    icon: "⚙️"
  }
}

const SECTION_ORDER = [
  "grupos",
  "protecoes",
  "modos"
]

const PROTECTION_NAMES = [
  "antilink",
  "antilinkhard",
  "antifake",
  "antispam",
  "antitrava",
  "antipv",
  "antibot",
  "anticall",
  "anti-call"
]

const MODE_NAMES = [
  "bemvindo",
  "welcome",
  "modobrincadeira",
  "modo-brincadeira",
  "brincadeiras",
  "modogold",
  "modo-gold",
  "modonsfw",
  "modo-nsfw",
  "mutar",
  "mute"
]

function clean(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function detectSection(cmd = {}) {
  const name =
    clean(cmd.name)

  const category =
    clean(cmd.category)

  const sub =
    clean(
      cmd.subCategory ||
      cmd.subcategory ||
      cmd.type ||
      ""
    )

  const folder =
    clean(cmd.path || "")

  if (
    sub === "protecoes" ||
    sub === "proteção" ||
    sub === "protecao" ||
    category === "protecoes" ||
    folder.includes("/protecoes/") ||
    folder.includes("/proteções/")
  ) {
    return "protecoes"
  }

  if (
    sub === "modos" ||
    sub === "modo" ||
    category === "modos" ||
    folder.includes("/modos/")
  ) {
    return "modos"
  }

  if (
    PROTECTION_NAMES.some(item => name.includes(item))
  ) {
    return "protecoes"
  }

  if (
    MODE_NAMES.some(item => name.includes(item))
  ) {
    return "modos"
  }

  return "grupos"
}

function adminCommands(commands = new Map()) {
  const grouped = {
    grupos: [],
    protecoes: [],
    modos: []
  }

  for (const cmd of commands.values()) {
    if (!cmd?.name)
      continue

    if (cmd.hidden)
      continue

    const category =
      clean(cmd.category || "")

    const path =
      clean(cmd.path || "")

    const isAdminCommand =
      category === "admins" ||
      category === "protecoes" ||
      category === "modos" ||
      path.includes("/commands/admins/")

    if (!isAdminCommand)
      continue

    const section =
      detectSection(cmd)

    if (!grouped[section])
      grouped[section] = []

    grouped[section].push(cmd)
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  return grouped
}

function buildMenu(ctx = {}) {
  const commands =
    ctx.commands || new Map()

  const prefix =
    ctx.prefix || bot.prefix

  const grouped =
    adminCommands(commands)

  const total =
    Object.values(grouped)
      .reduce((acc, list) => acc + list.length, 0)

  const header = [
    title("Menu Administrativo", "📜"),
    text(bot.name, "☯️"),
    text(bot.core, "🪷"),
    field("Horário", hour(), "🌤️"),
    field("Data", date(), "📅"),
    field("Uptime", uptime(), "⏱️"),
    field("Prefixo", prefix, "🪷"),
    field("Comandos", total, "📦")
  ]

  const sections =
    []

  for (const key of SECTION_ORDER) {
    const items =
      grouped[key] || []

    if (!items.length)
      continue

    sections.push({
      title:
        ADMIN_SECTIONS[key].title,

      icon:
        ADMIN_SECTIONS[key].icon,

      items:
        items.map(cmd =>
          command(
            prefix,
            cmd.name,
            cmd.aliases || [],
            "☯️"
          )
        )
    })
  }

  return menuBlock({
    header,
    sections,
    footerText:
      bot.footer
  })
}

async function sendMenu(sock, msg, ctx, caption) {
  const image =
    readBuffer(paths.menuImage)

  if (image) {
    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption
      },
      {
        quoted: msg
      }
    )
  }

  return sock.sendMessage(
    ctx.from,
    {
      text:
        caption
    },
    {
      quoted:
        msg
    }
  )
}

export default {
  name: "menuadm",

  aliases: [
    "adm",
    "admin",
    "menuadmin"
  ],

  category:
    "menus",

  description:
    "Mostra o menu administrativo da Yixuan-MD.",

  groupOnly:
    true,

  async run(sock, msg, args, ctx) {
    const caption =
      buildMenu(ctx)

    return sendMenu(
      sock,
      msg,
      ctx,
      caption
    )
  }
}