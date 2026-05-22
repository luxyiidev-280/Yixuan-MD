//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Promover
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
  name: "promover",

  aliases: [
    "addadm",
    "daradm"
  ],

  category: "admins",

  description:
    "Promove um membro a administrador.",

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

    const alreadyAdmin =
      await isAdmin(sock, ctx.from, target)

    if (alreadyAdmin) {
      return sock.sendMessage(
        ctx.from,
        {
          text: errorBox(
            "Ação desnecessária",
            "Esse membro já é administrador."
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
        "promote"
      )

      return sock.sendMessage(
        ctx.from,
        {
          text: successBox(
            "Membro promovido",
            `${tag(target)} agora é administrador.`
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
            "Falha ao promover",
            "Não consegui promover esse membro."
          )
        },
        {
          quoted: msg
        }
      )
    }
  }
}