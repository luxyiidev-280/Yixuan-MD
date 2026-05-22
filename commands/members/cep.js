//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Membro: CEP
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

function cleanCep(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
}

async function fetchViaCep(cep = "") {
  const response =
    await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
      {
        headers: {
          Accept: "application/json, text/plain"
        }
      }
    )

  const data =
    await response.json()

  if (!response.ok || data?.erro)
    throw new Error("CEP não encontrado")

  return data
}

export default {
  name: "cep",

  aliases: [
    "viacep",
    "endereco"
  ],

  category: "members",

  description:
    "Consulta endereço por CEP.",

  cooldown: 3000,

  async run(sock, msg, args, ctx) {
    const cep =
      cleanCep(ctx.query || args.join(" "))

    if (cep.length !== 8) {
      return reply(
        sock,
        msg,
        errorBox(
          "CEP inválido",
          `Use: ${ctx.prefix}cep 01001000`
        )
      )
    }

    try {
      const data =
        await fetchViaCep(cep)

      const text =
        compact([
          title("Consulta CEP", "📍"),
          field("CEP", data.cep, "📮"),
          field("Rua", data.logradouro || "indefinida", "🛣️"),
          field("Bairro", data.bairro || "indefinido", "🏘️"),
          field("Cidade", data.localidade || "indefinida", "🌆"),
          field("UF", data.uf || "indefinida", "🗺️"),
          field("DDD", data.ddd || "indefinido", "☎️"),
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
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "CEP não encontrado",
          "Não consegui consultar esse CEP."
        )
      )
    }
  }
}
