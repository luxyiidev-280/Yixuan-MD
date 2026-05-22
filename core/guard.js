//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Guard Global / Público
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "#system/config.js"

import {
  logger
} from "#system/logger.js"

import {
  reply,
  errorBox,
  warnBox
} from "#system/reply.js"

import {
  isOwner
} from "#system/admin.js"

import {
  isMaintenance,
  isUserBlocked,
  isUserBanned
} from "#system/state.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function getFrom(msg = {}, read = {}) {
  return (
    read.from ||
    read.chat ||
    msg?.key?.remoteJid ||
    ""
  )
}

function getSender(msg = {}, read = {}) {
  return (
    read.sender ||
    msg?.key?.participant ||
    msg?.key?.remoteJid ||
    ""
  )
}

function shouldSilentlyIgnoreBasic(msg = {}, read = {}) {
  if (!msg?.message)
    return true

  if (read?.isStatus)
    return true

  if (read?.fromMe)
    return true

  if (!read?.body)
    return true

  if (!read?.isCmd)
    return true

  if (!read?.command)
    return true

  return false
}

export async function guardCommand(sock, msg, read = {}) {
  if (shouldSilentlyIgnoreBasic(msg, read))
    return false

  const from =
    getFrom(msg, read)

  const sender =
    getSender(msg, read)

  const owner =
    isOwner(sender) ||
    isOwner(read.identity || {})

  // Dono passa sempre.
  if (owner)
    return true

  // Usuário bloqueado globalmente fica silencioso.
  if (isUserBlocked(sender))
    return false

  if (isUserBanned(sender)) {
    await reply(
      sock,
      msg,
      errorBox(
        "Usuário bloqueado",
        "Você não pode usar comandos."
      ),
      {
        jid: from
      }
    )

    return false
  }

  if (isMaintenance()) {
    // Em manutenção, não fica respondendo todo mundo igual bot carente.
    return false
  }

  // Modo público oficial:
  // Não bloqueia grupo por lista de liberados.
  // Não exige o dono liberar o grupo.
  // Não bloqueia privado por PRIVATE_MODE.
  return true
}

export function shouldProcessMessage(msg = {}, read = {}) {
  if (shouldSilentlyIgnoreBasic(msg, read))
    return false

  return true
}

export async function guardConnectionEvent(event = "") {
  const name =
    clean(event)

  if (!name)
    return false

  logger.system(
    `Evento: ${name}`
  )

  return true
}

export async function notifyMaintenance(sock, msg, read = {}) {
  const from =
    getFrom(msg, read)

  if (!from)
    return false

  await reply(
    sock,
    msg,
    warnBox(
      "Manutenção",
      "O sistema está temporariamente em manutenção."
    ),
    {
      jid: from
    }
  )

  return true
}

export function getGuardStatus() {
  return {
    privateMode:
      false,

    publicMode:
      true,

    maintenance:
      isMaintenance(),

    prefix:
      bot.prefix
  }
}
