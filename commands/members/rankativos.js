//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Membro: Rank de Ativos
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  getUsersDB
} from "#system/state.js"

import {
  tag
} from "#system/admin.js"

export default {
  name: "rankativos",

  aliases: [
    "ativos",
    "rank"
  ],

  category: "members",

  description:
    "Mostra os usuários mais ativos registrados pelo bot.",

  async run(sock, msg, args, ctx) {
    const db =
      getUsersDB()

    const ranking =
      Object.entries(db || {})
        .map(([jid, user]) => ({
          jid,
          messages:
            Number(user?.stats?.messages || 0),
          commands:
            Number(user?.stats?.commands || 0)
        }))
        .sort((a, b) =>
          (b.messages + b.commands) - (a.messages + a.commands)
        )
        .slice(0, 10)

    const lines = [
      "〔 🏆 *_Rank de Ativos_* 〕"
    ]

    if (!ranking.length) {
      lines.push(
        "〔 📜 _Ainda não há dados suficientes._ 〕"
      )
    } else {
      ranking.forEach((item, index) => {
        lines.push(
          `〔 ${index + 1}. _${tag(item.jid)} • ${item.messages} msgs • ${item.commands} cmds_ 〕`
        )
      })
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
          ranking.map(item => item.jid)
      },
      {
        quoted: msg
      }
    )
  }
}
