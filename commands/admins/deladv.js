//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Remover Advertência
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  getTarget,
  tag
} from "#system/admin.js"

import {
  clearWarn,
  getWarn
} from "#system/warnings.js"

import {
  reply,
  errorBox,
  successBox,
  infoBox
} from "#system/reply.js"

export default {
  name: "deladv",

  aliases: [
    "rmadv",
    "tiraradv",
    "clearwarn"
  ],

  category: "admins",

  description:
    "Remove as advertências de um membro.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
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

    const current =
      getWarn(
        ctx.from,
        target
      )

    if (current <= 0) {
      return sock.sendMessage(
        ctx.from,
        {
          text: infoBox(
            "Sem advertências",
            `${tag(target)} não possui advertências.`
          ),
          mentions: [target]
        },
        {
          quoted: msg
        }
      )
    }

    clearWarn(
      ctx.from,
      target
    )

    return sock.sendMessage(
      ctx.from,
      {
        text: successBox(
          "Advertências removidas",
          `${tag(target)} teve ${current} advertência(s) removida(s).`
        ),
        mentions: [target]
      },
      {
        quoted: msg
      }
    )
  }
}