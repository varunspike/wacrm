type QuoteLine = { code: string; amount: string; reference?: string }

export function formatPriceTables(rows: QuoteLine[]): string[] {
  const codeWidth = Math.max(9, Math.min(16, Math.max(...rows.map(row => row.code.length))))
  const priceWidth = Math.max(12, ...rows.map(row => row.amount.length))
  const header = `${'PART CODE'.padEnd(codeWidth)} | ${'INR / UNIT'.padStart(priceWidth)}`
  const divider = `${'-'.repeat(codeWidth)}-+-${'-'.repeat(priceWidth)}`
  const render = (group: QuoteLine[]) => {
    const lines = group.flatMap(row => {
      const code = row.code.replace(/`/g, 'ˋ')
      const pieces = code.match(new RegExp(`.{1,${codeWidth}}`, 'g')) ?? ['']
      return pieces.map((piece, index) => `${piece.padEnd(codeWidth)} | ${(index === 0 ? row.amount : '').padStart(priceWidth)}`)
    })
    const references = group.filter(row => row.reference).map(row => `${row.code.replace(/`/g, 'ˋ')}: ${row.reference}`)
    return [
      '*PRICE QUOTATION*',
      '```\n' + [header, divider, ...lines].join('\n') + '\n```',
      'Unit prices only. Freight, duties and taxes excluded.',
      ...(group.some(row => !row.reference) ? ['NOT FOUND = check code. REVIEW = multiple catalogue entries.'] : []),
      ...(references.length ? ['Quote references:\n' + references.join('\n')] : []),
    ].join('\n\n')
  }
  const messages: string[] = []
  let group: QuoteLine[] = []
  for (const row of rows) {
    if (group.length && render([...group, row]).length > 3500) {
      messages.push(render(group))
      group = []
    }
    group.push(row)
  }
  if (group.length) messages.push(render(group))
  return messages
}
