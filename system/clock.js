//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Relógio BR sem dependência
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import {
  runtime
} from "./config.js"

const TIME_ZONE =
  "America/Sao_Paulo"

function formatDatePart(type = "time") {
  const now =
    new Date()

  if (type === "time") {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    ).format(now)
  }

  if (type === "date") {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        timeZone: TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    ).format(now)
  }

  if (type === "full") {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        timeZone: TIME_ZONE,
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    ).format(now)
  }

  return now.toISOString()
}

function pad(value) {
  return String(value)
    .padStart(2, "0")
}

export function hour() {
  return formatDatePart("time")
}

export function date() {
  return formatDatePart("date")
}

export function fullDate() {
  return formatDatePart("full")
}

export function uptime(seconds = process.uptime()) {
  const total =
    Math.floor(seconds)

  const days =
    Math.floor(total / 86400)

  const hours =
    Math.floor((total % 86400) / 3600)

  const minutes =
    Math.floor((total % 3600) / 60)

  const secs =
    total % 60

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`
  }

  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`
  }

  if (minutes > 0) {
    return `${pad(minutes)}m ${pad(secs)}s`
  }

  return `${pad(secs)}s`
}

export function startedAt() {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }
  ).format(
    new Date(runtime.startedAt)
  )
}

export function timestamp() {
  return Date.now()
}

export function sleep(ms = 1000) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}

export const timezone =
  TIME_ZONE