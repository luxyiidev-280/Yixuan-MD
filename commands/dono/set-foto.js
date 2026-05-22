//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Set Foto
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  downloadContentFromMessage
} from "baileys"

import {
  paths
} from "#system/config.js"

import {
  ensureDir,
  writeBuffer
} from "#system/files.js"

import {
  getBotJid
} from "#system/admin.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

const LOCAL_BOT_PHOTO =
  "./media/menu/foto_bot.png"

function getImageMessage(msg = {}, ctx = {}) {
  const direct =
    msg?.message?.imageMessage

  if (direct) {
    return direct
  }

  const viewOnce =
    msg?.message?.viewOnceMessage?.message?.imageMessage ||
    msg?.message?.viewOnceMessageV2?.message?.imageMessage

  if (viewOnce) {
    return viewOnce
  }

  const quoted =
    ctx?.quoted?.message?.imageMessage

  if (quoted) {
    return quoted
  }

  return null
}

async function downloadImage(imageMessage) {
  const stream =
    await downloadContentFromMessage(
      imageMessage,
      "image"
    )

  const chunks =
    []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

async function updateBotProfile(sock, jid, buffer) {
  try {
    await sock.updateProfilePicture(
      jid,
      buffer
    )

    return true
  } catch {}

  try {
    await sock.updateProfilePicture(
      jid,
      {
        url: LOCAL_BOT_PHOTO
      }
    )

    return true
  } catch {}

  return false
}

export default {
  name: "set-foto",

  aliases: [
    "setfoto",
    "fotobot",
    "perfilbot"
  ],

  category: "dono",

  description:
    "Altera a foto de perfil do bot e salva a imagem local.",

  ownerOnly:
    true,

  async run(sock, msg, args, ctx) {
    const imageMessage =
      getImageMessage(
        msg,
        ctx
      )

    if (!imageMessage) {
      return reply(
        sock,
        msg,
        errorBox(
          "Imagem necessária",
          "Envie ou responda uma imagem com o comando."
        )
      )
    }

    try {
      const buffer =
        await downloadImage(imageMessage)

      if (!buffer?.length) {
        return reply(
          sock,
          msg,
          errorBox(
            "Falha ao baixar",
            "Não consegui ler a imagem enviada."
          )
        )
      }

      ensureDir(
        "./media/menu"
      )

      writeBuffer(
        LOCAL_BOT_PHOTO,
        buffer
      )

      const botJid =
        getBotJid(sock) ||
        sock?.user?.id ||
        ""

      const updated =
        botJid
          ? await updateBotProfile(
              sock,
              botJid,
              buffer
            )
          : false

      if (!updated) {
        return reply(
          sock,
          msg,
          successBox(
            "Foto salva",
            "A imagem local foi atualizada, mas o perfil do WhatsApp não aceitou a troca."
          )
        )
      }

      return reply(
        sock,
        msg,
        successBox(
          "Foto atualizada",
          "Perfil do bot e imagem local foram atualizados."
        )
      )
    } catch (error) {
      return reply(
        sock,
        msg,
        errorBox(
          "Erro ao trocar foto",
          "A imagem não pôde ser processada."
        )
      )
    }
  }
}