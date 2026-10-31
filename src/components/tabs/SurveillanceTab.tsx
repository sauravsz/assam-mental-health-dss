import { useState } from 'react'
import type { DistrictDistress } from '../../engine/types'
import { Waves } from 'lucide-react'

interface SurveillanceTabProps {
  districts: DistrictDistress[]
  isEditMode: boolean
  updateDistrictCalls: (districtId: string, calls: number) => void
  toggleDistrictFlood: (districtId: string) => void
}

export const SurveillanceTab = ({
  districts,
  isEditMode,
  updateDistrictCalls,
  toggleDistrictFlood,
}: SurveillanceTabProps) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('AS-02') // Cachar default

  const selectedDist = districts.find((d) => d.id === selectedDistrictId) || districts[0]

  return (
    <div className="space-y-4">
      {/* Panel 1: Surge Alerts Across Districts */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Surge alerts across Assam districts
        </h2>
        <p className="text-[13px] text-[var(--mut)] mb-3">
          Last 30 days compared with baseline Poisson expectation λ. Statistically significant surge flagged when tail probability p &lt; 0.01 (Z &gt; 2.5). Counts under 10 are protected.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[13px] text-[var(--mut)] font-medium">
                <th className="py-2 px-2.5">District</th>
                <th className="py-2 px-2.5">Zone</th>
                <th className="py-2 px-2.5 text-right">Population</th>
                <th className="py-2 px-2.5 text-right">Calls (30d)</th>
                <th className="py-2 px-2.5 text-right">Expected λ</th>
                <th className="py-2 px-2.5 text-center">Z-Score</th>
                <th className="py-2 px-2.5 text-center">p-Value</th>
                <th className="py-2 px-2.5 text-center">Flood Status</th>
                <th className="py-2 px-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {districts.map((d) => (
                <tr key={d.id} className="hover:bg-[var(--line)]/20">
                  <td className="py-2 px-2.5 font-medium text-[var(--ink)]">
                    {d.name}
                    {d.name === 'Cachar' && (
                      <span className="text-[10px] text-[var(--tea)] border border-[var(--tea)] px-1 rounded ml-1.5 font-sans font-semibold">
                        PILOT
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-[var(--mut)]">{d.zone}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">
                    {d.population.toLocaleString()}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {isEditMode ? (
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        step="10"
                        value={d.callsLast30Days}
                        onChange={(e) => updateDistrictCalls(d.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-1 py-0.5 border border-[var(--line)] rounded font-mono text-[13px] text-right bg-[var(--panel)] text-[var(--ink)]"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-[var(--ink)]">{d.callsLast30Days}</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">{d.poissonExpected}</td>
                  <td className="py-2 px-2.5 text-center font-mono text-[13px]">
                    <span className={d.isSurge ? 'text-[var(--alert)] font-semibold' : 'text-[var(--mut)]'}>
                      +{d.zScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-center font-mono text-[12px] text-[var(--mut)]">
                    {d.pValueFormatted}
                  </td>
                  <td className="py-2 px-2.5 text-center">
                    {isEditMode ? (
                      <button
                        onClick={() => toggleDistrictFlood(d.id)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          d.floodCrisis
                            ? 'bg-[var(--tea)] text-white border-[var(--tea)]'
                            : 'bg-transparent text-[var(--mut)] border-[var(--line)]'
                        }`}
                      >
                        {d.floodCrisis ? 'Inundated' : 'Normal'}
                      </button>
                    ) : (
                      <span>
                        {d.floodCrisis ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--tea)] font-semibold">
                            <Waves className="w-3 h-3" /> Inundated
                          </span>
                        ) : (
                          <span className="text-[var(--mut)] text-[12px]">Normal</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-center">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        d.isSurge
                          ? 'bg-[var(--alert)] text-white'
                          : 'bg-[var(--line)]/50 text-[var(--mut)]'
                      }`}
                    >
                      {d.isSurge ? 'Surge (p<0.01)' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel 2: Single District Inspector */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          District detailed surveillance check
        </h2>
        <div className="flex items-center gap-3 my-3">
          <label className="text-[13px] text-[var(--mut)]">District:</label>
          <select
            value={selectedDistrictId}
            onChange={(e) => setSelectedDistrictId(e.target.value)}
            className="border border-[var(--line)] rounded px-2.5 py-1 text-[14px] bg-[var(--panel)] text-[var(--ink)]"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.zone})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-6 pt-2 pb-1 border-t border-[var(--line)]">
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Observed Calls (30d)</span>
            <b className="text-[20px] font-serif-fraunces text-[var(--ink)]">{selectedDist.callsLast30Days}</b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Expected Baseline (λ)</span>
            <b className="text-[20px] font-serif-fraunces text-[var(--mut)]">{selectedDist.poissonExpected}</b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Standardized Residual (Z)</span>
            <b className="text-[20px] font-serif-fraunces text-[var(--ink)]">+{selectedDist.zScore.toFixed(2)}</b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Exact Poisson Tail p-Value</span>
            <b className={`text-[20px] font-serif-fraunces ${selectedDist.isSurge ? 'text-[var(--alert)]' : 'text-[var(--ok)]'}`}>
              {selectedDist.pValueFormatted}
            </b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Outreach Camps Currently Sited</span>
            <b className="text-[20px] font-serif-fraunces text-[var(--river)]">{selectedDist.allocatedCamps} Camps</b>
          </div>
        </div>
        <p className="text-[13px] text-[var(--mut)] mt-3">
          Statistical surges with p &lt; 0.01 trigger priority camp routing recommendations in the Camp Siting module.
        </p>
      </div>
    </div>
  )
}
