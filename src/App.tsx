import { useState, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { NaturalLanguageBar } from './components/NaturalLanguageBar'
import { OverviewTab } from './components/tabs/OverviewTab'
import { SurveillanceTab } from './components/tabs/SurveillanceTab'
import { CampSitingTab } from './components/tabs/CampSitingTab'
import { LogisticsTab } from './components/tabs/LogisticsTab'
import { QueueTab } from './components/tabs/QueueTab'
import { useScenarioData } from './engine/scenarioDataContext'
import { solveCampAllocation } from './engine/solver'
import { TRAVEL_TIME_MATRIX } from './engine/cacharData'
import type { DssTab } from './engine/commandParser'

export function App() {
  const [activeTab, setActiveTab] = useState<DssTab>('ov')
  const [numVans, setNumVans] = useState<number>(2)

  const {
    isEditMode,
    setIsEditMode,
    blocks,
    facilities,
    rawDistricts,
    districts,
    referrals,
    setReferrals,
    updateBlock,
    updateFacilityCapacity,
    updateMedicineStock,
    updateDistrictCalls,
    toggleDistrictFlood,
    resetToDefaults,
  } = useScenarioData()

  const stalledCount = referrals.filter((r) => r.status === 'Stalled').length

  const handleReset = () => {
    resetToDefaults()
    setNumVans(2)
  }

  // Pre-calculate optimization result for overview & siting
  const optimizationResult = useMemo(() => {
    return solveCampAllocation(blocks, facilities, TRAVEL_TIME_MATRIX, numVans, true, 1.0)
  }, [blocks, facilities, numVans])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Container matching dss-1 .wrap: max-width 1080px */}
      <div className="max-w-[1080px] mx-auto px-4 py-5 pb-16">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stalledCount={stalledCount}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          resetToDefaults={handleReset}
        />

        {/* Compact Natural Language Command Bar */}
        <NaturalLanguageBar
          blocks={blocks}
          facilities={facilities}
          rawDistricts={rawDistricts}
          setActiveTab={setActiveTab}
          updateBlock={updateBlock}
          updateFacilityCapacity={updateFacilityCapacity}
          updateMedicineStock={updateMedicineStock}
          updateDistrictCalls={updateDistrictCalls}
          toggleDistrictFlood={toggleDistrictFlood}
          resetToDefaults={handleReset}
          setNumVans={setNumVans}
        />

        {/* 5 Distinct Purpose-Built Tabs */}
        {activeTab === 'ov' && (
          <OverviewTab
            blocks={blocks}
            facilities={facilities}
            optimizationResult={optimizationResult}
            includeFloodWeight={true}
          />
        )}

        {activeTab === 'surv' && (
          <SurveillanceTab
            districts={districts}
            isEditMode={isEditMode}
            updateDistrictCalls={updateDistrictCalls}
            toggleDistrictFlood={toggleDistrictFlood}
          />
        )}

        {activeTab === 'res' && (
          <CampSitingTab
            blocks={blocks}
            facilities={facilities}
            isEditMode={isEditMode}
            updateBlock={updateBlock}
            updateFacilityCapacity={updateFacilityCapacity}
            numVans={numVans}
            setNumVans={setNumVans}
          />
        )}

        {activeTab === 'med' && (
          <LogisticsTab
            blocks={blocks}
            facilities={facilities}
            isEditMode={isEditMode}
            updateMedicineStock={updateMedicineStock}
          />
        )}

        {activeTab === 'que' && (
          <QueueTab
            records={referrals}
            setRecords={setReferrals}
            isEditMode={isEditMode}
          />
        )}

        {/* Subtle Minimal Footer matching dss-1 print/footer */}
        <div className="mt-12 pt-4 border-t border-[var(--line)] text-[12px] text-[var(--mut)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Assam Mental Health Decision Support System · Operational Prototype v1.0
          </span>
          <span>
            Two-Phase Primal Simplex LP &amp; Poisson Surveillance · Assam University, Silchar
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
