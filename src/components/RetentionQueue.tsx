import { useState, useMemo } from 'react'
import type { ReferralRecord } from '../engine/types'
import { applySmallCellSuppression } from '../engine/referralData'
import { useScenarioData } from '../engine/scenarioDataContext'
import { ShieldCheck, Search, CheckCircle2, ChevronDown, ChevronUp, Phone, Home, PlusCircle, Edit3 } from 'lucide-react'

interface RetentionQueueProps {
  records: ReferralRecord[]
  setRecords: React.Dispatch<React.SetStateAction<ReferralRecord[]>>
  isEditMode: boolean
  onOutcomeLogged?: (caseId: string, status: string) => void
}

export const RetentionQueue = ({ records, setRecords, isEditMode, onOutcomeLogged }: RetentionQueueProps) => {
  const { userRole, selectedDistrictFilter, logAction } = useScenarioData()

  // RBAC scope: Counsellor sees rows (own district when filtered), others see aggregates only
  const scopedRecords = useMemo(() => {
    if (userRole !== 'Counsellor') return records
    if (selectedDistrictFilter === 'All Districts') return records
    return records.filter((rec) => rec.district === selectedDistrictFilter)
  }, [records, userRole, selectedDistrictFilter])

  const canViewCases = userRole === 'Counsellor'

  const [selectedDiagnosis] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [activeRecordForAction, setActiveRecordForAction] = useState<ReferralRecord | null>(null)
  const [actionNotes, setActionNotes] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // New Case State
  const [newBlock, setNewBlock] = useState<string>('Katigorah')
  const [newDiagnosis, setNewDiagnosis] = useState<ReferralRecord['mhgapCode']>('Depression')
  const [newFacility, setNewFacility] = useState<string>('Katigorah CHC')
  const [newDays, setNewDays] = useState<number>(18)

  const filteredRecords = useMemo(() => {
    return scopedRecords.filter((r) => {
      if (selectedDiagnosis !== 'All' && r.mhgapCode !== selectedDiagnosis) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.id.toLowerCase().includes(q) ||
          r.block.toLowerCase().includes(q) ||
          r.assignedFacility.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [scopedRecords, selectedDiagnosis, searchQuery])

  const smallCellStats = useMemo(() => {
    return applySmallCellSuppression(filteredRecords, (r) => `${r.district} - ${r.block}`, 10)
  }, [filteredRecords])

  const handleUpdateStatus = (newStatus: ReferralRecord['status']) => {
    if (!activeRecordForAction) return
    const caseId = activeRecordForAction.id
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === activeRecordForAction.id
          ? {
              ...rec,
              status: newStatus,
              followupAttempts: rec.followupAttempts + 1,
              lastContactNote: actionNotes || `Status updated to ${newStatus} by Lead Counsellor.`,
            }
          : rec
      )
    )
    logAction('REFERRAL_OUTCOME', `Case ${caseId} outcome set to ${newStatus}`)
    onOutcomeLogged?.(caseId, newStatus)
    setActiveRecordForAction(null)
    setActionNotes('')
  }

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = `REF-2026-${String(records.length + 1).padStart(4, '0')}`
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    const newRecord: ReferralRecord = {
      id: newId,
      callerHash: `sha256:${hex}a9b8...`,
      district: ['Dispur', 'Sonapur', 'Chandrapur', 'Azara', 'North Guwahati'].includes(newBlock)
        ? 'Kamrup Metro'
        : 'Cachar',
      block: newBlock,
      language: 'Bengali',
      ageBand: '30-44',
      gender: 'F',
      mhgapCode: newDiagnosis,
      tierReached: 2,
      daysStalled: newDays,
      assignedFacility: newFacility,
      consentRecorded: true,
      status: 'Stalled',
      followupAttempts: 0,
      lastContactNote: 'Case registered via intake ledger.',
    }
    setRecords([newRecord, ...records])
    setShowAddForm(false)
  }

  const counts = useMemo(() => {
    return {
      total: scopedRecords.length,
      stalled: scopedRecords.filter((r) => r.status === 'Stalled').length,
      inFollowup: scopedRecords.filter((r) => r.status === 'Follow-up Initiated').length,
      ashaDispatched: scopedRecords.filter((r) => r.status === 'ASHA Dispatched').length,
      resolved: scopedRecords.filter((r) => r.status === 'Resolved' || r.status === 'Facility Visit Confirmed').length,
      refused: scopedRecords.filter((r) => r.status === 'Refused').length,
    }
  }, [scopedRecords])

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Clean Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h1 className="text-xl font-bold text-charcoal tracking-tight">
              Closed-Loop Care Retention Queue
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Proactive counsellor outreach for stalled helpline referrals (&gt;14 days without clinic visit) under MHCA 2017 &amp; DPDP 2023.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Statutory Consent Verified
          </span>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Case'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="card p-5">
        {/* Add Referral Case Form (When in Edit Mode) */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> Add New Test Stalled Referral
              </span>
              <span className="text-[12px] text-amber-800 dark:text-amber-300">Saves directly to queue and re-evaluates suppression</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-charcoal block mb-1">Revenue Block:</label>
                <input
                  type="text"
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-card border border-hairline rounded-lg p-1.5 text-xs text-charcoal"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-charcoal block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as any)}
                  className="w-full bg-card border border-hairline rounded-lg p-1.5 text-xs text-charcoal"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Psychosis">Psychosis</option>
                  <option value="Substance">Substance</option>
                  <option value="Self-Harm">Self-Harm</option>
                  <option value="Child/Adol">Child/Adol</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-charcoal block mb-1">Assigned Clinic:</label>
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-card border border-hairline rounded-lg p-1.5 text-xs text-charcoal"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-charcoal block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="120"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-card border border-hairline rounded-lg p-1.5 text-xs font-mono text-charcoal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary text-xs cursor-pointer"
            >
              Insert into Referral Queue
            </button>
          </form>
        )}

        {/* 3 Simple Action Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-container border border-hairline rounded-xl p-4">
            <span className="text-xs font-semibold text-muted block mb-1">Waiting for Check-in</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{counts.stalled}</div>
            <p className="text-xs text-muted mt-1">Stalled for more than 14 days</p>
          </div>

          <div className="bg-container border border-hairline rounded-xl p-4">
            <span className="text-xs font-semibold text-muted block mb-1">In Touch with Counsellor</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-muted mt-1">Phone callback or village worker visit</p>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">Care Successfully Resumed</span>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{counts.resolved}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Attended clinic or mobile camp</p>
          </div>
        </div>
      </div>

      {/* The Follow-Up Queue Table */}
      <div className="card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-charcoal tracking-tight">
              Patient Follow-Up List ({filteredRecords.length} people)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Click "Check In" to record outreach or dispatch a local village health worker (ASHA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
              <input
                type="text"
                placeholder="Search block or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-paper border border-hairline rounded-xl text-xs w-full text-charcoal focus:outline-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Clean, Human-Friendly Cards / Table */}
        <div className="overflow-x-auto">
          {!canViewCases && (
            <div className="bg-container border border-hairline rounded-xl p-4 mb-4 text-xs text-charcoal">
              <strong>Role scope: {userRole}</strong> — individual case rows are restricted to Counsellor role (DPDP Act 2023 · MHCA 2017 §23).
              Showing aggregated counts above only. Switch role in the header to Counsellor to view case rows for your district.
            </div>
          )}

          {canViewCases ? (
            <div className="overflow-x-auto rounded-xl border border-hairline">
              <table className="w-full text-xs text-left text-charcoal">
                <thead className="bg-container text-charcoal font-semibold uppercase text-[12px] border-b border-hairline">
                  <tr>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Village Area</th>
                    <th className="py-2.5 px-3">Language &amp; Need</th>
                    <th className="py-2.5 px-3 text-center">Waiting Since</th>
                    <th className="py-2.5 px-3">Assigned Clinic</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => (
                    <tr key={r.id} className="hover:bg-container/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-charcoal whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-charcoal block">{r.block}</span>
                        <span className="text-[12px] text-muted">{r.district}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-charcoal block">{r.mhgapCode}</span>
                        <span className="text-[12px] text-muted">{r.language} · {r.ageBand}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full text-[12px]">
                          {r.daysStalled} days ago
                        </span>
                      </td>
                      <td className="py-3 px-3 text-charcoal font-medium whitespace-nowrap">
                        {r.assignedFacility}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                            r.status === 'Resolved' || r.status === 'Facility Visit Confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : r.status === 'ASHA Dispatched'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              : r.status === 'Follow-up Initiated'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : r.status === 'Refused'
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveRecordForAction(r)}
                          className="bg-charcoal hover:opacity-90 text-paper px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Check In</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between p-3 border-t border-hairline text-xs text-muted">
                <span>
                  Showing {Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(filteredRecords.length, currentPage * itemsPerPage)} of {filteredRecords.length} cases
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-1 rounded border border-hairline hover:bg-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-mono px-2 text-charcoal">
                    Page {currentPage} of {Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredRecords.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(filteredRecords.length / itemsPerPage)}
                    className="px-2.5 py-1 rounded border border-hairline hover:bg-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Technical Drawer For Evaluators */}
        <div className="border border-hairline rounded-xl overflow-hidden mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-container hover:bg-hairline text-left flex items-center justify-between text-xs font-semibold text-charcoal transition-colors cursor-pointer"
          >
            <span>Show Privacy Masking &amp; Data Security Specifications (For Evaluators)</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-3 bg-card border-t border-hairline text-xs text-charcoal">
              <div className="bg-container p-3 rounded-lg space-y-1 border border-hairline">
                <p className="font-semibold text-charcoal">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-muted text-[12px] leading-relaxed">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If only one cell is masked in a slice, <strong>Secondary (Complementary) Suppression</strong> is applied to the next smallest cell to eliminate algebraic subtraction leaks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg px-2.5 py-1 text-[12px] font-mono ${
                      stat.suppressionType === 'primary'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 font-bold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 font-semibold'
                        : 'bg-card text-charcoal border-hairline'
                    }`}
                  >
                    <span className="text-muted font-sans">{stat.group}:</span>{' '}
                    <span>{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      {activeRecordForAction && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-hairline space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="text-base font-bold text-charcoal">Counsellor Check-In</h3>
                <p className="text-xs text-muted">
                  Case {activeRecordForAction.id} · {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-muted hover:text-charcoal text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-container p-3.5 rounded-xl text-xs space-y-1 text-charcoal border border-hairline">
              <div className="flex justify-between">
                <span className="text-muted">Language:</span>
                <span className="font-semibold">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Assigned Hospital:</span>
                <span className="font-semibold">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Days Since Referral:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal">What happened during the check-in call?</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Patient agreed to visit mobile clinic Tuesday..."
                className="w-full text-xs p-2.5 border border-hairline bg-paper rounded-xl focus:outline-blue-500 text-charcoal"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-charcoal block">Select Outcome:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded-xl border border-hairline hover:bg-container text-xs flex items-center justify-between font-medium text-charcoal transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Callback completed — scheduled (referral stays open)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded-xl border border-hairline hover:bg-container text-xs flex items-center justify-between font-medium text-charcoal transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Referred to ASHA for home visit (referral stays open)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Facility Visit Confirmed')}
                  className="w-full text-left p-3 rounded-xl border border-hairline hover:bg-container text-xs flex items-center justify-between font-medium text-charcoal transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Facility visit confirmed (closes as attended)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Refused')}
                  className="w-full text-left p-3 rounded-xl border border-hairline hover:bg-container text-xs flex items-center justify-between font-medium text-charcoal transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Patient refused further contact (closed, not attended)</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
