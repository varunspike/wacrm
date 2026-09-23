import { afterEach, describe, expect, it, vi } from 'vitest'
import { sellingPriceInr } from './pricing'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('INR pricing', () => {
  it('applies forex buffer and markup, rounding only the final price', () => {
    expect(sellingPriceInr(100, 85)).toBe(12694.75)
    expect(sellingPriceInr(10, 85)).toBe(1269.48)
    expect(sellingPriceInr(1e-7, 1e7)).toBe(1.49)
    expect(sellingPriceInr(197.83, 85)).toBe(25114.02)
    for (const invalid of [0, -1, NaN, Infinity]) {
      expect(() => sellingPriceInr(invalid, 85)).toThrow()
      expect(() => sellingPriceInr(100, invalid)).toThrow()
    }
  })
  it('caches for one hour and refreshes afterwards', async () => {
    vi.resetModules()
    vi.useFakeTimers().setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ base: 'USD', quote: 'INR', rate: 85, date: '2026-09-14' }) })
    vi.stubGlobal('fetch', fetcher)
    const { getUsdInr } = await import('./pricing')
    expect((await getUsdInr()).rate).toBe(85)
    await getUsdInr()
    expect(fetcher).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3600000)
    await getUsdInr()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it.each([
    { date: '2026-09-09' }, { date: '2026-09-15' }, { rate: 0 },
    { rate: '85' }, { base: 'EUR' }, { quote: 'USD' }, { date: 'bad' },
  ])('rejects invalid or stale provider data: %j', async (override) => {
    vi.resetModules()
    vi.useFakeTimers().setSystemTime(new Date('2026-09-14T10:00:00Z'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ base: 'USD', quote: 'INR', rate: 85, date: '2026-09-14', ...override }) }))
    const { getUsdInr } = await import('./pricing')
    await expect(getUsdInr()).rejects.toThrow()
  })
})
