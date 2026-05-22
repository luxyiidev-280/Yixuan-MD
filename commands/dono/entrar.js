//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Entrar em Grupo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  isOwner
} from "#system/admin.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function extractInviteCode(text = "") {
  const value =
    clean(text)

  if (!value)
    return ""

  const patterns = [
    /chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i,
    /whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i
  ]

  for (const pattern of patterns) {
    const match =
      value.match(pattern)

    if (match?.[1])
      return match[1]
  }

  if (/^[A-Za-z0-9_-]{15,}$/i.test(value))
    return value

  return ""
}

export default {
  name: "entrar",

  aliases: [
    "join",
    "entrargp",
    "joingp"
  ],

  category: "dono",

  description:
    "Faz o bot entrar em um grupo pelo link de convite.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const query =
      clean(
        ctx.query ||
        args.join(" ")
      )

    const code =
      extractInviteCode(query)

    if (!code) {
      return reply(
        sock,
        msg,
        errorBox(
          "Link necessário",
          `Use: ${ctx.prefix}entrar https://chat.whatsapp.com/SEU_LINK`
        )
      )
    }

    try {
      const groupJid =
        await sock.groupAcceptInvite(
          code
        )

      return reply(
        sock,
        msg,
        successBox(
          "Grupo acessado",
          `Entrei no grupo com sucesso. JID: ${groupJid}`
        )
      )
    } catch (error) {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao entrar",
          "Link inválido, expirado, grupo cheio ou WhatsApp recusou o convite."
        )
      )
    }
  }
}