//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Desbloquear Usuário
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner,
  getTarget,
  tag
} from "#system/admin.js"

import {
  unblockUser
} from "#system/state.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "desbloquear",

  aliases: [
    "unblockuser",
    "unblock"
  ],

  category: "dono",

  description:
    "Remove bloqueio global de um usuário.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const target =
      getTarget(ctx)

    if (!target) {
      return reply(
        sock,
        msg,
        errorBox(
          "Alvo inválido",
          "Marque, responda ou envie o número."
        )
      )
    }

    unblockUser(target)

    return sock.sendMessage(
      ctx.from,
      {
        text:
          successBox(
            "Usuário desbloqueado",
            `${tag(target)} voltou a poder usar comandos.`
          ),
        mentions: [target]
      },
      {
        quoted: msg
      }
    )
  }
}
