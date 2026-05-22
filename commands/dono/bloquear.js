//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Bloquear Usuário
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner,
  getTarget,
  tag
} from "#system/admin.js"

import {
  blockUser
} from "#system/state.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "bloquear",

  aliases: [
    "blockuser",
    "block"
  ],

  category: "dono",

  description:
    "Bloqueia um usuário de usar comandos.",

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

    blockUser(target)

    return sock.sendMessage(
      ctx.from,
      {
        text:
          successBox(
            "Usuário bloqueado",
            `${tag(target)} não poderá usar comandos.`
          ),
        mentions: [target]
      },
      {
        quoted: msg
      }
    )
  }
}
