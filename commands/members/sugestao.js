//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Sugestão
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  reply,
  successBox,
  errorBox
} from "#system/reply.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function onlyNumbers(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
}

function getOwnerNumber() {
  const numbers =
    bot.owner?.numbers || []

  const first =
    Array.isArray(numbers)
      ? numbers[0]
      : numbers

  return onlyNumbers(first)
}

function getOwnerJid() {
  const number =
    getOwnerNumber()

  if (!number)
    return ""

  return `${number}@s.whatsapp.net`
}

function senderNumber(ctx = {}) {
  return clean(ctx.sender)
    .split("@")[0]
    .split(":")[0]
}

function getSuggestion(args = [], ctx = {}) {
  return clean(
    ctx.query ||
    args.join(" ")
  )
}

function buildOwnerMessage(ctx = {}, suggestion = "") {
  return compact([
    title("Nova sugestão", "💡"),
    field("Bot", bot.name, "☯️"),
    field("Usuário", ctx.pushName || "Desconhecido", "👤"),
    field("Número", senderNumber(ctx), "📱"),
    field(
      "Origem",
      ctx.isGroup
        ? ctx.groupName || "Grupo"
        : "Privado",
      "🌐"
    ),
    "",
    "〔 📜 *_Sugestão_* 〕",
    `〔 _${suggestion}_ 〕`,
    "",
    footer(bot.footer)
  ])
}

export default {
  name: "sugestao",

  aliases: [
    "sugestão",
    "sugerir",
    "ideia",
    "sugetao"
  ],

  category: "members",

  description:
    "Envia uma sugestão diretamente ao dono do bot.",

  cooldown:
    3000,

  async run(sock, msg, args, ctx) {
    const suggestion =
      getSuggestion(
        args,
        ctx
      )

    if (!suggestion) {
      return reply(
        sock,
        msg,
        errorBox(
          "Sugestão vazia",
          `Use: ${ctx.prefix}sugestao sua ideia aqui`
        )
      )
    }

    if (suggestion.length < 6) {
      return reply(
        sock,
        msg,
        errorBox(
          "Sugestão curta",
          "Escreva uma ideia um pouco mais clara."
        )
      )
    }

    if (suggestion.length > 800) {
      return reply(
        sock,
        msg,
        errorBox(
          "Sugestão longa",
          "Envie uma sugestão com até 800 caracteres."
        )
      )
    }

    const ownerJid =
      getOwnerJid()

    if (!ownerJid) {
      return reply(
        sock,
        msg,
        errorBox(
          "Dono não configurado",
          "Número do dono não foi encontrado no config."
        )
      )
    }

    try {
      await sock.sendMessage(
        ownerJid,
        {
          text:
            buildOwnerMessage(
              ctx,
              suggestion
            )
        }
      )

      return reply(
        sock,
        msg,
        successBox(
          "Sugestão enviada",
          "Sua ideia foi enviada ao dono do bot."
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha ao enviar",
          "Não consegui enviar a sugestão ao dono."
        )
      )
    }
  }
}