import type { DistrictDistress } from './types'

export function computePoissonTail(y: number, lambda: number): { pValue: number; formatted: string; zScore: number } {
  if (y <= 0) return { pValue: 1.0, formatted: '1.0000', zScore: 0 }
  const zScore = Math.round(((y - lambda) / Math.sqrt(lambda)) * 100) / 100

  if (lambda > 100) {
    // Continuity-corrected Gaussian tail approximation for large lambda
    const zc = (y - lambda - 0.5) / Math.sqrt(lambda)
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(zc))
    const d = 0.3989422804014327 * Math.exp(-zc * zc / 2.0)
    const prob = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    const p = zc > 0 ? prob : 1.0 - prob
    return {
      pValue: p,
      formatted: p < 0.0001 ? '<0.0001' : p.toFixed(4),
      zScore,
    }
  }

  // Exact cumulative discrete Poisson summation for small and moderate lambda
  let term = Math.exp(-lambda)
  let cdf = term
  for (let k = 1; k < y; k++) {
    term *= lambda / k
    cdf += term
  }
  const p = Math.max(0, Math.min(1, 1 - cdf))
  return {
    pValue: p,
    formatted: p < 0.0001 ? '<0.0001' : p.toFixed(4),
    zScore,
  }
}

interface RawDistrictInput {
  id: string
  name: string
  zone: 'Barak Valley' | 'Brahmaputra Valley' | 'Hill Districts'
  population: number
  callsLast30Days: number
  poissonExpected: number
  floodCrisis: boolean
  allocatedCamps: number
  disparityGap: 'High Deficit' | 'Moderate' | 'Equitable'
}

