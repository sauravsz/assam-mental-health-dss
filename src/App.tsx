import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { NaturalLanguageBar } from './components/NaturalLanguageBar'
import { StatePolicyView } from './components/StatePolicyView'
import { DMHPCampPlanner } from './components/DMHPCampPlanner'
import { RetentionQueue } from './components/RetentionQueue'
import { useScenarioData } from './engine/scenarioDataContext'

export function App() {
  const [activeTab, setActiveTab] = useState<'state' | 'planner' | 'queue'>('planner')
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

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#3d3d3a] flex flex-col font-sans selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stalledCount={stalledCount}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        resetToDefaults={handleReset}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-10 w-full flex-1">
        {/* Natural Language Scenario Controller */}
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

        {/* Section Surfaces */}
        {activeTab === 'state' && (
          <StatePolicyView
            districts={districts}
            isEditMode={isEditMode}
            updateDistrictCalls={updateDistrictCalls}
            toggleDistrictFlood={toggleDistrictFlood}
          />
        )}

        {activeTab === 'planner' && (
          <DMHPCampPlanner
            blocks={blocks}
            facilities={facilities}
            isEditMode={isEditMode}
            updateBlock={updateBlock}
            updateFacilityCapacity={updateFacilityCapacity}
            updateMedicineStock={updateMedicineStock}
            numVans={numVans}
            setNumVans={setNumVans}
          />
        )}

        {activeTab === 'queue' && (
          <RetentionQueue
            records={referrals}
            setRecords={setReferrals}
            isEditMode={isEditMode}
          />
        )}
      </main>

      {/* Claude Dark Navy Editorial Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 px-4 text-xs mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#cc785c]">
                <path d="M12 2L13.2 9.8L21 11L13.2 12.2L12 20L10.8 12.2L3 11L10.8 9.8L12 2Z" />
              </svg>
              <p className="font-normal text-[#faf9f5] font-serif-claude text-base tracking-tight">
                Assam Mental Health Care Navigator
              </p>
            </div>
            <p className="text-[11px] text-[#8e8b82]">
              Government of Assam · National Health Mission (NHM) · Health &amp; Family Welfare Department
            </p>
          </div>
          <div className="text-[11px] text-[#8e8b82] flex flex-col sm:items-end gap-1">
            <span>Two-Phase Primal Simplex LP &amp; Spatio-Temporal Poisson Surveillance</span>
            <span className="text-[#faf9f5] font-medium">Assam University, Silchar</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
