//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Mutar Membro
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin,
  getTarget,
  isOwner,
  isAdmin,
  tag
} from "#system/admin.js"

import {
  muteUser
} from "#system/state.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "mute",

  aliases: [
    "mutar",
    "silenciar"
  ],

  category: "admins",

  description:
    "Silencia um membro no grupo apagando as próximas mensagens dele.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    const target =
      getTarget(ctx)

    if (!target || target === ctx.sender) {
      return reply(
        sock,
        msg,
        errorBox(
          "Alvo inválido",
          "Marque, responda ou envie o número de alguém."
        )
      )
    }

    if (isOwner(target)) {
      return reply(
        sock,
        msg,
        errorBox(
          "Ação bloqueada",
          "Não posso mutar meu dono."
        )
      )
    }

    const admin =
      await isAdmin(sock, ctx.from, target)

    if (admin) {
      return reply(
        sock,
        msg,
        errorBox(
          "Ação bloqueada",
          "Não posso mutar administradores."
        )
      )
    }

    const reason =
      args.slice(1).join(" ").trim()

    muteUser(
      ctx.from,
      target,
      reason
    )

    return sock.sendMessage(
      ctx.from,
      {
        text:
          successBox(
            "Usuário mutado",
            `${tag(target)} não poderá enviar mensagens até ser desmutado.`
          ),

        mentions: [
          target
        ]
      },
      {
        quoted: msg
      }
    )
  }
}
