//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Perfil com Foto
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  getUser
} from "#system/state.js"

import {
  getTarget,
  number,
  tag
} from "#system/admin.js"

import {
  compact,
  title,
  field,
  footer
} from "#system/ui.js"

import {
  createProfileCanvas
} from "../../dados/org/funcoes/profileCanvas.js"

function percent(id = "", salt = 1) {
  const text =
    String(id) + String(salt)

  let hash =
    0

  for (let i = 0; i < text.length; i++) {
    hash =
      (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  return hash % 101
}

async function getUserPhoto(sock, jid = "") {
  try {
    const url =
      await sock.profilePictureUrl(
        jid,
        "image"
      )

    if (!url)
      return null

    const response =
      await fetch(url)

    if (!response.ok)
      return null

    return Buffer.from(
      await response.arrayBuffer()
    )
  } catch {
    return null
  }
}

export default {
  name: "perfil",

  aliases: [
    "profile",
    "me"
  ],

  category: "members",

  description:
    "Mostra o perfil do usuário com foto quando disponível.",

  async run(sock, msg, args, ctx) {
    const target =
      getTarget(ctx) || ctx.sender

    const id =
      number(target)

    const [avatar, user] =
      await Promise.all([
        getUserPhoto(sock, target),
        Promise.resolve(getUser(target))
      ])

    const image =
      await createProfileCanvas({
        avatar,
        name:
          user?.name || tag(target),
        number:
          id || "desconhecido",
        messages:
          user?.stats?.messages || 0,
        commands:
          user?.stats?.commands || 0,
        premium:
          user?.premium,
        banned:
          user?.banned,
        footer:
          bot.footer.replace(/^_+|_+$/g, "")
      })

    const text =
      compact([
        title("Perfil", "👤"),
        field("Usuário", tag(target), "☯️"),
        field("Número", id || "indefinido", "📱"),
        field("Mensagens", user?.stats?.messages || 0, "💬"),
        field("Comandos", user?.stats?.commands || 0, "⚡"),
        field("Premium", user?.premium ? "sim" : "não", "💠"),
        field("Banido", user?.banned ? "sim" : "não", "🚫"),
        field("Aura", `${percent(target, 3)}%`, "🔮"),
        field("Sorte", `${percent(target, 11)}%`, "🍀"),
        "",
        footer(bot.footer)
      ])

    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption: text,
        mentions: [target]
      },
      {
        quoted: msg
      }
    )
  }
}