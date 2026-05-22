//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Sticker Seguro / Rápido
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  downloadContentFromMessage
} from "baileys"

import {
  Sticker
} from "wa-sticker-formatter"

import {
  bot
} from "#system/config.js"

import {
  reply,
  errorBox,
  infoBox
} from "#system/reply.js"

const MAX_IMAGE_MB =
  8

const MAX_VIDEO_MB =
  18

const MAX_VIDEO_SECONDS =
  10

const DOWNLOAD_TIMEOUT_MS =
  25000

function clean(value = "") {
  return String(value || "")
    .trim()
}

function mbToBytes(value = 0) {
  return Number(value || 0) * 1024 * 1024
}

function getFileLength(media = {}) {
  try {
    return Number(
      media.fileLength ||
      media.fileLengthLow ||
      media.fileLengthHigh ||
      0
    )
  } catch {
    return 0
  }
}

function unwrapMessage(message = {}) {
  let current =
    message || {}

  for (let i = 0; i < 6; i++) {
    if (current?.ephemeralMessage?.message) {
      current =
        current.ephemeralMessage.message
      continue
    }

    if (current?.viewOnceMessage?.message) {
      current =
        current.viewOnceMessage.message
      continue
    }

    if (current?.viewOnceMessageV2?.message) {
      current =
        current.viewOnceMessageV2.message
      continue
    }

    if (current?.viewOnceMessageV2Extension?.message) {
      current =
        current.viewOnceMessageV2Extension.message
      continue
    }

    if (current?.documentWithCaptionMessage?.message) {
      current =
        current.documentWithCaptionMessage.message
      continue
    }

    break
  }

  return current || {}
}

function getQuotedMessage(ctx = {}, msg = {}) {
  return (
    ctx?.quoted?.message ||
    ctx?.quoted?.raw?.message ||
    msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    msg?.message?.imageMessage?.contextInfo?.quotedMessage ||
    msg?.message?.videoMessage?.contextInfo?.quotedMessage ||
    {}
  )
}

function findMedia(message = {}) {
  const unwrapped =
    unwrapMessage(message)

  if (unwrapped.imageMessage) {
    return {
      type: "image",
      media:
        unwrapped.imageMessage
    }
  }

  if (unwrapped.videoMessage) {
    return {
      type: "video",
      media:
        unwrapped.videoMessage
    }
  }

  return null
}

function getMedia(ctx = {}, msg = {}) {
  const quoted =
    getQuotedMessage(
      ctx,
      msg
    )

  const current =
    msg?.message || {}

  return (
    findMedia(quoted) ||
    findMedia(current)
  )
}

function validMime(type = "", media = {}) {
  const mimetype =
    clean(media.mimetype)
      .toLowerCase()

  if (!mimetype)
    return true

  if (type === "image")
    return mimetype.startsWith("image/")

  if (type === "video")
    return mimetype.startsWith("video/")

  return false
}

function validateMedia(type = "", media = {}) {
  if (!validMime(type, media)) {
    return {
      ok: false,
      reason:
        "Tipo de mídia inválido."
    }
  }

  const fileLength =
    getFileLength(media)

  if (type === "image") {
    const maxBytes =
      mbToBytes(MAX_IMAGE_MB)

    if (
      fileLength > 0 &&
      fileLength > maxBytes
    ) {
      return {
        ok: false,
        reason:
          `Imagem muito pesada. Limite: ${MAX_IMAGE_MB}MB.`
      }
    }

    return {
      ok: true,
      maxBytes
    }
  }

  if (type === "video") {
    const seconds =
      Number(media.seconds || 0)

    const maxBytes =
      mbToBytes(MAX_VIDEO_MB)

    if (seconds > MAX_VIDEO_SECONDS) {
      return {
        ok: false,
        reason:
          `Vídeo muito longo. Limite: ${MAX_VIDEO_SECONDS} segundos.`
      }
    }

    if (
      fileLength > 0 &&
      fileLength > maxBytes
    ) {
      return {
        ok: false,
        reason:
          `Vídeo muito pesado. Limite: ${MAX_VIDEO_MB}MB.`
      }
    }

    return {
      ok: true,
      maxBytes
    }
  }

  return {
    ok: false,
    reason:
      "Mídia não suportada."
  }
}

