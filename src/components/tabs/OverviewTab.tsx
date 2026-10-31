import type { Block, Facility, OptimizationResult } from '../../engine/types'
import { STATE_FUNNEL_DATA } from '../../engine/stateSurveillance'

interface OverviewTabProps {
  blocks: Block[]
  facilities: Facility[]
  optimizationResult: OptimizationResult
  includeFloodWeight: boolean
}

export const OverviewTab = ({
  blocks,
  facilities,
  optimizationResult,
  includeFloodWeight,
}: OverviewTabProps) => {
  return (
    <div className="space-y-4">
      {/* Panel 1: Care Attrition Funnel */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Where callers drop out of care
        </h2>
        <p className="text-[13px] text-[var(--mut)] mb-4">
          Calculated from Tele-MANAS logs. Share of callers completing each successive stage of care.
        </p>

        {/* 3 Top Highlight Stats */}
        <div className="flex flex-wrap gap-6 mb-4 pb-3 border-b border-[var(--line)]">
          <div>
            <b className="block text-[22px] font-serif-fraunces text-[var(--ink)]">10,000</b>
            <span className="text-[13px] text-[var(--mut)]">Helpline calls logged</span>
          </div>
          <div>
            <b className="block text-[22px] font-serif-fraunces text-[var(--ok)]">579 (5.8%)</b>
            <span className="text-[13px] text-[var(--mut)]">Verified in-person clinic visits</span>
          </div>
          <div>
            <b className="block text-[22px] font-serif-fraunces text-[var(--alert)]">870 (59.7%)</b>
            <span className="text-[13px] text-[var(--mut)]">Referred callers lost after triage</span>
          </div>
        </div>

        {/* Funnel Rows */}
        <div className="space-y-2.5">
          {STATE_FUNNEL_DATA.map((step, idx) => {
            const widthPct = `${step.conversionPct}%`
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[var(--ink)]">
                    {step.stage} <span className="text-[var(--mut)] font-normal">({step.count.toLocaleString()} callers)</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[12px]">
                    {step.dropPct > 0 && (
                      <span className="text-[var(--alert)]">-{step.dropPct}% stage drop</span>
                    )}
                    <b className="text-[var(--ink)] w-12 text-right">{step.conversionPct}%</b>
                  </div>
                </div>
                <div className="w-full bg-[var(--line)]/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[var(--river)] rounded-full transition-all duration-300"
                    style={{ width: widthPct }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel 2: Blocks at a glance (Cachar 1.16M Pop) */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Blocks at a glance (Cachar District)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[13px] text-[var(--mut)] font-medium">
                <th className="py-2 px-2.5">Block Name</th>
                <th className="py-2 px-2.5 text-right">Population</th>
                <th className="py-2 px-2.5 text-right">Base Distress</th>
                <th className="py-2 px-2.5 text-right">Flood Multiplier</th>
                <th className="py-2 px-2.5 text-right font-semibold text-[var(--ink)]">Burden (dᵢ)</th>
                <th className="py-2 px-2.5">Assigned Camp Hub</th>
                <th className="py-2 px-2.5 text-right">Travel Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {blocks.map((b) => {
                const burden = Math.round(
                  (b.population / 1000.0) * b.baselineDistress * (includeFloodWeight ? b.floodFactor : 1.0) * 10
                ) / 10
                const assignment = optimizationResult.assignments.find((a) => a.blockId === b.id)
                const assignedFacility = assignment ? facilities[assignment.facilityId] : null

                return (
                  <tr key={b.id} className="hover:bg-[var(--line)]/20">
                    <td className="py-2 px-2.5 font-medium text-[var(--ink)]">{b.name}</td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">
                      {b.population.toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">
                      {b.baselineDistress.toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono">
                      {b.floodFactor > 1.0 ? (
                        <span className="text-[var(--tea)] font-semibold">{b.floodFactor}x</span>
                      ) : (
                        <span className="text-[var(--mut)]">1.0x</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-semibold text-[var(--ink)]">
                      {burden}
                    </td>
                    <td className="py-2 px-2.5 text-[var(--ink)]">
                      {assignedFacility ? assignedFacility.name.split(' ')[0] : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--river)] font-semibold">
                      {assignment ? `${assignment.travelTime} min` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-[var(--mut)] mt-3">
          Burden is population × baseline distress × flood vulnerability, in expected patient index per camp cycle. Assignments recalculate in Camp Siting.
        </p>
      </div>
    </div>
  )
}
