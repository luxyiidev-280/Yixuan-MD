//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Leitor Seguro de Mensagens
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "./config.js"

import {
  syncIdentityFromMessage,
  resolveIdentity,
  normalizePn,
  normalizeLid,
  isLid,
  isPn
} from "./identity.js"

function cleanText(value = "") {
  return String(value || "")
    .replace(/\u200e/g, "")
    .replace(/\u200f/g, "")
    .replace(/\u202a/g, "")
    .replace(/\u202b/g, "")
    .replace(/\u202c/g, "")
    .replace(/\u202d/g, "")
    .replace(/\u202e/g, "")
    .trim()
}

function firstValid(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      return String(value).trim()
    }
  }

  return ""
}

function unwrapMessage(message = {}) {
  let current =
    message || {}

  for (let i = 0; i < 8; i++) {
    if (current?.ephemeralMessage?.message) {
      current =
        current.ephemeralMessage.message
      continue
    }

    if (current?.viewOnceMessage?.message) {
      current =
        current.viewOnceMessage.message
      continue
    }

    if (current?.viewOnceMessageV2?.message) {
      current =
        current.viewOnceMessageV2.message
      continue
    }

    if (current?.viewOnceMessageV2Extension?.message) {
      current =
        current.viewOnceMessageV2Extension.message
      continue
    }

    if (current?.documentWithCaptionMessage?.message) {
      current =
        current.documentWithCaptionMessage.message
      continue
    }

    return current
  }

  return current
}

function getMessageType(message = {}) {
  const msg =
    unwrapMessage(message)

  const keys =
    Object.keys(msg || {})
      .filter(key =>
        key !== "messageContextInfo" &&
        key !== "senderKeyDistributionMessage"
      )

  return keys[0] || ""
}

function getMessageContent(message = {}) {
  const msg =
    unwrapMessage(message)

  const type =
    getMessageType(msg)

  return {
    type,
    content: msg?.[type] || {}
  }
}

function extractBody(message = {}) {
  const msg =
    unwrapMessage(message)

  const {
    type,
    content
  } = getMessageContent(msg)

  if (!type)
    return ""

  if (type === "conversation") {
    return cleanText(content)
  }

  if (type === "extendedTextMessage") {
    return cleanText(
      content?.text
    )
  }

  if (type === "imageMessage") {
    return cleanText(
      content?.caption
    )
  }

  if (type === "videoMessage") {
    return cleanText(
      content?.caption
    )
  }

  if (type === "documentMessage") {
    return cleanText(
      content?.caption ||
      content?.fileName
    )
  }

  if (type === "audioMessage") {
    return ""
  }

  if (type === "stickerMessage") {
    return ""
  }

  if (type === "buttonsResponseMessage") {
    return cleanText(
      content?.selectedButtonId ||
      content?.selectedDisplayText
    )
  }

  if (type === "listResponseMessage") {
    return cleanText(
      content?.singleSelectReply?.selectedRowId ||
      content?.title ||
      content?.description
    )
  }

  if (type === "templateButtonReplyMessage") {
    return cleanText(
      content?.selectedId ||
      content?.selectedDisplayText
    )
  }

  if (type === "interactiveResponseMessage") {
    return extractInteractiveResponse(content)
  }

  if (type === "reactionMessage") {
    return ""
  }

  if (type === "protocolMessage") {
    return ""
  }

  return cleanText(
    content?.text ||
    content?.caption ||
    content?.selectedButtonId ||
    content?.selectedId ||
    ""
  )
}

function extractInteractiveResponse(content = {}) {
  try {
    const native =
      content?.nativeFlowResponseMessage

    if (!native)
      return ""

    if (native?.paramsJson) {
      const json =
        JSON.parse(native.paramsJson)

      return cleanText(
        json?.id ||
        json?.title ||
        json?.display_text ||
        json?.text ||
        ""
      )
    }

    return cleanText(
      native?.name ||
      ""
    )
  } catch {
    return ""
  }
}

function extractMentions(message = {}) {
  const msg =
    unwrapMessage(message)

  const {
    content
  } = getMessageContent(msg)

  const context =
    content?.contextInfo || {}

  return Array.isArray(context.mentionedJid)
    ? context.mentionedJid
    : []
}

function extractQuoted(message = {}) {
  const msg =
    unwrapMessage(message)

  const {
    content
  } = getMessageContent(msg)

  const context =
    content?.contextInfo || {}

  if (!context?.quotedMessage)
    return null

  const quotedMessage =
    unwrapMessage(context.quotedMessage)

  const quotedBody =
    extractBody(quotedMessage)

  const quotedType =
    getMessageType(quotedMessage)

  const participant =
    firstValid(
      context.participant,
      context.remoteJid,
      context.participantAlt
    )

  const identity =
    resolveIdentity({
      participant:
        context.participant,

      participantAlt:
        context.participantAlt,

      remoteJid:
        context.remoteJid
    })

  return {
    id:
      context.stanzaId || "",

    participant,

    sender:
      participant,

    body:
      quotedBody,

    text:
      quotedBody,

    type:
      quotedType,

    message:
      quotedMessage,

    identity
  }
}

