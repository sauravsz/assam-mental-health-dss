import type { Block, FacilityDrugStock, UserRole } from './types'
import type { RawDistrictData } from './scenarioDataContext'
import { CACHAR_BLOCKS } from './cacharData'
import { DEFAULT_FACILITY_STOCKS } from './drugPlanner'
import { INITIAL_RAW_DISTRICTS } from './scenarioDataContext'

export type ScenarioPresetId = 'baseline' | 'barak_flood' | 'brahmaputra_crisis' | 'festival_surge'

export interface ScenarioPreset {
  id: ScenarioPresetId
  name: string
  badge: string
  description: string
  impactSummary: string
  targetRole: UserRole
  targetTab: 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method'
  districts: RawDistrictData[]
  blocks: Block[]
  drugStocks: Record<number, FacilityDrugStock>
}

export const SCENARIO_PRESETS: Record<ScenarioPresetId, ScenarioPreset> = {
  baseline: {
    id: 'baseline',
    name: 'Post-Monsoon Baseline',
    badge: 'Standard Operations',
    description: 'Post-monsoon statewide equilibrium with historical baseline call volumes across all 35 Assam districts and 2 mobile vans deployed.',
    impactSummary: 'Poisson rates stable statewide; Cachar at 520 calls/month; normal stock cover across all 5 facilities.',
    targetRole: 'State Director',
    targetTab: 'overview',
    districts: INITIAL_RAW_DISTRICTS,
    blocks: CACHAR_BLOCKS,
    drugStocks: DEFAULT_FACILITY_STOCKS,
  },

  barak_flood: {
    id: 'barak_flood',
    name: 'Barak Valley Catastrophic Flood',
    badge: 'Monsoon Crisis · Z = 3.65',
    description: 'Severe riverine inundation along Barak River. Katigorah and Sonai sub-divisions cut off; Tele-MANAS distress calls surge 2.5x.',
    impactSummary: 'Cachar calls jump from 520 to 680 (p < 0.0001); Karimganj hits 310; Katigorah PHC drops to 4 days of Fluoxetine; van allocation strictly prioritized to Katigorah.',
    targetRole: 'District Officer',
    targetTab: 'planner',
    districts: INITIAL_RAW_DISTRICTS.map((d) => {
      if (d.name === 'Cachar') {
        return { ...d, callsLast30Days: 680, floodCrisis: true, allocatedCamps: 2, disparityGap: 'High Deficit' }
      }
      if (d.name === 'Karimganj') {
        return { ...d, callsLast30Days: 310, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' }
      }
      if (d.name === 'Hailakandi') {
        return { ...d, callsLast30Days: 185, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' }
      }
      return d
    }),
    blocks: CACHAR_BLOCKS.map((b) => {
      if (b.name === 'Katigorah') {
        return { ...b, baselineDistress: 195, floodFactor: 2.5 }
      }
      if (b.name === 'Sonai') {
        return { ...b, baselineDistress: 140, floodFactor: 1.8 }
      }
      if (b.name === 'Borkhola') {
        return { ...b, baselineDistress: 110, floodFactor: 1.6 }
      }
      return b
    }),
    drugStocks: {
      ...DEFAULT_FACILITY_STOCKS,
      2: { haloperidol: 250, fluoxetine: 80, valproate: 200 }, // Katigorah critical stockout (4 days cover)
      1: { haloperidol: 2500, fluoxetine: 3800, valproate: 1800 }, // Silchar MCH surplus donor
    },
  },

  brahmaputra_crisis: {
    id: 'brahmaputra_crisis',
    name: 'Brahmaputra Valley Riverine Surge',
    badge: 'Upper Assam Flood · Z = 2.92',
    description: 'Severe seasonal flooding across Upper and Central Assam riverine islands (chars). Dhemaji, Dhubri, and Lakhimpur hit acute psychological distress.',
    impactSummary: 'Dhubri calls jump to 420; Lakhimpur to 260; Barpeta to 340. Rural PHC drug depletion triggers lateral transfer orders.',
    targetRole: 'State Director',
    targetTab: 'state',
    districts: INITIAL_RAW_DISTRICTS.map((d) => {
      if (d.name === 'Dhubri') {
        return { ...d, callsLast30Days: 420, floodCrisis: true, allocatedCamps: 3, disparityGap: 'High Deficit' }
      }
      if (d.name === 'Lakhimpur') {
        return { ...d, callsLast30Days: 260, floodCrisis: true, allocatedCamps: 2, disparityGap: 'High Deficit' }
      }
      if (d.name === 'Barpeta') {
        return { ...d, callsLast30Days: 340, floodCrisis: true, allocatedCamps: 2, disparityGap: 'High Deficit' }
      }
      return d
    }),
    blocks: CACHAR_BLOCKS,
    drugStocks: {
      ...DEFAULT_FACILITY_STOCKS,
      3: { haloperidol: 80, fluoxetine: 450, valproate: 120 }, // Lakhipur stockout
    },
  },

  festival_surge: {
    id: 'festival_surge',
    name: 'Post-Festival Statewide Anxiety Surge',
    badge: 'Urban Surge · Z = 3.84',
    description: 'Post-festival seasonal migration and acute somatic anxiety peak in major municipal centers. Urban helplines overwhelmed.',
    impactSummary: 'Kamrup Metro calls jump to 620 (Z = 3.84); Dibrugarh to 380; stalled care referrals spike across regional referral pipelines.',
    targetRole: 'Counsellor',
    targetTab: 'queue',
    districts: INITIAL_RAW_DISTRICTS.map((d) => {
      if (d.name === 'Kamrup Metropolitan') {
        return { ...d, callsLast30Days: 620, floodCrisis: false, allocatedCamps: 4, disparityGap: 'High Deficit' }
      }
      if (d.name === 'Dibrugarh') {
        return { ...d, callsLast30Days: 380, floodCrisis: false, allocatedCamps: 3, disparityGap: 'Moderate' }
      }
      return d
    }),
    blocks: CACHAR_BLOCKS,
    drugStocks: DEFAULT_FACILITY_STOCKS,
  },
}
