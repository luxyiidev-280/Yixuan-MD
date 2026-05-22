//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Conexão Universal Automática
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import path from "path"

import pino from "pino"
import QRCode from "qrcode"
import qrcodeTerminal from "qrcode-terminal"

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "baileys"

import {
  bot,
  paths,
  runtime
} from "#system/config.js"

import {
  ensureDir
} from "#system/files.js"

import {
  logger
} from "#system/logger.js"

import {
  environment
} from "#system/environment.js"

import {
  prepareBoot
} from "#system/bootstrap.js"

import {
  readMessage
} from "#system/reader.js"

import {
  onlineGuard
} from "#system/online.js"

import {
  antiPv3Guard
} from "#system/antipv3.js"

import {
  antiLinkGuard
} from "#system/antilink.js"

import {
  antiSpamGuard
} from "#system/antispam.js"

import {
  antiFloodGuard
} from "#system/antiflood.js"

import {
  antiBotGuard
} from "#system/antibot.js"

import {
  antiTravaGuard
} from "#system/antitrava.js"

import {
  muteGuard
} from "#system/mute.js"

import {
  antiFakeGuard
} from "#system/antifake.js"

import {
  welcomeGuard
} from "#system/welcome.js"

import {
  guardCommand
} from "#core/guard.js"

import {
  routeCommand
} from "#core/router.js"

import {
  flushState
} from "#system/state.js"

let socketInstance =
  null

let reconnecting =
  false

let reconnectAttempts =
  0

let reconnectWindowStarted =
  0

let loadedCommands =
  {
    commands: new Map(),
    aliases: new Map()
  }

let qrPrinted =
  false

let qrTimer =
  null

let bannerShown =
  false

let lastQrText =
  ""

const RECONNECT_LIMIT =
  20

const RECONNECT_WINDOW_MS =
  1000 * 60 * 15

function now() {
  return Date.now()
}

function fit(text = "", size = 28) {
  const value =
    String(text || "")

  if (value.length > size) {
    return value.slice(0, size - 3) + "..."
  }

  return value.padEnd(size, " ")
}

function paint(color = "", text = "") {
  return `${color}${text}${bot.theme.colors.reset}`
}

function line(label = "", value = "", icon = "│") {
  const c =
    bot.theme.colors

  return (
    paint(c.jade, "┃ ") +
    paint(c.white, `${icon} ${fit(label, 10)}`) +
    paint(c.sky, fit(value, 30)) +
    paint(c.jade, " ┃")
  )
}

function connectionBanner() {
  const c =
    bot.theme.colors

  const title =
    "☯️  YIXUAN-MD • CONNECTION CORE"

  const lines = [
    "",
    paint(c.jade, "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮"),
    paint(c.jade, "┃ ") + paint(c.auric, fit(title, 40)) + paint(c.jade, " ┃"),
    paint(c.jade, "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫"),
    line("Core:", bot.core, "☯️"),
    line("Modo:", "Universal / Público", "🌐"),
    line("Ambiente:", environment.name, "⚙️"),
    line("Node:", runtime.node, "🧠"),
    line("Prefixo:", bot.prefix, "⌁"),
    line("Sessão:", paths.session, "🔐"),
    line("QR:", environment.qrMode, "📷"),
    line("Status:", "Inicializando conexão", "⚡"),
    paint(c.jade, "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫"),
    line("Dono:", "configurado no .env", "👑"),
    line("Variáveis:", "OWNER_NUMBERS / OWNER_LIDS", "📜"),
    line("Aviso:", "bot público; grupos liberados", "✅️"),
    paint(c.jade, "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"),
    ""
  ]

  console.log(
    lines.join("\n")
  )
}

function getQrPath() {
  return path.join(
    paths.temp,
    "qrcode.png"
  )
}

async function saveQrImage(qr = "") {
  try {
    const qrPath =
      getQrPath()

    ensureDir(
      path.dirname(qrPath)
    )

    await QRCode.toFile(
      qrPath,
      qr,
      {
        margin: 2,
        width: 500
      }
    )

    return qrPath
  } catch {
    return ""
  }
}

async function handleQr(qr = "") {
  if (!qr)
    return false

  if (qr === lastQrText && qrPrinted)
    return true

  lastQrText =
    qr

  const qrPath =
    await saveQrImage(qr)

  if (environment.shouldPrintTerminalQr) {
    logger.connect(
      "QR recebido, escaneie pelo terminal"
    )

    try {
      qrcodeTerminal.generate(
        qr,
        {
          small: true
        }
      )
    } catch {}
  }

  if (qrPath) {
    logger.system(
      `QR salvo em ${qrPath}`
    )

    if (!environment.shouldPrintTerminalQr) {
      logger.system(
        "Abra ou baixe o arquivo do QR pelo painel/SFTP."
      )
    }

    return true
  }

  logger.warn(
    "QR recebido, mas não foi possível salvar a imagem"
  )

  return false
}

