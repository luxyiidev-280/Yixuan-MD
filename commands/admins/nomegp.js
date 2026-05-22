//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Alterar Nome do Grupo
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
  name: "nomegp",

  aliases: [
    "setnome",
    "mudarnome",
    "nomegrupo"
  ],

  category: "admins",

  description:
    "Altera o nome do grupo.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    const name =
      String(ctx.query || args.join(" ") || "").trim()

    if (!name) {
      return reply(
        sock,
        msg,
        errorBox(
          "Nome necessário",
          `Use: ${ctx.prefix}nomegp novo nome do grupo`
        )
      )
    }

    if (name.length > 80) {
      return reply(
        sock,
        msg,
        errorBox(
          "Nome muito grande",
          "Use até 80 caracteres."
        )
      )
    }

    try {
      await sock.groupUpdateSubject(
        ctx.from,
        name
      )

      return reply(
        sock,
        msg,
        successBox(
          "Nome alterado",
          "O nome do grupo foi atualizado."
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao alterar",
          "Não consegui mudar o nome do grupo."
        )
      )
    }
  }
}
