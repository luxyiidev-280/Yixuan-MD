//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Link do Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin
} from "#system/admin.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

import {
  title,
  line,
  footer,
  compact
} from "#system/ui.js"

import {
  bot
} from "#system/config.js"

export default {
  name: "linkgp",

  aliases: [
    "link",
    "linkgrupo",
    "invite"
  ],

  category: "admins",

  description:
    "Mostra o link de convite do grupo.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    try {
      const code =
        await sock.groupInviteCode(ctx.from)

      const invite =
        `https://chat.whatsapp.com/${code}`

      return sock.sendMessage(
        ctx.from,
        {
          text: compact([
            title("Link do grupo", "🔗"),
            line(`📜 _${invite}_`),
            "",
            footer(bot.footer)
          ])
        },
        {
          quoted: msg
        }
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao gerar link",
          "Não consegui obter o link do grupo."
        )
      )
    }
  }
}