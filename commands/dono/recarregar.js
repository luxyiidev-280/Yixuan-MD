//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Recarregar Comandos
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  bot
} from "#system/config.js"

import {
  loadCommands
} from "#core/loader.js"

import {
  updateCommandRuntime
} from "../../connection.js"

export default {
  name: "recarregar",

  aliases: [
    "reload",
    "reloadcmds"
  ],

  category: "dono",

  description:
    "Recarrega comandos sem reiniciar o processo.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const loaded =
      await loadCommands()

    updateCommandRuntime(loaded)

    return sock.sendMessage(
      ctx.from,
      {
        text: [
          "〔 ✅️ *_Comandos recarregados_* 〕",
          `〔 📦 _Commands true: ${loaded.health.success}_ 〕`,
          `〔 ❌️ _Commands false: ${loaded.health.failed}_ 〕`,
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
