import type { Block, Facility } from './types'
import type { RawDistrictData } from './scenarioDataContext'

export interface ParsedCommandResult {
  success: boolean
  feedback: string
  suggestedPrompt?: string
}

export function parseNaturalLanguageCommand(
  input: string,
  context: {
    blocks: Block[]
    facilities: Facility[]
    rawDistricts: RawDistrictData[]
    setNumVans?: (n: number) => void
    setIncludeFloodWeight?: (b: boolean) => void
    setActiveTab: (tab: 'state' | 'planner' | 'queue') => void
    updateBlock: (blockId: number, field: keyof Block, value: number) => void
    updateFacilityCapacity: (facId: number, capacity: number) => void
    updateMedicineStock: (
      facId: number,
      med: 'haloperidol' | 'fluoxetine' | 'valproate',
      status: 'Adequate' | 'Low Stock' | 'Critical'
    ) => void
    updateDistrictCalls: (districtId: string, calls: number) => void
    toggleDistrictFlood: (districtId: string) => void
    resetToDefaults: () => void
  }
): ParsedCommandResult {
  const q = input.trim().toLowerCase()
  if (!q) {
    return { success: false, feedback: 'Please type a command or scenario adjustment.' }
  }

  // 1. Reset command
  if (q.includes('reset') || q.includes('clear scenario') || q.includes('default') || q.includes('start over')) {
    context.resetToDefaults()
    return {
      success: true,
      feedback: 'Reset all blocks, clinic capacities, medicine stocks, and district calls to official NHM Cachar defaults.',
    }
  }

  // 2. Navigation commands
  if (q.includes('tab 1') || q.includes('call trend') || q.includes('state view') || q.includes('surveillance') || q.includes('spike detector')) {
    context.setActiveTab('state')
    return { success: true, feedback: 'Navigated to Tab 1: State Call Trends & Poisson Surveillance.' }
  }
  if (q.includes('tab 2') || q.includes('van route') || q.includes('camp planner') || q.includes('map') || q.includes('optimizer') || q.includes('siting')) {
    context.setActiveTab('planner')
    return { success: true, feedback: 'Navigated to Tab 2: DMHP Mobile Van Camp Planner & Map.' }
  }
  if (q.includes('tab 3') || q.includes('follow-up') || q.includes('follow up') || q.includes('queue') || q.includes('retention') || q.includes('counsellor')) {
    context.setActiveTab('queue')
    return { success: true, feedback: 'Navigated to Tab 3: Closed-Loop Care Retention Queue.' }
  }

  // 3. Van budget adjustments (e.g., "set vans to 3", "we have 1 van", "3 vans")
  const vanMatch = q.match(/(?:set|use|deploy|budget|have)?\s*([123])\s*(?:mobile\s*)?vans?/) || q.match(/vans?\s*(?:to|=)?\s*([123])/)
  if (vanMatch && context.setNumVans) {
    const count = parseInt(vanMatch[1])
    context.setNumVans(count)
    context.setActiveTab('planner')
    return {
      success: true,
      feedback: `Set available mobile vans to P = ${count}. Linear Programming optimizer re-ran instantly.`,
    }
  }

  // 4. Flood Factor Adjustments
  // E.g. "floods hit Katigorah", "Katigorah flood factor 2.5", "flood sonai and katigorah"
  const floodMultiplierMatch = q.match(/(?:set|make)?\s*([a-z\s]+)\s*flood(?:\s*factor|\s*multiplier)?\s*(?:to|=)?\s*([0-9.]+)/)
  if (floodMultiplierMatch) {
    const blockQuery = floodMultiplierMatch[1].trim()
    const factor = parseFloat(floodMultiplierMatch[2])
    const matchedBlock = context.blocks.find((b) => b.name.toLowerCase().includes(blockQuery))
    if (matchedBlock) {
      context.updateBlock(matchedBlock.id, 'floodFactor', Math.min(3.0, Math.max(1.0, factor)))
      context.setActiveTab('planner')
      return {
        success: true,
        feedback: `Updated ${matchedBlock.name} flood vulnerability factor to ${factor}x. LP solver recalculated optimal routes.`,
      }
    }
  }

  // General flood keyword e.g. "flood in Katigorah"
  for (const block of context.blocks) {
    if (q.includes(block.name.toLowerCase()) && (q.includes('flood') || q.includes('inundat') || q.includes('submerge'))) {
      const isSevere = q.includes('heavy') || q.includes('severe') || q.includes('high') || q.includes('crisis')
      const factor = isSevere ? 2.5 : 2.0
      context.updateBlock(block.id, 'floodFactor', factor)
      context.setActiveTab('planner')
      return {
        success: true,
        feedback: `Severe flood shock applied to ${block.name} (factor set to ${factor}x). Optimizer prioritized this catchment.`,
      }
    }
  }

  // 5. Population adjustments (e.g. "Silchar population 300000", "Katigorah population to 220000")
  for (const block of context.blocks) {
    if (q.includes(block.name.toLowerCase()) && (q.includes('pop') || q.includes('people') || q.includes('residents') || q.includes('citizens'))) {
      const numMatch = q.match(/(\d[\d,\.]+)\s*(k|lakh|thousand)?/)
      if (numMatch) {
        let val = parseFloat(numMatch[1].replace(/,/g, ''))
        const unit = numMatch[2]
        if (unit === 'k' || unit === 'thousand') val *= 1000
        else if (unit === 'lakh') val *= 100000
        else if (val < 1000) val *= 1000 // reasonable heuristic if user typed e.g. "250k" as "250"
        context.updateBlock(block.id, 'population', Math.round(val))
        context.setActiveTab('planner')
        return {
          success: true,
          feedback: `Updated ${block.name} population to ${Math.round(val).toLocaleString()}. Burden score updated.`,
        }
      }
    }
  }

  // 6. Clinic Capacity (e.g. "Katigorah capacity 100", "Silchar hospital capacity 150", "Dholai capacity 50")
  for (const fac of context.facilities) {
    const firstName = fac.name.split(' ')[0].toLowerCase()
    if (q.includes(firstName) && (q.includes('cap') || q.includes('intake') || q.includes('beds') || q.includes('patients'))) {
      const numMatch = q.match(/(\d+)/)
      if (numMatch) {
        const cap = parseInt(numMatch[1])
        context.updateFacilityCapacity(fac.id, cap)
        context.setActiveTab('planner')
        return {
          success: true,
          feedback: `Updated ${fac.name} intake capacity to ${cap} patients/day. Solver re-evaluated capacity limits.`,
        }
      }
    }
  }

  // 7. Medicine Stock (e.g. "Katigorah ran out of Fluoxetine", "Haloperidol is low in Sonai", "Restock Fluoxetine at Katigorah")
  for (const fac of context.facilities) {
    const firstName = fac.name.split(' ')[0].toLowerCase()
    if (q.includes(firstName)) {
      let med: 'haloperidol' | 'fluoxetine' | 'valproate' | null = null
      if (q.includes('fluox') || q.includes('prozac') || q.includes('antidepressant')) med = 'fluoxetine'
      else if (q.includes('halo') || q.includes('antipsychotic')) med = 'haloperidol'
      else if (q.includes('valp') || q.includes('sodium')) med = 'valproate'

      if (med) {
        let status: 'Adequate' | 'Low Stock' | 'Critical' = 'Critical'
        if (q.includes('restock') || q.includes('adequate') || q.includes('full') || q.includes('available')) {
          status = 'Adequate'
        } else if (q.includes('low') || q.includes('short')) {
          status = 'Low Stock'
        } else if (q.includes('out') || q.includes('critical') || q.includes('empty') || q.includes('depleted') || q.includes('none')) {
          status = 'Critical'
        }
        context.updateMedicineStock(fac.id, med, status)
        context.setActiveTab('planner')
        return {
          success: true,
          feedback: `Updated ${fac.name} ${med} pharmacy stock to: ${status}.`,
        }
      }
    }
  }

  // 8. District Calls & Surges (Tab 1)
  // E.g. "Dima Hasao calls 80", "Cachar calls 600", "outbreak in Karimganj"
  for (const dist of context.rawDistricts) {
    if (q.includes(dist.name.toLowerCase())) {
      if (q.includes('flood')) {
        context.toggleDistrictFlood(dist.id)
        context.setActiveTab('state')
        return {
          success: true,
          feedback: `Toggled flood inundation status for ${dist.name}.`,
        }
      }
      const numMatch = q.match(/(\d+)/)
      if (numMatch) {
        const calls = parseInt(numMatch[1])
        context.updateDistrictCalls(dist.id, calls)
        context.setActiveTab('state')
        return {
          success: true,
          feedback: `Updated ${dist.name} 30-day calls to ${calls}. Poisson tail probability p-value recalculated.`,
        }
      }
    }
  }

  return {
    success: false,
    feedback: `Could not determine action for: "${input}". Try: "Floods hit Katigorah", "Set vans to 3", "Katigorah ran out of Fluoxetine", or "Dima Hasao calls to 80".`,
    suggestedPrompt: 'Floods hit Katigorah to 2.5x',
  }
}
