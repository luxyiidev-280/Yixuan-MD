//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Canvas: Botinfo
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import { Canvas } from "skia-canvas"
import { drawBaseBackground, drawRoundRect, drawFooter, safeText } from "./canvasUtils.js"

export async function createBotinfoCanvas(data = {}) {
  const canvas = new Canvas(1200, 675)
  const ctx = canvas.getContext("2d")

  drawBaseBackground(ctx, 1200, 675)
  drawRoundRect(ctx, 55, 55, 1090, 545, 36, "rgba(0,0,0,0.42)", "rgba(216,180,90,0.75)", 3)

  ctx.fillStyle = "#f8f4df"
  ctx.font = "bold 58px sans-serif"
  ctx.textAlign = "left"
  ctx.fillText("YIXUAN-MD", 95, 135)

  ctx.fillStyle = "#d8b45a"
  ctx.font = "28px sans-serif"
  ctx.fillText("Auric Core • Informações do Sistema", 98, 178)

  const rows = [
    ["Prefixo", data.prefix || "!"],
    ["Versão", data.version || "1.0.0"],
    ["Node", data.node || "Node.js"],
    ["Ambiente", data.environment || "Host"],
    ["Conectado", data.connected ? "Sim" : "Não"],
    ["Comandos", String(data.commands || 0)],
    ["Aliases", String(data.aliases || 0)],
    ["Uptime", data.uptime || "0s"],
    ["RAM", data.ram || "0%"],
    ["Heap", data.heap || "0 MB"],
    ["Event-loop", data.eventLoop || "0ms"],
    ["Load", String(data.load ?? data.cpu ?? 0)]
  ]

  let x = 105
  let y = 245

  rows.forEach((row, index) => {
    const col = index % 2
    const line = Math.floor(index / 2)
    x = col === 0 ? 105 : 635
    y = 245 + line * 58

    ctx.fillStyle = "rgba(255,255,255,0.62)"
    ctx.font = "23px sans-serif"
    ctx.fillText(row[0], x, y)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 26px sans-serif"
    ctx.fillText(safeText(row[1], 22), x + 170, y)
  })

  drawFooter(ctx, data.footer || "Yixuan-MD • Auric Core", 95, 628)
  return await canvas.toBuffer("png")
}

export const createBotInfoCanvas = createBotinfoCanvas
