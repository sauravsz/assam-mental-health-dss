import type { ReferralRecord } from './types'

const BLOCKS = [
  'Katigorah', 'Sonai', 'Lakhipur', 'Dholai', 'Borkhola', 'Udharbond', 'Salchapra', 'Silchar Urban',
  'Dispur', 'Sonapur', 'Chandrapur', 'Azara', 'North Guwahati'
]
const DIAGNOSES: ReferralRecord['mhgapCode'][] = [
  'Depression', 'Anxiety', 'Substance', 'Self-Harm', 'Psychosis', 'Child/Adol'
]
const FACILITIES = [
  'Katigorah CHC', 'Sonai BPHC', 'Lakhipur BPHC / CHC', 'Dholai Model Hospital',
  'Borkhola PHC', 'SM Dev Civil Hospital (HQ)', 'Guwahati Medical College (GMCH)'
]
const AGE_BANDS: ReferralRecord['ageBand'][] = ['Under 18', '18-29', '30-44', '45-59', '60+']
const GENDERS: ReferralRecord['gender'][] = ['M', 'F', 'Transgender', 'Undisclosed']

// Deterministic pseudo-random generator
function pseudoRand(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateSyntheticStalledReferrals(count: number = 434): ReferralRecord[] {
  const records: ReferralRecord[] = []

  for (let i = 1; i <= count; i++) {
    const r1 = pseudoRand(i * 13)
    const r2 = pseudoRand(i * 29)
    const r3 = pseudoRand(i * 47)
    const r4 = pseudoRand(i * 71)
    const r5 = pseudoRand(i * 97)
    const r6 = pseudoRand(i * 113)

    const block = BLOCKS[Math.floor(r1 * BLOCKS.length)]
    const district = ['Dispur', 'Sonapur', 'Chandrapur', 'Azara', 'North Guwahati'].includes(block)
      ? 'Kamrup Metro'
      : 'Cachar'
    const mhgapCode = DIAGNOSES[Math.floor(r2 * DIAGNOSES.length)]
    const daysStalled = Math.floor(r3 * 22) + 14 // 14 to 35 days
    const assignedFacility = FACILITIES[Math.floor(r4 * FACILITIES.length)]
    const language = district === 'Cachar' ? (r5 > 0.3 ? 'Bengali' : 'Assamese') : (r5 > 0.2 ? 'Assamese' : 'Bengali')
    const ageBand = AGE_BANDS[Math.floor(r6 * AGE_BANDS.length)]
    const gender = GENDERS[Math.floor(pseudoRand(i * 131) * 3)] // mostly M / F

    const hex1 = Math.floor(pseudoRand(i * 151) * 0xffffff).toString(16).padStart(6, '0')
    const hex2 = Math.floor(pseudoRand(i * 173) * 0xffffff).toString(16).padStart(6, '0')
    const callerHash = `sha256:${hex1}${hex2}...`

    let status: ReferralRecord['status'] = 'Stalled'
    let followupAttempts = 0
    let lastContactNote: string | undefined

    if (i % 7 === 0) {
      status = 'Follow-up Initiated'
      followupAttempts = 1
      lastContactNote = 'Counsellor called; patient requested evening callback after work.'
    } else if (i % 11 === 0) {
      status = 'ASHA Dispatched'
      followupAttempts = 2
      lastContactNote = 'Phone unreachable; Block ASHA notified for home verification visit.'
    } else if (i % 19 === 0) {
      status = 'Resolved'
      followupAttempts = 2
      lastContactNote = 'Verified attendance at Sonai mobile camp on 22 Oct.'
    }

    records.push({
      id: `REF-2026-${String(i).padStart(4, '0')}`,
      callerHash,
      district,
      block,
      language,
      ageBand,
      gender,
      mhgapCode,
      tierReached: 2,
      daysStalled,
      assignedFacility,
      consentRecorded: true, // Invariant: all follow-up candidates have recorded statutory consent
      status,
      followupAttempts,
      lastContactNote,
    })
  }

  return records
}

// Small-cell suppression helper enforcing DPDP 2023 & MHCA 2017
export function applySmallCellSuppression<T>(
  data: T[],
  groupFn: (item: T) => string,
  threshold: number = 10
): { group: string; count: number | string; isMasked: boolean }[] {
  const counts: Record<string, number> = {}
  data.forEach((item) => {
    const key = groupFn(item)
    counts[key] = (counts[key] || 0) + 1
  })

  return Object.entries(counts).map(([group, count]) => {
    if (count < threshold) {
      return { group, count: `<${threshold} (Masked)`, isMasked: true }
    }
    return { group, count, isMasked: false }
  })
}
