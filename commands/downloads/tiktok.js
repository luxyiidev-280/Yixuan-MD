//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Download: TikTok
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

export default {
  name: "tiktok",

  aliases: [
    "tt",
    "tik"
  ],

  category: "downloads",

  description:
    "Baixa vídeo do TikTok.",

  cooldown:
    1200,

  async run(sock, msg, args, ctx) {
    const url =
      clean(ctx.query || args.join(" "))

    if (!url.includes("tiktok")) {
      return reply(
        sock,
        msg,
        errorBox(
          "Link necessário",
          `Use: ${ctx.prefix}tiktok link do vídeo`
        )
      )
    }

    try {
      return sock.sendMessage(
        ctx.from,
        {
          video: {
            url: req.tiktokVideoUrl(url)
          },
          mimetype: "video/mp4"
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
          "Falha no TikTok",
          "Não consegui baixar esse vídeo."
        )
      )
    }
  }
}