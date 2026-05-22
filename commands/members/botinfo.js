//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Botinfo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import os from "os"

import {
  bot,
  runtime
} from "#system/config.js"

import {
  hour,
  date,
  uptime,
  startedAt
} from "#system/clock.js"

import {
  getOptimizerStatus
} from "#system/optimizer.js"

import {
  getConnectionStatus
} from "../../connection.js"

import {
  createBotinfoCanvas
} from "../../dados/org/funcoes/botinfoCanvas.js"

import {
  title,
  field,
  footer,
  compact
} from "#system/ui.js"

function mb(value = 0) {
  return `${Math.round(value)} MB`
}

function buildText(ctx = {}) {
  const opt =
    getOptimizerStatus()

  const conn =
    getConnectionStatus()

  const memory =
    opt.memory || {}

  const cpu =
    opt.cpu || {}

  return compact([
    title("Informações do bot", "☯️"),
    field("Nome", bot.name, "📜"),
    field("Core", bot.core, "🪷"),
    field("Prefixo", bot.prefix, "🌤️"),
    field("Versão", bot.version, "📦"),
    field("Node", runtime.node, "🟩"),
    field("Plataforma", `${runtime.platform}/${runtime.arch}`, "💻"),
    field("Ambiente", conn.environment || "desconhecido", "🌐"),
    field("QR", conn.qrMode || "desconhecido", "📲"),
    field("Conectado", conn.connected ? "sim" : "não", "🔌"),
    field("Comandos", ctx.commands?.size || 0, "📜"),
    field("Aliases", ctx.aliases?.size || 0, "🪶"),
    field("Uptime", uptime(), "⏱️"),
    field("Iniciado", startedAt(), "📅"),
    field("Horário", hour(), "🌤️"),
    field("Data", date(), "📅"),
    field("RAM sistema", `${memory.systemRamPercent || 0}%`, "📊"),
    field(
      "Heap",
      `${memory.heapUsedMB || 0} / ${memory.heapTotalMB || 0} MB`,
      "📦"
    ),
    field("RSS", mb(memory.rssMB || 0), "🪷"),
    field("Event-loop", `${opt.eventLoopLagMs || 0}ms`, "🧠"),
    field(
      "CPU cores",
      cpu.cores || os.cpus()?.length || 1,
      "⚙️"
    ),
    field("Load", cpu.load1 || 0, "📈"),
    "",
    footer(bot.footer)
  ])
}

export default {
  name: "infobot",

  aliases: [
    "botinfot",
    "status",
    "info"
  ],

  category: "members",

  description:
    "Mostra informações gerais da Yixuan-MD.",

  async run(sock, msg, args, ctx) {
    const opt =
      getOptimizerStatus()

    const conn =
      getConnectionStatus()

    const memory =
      opt.memory || {}

    const cpu =
      opt.cpu || {}

    const image =
      await createBotinfoCanvas({
        name: bot.name,
        core: bot.core,
        version: bot.version,
        prefix: bot.prefix,
        uptime: uptime(),
        commands:
          ctx.commands?.size || 0,
        aliases:
          ctx.aliases?.size || 0,
        connected:
          conn.connected,
        environment:
          conn.environment || "desconhecido",
        qrMode:
          conn.qrMode || "desconhecido",
        ram:
          `${memory.systemRamPercent || 0}%`,
        heap:
          `${memory.heapUsedMB || 0}/${memory.heapTotalMB || 0}MB`,
        rss:
          mb(memory.rssMB || 0),
        eventLoop:
          `${opt.eventLoopLagMs || 0}ms`,
        cpu:
          cpu.load1 || 0,
        footer:
          bot.footer.replace(/^_+|_+$/g, "")
      })

    return sock.sendMessage(
      ctx.from,
      {
        image,
        caption: buildText(ctx)
      },
      {
        quoted: msg
      }
    )
  }
}