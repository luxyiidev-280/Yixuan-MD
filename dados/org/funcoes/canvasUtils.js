//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Utilitários de Canvas
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"

import {
  Image
} from "skia-canvas"

export function safeText(text = "", limit = 32) {
  const value =
    String(text ?? "")
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/\s+/g, " ")
      .trim()

  if (!value)
    return "desconhecido"

  return value.length > limit
    ? `${value.slice(0, Math.max(1, limit - 3))}...`
    : value
}

export function drawRoundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius = 24,
  fill = "rgba(0,0,0,0.45)",
  stroke = null,
  lineWidth = 2
) {
  const r =
    Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

export function drawBaseBackground(ctx, width = 900, height = 520, mode = "default") {
  const gradient =
    ctx.createLinearGradient(0, 0, width, height)

  if (mode === "red") {
    gradient.addColorStop(0, "#140506")
    gradient.addColorStop(0.55, "#271010")
    gradient.addColorStop(1, "#5b1116")
  } else {
    gradient.addColorStop(0, "#071317")
    gradient.addColorStop(0.55, "#102820")
    gradient.addColorStop(1, "#3b2c10")
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = mode === "red" ? "#ff1717" : "#d8b45a"
  ctx.beginPath()
  ctx.arc(width * 0.82, height * 0.18, width * 0.18, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.12
  ctx.fillStyle = "#54d6a0"
  ctx.beginPath()
  ctx.arc(width * 0.12, height * 0.88, width * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawFooter(ctx, text = "Yixuan-MD • Auric Core", x = 60, y = 480) {
  ctx.fillStyle = "rgba(255,255,255,0.62)"
  ctx.font = "italic 24px sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(safeText(text, 44), x, y)
}

export async function loadImageSafe(source = null, fallback = "") {
  try {
    let buffer = null

    if (Buffer.isBuffer(source)) {
      buffer = source
    } else if (typeof source === "string" && source && fs.existsSync(source)) {
      buffer = fs.readFileSync(source)
    } else if (fallback && fs.existsSync(fallback)) {
      buffer = fs.readFileSync(fallback)
    }

    if (!buffer)
      return null

    const image =
      new Image()

    image.src = buffer

    return image
  } catch {
    return null
  }
}

export function circleImage(ctx, image, x, y, size) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(image, x, y, size, size)
  ctx.restore()
}
