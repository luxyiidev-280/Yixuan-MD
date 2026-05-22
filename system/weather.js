//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// YIXUAN-MD
// Clima com Múltiplas Fontes
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

const cache =
  new Map()

const CACHE_MS =
  1000 * 60 * 10

const TIMEOUT_MS =
  12000

function clean(value = "") {
  return String(value || "")
    .trim()
}

function cacheKey(city = "") {
  return clean(city)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getCache(city = "") {
  const key =
    cacheKey(city)

  const saved =
    cache.get(key)

  if (!saved)
    return null

  if (Date.now() - saved.time > CACHE_MS) {
    cache.delete(key)
    return null
  }

  return saved.data
}

function setCache(city = "", data = {}) {
  cache.set(
    cacheKey(city),
    {
      time:
        Date.now(),
      data
    }
  )

  return data
}

async function fetchJson(url = "", timeoutMs = TIMEOUT_MS) {
  const controller =
    new AbortController()

  const timer =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    )

  timer.unref?.()

  try {
    const response =
      await fetch(
        url,
        {
          headers: {
            "User-Agent":
              "Yixuan-MD Weather",
            "Accept":
              "application/json, text/plain"
          },
          signal:
            controller.signal
        }
      )

    const text =
      await response.text()

    let data

    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    if (!response.ok) {
      throw new Error(
        data?.reason ||
        data?.error ||
        `HTTP ${response.status}`
      )
    }

    return data
  } finally {
    clearTimeout(timer)
  }
}

function weatherCodeText(code) {
  const map = {
    0: "céu limpo",
    1: "principalmente limpo",
    2: "parcialmente nublado",
    3: "nublado",
    45: "neblina",
    48: "neblina com geada",
    51: "garoa fraca",
    53: "garoa moderada",
    55: "garoa forte",
    61: "chuva fraca",
    63: "chuva moderada",
    65: "chuva forte",
    71: "neve fraca",
    73: "neve moderada",
    75: "neve forte",
    80: "pancadas fracas",
    81: "pancadas moderadas",
    82: "pancadas fortes",
    95: "trovoadas",
    96: "trovoadas com granizo",
    99: "trovoadas fortes com granizo"
  }

  return map[code] || "condição desconhecida"
}

async function openMeteo(city = "") {
  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`

  const geo =
    await fetchJson(geoUrl)

  const place =
    geo?.results?.[0]

  if (!place)
    throw new Error("Cidade não encontrada na Open-Meteo")

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`

  const forecast =
    await fetchJson(forecastUrl)

  const current =
    forecast?.current || {}

  return {
    source:
      "Open-Meteo",

    city:
      place.name,

    region:
      place.admin1 || "",

    country:
      place.country || "",

    temperature:
      current.temperature_2m,

    feelsLike:
      current.apparent_temperature,

    humidity:
      current.relative_humidity_2m,

    wind:
      current.wind_speed_10m,

    precipitation:
      current.precipitation,

    condition:
      weatherCodeText(current.weather_code),

    time:
      current.time || ""
  }
}

async function wttr(city = "") {
  const url =
    `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=pt`

  const data =
    await fetchJson(url)

  const current =
    data?.current_condition?.[0]

  const area =
    data?.nearest_area?.[0]

  if (!current)
    throw new Error("Clima não encontrado no wttr.in")

  return {
    source:
      "wttr.in",

    city:
      area?.areaName?.[0]?.value || city,

    region:
      area?.region?.[0]?.value || "",

    country:
      area?.country?.[0]?.value || "",

    temperature:
      current.temp_C,

    feelsLike:
      current.FeelsLikeC,

    humidity:
      current.humidity,

    wind:
      current.windspeedKmph,

    precipitation:
      current.precipMM,

    condition:
      current.lang_pt?.[0]?.value ||
      current.weatherDesc?.[0]?.value ||
      "condição desconhecida",

    time:
      current.localObsDateTime || ""
  }
}

export async function getWeather(city = "") {
  const query =
    clean(city)

  if (!query)
    throw new Error("Cidade vazia")

  const saved =
    getCache(query)

  if (saved)
    return saved

  const errors = []

  try {
    return setCache(
      query,
      await openMeteo(query)
    )
  } catch (error) {
    errors.push(error?.message || String(error))
  }

  try {
    return setCache(
      query,
      await wttr(query)
    )
  } catch (error) {
    errors.push(error?.message || String(error))
  }

  throw new Error(
    `Não consegui consultar o clima. Fontes falharam: ${errors.join(" | ")}`
  )
}

export const weather = {
  getWeather
}
