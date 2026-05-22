//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Ping Canvas Leve
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"

import {
  Canvas,
  Image
} from "skia-canvas"

const BOT_PHOTO =
  "./media/menu/foto_bot.png"

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function safeText(text = "", limit = 24) {
  const value =
    String(text || "Desconhecido")
      .trim()

  return value.length > limit
    ? value.slice(0, limit - 3) + "..."
    : value
}

export async function createPingCanvas(data = {}) {

  const canvas =
    new Canvas(900, 420)

  const ctx =
    canvas.getContext("2d")

  // fundo
  const bg =
    ctx.createLinearGradient(0, 0, 900, 420)

  bg.addColorStop(0, "#071317")
  bg.addColorStop(0.55, "#102820")
  bg.addColorStop(1, "#3b2c10")

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 900, 420)

  // brilho
  ctx.globalAlpha = 0.18
  ctx.fillStyle = "#d8b45a"
  ctx.beginPath()
  ctx.arc(720, 80, 180, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.14
  ctx.fillStyle = "#54d6a0"
  ctx.beginPath()
  ctx.arc(120, 350, 220, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 1

  // card
  roundRect(ctx, 38, 38, 824, 344, 34)
  ctx.fillStyle = "rgba(255,255,255,0.065)"
  ctx.fill()

  ctx.strokeStyle = "rgba(216,180,90,0.85)"
  ctx.lineWidth = 3
  ctx.stroke()

  // foto
  roundRect(ctx, 72, 92, 210, 210, 34)
  ctx.fillStyle = "rgba(84,214,160,0.12)"
  ctx.fill()

  if (fs.existsSync(BOT_PHOTO)) {
    try {
      const img =
        new Image()

      img.src =
        fs.readFileSync(BOT_PHOTO)

      ctx.save()
      roundRect(ctx, 72, 92, 210, 210, 34)
      ctx.clip()
      ctx.drawImage(img, 72, 92, 210, 210)
      ctx.restore()
    } catch {}
  } else {
    ctx.fillStyle = "#d8b45a"
    ctx.font = "bold 74px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("☯️", 177, 220)
  }

  ctx.strokeStyle = "rgba(84,214,160,0.9)"
  ctx.lineWidth = 4
  roundRect(ctx, 72, 92, 210, 210, 34)
  ctx.stroke()

  // textos
  ctx.textAlign = "left"

  ctx.fillStyle = "#f7f0d5"
  ctx.font = "bold 42px sans-serif"
  ctx.fillText("Yixuan-MD", 320, 110)

  ctx.fillStyle = "#d8b45a"
  ctx.font = "24px sans-serif"
  ctx.fillText("Auric Core • Ping Status", 322, 148)

  const rows = [
    ["Latência", `${data.latency || "0.00"}ms`],
    ["Event-loop", `${data.eventLoop || "0.00"}ms`],
    ["Uptime", data.uptime || "0s"],
    ["Comandos", String(data.commands || 0)],
    ["Usuário", safeText(data.user || "Luxyii")]
  ]

  let y = 200

  for (const [label, value] of rows) {
    ctx.fillStyle = "rgba(255,255,255,0.72)"
    ctx.font = "22px sans-serif"
    ctx.fillText(label, 324, y)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 25px sans-serif"
    ctx.fillText(value, 500, y)

    y += 38
  }

  // rodapé
  ctx.fillStyle = "rgba(216,180,90,0.95)"
  ctx.font = "bold 20px sans-serif"
  ctx.fillText("Yixuan-MD • Auric", 72, 346)

  return await canvas.toBuffer("png")
}