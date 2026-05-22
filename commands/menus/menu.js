//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Menu Principal
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
  isOwner
} from "#system/admin.js"

import {
  title,
  text,
  field,
  command,
  menuBlock
} from "#system/ui.js"

const CATEGORY_LABELS = {
  menus: "MENUS",
  members: "MEMBROS",
  fun: "BRINCADEIRAS",
  downloads: "DOWNLOADS",
  tools: "FERRAMENTAS"
}

const CATEGORY_ORDER = [
  "menus",
  "members",
  "fun",
  "downloads",
  "tools"
]

function clean(value = "") {
  return String(value || "")
    .trim()
}

function groupCommands(commands = new Map(), sender = "") {
  const grouped =
    {}

  const owner =
    isOwner(sender)

  for (const cmd of commands.values()) {
  if (!cmd?.name)
    continue

  if (cmd.hidden)
    continue

  if (cmd.category === "dono")
    continue

  if (cmd.ownerOnly)
    continue

  const category =
    clean(cmd.category || "members")
      .toLowerCase()

  if (!CATEGORY_LABELS[category])
    continue

  if (!grouped[category])
    grouped[category] = []

  grouped[category].push(cmd)
}

  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) =>
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
    groupCommands(
      commands,
      ctx.sender
    )

  const totalCommands =
  [...commands.values()]
    .filter(cmd => !cmd.hidden)
    .filter(cmd => cmd.category !== "dono")
    .filter(cmd => !cmd.ownerOnly)
    .length

  const header = [
    title(bot.name, "☯️"),
    text(bot.core, "📜"),
    field("Horário", hour(), "🌤️"),
    field("Data", date(), "📅"),
    field("Uptime", uptime(), "⏱️"),
    field("Prefixo", prefix, "🪷"),
    field("Comandos", totalCommands, "📦")
  ]

  const sections =
    []

  for (const category of CATEGORY_ORDER) {
    const items =
      grouped[category]

    if (!items?.length)
      continue

    sections.push({
      title:
        CATEGORY_LABELS[category],

      icon:
        "📜",

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
  name: "menu",

  aliases: [
    "help",
    "comandos",
    "cmds"
  ],

  category:
    "menus",

  description:
    "Mostra o menu principal da Yixuan-MD.",

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