#!/usr/bin/env bash

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━#
# YIXUAN-MD
# Instalador Universal Automático
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━#

set -e

GREEN="\033[1;32m"
RED="\033[1;31m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
WHITE="\033[1;37m"
GRAY="\033[1;90m"
RESET="\033[0m"

ok() {
  echo -e "${GREEN}〔 ✅️ 〕${RESET} $1"
}

warn() {
  echo -e "${YELLOW}〔 ⚠️ 〕${RESET} $1"
}

fail() {
  echo -e "${RED}〔 ❌️ 〕${RESET} $1"
  exit 1
}

log() {
  echo -e "${CYAN}〔 YIXUAN-MD 〕${RESET} $1"
}

is_termux() {
  [[ "$PREFIX" == *"com.termux"* ]] || [[ -n "$TERMUX_VERSION" ]] || [[ -n "$ANDROID_ROOT" ]]
}

is_pterodactyl() {
  [[ -n "$P_SERVER_UUID" ]] || [[ "$PWD" == *"/home/container"* ]]
}

is_docker() {
  [[ -f "/.dockerenv" ]] || [[ -n "$CONTAINER" ]] || [[ -n "$DOCKER_CONTAINER" ]]
}

is_linux() {
  [[ "$(uname -s 2>/dev/null)" == "Linux" ]]
}

detect_environment() {
  if is_termux; then
    echo "Termux"
  elif is_pterodactyl; then
    echo "Pterodactyl/Host"
  elif is_docker; then
    echo "Docker/Container"
  elif is_linux; then
    echo "VPS/Linux"
  else
    echo "Host"
  fi
}

banner() {
  clear 2>/dev/null || true

  echo -e "${CYAN}"
  echo "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮"
  echo "┃ ☯️  YIXUAN-MD • INSTALL AURIC CORE        ┃"
  echo "┃ 🪷  Instalação automática e inteligente   ┃"
  echo "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
  echo -e "${RESET}"
}

check_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js não encontrado."
  command -v npm >/dev/null 2>&1 || fail "npm não encontrado."

  ok "Node: $(node -v)"
  ok "npm: $(npm -v)"
}

install_termux_packages() {
  log "Termux detectado. Verificando pacotes..."

  pkg update -y || true

  pkg install -y \
    git python make clang ffmpeg pkg-config \
    cairo pango libjpeg-turbo giflib librsvg \
    openssl libwebp || true

  ok "Pacotes Termux verificados."
}

install_linux_packages() {
  if is_pterodactyl || is_docker; then
    warn "Host/container detectado. Pulando apt para não quebrar painel."
    return
  fi

  if ! command -v apt >/dev/null 2>&1; then
    warn "apt não encontrado. Pulando pacotes do sistema."
    return
  fi

  if [[ "$EUID" -ne 0 ]]; then
    warn "Sem root. Pulando apt."
    return
  fi

  log "VPS/Linux detectado. Instalando pacotes..."

  apt update -y || true

  apt install -y \
    git python3 make g++ ffmpeg pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg-dev \
    libgif-dev librsvg2-dev libwebp-dev || true

  ok "Pacotes Linux verificados."
}

prepare_env() {
  if [ -f ".env" ]; then
    ok ".env já existe."
    return
  fi

  if [ -f ".env.example" ]; then
    cp .env.example .env
    warn ".env criado a partir do .env.example. Configure dono e keys antes de iniciar."
    return
  fi

  warn ".env.example não encontrado. Crie o .env manualmente."
}

prepare_dirs() {
  log "Criando estrutura automática..."

  DIRS=(
    "commands"
    "commands/menus"
    "commands/members"
    "commands/admins"
    "commands/admins/modos"
    "commands/dono"
    "commands/downloads"
    "core"
    "system"
    "database"
    "logs"
    "media"
    "media/menu"
    "dados"
    "dados/org"
    "dados/org/funcoes"
    "storage"
    "storage/session"
    "storage/temp"
    "storage/cache"
  )

  for dir in "${DIRS[@]}"; do
    mkdir -p "$dir"
  done

  touch storage/session/.gitkeep
  touch storage/temp/.gitkeep
  touch storage/cache/.gitkeep
  touch logs/.gitkeep
  touch media/menu/.gitkeep

  ok "Pastas preparadas."
}

write_json_if_missing() {
  local file="$1"
  local content="$2"

  if [ -f "$file" ]; then
    ok "$file já existe."
    return
  fi

  mkdir -p "$(dirname "$file")"
  printf "%s\n" "$content" > "$file"

  ok "$file criado."
}

prepare_database() {
  log "Preparando database..."

  write_json_if_missing "database/groups.json" '{}'
  write_json_if_missing "database/users.json" '{}'
  write_json_if_missing "database/identity.json" '{}'
  write_json_if_missing "database/warnings.json" '{}'
  write_json_if_missing "database/antipv3.json" '{}'
  write_json_if_missing "database/runtime-health.json" '{}'
  write_json_if_missing "database/command-health.json" '{}'
  write_json_if_missing "database/global.json" '{}'

  ok "Database preparada."
}

install_dependencies() {
  [ -f "package.json" ] || fail "package.json não encontrado."

  log "Instalando dependências..."

  npm install

  ok "Dependências instaladas."
}

check_syntax() {
  log "Verificando sintaxe..."

  FILES=(
    "index.js"
    "connection.js"
    "system/config.js"
    "system/environment.js"
    "system/bootstrap.js"
    "system/files.js"
    "system/logger.js"
    "system/reader.js"
    "system/admin.js"
    "system/warnings.js"
    "core/loader.js"
    "core/router.js"
    "core/guard.js"
  )

  for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
      node --check "$file" >/dev/null
      ok "$file"
    else
      warn "$file não encontrado."
    fi
  done

  ok "Sintaxe verificada."
}

finish() {
  echo ""
  echo -e "${CYAN}╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮${RESET}"
  echo -e "${CYAN}┃${RESET} ${WHITE}Ambiente:${RESET} ${GRAY}$(detect_environment)${RESET}"
  echo -e "${CYAN}┃${RESET} ${WHITE}Dono:${RESET} ${GRAY}configure OWNER_NUMBERS / OWNER_LIDS no .env${RESET}"
  echo -e "${CYAN}┃${RESET} ${WHITE}Start:${RESET} ${GRAY}npm start${RESET}"
  echo -e "${CYAN}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯${RESET}"
  echo ""
  ok "Instalação finalizada."
}

main() {
  banner

  log "Ambiente detectado: $(detect_environment)"

  check_node

  if is_termux; then
    install_termux_packages
  elif is_linux; then
    install_linux_packages
  else
    warn "Ambiente sem instalador de pacotes automático. Continuando."
  fi

  prepare_env
  prepare_env
  prepare_dirs
  prepare_database
  install_dependencies
  check_syntax
  finish
}

main
