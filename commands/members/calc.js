//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Calculadora Segura
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  reply,
  errorBox,
  successBox
} from "#system/reply.js"

const ALLOWED =
  /^[0-9+\-*/%().,\s]+$/

function normalize(value = "") {
  return String(value || "")
    .replace(/,/g, ".")
    .trim()
}

function calculate(expression = "") {
  const safe =
    normalize(expression)

  if (!safe)
    throw new Error("Expressão vazia")

  if (!ALLOWED.test(safe))
    throw new Error("Expressão inválida")

  if (safe.length > 120)
    throw new Error("Expressão muito longa")

  const result =
    Function(`"use strict"; return (${safe})`)()

  if (!Number.isFinite(Number(result)))
    throw new Error("Resultado inválido")

  return result
}

export default {
  name:
    "calc",

  aliases: [
    "calcular",
    "conta"
  ],

  category:
    "members",

  description:
    "Calcula uma expressão matemática simples.",

  cooldown:
    800,

  async run(sock, msg, args, ctx) {
    const expression =
      ctx.query ||
      args.join(" ")

    if (!expression) {
      return reply(
        sock,
        msg,
        errorBox(
          "Conta necessária",
          `Use: ${ctx.prefix}calc 10 + 5 * 2`
        )
      )
    }

    try {
      const result =
        calculate(expression)

      return reply(
        sock,
        msg,
        successBox(
          "Resultado",
          `${normalize(expression)} = ${result}`
        )
      )
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Conta inválida",
          "Use apenas números e operadores: + - * / % ( )."
        )
      )
    }
  }
}
