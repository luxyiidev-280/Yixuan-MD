//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Deletar Mensagem
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin
} from "#system/admin.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

function getContextInfo(msg = {}) {
  const message =
    msg.message || {}

  return (
    message.extendedTextMessage?.contextInfo ||
    message.imageMessage?.contextInfo ||
    message.videoMessage?.contextInfo ||
    message.documentMessage?.contextInfo ||
    message.audioMessage?.contextInfo ||
    message.stickerMessage?.contextInfo ||
    message.buttonsResponseMessage?.contextInfo ||
    message.listResponseMessage?.contextInfo ||
    message.templateButtonReplyMessage?.contextInfo ||
    {}
  )
}

function getQuotedKey(msg = {}, ctx = {}) {
  if (ctx.quoted?.key?.id) {
    return {
      remoteJid:
        ctx.from,

      fromMe:
        Boolean(ctx.quoted.key.fromMe),

      id:
        ctx.quoted.key.id,

      participant:
        ctx.quoted.key.participant ||
        ctx.quoted.participant ||
        undefined
    }
  }

  const info =
    getContextInfo(msg)

  const stanzaId =
    info?.stanzaId ||
    ctx.quoted?.id ||
    ""

  const participant =
    info?.participant ||
    ctx.quoted?.participant ||
    ""

  if (!stanzaId)
    return null

  return {
    remoteJid:
      ctx.from,

    fromMe:
      false,

    id:
      stanzaId,

    participant:
      participant || undefined
  }
}

export default {
  name: "d",

  aliases: [
    "del",
    "delete",
    "apagar",
    "deletar"
  ],

  category:
    "admins",

  description:
    "Apaga uma mensagem respondida.",

  groupOnly:
    true,

  adminOnly:
    true,

  botAdmin:
    true,

  cooldown:
    300,

  async run(sock, msg, args, ctx) {
    const admin =
      await checkAdmin(
        sock,
        msg,
        ctx
      )

    if (!admin)
      return

    const botAdmin =
      await checkBotAdmin(
        sock,
        msg,
        ctx
      )

    if (!botAdmin)
      return

    const quotedKey =
      getQuotedKey(
        msg,
        ctx
      )

    if (!quotedKey) {
      return reply(
        sock,
        msg,
        errorBox(
          "Mensagem necessária",
          "Responda uma mensagem para deletar."
        )
      )
    }

    try {
      await sock.sendMessage(
        ctx.from,
        {
          delete:
            quotedKey
        }
      )

      return true
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao deletar",
          "Não consegui apagar essa mensagem."
        )
      )
    }
  }
}