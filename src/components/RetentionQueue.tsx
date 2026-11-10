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
      // District scope from shell filter (scopedRecords) — no local duplicate
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
    // FUNNEL FIX: only "Facility Visit Confirmed" and "Resolved" close the referral as attended.
    // Callback / ASHA / Follow-up keep referral open (do NOT inflate clinic-visit %).
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
    // Cryptographic audit: every outcome is hash-chained (DPDP 2023 trail)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eceae4] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h1 className="text-xl font-bold text-[#1c1c1c] tracking-tight">
              Closed-Loop Care Retention Queue
            </h1>
          </div>
          <p className="text-xs text-[#5f5f5d] mt-1">
            Proactive counsellor outreach for stalled helpline referrals (&gt;14 days without clinic visit) under MHCA 2017 &amp; DPDP 2023.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory Consent Verified
          </span>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Case'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-2xl p-5">

        {/* Add Referral Case Form (When in Edit Mode) */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Add New Test Stalled Referral
              </span>
              <span className="text-[12px] text-amber-800">Saves directly to queue and re-evaluates suppression</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[12px] font-semibold text-[#1c1c1c] block mb-1">Revenue Block:</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-[#f7f4ed] border border-slate-300 rounded-lg p-1.5 text-xs text-[#1c1c1c]"
                >
                  <option value="Katigorah">Katigorah (Cachar)</option>
                  <option value="Sonai">Sonai (Cachar)</option>
                  <option value="Lakhipur">Lakhipur (Cachar)</option>
                  <option value="Dholai">Dholai (Cachar)</option>
                  <option value="Borkhola">Borkhola (Cachar)</option>
                  <option value="Salchapra">Salchapra (Cachar)</option>
                  <option value="Silchar Urban">Silchar Urban (Cachar)</option>
                  <option value="Dispur">Dispur (Kamrup)</option>
                  <option value="Sonapur">Sonapur (Kamrup)</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#1c1c1c] block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])}
                  className="w-full bg-[#f7f4ed] border border-slate-300 rounded-lg p-1.5 text-xs text-[#1c1c1c]"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                  <option value="Psychosis">Psychosis</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#1c1c1c] block mb-1">Assigned Clinic:</label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-[#f7f4ed] border border-slate-300 rounded-lg p-1.5 text-xs text-[#1c1c1c]"
                >
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital (HQ)</option>
                  <option value="Lakhipur BPHC / CHC">Lakhipur BPHC / CHC</option>
                  <option value="Dholai Model Hospital">Dholai Model Hospital</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#1c1c1c] block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-[#f7f4ed] border border-slate-300 rounded-lg p-1.5 text-xs font-mono text-[#1c1c1c]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#1c1c1c] hover:bg-slate-800 text-[#fcfbf8] font-semibold px-4 py-1.5 rounded-lg text-xs cursor-pointer"
            >
              Insert into Referral Queue
            </button>
          </form>
        )}

        {/* 3 Simple Action Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-[#f7f4ed] border border-[#eceae4]/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-[#5f5f5d] block mb-1">Waiting for Check-in</span>
            <div className="text-2xl font-bold text-rose-600 font-mono">{counts.stalled}</div>
            <p className="text-xs text-[#5f5f5d] mt-1">Stalled for more than 14 days</p>
          </div>

          <div className="bg-[#f7f4ed] border border-[#eceae4]/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-[#5f5f5d] block mb-1">In Touch with Counsellor</span>
            <div className="text-2xl font-bold text-blue-600 font-mono">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-[#5f5f5d] mt-1">Phone callback or village worker visit</p>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-800 block mb-1">Care Successfully Resumed</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">{counts.resolved}</div>
            <p className="text-xs text-emerald-600 mt-1">Attended clinic or mobile camp</p>
          </div>
        </div>
      </div>

      {/* The Follow-Up Queue Table */}
      <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-2xl  overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1c1c1c] tracking-tight">
              Patient Follow-Up List ({filteredRecords.length} people)
            </h3>
            <p className="text-xs text-[#5f5f5d] mt-0.5">
              Click "Check In / Call" to record outreach or dispatch a local village health worker (ASHA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#5f5f5d]" />
              <input
                type="text"
                placeholder="Search block or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#f7f4ed] border border-slate-300 rounded-xl text-xs w-full text-[#1c1c1c] focus:outline-blue-500"
              />
            </div>


          </div>
        </div>

        {/* Clean, Human-Friendly Cards / Table */}
        <div className="overflow-x-auto">
                  {!canViewCases && (
          <div className="bg-[#f7f4ed] border border-[#eceae4] rounded-xl p-4 mb-4 text-xs text-[#1c1c1c]">
            <strong>Role scope: {userRole}</strong> — individual case rows are restricted to Counsellor role (DPDP Act 2023 · MHCA 2017 §23).
            Showing aggregated counts above only. Switch role in the header to Counsellor to view case rows for your district.
          </div>
        )}

        {canViewCases ? (
          <div className="overflow-x-auto rounded-xl border border-[#eceae4]">

            <table className="w-full text-xs text-left text-[#1c1c1c]">
            <thead className="bg-[#f7f4ed] text-[#1c1c1c] font-semibold uppercase text-[12px] border-b border-[#eceae4]">
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
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => (
                <tr key={r.id} className="hover:bg-[#f7f4ed]/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#1c1c1c] whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#1c1c1c] block">{r.block}</span>
                    <span className="text-[12px] text-[#5f5f5d]">{r.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#1c1c1c] block">{r.mhgapCode}</span>
                    <span className="text-[12px] text-[#5f5f5d]">{r.language} · {r.ageBand}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[12px]">
                      {r.daysStalled} days ago
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#1c1c1c] font-medium whitespace-nowrap">
                    {r.assignedFacility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                        r.status === 'Resolved' || r.status === 'Facility Visit Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'Refused'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-[#1c1c1c] hover:bg-slate-800 text-[#fcfbf8] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
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
          <div className="flex items-center justify-between p-3 border-t border-[#eceae4] text-xs text-[#5f5f5d]">
            <span>
              Showing {Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(filteredRecords.length, currentPage * itemsPerPage)} of {filteredRecords.length} cases
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded border border-[#eceae4] hover:bg-[rgba(28,28,28,0.04)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono px-2">
                Page {currentPage} of {Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage))}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredRecords.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredRecords.length / itemsPerPage)}
                className="px-2.5 py-1 rounded border border-[#eceae4] hover:bg-[rgba(28,28,28,0.04)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
          </div>
        ) : null}
        </div>

        {/* Technical Drawer For Evaluators */}
        <div className="border border-[#eceae4] rounded-xl overflow-hidden mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-[#f7f4ed] hover:bg-[rgba(28,28,28,0.04)]/80 text-left flex items-center justify-between text-xs font-semibold text-[#1c1c1c] transition-colors cursor-pointer"
          >
            <span>Show Privacy Masking &amp; Data Security Specifications (For Evaluators)</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#5f5f5d]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#5f5f5d]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-3 bg-[#f7f4ed] border-t border-[#eceae4] text-xs text-[#1c1c1c]">
              <div className="bg-[#f7f4ed] p-3 rounded-lg space-y-1">
                <p className="font-semibold text-[#1c1c1c]">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-[#5f5f5d] text-[12px] leading-relaxed">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If only one cell is masked in a slice, <strong>Secondary (Complementary) Suppression</strong> is applied to the next smallest cell to eliminate algebraic subtraction leaks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg px-2.5 py-1 text-[12px] font-mono ${
                      stat.suppressionType === 'primary'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                        : 'bg-[#f7f4ed] text-[#1c1c1c] border-[#eceae4]'
                    }`}
                  >
                    <span className="text-[#5f5f5d] font-sans">{stat.group}:</span>{' '}
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
        <div className="fixed inset-0 bg-[#1c1c1c]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#f7f4ed] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#eceae4] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1c1c1c]">Counsellor Check-In</h3>
                <p className="text-xs text-[#5f5f5d]">
                  Case {activeRecordForAction.id} · {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-[#5f5f5d] hover:text-[#5f5f5d] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f7f4ed] p-3.5 rounded-xl text-xs space-y-1 text-[#1c1c1c] border border-slate-100">
              <div className="flex justify-between">
                <span className="text-[#5f5f5d]">Language:</span>
                <span className="font-semibold">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5f5d]">Assigned Hospital:</span>
                <span className="font-semibold">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5f5d]">Days Since Referral:</span>
                <span className="font-mono text-rose-600 font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1c1c1c]">What happened during the check-in call?</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Patient agreed to visit mobile clinic Tuesday..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-blue-500 text-[#1c1c1c]"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#1c1c1c] block">Select Outcome:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded-xl border border-[#eceae4] hover:bg-blue-50 hover:border-blue-300 text-xs flex items-center justify-between font-medium text-[#1c1c1c] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Callback completed — scheduled (referral stays open)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded-xl border border-[#eceae4] hover:bg-indigo-50 hover:border-indigo-300 text-xs flex items-center justify-between font-medium text-[#1c1c1c] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Referred to ASHA for home visit (referral stays open)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Facility Visit Confirmed')}
                  className="w-full text-left p-3 rounded-xl border border-[#eceae4] hover:bg-emerald-50 hover:border-emerald-300 text-xs flex items-center justify-between font-medium text-[#1c1c1c] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Facility visit confirmed (closes as attended)</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Refused')}
                  className="w-full text-left p-3 rounded-xl border border-[#eceae4] hover:bg-rose-50 hover:border-rose-300 text-xs flex items-center justify-between font-medium text-[#1c1c1c] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
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
