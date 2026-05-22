//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Respostas Formatadas
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

const EMPTY_LINE =
  "_〔             〕_"

function cleanLine(line = "") {
  return String(line || "")
    .trim()
}

function cleanText(text = "") {
  return String(text || "")
    .trim()
}

export function boxLines(lines = [], options = {}) {
  const minLines =
    Number(options.minLines || 0)

  const autoClose =
    options.autoClose === true

  const output =
    lines
      .map(cleanLine)
      .filter(Boolean)

  if (autoClose && minLines > 0) {
    while (output.length < minLines) {
      output.push(EMPTY_LINE)
    }
  }

  return output.join("\n")
}

export function errorBox(title = "Erro", subtitle = "") {
  return boxLines([
    `〔 ❌️ *_${cleanText(title)}_* 〕`,
    subtitle ? `〔 ❔️ _${cleanText(subtitle)}_ 〕` : ""
  ])
}

export function warnBox(title = "Aviso", subtitle = "") {
  return boxLines([
    `〔 ⚠️ *_${cleanText(title)}_* 〕`,
    subtitle ? `〔 ❔️ _${cleanText(subtitle)}_ 〕` : ""
  ])
}

export function successBox(title = "Sucesso", subtitle = "") {
  return boxLines([
    `〔 ✅️ *_${cleanText(title)}_* 〕`,
    subtitle ? `〔 ☯️ _${cleanText(subtitle)}_ 〕` : ""
  ])
}

export function infoBox(title = "Informação", subtitle = "") {
  return boxLines([
    `〔 📜 *_${cleanText(title)}_* 〕`,
    subtitle ? `〔 ☯️ _${cleanText(subtitle)}_ 〕` : ""
  ])
}

export function unknownCommandBox(suggestions = []) {
  const validSuggestions =
    Array.isArray(suggestions)
      ? suggestions
          .map(cleanText)
          .filter(Boolean)
          .slice(0, 3)
      : []

  if (!validSuggestions.length) {
    return boxLines([
      "〔 ❌️ *_Comando inexistente_* 〕",
      "〔 ❔️ _Nenhuma sugestão encontrada._ 〕"
    ])
  }

  const lines = [
    "〔 ❌️ *_Comando inexistente_* 〕",
    "〔 ❔️ _Talvez seja:_  〕"
  ]

  for (const suggestion of validSuggestions) {
    lines.push(
      `〔 _${suggestion}_ 〕`
    )
  }

  return boxLines(lines)
}

export async function reply(sock, msg, text, options = {}) {
  const jid =
    options.jid ||
    msg?.key?.remoteJid

  if (!jid)
    return null

  return sock.sendMessage(
    jid,
    {
      text
    },
    {
      quoted:
        options.quoted === false
          ? undefined
          : msg
    }
  )
}