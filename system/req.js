//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// ZeroTwo API Request
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

const BASE_URLS =
  [
    process.env.ZEROTWO_BASE_URL,
    process.env.ZEROTWO_SITE,
    "https://zero-two-apis.com.br",
    "https://zerotwo.online"
  ].filter(Boolean)

const DEFAULT_TIMEOUT =
  12000

const CACHE_TTL =
  1000 * 60 * 10

const ENDPOINTS = {
  ytSearch:
    "/api/ytsrc",

  playAudio:
    "/api/dl/ytaudio",

  playVideo:
    "/api/dl/ytvideo",

  instagram:
    "/api/instagram",

  tiktok:
    "/api/tiktok"
}

const cache =
  new Map()

let activeBase =
  BASE_URLS[0]

function clean(value = "") {
  return String(value || "")
    .trim()
}

function apiKey() {
  const key =
    process.env.ZEROTWO_API_KEY ||
    process.env.API_KEY_ZEROTWO ||
    process.env.ZERO_TWO_API_KEY ||
    process.env.ZEROTWO_KEY ||
    ""

  if (!clean(key)) {
    throw new Error(
      "Chave ZeroTwo não configurada."
    )
  }

  return clean(key)
}

function normalizeBase(url = "") {
  return clean(url)
    .replace(/\/+$/, "")
}

function isYoutubeUrl(text = "") {
  const value =
    clean(text)

  return (
    value.includes("youtube.com/") ||
    value.includes("youtu.be/")
  )
}

