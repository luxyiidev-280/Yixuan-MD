//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Desmutar Membro
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  getTarget,
  tag
} from "#system/admin.js"

import {
  unmuteUser
} from "#system/state.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "unmute",

  aliases: [
    "desmute",
    "liberarvoz"
  ],

  category: "admins",

  description:
    "Remove o mute de um membro.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const target =
      getTarget(ctx)

    if (!target) {
      return reply(
        sock,
        msg,
        errorBox(
          "Alvo inválido",
          "Marque, responda ou envie o número de alguém."
        )
      )
    }

    unmuteUser(
      ctx.from,
      target
    )

    return sock.sendMessage(
      ctx.from,
      {
        text:
          successBox(
            "Usuário desmutado",
            `${tag(target)} voltou a poder enviar mensagens.`
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
