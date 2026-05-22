//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Advertência
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
  addWarn,
  clearWarn
} from "#system/warnings.js"

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

function reasonText(args = []) {
  const copy =
    [...args]

  copy.shift()

  return copy.join(" ").trim() || "Advertência manual"
}

export default {
  name: "adv",

  aliases: [
    "advertir",
    "warn"
  ],

  category: "admins",

  description:
    "Aplica uma advertência em um membro.",

  groupOnly: true,
  adminOnly: true,
  botAdmin: true,

  async run(sock, msg, args, ctx) {
    if (!await checkAdmin(sock, msg, ctx))
      return

    const target =
      getTarget(ctx)

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
          "Não posso advertir meu dono."
        )
      )
    }

    const targetAdmin =
      await isAdmin(sock, ctx.from, target)

    if (targetAdmin) {
      return reply(
        sock,
        msg,
        errorBox(
          "Ação bloqueada",
          "Não posso advertir outro administrador."
        )
      )
    }

    const reason =
      reasonText(args)

    const warns =
      addWarn(
        ctx.from,
        target,
        reason
      )

    if (warns >= 2) {
      if (!await checkBotAdmin(sock, msg, ctx))
        return

      try {
        await sock.groupParticipantsUpdate(
          ctx.from,
          [target],
          "remove"
        )

        clearWarn(
          ctx.from,
          target
        )

        return sock.sendMessage(
          ctx.from,
          {
            text: successBox(
              "Membro removido",
              `${tag(target)} atingiu 2/2 advertências.`
            ),
            mentions: [target]
          },
          {
            quoted: msg
          }
        )
      } catch {
        return reply(
          sock,
          msg,
          errorBox(
            "Falha ao remover",
            "Advertência aplicada, mas não consegui remover."
          )
        )
      }
    }

    return sock.sendMessage(
      ctx.from,
      {
        text: successBox(
          "Advertência aplicada",
          `${tag(target)} recebeu advertência ${warns}/2. Motivo: ${reason}`
        ),
        mentions: [target]
      },
      {
        quoted: msg
      }
    )
  }
}