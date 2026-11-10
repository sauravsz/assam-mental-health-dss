import { useScenarioData } from '../engine/scenarioDataContext'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export const PharmacyView = () => {
  const { drugMetrics, drugRecommendations } = useScenarioData()

  const critical = drugMetrics.filter((m) => m.daysOfCover < 15)
  const low = drugMetrics.filter((m) => m.daysOfCover >= 15 && m.daysOfCover < 30)

  const coverTint = (days: number): React.CSSProperties => {
    if (days < 15) return { background: 'var(--flag-critical-bg)', color: 'var(--flag-critical)' }
    if (days < 30) return { background: 'var(--flag-warn-bg)', color: 'var(--flag-warn)' }
    return { background: 'var(--flag-ok-bg)', color: 'var(--flag-ok)' }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-[32px] font-semibold tracking-[-0.9px] text-charcoal">What runs out, what moves.</h1>
        <p className="text-[14px] text-muted mt-2 max-w-2xl">
          Daily tablet burn-rate by facility and drug. Alert under 15 days of cover; transfers rebalance from surplus blocks.
        </p>
      </div>

      <section className="card p-4">
        <h2 className="text-[15px] font-semibold mb-3 text-charcoal">Stock cover (days)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-charcoal">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-muted border-b border-hairline">
                <th scope="col" className="py-2 pr-3 font-semibold">Facility</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Drug</th>
                <th scope="col" className="py-2 pr-3 font-semibold text-right">Stock</th>
                <th scope="col" className="py-2 pr-3 font-semibold text-right">Burn/day</th>
                <th scope="col" className="py-2 font-semibold text-right">Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {drugMetrics.map((m) => (
                <tr key={`${m.facilityId}-${m.drugName}`} className="hover:bg-container/50 transition-colors">
                  <td className="py-2 pr-3 font-semibold">{m.facilityName}</td>
                  <td className="py-2 pr-3 capitalize">{m.drugName}</td>
                  <td className="py-2 pr-3 text-right tnum">{m.currentStock.toLocaleString()}</td>
                  <td className="py-2 pr-3 text-right tnum">{m.dailyBurnRate}</td>
                  <td className="py-2 text-right"><span className="tnum font-semibold px-2 py-0.5 rounded-full" style={coverTint(m.daysOfCover)}>{m.daysOfCover}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-[15px] font-semibold mb-1 text-charcoal">Transfer queue ({drugRecommendations.length})</h2>
        <p className="text-[12px] text-muted mb-3">Donor retains ≥30 days. Recipient moves to ≥25 days.</p>
        {critical.length === 0 && low.length === 0 ? (
          <p className="text-[14px] text-muted flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> All facilities have ≥30 days cover.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {drugRecommendations.map((r) => (
              <li key={r.id} className="py-2.5 flex flex-wrap items-center gap-x-3 text-[14px]">
                <span className={`flag-chip ${r.urgency === 'Immediate' ? 'flag-critical' : 'flag-warn'}`}>{r.urgency}</span>
                <span className="capitalize font-semibold text-charcoal">{r.drugName} {r.unitsToTransfer} tabs</span>
                <span className="text-charcoal">{r.fromFacilityName} <ArrowRight className="w-3.5 h-3.5 inline text-muted" /> {r.toFacilityName}</span>
                <span className="tnum text-muted">{r.donorRemainingDays}d → {r.recipientNewDays}d</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
