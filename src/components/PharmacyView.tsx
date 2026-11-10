import { useState } from 'react'
import { useScenarioData } from '../engine/scenarioDataContext'
import { ArrowRight, CheckCircle2, Pill, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

export const PharmacyView = () => {
  const { drugMetrics, drugRecommendations } = useScenarioData()
  const [dispatchedIds, setDispatchedIds] = useState<string[]>([])

  const critical = drugMetrics.filter((m) => m.daysOfCover < 15)
  const low = drugMetrics.filter((m) => m.daysOfCover >= 15 && m.daysOfCover < 30)
  const safe = drugMetrics.filter((m) => m.daysOfCover >= 30)

  const handleSimulateDispatch = (transferId: string) => {
    setDispatchedIds((prev) => [...prev, transferId])
  }

  return (
    <div className="space-y-6 w-full">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal">
              Essential Psychiatric Pharmacy &amp; Lateral Rebalancing
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Daily burn rate monitoring across Haloperidol, Fluoxetine, and Sodium Valproate with automated deficit-surplus rebalancing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted bg-container px-2.5 py-1 rounded-lg border border-hairline flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Safety Threshold: 15–30 Days Cover
          </span>
        </div>
      </div>

      {/* 3-Card Balanced Telemetry Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted">Adequate Stock (&gt;30d)</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {safe.length} <span className="text-xs font-normal text-muted">lines</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted">Low Stock Warning (15–30d)</span>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {low.length} <span className="text-xs font-normal text-muted">lines</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted">Critical Stockout Risk (&lt;15d)</span>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {critical.length} <span className="text-xs font-normal text-muted">lines</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-700 dark:text-rose-300">
            <Pill className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Stock Cover Inventory (7 Cols) + Lateral Transfer Queue (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 Cols / 58%): Clinical Drug Inventory with Bullet Bars */}
        <section className="lg:col-span-7 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Clinic Stock Cover &amp; Daily Burn Rate
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Horizontal bullet bars measure current supply against 15-day redline and 30-day baseline.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500"></span> &lt;15d
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500"></span> 15-30d
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500"></span> &ge;30d
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead>
                <tr className="uppercase text-[11px] text-muted border-b border-hairline font-semibold">
                  <th scope="col" className="py-2.5 pr-2">Facility</th>
                  <th scope="col" className="py-2.5 px-2">Medication</th>
                  <th scope="col" className="py-2.5 px-2 text-right">In Stock</th>
                  <th scope="col" className="py-2.5 px-2 text-right">Burn/Day</th>
                  <th scope="col" className="py-2.5 pl-2 text-right w-44">Days of Cover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {drugMetrics.map((m) => {
                  const pct = Math.min(100, Math.round((m.daysOfCover / 45) * 100))
                  const isCrit = m.daysOfCover < 15
                  const isWarn = m.daysOfCover >= 15 && m.daysOfCover < 30
                  return (
                    <tr key={`${m.facilityId}-${m.drugName}`} className="hover:bg-container/50 transition-colors">
                      <td className="py-2.5 pr-2 font-semibold text-charcoal">{m.facilityName}</td>
                      <td className="py-2.5 px-2 capitalize text-muted">{m.drugName}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-charcoal font-medium">
                        {m.currentStock.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-muted">
                        {m.dailyBurnRate}/d
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-paper rounded-full h-2 overflow-hidden border border-hairline">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCrit
                                  ? 'bg-rose-500'
                                  : isWarn
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                              isCrit
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                : isWarn
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {m.daysOfCover}d
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column (5 Cols / 42%): Lateral Rebalancing Transfer Queue */}
        <section className="lg:col-span-5 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Lateral Rebalancing Queue
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Surplus donor retains &ge;30d; recipient brought to safe &ge;25d cover.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-container text-charcoal border border-hairline">
              {drugRecommendations.length} Actions
            </span>
          </div>

          {critical.length === 0 && low.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-charcoal">All clinics adequately stocked.</p>
              <p className="mt-0.5">No lateral stock transfers currently required.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drugRecommendations.map((r) => {
                const isDispatched = dispatchedIds.includes(r.id)
                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl border border-hairline bg-container space-y-2 text-xs transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-bold text-charcoal text-sm">
                          {r.drugName}
                        </span>
                        <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {r.unitsToTransfer.toLocaleString()} tablets
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.urgency === 'Immediate'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </div>

                    {/* Transfer Vector */}
                    <div className="p-2.5 rounded-lg bg-card border border-hairline flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Donor (Surplus)</span>
                        <span className="font-semibold text-charcoal">{r.fromFacilityName}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Recipient (Deficit)</span>
                        <span className="font-semibold text-charcoal">{r.toFacilityName}</span>
                      </div>
                    </div>

                    {/* Resulting Impact */}
                    <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                      <span>Cover Shift: <strong className="font-mono text-charcoal">{r.donorRemainingDays}d donor</strong> &rarr; <strong className="font-mono text-emerald-700 dark:text-emerald-400">{r.recipientNewDays}d recipient</strong></span>
                      <button
                        onClick={() => handleSimulateDispatch(r.id)}
                        disabled={isDispatched}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isDispatched
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 cursor-default'
                            : 'btn-primary'
                        }`}
                      >
                        {isDispatched ? 'Dispatched' : 'Dispatch Transfer'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
