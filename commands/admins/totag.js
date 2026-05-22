//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Totag
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  downloadContentFromMessage
} from "baileys"

import {
  checkAdmin,
  getMetadata
} from "#system/admin.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function participantJid(participant = {}) {
  return (
    participant.id ||
    participant.jid ||
    participant.lid ||
    participant.phoneNumber ||
    participant.phoneNumberJid ||
    ""
  )
}

function getQuoted(ctx = {}) {
  return ctx.quoted || null
}

async function downloadMedia(message = {}, type = "") {
  const stream =
    await downloadContentFromMessage(
      message,
      type
    )

  const chunks =
    []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

async function sendQuotedMedia(sock, ctx, quoted, mentions) {
  const message =
    quoted.message || {}

  if (quoted.type === "imageMessage") {
    const image =
      await downloadMedia(
        message.imageMessage || message,
        "image"
      )

    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption:
          clean(quoted.body || quoted.text || ""),
        mentions
      }
    )
  }

  if (quoted.type === "videoMessage") {
    const video =
      await downloadMedia(
        message.videoMessage || message,
        "video"
      )

    return sock.sendMessage(
      ctx.from,
      {
        video,
        caption:
          clean(quoted.body || quoted.text || ""),
        mentions
      }
    )
  }

  if (quoted.type === "documentMessage") {
    const doc =
      await downloadMedia(
        message.documentMessage || message,
        "document"
      )

    return sock.sendMessage(
      ctx.from,
      {
        document: doc,
        fileName:
          message.documentMessage?.fileName ||
          "arquivo",
        mimetype:
          message.documentMessage?.mimetype ||
          "application/octet-stream",
        caption:
          clean(quoted.body || quoted.text || ""),
        mentions
      }
    )
  }

  return null
}

export default {
  name: "totag",

  aliases: [
    "totagall",
    "totodos",
    "reposttag"
  ],

  category: "admins",

  description:
    "Reenvia a mensagem respondida marcando todos invisivelmente.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const quoted =
      getQuoted(ctx)

    if (!quoted) {
      return reply(
        sock,
        msg,
        errorBox(
          "Mensagem necessária",
          "Responda uma mensagem para marcar todos."
        )
      )
    }

    const metadata =
      await getMetadata(sock, ctx.from)

    const mentions =
      (metadata?.participants || [])
        .map(participantJid)
        .filter(Boolean)

    if (!mentions.length) {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao marcar",
          "Não consegui carregar os membros."
        )
      )
    }

    const text =
      clean(
        quoted.body ||
        quoted.text ||
        args.join(" ")
      )

    try {
      const mediaSent =
        await sendQuotedMedia(
          sock,
          ctx,
          quoted,
          mentions
        )

      if (mediaSent)
        return mediaSent
    } catch {}

    if (!text) {
      return reply(
        sock,
        msg,
        errorBox(
          "Conteúdo inválido",
          "A mensagem respondida não pôde ser reenviada."
        )
      )
    }

    return sock.sendMessage(
      ctx.from,
      {
        text,
        mentions
      }
    )
  }
}