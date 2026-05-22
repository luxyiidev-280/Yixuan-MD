//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Otimizador
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"
import os from "os"

import {
  paths
} from "#system/config.js"

import {
  logger
} from "#system/logger.js"

const DEFAULT_OPTIONS = {
  intervalMs: 30000,

  ramWarnPercent: 75,
  ramCriticalPercent: 88,

  heapWarnMB: 350,
  heapCriticalMB: 650,

  rssWarnMB: 700,
  rssCriticalMB: 950,

  eventLoopWarnMs: 180,
  eventLoopCriticalMs: 500,

  tempMaxAgeMs: 1000 * 60 * 20,
  cacheMaxAgeMs: 1000 * 60 * 60,

  maxLogSizeMB: 10,
  maxBackupLogs: 5,

  autoRestart: true,
  autoRestartMinutes: 25,

  logCooldownMs: 60000
}

let options = {
  ...DEFAULT_OPTIONS
}

let timer = null
let restartTimer = null
let startedAt = null
let lastLog = 0
let lastLag = 0
let cleaning = false

const registeredCaches =
  new Set()

function now() {
  return Date.now()
}

function mb(bytes = 0) {
  return Math.round(bytes / 1024 / 1024)
}

function percent(value = 0, total = 1) {
  if (!total)
    return 0

  return Math.round((value / total) * 100)
}

function canLog() {
  return now() - lastLog >= options.logCooldownMs
}

function markLog() {
  lastLog = now()
}

function safeStat(file = "") {
  try {
    return fs.statSync(file)
  } catch {
    return null
  }
}

function safeRemove(file = "") {
  try {
    if (!fs.existsSync(file))
      return false

    fs.rmSync(file, {
      recursive: true,
      force: true
    })

    return true
  } catch {
    return false
  }
}

function getMemoryStatus() {
  const memory =
    process.memoryUsage()

  const totalRam =
    os.totalmem()

  const freeRam =
    os.freemem()

  const usedRam =
    totalRam - freeRam

  return {
    rssMB:
      mb(memory.rss),

    heapUsedMB:
      mb(memory.heapUsed),

    heapTotalMB:
      mb(memory.heapTotal),

    externalMB:
      mb(memory.external),

    arrayBuffersMB:
      mb(memory.arrayBuffers),

    systemRamUsedMB:
      mb(usedRam),

    systemRamTotalMB:
      mb(totalRam),

    systemRamPercent:
      percent(usedRam, totalRam)
  }
}

function getCpuStatus() {
  const load =
    os.loadavg()

  const cores =
    os.cpus()?.length || 1

  return {
    cores,

    load1:
      Number(load[0].toFixed(2)),

    load5:
      Number(load[1].toFixed(2)),

    load15:
      Number(load[2].toFixed(2)),

    loadPercent:
      percent(load[0], cores)
  }
}

function clearRegisteredCaches() {
  let cleared = 0

  for (const cache of registeredCaches) {
    try {
      if (
        cache &&
        typeof cache.clear === "function"
      ) {
        cache.clear()
        cleared++
      }
    } catch {}
  }

  return cleared
}

function runGC() {
  if (typeof global.gc !== "function")
    return false

  try {
    global.gc()
    return true
  } catch {
    return false
  }
}

function cleanOldFiles(dir = "", maxAgeMs = 0) {
  let removed = 0

  try {
    if (!dir || !fs.existsSync(dir))
      return removed

    const files =
      fs.readdirSync(dir)

    for (const file of files) {
      if (file === ".gitkeep")
        continue

      const full =
        path.join(dir, file)

      const stat =
        safeStat(full)

      if (!stat)
        continue

      const age =
        now() - stat.mtimeMs

      if (age >= maxAgeMs) {
        if (safeRemove(full))
          removed++
      }
    }
  } catch {}

  return removed
}

function rotateLogs() {
  try {
    const logDir =
      paths.logs || "./logs"

    const logFile =
      path.join(logDir, "yixuan.log")

    if (!fs.existsSync(logFile))
      return false

    const stat =
      safeStat(logFile)

    if (!stat)
      return false

    const sizeMB =
      mb(stat.size)

    if (sizeMB < options.maxLogSizeMB)
      return false

    const backup =
      path.join(
        logDir,
        `yixuan-${Date.now()}.log`
      )

    fs.renameSync(logFile, backup)
    fs.writeFileSync(logFile, "")

    const backups =
      fs.readdirSync(logDir)
        .filter(file =>
          /^yixuan-\d+\.log$/.test(file)
        )
        .map(file => ({
          file,
          full:
            path.join(logDir, file),

          time:
            safeStat(path.join(logDir, file))?.mtimeMs || 0
        }))
        .sort((a, b) => b.time - a.time)

    for (const old of backups.slice(options.maxBackupLogs)) {
      safeRemove(old.full)
    }

    logger.warn(
      `Logs rotacionados | tamanho: ${sizeMB}MB`
    )

    return true
  } catch {
    return false
  }
}

