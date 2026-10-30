import { useState } from 'react'
import type { DistrictDistress } from '../engine/types'
import { PhoneCall, AlertCircle, Waves, ChevronDown, ChevronUp, CheckCircle2, Edit3 } from 'lucide-react'

interface StatePolicyViewProps {
  districts: DistrictDistress[]
  isEditMode: boolean
  updateDistrictCalls: (districtId: string, calls: number) => void
  toggleDistrictFlood: (districtId: string) => void
}

export const StatePolicyView = ({
  districts,
  isEditMode,
  updateDistrictCalls,
  toggleDistrictFlood,
}: StatePolicyViewProps) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [selectedZone, setSelectedZone] = useState<string>('All')

  const surgeDistricts = districts.filter((d) => d.isSurge)
  const filteredDistricts = districts.filter((d) => {
    if (selectedZone !== 'All' && d.zone !== selectedZone) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans-tech">
      {/* ── SECTION 1: MACRO FUNNEL & ATTRITION TELEMETRY ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)] relative">
        {/* PCB Solder Pins */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>

        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD700] bg-[#09231A] px-2.5 py-1 rounded border border-[#B87333]/50">
            MODULE 01 // TELEMETRY_SURVEILLANCE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#EAD0AC] font-serif-display tracking-tight mt-2.5">
            Care Continuum Funnel &amp; Signal Attenuation
          </h2>
          <p className="text-xs sm:text-sm text-[#C2AB8E] leading-relaxed mt-1.5">
            Tele-MANAS inbound helpline volume across 35 Assam districts. Operational records reveal that{' '}
            <strong className="text-[#FFD700] font-semibold">over 94% of callers needing in-person psychiatric care drop out</strong> due to stigma, transit distance, and unverified referrals.
          </p>
        </div>

        {/* 3 Care Funnel Step Registers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-[#B87333]/30">
          <div className="bg-[#09231A] border border-[#B87333]/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-[#C2AB8E] mb-1">
              <span className="text-xs font-mono font-semibold uppercase">01. Inbound Intake</span>
              <PhoneCall className="w-4 h-4 text-[#D98C53]" />
            </div>
            <div className="text-3xl font-bold text-[#EAD0AC] font-serif-display">10,000</div>
            <p className="text-xs text-[#C2AB8E] mt-1 font-mono text-[11px]">Tele-MANAS monthly intake</p>
          </div>

          <div className="bg-[#09231A] border border-[#D98C53] rounded-lg p-4">
            <div className="flex items-center justify-between text-[#D98C53] mb-1">
              <span className="text-xs font-mono font-semibold uppercase">02. Tier 2 Specialist</span>
              <AlertCircle className="w-4 h-4 text-current" />
            </div>
            <div className="text-3xl font-bold text-[#D98C53] font-serif-display">1,449</div>
            <p className="text-xs text-[#C2AB8E] mt-1 font-mono text-[11px]">Severe clinical distress</p>
          </div>

          <div className="bg-[#165B45] border border-[#FFD700] rounded-lg p-4 shadow-[0_0_12px_rgba(255,215,0,0.1)]">
            <div className="flex items-center justify-between text-[#FFD700] mb-1">
              <span className="text-xs font-mono font-semibold uppercase">03. Verified Clinic Visit</span>
              <CheckCircle2 className="w-4 h-4 text-current" />
            </div>
            <div className="text-3xl font-bold text-[#FFD700] font-serif-display">579</div>
            <p className="text-xs text-[#EAD0AC] mt-1 font-mono text-[11px]">870 callers lost to follow-up</p>
          </div>
        </div>

        {/* Insight note */}
        <div className="mt-4 p-3 bg-[#09231A] border border-[#B87333]/50 rounded text-xs text-[#EAD0AC] flex items-start gap-2.5">
          <div className="w-5 h-5 rounded bg-[#D98C53] text-[#09231A] flex items-center justify-center shrink-0 text-[11px] font-bold font-mono mt-0.5">
            !
          </div>
          <div className="leading-relaxed">
            <strong className="font-semibold text-[#FFD700]">Operations Takeaway:</strong> 870 individuals were advised to seek in-person psychiatric consultation, but vanished after call termination. AMH-DSS deploys mobile clinic vans (Tab 2) and counsellor retention callbacks (Tab 3) to close this 94.2% delivery gap.
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DISCRETE POISSON SPIKE DETECTOR ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]"></span>
              <h3 className="text-base font-bold text-[#EAD0AC] font-serif-display tracking-wide">
                Poisson Anomaly Surveillance Bus (α = 0.01)
              </h3>
            </div>
            <p className="text-xs text-[#C2AB8E] mt-0.5">
              Exact discrete cumulative tail probability evaluates whether call spikes exceed random chance under baseline λ.
            </p>
          </div>
          {isEditMode && (
            <span className="text-[11px] bg-[#09231A] text-[#FFD700] font-mono font-semibold px-2.5 py-1 rounded border border-[#FFD700] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#D98C53]" /> BUS_REGISTER_WRITE_ENABLED
            </span>
          )}
        </div>

        {/* Priority Anomaly Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {surgeDistricts.slice(0, 4).map((dist) => (
            <div
              key={dist.id}
              className={`p-4 rounded border transition-all ${
                dist.name === 'Cachar'
                  ? 'bg-[#165B45] border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                  : 'bg-[#09231A] border-[#B87333]/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#EAD0AC] font-serif-display text-sm">{dist.name}</span>
                    {dist.name === 'Cachar' && (
                      <span className="text-[9px] font-mono font-bold bg-[#D98C53] text-[#09231A] px-1.5 py-0.2 rounded">
                        PILOT_NODE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#C2AB8E] font-mono">{dist.zone} · Pop: {(dist.population / 100000).toFixed(1)}L</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#FFD700] bg-[#09231A] border border-[#FFD700]/70 px-2 py-0.5 rounded block">
                    +{Math.round(((dist.callsLast30Days - dist.poissonExpected) / dist.poissonExpected) * 100)}% SURGE
                  </span>
                  <span className="text-[10px] text-[#C2AB8E] font-mono mt-0.5 block">
                    p = {dist.pValueFormatted} // Z = +{dist.zScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Editable Call Count when in Edit Mode */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#C2AB8E] pt-2 border-t border-[#B87333]/30">
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button
                      onClick={() => toggleDistrictFlood(dist.id)}
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                        dist.floodCrisis
                          ? 'bg-[#165B45] text-[#FFD700] border-[#FFD700]'
                          : 'bg-[#09231A] text-[#C2AB8E] border-[#B87333]/60'
                      }`}
                    >
                      <Waves className="w-3 h-3 text-current" />
                      <span>{dist.floodCrisis ? 'FLOOD_ACTIVE' : 'WEATHER_OK'}</span>
                    </button>
                  ) : (
                    <span>
                      {dist.floodCrisis ? (
                        <span className="text-[#FFD700] font-semibold flex items-center gap-1 text-[11px] font-mono">
                          <Waves className="w-3.5 h-3.5" /> FLOOD_INUNDATED
                        </span>
                      ) : (
                        <span className="text-[#C2AB8E]/70 text-[11px] font-mono">WEATHER_NORMAL</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#C2AB8E] text-[11px] font-mono">CALLS_30D:</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="10"
                      value={dist.callsLast30Days}
                      onChange={(e) => updateDistrictCalls(dist.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs font-bold text-[#FFD700] text-right focus:outline-none focus:border-[#FFD700]"
                    />
                  ) : (
                    <span className="font-bold text-[#FFD700] font-mono">{dist.callsLast30Days}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Register Accordion */}
        <div className="border border-[#B87333]/50 rounded-lg overflow-hidden mt-6 bg-[#09231A]">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-[#09231A] hover:bg-[#144837] text-left flex items-center justify-between text-xs font-semibold text-[#EAD0AC] transition-colors cursor-pointer font-mono"
          >
            <span>// INSPECT 35-DISTRICT POISSON MATRIX &amp; ABSORBING MARKOV MODEL</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#D98C53]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#D98C53]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-4 bg-[#061812] border-t border-[#B87333]/40">
              <div className="bg-[#09231A] p-3 rounded border border-[#B87333]/30 text-xs text-[#EAD0AC] space-y-2 font-mono">
                <p className="font-semibold text-[#FFD700]">Discrete Poisson Tail Distribution Formulation:</p>
                <p className="text-[11px] text-[#C2AB8E]">
                  P(Y ≥ y | λ) = 1 - ∑_&#123;k=0&#125;^&#123;y-1&#125; (λ^k · e^&#123;-λ&#125;) / k!
                </p>
                <p className="text-[11px] text-[#C2AB8E] font-sans-tech">
                  Evaluates exact discrete probabilities for sparse rural blocks (λ &lt; 10), preventing Gaussian distortion.
                </p>
              </div>

              <div className="bg-[#09231A] p-3 rounded border border-[#B87333]/30 text-xs text-[#EAD0AC] space-y-2 font-mono">
                <p className="font-semibold text-[#FFD700]">Absorbing Markov Chain Care Funnel Ledger:</p>
                <p className="text-[11px] text-[#C2AB8E] font-sans-tech leading-relaxed">
                  Modeled across 4 transient states and 2 absorbing states (Recovery A₁ vs Defaulted A₂). Fundamental Matrix N = (I - Q)⁻¹. Absorption probability B[S₁ → A₁] = 3.2% (320 / 10,000), confirming a 96.8% unassisted dropout rate that necessitates proactive retention callback.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#EAD0AC]">FILTER REGION:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-[#09231A] border border-[#B87333] rounded px-2.5 py-1 text-xs text-[#FFD700] font-mono"
                >
                  <option value="All">All 35 Districts</option>
                  <option value="Barak Valley">Barak Valley (Pilot Focus)</option>
                  <option value="Brahmaputra Valley">Brahmaputra Valley</option>
                  <option value="Hill Districts">Hill Districts</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-[#09231A] text-[#FFD700] uppercase text-[10px] sticky top-0 border-b border-[#B87333]/40">
                    <tr>
                      <th className="py-2 px-3">District Node</th>
                      <th className="py-2 px-3">Zone</th>
                      <th className="py-2 px-3 text-right">Population</th>
                      <th className="py-2 px-3 text-right">Calls (30d)</th>
                      <th className="py-2 px-3 text-right">Expected λ</th>
                      <th className="py-2 px-3 text-center">Z-Score</th>
                      <th className="py-2 px-3 text-center">p-Value</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B87333]/20">
                    {filteredDistricts.map((d) => (
                      <tr key={d.id} className="hover:bg-[#144837]">
                        <td className="py-2 px-3 font-semibold text-[#EAD0AC]">{d.name}</td>
                        <td className="py-2 px-3 text-[#C2AB8E]">{d.zone}</td>
                        <td className="py-2 px-3 text-right text-[#C2AB8E]">{d.population.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              max="3000"
                              step="10"
                              value={d.callsLast30Days}
                              onChange={(e) => updateDistrictCalls(d.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 bg-[#09231A] border border-[#B87333] rounded font-mono text-xs font-bold text-[#FFD700] text-right focus:outline-none"
                            />
                          ) : (
                            <span className="font-bold text-[#FFD700]">{d.callsLast30Days}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#C2AB8E]">{d.poissonExpected}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                              d.isSurge
                                ? 'bg-[#09231A] text-[#FFD700] border border-[#FFD700]'
                                : 'bg-[#09231A] text-[#C2AB8E]'
                            }`}
                          >
                            +{d.zScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] font-semibold text-[#FFD700]">
                          {d.pValueFormatted}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                              d.isSurge
                                ? 'bg-[#D98C53] text-[#09231A] font-bold'
                                : 'bg-[#09231A] text-[#C2AB8E]'
                            }`}
                          >
                            {d.isSurge ? 'SURGE' : 'NOMINAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
