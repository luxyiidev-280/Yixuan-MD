//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Lista de Mutados
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  tag
} from "#system/admin.js"

import {
  getMutedUsers
} from "#system/state.js"

import {
  bot
} from "#system/config.js"

export default {
  name: "mutados",

  aliases: [
    "listamute",
    "mutelist"
  ],

  category: "admins",

  description:
    "Mostra os membros mutados no grupo.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const muted =
      getMutedUsers(ctx.from)

    const entries =
      Object.entries(muted || {})

    const lines = [
      "〔 🔇 *_Membros mutados_* 〕"
    ]

    if (!entries.length) {
      lines.push(
        "〔 ✅️ _Nenhum membro mutado._ 〕"
      )
    } else {
      for (const [jid, data] of entries.slice(0, 50)) {
        lines.push(
          `〔 🔇 _${tag(jid)}${data?.reason ? ` • ${data.reason}` : ""}_ 〕`
        )
      }
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
          entries.map(([jid]) => jid)
      },
      {
        quoted: msg
      }
    )
  }
}
