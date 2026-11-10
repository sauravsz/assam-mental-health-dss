import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Block, Facility, DistrictDistress, ReferralRecord, UserRole, AuditLogEntry, FacilityDrugStock } from './types'
import { CACHAR_BLOCKS, CACHAR_FACILITIES } from './cacharData'
import { computePoissonTail } from './stateSurveillance'
import { generateSyntheticStalledReferrals } from './referralData'
import { INITIAL_AUDIT_LOGS, appendAuditLog, verifyAuditChain, simulateTamper } from './auditLogger'
import { processTeleManasCsv } from './csvIngest'
import { computeDrugBurnMetrics, DEFAULT_FACILITY_STOCKS } from './drugPlanner'

export interface RawDistrictData {
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

export const INITIAL_RAW_DISTRICTS: RawDistrictData[] = [
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

export function computeDistrictDistressList(rawList: RawDistrictData[]): DistrictDistress[] {
  return rawList.map((raw) => {
    const { pValue, formatted: pValueFormatted, zScore } = computePoissonTail(raw.callsLast30Days, raw.poissonExpected)
    const isSurge = pValue < 0.01
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
}

const STORAGE_KEYS = {
  BLOCKS: 'amh_dss_blocks_v1',
  FACILITIES: 'amh_dss_facilities_v1',
  RAW_DISTRICTS: 'amh_dss_districts_v1',
  REFERRALS: 'amh_dss_referrals_v1',
  IS_EDIT_MODE: 'amh_dss_is_edit_mode_v1',
  USER_ROLE: 'amh_dss_role_v1',
  AUDIT_LOG: 'amh_dss_audit_log_v1',
  SELECTED_DISTRICT: 'amh_dss_selected_district_v1',
  DRUG_STOCKS: 'amh_dss_drug_stocks_v1',
  THEME: 'amh_dss_theme_v1',
}

function useScenarioDataInner() {
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_EDIT_MODE)
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try { return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole) || 'State Director' } catch { return 'State Director' }
  })
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEYS.SELECTED_DISTRICT) || 'All Districts' } catch { return 'All Districts' }
  })
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG); return s ? JSON.parse(s) : INITIAL_AUDIT_LOGS } catch { return INITIAL_AUDIT_LOGS }
  })
  const [customDrugStocks, setCustomDrugStocks] = useState<Record<number, FacilityDrugStock>>(() => { try { const s = localStorage.getItem(STORAGE_KEYS.DRUG_STOCKS); return s ? JSON.parse(s) : DEFAULT_FACILITY_STOCKS } catch { return DEFAULT_FACILITY_STOCKS } })
  const [isChainValid, setIsChainValid] = useState(true)
  const [chainBreakReason, setChainBreakReason] = useState<string | undefined>()

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME)
      if (saved === 'light' || saved === 'dark') return saved
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
      return 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch {}
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  useEffect(() => {
    const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
    save(STORAGE_KEYS.USER_ROLE, userRole)
  }, [userRole])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SELECTED_DISTRICT, selectedDistrictFilter) } catch {} }, [selectedDistrictFilter])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLogs)) } catch {} }, [auditLogs])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.DRUG_STOCKS, JSON.stringify(customDrugStocks)) } catch {} }, [customDrugStocks])
  useEffect(() => {
    verifyAuditChain(auditLogs).then((res) => { setIsChainValid(res.isValid); setChainBreakReason(res.reason) })
  }, [auditLogs])

  const logAction = useCallback(async (action: string, details: string) => {
    // Use functional update to guarantee chain integrity even with rapid successive calls
    setAuditLogs((prev) => {
      // fire-and-forget hash append; chain verification runs after state settles
      appendAuditLog(prev, userRole, selectedDistrictFilter, action, details).then((next) => setAuditLogs(next))
      return prev
    })
  }, [userRole, selectedDistrictFilter])

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role)
    setAuditLogs((prev) => prev)
  }, [])

