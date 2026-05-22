//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Hora
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  hour,
  date,
  uptime
} from "#system/clock.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

export default {
  name:
    "hora",

  aliases: [
    "data",
    "time"
  ],

  category:
    "members",

  description:
    "Mostra hora, data e uptime do bot.",

  async run(sock, msg, args, ctx) {
    const text =
      compact([
        title("Horário", "🌤️"),
        field("Hora", hour(), "🕒"),
        field("Data", date(), "📅"),
        field("Uptime", uptime(), "⏱️"),
        "",
        footer(bot.footer)
      ])

    return sock.sendMessage(
      ctx.from,
      {
        text
      },
      {
        quoted:
          msg
      }
    )
  }
}
