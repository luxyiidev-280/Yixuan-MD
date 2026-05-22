//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Logger Auric Core
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot,
  paths
} from "./config.js"

import {
  hour,
  date
} from "./clock.js"

import {
  appendText,
  ensureDir
} from "./files.js"

const c =
  bot.theme.colors

function paint(color, text) {
  return `${color}${text}${c.reset}`
}

function cleanText(text = "", limit = 140) {
  const value =
    String(text || "")
      .replace(/\n/g, "\\n")
      .replace(/\s+/g, " ")
      .trim()

  if (!value)
    return "vazio"

  if (value.length <= limit)
    return value

  return value.slice(0, limit) + "..."
}

function safe(value = "", fallback = "vazio") {
  const text =
    String(value || "").trim()

  return text || fallback
}

function write(file, content) {
  try {
    ensureDir(paths.logs)

    appendText(
      file,
      content + "\n"
    )
  } catch {}
}

function top(title) {
  return paint(
    c.jade,
    "╭─"
  ) + paint(
    c.auric,
    `〔 ${title} 〕`
  )
}

function middle() {
  return paint(c.jade, "│")
}

function bottom(footer = bot.core) {
  return paint(
    c.jade,
    "╰─"
  ) + paint(
    c.sky,
    `〔 ${footer} 〕`
  )
}

function line(label, value, valueColor = c.white) {
  return paint(
    c.jade,
    "├ "
  ) + paint(
    c.auric,
    `〔 ${label}: `
  ) + paint(
    valueColor,
    `${value}`
  ) + paint(
    c.auric,
    " 〕"
  )
}

function box(title, lines = [], footer = bot.core) {
  const output = [
    top(title),
    middle(),
    ...lines,
    middle(),
    bottom(footer)
  ]

  console.log(
    output.join("\n")
  )
}

function logLine(type, text) {
  return `[${date()} ${hour()}] ${type} | ${text}`
}

export const logger = {
  system(text = "") {
    const content =
      cleanText(text)

    box(
      "☯️ YIXUAN-MD | SYSTEM",
      [
        line("Hora", hour(), c.sky),
        line("Sistema", content, c.white)
      ]
    )

    write(
      paths.logFile,
      logLine("SYSTEM", content)
    )
  },

  connect(text = "") {
    const content =
      cleanText(text)

    box(
      "🌤️ YIXUAN-MD | CONNECTION",
      [
        line("Hora", hour(), c.sky),
        line("Status", content, c.green)
      ],
      "Conexão Universal"
    )

    write(
      paths.logFile,
      logLine("CONNECT", content)
    )
  },

  message({
    body = "",
    sender = "",
    groupName = "",
    isGroup = false
  } = {}) {
    const message =
      cleanText(body)

    const user =
      safe(sender, "desconhecido")

    const place =
      isGroup
        ? safe(groupName, "grupo desconhecido")
        : ""

    box(
      "☯️ YIXUAN-MD | MESSAGE",
      [
        line("Hora", hour(), c.sky),
        line("Mensagem", message, c.white),
        line("User", user, c.white),
        line("Grupo/PV", place, c.white)
      ]
    )

    write(
      paths.logFile,
      logLine(
        "MESSAGE",
        `${user} | ${isGroup ? place : "PV"} | ${message}`
      )
    )
  },

  command({
    command = "",
    args = [],
    sender = "",
    pushName = "",
    groupName = "",
    isGroup = false
  } = {}) {
    const argText =
      Array.isArray(args) && args.length
        ? cleanText(args.join(" "))
        : "vazio"

    const place =
      isGroup
        ? safe(groupName, "grupo desconhecido")
        : ""

    box(
      "📜 YIXUAN-MD | COMMAND",
      [
        line("Hora", hour(), c.sky),
        line("Comando", safe(command, "desconhecido"), c.green),
        line("Args", argText, c.white),
        line("User", safe(pushName, "sem nome"), c.white),
        line("JID", safe(sender, "desconhecido"), c.white),
        line("Grupo/PV", place, c.white)
      ],
      "Status: OK"
    )

    write(
      paths.logFile,
      logLine(
        "COMMAND",
        `${command} | ${sender} | ${isGroup ? place : "PV"}`
      )
    )
  },

  commandError({
    command = "",
    filePath = "",
    error = ""
  } = {}) {
    const err =
      cleanText(
        error?.stack || error?.message || error,
        260
      )

    box(
      "❌️ YIXUAN-MD | COMMAND ERROR",
      [
        line("Hora", hour(), c.sky),
        line("Comando", safe(command, "desconhecido"), c.yellow),
        line("Path", safe(filePath, "desconhecido"), c.white),
        line("Erro", err, c.red)
      ],
      "Ação: comando ignorado"
    )

    write(
      paths.commandErrorLog,
      logLine(
        "COMMAND_ERROR",
        `${command} | ${filePath} | ${err}`
      )
    )
  },

  loader({
    success = 0,
    failed = 0
  } = {}) {
    box(
      "📦 YIXUAN-MD | COMMAND HEALTH",
      [
        line("Commands true", success, c.green),
        line(
          "Commands false",
          failed,
          failed > 0 ? c.red : c.green
        )
      ],
      "Auric Core"
    )

    write(
      paths.logFile,
      logLine(
        "LOADER",
        `Commands true: ${success} | Commands false: ${failed}`
      )
    )
  },

  warn(text = "") {
    const content =
      cleanText(text)

    box(
      "⚠️ YIXUAN-MD | WARN",
      [
        line("Hora", hour(), c.sky),
        line("Aviso", content, c.yellow)
      ],
      "Auric Core"
    )

    write(
      paths.logFile,
      logLine("WARN", content)
    )
  },

  error(scope = "ERROR", error = "") {
    const err =
      cleanText(
        error?.stack || error?.message || error,
        320
      )

    box(
      "❌️ YIXUAN-MD | ERROR",
      [
        line("Hora", hour(), c.sky),
        line("Escopo", scope, c.yellow),
        line("Erro", err, c.red)
      ],
      "Auric Core"
    )

    write(
      paths.logFile,
      logLine(
        "ERROR",
        `${scope} | ${err}`
      )
    )
  }
}