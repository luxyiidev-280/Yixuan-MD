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
  name: "antifake",
  aliases: ["fakeoff", "antinumero"],
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
          "AntiFake",
          getFlag(ctx.from, "antifake") ? "Ativado." : "Desativado."
        )
      )
    }

    if (["1", "on", "ligar", "ativar"].includes(mode)) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      setFlag(ctx.from, "antifake", true)

      return reply(sock, msg, successBox("AntiFake ativado", "Números estrangeiros serão removidos."))
    }

    if (["0", "off", "desligar", "desativar"].includes(mode)) {
      setFlag(ctx.from, "antifake", false)

      return reply(sock, msg, successBox("AntiFake desativado"))
    }

    return reply(sock, msg, errorBox("Uso incorreto", "Use: antifake 1, 0 ou status."))
  }
}