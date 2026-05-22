//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Abrir Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin
} from "#system/admin.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

export default {
  name: "abrirgp",

  aliases: [
    "abrir",
    "open",
    "opengp"
  ],

  category: "admins",

  description:
    "Abre o grupo para todos enviarem mensagens.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    try {
      await sock.groupSettingUpdate(
        ctx.from,
        "not_announcement"
      )

      return reply(
        sock,
        msg,
        successBox(
          "Grupo aberto",
          "Todos podem enviar mensagens."
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao abrir",
          "Não consegui alterar as configurações do grupo."
        )
      )
    }
  }
}