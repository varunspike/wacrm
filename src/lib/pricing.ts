const RATE_URL = 'https://api.frankfurter.dev/v2/rate/USD/INR'
const HOUR = 60 * 60 * 1000
const MAX_AGE = 4 * 24 * HOUR
export const FOREX_BUFFER = 1.03
export const MARKUP = 1.45

type ExchangeRate = { rate: number; date: string; fetchedAt: string; source: string }
// ponytail: per-worker cache; use shared storage if provider traffic warrants it.
let cached: ExchangeRate | undefined

export async function getUsdInr(): Promise<ExchangeRate> {
  const now = Date.now()
  if (cached && now - Date.parse(cached.fetchedAt) < HOUR && now - Date.parse(cached.date) <= MAX_AGE) return cached
  const response = await fetch(RATE_URL, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Exchange rate provider unavailable')
  const data = await response.json()
  const date = typeof data.date === 'string' ? Date.parse(data.date) : NaN
  if (data.base !== 'USD' || data.quote !== 'INR' || typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(date) || date > now || now - date > MAX_AGE) {
    throw new Error('Exchange rate is invalid or stale')
  }
  cached = { rate: data.rate, date: data.date, fetchedAt: new Date(now).toISOString(), source: RATE_URL }
  return cached
}

export function sellingPriceInr(costUsd: number, usdInr: number): number {
  if (![costUsd, usdInr].every(value => Number.isFinite(value) && value > 0)) throw new Error('Invalid pricing input')
  // Multiply decimal inputs as integers so half-paise ties round up reliably.
  const decimal = (value: number) => {
    const [mantissa, exponent = '0'] = value.toString().split('e')
    const places = (mantissa.split('.')[1]?.length ?? 0) - Number(exponent)
    return { value: BigInt(mantissa.replace('.', '')) * BigInt(10) ** BigInt(Math.max(0, -places)), scale: BigInt(10) ** BigInt(Math.max(0, places)) }
  }
  const cost = decimal(costUsd)
  const rate = decimal(usdInr)
  const numerator = cost.value * rate.value * BigInt(103) * BigInt(145)
  const denominator = cost.scale * rate.scale * BigInt(100)
  const paise = (numerator * BigInt(2) + denominator) / (denominator * BigInt(2))
  if (paise > BigInt(Number.MAX_SAFE_INTEGER) || paise <= BigInt(0)) throw new Error('Price outside supported range')
  return Number(paise) / 100
}
