import { expect, it } from 'vitest'
import { formatPriceTables } from './price-table'

it('aligns prices and keeps missing codes visibly unpriced', () => {
  const [text] = formatPriceTables([
    { code: 'S4LG19-P', amount: '₹751.18', reference: 'quote-1' },
    { code: 'S100ESB', amount: '₹28,228.86', reference: 'quote-2' },
    { code: 'MISSING', amount: 'NOT FOUND' },
  ])
  expect(text).toContain('PART CODE |   INR / UNIT')
  const rows = text.split('\n').filter(line => line.includes(' | '))
  expect(new Set(rows.map(line => line.indexOf('|'))).size).toBe(1)
  expect(new Set(rows.map(line => line.length)).size).toBe(1)
  expect(text).toContain('NOT FOUND')
  expect(text).toContain('S100ESB: quote-2')
})

it('wraps full long codes and splits only between complete tables', () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({ code: `${i}`.padEnd(100, 'X'), amount: '₹90,07,19,92,54,740.00', reference: 'a'.repeat(36) }))
  const messages = formatPriceTables(rows)
  expect(messages.length).toBeGreaterThan(1)
  for (const text of messages) {
    expect(text.length).toBeLessThanOrEqual(3500)
    expect(text.match(/```/g)).toHaveLength(2)
    expect(text).toContain('PART CODE')
  }
  for (const row of rows) expect(messages.join('\n')).toContain(`${row.code}: ${row.reference}`)
})
