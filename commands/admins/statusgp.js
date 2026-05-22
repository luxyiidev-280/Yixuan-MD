//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Admin: Status do Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkGroup,
  getMetadata
} from "#system/admin.js"

import {
  getGroup
} from "#system/state.js"

import {
  bot
} from "#system/config.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

export default {
  name: "statusgp",

  aliases: [
    "infogp",
    "grupostatus"
  ],

  category: "admins",

  description:
    "Mostra flags e estatísticas internas do grupo.",

  groupOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkGroup(sock, msg, ctx))
      return

    const [metadata] =
      await Promise.all([
        getMetadata(sock, ctx.from, true)
      ])

    const group =
      getGroup(ctx.from)

    const flags =
      Object.entries(group.flags || {})
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key)

    const text =
      compact([
        title("Status do Grupo", "📊"),
        field("Nome", metadata?.subject || ctx.groupName || "Grupo", "☯️"),
        field("Membros", metadata?.participants?.length || 0, "👥"),
        field("Mensagens", group.stats?.messages || 0, "💬"),
        field("Comandos", group.stats?.commands || 0, "⚡"),
        field("Proteções ativas", flags.length ? flags.join(", ") : "nenhuma", "🛡️"),
        "",
        footer(bot.footer)
      ])

    return sock.sendMessage(
      ctx.from,
      {
        text
      },
      {
        quoted: msg
      }
    )
  }
}