function getDisconnectCode(error = {}) {
  return (
    error?.output?.statusCode ||
    error?.statusCode ||
    error?.data?.statusCode ||
    error?.code ||
    null
  )
}

function shouldReconnect(code) {
  return code !== DisconnectReason.loggedOut
}

function resetReconnectWindowIfNeeded() {
  const current =
    now()

  if (
    !reconnectWindowStarted ||
    current - reconnectWindowStarted > RECONNECT_WINDOW_MS
  ) {
    reconnectWindowStarted =
      current

    reconnectAttempts =
      0
  }
}

function canReconnect() {
  resetReconnectWindowIfNeeded()

  return reconnectAttempts < RECONNECT_LIMIT
}

function reconnectDelay() {
  const base =
    2500

  const max =
    30000

  const attempt =
    Math.max(
      1,
      reconnectAttempts
    )

  return Math.min(
    max,
    Math.round(
      base * Math.pow(1.45, attempt - 1)
    )
  )
}

function cleanSocket(sock) {
  try {
    sock?.ev?.removeAllListeners?.()
  } catch {}

  try {
    sock?.ws?.close?.()
  } catch {}

  try {
    sock?.end?.()
  } catch {}
}

function scheduleReconnect(sock, reason = "unknown") {
  if (reconnecting)
    return

  if (!canReconnect()) {
    logger.error(
      "RECONNECT",
      "Anti-loop ativado. Limite de reconexões atingido em 15 minutos. Verifique internet/sessão e reinicie."
    )

    return
  }

  reconnecting =
    true

  reconnectAttempts++

  const wait =
    reconnectDelay()

  logger.warn(
    `Reconexão #${reconnectAttempts}/${RECONNECT_LIMIT} em ${Math.floor(wait / 1000)}s | ${reason}`
  )

  if (qrTimer) {
    clearTimeout(qrTimer)
    qrTimer = null
  }

  setTimeout(async () => {
    cleanSocket(sock)

    socketInstance =
      null

    reconnecting =
      false

    qrPrinted =
      false

    await startConnection(
      loadedCommands
    )
  }, wait)
}

function updateLoaded(input = {}) {
  loadedCommands = {
    commands:
      input.commands ||
      loadedCommands.commands ||
      new Map(),

    aliases:
      input.aliases ||
      loadedCommands.aliases ||
      new Map()
  }

  return loadedCommands
}

function isStatusMessage(msg = {}) {
  return msg?.key?.remoteJid === "status@broadcast"
}

function isInvalidMessage(msg = {}) {
  return (
    !msg ||
    !msg.key ||
    !msg.message ||
    isStatusMessage(msg)
  )
}

async function runSafetyGuards(sock, msg, read = {}) {
  await onlineGuard(
    sock,
    msg,
    read
  )

  const blockedByMute =
    await muteGuard(
      sock,
      msg,
      read
    )

  if (blockedByMute)
    return false

  const blockedByPv =
    await antiPv3Guard(read)

  if (blockedByPv)
    return false

  const blockedByTrava =
    await antiTravaGuard(
      sock,
      msg,
      read
    )

  if (blockedByTrava)
    return false

  const blockedByFlood =
    await antiFloodGuard(
      sock,
      msg,
      read
    )

  if (blockedByFlood)
    return false

  const blockedBySpam =
    await antiSpamGuard(
      sock,
      msg,
      read
    )

  if (blockedBySpam)
    return false

  const blockedByBot =
    await antiBotGuard(
      sock,
      msg,
      read
    )

  if (blockedByBot)
    return false

  const blockedByLink =
    await antiLinkGuard(
      sock,
      msg,
      read
    )

  if (blockedByLink)
    return false

  return true
}

async function maybeReplyPrefix(sock, msg, read = {}) {
  const body =
    String(read.body || "")
      .trim()
      .toLowerCase()

  if (
    body !== "prefixo" &&
    body !== "prefix"
  ) {
    return false
  }

  await sock.sendMessage(
    read.from,
    {
      text: [
        "〔 🪷 *_Prefixo da Yixuan-MD_* 〕",
        `〔 ☯️ _Meu prefixo atual é: *_${bot.prefix}_* 〕`
      ].join("\n")
    },
    {
      quoted: msg
    }
  )

  return true
}

async function handleMessage(sock, msg = {}) {
  try {
    if (isInvalidMessage(msg))
      return

    const read =
      readMessage(msg)

    const safe =
      await runSafetyGuards(
        sock,
        msg,
        read
      )

    if (!safe)
      return

    const prefixAnswered =
      await maybeReplyPrefix(
        sock,
        msg,
        read
      )

    if (prefixAnswered)
      return

    if (!read.isCmd)
      return

    const allowed =
      await guardCommand(
        sock,
        msg,
        read
      )

    if (!allowed)
      return

    await routeCommand(
      sock,
      msg,
      read,
      loadedCommands
    )
  } catch (error) {
    logger.error(
      "MESSAGE_HANDLER",
      error
    )
  }
}