const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOCKS)
      return saved ? JSON.parse(saved) : CACHAR_BLOCKS
    } catch {
      return CACHAR_BLOCKS
    }
  })

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES)
      return saved ? JSON.parse(saved) : CACHAR_FACILITIES
    } catch {
      return CACHAR_FACILITIES
    }
  })

  const [rawDistricts, setRawDistricts] = useState<RawDistrictData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RAW_DISTRICTS)
      return saved ? JSON.parse(saved) : INITIAL_RAW_DISTRICTS
    } catch {
      return INITIAL_RAW_DISTRICTS
    }
  })

  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERRALS)
      return saved ? JSON.parse(saved) : generateSyntheticStalledReferrals(434)
    } catch {
      return generateSyntheticStalledReferrals(434)
    }
  })

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks))
    } catch {}
  }, [blocks])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities))
    } catch {}
  }, [facilities])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RAW_DISTRICTS, JSON.stringify(rawDistricts))
    } catch {}
  }, [rawDistricts])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals))
    } catch {}
  }, [referrals])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_EDIT_MODE, JSON.stringify(isEditMode))
    } catch {}
  }, [isEditMode])

  const resetToDefaults = () => {
    setBlocks(CACHAR_BLOCKS)
    setFacilities(CACHAR_FACILITIES)
    setRawDistricts(INITIAL_RAW_DISTRICTS)
    setReferrals(generateSyntheticStalledReferrals(434))
    setAuditLogs(INITIAL_AUDIT_LOGS)
    setCustomDrugStocks(DEFAULT_FACILITY_STOCKS)
    try {
      localStorage.removeItem(STORAGE_KEYS.BLOCKS)
      localStorage.removeItem(STORAGE_KEYS.FACILITIES)
      localStorage.removeItem(STORAGE_KEYS.RAW_DISTRICTS)
      localStorage.removeItem(STORAGE_KEYS.REFERRALS)
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOG)
      localStorage.removeItem(STORAGE_KEYS.DRUG_STOCKS)
    } catch {}
  }

  // Update a single block parameter
  const updateBlock = (blockId: number, field: keyof Block, value: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, [field]: value } : b))
    )
  }

  // Update a clinic capacity or medicine stock
  const updateFacilityCapacity = (facId: number, capacity: number) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facId ? { ...f, capacity: Math.max(10, capacity) } : f))
    )
  }

  const updateMedicineStock = (
    facId: number,
    med: 'haloperidol' | 'fluoxetine' | 'valproate',
    status: 'Adequate' | 'Low Stock' | 'Critical'
  ) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facId
          ? {
              ...f,
              medicineStock: {
                ...f.medicineStock,
                [med]: status,
              },
            }
          : f
      )
    )
    // Keep the numeric stock in sync so badges and daysOfCover never disagree (single source of truth)
    const numericTarget = status === 'Adequate' ? 2000 : status === 'Low Stock' ? 600 : 100
    setCustomDrugStocks((prev) => ({
      ...prev,
      [facId]: {
        ...(prev[facId] || DEFAULT_FACILITY_STOCKS[facId] || { haloperidol: 500, fluoxetine: 1000, valproate: 600 }),
        [med]: numericTarget,
      },
    }))
  }

  // Update a district call count or flood state
  const updateDistrictCalls = (districtId: string, calls: number) => {
    setRawDistricts((prev) =>
      prev.map((d) => (d.id === districtId ? { ...d, callsLast30Days: Math.max(0, calls) } : d))
    )
  }

  const toggleDistrictFlood = (districtId: string) => {
    setRawDistricts((prev) =>
      prev.map((d) => (d.id === districtId ? { ...d, floodCrisis: !d.floodCrisis } : d))
    )
  }

    const { metrics: drugMetrics, recommendations: drugRecommendations } = computeDrugBurnMetrics(blocks, facilities, customDrugStocks)

  const simulateTamperAction = useCallback(() => {
    setAuditLogs((prev) => simulateTamper(prev))
  }, [])

  const ingestCsv = useCallback(async (csvText: string) => {
    const res = await processTeleManasCsv(csvText)
    if (res.success) {
      if (res.insertedDistrictSummary.length > 0) {
        setRawDistricts((prev) =>
          prev.map((d) => {
            const match = res.insertedDistrictSummary.find(
              (s) => s.district.toLowerCase() === d.name.toLowerCase()
            )
            return match ? { ...d, callsLast30Days: match.callCount } : d
          })
        )
      }
      const entry = await appendAuditLog(auditLogs, userRole, selectedDistrictFilter, 'CSV_DATA_INGEST', `Ingested ${res.acceptedRows} records, hashed ${res.hashedFieldsCount} caller IDs`)
      setAuditLogs(entry)
    }
    return res
  }, [auditLogs, userRole, selectedDistrictFilter])

const computedDistricts = computeDistrictDistressList(rawDistricts)

  return {
    isEditMode,
    userRole,
    setUserRole,
    selectedDistrictFilter,
    setSelectedDistrictFilter,
    auditLogs,
    isChainValid,
    chainBreakReason,
    customDrugStocks,
    drugMetrics,
    drugRecommendations,
    logAction,
    simulateTamper: simulateTamperAction,
    ingestCsv,
    setIsEditMode,
    blocks,
    facilities,
    rawDistricts,
    districts: computedDistricts,
    referrals,
    setReferrals,
    updateBlock,
    updateFacilityCapacity,
    updateMedicineStock,
    updateDistrictCalls,
    toggleDistrictFlood,
    resetToDefaults,
    theme,
    toggleTheme,
    setTheme: setThemeState,
  }
}

export type ScenarioData = ReturnType<typeof useScenarioDataInner>

const ScenarioContext = createContext<ScenarioData | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const value = useScenarioDataInner()
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenarioData(): ScenarioData {
  const ctx = useContext(ScenarioContext)
  if (!ctx) {
    throw new Error('useScenarioData must be used within <ScenarioProvider>')
  }
  return ctx
}
