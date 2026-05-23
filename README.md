<div align="center">

<img src="https://deposit.pictures/p/9204ada7a1114cc28bae630d75e2b8c8" width="100%">

# 💠 Yixuan-MD

_Base WhatsApp focada em estabilidade, organização e performance._

</div>

---

## ✨ Sobre o projeto

A **Yixuan-MD** é uma base de bot para WhatsApp criada com foco em organização, estabilidade e facilidade de instalação.

O projeto foi limpo para GitHub, mantendo apenas os arquivos importantes para uso público e instalação. Arquivos sensíveis, sessão do WhatsApp, logs reais, cache e dependências locais ficam fora do repositório.

---

## ⚙️ Principais recursos

- Estrutura modular por pastas.
- Loader automático de comandos.
- Router centralizado para execução segura.
- Sistema de configuração por `.env`.
- Pastas preparadas para sessão, cache, banco local e logs.
- Banco inicial em JSON.
- Suporte a comandos de membros, admins, dono, menus e downloads.
- Funções locais para canvas/imagens em `dados/org/funcoes/`.
- Arquitetura pensada para hospedagem em painel, VPS ou Termux.
- Segurança básica para evitar vazamento de `.env`, sessão e arquivos temporários.

---

## 📁 Estrutura incluída

```txt
Yixuan-MD/
├── commands/              # Comandos do bot
│   ├── admins/            # Comandos administrativos
│   ├── dono/              # Comandos exclusivos do dono
│   ├── downloads/         # Comandos de download
│   ├── members/           # Comandos públicos/membros
│   └── menus/             # Menus do bot
│
├── core/                  # Loader, router e guard principal
├── system/                # Sistemas internos da base
├── dados/org/funcoes/     # Funções locais e canvas
├── database/              # JSONs iniciais limpos
├── media/menu/            # Imagens usadas por menus e comandos
├── storage/               # Sessão, cache e temporários locais
├── logs/                  # Logs locais
│
├── index.js               # Entrada principal
├── connection.js          # Conexão do bot
├── instalar.sh            # Instalador automático
├── package.json           # Dependências e scripts
├── .env.example           # Modelo seguro de configuração
└── .gitignore             # Proteção contra arquivos sensíveis