//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Lista de Administradores
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkGroup,
  getMetadata,
  tag
} from "#system/admin.js"

import {
  bot
} from "#system/config.js"

function isAdminParticipant(participant = {}) {
  return participant.admin === "admin" || participant.admin === "superadmin"
}

export default {
  name: "admins",

  aliases: [
    "adms",
    "listadmins"
  ],

  category: "admins",

  description:
    "Mostra os administradores do grupo.",

  groupOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkGroup(sock, msg, ctx))
      return

    const metadata =
      await getMetadata(sock, ctx.from, true)

    const admins =
      (metadata?.participants || [])
        .filter(isAdminParticipant)
        .map(p => p.id || p.lid || p.phoneNumber)
        .filter(Boolean)

    const lines = [
      "〔 🛡️ *_Administradores_* 〕",
      `〔 📦 _Total: ${admins.length}_ 〕`,
      ""
    ]

    for (const admin of admins) {
      lines.push(
        `〔 🛡️ _${tag(admin)}_ 〕`
      )
    }

    lines.push(
      "",
      bot.footer
    )

    return sock.sendMessage(
      ctx.from,
      {
        text:
          lines.join("\n"),

        mentions:
          admins
      },
      {
        quoted: msg
      }
    )
  }
}
