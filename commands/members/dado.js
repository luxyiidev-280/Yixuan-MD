//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Membro: Dado
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  createDadoCanvas
} from "../../dados/org/funcoes/dadoCanvas.js"

import {
  compact,
  title,
  field,
  footer
} from "#system/ui.js"

export default {
  name: "dado",

  aliases: [
    "roll",
    "dice"
  ],

  category: "members",

  description:
    "Rola um dado simples.",

  async run(sock, msg, args, ctx) {
    const sides =
      Math.max(
        2,
        Math.min(
          1000,
          Number(args[0] || 6)
        )
      )

    const result =
      Math.floor(
        Math.random() * sides
      ) + 1

    const image =
      await createDadoCanvas({
        result,
        sides,
        user:
          ctx.pushName || "Usuário",
        footer:
          bot.footer.replace(/^_+|_+$/g, "")
      })

    const text =
      compact([
        title("Dado lançado", "🎲"),
        field("Resultado", `${result}/${sides}`, "📦"),
        field("Número sorteado", result, "🎯"),
        field("Lados", sides, "🪶"),
        "",
        footer(bot.footer)
      ])

    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption: text
      },
      {
        quoted: msg
      }
    )
  }
}