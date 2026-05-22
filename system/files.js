//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Arquivos e JSON Seguro
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"

function dirname(filePath) {
  return path.dirname(filePath)
}

export function exists(targetPath) {
  return fs.existsSync(targetPath)
}

export function ensureDir(dirPath) {
  if (!dirPath)
    return false

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(
      dirPath,
      {
        recursive: true
      }
    )
  }

  return true
}

export function ensureFile(filePath, defaultContent = "") {
  if (!filePath)
    return false

  ensureDir(dirname(filePath))

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      defaultContent,
      "utf8"
    )
  }

  return true
}

export function ensureJson(filePath, defaultValue = {}) {
  ensureDir(dirname(filePath))

  if (!fs.existsSync(filePath)) {
    writeJson(filePath, defaultValue)
    return defaultValue
  }

  try {
    const content =
      fs.readFileSync(filePath, "utf8")

    if (!content.trim()) {
      writeJson(filePath, defaultValue)
      return defaultValue
    }

    return JSON.parse(content)
  } catch {
    const backupPath =
      `${filePath}.broken-${Date.now()}`

    try {
      fs.copyFileSync(filePath, backupPath)
    } catch {}

    writeJson(filePath, defaultValue)

    return defaultValue
  }
}

export function readJson(filePath, defaultValue = {}) {
  try {
    if (!fs.existsSync(filePath))
      return ensureJson(filePath, defaultValue)

    const content =
      fs.readFileSync(filePath, "utf8")

    if (!content.trim())
      return defaultValue

    return JSON.parse(content)
  } catch {
    return defaultValue
  }
}

export function writeJson(filePath, data = {}) {
  ensureDir(dirname(filePath))

  const tempPath =
    `${filePath}.tmp`

  const content =
    JSON.stringify(data, null, 2)

  fs.writeFileSync(
    tempPath,
    content,
    "utf8"
  )

  fs.renameSync(
    tempPath,
    filePath
  )

  return true
}

export function readText(filePath, fallback = "") {
  try {
    if (!fs.existsSync(filePath))
      return fallback

    return fs.readFileSync(
      filePath,
      "utf8"
    )
  } catch {
    return fallback
  }
}

export function writeText(filePath, content = "") {
  ensureDir(dirname(filePath))

  fs.writeFileSync(
    filePath,
    String(content),
    "utf8"
  )

  return true
}

export function appendText(filePath, content = "") {
  ensureDir(dirname(filePath))

  fs.appendFileSync(
    filePath,
    String(content),
    "utf8"
  )

  return true
}

export function readBuffer(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return null

    return fs.readFileSync(filePath)
  } catch {
    return null
  }
}

export function writeBuffer(filePath, buffer) {
  ensureDir(dirname(filePath))

  fs.writeFileSync(
    filePath,
    buffer
  )

  return true
}

export function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath))
      fs.unlinkSync(filePath)

    return true
  } catch {
    return false
  }
}

export function listFiles(dirPath, extension = ".js") {
  const files = []

  if (!fs.existsSync(dirPath))
    return files

  const items =
    fs.readdirSync(
      dirPath,
      {
        withFileTypes: true
      }
    )

  for (const item of items) {
    const fullPath =
      path.join(dirPath, item.name)

    if (item.isDirectory()) {
      files.push(
        ...listFiles(fullPath, extension)
      )

      continue
    }

    if (
      item.isFile() &&
      item.name.endsWith(extension)
    ) {
      files.push(fullPath)
    }
  }

  return files
}

export function safeJoin(baseDir, targetPath) {
  const base =
    path.resolve(baseDir)

  const target =
    path.resolve(baseDir, targetPath)

  if (!target.startsWith(base)) {
    throw new Error(
      "Caminho bloqueado por segurança"
    )
  }

  return target
}