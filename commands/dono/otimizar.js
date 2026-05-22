//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Otimizar Sistema
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  bot
} from "#system/config.js"

import {
  forceOptimize
} from "#system/optimizer.js"

export default {
  name: "otimizar",

  aliases: [
    "limparcache",
    "gc"
  ],

  category: "dono",

  description: "Executa limpeza manual de cache/memória.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const result =
      forceOptimize("comando do dono")

    return sock.sendMessage(
      ctx.from,
      {
        text: [
          "〔 ✅️ *_Otimização executada_* 〕",
          `〔 🧠 _Caches limpos: ${result.cleared}_ 〕`,
          `〔 ♻️ _GC: ${result.gc ? "sim" : "não disponível"}_ 〕`,
          "",
          bot.footer
        ].join("\n")
      },
      {
        quoted: msg
      }
    )
  }
}
