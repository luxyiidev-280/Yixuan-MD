//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Fechar Grupo
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
  name: "fechargp",

  aliases: [
    "fechar",
    "close",
    "closegp"
  ],

  category: "admins",

  description:
    "Fecha o grupo apenas para administradores.",

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
        "announcement"
      )

      return reply(
        sock,
        msg,
        successBox(
          "Grupo fechado",
          "Apenas administradores podem enviar mensagens."
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao fechar",
          "Não consegui alterar as configurações do grupo."
        )
      )
    }
  }
}