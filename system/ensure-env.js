//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Auto ENV
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"

const root =
  process.cwd()

const envPath =
  path.join(root, ".env")

const examplePath =
  path.join(root, ".env.example")

const defaultEnv =
`BOT_NAME=Yixuan-MD
BOT_CORE=Auric Core
BOT_PREFIX=!

ZEROTWO_BASE_URL=https://zero-two-apis.com.br
ZEROTWO_API_KEY=COLOQUE_SUA_KEY_AQUI

GEMINI_API_KEY=COLOQUE_SUA_KEY_AQUI
GEMINI_MODEL=gemini-2.5-flash

OWNER_NAME=Luxyii
OWNER_NUMBERS=5511999999999
OWNER_LIDS=157544450392085@lid

PRIVATE_MODE=false
AUTO_READ=false
REACT_COMMANDS=false

COMMAND_COOLDOWN_MS=700
SAVE_INTERVAL_MS=5000
METADATA_CACHE_MS=60000
MAX_COMMAND_ERRORS=3

AUTO_RESTART_MINUTES=20
`

function cleanEnv(content) {
  return String(content || "")
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith("//"))
    .join("\n")
    .trim() + "\n"
}

if (!fs.existsSync(envPath)) {
  let content =
    defaultEnv

  if (fs.existsSync(examplePath)) {
    content =
      cleanEnv(
        fs.readFileSync(examplePath, "utf8")
      )
  }

  fs.writeFileSync(
    envPath,
    content
  )

  console.log(
    "[Yixuan-MD] .env não existia, criado automaticamente."
  )
} else {
  console.log(
    "[Yixuan-MD] .env encontrado."
  )
}
