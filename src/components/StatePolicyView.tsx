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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── SECTION 1: MACRO FUNNEL & ATTRITION TELEMETRY ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#101111] text-[#57c1ff] border border-[#242728]">
              Module 01 · State Telemetry
            </span>
            <span className="text-xs text-[#6a6b6c]">•</span>
            <span className="text-xs text-[#9c9c9d]">35 Assam Districts Cohort</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-[#f4f4f6] tracking-tight">
            Care Continuum Funnel &amp; Attrition Analysis
          </h2>
          <p className="text-sm text-[#cdcdcd] leading-relaxed mt-1.5">
            Tele-MANAS inbound helpline volume across Assam. Health operational records show{' '}
            <strong className="text-white font-semibold">over 94% of callers requiring clinical psychiatric visits drop out</strong> due to social stigma, travel distances, and unverified referrals.
          </p>
        </div>

        {/* 3 Step Funnel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-[#242728]">
          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <div className="flex items-center justify-between text-[#9c9c9d] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">01. Helpline Inbound</span>
              <PhoneCall className="w-4 h-4 text-[#57c1ff]" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-white">10,000</div>
            <p className="text-xs text-[#6a6b6c] mt-1">Monthly Tele-MANAS callers</p>
          </div>

          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <div className="flex items-center justify-between text-[#ffc533] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">02. Tier 2 Specialist</span>
              <AlertCircle className="w-4 h-4 text-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-white">1,449</div>
            <p className="text-xs text-[#6a6b6c] mt-1">Severe clinical distress identified</p>
          </div>

          <div className="bg-[#101111] border border-[#ff6161]/40 rounded-lg p-4">
            <div className="flex items-center justify-between text-[#ff6161] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">03. Verified Clinic Visit</span>
              <CheckCircle2 className="w-4 h-4 text-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#ff6161]">579</div>
            <p className="text-xs text-[#ff6161]/80 mt-1">870 individuals dropped out</p>
          </div>
        </div>

        {/* Policy Insight Note */}
        <div className="mt-4 p-3.5 bg-[#101111] border border-[#242728] rounded-lg text-xs text-[#cdcdcd] flex items-start gap-2.5">
          <div className="w-5 h-5 rounded bg-[#18191a] text-[#57c1ff] border border-white/10 flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
            i
          </div>
          <div className="leading-relaxed">
            <strong className="font-semibold text-white">Public Health Bottleneck:</strong> 870 citizens advised to see a psychiatric doctor vanished after hanging up the phone. AMH-DSS deploys mobile vans (Tab 2) and counsellor retention callbacks (Tab 3) to rescue these patients.
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DISCRETE POISSON SPIKE DETECTOR ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6161]"></span>
              <h3 className="text-base font-semibold text-[#f4f4f6] tracking-tight">
                Poisson Anomaly Surveillance (α = 0.01)
              </h3>
            </div>
            <p className="text-xs text-[#9c9c9d] mt-0.5">
              Exact discrete cumulative tail probability evaluates whether call spikes exceed random chance under baseline expectation λ.
            </p>
          </div>
          {isEditMode && (
            <span className="text-[11px] bg-[#101111] text-[#ffc533] font-medium px-2.5 py-1 rounded border border-[#ffc533]/30 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Call Count Editor Active
            </span>
          )}
        </div>

        {/* Priority Outbreak Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {surgeDistricts.slice(0, 4).map((dist) => (
            <div
              key={dist.id}
              className={`p-4 rounded-lg border transition-all ${
                dist.name === 'Cachar'
                  ? 'bg-[#101111] border-[#57c1ff]/40 shadow-sm'
                  : 'bg-[#101111] border-[#242728]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{dist.name}</span>
                    {dist.name === 'Cachar' && (
                      <span className="text-[9px] font-semibold bg-white text-black px-1.5 py-0.2 rounded">
                        Pilot Node
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6a6b6c]">{dist.zone} · Pop: {(dist.population / 100000).toFixed(1)}L</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#ff6161] bg-[#ff6161]/10 border border-[#ff6161]/20 px-2 py-0.5 rounded block">
                    +{Math.round(((dist.callsLast30Days - dist.poissonExpected) / dist.poissonExpected) * 100)}% Surge
                  </span>
                  <span className="text-[10px] text-[#6a6b6c] font-mono mt-0.5 block">
                    p = {dist.pValueFormatted} · Z = +{dist.zScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Editable Call Count when in Edit Mode */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#cdcdcd] pt-2 border-t border-[#242728]">
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button
                      onClick={() => toggleDistrictFlood(dist.id)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                        dist.floodCrisis
                          ? 'bg-[#57c1ff]/15 text-[#57c1ff] border-[#57c1ff]/40'
                          : 'bg-[#07080a] text-[#6a6b6c] border-[#242728]'
                      }`}
                    >
                      <Waves className="w-3 h-3 text-current" />
                      <span>{dist.floodCrisis ? 'Flood Active' : 'Weather OK'}</span>
                    </button>
                  ) : (
                    <span>
                      {dist.floodCrisis ? (
                        <span className="text-[#57c1ff] font-medium flex items-center gap-1 text-[11px]">
                          <Waves className="w-3.5 h-3.5" /> Flood Inundated
                        </span>
                      ) : (
                        <span className="text-[#6a6b6c] text-[11px]">Weather Normal</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#6a6b6c] text-[11px]">Calls (30d):</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="10"
                      value={dist.callsLast30Days}
                      onChange={(e) => updateDistrictCalls(dist.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 bg-[#07080a] border border-[#242728] rounded font-mono text-xs font-semibold text-white text-right focus:outline-none focus:border-white/30"
                    />
                  ) : (
                    <span className="font-semibold text-white font-mono">{dist.callsLast30Days}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Register Accordion */}
        <div className="border border-[#242728] rounded-xl overflow-hidden mt-6 bg-[#07080a]">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-[#0d0d0d] hover:bg-[#101111] text-left flex items-center justify-between text-xs font-medium text-[#9c9c9d] hover:text-white transition-colors cursor-pointer"
          >
            <span>Show Full 35-District Poisson Matrix &amp; Absorbing Markov Model</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#6a6b6c]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6a6b6c]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-4 bg-[#07080a] border-t border-[#242728]">
              <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] text-xs text-[#cdcdcd] space-y-1">
                <p className="font-semibold text-white">Discrete Poisson Tail Distribution Formulation:</p>
                <p className="text-[11px] font-mono text-[#9c9c9d]">
                  P(Y ≥ y | λ) = 1 - ∑_&#123;k=0&#125;^&#123;y-1&#125; (λ^k · e^&#123;-λ&#125;) / k!
                </p>
                <p className="text-[11px] text-[#6a6b6c]">
                  Evaluates exact discrete probabilities for sparse rural blocks (λ &lt; 10), preventing Gaussian distortion.
                </p>
              </div>

              <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] text-xs text-[#cdcdcd] space-y-1">
                <p className="font-semibold text-white">Absorbing Markov Chain Care Funnel Ledger:</p>
                <p className="text-[11px] text-[#9c9c9d] leading-relaxed">
                  Modeled across 4 transient states and 2 absorbing states (Recovery A₁ vs Defaulted A₂). Fundamental Matrix N = (I - Q)⁻¹. Absorption probability B[S₁ → A₁] = 3.2% (320 / 10,000), confirming a 96.8% unassisted dropout rate that necessitates proactive retention callback.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9c9c9d]">Filter Region:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-[#101111] border border-[#242728] rounded px-2.5 py-1 text-xs text-white"
                >
                  <option value="All">All 35 Districts</option>
                  <option value="Barak Valley">Barak Valley (Pilot Focus)</option>
                  <option value="Brahmaputra Valley">Brahmaputra Valley</option>
                  <option value="Hill Districts">Hill Districts</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#101111] text-[#9c9c9d] uppercase text-[10px] sticky top-0 border-b border-[#242728]">
                    <tr>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Zone</th>
                      <th className="py-2.5 px-3 text-right">Population</th>
                      <th className="py-2.5 px-3 text-right">Calls (30d)</th>
                      <th className="py-2.5 px-3 text-right">Expected λ</th>
                      <th className="py-2.5 px-3 text-center">Z-Score</th>
                      <th className="py-2.5 px-3 text-center">p-Value</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242728]">
                    {filteredDistricts.map((d) => (
                      <tr key={d.id} className="hover:bg-[#101111]">
                        <td className="py-2 px-3 font-medium text-white">{d.name}</td>
                        <td className="py-2 px-3 text-[#9c9c9d]">{d.zone}</td>
                        <td className="py-2 px-3 text-right text-[#9c9c9d] font-mono">{d.population.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              max="3000"
                              step="10"
                              value={d.callsLast30Days}
                              onChange={(e) => updateDistrictCalls(d.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 bg-[#07080a] border border-[#242728] rounded font-mono text-xs font-semibold text-white text-right focus:outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-white font-mono">{d.callsLast30Days}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#9c9c9d] font-mono">{d.poissonExpected}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`font-mono px-1.5 py-0.2 rounded text-[10px] ${
                              d.isSurge
                                ? 'bg-[#ff6161]/15 text-[#ff6161] border border-[#ff6161]/30 font-semibold'
                                : 'text-[#6a6b6c]'
                            }`}
                          >
                            +{d.zScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-[#cdcdcd]">
                          {d.pValueFormatted}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              d.isSurge
                                ? 'bg-[#ff6161] text-white font-semibold'
                                : 'bg-[#101111] text-[#9c9c9d]'
                            }`}
                          >
                            {d.isSurge ? 'Surge (p<0.01)' : 'Nominal'}
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
