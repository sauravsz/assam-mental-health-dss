import { useState, useMemo } from 'react'
import type { ReferralRecord } from '../engine/types'
import { generateSyntheticStalledReferrals, applySmallCellSuppression } from '../engine/referralData'
import { ShieldCheck, CheckCircle2, UserCheck, Eye, EyeOff, Search } from 'lucide-react'

export const RetentionQueue = () => {
  const [records, setRecords] = useState<ReferralRecord[]>(() => generateSyntheticStalledReferrals(434))
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All')
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [enableSmallCellMasking, setEnableSmallCellMasking] = useState<boolean>(true)
  const [activeRecordForAction, setActiveRecordForAction] = useState<ReferralRecord | null>(null)
  const [actionNotes, setActionNotes] = useState<string>('')

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedDistrict !== 'All' && r.district !== selectedDistrict) return false
      if (selectedDiagnosis !== 'All' && r.mhgapCode !== selectedDiagnosis) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.id.toLowerCase().includes(q) ||
          r.block.toLowerCase().includes(q) ||
          r.assignedFacility.toLowerCase().includes(q) ||
          r.callerHash.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [records, selectedDistrict, selectedDiagnosis, searchQuery])

  // Small-cell privacy breakdown by block
  const smallCellStats = useMemo(() => {
    return applySmallCellSuppression(filteredRecords, (r) => `${r.district} - ${r.block}`, 10)
  }, [filteredRecords])

  const handleUpdateStatus = (newStatus: ReferralRecord['status']) => {
    if (!activeRecordForAction) return
    setRecords((prev) =>
      prev.map((r) =>
        r.id === activeRecordForAction.id
          ? {
              ...r,
              status: newStatus,
              followupAttempts: r.followupAttempts + 1,
              lastContactNote: actionNotes || `Status updated to ${newStatus} by Lead Counsellor.`,
            }
          : r
      )
    )
    setActiveRecordForAction(null)
    setActionNotes('')
  }

  const counts = useMemo(() => {
    return {
      total: records.length,
      stalled: records.filter((r) => r.status === 'Stalled').length,
      inFollowup: records.filter((r) => r.status === 'Follow-up Initiated').length,
      ashaDispatched: records.filter((r) => r.status === 'ASHA Dispatched').length,
      resolved: records.filter((r) => r.status === 'Resolved').length,
    }
  }, [records])

  return (
    <div className="space-y-6">
      {/* Counsellor Command Header */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-emerald-800">
              Closed-Loop Care Retention Queue:
            </span>{' '}
            Tele-MANAS Lead Counsellor action surface. Tracks individuals referred to physical DMHP care whose consultations have stalled for &gt;14 days.
            <div className="mt-1 font-semibold text-emerald-950 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Statutory Invariant: 100% of cases in this queue have recorded prior consent. Contact is strictly human-in-the-loop (no robocalls).
            </div>
          </div>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Stalled (&gt;14 Days)</span>
          <div className="text-xl font-bold text-rose-600 font-mono mt-1">{counts.stalled}</div>
          <span className="text-[11px] text-slate-400">Awaiting counsellor review</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">In Outreach Contact</span>
          <div className="text-xl font-bold text-amber-600 font-mono mt-1">{counts.inFollowup}</div>
          <span className="text-[11px] text-slate-400">Counsellor callback scheduled</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ASHA Dispatched</span>
          <div className="text-xl font-bold text-blue-600 font-mono mt-1">{counts.ashaDispatched}</div>
          <span className="text-[11px] text-slate-400">Village health worker assigned</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Care Re-Established</span>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-1">{counts.resolved}</div>
          <span className="text-[11px] text-slate-400">Verified clinic/camp attendance</span>
        </div>
      </div>

      {/* Small-Cell Privacy Audit Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Small-Cell Suppression Audit (DPDP 2023 & MHCA 2017 Safeguard)
            </h3>
          </div>
          <button
            onClick={() => setEnableSmallCellMasking(!enableSmallCellMasking)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            {enableSmallCellMasking ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {enableSmallCellMasking ? 'Enforcing Masking (<10)' : 'Masking Bypassed (Raw Counts)'}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mb-3">
          To prevent deductive re-identification of patients living in sparsely populated revenue circles, any aggregated cell reporting fewer than 10 individuals is masked in all exported departmental dashboards.
        </p>

        <div className="flex flex-wrap gap-2">
          {smallCellStats.slice(0, 8).map((stat, idx) => (
            <div
              key={idx}
              className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-2 font-mono ${
                enableSmallCellMasking && stat.isMasked
                  ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-sans text-[11px]">{stat.group}:</span>
              <span>{enableSmallCellMasking ? stat.count : counts.total > 0 ? stat.count : 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filterable Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Prioritized Stalled Referral Queue (Cohort N = {filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by stall duration (&gt;14 days). Click "Log Outreach" to update care continuity status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search block, ID, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-48 text-slate-700 focus:outline-blue-500"
              />
            </div>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Cachar">Cachar District</option>
              <option value="Kamrup Metro">Kamrup Metro</option>
            </select>

            {/* Diagnosis Filter */}
            <select
              value={selectedDiagnosis}
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="All">All mhGAP Categories</option>
              <option value="Depression">Depression</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Substance">Substance Use</option>
              <option value="Self-Harm">Self-Harm Risk</option>
              <option value="Psychosis">Psychosis</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Referral ID</th>
                <th className="py-2.5 px-3">Pseudonymized Hash</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Profile</th>
                <th className="py-2.5 px-3">mhGAP Category</th>
                <th className="py-2.5 px-3 text-center">Days Stalled</th>
                <th className="py-2.5 px-3">Assigned Facility</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.slice(0, 15).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.id}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {r.callerHash.slice(0, 14)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800">{r.block}</span>
                    <span className="text-slate-400 text-[10px] block">{r.district}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {r.ageBand} · {r.gender} ({r.language})
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        r.mhgapCode === 'Self-Harm'
                          ? 'bg-rose-100 text-rose-700 font-bold'
                          : r.mhgapCode === 'Depression'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.mhgapCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                      {r.daysStalled}d
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{r.assignedFacility}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        r.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-all shadow-xs"
                    >
                      Log Outreach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing 15 of {filteredRecords.length} prioritized records</span>
          <span className="text-[11px] text-slate-400">All data loaded from synthetic 15-field validation schema</span>
        </div>
      </div>

      {/* Action Modal Drawer */}
      {activeRecordForAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Counsellor Outreach</h3>
                <p className="text-xs text-slate-500">
                  Case {activeRecordForAction.id} · {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Facility:</span>
                <span className="font-semibold">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stall Duration:</span>
                <span className="font-mono text-rose-600 font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consent Verified:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Recorded in Tele-MANAS Log
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Outreach Interaction Notes:</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Counsellor called patient; coordinated with Sonai mobile camp..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-500 text-slate-800"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 block">Update Referral State:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all"
                >
                  <span>📞 Callback Completed (Camp Visit Scheduled)</span>
                  <span className="text-[10px] text-blue-600 font-bold">Follow-up</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all"
                >
                  <span>🏡 Dispatched Local Block ASHA for Home Visit</span>
                  <span className="text-[10px] text-indigo-600 font-bold">ASHA</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all"
                >
                  <span>✅ Verified In-Person Attendance at Camp/Clinic</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Resolved</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
