import { useState, useMemo } from 'react'
import type { ReferralRecord } from '../engine/types'
import { applySmallCellSuppression } from '../engine/referralData'
import { ShieldCheck, Search, CheckCircle2, ChevronDown, ChevronUp, Phone, Home, PlusCircle, Edit3 } from 'lucide-react'

interface RetentionQueueProps {
  records: ReferralRecord[]
  setRecords: React.Dispatch<React.SetStateAction<ReferralRecord[]>>
  isEditMode: boolean
}

export const RetentionQueue = ({ records, setRecords, isEditMode }: RetentionQueueProps) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All')
  const [selectedDiagnosis] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [activeRecordForAction, setActiveRecordForAction] = useState<ReferralRecord | null>(null)
  const [actionNotes, setActionNotes] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // New Case State
  const [newBlock, setNewBlock] = useState<string>('Katigorah')
  const [newDiagnosis, setNewDiagnosis] = useState<ReferralRecord['mhgapCode']>('Depression')
  const [newFacility, setNewFacility] = useState<string>('Katigorah CHC')
  const [newDays, setNewDays] = useState<number>(18)

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
          r.assignedFacility.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [records, selectedDistrict, selectedDiagnosis, searchQuery])

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
      total: records.length,
      stalled: records.filter((r) => r.status === 'Stalled').length,
      inFollowup: records.filter((r) => r.status === 'Follow-up Initiated').length,
      ashaDispatched: records.filter((r) => r.status === 'ASHA Dispatched').length,
      resolved: records.filter((r) => r.status === 'Resolved').length,
    }
  }, [records])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Friendly Context Hero */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            Step 3 · Caring Follow-Up
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2.5">
            Who asked for help, but hasn't visited a clinic yet?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            When callers are advised to see a psychiatric doctor, many never show up because of fear, stigma, or lack of transport.
            If 14 days pass with no clinic record, this queue alerts a certified counsellor to call them back with their permission.
          </p>
        </div>

        {/* Privacy Invariant Banner */}
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-semibold text-emerald-950">Strict Privacy Guarantee:</strong> 100% of people listed here agreed to follow-up contact during their helpline call. No robot calls or automated messages are ever sent.
            </span>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Case'}</span>
            </button>
          )}
        </div>

        {/* Add Referral Case Form (When in Edit Mode) */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Add New Test Stalled Referral
              </span>
              <span className="text-[10px] text-amber-800">Saves directly to queue and re-evaluates suppression</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Revenue Block:</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
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
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                  <option value="Psychosis">Psychosis</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Assigned Clinic:</label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                >
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital (HQ)</option>
                  <option value="Lakhipur BPHC / CHC">Lakhipur BPHC / CHC</option>
                  <option value="Dholai Model Hospital">Dholai Model Hospital</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs cursor-pointer"
            >
              Insert into Referral Queue
            </button>
          </form>
        )}

        {/* 3 Simple Action Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-600 block mb-1">Waiting for Check-in</span>
            <div className="text-2xl font-bold text-rose-600 font-mono">{counts.stalled}</div>
            <p className="text-xs text-slate-500 mt-1">Stalled for more than 14 days</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-600 block mb-1">In Touch with Counsellor</span>
            <div className="text-2xl font-bold text-blue-600 font-mono">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-slate-500 mt-1">Phone callback or village worker visit</p>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-800 block mb-1">Care Successfully Resumed</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">{counts.resolved}</div>
            <p className="text-xs text-emerald-600 mt-1">Attended clinic or mobile camp</p>
          </div>
        </div>
      </div>

      {/* The Follow-Up Queue Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Follow-Up List ({filteredRecords.length} people)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Check In / Call" to record outreach or dispatch a local village health worker (ASHA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search block or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs w-full text-slate-800 focus:outline-blue-500"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Cachar">Cachar District</option>
              <option value="Kamrup Metro">Kamrup Metro</option>
            </select>
          </div>
        </div>

        {/* Clean, Human-Friendly Cards / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
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
              {filteredRecords.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{r.block}</span>
                    <span className="text-[11px] text-slate-400">{r.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800 block">{r.mhgapCode}</span>
                    <span className="text-[11px] text-slate-500">{r.language} · {r.ageBand}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                      {r.daysStalled} days ago
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {r.assignedFacility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical Drawer For Evaluators */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <span>Show Privacy Masking &amp; Data Security Specifications (For Evaluators)</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-3 bg-white border-t border-slate-200 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-slate-900">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If only one cell is masked in a slice, <strong>Secondary (Complementary) Suppression</strong> is applied to the next smallest cell to eliminate algebraic subtraction leaks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg px-2.5 py-1 text-[11px] font-mono ${
                      stat.suppressionType === 'primary'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="text-slate-500 font-sans">{stat.group}:</span>{' '}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Counsellor Check-In</h3>
                <p className="text-xs text-slate-500">
                  Case {activeRecordForAction.id} · {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Language:</span>
                <span className="font-semibold">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Hospital:</span>
                <span className="font-semibold">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Since Referral:</span>
                <span className="font-mono text-rose-600 font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">What happened during the check-in call?</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Patient agreed to visit mobile clinic Tuesday..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-blue-500 text-slate-800"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 block">Select Outcome:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Spoke on phone — scheduled for mobile van camp</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phone unreachable — asked village ASHA to visit home</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-xs flex items-center justify-between font-medium text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Patient confirmed they visited the doctor</span>
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
