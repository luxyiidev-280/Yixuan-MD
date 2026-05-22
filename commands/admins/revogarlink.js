//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Revogar Link do Grupo
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
  name: "revogarlink",

  aliases: [
    "resetlink",
    "novolink"
  ],

  category: "admins",

  description:
    "Revoga o link atual e gera um novo convite do grupo.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    try {
      await sock.groupRevokeInvite(ctx.from)

      const code =
        await sock.groupInviteCode(ctx.from)

      return reply(
        sock,
        msg,
        successBox(
          "Link revogado",
          `Novo link: https://chat.whatsapp.com/${code}`
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao revogar",
          "Não consegui gerar um novo link."
        )
      )
    }
  }
}
