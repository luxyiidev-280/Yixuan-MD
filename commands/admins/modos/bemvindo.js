//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Modo: Bem-vindo
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

export default {
  name: "bemvindo",

  aliases: [
    "welcome",
    "bv"
  ],

  category: "admins",
  subCategory: "modos",

  description:
    "Ativa ou desativa a mensagem de boas-vindas.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
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
          "Bem-vindo",
          getFlag(ctx.from, "welcome")
            ? "Ativado."
            : "Desativado."
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "welcome", true)

      return reply(
        sock,
        msg,
        successBox(
          "Bem-vindo ativado",
          "Novos membros receberão mensagem de entrada."
        )
      )
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "welcome", false)

      return reply(
        sock,
        msg,
        successBox(
          "Bem-vindo desativado"
        )
      )
    }

    return reply(
      sock,
      msg,
      errorBox(
        "Uso incorreto",
        "Use: bemvindo 1, 0 ou status."
      )
    )
  }
}