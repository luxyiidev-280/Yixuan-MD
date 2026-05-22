//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Dono: Backup Database
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import fs from "fs"
import path from "path"
import {
  execFileSync
} from "child_process"

import {
  isOwner
} from "#system/admin.js"

import {
  paths,
  bot
} from "#system/config.js"

import {
  ensureDir
} from "#system/files.js"

import {
  reply,
  errorBox
} from "#system/reply.js"

export default {
  name: "backupdb",

  aliases: [
    "backup",
    "bkpdb"
  ],

  category: "dono",

  description:
    "Gera e envia backup da pasta database.",

  ownerOnly: true,

  async run(sock, msg, args, ctx) {
    if (!isOwner(ctx.sender))
      return

    try {
      ensureDir(paths.temp)

      const file =
        path.join(paths.temp, `database-${Date.now()}.zip`)

      execFileSync(
        "zip",
        ["-qr", file, "database"],
        {
          cwd: process.cwd()
        }
      )

      await sock.sendMessage(
        ctx.from,
        {
          document:
            fs.readFileSync(file),
          fileName:
            path.basename(file),
          mimetype:
            "application/zip",
          caption:
            `〔 📦 *_Backup database_* 〕\n\n${bot.footer}`
        },
        {
          quoted: msg
        }
      )

      try {
        fs.unlinkSync(file)
      } catch {}

      return true
    } catch {
      return reply(
        sock,
        msg,
        errorBox(
          "Falha no backup",
          "Não consegui gerar o backup da database."
        )
      )
    }
  }
}
