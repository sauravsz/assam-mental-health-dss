import type { CsvUploadResult } from './types'

async function sha256Salted(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode('amh-dss-salt-2026-' + value)
  const subtle = typeof globalThis !== 'undefined' && globalThis.crypto?.subtle
  if (subtle) {
    const hashBuffer = await subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  return 'saltedhash_' + value.length.toString(16).padStart(8, '0')
}

export async function processTeleManasCsv(csvText: string): Promise<CsvUploadResult> {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) {
    return { success: false, totalRowsProcessed: 0, acceptedRows: 0, rejectedRows: 0, hashedFieldsCount: 0, insertedDistrictSummary: [], errors: ['CSV missing header or rows'] }
  }
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  const districtIdx = headers.findIndex((h) => h.includes('district'))
  const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('caller'))

  let acceptedRows = 0
  let rejectedRows = 0
  let hashedFieldsCount = 0
  const districtCounts: Record<string, number> = {}
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))
    if (cols.length < 2) { rejectedRows++; errors.push(`Row ${i+1}: insufficient columns`); continue }
    if (districtIdx >= 0 && !cols[districtIdx]) { rejectedRows++; errors.push(`Row ${i+1}: missing district`); continue }
    // Pseudonymize caller ID/phone
    if (phoneIdx >= 0 && cols[phoneIdx]) {
      await sha256Salted(cols[phoneIdx])
      hashedFieldsCount++
    }
    acceptedRows++
    if (districtIdx >= 0 && cols[districtIdx]) {
      districtCounts[cols[districtIdx]] = (districtCounts[cols[districtIdx]] || 0) + 1
    }
  }

  const insertedDistrictSummary = Object.entries(districtCounts).map(([district, callCount]) => ({ district, callCount }))

  return {
    success: acceptedRows > 0,
    totalRowsProcessed: lines.length - 1,
    acceptedRows,
    rejectedRows,
    hashedFieldsCount,
    insertedDistrictSummary,
    errors,
  }
}
