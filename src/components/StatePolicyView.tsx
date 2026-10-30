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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── SECTION 1: MACRO FUNNEL & ATTRITION TELEMETRY ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]">
              Module 01 · Epidemiological Surveillance
            </span>
            <span className="text-xs text-[#8e8b82]">/</span>
            <span className="text-xs text-[#6c6a64]">35 Assam Districts</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-normal text-[#141413] font-serif-claude tracking-tight">
            Care Continuum Funnel &amp; Attrition Analysis
          </h2>
          <p className="text-sm text-[#3d3d3a] leading-relaxed mt-2">
            Tracking inbound Tele-MANAS callers across Assam. Operational data reveals that{' '}
            <strong className="text-[#141413] font-semibold">over 94% of callers requiring physical psychiatric care drop out</strong> due to social stigma, travel distances, and unverified referrals.
          </p>
        </div>

        {/* 3 Step Funnel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#e6dfd8]">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#6c6a64] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">01. Helpline Inbound</span>
              <PhoneCall className="w-4 h-4 text-[#cc785c]" />
            </div>
            <div className="text-3xl font-normal text-[#141413] font-serif-claude">10,000</div>
            <p className="text-xs text-[#6c6a64] mt-1">Monthly Tele-MANAS callers</p>
          </div>

          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#e8a55a] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">02. Tier 2 Specialist</span>
              <AlertCircle className="w-4 h-4 text-current" />
            </div>
            <div className="text-3xl font-normal text-[#141413] font-serif-claude">1,449</div>
            <p className="text-xs text-[#6c6a64] mt-1">Severe clinical distress identified</p>
          </div>

          <div className="bg-[#faf9f5] border border-[#c64545]/40 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#c64545] mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">03. Verified Clinic Visit</span>
              <CheckCircle2 className="w-4 h-4 text-current" />
            </div>
            <div className="text-3xl font-normal text-[#c64545] font-serif-claude">579</div>
            <p className="text-xs text-[#c64545] mt-1">870 individuals dropped out</p>
          </div>
        </div>

        {/* Policy Insight Note */}
        <div className="mt-5 p-4 bg-[#faf9f5] border border-[#e6dfd8] rounded-lg text-xs text-[#3d3d3a] flex items-start gap-3">
          <div className="w-5 h-5 rounded-md bg-[#efe9de] text-[#cc785c] border border-[#e6dfd8] flex items-center justify-center shrink-0 text-xs font-serif-claude font-bold mt-0.5">
            i
          </div>
          <div className="leading-relaxed">
            <strong className="font-semibold text-[#141413]">Public Health Bottleneck:</strong> 870 citizens advised to see a psychiatric doctor vanished after hanging up the phone. AMH-DSS deploys mobile vans (Tab 2) and counsellor retention callbacks (Tab 3) to actively close this 94.2% delivery gap.
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DISCRETE POISSON SPIKE DETECTOR ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></span>
              <h3 className="text-xl sm:text-2xl font-normal text-[#141413] font-serif-claude tracking-tight">
                Poisson Anomaly Surveillance (α = 0.01)
              </h3>
            </div>
            <p className="text-xs text-[#6c6a64] mt-1">
              Exact discrete cumulative tail probability evaluates whether call spikes exceed random chance under baseline expectation λ.
            </p>
          </div>
          {isEditMode && (
            <span className="text-xs bg-[#faf9f5] text-[#cc785c] font-medium px-3 py-1 rounded-full border border-[#e6dfd8] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Call Count Editor Active
            </span>
          )}
        </div>

        {/* Priority Outbreak Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {surgeDistricts.slice(0, 4).map((dist) => (
            <div
              key={dist.id}
              className={`p-5 rounded-xl border bg-[#faf9f5] transition-all shadow-2xs ${
                dist.name === 'Cachar'
                  ? 'border-[#cc785c]/60 ring-2 ring-[#cc785c]/10'
                  : 'border-[#e6dfd8]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-normal text-[#141413] font-serif-claude text-lg">{dist.name}</span>
                    {dist.name === 'Cachar' && (
                      <span className="text-[10px] font-medium bg-[#efe9de] text-[#cc785c] px-2 py-0.5 rounded-full border border-[#e6dfd8]">
                        Pilot Node
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6c6a64]">{dist.zone} · Pop: {(dist.population / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#c64545] bg-[#c64545]/10 border border-[#c64545]/20 px-2.5 py-0.5 rounded-full block">
                    +{Math.round(((dist.callsLast30Days - dist.poissonExpected) / dist.poissonExpected) * 100)}% Surge
                  </span>
                  <span className="text-[11px] text-[#8e8b82] font-mono mt-0.5 block">
                    p = {dist.pValueFormatted} · Z = +{dist.zScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Editable Call Count when in Edit Mode */}
              <div className="mt-4 flex items-center justify-between text-xs text-[#3d3d3a] pt-3 border-t border-[#e6dfd8]">
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <button
                      onClick={() => toggleDistrictFlood(dist.id)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                        dist.floodCrisis
                          ? 'bg-[#5db8a6]/15 text-[#141413] border-[#5db8a6]/40'
                          : 'bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8]'
                      }`}
                    >
                      <Waves className="w-3.5 h-3.5 text-[#5db8a6]" />
                      <span>{dist.floodCrisis ? 'Flood Active' : 'Weather OK'}</span>
                    </button>
                  ) : (
                    <span>
                      {dist.floodCrisis ? (
                        <span className="text-[#5db8a6] font-medium flex items-center gap-1.5 text-xs">
                          <Waves className="w-3.5 h-3.5" /> Flood Inundated
                        </span>
                      ) : (
                        <span className="text-[#8e8b82] text-xs">Weather Normal</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#6c6a64] text-xs">Calls (30d):</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="10"
                      value={dist.callsLast30Days}
                      onChange={(e) => updateDistrictCalls(dist.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white border border-[#e6dfd8] rounded font-mono text-xs font-medium text-[#141413] text-right focus:outline-none focus:border-[#cc785c]"
                    />
                  ) : (
                    <span className="font-semibold text-[#141413] font-mono">{dist.callsLast30Days}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Register Accordion (Dark Product Showcase Card) */}
        <div className="bg-[#181715] rounded-xl overflow-hidden text-[#faf9f5] border border-[#252320]">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-6 py-4 bg-[#181715] hover:bg-[#1f1e1b] text-left flex items-center justify-between text-xs font-medium text-[#a09d96] hover:text-white transition-colors cursor-pointer"
          >
            <span>Show Full 35-District Poisson Matrix &amp; Absorbing Markov Model</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#a09d96]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a09d96]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-6 space-y-4 bg-[#1f1e1b] border-t border-[#252320] text-xs">
              <div className="bg-[#252320] p-4 rounded-lg space-y-1 font-mono-code text-[11px]">
                <p className="font-semibold text-[#cc785c]">Discrete Poisson Tail Distribution Formulation:</p>
                <p className="text-[#a09d96]">
                  P(Y ≥ y | λ) = 1 - ∑_&#123;k=0&#125;^&#123;y-1&#125; (λ^k · e^&#123;-λ&#125;) / k!
                </p>
                <p className="text-[#8e8b82] font-sans text-xs mt-1">
                  Evaluates exact discrete probabilities for sparse rural blocks (λ &lt; 10), preventing Gaussian distortion.
                </p>
              </div>

              <div className="bg-[#252320] p-4 rounded-lg space-y-1 text-xs">
                <p className="font-semibold text-white">Absorbing Markov Chain Care Funnel Ledger:</p>
                <p className="text-[#a09d96] leading-relaxed">
                  Modeled across 4 transient states and 2 absorbing states (Recovery A₁ vs Defaulted A₂). Fundamental Matrix N = (I - Q)⁻¹. Absorption probability B[S₁ → A₁] = 3.2% (320 / 10,000), confirming a 96.8% unassisted dropout rate that necessitates proactive retention callback.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#a09d96]">Filter Region:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-[#252320] border border-[#353330] rounded px-3 py-1.5 text-xs text-white"
                >
                  <option value="All">All 35 Districts</option>
                  <option value="Barak Valley">Barak Valley (Pilot Focus)</option>
                  <option value="Brahmaputra Valley">Brahmaputra Valley</option>
                  <option value="Hill Districts">Hill Districts</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#252320] text-[#a09d96] uppercase text-[10px] sticky top-0 border-b border-[#353330]">
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
                  <tbody className="divide-y divide-[#252320]">
                    {filteredDistricts.map((d) => (
                      <tr key={d.id} className="hover:bg-[#252320]">
                        <td className="py-2 px-3 font-medium text-white">{d.name}</td>
                        <td className="py-2 px-3 text-[#a09d96]">{d.zone}</td>
                        <td className="py-2 px-3 text-right text-[#a09d96] font-mono">{d.population.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              max="3000"
                              step="10"
                              value={d.callsLast30Days}
                              onChange={(e) => updateDistrictCalls(d.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 bg-[#181715] border border-[#353330] rounded font-mono text-xs font-semibold text-white text-right focus:outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-white font-mono">{d.callsLast30Days}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#a09d96] font-mono">{d.poissonExpected}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`font-mono px-2 py-0.5 rounded text-[10px] ${
                              d.isSurge
                                ? 'bg-[#c64545]/20 text-[#c64545] border border-[#c64545]/40 font-semibold'
                                : 'text-[#8e8b82]'
                            }`}
                          >
                            +{d.zScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-[#faf9f5]">
                          {d.pValueFormatted}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              d.isSurge
                                ? 'bg-[#c64545] text-white font-semibold'
                                : 'bg-[#252320] text-[#a09d96]'
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
