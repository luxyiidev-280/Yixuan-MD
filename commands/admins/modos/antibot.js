//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Modo: AntiBot
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
    getFlag(ctx.from, "antibot")

  const hard =
    getFlag(ctx.from, "antibotHard")

  if (hard)
    return "Modo hard ativado. Comportamento automatizado será removido rápido."

  if (normal)
    return "Ativado. Comportamento automatizado será advertido."

  return "Desativado."
}

export default {
  name:
    "antibot",

  aliases: [
    "botoff",
    "antibots"
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
          "AntiBot",
          statusText(ctx)
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antibot", true)
      setFlag(ctx.from, "antibotHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiBot ativado",
          "Comportamentos automatizados serão detectados e advertidos."
        )
      )
    }

    if (["hard", "2", "forte"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antibot", true)
      setFlag(ctx.from, "antibotHard", true)

      return reply(
        sock,
        msg,
        successBox(
          "AntiBot hard ativado",
          "Bots suspeitos serão removidos com mais rigor."
        )
      )
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antibot", false)
      setFlag(ctx.from, "antibotHard", false)

      return reply(
        sock,
        msg,
        successBox(
          "AntiBot desativado"
        )
      )
    }

    return reply(
      sock,
      msg,
      errorBox(
        "Uso incorreto",
        "Use: antibot 1, hard, 0 ou status."
      )
    )
  }
}
