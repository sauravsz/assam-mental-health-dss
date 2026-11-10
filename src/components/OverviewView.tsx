import { useScenarioData } from '../engine/scenarioDataContext'
import { ArrowRight, AlertTriangle, CheckCircle2, PhoneCall } from 'lucide-react'

export const OverviewView = ({ onNavigate }: { onNavigate: (v: 'state' | 'planner' | 'queue' | 'audit' | 'overview' | 'pharmacy' | 'method') => void }) => {
  const { districts, referrals, drugMetrics, drugRecommendations, selectedDistrictFilter } = useScenarioData()

  const scoped = selectedDistrictFilter === 'All Districts'
    ? districts
    : districts.filter((d) => d.name === selectedDistrictFilter)

  const scopedReferrals = selectedDistrictFilter === 'All Districts'
    ? referrals
    : referrals.filter((r) => r.district === selectedDistrictFilter)

  const surgeDistricts = scoped.filter((d) => d.isSurge)
  const totalCalls = scoped.reduce((a, d) => a + d.callsLast30Days, 0)
  const stalled = scopedReferrals.filter((r) => r.status === 'Stalled').length
  const criticalDrugs = drugMetrics.filter((m) => m.status === 'Critical')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.9px]">
          What needs attention now.
        </h1>
        <p className="text-[14px] text-[#5f5f5d] mt-2 max-w-2xl">
          Distress alerts, stalled referrals, and critical medicine stock for {selectedDistrictFilter}. Decide, then move.
        </p>
      </div>

      {/* KPI strip: max 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-[24px] font-semibold tnum">{totalCalls.toLocaleString()}</div>
          <div className="text-[12px] text-[#5f5f5d]">Tele-MANAS calls (30d)</div>
        </div>
        <div className="card p-4">
          <div className="text-[24px] font-semibold tnum">{surgeDistricts.length}</div>
          <div className="text-[12px] text-[#5f5f5d]">Districts over alert threshold</div>
        </div>
        <div className="card p-4">
          <div className="text-[24px] font-semibold tnum">{stalled}</div>
          <div className="text-[12px] text-[#5f5f5d]">Referrals stalled &gt; 7 days</div>
        </div>
        <div className="card p-4">
          <div className="text-[24px] font-semibold tnum">{criticalDrugs.length}</div>
          <div className="text-[12px] text-[#5f5f5d]">Critical drug stocks (&lt;15d)</div>
        </div>
      </div>

      {/* Surge list: top 5 */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold">Surge districts</h2>
          <button onClick={() => onNavigate('state')} className="text-[12px] font-semibold underline flex items-center gap-1 cursor-pointer">
            Open surveillance <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {surgeDistricts.length === 0 ? (
          <p className="text-[14px] text-[#5f5f5d] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> No district is over the alert threshold for this scope.
          </p>
        ) : (
          <ul className="divide-y divide-[#eceae4]">
            {surgeDistricts.slice(0, 5).map((d) => (
              <li key={d.id} className="py-2.5 flex items-center justify-between text-[14px]">
                <span className="font-semibold">{d.name}</span>
                <span className="tnum text-[#5f5f5d]">{d.callsLast30Days} calls · p {d.pValueFormatted}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Action prompts */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => onNavigate('queue')} className="card p-4 text-left cursor-pointer">
          <PhoneCall className="w-4 h-4 mb-2" />
          <div className="font-semibold text-[14px]">Work the retention queue</div>
          <div className="text-[12px] text-[#5f5f5d] mt-1">{stalled} stalled referrals awaiting a callback. Counsellor role required.</div>
        </button>
        <button onClick={() => onNavigate('pharmacy')} className="card p-4 text-left cursor-pointer">
          <AlertTriangle className="w-4 h-4 mb-2" />
          <div className="font-semibold text-[14px]">Review drug transfers</div>
          <div className="text-[12px] text-[#5f5f5d] mt-1">{drugRecommendations.length} transfer(s) cover critical facilities.</div>
        </button>
        <button onClick={() => onNavigate('planner')} className="card p-4 text-left cursor-pointer">
          <ArrowRight className="w-4 h-4 mb-2" />
          <div className="font-semibold text-[14px]">Check van deployment</div>
          <div className="text-[12px] text-[#5f5f5d] mt-1">Mean travel time and facility assignments, recomputed live.</div>
        </button>
      </section>
    </div>
  )
}
