//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Canvas: Dado
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import { Canvas } from "skia-canvas"
import { drawBaseBackground, drawRoundRect, drawFooter } from "./canvasUtils.js"

function drawDie(ctx, x, y, size, value) {
  drawRoundRect(ctx, x, y, size, size, 34, "#f8f4df", "rgba(216,180,90,0.95)", 5)
  const dots = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.23], [0.72, 0.23], [0.28, 0.5], [0.72, 0.5], [0.28, 0.77], [0.72, 0.77]]
  }
  ctx.fillStyle = "#101010"
  for (const [dx, dy] of dots[value] || dots[1]) {
    ctx.beginPath()
    ctx.arc(x + size * dx, y + size * dy, size * 0.07, 0, Math.PI * 2)
    ctx.fill()
  }
}

export async function createDadoCanvas(data = {}) {
  const canvas = new Canvas(900, 520)
  const ctx = canvas.getContext("2d")
  const rawValue = Number(data.value ?? data.result ?? 1)
  const sides = Math.max(2, Math.min(1000, Number(data.sides || 6)))
  const value = Math.max(1, Math.min(6, rawValue))

  drawBaseBackground(ctx, 900, 520)
  drawRoundRect(ctx, 45, 45, 810, 400, 34, "rgba(0,0,0,0.46)", "rgba(216,180,90,0.75)", 3)

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 48px sans-serif"
  ctx.fillText("DADO LANÇADO", 90, 120)

  ctx.fillStyle = "rgba(255,255,255,0.70)"
  ctx.font = "28px sans-serif"
  ctx.fillText(`O dado caiu em ${rawValue}/${sides}.`, 92, 165)

  drawDie(ctx, 325, 205, 190, value)

  ctx.fillStyle = "#d8b45a"
  ctx.font = "bold 34px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(`Resultado: ${rawValue}/${sides}`, 420, 440)
  ctx.textAlign = "left"

  drawFooter(ctx, data.footer || "Yixuan-MD • Auric Core", 65, 490)
  return await canvas.toBuffer("png")
}
