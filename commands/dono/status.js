//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Status do Sistema
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import os from "os"

import {
  isOwner
} from "#system/admin.js"

import {
  bot
} from "#system/config.js"

import {
  getConnectionStatus
} from "../../connection.js"

import {
  getOptimizerStatus
} from "#system/optimizer.js"

function mb(bytes = 0) {
  return `${Math.round(bytes / 1024 / 1024)} MB`
}

export default {
  name: "status",

  aliases: [
    "sistema",
    "runtime"
  ],

  category: "dono",

  description: "Mostra o status interno do bot.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    const memory =
      process.memoryUsage()

    const connection =
      getConnectionStatus()

    const optimizer =
      getOptimizerStatus()

    const text = [
      "〔 ☯️ *_Status do Sistema_* 〕",
      `〔 🪷 _Bot: ${bot.name}_ 〕`,
      `〔 ⚙️ _Ambiente: ${connection.environment}_ 〕`,
      `〔 🔌 _Conectado: ${connection.connected ? "sim" : "não"}_ 〕`,
      `〔 ♻️ _Reconexões: ${connection.reconnectAttempts}/${connection.reconnectLimit}_ 〕`,
      `〔 📜 _Comandos: ${connection.commands}_ 〕`,
      `〔 🔗 _Aliases: ${connection.aliases}_ 〕`,
      `〔 📦 _Heap: ${mb(memory.heapUsed)} / ${mb(memory.heapTotal)}_ 〕`,
      `〔 🧠 _RSS: ${mb(memory.rss)}_ 〕`,
      `〔 📊 _Load: ${os.loadavg()[0].toFixed(2)}_ 〕`,
      `〔 ⚡ _Optimizer: ${optimizer.active ? "ativo" : "parado"}_ 〕`,
      "",
      bot.footer
    ].join("\n")

    return sock.sendMessage(
      ctx.from,
      {
        text
      },
      {
        quoted: msg
      }
    )
  }
}
