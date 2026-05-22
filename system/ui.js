//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// UI Inteligente / Menus / Linhas
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  bot
} from "./config.js"

function clean(value = "") {
  return String(value || "")
    .trim()
}

function stripFooter(value = "") {
  return clean(value)
    .replace(/^_+|_+$/g, "")
}

export function line(text = "") {
  const value =
    clean(text)

  if (!value)
    return ""

  return `〔 ${value} 〕`
}

export function title(text = "", icon = "☯️") {
  return line(
    `${icon} *_${clean(text)}_*`
  )
}

export function text(value = "", icon = "📜") {
  return line(
    `${icon} _${clean(value)}_`
  )
}

export function field(label = "", value = "", icon = "📜") {
  return line(
    `${icon} _${clean(label)}: ${clean(value)}_`
  )
}

export function section(text = "", icon = "📜") {
  return line(
    `${icon} *_${clean(text)}_*`
  )
}

export function command(prefix = "!", name = "", aliases = [], icon = "☯️") {
  const firstAlias =
    Array.isArray(aliases) && aliases.length
      ? clean(aliases[0])
      : ""

  const aliasText =
    firstAlias
      ? ` _(${firstAlias})_`
      : ""

  return line(
    `${icon} _${prefix}${clean(name)}_${aliasText}`
  )
}

export function footer(value = bot.footer, icon = "🖋️") {
  return line(
    `${icon} _${stripFooter(value)}_`
  )
}

export function space() {
  return ""
}

export function compact(lines = []) {
  return lines
    .map(item => String(item ?? ""))
    .filter((line, index, array) => {
      if (line !== "")
        return true

      const previous =
        array[index - 1]

      const next =
        array[index + 1]

      return Boolean(previous && next)
    })
    .join("\n")
}

export function wrapTextInsideBox(textValue = "", max = 52) {
  const value =
    clean(textValue)

  if (!value)
    return []

  if (value.length <= max)
    return [
      line(value)
    ]

  const words =
    value.split(/\s+/)

  const output =
    []

  let current =
    ""

  for (const word of words) {
    const test =
      current
        ? `${current} ${word}`
        : word

    if (test.length > max) {
      if (current) {
        output.push(
          line(current)
        )

        current =
          word
      } else {
        output.push(
          line(word.slice(0, max))
        )

        current =
          word.slice(max)
      }

      continue
    }

    current =
      test
  }

  if (current) {
    output.push(
      line(current)
    )
  }

  return output
}

export function menuBlock({
  header = [],
  sections = [],
  footerText = bot.footer
} = {}) {
  const lines =
    []

  for (const item of header) {
    if (item)
      lines.push(item)
  }

  for (const sec of sections) {
    if (!sec?.title)
      continue

    const items =
      Array.isArray(sec.items)
        ? sec.items.filter(Boolean)
        : []

    if (!items.length)
      continue

    lines.push(
      section(sec.title, sec.icon || "📜")
    )

    lines.push(
      space()
    )

    lines.push(
      ...items
    )

    lines.push(
      space()
    )
  }

  lines.push(
    footer(footerText)
  )

  return compact(lines)
}