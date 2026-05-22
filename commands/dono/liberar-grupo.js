//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Liberar Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  reply,
  infoBox
} from "#system/reply.js"

export default {
  name: "liberar-grupo",

  aliases: [
    "liberargp",
    "allowgroup",
    "allowgp",
    "autorizar"
  ],

  category: "dono",

  description:
    "Mostra aviso sobre liberação de grupos.",

  ownerOnly:
    true,

  groupOnly:
    true,

  async run(sock, msg, args, ctx) {
    return reply(
      sock,
      msg,
      infoBox(
        "Grupo já liberado",
        "A Yixuan-MD agora está em modo público. Não precisa liberar grupo manualmente."
      )
    )
  }
}
