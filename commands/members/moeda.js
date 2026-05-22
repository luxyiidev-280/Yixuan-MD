//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Membro: Conversor de Moeda
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

const cache =
  new Map()

function clean(value = "") {
  return String(value || "").trim()
}

function normalizeCurrency(value = "") {
  return clean(value)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
}

function parseInput(query = "") {
  const parts =
    clean(query)
      .replace(/,/g, ".")
      .split(/\s+/)
      .filter(Boolean)

  if (parts.length < 3)
    return null

  const amount =
    Number(parts[0])

  const from =
    normalizeCurrency(parts[1])

  const to =
    normalizeCurrency(parts[2])

  if (!amount || !from || !to)
    return null

  return {
    amount,
    from,
    to
  }
}

async function getRate(from = "USD", to = "BRL") {
  const key =
    `${from}:${to}`

  const saved =
    cache.get(key)

  if (saved && Date.now() - saved.time < 1000 * 60 * 20)
    return saved.rate

  const response =
    await fetch(
      `https://open.er-api.com/v6/latest/${from}`,
      {
        headers: {
          Accept: "application/json, text/plain"
        }
      }
    )

  const data =
    await response.json()

  const rate =
    Number(data?.rates?.[to] || 0)

  if (!response.ok || !rate)
    throw new Error("cotação indisponível")

  cache.set(
    key,
    {
      time: Date.now(),
      rate
    }
  )

  return rate
}

export default {
  name: "moeda",

  aliases: [
    "converter",
    "cambio"
  ],

  category: "members",

  description:
    "Converte moedas usando cotação pública.",

  cooldown: 3000,

  async run(sock, msg, args, ctx) {
    const input =
      parseInput(ctx.query || args.join(" "))

    if (!input) {
      return reply(
        sock,
        msg,
        errorBox(
          "Uso incorreto",
          `Use: ${ctx.prefix}moeda 10 USD BRL`
        )
      )
    }

    try {
      const rate =
        await getRate(input.from, input.to)

      const result =
        input.amount * rate

      const text =
        compact([
          title("Conversor de Moeda", "💱"),
          field("Valor", `${input.amount} ${input.from}`, "💰"),
          field("Convertido", `${result.toFixed(2)} ${input.to}`, "✅️"),
          field("Cotação", `1 ${input.from} = ${rate.toFixed(4)} ${input.to}`, "📊"),
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
          "Falha na cotação",
          "Não consegui consultar essa moeda agora."
        )
      )
    }
  }
}
