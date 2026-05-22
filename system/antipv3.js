//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Sistema AntiPV3
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"

import {
  isOwner
} from "./admin.js"

const FILE =
  "./database/antipv3.json"

const DEFAULT_STATE = {
  enabled: false
}

function ensureFile() {
  try {
    const dir =
      path.dirname(FILE)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(
        dir,
        {
          recursive: true
        }
      )
    }

    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(
        FILE,
        JSON.stringify(
          DEFAULT_STATE,
          null,
          2
        )
      )
    }
  } catch {}
}

function readState() {
  ensureFile()

  try {
    const raw =
      fs.readFileSync(
        FILE,
        "utf8"
      )

    if (!raw.trim())
      return {
        ...DEFAULT_STATE
      }

    return {
      ...DEFAULT_STATE,
      ...JSON.parse(raw)
    }
  } catch {
    return {
      ...DEFAULT_STATE
    }
  }
}

function writeState(data = {}) {
  ensureFile()

  fs.writeFileSync(
    FILE,
    JSON.stringify(
      {
        ...DEFAULT_STATE,
        ...data
      },
      null,
      2
    )
  )

  return data
}

export function getAntiPv3() {
  const data =
    readState()

  return Boolean(data.enabled)
}

export function setAntiPv3(value = true) {
  const data =
    readState()

  data.enabled =
    Boolean(value)

  writeState(data)

  return data.enabled
}

export async function antiPv3Guard(read = {}) {
  if (!getAntiPv3())
    return false

  if (!read)
    return false

  if (read.isGroup)
    return false

  if (read.fromMe)
    return false

  if (isOwner(read.sender))
    return false

  return true
}
