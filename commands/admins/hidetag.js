//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Hidetag
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

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

function getText(args = [], ctx = {}) {
  const typed =
    clean(args.join(" "))

  if (typed)
    return typed

  const quoted =
    clean(ctx.quoted?.body || ctx.quoted?.text || "")

  if (quoted)
    return quoted

  return ""
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

export default {
  name: "hidetag",

  aliases: [
    "ht",
    "cita",
    "marcarinvisivel"
  ],

  category: "admins",

  description:
    "Envia uma mensagem marcando todos invisivelmente.",

  groupOnly: true,
  adminOnly: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const text =
      getText(args, ctx)

    if (!text) {
      return reply(
        sock,
        msg,
        errorBox(
          "Texto necessário",
          "Digite ou responda uma mensagem."
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

    return sock.sendMessage(
      ctx.from,
      {
        text,
        mentions
      }
    )
  }
}