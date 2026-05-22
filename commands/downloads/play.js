//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Download: Play Áudio
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  req
} from "#system/req.js"

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

function clean(value = "") {
  return String(value || "")
    .trim()
}

function buildCaption(data = {}) {
  return compact([
    title("Play áudio", "🎵"),
    field("Título", data.titulo || "Não encontrado", "☯️"),
    field("Duração", data.tempo || "Desconhecida", "⏱️"),
    field("Canal", data.canal || "Indefinido", "🎙️"),
    field("Postado", data.postado || "Desconhecido", "📅"),
    field("Modo", "LIVE", "⚡"),
    "",
    footer(bot.footer)
  ])
}

export default {
  name: "play",

  aliases: [
    "p",
    "ytmp3",
    "musica",
    "audio"
  ],

  category: "downloads",

  description:
    "Baixa áudio do YouTube usando ZeroTwo.",

  cooldown:
    1200,

  async run(sock, msg, args, ctx) {
    const query =
      clean(
        ctx.query ||
        args.join(" ")
      )

    if (!query) {
      return reply(
        sock,
        msg,
        errorBox(
          "Pesquisa necessária",
          `Use: ${ctx.prefix}play nome ou link`
        )
      )
    }

    try {
      const data =
        await req.ytFirst(
          query
        )

      if (req.isLongDuration(data?.tempo)) {
        return reply(
          sock,
          msg,
          errorBox(
            "Vídeo muito longo",
            "Escolha algo com menos de 1 hora."
          )
        )
      }

      const audioUrl =
        req.playAudioUrl(
          data.url
        )

      const caption =
        buildCaption(data)

      const sends =
        []

      if (data.thumb) {
        sends.push(
          sock.sendMessage(
            ctx.from,
            {
              image: {
                url:
                  data.thumb
              },
              caption
            },
            {
              quoted:
                msg
            }
          )
        )
      }

      sends.push(
        sock.sendMessage(
          ctx.from,
          {
            audio: {
              url:
                audioUrl
            },
            mimetype:
              "audio/mpeg",
            fileName:
              `${data.titulo || "play"}.mp3`
          },
          {
            quoted:
              msg
          }
        )
      )

      return Promise.allSettled(
        sends
      )
    } catch (error) {
      console.log(
        "[PLAY ERROR]",
        error?.message || error
      )

      return reply(
        sock,
        msg,
        errorBox(
          "Falha no play",
          "Não consegui baixar esse áudio agora."
        )
      )
    }
  }
}