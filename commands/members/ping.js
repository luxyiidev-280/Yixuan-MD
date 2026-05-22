//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Comando: Ping
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import os from "os"
import { performance } from "perf_hooks"

import {
  bot,
  runtime
} from "#system/config.js"

import {
  hour,
  date,
  uptime
} from "#system/clock.js"

import {
  field,
  footer,
  compact,
  title,
  text
} from "#system/ui.js"

import {
  createPingCanvas
} from "../../dados/org/funcoes/pingCanvas.js"

function formatMemory(bytes = 0) {
  return `${Math.round(bytes / 1024 / 1024)} MB`
}

function getMemoryInfo() {
  const memory =
    process.memoryUsage()

  return {
    rss:
      formatMemory(memory.rss),

    heap:
      `${formatMemory(memory.heapUsed)} / ${formatMemory(memory.heapTotal)}`
  }
}

async function measureEventLoop() {
  const start =
    performance.now()

  await new Promise(resolve =>
    setImmediate(resolve)
  )

  return Math.max(
    0,
    performance.now() - start
  )
}

function getUserName(ctx = {}) {
  return (
    ctx.pushName ||
    ctx.sender?.split("@")?.[0] ||
    "Desconhecido"
  )
}

function buildPingText({
  latency = 0,
  eventLoop = 0,
  totalCommands = 0
} = {}) {
  const memory =
    getMemoryInfo()

  const load =
    os.loadavg?.()[0] || 0

  return compact([
    title(`${bot.name}`, "☯️"),
    text("Pong recebido com sucesso.", "📡"),
    "",
    field("Latência", `${latency.toFixed(2)}ms`, "⚡"),
    field("Event-loop", `${eventLoop.toFixed(2)}ms`, "🧠"),
    field("Uptime", uptime(), "⏱️"),
    field("Horário", hour(), "🌤️"),
    field("Data", date(), "📅"),
    field("RAM", memory.heap, "📦"),
    field("RSS", memory.rss, "🪷"),
    field("Load", load.toFixed(2), "📊"),
    field("Node", runtime.node, "🟩"),
    field("Comandos", totalCommands, "📜"),
    "",
    footer(bot.footer)
  ])
}

function buildCaption({
  latency = 0,
  eventLoop = 0,
  totalCommands = 0
} = {}) {
  return compact([
    title("Ping", "☯️"),
    field("Latência", `${latency.toFixed(2)}ms`, "⚡"),
    field("Event-loop", `${eventLoop.toFixed(2)}ms`, "🧠"),
    field("Comandos", totalCommands, "📜"),
    "",
    footer(bot.footer)
  ])
}

export default {
  name: "ping",

  aliases: [
    "velocidade",
    "latencia"
  ],

  category: "members",

  description:
    "Mostra a velocidade e o status leve da Yixuan-MD.",

  async run(sock, msg, args, ctx) {
    const start =
      performance.now()

    const eventLoop =
      await measureEventLoop()

    const latency =
      performance.now() - start

    const totalCommands =
      ctx.commands?.size || 0

    const canvasData = {
      latency:
        latency.toFixed(2),

      eventLoop:
        eventLoop.toFixed(2),

      uptime:
        uptime(),

      commands:
        totalCommands,

      user:
        getUserName(ctx)
    }

    try {
      const image =
        await createPingCanvas(canvasData)

      if (image) {
        return sock.sendMessage(
          ctx.from,
          {
            image,
            caption:
              buildCaption({
                latency,
                eventLoop,
                totalCommands
              })
          },
          {
            quoted: msg
          }
        )
      }
    } catch (error) {
      // Se o canvas falhar, não mata o comando.
      // Cai para texto, porque o bot não é de vidro.
    }

    return sock.sendMessage(
      ctx.from,
      {
        text:
          buildPingText({
            latency,
            eventLoop,
            totalCommands
          })
      },
      {
        quoted: msg
      }
    )
  }
}