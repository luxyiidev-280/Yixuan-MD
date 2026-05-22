//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Download: Play Vídeo
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
    title("Play vídeo", "🎥"),
    field("Título", data.titulo || "Não encontrado", "☯️"),
    field("Duração", data.tempo || "Desconhecida", "⏱️"),
    field("Modo", "LIVE", "⚡"),
    "",
    footer(bot.footer)
  ])
}

export default {
  name: "play_video",

  aliases: [
    "playmp4",
    "pvideo",
    "ytmp4"
  ],

  category: "downloads",

  description:
    "Baixa vídeo do YouTube usando Bronxys.",

  cooldown:
    1500,

  async run(sock, msg, args, ctx) {
    const query =
      clean(ctx.query || args.join(" "))

    if (!query) {
      return reply(
        sock,
        msg,
        errorBox(
          "Pesquisa necessária",
          `Use: ${ctx.prefix}play_video nome do vídeo`
        )
      )
    }

    try {
      const metaPromise =
        req.ytFirst(query)

      const videoUrl =
        req.playVideoUrl(query)

      const data =
        await metaPromise

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

      return sock.sendMessage(
        ctx.from,
        {
          video: {
            url: videoUrl
          },
          mimetype: "video/mp4",
          fileName:
            `${data?.titulo || "video"}.mp4`,
          caption:
            buildCaption(data)
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
          "Falha no vídeo",
          "Seja mais específico ou tente outro vídeo."
        )
      )
    }
  }
}