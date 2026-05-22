//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Rebaixar
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
  errorBox,
  successBox
} from "#system/reply.js"

export default {
  name: "rebaixar",

  aliases: [
    "tiraradm",
    "deladm"
  ],

  category: "admins",

  description:
    "Remove o cargo de administrador de um membro.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    if (!await checkBotAdmin(sock, msg, ctx))
      return

    const target =
      getTarget(ctx)

    if (!target || target === ctx.sender) {
      return sock.sendMessage(
        ctx.from,
        {
          text: errorBox(
            "Alvo inválido",
            "Marque, responda ou envie o número de alguém."
          )
        },
        {
          quoted: msg
        }
      )
    }

    if (isOwner(target)) {
      return sock.sendMessage(
        ctx.from,
        {
          text: errorBox(
            "Ação bloqueada",
            "Não posso rebaixar meu dono."
          )
        },
        {
          quoted: msg
        }
      )
    }

    const targetIsAdmin =
      await isAdmin(sock, ctx.from, target)

    if (!targetIsAdmin) {
      return sock.sendMessage(
        ctx.from,
        {
          text: errorBox(
            "Ação desnecessária",
            "Esse membro não é administrador."
          )
        },
        {
          quoted: msg
        }
      )
    }

    try {
      await sock.groupParticipantsUpdate(
        ctx.from,
        [target],
        "demote"
      )

      return sock.sendMessage(
        ctx.from,
        {
          text: successBox(
            "Administrador rebaixado",
            `${tag(target)} não é mais administrador.`
          ),
          mentions: [target]
        },
        {
          quoted: msg
        }
      )
    } catch {
      return sock.sendMessage(
        ctx.from,
        {
          text: errorBox(
            "Falha ao rebaixar",
            "Não consegui rebaixar esse membro."
          )
        },
        {
          quoted: msg
        }
      )
    }
  }
}