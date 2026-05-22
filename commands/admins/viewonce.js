//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: View Once
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  downloadContentFromMessage
} from "baileys"

import {
  reply,
  errorBox,
  infoBox
} from "#system/reply.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function unwrapViewOnce(message = {}) {
  return (
    message?.viewOnceMessageV2?.message ||
    message?.viewOnceMessage?.message ||
    message?.viewOnceMessageV2Extension?.message ||
    message ||
    {}
  )
}

function getQuotedRaw(ctx = {}, msg = {}) {
  const quotedFromCtx =
    ctx?.quoted?.message || {}

  const quotedFromMsg =
    msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    {}

  return {
    ...unwrapViewOnce(quotedFromMsg),
    ...unwrapViewOnce(quotedFromCtx)
  }
}

function getMedia(ctx = {}, msg = {}) {
  const quoted =
    getQuotedRaw(ctx, msg)

  const current =
    unwrapViewOnce(msg?.message || {})

  const image =
    quoted.imageMessage ||
    current.imageMessage

  if (image) {
    return {
      type: "image",
      media: image,
      mimetype: image.mimetype || "image/jpeg"
    }
  }

  const video =
    quoted.videoMessage ||
    current.videoMessage

  if (video) {
    return {
      type: "video",
      media: video,
      mimetype: video.mimetype || "video/mp4"
    }
  }

  const audio =
    quoted.audioMessage ||
    current.audioMessage

  if (audio) {
    return {
      type: "audio",
      media: audio,
      mimetype: audio.mimetype || "audio/mpeg"
    }
  }

  return null
}

async function downloadMedia(media = {}, type = "image") {
  const stream =
    await downloadContentFromMessage(
      media,
      type
    )

  const chunks = []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

function buildCaption(ctx = {}) {
  return [
    "〔 👁️ *_View once revelada_* 〕",
    `〔 ☯️ _Por: ${clean(ctx.pushName || "Admin")}_ 〕`
  ].join("\n")
}

export default {
  name: "viewonce",

  aliases: [
    "vv",
    "rv",
    "revelar",
    "ver1x",
    "readview"
  ],

  category: "admins",
  subCategory: "modos",

  description:
    "Reenvia mídia de visualização única.",

  groupOnly: true,
  adminOnly: true,
  hidden: true,

  cooldown: 1500,

  async run(sock, msg, args, ctx) {
    const found =
      getMedia(ctx, msg)

    if (!found) {
      return reply(
        sock,
        msg,
        errorBox(
          "View once necessária",
          "Responda uma foto, vídeo ou áudio de visualização única."
        )
      )
    }

    try {
      await reply(
        sock,
        msg,
        infoBox(
          "View once",
          "Processando mídia..."
        )
      )

      const buffer =
        await downloadMedia(
          found.media,
          found.type
        )

      if (!buffer?.length) {
        return reply(
          sock,
          msg,
          errorBox(
            "Falha ao baixar",
            "Não consegui ler essa mídia."
          )
        )
      }

      if (found.type === "image") {
        return sock.sendMessage(
          ctx.from,
          {
            image: buffer,
            mimetype: found.mimetype,
            caption: buildCaption(ctx)
          },
          {
            quoted: msg
          }
        )
      }

      if (found.type === "video") {
        return sock.sendMessage(
          ctx.from,
          {
            video: buffer,
            mimetype: found.mimetype,
            caption: buildCaption(ctx)
          },
          {
            quoted: msg
          }
        )
      }

      if (found.type === "audio") {
        return sock.sendMessage(
          ctx.from,
          {
            audio: buffer,
            mimetype: found.mimetype,
            ptt: false
          },
          {
            quoted: msg
          }
        )
      }
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao revelar",
          "Essa mídia não pôde ser processada."
        )
      )
    }
  }
}