async function handleMessages(sock, upsert = {}) {
  const messages =
    upsert.messages || []

  if (!messages.length)
    return

  await Promise.allSettled(
    messages.map(msg =>
      handleMessage(sock, msg)
    )
  )
}

async function handleParticipants(sock, update = {}) {
  try {
    await antiFakeGuard(
      sock,
      update
    )

    await welcomeGuard(
      sock,
      update
    )
  } catch (error) {
    logger.error(
      "GROUP_PARTICIPANTS_UPDATE",
      error
    )
  }
}

function bindConnectionEvents(sock, saveCreds) {
  sock.ev.on(
    "creds.update",
    saveCreds
  )

  sock.ev.on(
    "connection.update",
    async update => {
      const {
        connection,
        lastDisconnect,
        qr
      } = update

      if (qr) {
        if (!qrPrinted) {
          qrPrinted =
            true

          await handleQr(qr)
        }

        if (qrTimer) {
          clearTimeout(qrTimer)
        }

        qrTimer =
          setTimeout(() => {
            qrPrinted =
              false
          }, 45000)

        qrTimer.unref?.()
      }

      if (connection === "open") {
        reconnecting =
          false

        reconnectAttempts =
          0

        reconnectWindowStarted =
          now()

        qrPrinted =
          false

        if (qrTimer) {
          clearTimeout(qrTimer)
          qrTimer = null
        }

        logger.connect(
          `${bot.name} conectado com sucesso`
        )

        return
      }

      if (connection === "close") {
        const error =
          lastDisconnect?.error

        const code =
          getDisconnectCode(error)

        logger.warn(
          `Conexão fechada | código: ${code || "unknown"}`
        )

        if (!shouldReconnect(code)) {
          logger.error(
            "CONNECTION",
            "Sessão desconectada. Apague storage/session e conecte novamente."
          )

          return
        }

        scheduleReconnect(
          sock,
          `close:${code || "unknown"}`
        )
      }
    }
  )

  sock.ev.on(
    "messages.upsert",
    async upsert => {
      await handleMessages(
        sock,
        upsert
      )
    }
  )

  sock.ev.on(
    "group-participants.update",
    async update => {
      await handleParticipants(
        sock,
        update
      )
    }
  )
}

async function getBaileysVersionSafe() {
  try {
    const latest =
      await fetchLatestBaileysVersion()

    logger.system(
      `Baileys version: ${latest.version.join(".")}`
    )

    return latest.version
  } catch {
    logger.warn(
      "Não foi possível buscar versão mais recente da Baileys, usando padrão local"
    )

    return undefined
  }
}

async function createSocket(state = {}) {
  const version =
    await getBaileysVersionSafe()

  return makeWASocket({
    ...(version
      ? {
          version
        }
      : {}),

    auth:
      state,

    logger:
      pino({
        level: "silent"
      }),

    browser: [
      bot.name,
      "Chrome",
      bot.version
    ],

    markOnlineOnConnect:
      false,

    syncFullHistory:
      false,

    emitOwnEvents:
      false,

    shouldSyncHistoryMessage:
      () => false,

    getMessage:
      async () => undefined
  })
}

export async function startConnection(inputLoaded = {}) {
  updateLoaded(inputLoaded)

  if (socketInstance && !reconnecting) {
    return socketInstance
  }

  prepareBoot()

  if (!bannerShown) {
    connectionBanner()

    logger.warn(
      "As configurações de dono ficam no arquivo .env"
    )

    bannerShown = true
  }

  logger.system(
    "Iniciando conexão universal automática"
  )

  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(
    paths.session
  )

  const sock =
    await createSocket(state)

  socketInstance =
    sock

  bindConnectionEvents(
    sock,
    saveCreds
  )

  return sock
}

export function getSocket() {
  return socketInstance
}

export async function stopConnection() {
  try {
    flushState()
  } catch {}

  if (qrTimer) {
    clearTimeout(qrTimer)
    qrTimer = null
  }

  if (socketInstance) {
    cleanSocket(socketInstance)
    socketInstance = null
  }

  logger.system(
    "Conexão encerrada"
  )

  return true
}

export function updateCommandRuntime(inputLoaded = {}) {
  return updateLoaded(inputLoaded)
}

export function getConnectionStatus() {
  return {
    connected:
      Boolean(socketInstance),

    reconnecting,

    reconnectAttempts,

    reconnectLimit:
      RECONNECT_LIMIT,

    environment:
      environment.name,

    qrMode:
      environment.qrMode,

    commands:
      loadedCommands.commands?.size || 0,

    aliases:
      loadedCommands.aliases?.size || 0
  }
}
