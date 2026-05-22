//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Membro: Escolher
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  reply,
  errorBox
} from "#system/reply.js"

function clean(value = "") {
  return String(value || "").trim()
}

export default {
  name: "escolher",

  aliases: [
    "choose",
    "decidir"
  ],

  category: "members",

  description:
    "Escolhe uma opção entre várias.",

  async run(sock, msg, args, ctx) {
    const query =
      clean(ctx.query || args.join(" "))

    const options =
      query
        .split(/\s+ou\s+|\s*[,|/]\s*/i)
        .map(clean)
        .filter(Boolean)

    if (options.length < 2) {
      return reply(
        sock,
        msg,
        errorBox(
          "Opções insuficientes",
          `Use: ${ctx.prefix}escolher pizza ou hambúrguer`
        )
      )
    }

    const choice =
      options[Math.floor(Math.random() * options.length)]

    return reply(
      sock,
      msg,
      [
        "〔 🎲 *_Escolha feita_* 〕",
        `〔 ☯️ _Eu escolho: ${choice}_ 〕`
      ].join("\n")
    )
  }
}
