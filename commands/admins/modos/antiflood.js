//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Modo: AntiFlood
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin
} from "#system/admin.js"

import {
  getFlag,
  setFlag
} from "#system/state.js"

import {
  reply,
  successBox,
  infoBox,
  errorBox
} from "#system/reply.js"

function statusText(ctx = {}) {
  const normal =
    getFlag(ctx.from, "antiflood")

  const hard =
    getFlag(ctx.from, "antifloodHard")

  if (hard)
    return "Modo hard ativado. Flood será removido com punição rápida."

  if (normal)
    return "Ativado. Flood será apagado e advertido."

  return "Desativado."
}

export default {
  name:
    "antiflood",

  aliases: [
    "flood",
    "floodoff"
  ],

  category:
    "admins",

  subCategory:
    "protecoes",

  groupOnly:
    true,

  adminOnly:
    true,

  botAdmin:
    true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const mode =
      String(args[0] || "status")
        .toLowerCase()

    if (mode === "status") {
      return reply(
        sock,
        msg,
        infoBox(
          "AntiFlood",
          statusText(ctx)
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antiflood", true)
      setFlag(ctx.from, "antifloodHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiFlood ativado",
          "Mensagens em sequência serão apagadas e advertidas."
        )
      )
    }

    if (["hard", "2", "forte"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antiflood", true)
      setFlag(ctx.from, "antifloodHard", true)

      return reply(
        sock,
        msg,
        successBox(
          "AntiFlood hard ativado",
          "Flood extremo será punido com remoção rápida."
        )
      )
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antiflood", false)
      setFlag(ctx.from, "antifloodHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiFlood desativado"
        )
      )
    }

    return reply(
      sock,
      msg,
      errorBox(
        "Uso incorreto",
        "Use: antiflood 1, hard, 0 ou status."
      )
    )
  }
}