function parseCommand(body = "", prefix = bot.prefix) {
  const text =
    cleanText(body)

  if (!text)
    return {
      isCmd: false,
      command: "",
      args: [],
      text: "",
      query: ""
    }

  if (!text.startsWith(prefix)) {
    return {
      isCmd: false,
      command: "",
      args: [],
      text,
      query: ""
    }
  }

  const withoutPrefix =
    text
      .slice(prefix.length)
      .trim()

  // "!" sozinho ou "!   " é ignorado
  if (!withoutPrefix) {
    return {
      isCmd: false,
      command: "",
      args: [],
      text,
      query: ""
    }
  }

  const parts =
    withoutPrefix
      .split(/\s+/)
      .filter(Boolean)

  const command =
    cleanText(parts.shift() || "")
      .toLowerCase()

  if (!command) {
    return {
      isCmd: false,
      command: "",
      args: [],
      text,
      query: ""
    }
  }

  const query =
    parts.join(" ")

  return {
    isCmd: true,
    command,
    args: parts,
    text,
    query
  }
}

function resolveSender(msg = {}) {
  const key =
    msg.key || {}

  const from =
    key.remoteJid || ""

  const isGroup =
    from.endsWith("@g.us")

  const sender =
    firstValid(
      isGroup ? key.participant : "",
      key.participant,
      key.senderLid,
      key.senderPn,
      from
    )

  const participantAlt =
    firstValid(
      key.participantAlt,
      key.senderPn,
      key.senderLid
    )

  return {
    from,
    isGroup,
    sender,
    participantAlt
  }
}

export function readMessage(msg = {}) {
  const key =
    msg.key || {}

  const rawMessage =
    msg.message || {}

  const {
    from,
    isGroup,
    sender,
    participantAlt
  } = resolveSender(msg)

  const body =
    extractBody(rawMessage)

  const parsed =
    parseCommand(
      body,
      bot.prefix
    )

  const type =
    getMessageType(rawMessage)

  const quoted =
    extractQuoted(rawMessage)

  const mentions =
    extractMentions(rawMessage)

  const identity =
    syncIdentityFromMessage(msg)

  const senderIdentity =
    resolveIdentity({
      sender,
      participant:
        key.participant,

      participantAlt:
        key.participantAlt,

      remoteJid:
        key.remoteJid,

      remoteJidAlt:
        key.remoteJidAlt,

      senderLid:
        key.senderLid,

      senderPn:
        key.senderPn
    })

  const read = {
    id:
      key.id || "",

    from,
    chat:
      from,

    sender,
    participant:
      key.participant || "",

    participantAlt,

    pushName:
      msg.pushName || "",

    isGroup,
    isPv:
      !isGroup,

    fromMe:
      Boolean(key.fromMe),

    isStatus:
      from === "status@broadcast",

    type,
    body,

    text:
      parsed.text || body,

    query:
      parsed.query,

    args:
      parsed.args,

    command:
      parsed.command,

    isCmd:
      parsed.isCmd,

    prefix:
      bot.prefix,

    mentions,
    quoted,

    message:
      rawMessage,

    msg,

    identity:
      senderIdentity || identity
  }

  return read
}

export function isCommandMessage(msg = {}) {
  const read =
    readMessage(msg)

  return Boolean(read.isCmd)
}

export function shouldIgnoreMessage(read = {}) {
  if (!read)
    return true

  if (read.isStatus)
    return true

  if (read.fromMe)
    return true

  if (!read.body)
    return true

  if (!read.isCmd)
    return true

  return false
}

export function getTarget(read = {}) {
  if (read.quoted?.participant)
    return read.quoted.participant

  if (read.mentions?.length)
    return read.mentions[0]

  if (read.args?.[0]) {
    const arg =
      String(read.args[0] || "")

    if (isLid(arg))
      return normalizeLid(arg)

    if (isPn(arg))
      return normalizePn(arg)

    const number =
      arg.replace(/\D/g, "")

    if (number.length >= 8)
      return `${number}@s.whatsapp.net`
  }

  return read.sender || ""
}

export function hasMedia(read = {}) {
  return [
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "stickerMessage",
    "documentMessage"
  ].includes(read.type)
}

export function isImage(read = {}) {
  return read.type === "imageMessage"
}

export function isVideo(read = {}) {
  return read.type === "videoMessage"
}

export function isAudio(read = {}) {
  return read.type === "audioMessage"
}

export function isSticker(read = {}) {
  return read.type === "stickerMessage"
}

export function isDocument(read = {}) {
  return read.type === "documentMessage"
}