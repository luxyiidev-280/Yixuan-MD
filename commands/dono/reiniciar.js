//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Reiniciar
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  flushState
} from "#system/state.js"

import {
  reply,
  successBox
} from "#system/reply.js"

export default {
  name: "reiniciar",

  aliases: [
    "restart",
    "rr",
    "reload"
  ],

  category: "dono",

  description:
    "Reinicia o processo da Yixuan-MD.",

  ownerOnly:
    true,

  async run(sock, msg, args, ctx) {
    await reply(
      sock,
      msg,
      successBox(
        "Reiniciando",
        "Salvando dados e reiniciando o processo."
      )
    )

    try {
      flushState()
    } catch {}

    setTimeout(() => {
      process.exit(0)
    }, 800)
  }
}