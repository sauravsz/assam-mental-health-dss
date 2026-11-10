import { describe, it, expect } from 'vitest'
import { computePoissonTail } from './stateSurveillance'
import { solveCampAllocation } from './solver'
import { verifyAuditChain, appendAuditLog, simulateTamper, INITIAL_AUDIT_LOGS } from './auditLogger'
import { CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX } from './cacharData'
import { SCENARIO_PRESETS } from './scenarioPresets'

describe('Poisson tail', () => {
  it('tiny observed returns p=1', () => {
    expect(computePoissonTail(0, 340).pValue).toBe(1.0)
  })
  it('observed == expected gives p approx 0.5-0.6', () => {
    const p = computePoissonTail(340, 340).pValue
    expect(p).toBeGreaterThan(0.45)
    expect(p).toBeLessThan(0.65)
  })
  it('observed >> expected gives small p and positive Z', () => {
    const { pValue, zScore } = computePoissonTail(520, 340)
    expect(pValue).toBeLessThan(0.001)
    expect(zScore).toBeGreaterThan(2.5)
  })
  it('monotone: larger observed yields smaller p', () => {
    const a = computePoissonTail(360, 340).pValue
    const b = computePoissonTail(420, 340).pValue
    expect(b).toBeLessThan(a)
  })
})

describe('Simplex solver', () => {
  it('returns an assignment for every block', () => {
    const res = solveCampAllocation(CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX, 2, false, 1.0)
    expect(res.assignments.length).toBe(CACHAR_BLOCKS.length)
    expect(res.meanTravelTime).toBeGreaterThan(0)
  })
  it('optimal mean is no worse than HQ-first baseline', () => {
    const res = solveCampAllocation(CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX, 2, false, 1.0)
    expect(res.meanTravelTime).toBeLessThanOrEqual(res.baselineMeanTravelTime)
  })
  it('active facility count equals vans requested', () => {
    const res = solveCampAllocation(CACHAR_BLOCKS, CACHAR_FACILITIES, TRAVEL_TIME_MATRIX, 2, true, 1.0)
    expect(res.activeFacilityIds.length).toBe(2)
  })
})

describe('Audit chain', () => {
  it('genesis audit log verifies with genuine SHA-256', async () => {
    const v = await verifyAuditChain(INITIAL_AUDIT_LOGS)
    expect(v.isValid).toBe(true)
  })

  it('fresh chain of appends verifies', async () => {
    let logs = [...INITIAL_AUDIT_LOGS]
    logs = await appendAuditLog(logs, 'District Officer', 'Cachar', 'ROLE_SWITCH', 'switched')
    logs = await appendAuditLog(logs, 'Counsellor', 'Cachar', 'REFERRAL_OUTCOME', 'case REF-1 callback')
    const v = await verifyAuditChain(logs)
    expect(v.isValid).toBe(true)
    expect(logs.length).toBe(3)
  })

  it('simulateTamper mutates an entry and breaks verification', async () => {
    const tampered = simulateTamper(INITIAL_AUDIT_LOGS)
    expect(tampered[0].details).toContain('TAMPERED')
    const v = await verifyAuditChain(tampered)
    expect(v.isValid).toBe(false)
  })
})

describe('Scenario Presets', () => {
  it('all four canonical presets exist with complete fields', () => {
    const presets = Object.keys(SCENARIO_PRESETS)
    expect(presets).toContain('baseline')
    expect(presets).toContain('barak_flood')
    expect(presets).toContain('brahmaputra_crisis')
    expect(presets).toContain('festival_surge')
  })

  it('barak_flood preset triggers significant Poisson surge in Cachar', () => {
    const floodPreset = SCENARIO_PRESETS.barak_flood
    const cachar = floodPreset.districts.find((d) => d.name === 'Cachar')
    expect(cachar).toBeDefined()
    expect(cachar?.floodCrisis).toBe(true)
    expect(cachar?.callsLast30Days).toBe(680)

    const katigorah = floodPreset.blocks.find((b) => b.name === 'Katigorah')
    expect(katigorah?.floodFactor).toBe(2.5)

    const { zScore, pValue } = computePoissonTail(cachar!.callsLast30Days, cachar!.poissonExpected)
    expect(zScore).toBeGreaterThan(2.5)
    expect(pValue).toBeLessThan(0.01)
  })

  it('festival_surge preset models urban anxiety spike in Kamrup Metro', () => {
    const festPreset = SCENARIO_PRESETS.festival_surge
    const kamrup = festPreset.districts.find((d) => d.name === 'Kamrup Metropolitan')
    expect(kamrup?.callsLast30Days).toBe(620)
    const { zScore } = computePoissonTail(kamrup!.callsLast30Days, kamrup!.poissonExpected)
    expect(zScore).toBeGreaterThan(3.0)
  })
})
