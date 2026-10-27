export interface Block {
  id: number
  name: string
  population: number
  baselineDistress: number
  floodFactor: number
  coords: { x: number; y: number } // Percentage on map canvas
}

export interface Facility {
  id: number
  name: string
  blockName: string
  capacity: number
  coords: { x: number; y: number }
  medicineStock: {
    haloperidol: 'Adequate' | 'Low Stock' | 'Critical'
    fluoxetine: 'Adequate' | 'Low Stock' | 'Critical'
    valproate: 'Adequate' | 'Low Stock' | 'Critical'
  }
}

export interface OptimizationResult {
  activeFacilityIds: number[]
  assignments: { blockId: number; facilityId: number; travelTime: number; demand: number }[]
  meanTravelTime: number
  totalImpedance: number
  unservedDemand: number
  baselineMeanTravelTime: number
  baselineActiveFacilityIds: number[]
  travelTimeReductionPct: number
  solveTimeMs: number
}

export interface DistrictDistress {
  id: string
  name: string
  zone: 'Barak Valley' | 'Brahmaputra Valley' | 'Hill Districts'
  population: number
  callsLast30Days: number
  callsPer100k: number
  poissonExpected: number
  zScore: number
  floodCrisis: boolean
  isSurge: boolean
  allocatedCamps: number
  disparityGap: 'High Deficit' | 'Moderate' | 'Equitable'
}

export interface ReferralRecord {
  id: string
  callerHash: string
  district: string
  block: string
  language: 'Assamese' | 'Bengali' | 'Bodo' | 'Hindi' | 'English'
  ageBand: 'Under 18' | '18-29' | '30-44' | '45-59' | '60+'
  gender: 'M' | 'F' | 'Transgender' | 'Undisclosed'
  mhgapCode: 'Depression' | 'Anxiety' | 'Substance' | 'Self-Harm' | 'Psychosis' | 'Child/Adol'
  tierReached: 1 | 2
  daysStalled: number
  assignedFacility: string
  consentRecorded: boolean
  status: 'Stalled' | 'Follow-up Initiated' | 'ASHA Dispatched' | 'Resolved' | 'Defaulted'
  followupAttempts: number
  lastContactNote?: string
}