function checkEventLoopLag() {
  const start =
    process.hrtime.bigint()

  setImmediate(() => {
    const end =
      process.hrtime.bigint()

    lastLag =
      Math.round(Number(end - start) / 1e6)
  })
}

function shouldWarn(memory = {}) {
  return (
    memory.systemRamPercent >= options.ramWarnPercent ||
    memory.heapUsedMB >= options.heapWarnMB ||
    memory.rssMB >= options.rssWarnMB ||
    lastLag >= options.eventLoopWarnMs
  )
}

function shouldCritical(memory = {}) {
  return (
    memory.systemRamPercent >= options.ramCriticalPercent ||
    memory.heapUsedMB >= options.heapCriticalMB ||
    memory.rssMB >= options.rssCriticalMB ||
    lastLag >= options.eventLoopCriticalMs
  )
}

function optimize(reason = "manual") {
  if (cleaning)
    return {
      skipped: true,
      reason: "already_cleaning"
    }

  cleaning = true

  try {
    const clearedCaches =
      clearRegisteredCaches()

    const tempRemoved =
      cleanOldFiles(
        paths.temp || "./storage/temp",
        options.tempMaxAgeMs
      )

    const cacheRemoved =
      cleanOldFiles(
        paths.cache || "./storage/cache",
        options.cacheMaxAgeMs
      )

    const gc =
      runGC()

    rotateLogs()

    if (canLog()) {
      logger.warn(
        `Optimizer ativo | motivo: ${reason} | caches: ${clearedCaches} | temp: ${tempRemoved} | cache: ${cacheRemoved} | gc: ${gc ? "sim" : "não"}`
      )

      markLog()
    }

    return {
      clearedCaches,
      tempRemoved,
      cacheRemoved,
      gc
    }
  } finally {
    cleaning = false
  }
}

function tick() {
  checkEventLoopLag()

  const memory =
    getMemoryStatus()

  if (shouldCritical(memory)) {
    optimize("uso crítico de recursos")
    return
  }

  if (shouldWarn(memory) && canLog()) {
    logger.warn(
      `Recursos altos | RAM: ${memory.systemRamPercent}% | Heap: ${memory.heapUsedMB}MB | RSS: ${memory.rssMB}MB | Lag: ${lastLag}ms`
    )

    markLog()
  }

  rotateLogs()
}

function startAutoRestart() {
  if (!options.autoRestart)
    return false

  if (restartTimer)
    return false

  const minutes =
    Math.max(
      15,
      Number(options.autoRestartMinutes || 25)
    )

  restartTimer =
    setTimeout(() => {
      logger.warn(
        `Auto reinício seguro após ${minutes} minutos`
      )

      setTimeout(() => {
        process.exit(0)
      }, 1200)
    }, minutes * 60 * 1000)

  restartTimer.unref?.()

  logger.system(
    `Auto reinício ativo: ${minutes} minutos`
  )

  return true
}

export function registerCache(cache) {
  if (!cache)
    return false

  registeredCaches.add(cache)
  return true
}

export function unregisterCache(cache) {
  if (!cache)
    return false

  registeredCaches.delete(cache)
  return true
}

export function startOptimizer(customOptions = {}) {
  if (timer)
    return false

  options = {
    ...DEFAULT_OPTIONS,
    ...customOptions
  }

  startedAt =
    now()

  timer =
    setInterval(
      tick,
      options.intervalMs
    )

  timer.unref?.()

  logger.system(
    "Optimizer profissional iniciado"
  )

  startAutoRestart()

  return true
}

export function stopOptimizer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  if (restartTimer) {
    clearTimeout(restartTimer)
    restartTimer = null
  }

  logger.system(
    "Optimizer parado"
  )

  return true
}

export function forceOptimize(reason = "manual") {
  return optimize(reason)
}

export function getOptimizerStatus() {
  return {
    active:
      Boolean(timer),

    startedAt,

    uptimeMs:
      startedAt
        ? now() - startedAt
        : 0,

    memory:
      getMemoryStatus(),

    cpu:
      getCpuStatus(),

    eventLoopLagMs:
      lastLag,

    registeredCaches:
      registeredCaches.size,

    cleaning,

    gcAvailable:
      typeof global.gc === "function",

    options
  }
}