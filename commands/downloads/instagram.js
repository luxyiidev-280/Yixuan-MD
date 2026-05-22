//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Download: Instagram
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  req
} from "#system/req.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function mediaType(item = {}) {
  const type =
    String(item.type || "")
      .toLowerCase()

  if (type === "mp4")
    return "video"

  if (
    type === "jpg" ||
    type === "jpeg" ||
    type === "png" ||
    type === "webp"
  ) {
    return "image"
  }

  if (type === "mp3")
    return "audio"

  return "video"
}

function mime(item = {}) {
  const type =
    String(item.type || "")
      .toLowerCase()

  if (type === "mp4")
    return "video/mp4"

  if (type === "webp")
    return "image/webp"

  if (type === "jpg" || type === "jpeg")
    return "image/jpeg"

  if (type === "png")
    return "image/png"

  if (type === "mp3")
    return "audio/mpeg"

  return "video/mp4"
}

export default {
  name: "instagram",

  aliases: [
    "insta",
    "ig"
  ],

  category: "downloads",

  description:
    "Baixa vídeo/foto/reels do Instagram.",

  cooldown:
    1500,

  async run(sock, msg, args, ctx) {
    const url =
      clean(ctx.query || args.join(" "))

    if (!url.includes("instagram")) {
      return reply(
        sock,
        msg,
        errorBox(
          "Link necessário",
          `Use: ${ctx.prefix}instagram link do post/reels`
        )
      )
    }

    try {
      const data =
        await req.instagram(url)

      const items =
        Array.isArray(data?.msg)
          ? data.msg
          : []

      const first =
        items[0]

      if (!first?.url) {
        return reply(
          sock,
          msg,
          errorBox(
            "Mídia não encontrada",
            "A API não retornou mídia válida."
          )
        )
      }

      const kind =
        mediaType(first)

      const payload = {
        [kind]: {
          url:
            first.url
        },
        mimetype:
          mime(first)
      }

      return sock.sendMessage(
        ctx.from,
        payload,
        {
          quoted: msg
        }
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha no Instagram",
          "Não consegui baixar esse conteúdo."
        )
      )
    }
  }
}