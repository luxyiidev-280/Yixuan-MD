//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Menu do Dono
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

function clean(value = "") {
  return String(value || "")
    .trim()
}

function ownerCommands(commands = new Map()) {
  const list = []

  for (const cmd of commands.values()) {
    if (!cmd?.name)
      continue

    if (cmd.hidden)
      continue

    const category =
      clean(cmd.category || "")
        .toLowerCase()

    if (
      category !== "dono" &&
      !cmd.ownerOnly
    ) {
      continue
    }

    list.push(cmd)
  }

  return list.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

function buildMenu(ctx = {}) {
  const commands =
    ctx.commands || new Map()

  const prefix =
    ctx.prefix || bot.prefix

  const list =
    ownerCommands(commands)

  const header = [
    title("Menu do Dono", "👑"),
    text(bot.name, "☯️"),
    text(bot.core, "📜"),
    field("Horário", hour(), "🌤️"),
    field("Data", date(), "📅"),
    field("Uptime", uptime(), "⏱️"),
    field("Prefixo", prefix, "🪷"),
    field("Comandos", list.length, "📦")
  ]

  const sections = [
    {
      title:
        "DONO",

      icon:
        "👑",

      items:
        list.map(cmd =>
          command(
            prefix,
            cmd.name,
            "👑"
          )
        )
    }
  ]

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
      text: caption
    },
    {
      quoted: msg
    }
  )
}

export default {
  name: "menudono",

  aliases: [
    "donomenu",
    "menudono",
    "menuowner",
    "ownermenu"
  ],

  category:
    "menus",

  description:
    "Mostra o menu exclusivo do dono.",

  ownerOnly:
    true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender)) {
      return null
    }

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