function userName(ctx = {}) {
  const name =
    clean(
      ctx.pushName ||
      ctx.senderName ||
      ctx.sender?.split("@")?.[0] ||
      "Usuário"
    )

  return name.length > 28
    ? name.slice(0, 25) + "..."
    : name
}

function stickerOptions(ctx = {}) {
  return {
    pack:
      `${bot.name} • Auric Core`,

    author:
      [
        `Solicitado por: ${userName(ctx)}`,
        "Sistema: Sticker Engine",
        `Core: ${bot.core || "Auric Core"}`
      ].join("\n"),

    type:
      "full",

    quality:
      85
  }
}

async function withTimeout(promise, ms = DOWNLOAD_TIMEOUT_MS) {
  let timer =
    null

  const timeout =
    new Promise((_, reject) => {
      timer =
        setTimeout(
          () => reject(
            new Error("Tempo limite excedido")
          ),
          ms
        )

      timer.unref?.()
    })

  try {
    return await Promise.race([
      promise,
      timeout
    ])
  } finally {
    if (timer)
      clearTimeout(timer)
  }
}

async function collectStream(stream, maxBytes = 0) {
  const chunks =
    []

  let total =
    0

  for await (const chunk of stream) {
    total +=
      chunk.length

    if (
      maxBytes > 0 &&
      total > maxBytes
    ) {
      throw new Error(
        "Mídia excedeu o limite permitido"
      )
    }

    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

async function downloadMedia(media = {}, type = "image", maxBytes = 0) {
  const stream =
    await downloadContentFromMessage(
      media,
      type
    )

  return withTimeout(
    collectStream(
      stream,
      maxBytes
    ),
    DOWNLOAD_TIMEOUT_MS
  )
}

async function createStickerBuffer(buffer, ctx = {}) {
  const sticker =
    new Sticker(
      buffer,
      stickerOptions(ctx)
    )

  return sticker.toBuffer()
}

function fireAndForget(promise) {
  Promise.resolve(promise)
    .catch(() => {})
}

export default {
  name: "sticker",

  aliases: [
    "s",
    "fig",
    "figurinha"
  ],

  category:
    "members",

  description:
    "Transforma imagem ou vídeo curto em figurinha.",

  cooldown:
    700,

  async run(sock, msg, args, ctx) {
    const mediaData =
      getMedia(
        ctx,
        msg
      )

    if (!mediaData) {
      return reply(
        sock,
        msg,
        errorBox(
          "Mídia necessária",
          `Envie ou responda uma imagem/vídeo usando ${ctx.prefix}sticker`
        )
      )
    }

    const {
      type,
      media
    } = mediaData

    const validation =
      validateMedia(
        type,
        media
      )

    if (!validation.ok) {
      return reply(
        sock,
        msg,
        errorBox(
          "Mídia recusada",
          validation.reason
        )
      )
    }

    try {
      // Não espera essa mensagem. Ela vai em paralelo.
      fireAndForget(
        reply(
          sock,
          msg,
          infoBox(
            "Sticker Engine",
            "Convertendo mídia..."
          )
        )
      )

      // Fluxo principal direto: baixar → converter → enviar.
      const buffer =
        await downloadMedia(
          media,
          type,
          validation.maxBytes
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

      const stickerBuffer =
        await createStickerBuffer(
          buffer,
          ctx
        )

      if (!stickerBuffer?.length) {
        return reply(
          sock,
          msg,
          errorBox(
            "Falha ao converter",
            "A figurinha não pôde ser gerada."
          )
        )
      }

      return sock.sendMessage(
        ctx.from,
        {
          sticker:
            stickerBuffer
        },
        {
          quoted:
            msg
        }
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao criar sticker",
          "A mídia não pôde ser convertida com segurança."
        )
      )
    }
  }
}