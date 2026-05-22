//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Canvas: Ban
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import { Canvas } from "skia-canvas"
import { drawBaseBackground, drawRoundRect, safeText } from "./canvasUtils.js"

export async function createBanCanvas(data = {}) {
  const canvas = new Canvas(1200, 675)
  const ctx = canvas.getContext("2d")

  drawBaseBackground(ctx, 1200, 675, "red")

  ctx.fillStyle = "rgba(255,0,0,0.28)"
  ctx.fillRect(0, 0, 18, 675)
  ctx.fillRect(1182, 0, 18, 675)

  ctx.fillStyle = "rgba(255,255,255,0.05)"
  ctx.font = "bold 190px sans-serif"
  ctx.fillText("☠", 875, 405)

  drawRoundRect(ctx, 65, 60, 1070, 535, 32, "rgba(0,0,0,0.30)")

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 72px sans-serif"
  ctx.textAlign = "left"
  ctx.fillText("☠ BANIDO", 95, 165)

  ctx.fillStyle = "rgba(255,255,255,0.70)"
  ctx.font = "36px sans-serif"
  ctx.fillText(`${safeText(data.target || "@usuário", 42)} foi removido do grupo.`, 95, 280)

  ctx.fillStyle = "#ff1717"
  ctx.font = "bold 50px sans-serif"
  ctx.fillText("Motivo: regras quebradas", 95, 400)

  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "italic 32px sans-serif"
  ctx.fillText("Relatório Administrativo", 95, 565)

  return await canvas.toBuffer("png")
}
