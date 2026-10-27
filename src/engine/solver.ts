import type { Block, Facility, OptimizationResult } from './types'
import { CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX } from './cacharData'

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const [head, ...tail] = arr
  const withHead = combinations(tail, k - 1).map((c) => [head, ...c])
  const withoutHead = combinations(tail, k)
  return [...withHead, ...withoutHead]
}

export function solveCampAllocation(
  blocks: Block[] = CACHAR_BLOCKS,
  facilities: Facility[] = CACHAR_FACILITIES,
  travelMatrix: number[][] = TRAVEL_TIME_MATRIX,
  P: number = 2,
  includeFloodWeight: boolean = true,
  capacityMultiplier: number = 1.0,
  M: number = 500
): OptimizationResult {
  const startTime = performance.now()
  const I = blocks.length
  const J = facilities.length

  // Calculate demand d_i
  const demands = blocks.map((b) => {
    const raw = (b.population / 10000) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0)
    return Math.round(raw * 10) / 10
  })
  const totalDemand = demands.reduce((acc, v) => acc + v, 0)
  const capacities = facilities.map((f) => f.capacity * capacityMultiplier)

  // 1. Evaluate Status Quo Baseline: Silchar Urban (0) + Lakhipur (1)
  const baselineActive = [0, 1].slice(0, Math.min(P, 2))
  const baselineEval = evaluateConfiguration(baselineActive, I, demands, capacities, travelMatrix, M)
  const baselineMeanTravel = baselineEval.servedDemand > 0 ? baselineEval.weightedTravel / baselineEval.servedDemand : 0

  // 2. Evaluate All Combinations of P Facilities out of J
  const facilityIndices = Array.from({ length: J }, (_, i) => i)
  const allSubsets = combinations(facilityIndices, P)

  let bestCost = Infinity
  let bestActive: number[] = baselineActive
  let bestAssignments: { blockId: number; facilityId: number; travelTime: number; demand: number }[] = []
  let bestServedDemand = 0
  let bestUnservedDemand = 0
  let bestWeightedTravel = 0

  for (const subset of allSubsets) {
    const res = evaluateConfiguration(subset, I, demands, capacities, travelMatrix, M)
    if (res.totalObjective < bestCost) {
      bestCost = res.totalObjective
      bestActive = subset
      bestAssignments = res.assignments
      bestServedDemand = res.servedDemand
      bestUnservedDemand = res.unservedDemand
      bestWeightedTravel = res.weightedTravel
    }
  }

  const optimalMeanTravel = bestServedDemand > 0 ? bestWeightedTravel / bestServedDemand : 0
  const reductionPct =
    baselineMeanTravel > 0 ? ((baselineMeanTravel - optimalMeanTravel) / baselineMeanTravel) * 100 : 0

  const solveTimeMs = Math.round((performance.now() - startTime) * 100) / 100

  return {
    activeFacilityIds: bestActive,
    assignments: bestAssignments,
    meanTravelTime: Math.round(optimalMeanTravel * 10) / 10,
    totalImpedance: Math.round(bestCost),
    unservedDemand: Math.round(((bestUnservedDemand / totalDemand) * 100) * 10) / 10,
    baselineMeanTravelTime: Math.round(baselineMeanTravel * 10) / 10,
    baselineActiveFacilityIds: baselineActive,
    travelTimeReductionPct: Math.round(reductionPct * 10) / 10,
    solveTimeMs,
  }
}

function evaluateConfiguration(
  activeFacs: number[],
  I: number,
  demands: number[],
  capacities: number[],
  travelMatrix: number[][],
  M: number
) {
  const remCap = [...capacities]
  const assignments: { blockId: number; facilityId: number; travelTime: number; demand: number }[] = []
  let weightedTravel = 0
  let servedDemand = 0
  let unservedDemand = 0

  // Greedy sorted priority assignment by transit impedance
  for (let i = 0; i < I; i++) {
    const sortedFacs = [...activeFacs].sort((a, b) => travelMatrix[i][a] - travelMatrix[i][b])
    let blockDemandRemaining = demands[i]

    for (const j of sortedFacs) {
      if (blockDemandRemaining <= 0) break
      const alloc = Math.min(blockDemandRemaining, remCap[j])
      if (alloc > 0) {
        remCap[j] -= alloc
        blockDemandRemaining -= alloc
        servedDemand += alloc
        weightedTravel += alloc * travelMatrix[i][j]
        assignments.push({
          blockId: i,
          facilityId: j,
          travelTime: travelMatrix[i][j],
          demand: Math.round(alloc * 10) / 10,
        })
      }
    }

    if (blockDemandRemaining > 0) {
      unservedDemand += blockDemandRemaining
    }
  }

  const totalObjective = weightedTravel + M * unservedDemand
  return { totalObjective, weightedTravel, servedDemand, unservedDemand, assignments }
}
