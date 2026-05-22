//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Manutenção
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  isMaintenance,
  setMaintenance
} from "#system/state.js"

import {
  reply,
  successBox,
  infoBox
} from "#system/reply.js"

export default {
  name: "manutencao",

  aliases: [
    "manutenção",
    "maintenance"
  ],

  category: "dono",

  description:
    "Ativa, desativa ou consulta o modo manutenção.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const action =
      String(args[0] || "status").toLowerCase()

    if (["1", "on", "ligar"].includes(action)) {
      setMaintenance(true)

      return reply(
        sock,
        msg,
        successBox(
          "Manutenção ativada",
          "Comandos comuns serão ignorados."
        )
      )
    }

    if (["0", "off", "desligar"].includes(action)) {
      setMaintenance(false)

      return reply(
        sock,
        msg,
        successBox(
          "Manutenção desativada",
          "O bot voltou ao modo normal."
        )
      )
    }

    return reply(
      sock,
      msg,
      infoBox(
        "Status da manutenção",
        isMaintenance() ? "Ativada" : "Desativada"
      )
    )
  }
}
