# Yixuan-MD • Auric Core

Base limpa da **Yixuan-MD**, preparada para GitHub e instalação em Termux, VPS ou painel.

## Estrutura incluída

- `commands/` comandos do bot
- `core/` loader, router e guard principal
- `system/` sistemas internos da base
- `dados/org/funcoes/` funções/canvas locais
- `database/` JSONs iniciais limpos
- `media/menu/` imagens usadas pelos menus e comandos
- `storage/` apenas pastas vazias com `.gitkeep`
- `logs/` apenas pasta vazia com `.gitkeep`
- `instalar.sh` instalador automático
- `.env.example` modelo seguro de configuração

## Não incluído no GitHub

- `.env` real
- sessão do WhatsApp
- `node_modules/`
- logs reais
- cache/temporários
- backups locais

## Instalação

```bash
chmod +x instalar.sh
./instalar.sh
```

Depois configure o `.env` criado a partir do `.env.example`:

```env
OWNER_NUMBERS=5511999999999
OWNER_LIDS=157544450392085@lid
ZEROTWO_API_KEY=SUA_KEY
GEMINI_API_KEY=SUA_KEY
```

Iniciar:

```bash
npm start
```

## Observação

A pasta `storage/session/` fica fora do GitHub para não vazar sessão do WhatsApp. Apagar isso em repo público seria o mínimo civilizatório, mas a internet ainda precisa de aviso.
