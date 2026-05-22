//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Dono / Criador
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  paths
} from "#system/config.js"

import {
  readBuffer
} from "#system/files.js"

import {
  line,
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

function ownerNumber() {
  return bot.owner?.numbers?.[0] || ""
}

function ownerJid() {
  const number =
    ownerNumber()

  if (!number)
    return ""

  return `${number}@s.whatsapp.net`
}

function waLink() {
  const number =
    ownerNumber()

  if (!number)
    return "Não configurado"

  return `https://wa.me/${number}`
}

function buildOwnerText() {
  const number =
    ownerNumber()

  const displayNumber =
    number || "Não configurado"

  return compact([
    title("Criador oficial", "👑"),
    field("Nome", bot.owner?.name || "Luxyii Dev", "☯️"),
    field("Bot", bot.name, "📜"),
    field("Core", bot.core, "🪷"),
    field("Número", displayNumber, "📱"),
    line(`🔗 _${waLink()}_`),
    "",
    footer(bot.footer)
  ])
}

async function sendOwner(sock, msg, ctx, caption) {
  const image =
    readBuffer(paths.creatorImage)

  const jid =
    ownerJid()

  const mentions =
    jid
      ? [jid]
      : []

  if (image) {
    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption,
        mentions
      },
      {
        quoted: msg
      }
    )
  }

  return sock.sendMessage(
    ctx.from,
    {
      text: caption,
      mentions
    },
    {
      quoted: msg
    }
  )
}

export default {
  name: "dono",

  aliases: [
    "criador",
    "owner",
    "dev"
  ],

  category: "members",

  description:
    "Mostra as informações do dono da Yixuan-MD.",

  async run(sock, msg, args, ctx) {
    const caption =
      buildOwnerText()

    return sendOwner(
      sock,
      msg,
      ctx,
      caption
    )
  }
}