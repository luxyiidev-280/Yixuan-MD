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
  name: "antispam",
  aliases: ["spamoff"],
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
          "AntiSpam",
          getFlag(ctx.from, "antispam") ? "Ativado." : "Desativado."
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antispam", true)

      return reply(sock, msg, successBox("AntiSpam ativado", "Flood será punido com advertência."))
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antispam", false)

      return reply(sock, msg, successBox("AntiSpam desativado"))
    }

    return reply(sock, msg, errorBox("Uso incorreto", "Use: antispam 1, 0 ou status."))
  }
}