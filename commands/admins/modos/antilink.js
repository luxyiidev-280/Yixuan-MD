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
  name: "antilink",
  aliases: ["antilinkhard", "linkoff"],
  category: "admins",
  subCategory: "protecoes",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const mode =
      String(args[0] || "status").toLowerCase()

    if (mode === "status") {
      return reply(
        sock,
        msg,
        infoBox(
          "AntiLink",
          getFlag(ctx.from, "antilink") ? "Ativado." : "Desativado."
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antilink", true)

      return reply(sock, msg, successBox("AntiLink ativado", "Links serão apagados e punidos."))
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antilink", false)

      return reply(sock, msg, successBox("AntiLink desativado"))
    }

    return reply(sock, msg, errorBox("Uso incorreto", "Use: antilink 1, 0 ou status."))
  }
}