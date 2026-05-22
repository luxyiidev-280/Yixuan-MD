//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Marcar Todos
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  getMetadata,
  tag
} from "#system/admin.js"

import {
  bot
} from "#system/config.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

import {
  title,
  text,
  footer,
  compact
} from "#system/ui.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

export default {
  name: "marcar",

  aliases: [
    "tagall",
    "todos"
  ],

  category: "admins",

  description:
    "Marca todos os membros do grupo.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const metadata =
      await getMetadata(
        sock,
        ctx.from
      )

    const participants =
      metadata?.participants || []

    if (!participants.length) {
      return reply(
        sock,
        msg,
        errorBox(
          "Grupo vazio",
          "Não consegui carregar os membros."
        )
      )
    }

    const mentions =
      participants
        .map(p => p.id || p.jid || p.lid)
        .filter(Boolean)

    const reason =
      clean(args.join(" "))

    const lines = [
      title("Marcação geral", "📣"),
      text(reason || "Chamando todos os membros.", "☯️"),
      ""
    ]

    for (const jid of mentions) {
      lines.push(
        `〔 🪷 _${tag(jid)}_ 〕`
      )
    }

    lines.push(
      "",
      footer(bot.footer)
    )

    return sock.sendMessage(
      ctx.from,
      {
        text:
          compact(lines),

        mentions
      },
      {
        quoted: msg
      }
    )
  }
}