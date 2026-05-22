//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Detecção Automática de Ambiente
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import os from "os"
import path from "path"

export function detectEnvironment() {
  const env =
    process.env

  const cwd =
    process.cwd()

  const prefix =
    String(env.PREFIX || "")

  const home =
    String(env.HOME || "")

  const isTermux =
    prefix.includes("/data/data/com.termux") ||
    home.includes("/data/data/com.termux") ||
    Boolean(env.TERMUX_VERSION) ||
    Boolean(env.ANDROID_ROOT)

  const isPterodactyl =
    Boolean(env.P_SERVER_UUID) ||
    Boolean(env.P_SERVER_ALLOCATION_LIMIT) ||
    Boolean(env.P_SERVER_LOCATION) ||
    cwd.includes("/home/container")

  const isDocker =
    fs.existsSync("/.dockerenv") ||
    Boolean(env.CONTAINER) ||
    Boolean(env.DOCKER_CONTAINER)

  const isContainer =
    isDocker ||
    isPterodactyl ||
    cwd.includes("/home/container")

  const isWindows =
    process.platform === "win32"

  const isLinux =
    process.platform === "linux"

  const isMac =
    process.platform === "darwin"

  const hasTTY =
    Boolean(
      process.stdin.isTTY &&
      process.stdout.isTTY
    )

  const isVps =
    isLinux &&
    !isTermux &&
    !isPterodactyl &&
    !isDocker

  return {
    name:
      isTermux
        ? "Termux"
        : isPterodactyl
          ? "Pterodactyl"
          : isDocker
            ? "Docker"
            : isWindows
              ? "Windows"
              : isMac
                ? "MacOS"
                : isVps
                  ? "VPS/Linux"
                  : "Host",

    platform:
      process.platform,

    arch:
      process.arch,

    node:
      process.version,

    hostname:
      os.hostname(),

    cwd:
      path.resolve(cwd),

    isTermux,
    isPterodactyl,
    isDocker,
    isContainer,
    isWindows,
    isLinux,
    isMac,
    isVps,
    hasTTY,

    shouldPrintTerminalQr:
      isTermux,

    shouldSaveQrImage:
      true,

    qrMode:
      isTermux
        ? "terminal+image"
        : "image-only"
  }
}

export const environment =
  detectEnvironment()
