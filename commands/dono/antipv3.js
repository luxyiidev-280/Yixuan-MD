//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: AntiPV3
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  getAntiPv3,
  setAntiPv3
} from "#system/antipv3.js"

import {
  reply,
  successBox,
  infoBox,
  errorBox
} from "#system/reply.js"

export default {
  name: "antipv3",

  aliases: [
    "pv3",
    "bloquearpv"
  ],

  category: "dono",

  description:
    "Bloqueia comandos no privado.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const mode =
      String(args[0] || "status")
        .toLowerCase()
        .trim()

    if (mode === "status") {
      return reply(
        sock,
        msg,
        infoBox(
          "AntiPV3",
          getAntiPv3()
            ? "Ativado."
            : "Desativado."
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      setAntiPv3(true)

      return reply(
        sock,
        msg,
        successBox(
          "AntiPV3 ativado",
          "Comandos no privado serão bloqueados."
        )
      )
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setAntiPv3(false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiPV3 desativado"
        )
      )
    }

    return reply(
      sock,
      msg,
      errorBox(
        "Uso incorreto",
        "Use: antipv3 1, 0 ou status."
      )
    )
  }
}