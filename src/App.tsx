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
    <div className="min-h-screen bg-[#0F3B2C] text-[#EAD0AC] flex flex-col font-sans-tech">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stalledCount={stalledCount}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        resetToDefaults={handleReset}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {/* Natural Language AI Command Bar */}
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

      <footer className="bg-[#09231A] border-t border-[#B87333]/40 text-[#C2AB8E] py-8 px-4 text-xs mt-12 font-sans-tech">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-[#EAD0AC] font-serif-display text-sm">
              Assam Mental Health Care Navigator · Operational Prototype v1.0
            </p>
            <p className="text-[11px] text-[#C2AB8E] mt-0.5 font-mono">
              Government of Assam · National Health Mission (NHM) · Health &amp; Family Welfare Department
            </p>
          </div>
          <div className="text-[11px] text-[#C2AB8E] flex flex-col sm:items-end gap-0.5 font-mono">
            <span>Two-Phase Primal Simplex LP &amp; Spatio-Temporal Poisson Surveillance</span>
            <span className="text-[#FFD700] font-semibold">Assam University, Silchar</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
