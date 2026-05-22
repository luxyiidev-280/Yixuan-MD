//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Sair do Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

export default {
  name: "sair",

  aliases: [
    "leave",
    "sairgp",
    "leavegp"
  ],

  category: "dono",

  description:
    "Faz o bot sair do grupo atual.",

  ownerOnly: true,
  groupOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    if (!ctx.isGroup) {
      return reply(
        sock,
        msg,
        errorBox(
          "Grupo necessário",
          "Esse comando só funciona dentro de grupos."
        )
      )
    }

    await reply(
      sock,
      msg,
      successBox(
        "Saindo do grupo",
        "Yixuan-MD está encerrando conexão com este grupo."
      )
    )

    setTimeout(async () => {
      try {
        await sock.groupLeave(
          ctx.from
        )
      } catch {}
    }, 1200)
  }
}