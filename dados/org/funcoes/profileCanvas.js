//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Canvas: Perfil
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import { Canvas } from "skia-canvas"
import { drawBaseBackground, drawRoundRect, drawFooter, circleImage, loadImageSafe, safeText } from "./canvasUtils.js"

const EMPTY_USER = "./media/menu/user_sem_foto.png"

export async function createProfileCanvas(data = {}) {
  const canvas = new Canvas(1000, 620)
  const ctx = canvas.getContext("2d")

  drawBaseBackground(ctx, 1000, 620)
  drawRoundRect(ctx, 55, 55, 890, 480, 36, "rgba(0,0,0,0.46)", "rgba(216,180,90,0.70)", 3)

  const avatar = await loadImageSafe(data.avatar, EMPTY_USER)
  if (avatar) {
    circleImage(ctx, avatar, 95, 150, 220)
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)"
    ctx.beginPath(); ctx.arc(205, 260, 110, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#d8b45a"
    ctx.font = "bold 80px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("☯️", 205, 285)
    ctx.textAlign = "left"
  }

  ctx.strokeStyle = "rgba(84,214,160,0.95)"
  ctx.lineWidth = 6
  ctx.beginPath(); ctx.arc(205, 260, 114, 0, Math.PI * 2); ctx.stroke()

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 48px sans-serif"
  ctx.fillText("PERFIL", 365, 145)

  ctx.fillStyle = "#d8b45a"
  ctx.font = "bold 34px sans-serif"
  ctx.fillText(safeText(data.name || "Usuário", 28), 365, 198)

  const rows = [
    ["Número", data.number || "desconhecido"],
    ["Mensagens", String(data.messages || 0)],
    ["Comandos", String(data.commands || 0)],
    ["Premium", data.premium ? "sim" : "não"],
    ["Banido", data.banned ? "sim" : "não"]
  ]

  let y = 270
  for (const [label, value] of rows) {
    ctx.fillStyle = "rgba(255,255,255,0.62)"
    ctx.font = "24px sans-serif"
    ctx.fillText(label, 370, y)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 27px sans-serif"
    ctx.fillText(safeText(value, 26), 540, y)
    y += 50
  }

  drawFooter(ctx, data.footer || "Yixuan-MD • Auric Core", 75, 580)
  return await canvas.toBuffer("png")
}
