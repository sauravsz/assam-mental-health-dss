import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { NaturalLanguageBar } from './components/NaturalLanguageBar'
import { StatePolicyView } from './components/StatePolicyView'
import { DMHPCampPlanner } from './components/DMHPCampPlanner'
import { RetentionQueue } from './components/RetentionQueue'
import { AuditLogView } from './components/AuditLogView'
import { OverviewView } from './components/OverviewView'
import { PharmacyView } from './components/PharmacyView'
import { MethodView } from './components/MethodView'
import { useScenarioData } from './engine/scenarioDataContext'

export type AppView = 'overview' | 'state' | 'planner' | 'pharmacy' | 'queue' | 'audit' | 'method'

function viewFromUrl(): AppView {
  const v = new URLSearchParams(window.location.search).get('view')
  const ok: AppView[] = ['overview', 'state', 'planner', 'pharmacy', 'queue', 'audit', 'method']
  return ok.includes(v as AppView) ? (v as AppView) : 'overview'
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppView>(viewFromUrl)
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
    logAction,
  } = useScenarioData()

  const stalledCount = referrals.filter((r) => r.status === 'Stalled').length

  const go = (v: AppView) => {
    setActiveTab(v)
    const url = new URL(window.location.href)
    url.searchParams.set('view', v)
    window.history.replaceState(null, '', url)
  }

  const handleReset = () => {
    resetToDefaults()
    setNumVans(2)
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1c1c1c] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab as 'state' | 'planner' | 'queue' | 'audit'}
        setActiveTab={(v) => go(v as AppView)}
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
          setActiveTab={(v) => go(v as AppView)}
          updateBlock={updateBlock}
          updateFacilityCapacity={updateFacilityCapacity}
          updateMedicineStock={updateMedicineStock}
          updateDistrictCalls={updateDistrictCalls}
          toggleDistrictFlood={toggleDistrictFlood}
          resetToDefaults={handleReset}
          setNumVans={setNumVans}
        />

        {/* Section Surfaces */}
        {activeTab === 'overview' && (
          <OverviewView onNavigate={go} />
        )}

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

        {activeTab === 'pharmacy' && (
          <PharmacyView />
        )}

        {activeTab === 'queue' && (
          <RetentionQueue
            records={referrals}
            setRecords={setReferrals}
            isEditMode={isEditMode}
            onOutcomeLogged={(caseId, status) => logAction('REFERRAL_OUTCOME', `Case ${caseId} outcome set to ${status}`)}
          />
        )}

        {activeTab === 'method' && (
          <MethodView />
        )}

        {activeTab === 'audit' && (
          <div className="animate-fade-in">
            <AuditLogView />
          </div>
        )}
      </main>

      <footer className="bg-[#f7f4ed] border-t border-[#eceae4] text-[#5f5f5d] py-8 px-4 text-xs mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-[#1c1c1c]">
              Assam Mental Health Care Navigator · Operational Prototype v1.0
            </p>
            <p className="text-[12px] text-[#5f5f5d] mt-0.5">
              Government of Assam · National Health Mission (NHM) · Health &amp; Family Welfare Department
            </p>
          </div>
          <div className="text-[12px] text-[#5f5f5d] flex flex-col sm:items-end gap-0.5">
            <span>Decision Support System · Capacitated p-Median Optimization &amp; Anomaly Surveillance</span>
            <span className="text-[#5f5f5d] font-medium">Assam University, Silchar</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