const RAW_DISTRICTS: RawDistrictInput[] = [
  { id: 'AS-01', name: 'Kamrup Metropolitan', zone: 'Brahmaputra Valley', population: 1253440, callsLast30Days: 480, poissonExpected: 360, floodCrisis: false, allocatedCamps: 4, disparityGap: 'Equitable' },
  { id: 'AS-02', name: 'Cachar', zone: 'Barak Valley', population: 1736617, callsLast30Days: 520, poissonExpected: 340, floodCrisis: true, allocatedCamps: 2, disparityGap: 'High Deficit' },
  { id: 'AS-03', name: 'Karimganj', zone: 'Barak Valley', population: 1228686, callsLast30Days: 245, poissonExpected: 190, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' },
  { id: 'AS-04', name: 'Hailakandi', zone: 'Barak Valley', population: 659296, callsLast30Days: 135, poissonExpected: 110, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
  { id: 'AS-05', name: 'Dhubri', zone: 'Brahmaputra Valley', population: 1949258, callsLast30Days: 310, poissonExpected: 280, floodCrisis: true, allocatedCamps: 2, disparityGap: 'Moderate' },
  { id: 'AS-06', name: 'Nagaon', zone: 'Brahmaputra Valley', population: 1892550, callsLast30Days: 360, poissonExpected: 310, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Moderate' },
  { id: 'AS-07', name: 'Barpeta', zone: 'Brahmaputra Valley', population: 1693622, callsLast30Days: 280, poissonExpected: 260, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-08', name: 'Dibrugarh', zone: 'Brahmaputra Valley', population: 1326335, callsLast30Days: 295, poissonExpected: 250, floodCrisis: false, allocatedCamps: 3, disparityGap: 'Equitable' },
  { id: 'AS-09', name: 'Sonitpur', zone: 'Brahmaputra Valley', population: 1228751, callsLast30Days: 210, poissonExpected: 200, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-10', name: 'Dima Hasao', zone: 'Hill Districts', population: 214102, callsLast30Days: 52, poissonExpected: 30, floodCrisis: false, allocatedCamps: 0, disparityGap: 'High Deficit' },
  { id: 'AS-11', name: 'Karbi Anglong', zone: 'Hill Districts', population: 660955, callsLast30Days: 95, poissonExpected: 90, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
  { id: 'AS-12', name: 'Jorhat', zone: 'Brahmaputra Valley', population: 1092256, callsLast30Days: 230, poissonExpected: 210, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-13', name: 'Lakhimpur', zone: 'Brahmaputra Valley', population: 1042137, callsLast30Days: 215, poissonExpected: 170, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' },
  { id: 'AS-14', name: 'Tinsukia', zone: 'Brahmaputra Valley', population: 1327929, callsLast30Days: 240, poissonExpected: 220, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-15', name: 'Golaghat', zone: 'Brahmaputra Valley', population: 1066888, callsLast30Days: 190, poissonExpected: 180, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
]

export const ASSAM_DISTRICTS: DistrictDistress[] = RAW_DISTRICTS.map((raw) => {
  const { pValue, formatted: pValueFormatted, zScore } = computePoissonTail(raw.callsLast30Days, raw.poissonExpected)
  const isSurge = pValue < 0.01 // Rigorous hypothesis test: alpha = 0.01
  const callsPer100k = Math.round((raw.callsLast30Days / (raw.population / 100000)) * 10) / 10

  return {
    ...raw,
    callsPer100k,
    zScore,
    pValue,
    pValueFormatted,
    isSurge,
  }
})

export interface FunnelMetric {
  stage: string
  count: number
  conversionPct: number
  dropPct: number
  description: string
}

export const STATE_FUNNEL_DATA: FunnelMetric[] = [
  {
    stage: '1. Inbound Helpline Intake',
    count: 10000,
    conversionPct: 100,
    dropPct: 0,
    description: 'Citizens calling Tele-MANAS (14416 / 1800-89-14416) across Assam',
  },
  {
    stage: '2. Tier 1 Basic Triage',
    count: 7650,
    conversionPct: 76.5,
    dropPct: 23.5,
    description: 'Callers screened by psychological counsellors; de-escalated or referred',
  },
  {
    stage: '3. Tier 2 Specialist Escalation',
    count: 1449,
    conversionPct: 14.5,
    dropPct: 81.1,
    description: 'Severe cases routed to clinical psychologists and psychiatrists',
  },
  {
    stage: '4. eSanjeevani Tele-Consultation',
    count: 1013,
    conversionPct: 10.1,
    dropPct: 30.1,
    description: 'Video/Audio prescription consultations scheduled with medical officers',
  },
  {
    stage: '5. In-Person DMHP Facility Visit',
    count: 579,
    conversionPct: 5.8,
    dropPct: 42.8,
    description: 'Physically verified attendance at CHC, Civil Hospital, or Mobile Camp',
  },
  {
    stage: '6. 30-Day Care Continuity Check',
    count: 320,
    conversionPct: 3.2,
    dropPct: 44.7,
    description: 'Completed 30-day treatment adherence follow-up logged by counsellor/ASHA',
  },
]

/**
 * Absorbing Markov Chain Model of Care Retention:
 * Transient States:
 *   S1: Intake Triage
 *   S2: Specialist Escalation
 *   S3: eSanjeevani Scheduled
 *   S4: DMHP In-Person Visit
 * Absorbing States:
 *   A1: Care Successfully Verified (30-day adherence)
 *   A2: Defaulted / Lost to Care (>14-day stall)
 */
export const ABSORBING_MARKOV_MODEL = {
  transientStates: ['Intake Triage', 'Specialist Escalation', 'eSanjeevani Scheduled', 'DMHP Clinic Visit'],
  absorbingStates: ['Care Adherence Verified (A1)', 'Defaulted / Lost to Care (A2)'],
  // Transient transition probability matrix Q (4x4)
  Q: [
    [0.0, 0.1449, 0.0, 0.0],
    [0.0, 0.0, 0.6991, 0.0],
    [0.0, 0.0, 0.0, 0.5716],
    [0.0, 0.0, 0.0, 0.0],
  ],
  // Transition to absorbing states R (4x2)
  R: [
    [0.0, 0.8551], // From S1: 85.5% resolve or drop out
    [0.0, 0.3009], // From S2: 30.1% stall before tele-consult
    [0.0, 0.4284], // From S3: 42.8% do not show up for in-person visit
    [0.5527, 0.4473], // From S4: 55.3% complete 30-day adherence, 44.7% default
  ],
  // Fundamental Matrix N = (I - Q)^-1
  // For strictly feed-forward chains, N_{ik} is simply path probability
  N: [
    [1.0, 0.1449, 0.1013, 0.0579],
    [0.0, 1.0, 0.6991, 0.3996],
    [0.0, 0.0, 1.0, 0.5716],
    [0.0, 0.0, 0.0, 1.0],
  ],
  // Absorption probabilities B = N * R (4x2)
  // B[0][0] = probability that an inbound caller completes verified care = 3.2%
  // B[0][1] = probability that an inbound caller defaults = 96.8%
  B: [
    [0.032, 0.968],
    [0.221, 0.779],
    [0.316, 0.684],
    [0.553, 0.447],
  ],
}
