import { useState, useMemo } from 'react'
import type { ReferralRecord } from '../../engine/types'
import { applySmallCellSuppression } from '../../engine/referralData'
import { Search, Phone, Home, CheckCircle2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react'

interface QueueTabProps {
  records: ReferralRecord[]
  setRecords: React.Dispatch<React.SetStateAction<ReferralRecord[]>>
  isEditMode: boolean
}

export const QueueTab = ({ records, setRecords, isEditMode }: QueueTabProps) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)
  const [activeRecordForAction, setActiveRecordForAction] = useState<ReferralRecord | null>(null)
  const [actionNotes, setActionNotes] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // Recent Action Log state
  const [actionLog, setActionLog] = useState<string[]>([
    'REF-2026-0007: Callback completed — scheduled for Sonai mobile camp on Tuesday.',
    'REF-2026-0011: Phone unreachable — dispatched Block ASHA for confidential home visit.',
    'REF-2026-0019: In-person clinic attendance verified at Katigorah CHC.',
    'REF-2026-0033: Counsellor phone triage completed; patient provided transport reimbursement advice.',
  ])

  // New Case State
  const [newBlock, setNewBlock] = useState<string>('Katigorah')
  const [newDiagnosis, setNewDiagnosis] = useState<ReferralRecord['mhgapCode']>('Depression')
  const [newFacility, setNewFacility] = useState<string>('Katigorah CHC')
  const [newDays, setNewDays] = useState<number>(18)

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedDistrict !== 'All' && r.district !== selectedDistrict) return false
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
  }, [records, selectedDistrict, searchQuery])

  const smallCellStats = useMemo(() => {
    return applySmallCellSuppression(filteredRecords, (r) => `${r.district} - ${r.block}`, 10)
  }, [filteredRecords])

  const handleUpdateStatus = (newStatus: ReferralRecord['status']) => {
    if (!activeRecordForAction) return
    const note = actionNotes || `Status updated to ${newStatus} by Lead Counsellor.`
    setRecords((prev) =>
      prev.map((r) =>
        r.id === activeRecordForAction.id
          ? {
              ...r,
              status: newStatus,
              followupAttempts: r.followupAttempts + 1,
              lastContactNote: note,
            }
          : r
      )
    )
    setActionLog((prev) => [`${activeRecordForAction.id}: ${note}`, ...prev.slice(0, 7)])
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
      stalled: records.filter((r) => r.status === 'Stalled').length,
      inFollowup: records.filter((r) => r.status === 'Follow-up Initiated' || r.status === 'ASHA Dispatched').length,
      resolved: records.filter((r) => r.status === 'Resolved').length,
    }
  }, [records])

  return (
    <div className="space-y-4">
      {/* Panel 1: Stalled Referrals matching dss-1 #qtbl */}
      <div className="dss-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces">
            Stalled referrals needing a human call
          </h2>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[12px] bg-[var(--river)] text-white px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Ticket'}</span>
            </button>
          )}
        </div>

        <p className="text-[13px] text-[var(--mut)] mb-3">
          Only people who agreed to follow-up are listed. Crisis-flagged cases come first and must follow live 112/108 protocols. Nothing here is automated; every contact is made by a person.
        </p>

        {/* Add Referral Form when in Edit Mode */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mb-4 p-3 bg-[var(--bg)] border border-[var(--line)] rounded text-xs space-y-2">
            <span className="font-semibold text-[var(--ink)] block">Insert Synthetic Stalled Referral Ticket</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex flex-col gap-1 text-[var(--mut)]">
                Block:
                <select value={newBlock} onChange={(e) => setNewBlock(e.target.value)} className="p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]">
                  <option value="Katigorah">Katigorah (Cachar)</option>
                  <option value="Sonai">Sonai (Cachar)</option>
                  <option value="Lakhipur">Lakhipur (Cachar)</option>
                  <option value="Dholai">Dholai (Cachar)</option>
                  <option value="Silchar Urban">Silchar Urban (Cachar)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[var(--mut)]">
                Diagnosis:
                <select value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])} className="p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]">
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[var(--mut)]">
                Assigned Hub:
                <select value={newFacility} onChange={(e) => setNewFacility(e.target.value)} className="p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]">
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[var(--mut)]">
                Days Stalled:
                <input type="number" min="14" max="60" value={newDays} onChange={(e) => setNewDays(parseInt(e.target.value) || 14)} className="p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)] font-mono" />
              </label>
            </div>
            <button type="submit" className="bg-[var(--river)] text-white px-3 py-1 rounded text-xs cursor-pointer">
              Commit Ticket
            </button>
          </form>
        )}

        {/* 3 Top Stats matching dss-1 .stats */}
        <div className="flex flex-wrap gap-6 py-2 border-y border-[var(--line)] mb-3">
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Stalled (&gt;14 Days)</span>
            <b className="text-[22px] font-serif-fraunces text-[var(--alert)]">{counts.stalled}</b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Active Outreach</span>
            <b className="text-[22px] font-serif-fraunces text-[var(--tea)]">{counts.inFollowup}</b>
          </div>
          <div>
            <span className="text-[12px] text-[var(--mut)] block">Care Completed</span>
            <b className="text-[22px] font-serif-fraunces text-[var(--ok)]">{counts.resolved}</b>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[13px]">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-[var(--mut)] absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter ticket or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2 py-1 border border-[var(--line)] rounded text-xs w-full bg-[var(--panel)] text-[var(--ink)]"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="border border-[var(--line)] rounded px-2 py-1 text-xs bg-[var(--panel)] text-[var(--ink)]"
          >
            <option value="All">All Districts</option>
            <option value="Cachar">Cachar District</option>
            <option value="Kamrup Metro">Kamrup Metro</option>
          </select>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[12px] text-[var(--mut)] font-medium">
                <th className="py-2 px-2.5">Ticket ID</th>
                <th className="py-2 px-2.5">Block Area</th>
                <th className="py-2 px-2.5">Category</th>
                <th className="py-2 px-2.5 text-center">Stall Age</th>
                <th className="py-2 px-2.5">Target Clinic</th>
                <th className="py-2 px-2.5 text-center">Status</th>
                <th className="py-2 px-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredRecords.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-[var(--line)]/20">
                  <td className="py-2 px-2.5 font-mono text-[12px] font-medium text-[var(--ink)]">{r.id}</td>
                  <td className="py-2 px-2.5 font-medium">{r.block}</td>
                  <td className="py-2 px-2.5 text-[var(--mut)]">{r.mhgapCode}</td>
                  <td className="py-2 px-2.5 text-center font-mono text-[12px]">
                    <span className="text-[var(--alert)] font-semibold">{r.daysStalled}d</span>
                  </td>
                  <td className="py-2 px-2.5 text-[var(--mut)]">{r.assignedFacility}</td>
                  <td className="py-2 px-2.5 text-center">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'Resolved'
                          ? 'bg-[var(--ok)]/15 text-[var(--ok)]'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-[var(--tea)]/15 text-[var(--tea)]'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-[var(--river)]/15 text-[var(--river)]'
                          : 'bg-[var(--alert)]/15 text-[var(--alert)] font-semibold'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--river)] text-[var(--ink)] px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                    >
                      Check in
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel 2: Recent Outcomes Log matching dss-1 #log */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Recent outcomes log
        </h2>
        <ol className="text-[13px] text-[var(--mut)] pl-4 space-y-1.5 list-decimal mt-2">
          {actionLog.map((logItem, idx) => (
            <li key={idx} className="leading-relaxed">
              {logItem}
            </li>
          ))}
        </ol>
      </div>

      {/* Small-Cell Suppression Accordion */}
      <div className="dss-panel">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full text-left flex items-center justify-between text-[13px] font-medium text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
        >
          <span>Privacy guardrails: Primary (n &lt; 10) &amp; secondary complementary suppression</span>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 pt-3 border-t border-[var(--line)] text-[13px] text-[var(--mut)] space-y-2">
            <p>
              Under DPDP Act 2023, cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If exactly one cell in a reporting slice is masked, <strong>Secondary (Complementary) Suppression</strong> is enforced on the second-smallest cell to prevent algebraic subtraction leaks against marginal totals.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              {smallCellStats.slice(0, 8).map((stat, idx) => (
                <span
                  key={idx}
                  className={`border px-2 py-0.5 rounded ${
                    stat.suppressionType === 'primary'
                      ? 'border-[var(--alert)] text-[var(--alert)]'
                      : stat.suppressionType === 'secondary'
                      ? 'border-[var(--tea)] text-[var(--tea)]'
                      : 'border-[var(--line)] text-[var(--mut)]'
                  }`}
                >
                  {stat.group}: {stat.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog Modal */}
      {activeRecordForAction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--panel)] rounded-md max-w-md w-full p-5 border border-[var(--line)] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <h3 className="font-semibold text-[var(--ink)] font-serif-fraunces text-[17px]">
                Log counsellor outreach
              </h3>
              <button onClick={() => setActiveRecordForAction(null)} className="text-[var(--mut)] hover:text-[var(--ink)] text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <div className="text-xs text-[var(--mut)] space-y-1 bg-[var(--bg)] p-2.5 rounded">
              <p>Ticket: <b className="text-[var(--ink)] font-mono">{activeRecordForAction.id}</b> ({activeRecordForAction.block})</p>
              <p>Facility: <b className="text-[var(--ink)]">{activeRecordForAction.assignedFacility}</b></p>
              <p>Stall Duration: <b className="text-[var(--alert)]">{activeRecordForAction.daysStalled} days</b></p>
            </div>

            <label className="block text-xs text-[var(--mut)]">
              Outreach notes:
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Patient agreed to visit mobile clinic Tuesday..."
                className="w-full mt-1 p-2 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)] text-xs focus:outline-none"
              />
            </label>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleUpdateStatus('Follow-up Initiated')}
                className="w-full text-left p-2 border border-[var(--line)] hover:border-[var(--river)] rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--river)]" />
                <span>Callback completed — scheduled for mobile camp</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('ASHA Dispatched')}
                className="w-full text-left p-2 border border-[var(--line)] hover:border-[var(--tea)] rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[var(--tea)]" />
                <span>Phone unreachable — dispatched Block ASHA for home visit</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('Resolved')}
                className="w-full text-left p-2 border border-[var(--line)] hover:border-[var(--ok)] rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Verified in-person clinical visit completed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
