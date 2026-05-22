//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Modo: AntiTrava
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
    getFlag(ctx.from, "antitrava")

  const hard =
    getFlag(ctx.from, "antitravaHard")

  if (hard)
    return "Modo hard ativado. Mensagens suspeitas serão apagadas e removidas."

  if (normal)
    return "Ativado. Mensagens travadoras serão apagadas."

  return "Desativado."
}

export default {
  name:
    "antitrava",

  aliases: [
    "trava",
    "anticrash"
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
          "AntiTrava",
          statusText(ctx)
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antitrava", true)
      setFlag(ctx.from, "antitravaHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiTrava ativado",
          "Mensagens travadoras serão apagadas automaticamente."
        )
      )
    }

    if (["hard", "2", "forte"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antitrava", true)
      setFlag(ctx.from, "antitravaHard", true)

      return reply(
        sock,
        msg,
        successBox(
          "AntiTrava hard ativado",
          "Mensagens perigosas serão apagadas e o autor será removido."
        )
      )
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antitrava", false)
      setFlag(ctx.from, "antitravaHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiTrava desativado"
        )
      )
    }

    return reply(
      sock,
      msg,
      errorBox(
        "Uso incorreto",
        "Use: antitrava 1, hard, 0 ou status."
      )
    )
  }
}
