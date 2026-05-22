//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Ban
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  checkAdmin,
  checkBotAdmin,
  getTarget,
  isOwner,
  isAdmin,
  tag
} from "#system/admin.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

import {
  createBanCanvas
} from "../../dados/org/funcoes/banCanvas.js"

function getQuotedDeleteKey(msg = {}, ctx = {}) {
  const quoted =
    ctx.quoted || {}

  const quotedId =
    quoted.id ||
    ctx.contextInfo?.stanzaId ||
    msg.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    ""

  const participant =
    quoted.participant ||
    quoted.sender ||
    ctx.contextInfo?.participant ||
    msg.message?.extendedTextMessage?.contextInfo?.participant ||
    ""

  if (!quotedId)
    return null

  return {
    remoteJid:
      ctx.from,

    fromMe:
      false,

    id:
      quotedId,

    participant
  }
}

async function deleteQuotedMessage(sock, msg = {}, ctx = {}) {
  const key =
    getQuotedDeleteKey(
      msg,
      ctx
    )

  if (!key)
    return false

  try {
    await sock.sendMessage(
      ctx.from,
      {
        delete:
          key
      }
    )

    return true
  } catch {
    return false
  }
}

export default {
  name:
    "ban",

  aliases: [
    "kick",
    "banir",
    "remover"
  ],

  category:
    "admins",

  description:
    "Remove um membro do grupo.",

  groupOnly:
    true,

  adminOnly:
    true,

  botAdmin:
    true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    const target =
      getTarget(
        ctx,
        msg,
        args
      )

    if (!target || target === ctx.sender) {
      return reply(
        sock,
        msg,
        errorBox(
          "Alvo inválido",
          "Marque, responda ou envie o número de alguém."
        )
      )
    }

    if (isOwner(target)) {
      return reply(
        sock,
        msg,
        errorBox(
          "Ação bloqueada",
          "Não posso remover meu dono."
        )
      )
    }

    const targetIsAdmin =
      await isAdmin(
        sock,
        ctx.from,
        target
      )

    if (targetIsAdmin) {
      return reply(
        sock,
        msg,
        errorBox(
          "Ação bloqueada",
          "Não posso remover outro administrador."
        )
      )
    }

    try {
      await deleteQuotedMessage(
        sock,
        msg,
        ctx
      )

      await sock.groupParticipantsUpdate(
        ctx.from,
        [
          target
        ],
        "remove"
      )

      try {
        const image =
          await createBanCanvas({
            user:
              tag(target),

            reason:
              "regras quebradas"
          })

        return sock.sendMessage(
          ctx.from,
          {
            image,
            caption:
              [
                "〔 ☠️ *_Banido_* 〕",
                `〔 👤 _${tag(target)}_ 〕`,
                "〔 🔴 _Motivo: regras quebradas_ 〕"
              ].join("\n"),

            mentions: [
              target
            ]
          },
          {
            quoted:
              msg
          }
        )
      } catch {
        return sock.sendMessage(
          ctx.from,
          {
            text:
              successBox(
                "Banido",
                `${tag(target)} foi removido. Motivo: regras quebradas.`
              ),

            mentions: [
              target
            ]
          },
          {
            quoted:
              msg
          }
        )
      }
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao remover",
          "Não consegui remover esse membro."
        )
      )
    }
  }
}