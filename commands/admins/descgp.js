//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Alterar Descrição do Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin
} from "#system/admin.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "descgp",

  aliases: [
    "setdesc",
    "descrição",
    "descricao"
  ],

  category: "admins",

  description:
    "Altera a descrição do grupo.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    const desc =
      String(ctx.query || args.join(" ") || "").trim()

    if (!desc) {
      return reply(
        sock,
        msg,
        errorBox(
          "Descrição necessária",
          `Use: ${ctx.prefix}descgp nova descrição`
        )
      )
    }

    try {
      await sock.groupUpdateDescription(
        ctx.from,
        desc
      )

      return reply(
        sock,
        msg,
        successBox(
          "Descrição alterada",
          "A descrição do grupo foi atualizada."
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao alterar",
          "Não consegui mudar a descrição do grupo."
        )
      )
    }
  }
}