function buildUrlWithBase(baseUrl = "", endpoint = "", params = {}) {
  const base =
    normalizeBase(baseUrl)

  if (!base)
    throw new Error("Base URL vazia")

  const path =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`

  const url =
    new URL(`${base}${path}`)

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      clean(value) !== ""
    ) {
      url.searchParams.set(
        key,
        String(value)
      )
    }
  }

  url.searchParams.set(
    "apikey",
    apiKey()
  )

  return url.toString()
}

function buildUrl(endpoint = "", params = {}) {
  return buildUrlWithBase(
    activeBase || BASE_URLS[0],
    endpoint,
    params
  )
}

function timeoutController(ms = DEFAULT_TIMEOUT) {
  const controller =
    new AbortController()

  const timer =
    setTimeout(
      () => controller.abort(),
      ms
    )

  timer.unref?.()

  return {
    controller,
    timer
  }
}

function getCache(key = "") {
  const saved =
    cache.get(key)

  if (!saved)
    return null

  if (Date.now() - saved.time > saved.ttl) {
    cache.delete(key)
    return null
  }

  return saved.data
}

function setCache(key = "", data, ttl = CACHE_TTL) {
  cache.set(
    key,
    {
      time:
        Date.now(),

      ttl,

      data
    }
  )

  return data
}

function isCloudflareOriginError(error = {}) {
  const message =
    String(error?.message || "")

  return (
    message.includes("HTTP 520") ||
    message.includes("HTTP 521") ||
    message.includes("HTTP 522") ||
    message.includes("HTTP 523") ||
    message.includes("HTTP 524") ||
    message.includes("HTTP 525") ||
    message.includes("HTTP 526") ||
    message.includes("HTTP 530")
  )
}

async function fetchJsonUrl(url = "", options = {}) {
  const cacheKey =
    `json:${url}`

  const cacheMs =
    Number(options.cacheMs || 0)

  if (cacheMs > 0) {
    const saved =
      getCache(cacheKey)

    if (saved)
      return saved
  }

  const {
    controller,
    timer
  } =
    timeoutController(
      options.timeoutMs || DEFAULT_TIMEOUT
    )

  try {
    const response =
      await fetch(
        url,
        {
          method:
            "GET",

          headers: {
            "User-Agent":
              "Yixuan-MD",

            "Accept":
              "application/json, text/plain"
          },

          signal:
            controller.signal
        }
      )

    const text =
      await response.text()

    let data =
      null

    try {
      data =
        JSON.parse(text)
    } catch {
      data =
        {
          raw:
            text
        }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.erro ||
        data?.error ||
        `HTTP ${response.status}`
      )
    }

    if (cacheMs > 0) {
      setCache(
        cacheKey,
        data,
        cacheMs
      )
    }

    return data
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJson(endpoint = "", params = {}, options = {}) {
  let lastError =
    null

  const bases =
    [
      activeBase,
      ...BASE_URLS
    ].filter(Boolean)

  const uniqueBases =
    [...new Set(bases)]

  for (const base of uniqueBases) {
    const url =
      buildUrlWithBase(
        base,
        endpoint,
        params
      )

    try {
      const data =
        await fetchJsonUrl(
          url,
          options
        )

      activeBase =
        normalizeBase(base)

      return data
    } catch (error) {
      lastError =
        error

      if (isCloudflareOriginError(error))
        continue

      throw error
    }
  }

  throw lastError || new Error(
    "Falha em todos os domínios ZeroTwo"
  )
}

function firstArray(data) {
  if (Array.isArray(data))
    return data

  if (Array.isArray(data?.resultado))
    return data.resultado

  if (Array.isArray(data?.result))
    return data.result

  if (Array.isArray(data?.results))
    return data.results

  if (Array.isArray(data?.data))
    return data.data

  if (Array.isArray(data?.msg))
    return data.msg

  return []
}

function normalizeVideoItem(item = {}) {
  return {
    titulo:
      item.title ||
      item.titulo ||
      item.nome ||
      "Não encontrado",

    tempo:
      item.timestamp ||
      item.tempo ||
      item.duration ||
      item.duracao ||
      "",

    views:
      item.views ||
      0,

    canal:
      item.author?.name ||
      item.canal ||
      item.channel ||
      "Indefinido",

    postado:
      item.ago ||
      item.postado ||
      item.publicado ||
      "",

    desc:
      item.description ||
      item.desc ||
      "",

    thumb:
      item.thumbnail ||
      item.thumb ||
      item.image ||
      "",

    url:
      item.url ||
      item.link ||
      ""
  }
}

function normalizeInstagramItem(item = {}) {
  const url =
    item.url ||
    item.link ||
    item.download ||
    item.media ||
    ""

  const type =
    String(
      item.type ||
      item.ext ||
      item.tipo ||
      ""
    )
      .replace(".", "")
      .toLowerCase()

  return {
    url,

    type:
      type || guessType(url)
  }
}

function guessType(url = "") {
  const lower =
    String(url || "")
      .toLowerCase()

  if (lower.includes(".mp4"))
    return "mp4"

  if (lower.includes(".webp"))
    return "webp"

  if (lower.includes(".png"))
    return "png"

  if (
    lower.includes(".jpg") ||
    lower.includes(".jpeg")
  ) {
    return "jpg"
  }

  if (lower.includes(".mp3"))
    return "mp3"

  return "mp4"
}

export function clearReqCache() {
  cache.clear()

  return true
}

export async function ytSearch(query = "") {
  const text =
    clean(query)

  if (!text)
    throw new Error("Pesquisa vazia")

  const data =
    await fetchJson(
      ENDPOINTS.ytSearch,
      {
        q:
          text
      },
      {
        cacheMs:
          CACHE_TTL,

        timeoutMs:
          10000
      }
    )

  const results =
    firstArray(data)
      .map(normalizeVideoItem)
      .filter(item => item.url)

  if (!results.length) {
    throw new Error(
      "ZeroTwo não retornou resultados em /api/ytsrc"
    )
  }

  return results
}

export async function ytFirst(query = "") {
  const text =
    clean(query)

  if (isYoutubeUrl(text)) {
    return {
      titulo:
        "YouTube",

      tempo:
        "",

      canal:
        "Link direto",

      postado:
        "",

      thumb:
        "",

      url:
        text
    }
  }

  const results =
    await ytSearch(text)

  return results[0]
}

export function playAudioUrl(videoUrl = "") {
  const url =
    clean(videoUrl)

  if (!url)
    throw new Error("URL do vídeo vazia")

  return buildUrl(
    ENDPOINTS.playAudio,
    {
      url
    }
  )
}

export function playVideoUrl(videoUrl = "") {
  const url =
    clean(videoUrl)

  if (!url)
    throw new Error("URL do vídeo vazia")

  return buildUrl(
    ENDPOINTS.playVideo,
    {
      url
    }
  )
}

export function isLongDuration(duration = "") {
  return String(duration || "").length >= 7
}

export async function instagram(url = "") {
  const link =
    clean(url)

  if (!link.includes("instagram"))
    throw new Error("Link do Instagram inválido")

  const data =
    await fetchJson(
      ENDPOINTS.instagram,
      {
        url:
          link
      },
      {
        timeoutMs:
          12000
      }
    )

  const items =
    firstArray(data)
      .map(normalizeInstagramItem)
      .filter(item => item.url)

  if (items.length) {
    return {
      msg:
        items
    }
  }

  const direct =
    normalizeInstagramItem(data)

  if (direct.url) {
    return {
      msg:
        [direct]
    }
  }

  return data
}

export function tiktokVideoUrl(url = "") {
  const link =
    clean(url)

  if (!link.includes("tiktok"))
    throw new Error("Link do TikTok inválido")

  return buildUrl(
    ENDPOINTS.tiktok,
    {
      url:
        link
    }
  )
}

export function tiktokAudioUrl(url = "") {
  return tiktokVideoUrl(url)
}

export function getActiveApiBase() {
  return activeBase
}

export const req = {
  ytSearch,
  ytFirst,
  playAudioUrl,
  playVideoUrl,
  isLongDuration,
  instagram,
  tiktokVideoUrl,
  tiktokAudioUrl,
  clearReqCache,
  getActiveApiBase
}