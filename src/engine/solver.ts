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

/**
 * Exact Two-Phase Simplex Solver for the Capacitated Transportation LP:
 * min sum_{i, k} c_{i, active[k]} * x_{ik} + M * sum_i u_i
 * s.t.
 *   sum_k x_{ik} + u_i = d_i      (for all i in 1..I)
 *   sum_i x_{ik} + s_k = K_k      (for all k in 1..|active|)
 *   x_{ik} >= 0, u_i >= 0, s_k >= 0
 */
function solveTransportationLP(
  activeFacs: number[],
  I: number,
  demands: number[],
  capacities: number[],
  travelMatrix: number[][],
  M: number
) {
  const K = activeFacs.length
  const m = I + K // I demand equalities + K capacity slack equalities
  const n = I * K + I + K // x_{ik} (I*K), u_i (I), s_k (K)

  const cost = new Array(n).fill(0)
  for (let i = 0; i < I; i++) {
    for (let k = 0; k < K; k++) {
      cost[i * K + k] = travelMatrix[i][activeFacs[k]]
    }
    cost[I * K + i] = M
  }

  // Build tableau: m rows, n + m + 1 columns for Phase 1
  const tableau: number[][] = []
  for (let r = 0; r < m; r++) {
    const row = new Array(n + m + 1).fill(0)
    if (r < I) {
      // Demand constraint i: sum_k x_{ik} + u_i = d_i
      const i = r
      for (let k = 0; k < K; k++) row[i * K + k] = 1
      row[I * K + i] = 1
      row[n + r] = 1 // artificial variable
      row[n + m] = demands[i]
    } else {
      // Capacity constraint k: sum_i x_{ik} + s_k = K_k
      const k = r - I
      for (let i = 0; i < I; i++) row[i * K + k] = 1
      row[I * K + I + k] = 1 // slack variable
      row[n + r] = 1 // artificial variable
      row[n + m] = capacities[activeFacs[k]]
    }
    tableau.push(row)
  }

  // Phase 1 objective row: minimize sum of artificials
  const p1Obj = new Array(n + m + 1).fill(0)
  for (let j = 0; j < n + m + 1; j++) {
    let sum = 0
    for (let r = 0; r < m; r++) sum += tableau[r][j]
    p1Obj[j] = -sum
  }
  tableau.push(p1Obj)

  const basis: number[] = []
  for (let r = 0; r < m; r++) basis.push(n + r)

  function pivot(pRow: number, pCol: number) {
    const pVal = tableau[pRow][pCol]
    for (let j = 0; j < tableau[pRow].length; j++) tableau[pRow][j] /= pVal
    for (let r = 0; r < tableau.length; r++) {
      if (r !== pRow) {
        const factor = tableau[r][pCol]
        if (Math.abs(factor) > 1e-9) {
          for (let j = 0; j < tableau[r].length; j++) {
            tableau[r][j] -= factor * tableau[pRow][j]
          }
        }
      }
    }
    basis[pRow] = pCol
  }

  // Phase 1 iterations
  while (true) {
    let minVal = -1e-7
    let pCol = -1
    for (let j = 0; j < n + m; j++) {
      if (tableau[m][j] < minVal) {
        minVal = tableau[m][j]
        pCol = j
      }
    }
    if (pCol === -1) break

    let minRatio = Infinity
    let pRow = -1
    for (let r = 0; r < m; r++) {
      if (tableau[r][pCol] > 1e-7) {
        const ratio = tableau[r][n + m] / tableau[r][pCol]
        if (ratio < minRatio) {
          minRatio = ratio
          pRow = r
        }
      }
    }
    if (pRow === -1) break
    pivot(pRow, pCol)
  }

  // Remove artificial columns
  for (let r = 0; r < m; r++) {
    tableau[r].splice(n, m)
  }

  // Phase 2: compute actual reduced costs
  const p2Obj = new Array(n + 1).fill(0)
  for (let j = 0; j < n; j++) p2Obj[j] = cost[j]
  p2Obj[n] = 0

  for (let r = 0; r < m; r++) {
    const basicVar = basis[r]
    if (basicVar < n) {
      const cBasic = cost[basicVar]
      for (let j = 0; j <= n; j++) {
        p2Obj[j] -= cBasic * tableau[r][j]
      }
    }
  }
  tableau[m] = p2Obj

  // Phase 2 iterations
  while (true) {
    let minVal = -1e-7
    let pCol = -1
    for (let j = 0; j < n; j++) {
      if (tableau[m][j] < minVal) {
        minVal = tableau[m][j]
        pCol = j
      }
    }
    if (pCol === -1) break

    let minRatio = Infinity
    let pRow = -1
    for (let r = 0; r < m; r++) {
      if (tableau[r][pCol] > 1e-7) {
        const ratio = tableau[r][n] / tableau[r][pCol]
        if (ratio < minRatio) {
          minRatio = ratio
          pRow = r
        }
      }
    }
    if (pRow === -1) break
    pivot(pRow, pCol)
  }

  const sol = new Array(n).fill(0)
  for (let r = 0; r < m; r++) {
    if (basis[r] < n) {
      sol[basis[r]] = Math.max(0, tableau[r][n])
    }
  }

  const assignments: { blockId: number; facilityId: number; travelTime: number; demand: number }[] = []
  let weightedTravel = 0
  let servedDemand = 0
  let unservedDemand = 0

  for (let i = 0; i < I; i++) {
    const u_val = sol[I * K + i]
    unservedDemand += u_val
    for (let k = 0; k < K; k++) {
      const x_ik = sol[i * K + k]
      if (x_ik > 1e-4) {
        const facId = activeFacs[k]
        const tTime = travelMatrix[i][facId]
        servedDemand += x_ik
        weightedTravel += x_ik * tTime
        assignments.push({
          blockId: i,
          facilityId: facId,
          travelTime: tTime,
          demand: Math.round(x_ik * 100) / 100,
        })
      }
    }
  }

  const totalObjective = weightedTravel + M * unservedDemand
  return { totalObjective, weightedTravel, servedDemand, unservedDemand, assignments }
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

  // Calculate demand d_i strictly synchronized with test_suite.py
  const demands = blocks.map((b) => {
    const raw = (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0)
    return Math.round(raw * 100) / 100
  })
  const totalDemand = demands.reduce((acc, v) => acc + v, 0)
  const capacities = facilities.map((f) => f.capacity * capacityMultiplier)

  // 1. Evaluate Status Quo Baseline: SM Dev Civil Hospital (0) + Lakhipur (1)
  const baselineActive = [0, 1].slice(0, Math.min(P, 2))
  const baselineEval = solveTransportationLP(baselineActive, I, demands, capacities, travelMatrix, M)
  const baselineMeanTravel = baselineEval.servedDemand > 0 ? baselineEval.weightedTravel / baselineEval.servedDemand : 0

  // 2. Evaluate All Combinations of P Facilities out of J via exact Transportation Simplex
  const facilityIndices = Array.from({ length: J }, (_, i) => i)
  const allSubsets = combinations(facilityIndices, P)

  let bestCost = Infinity
  let bestActive: number[] = baselineActive
  let bestAssignments: { blockId: number; facilityId: number; travelTime: number; demand: number }[] = []
  let bestServedDemand = 0
  let bestUnservedDemand = 0
  let bestWeightedTravel = 0

  for (const subset of allSubsets) {
    const res = solveTransportationLP(subset, I, demands, capacities, travelMatrix, M)
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
