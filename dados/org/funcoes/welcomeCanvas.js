//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Welcome Canvas
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"

import {
  Canvas,
  Image
} from "skia-canvas"

const WELCOME_BG =
  "./media/menu/welcome.png"

const EMPTY_USER =
  "./media/menu/user_sem_foto.png"

function exists(file = "") {
  return fs.existsSync(file)
}

function sanitizeText(text = "", limit = 24) {
  const value =
    String(text || "Desconhecido")
      .normalize("NFKC")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s._\-@]/gu, "")
      .replace(/\s+/g, " ")
      .trim()

  if (!value)
    return "Desconhecido"

  return value.length > limit
    ? value.slice(0, limit - 3) + "..."
    : value
}

function safeUserName(text = "") {
  return sanitizeText(
    text,
    24
  )
}

function safeGroupName(text = "") {
  return sanitizeText(
    text,
    22
  )
}

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

function circleImage(ctx, img, x, y, size) {
  ctx.save()

  ctx.beginPath()
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  )
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(
    img,
    x,
    y,
    size,
    size
  )

  ctx.restore()
}

async function loadImageSafe(source, fallback = EMPTY_USER) {
  const img =
    new Image()

  try {
    if (Buffer.isBuffer(source)) {
      img.src =
        source

      return img
    }

    if (
      typeof source === "string" &&
      exists(source)
    ) {
      img.src =
        fs.readFileSync(source)

      return img
    }

    if (
      fallback &&
      exists(fallback)
    ) {
      img.src =
        fs.readFileSync(fallback)

      return img
    }
  } catch {}

  return null
}

export async function createWelcomeCanvas(data = {}) {
  const canvas =
    new Canvas(1200, 675)

  const ctx =
    canvas.getContext("2d")

  const bg =
    await loadImageSafe(
      WELCOME_BG,
      ""
    )

  if (bg) {
    ctx.drawImage(
      bg,
      0,
      0,
      1200,
      675
    )
  } else {
    const grad =
      ctx.createLinearGradient(
        0,
        0,
        1200,
        675
      )

    grad.addColorStop(0, "#06172a")
    grad.addColorStop(0.6, "#102f56")
    grad.addColorStop(1, "#07111f")

    ctx.fillStyle =
      grad

    ctx.fillRect(
      0,
      0,
      1200,
      675
    )
  }

  // Overlay para legibilidade.
  ctx.fillStyle =
    "rgba(0, 14, 32, 0.50)"

  ctx.fillRect(
    0,
    0,
    1200,
    675
  )

  // Card principal.
  roundRect(
    ctx,
    78,
    82,
    1044,
    510,
    38
  )

  ctx.fillStyle =
    "rgba(5, 18, 38, 0.56)"

  ctx.fill()

  ctx.strokeStyle =
    "rgba(162, 225, 255, 0.78)"

  ctx.lineWidth =
    3

  ctx.stroke()

  // Brilho lateral.
  ctx.globalAlpha =
    0.28

  ctx.fillStyle =
    "#9ee8ff"

  ctx.beginPath()
  ctx.arc(
    245,
    335,
    210,
    0,
    Math.PI * 2
  )
  ctx.fill()

  ctx.globalAlpha =
    1

  // Avatar.
  const avatar =
    await loadImageSafe(
      data.avatar,
      EMPTY_USER
    )

  if (avatar) {
    circleImage(
      ctx,
      avatar,
      135,
      190,
      255
    )

    ctx.beginPath()
    ctx.arc(
      262.5,
      317.5,
      135,
      0,
      Math.PI * 2
    )

    ctx.strokeStyle =
      "rgba(210, 245, 255, 0.95)"

    ctx.lineWidth =
      7

    ctx.stroke()

    ctx.beginPath()
    ctx.arc(
      262.5,
      317.5,
      146,
      0,
      Math.PI * 2
    )

    ctx.strokeStyle =
      "rgba(91, 194, 255, 0.55)"

    ctx.lineWidth =
      4

    ctx.stroke()
  }

  // Textos principais.
  ctx.textAlign =
    "left"

  ctx.fillStyle =
    "#ffffff"

  ctx.font =
    "bold 58px sans-serif"

  ctx.fillText(
    "BEM-VINDO(A)",
    500,
    205
  )

  ctx.fillStyle =
    "#9ee8ff"

  ctx.font =
    "bold 38px sans-serif"

  ctx.fillText(
  safeUserName(
    data.userName || "Novo membro"
  ),
  500,
  270
)

  ctx.fillStyle =
    "rgba(255,255,255,0.84)"

  ctx.font =
    "26px sans-serif"

  ctx.fillText(
    "Uma nova presença atravessou o horizonte.",
    500,
    322
  )

  // Informações.
  const rows = [
  [
    "Grupo",
    safeGroupName(
      data.groupName || "Grupo"
    )
  ],

  [
    "Horário",
    data.time || "--:--"
  ],

  [
    "Sistema",
    "Auric Core"
  ]
]

let y =
  372

for (const [label, value] of rows) {
  ctx.fillStyle =
    "rgba(158,232,255,0.95)"

  ctx.font =
    "bold 24px sans-serif"

  ctx.fillText(
    `${label}:`,
    500,
    y
  )

  ctx.fillStyle =
    "#ffffff"

  ctx.font =
    "24px sans-serif"

  ctx.fillText(
    value,
    620,
    y
  )

  y += 40
}

  // Rodapé.
  ctx.fillStyle =
    "rgba(255,255,255,0.80)"

  ctx.font =
    "bold 24px sans-serif"

  ctx.fillText(
    "Yixuan-MD • Auric Core",
    82,
    632
  )

  return await canvas.toBuffer("png")
}