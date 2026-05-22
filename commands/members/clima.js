//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Clima
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  getWeather
} from "#system/weather.js"

import {
  bot
} from "#system/config.js"

import {
  reply,
  errorBox,
  infoBox
} from "#system/reply.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function valueOrUnknown(value, suffix = "") {
  if (value === undefined || value === null || value === "")
    return "Indefinido"

  return `${value}${suffix}`
}

function buildWeather(data = {}) {
  const place =
    [
      data.city,
      data.region,
      data.country
    ]
      .filter(Boolean)
      .join(" - ")

  return compact([
    title("Clima", "🌦️"),
    field("Cidade", place || "Indefinida", "📍"),
    field("Condição", data.condition || "Indefinida", "☁️"),
    field("Temperatura", valueOrUnknown(data.temperature, "°C"), "🌡️"),
    field("Sensação", valueOrUnknown(data.feelsLike, "°C"), "🔥"),
    field("Umidade", valueOrUnknown(data.humidity, "%"), "💧"),
    field("Vento", valueOrUnknown(data.wind, " km/h"), "🌬️"),
    field("Chuva", valueOrUnknown(data.precipitation, " mm"), "🌧️"),
    field("Fonte", data.source || "Múltiplas fontes", "📡"),
    data.time
      ? field("Atualizado", data.time, "🕒")
      : null,
    "",
    footer(bot.footer)
  ])
}

export default {
  name:
    "clima",

  aliases: [
    "tempo",
    "weather"
  ],

  category:
    "members",

  description:
    "Mostra o clima de uma cidade usando fontes públicas.",

  cooldown:
    3000,

  async run(sock, msg, args, ctx) {
    const city =
      clean(
        ctx.query ||
        args.join(" ")
      )

    if (!city) {
      return reply(
        sock,
        msg,
        errorBox(
          "Cidade necessária",
          `Use: ${ctx.prefix}clima São Paulo`
        )
      )
    }

    try {
      await reply(
        sock,
        msg,
        infoBox(
          "Clima",
          "Consultando fontes de clima..."
        )
      )

      const data =
        await getWeather(city)

      return sock.sendMessage(
        ctx.from,
        {
          text:
            buildWeather(data)
        },
        {
          quoted:
            msg
        }
      )
    } catch (error) {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha no clima",
          "Não consegui consultar essa cidade agora."
        )
      )
    }
  }
}
