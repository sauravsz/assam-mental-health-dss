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
    <div className="min-h-screen bg-[#07080a] text-[#cdcdcd] flex flex-col font-sans selection:bg-[#57c1ff]/20 selection:text-white relative">
      {/* Raycast Signature Hero Stripe Accent Band */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#ff5757] via-[#ff6161] to-[#a1131a]"></div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stalledCount={stalledCount}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        resetToDefaults={handleReset}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
        {/* Natural Language AI Command Bar (Raycast Command Palette Style) */}
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

      {/* Raycast Minimal Footer */}
      <footer className="bg-[#07080a] border-t border-[#242728] text-[#6a6b6c] py-8 px-4 text-xs mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-medium text-[#f4f4f6]">
              Assam Mental Health Care Navigator · Operational Prototype v1.0
            </p>
            <p className="text-[11px] text-[#6a6b6c] mt-0.5">
              Government of Assam · National Health Mission (NHM) · Health &amp; Family Welfare Department
            </p>
          </div>
          <div className="text-[11px] text-[#6a6b6c] flex flex-col sm:items-end gap-0.5 font-mono">
            <span>Two-Phase Primal Simplex LP &amp; Spatio-Temporal Poisson Surveillance</span>
            <span className="text-[#9c9c9d]">Assam University, Silchar</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
