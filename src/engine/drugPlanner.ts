import type { Block, Facility, DrugBurnMetrics, DrugTransferRecommendation } from './types'

export const DEFAULT_FACILITY_STOCKS: Record<number, { haloperidol: number; fluoxetine: number; valproate: number }> = {
  0: { haloperidol: 1800, fluoxetine: 4500, valproate: 2800 },
  1: { haloperidol: 800, fluoxetine: 900, valproate: 1200 },
  2: { haloperidol: 1100, fluoxetine: 3100, valproate: 1800 },
  3: { haloperidol: 180, fluoxetine: 220, valproate: 110 },
  4: { haloperidol: 950, fluoxetine: 400, valproate: 600 },
  5: { haloperidol: 700, fluoxetine: 2000, valproate: 1100 },
}

const DRUG_RATES: Record<string, number> = {
  haloperidol: 0.12,
  fluoxetine: 0.35,
  valproate: 0.20,
}

export function computeDrugBurnMetrics(
  blocks: Block[],
  facilities: Facility[],
  customStocks: Record<number, { haloperidol: number; fluoxetine: number; valproate: number }> = DEFAULT_FACILITY_STOCKS
): { metrics: DrugBurnMetrics[]; recommendations: DrugTransferRecommendation[] } {
  const metrics: DrugBurnMetrics[] = []
  const blockMap = new Map<string, Block>(blocks.map((b) => [b.name, b]))

  for (const fac of facilities) {
    const block = blockMap.get(fac.blockName) || blocks[0]
    const distressPatients = block.population * block.baselineDistress * block.floodFactor * 0.05
    const stocks = customStocks[fac.id] || DEFAULT_FACILITY_STOCKS[fac.id] || { haloperidol: 500, fluoxetine: 1000, valproate: 600 }

    for (const drug of ['haloperidol', 'fluoxetine', 'valproate'] as const) {
      const usage = DRUG_RATES[drug]
      const dailyBurn = Math.max(1, Math.round(((distressPatients * usage * 4) / 30) * 10) / 10)
      const stock = stocks[drug]
      const daysOfCover = Math.round((stock / dailyBurn) * 10) / 10
      let status: 'Adequate' | 'Low Stock' | 'Critical' = 'Adequate'
      if (daysOfCover < 15) status = 'Critical'
      else if (daysOfCover < 30) status = 'Low Stock'

      metrics.push({
        facilityId: fac.id,
        facilityName: fac.name,
        blockName: fac.blockName,
        drugName: drug,
        currentStock: stock,
        dailyBurnRate: dailyBurn,
        daysOfCover,
        status,
      })
    }
  }

  const recommendations: DrugTransferRecommendation[] = []
  for (const drug of ['haloperidol', 'fluoxetine', 'valproate'] as const) {
    const drugMetrics = metrics.filter((m) => m.drugName === drug)
    const critical = drugMetrics.filter((m) => m.daysOfCover < 15)
    const surplus = drugMetrics.filter((m) => m.daysOfCover > 30)
    if (critical.length === 0 || surplus.length === 0) continue

    // Donor with most days of cover
    const donor = surplus.sort((a, b) => b.daysOfCover - a.daysOfCover)[0]
    let runningDonorStock = donor.currentStock

    for (const recipient of critical) {
      const currentDonorDays = runningDonorStock / donor.dailyBurnRate
      const donorAvailable = Math.floor(Math.max(0, currentDonorDays - 30) * donor.dailyBurnRate)
      if (donorAvailable < 50) break

      const needTablets = Math.ceil((30 - recipient.daysOfCover) * recipient.dailyBurnRate)
      const transfer = Math.min(needTablets, donorAvailable)
      runningDonorStock -= transfer

      recommendations.push({
        id: `TR-${drug}-${donor.facilityId}-${recipient.facilityId}`,
        drugName: drug,
        fromFacilityName: donor.facilityName,
        toFacilityName: recipient.facilityName,
        unitsToTransfer: transfer,
        donorRemainingDays: Math.round((runningDonorStock / donor.dailyBurnRate) * 10) / 10,
        recipientNewDays: Math.round(((recipient.currentStock + transfer) / recipient.dailyBurnRate) * 10) / 10,
        urgency: recipient.daysOfCover < 7 ? 'Immediate' : 'Standard',
      })
    }
  }

  return { metrics, recommendations }
}
