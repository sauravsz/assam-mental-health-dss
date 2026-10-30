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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── SECTION 1: CONTEXT & STATUTORY SAFEGUARD ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#faf9f5] text-[#cc785c] border border-[#e6dfd8]">
              Module 03 · Care Retention
            </span>
            <span className="text-xs text-[#8e8b82]">/</span>
            <span className="text-xs text-[#6c6a64]">14-Day SLA Watchdog</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-normal text-[#141413] font-serif-claude tracking-tight">
            Care Continuity &amp; Stalled Referral Ledger
          </h2>
          <p className="text-sm text-[#3d3d3a] leading-relaxed mt-2">
            Monitoring callers referred to in-person psychiatric clinics. When 14 days elapse with no clinic verification, cases route to the certified counsellor work queue for human follow-up.
          </p>
        </div>

        {/* Statutory Safeguard Strip */}
        <div className="mt-6 p-4 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl text-xs text-[#3d3d3a] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5db872] shrink-0" />
            <span>
              <strong className="text-[#141413]">Statutory Compliance Invariant:</strong> 100% of candidates have recorded intake consent. Zero automated robocalling permitted under Section 23 of the Mental Healthcare Act 2017.
            </span>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Ticket'}</span>
            </button>
          )}
        </div>

        {/* Add Referral Form when in Edit Mode */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-5 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl space-y-3.5 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#141413] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#cc785c]" /> Register Synthetic Stalled Ticket
              </span>
              <span className="text-[11px] text-[#8e8b82]">Auto-evaluates complementary suppression</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-[#6c6a64] block mb-1">Block Node:</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-white border border-[#e6dfd8] rounded-md p-2 text-xs text-[#141413]"
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
                <label className="text-xs text-[#6c6a64] block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])}
                  className="w-full bg-white border border-[#e6dfd8] rounded-md p-2 text-xs text-[#141413]"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                  <option value="Psychosis">Psychosis</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#6c6a64] block mb-1">Assigned Clinic:</label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-white border border-[#e6dfd8] rounded-md p-2 text-xs text-[#141413]"
                >
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital (HQ)</option>
                  <option value="Lakhipur BPHC / CHC">Lakhipur BPHC / CHC</option>
                  <option value="Dholai Model Hospital">Dholai Model Hospital</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#6c6a64] block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-white border border-[#e6dfd8] rounded-md p-2 text-xs font-mono text-[#141413]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium px-4 py-2 rounded-md text-xs cursor-pointer shadow-xs"
            >
              Commit Ticket
            </button>
          </form>
        )}

        {/* 3 Metric Registers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#e6dfd8]">
          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5 shadow-2xs">
            <span className="text-xs uppercase tracking-wider text-[#c64545] block mb-1">
              Stalled SLA (&gt;14d)
            </span>
            <div className="text-3xl font-normal text-[#c64545] font-serif-claude">{counts.stalled}</div>
            <p className="text-xs text-[#6c6a64] mt-1 font-mono text-[11px]">Awaiting counsellor review</p>
          </div>

          <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-xl p-5 shadow-2xs">
            <span className="text-xs uppercase tracking-wider text-[#e8a55a] block mb-1">
              Outreach Active
            </span>
            <div className="text-3xl font-normal text-[#141413] font-serif-claude">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-[#6c6a64] mt-1 font-mono text-[11px]">Callback or ASHA visit</p>
          </div>

          <div className="bg-[#faf9f5] border border-[#5db872]/50 rounded-xl p-5 shadow-2xs">
            <span className="text-xs uppercase tracking-wider text-[#5db872] block mb-1">
              Care Recovered
            </span>
            <div className="text-3xl font-normal text-[#5db872] font-serif-claude">{counts.resolved}</div>
            <p className="text-xs text-[#6c6a64] mt-1 font-mono text-[11px]">Verified clinic attendance</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: QUEUE TABLE & ACTIONS ── */}
      <section className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-normal text-[#141413] font-serif-claude tracking-tight">
              Prioritized Stalled Referral Queue ({filteredRecords.length} Cases)
            </h3>
            <p className="text-xs text-[#6c6a64] mt-1">
              Select "Check In" to record structured telephonic outreach or dispatch village health workers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8e8b82]" />
              <input
                type="text"
                placeholder="Search case, block, hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#faf9f5] border border-[#e6dfd8] rounded-md text-xs w-full text-[#141413] placeholder:text-[#8e8b82] focus:outline-none focus:border-[#cc785c]"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#faf9f5] border border-[#e6dfd8] rounded-md px-2.5 py-1.5 text-xs text-[#141413]"
            >
              <option value="All">All Districts</option>
              <option value="Cachar">Cachar District</option>
              <option value="Kamrup Metro">Kamrup Metro</option>
            </select>
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left bg-[#faf9f5] rounded-xl border border-[#e6dfd8] overflow-hidden">
            <thead className="bg-[#efe9de] text-[#141413] uppercase text-[10px] border-b border-[#e6dfd8]">
              <tr>
                <th className="py-3 px-3">Ticket ID</th>
                <th className="py-3 px-3">Block Node</th>
                <th className="py-3 px-3">mhGAP Category</th>
                <th className="py-3 px-3 text-center">Stall Age</th>
                <th className="py-3 px-3">Target Clinic</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6dfd8]">
              {filteredRecords.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-[#f5f0e8] transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-[#141413] whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#141413] block">{r.block}</span>
                    <span className="text-[10px] text-[#8e8b82]">{r.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#141413] block">{r.mhgapCode}</span>
                    <span className="text-[10px] text-[#8e8b82]">{r.language} · {r.ageBand}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-xs text-[#c64545] font-medium">
                      {r.daysStalled}d
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#3d3d3a] whitespace-nowrap">
                    {r.assignedFacility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                        r.status === 'Resolved'
                          ? 'bg-[#5db872]/15 text-[#5db872] border border-[#5db872]/30'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-[#5db8a6]/15 text-[#5db8a6] border border-[#5db8a6]/30'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-[#e8a55a]/15 text-[#e8a55a] border border-[#e8a55a]/30'
                          : 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-3 py-1 rounded-md text-xs font-medium transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-white" />
                      <span>Check In</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical Drawer (Dark Surface Card) */}
        <div className="bg-[#181715] rounded-xl overflow-hidden text-[#faf9f5] border border-[#252320] mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-6 py-4 bg-[#181715] hover:bg-[#1f1e1b] text-left flex items-center justify-between text-xs font-medium text-[#a09d96] hover:text-white transition-colors cursor-pointer"
          >
            <span>Show Primary &amp; Secondary Complementary Suppression Architecture</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#a09d96]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a09d96]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-6 space-y-4 bg-[#1f1e1b] border-t border-[#252320] text-xs">
              <div className="bg-[#252320] p-4 rounded-lg space-y-1">
                <p className="font-semibold text-white">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-[#a09d96] text-[11px] leading-relaxed">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If exactly one cell in a reporting slice is masked, <strong>Secondary (Complementary) Suppression</strong> is automatically enforced on the second-smallest cell to eliminate algebraic subtraction attacks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded px-2.5 py-1 text-[11px] font-mono ${
                      stat.suppressionType === 'primary'
                        ? 'bg-[#c64545]/20 text-[#c64545] border-[#c64545]/40 font-semibold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-[#e8a55a]/20 text-[#e8a55a] border-[#e8a55a]/40 font-semibold'
                        : 'bg-[#252320] text-[#cdcdcd] border-white/10'
                    }`}
                  >
                    <span className="text-[#a09d96]">{stat.group}:</span>{' '}
                    <span>{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Action Dialog Modal */}
      {activeRecordForAction && (
        <div className="fixed inset-0 bg-[#141413]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#faf9f5] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#e6dfd8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-3">
              <div>
                <h3 className="text-lg font-normal text-[#141413] font-serif-claude">Log Counsellor Outreach</h3>
                <p className="text-xs text-[#8e8b82] font-mono">
                  Ticket {activeRecordForAction.id} · Node: {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-[#8e8b82] hover:text-[#141413] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#efe9de] p-3.5 rounded-lg border border-[#e6dfd8] text-xs space-y-1 text-[#3d3d3a]">
              <div className="flex justify-between">
                <span className="text-[#6c6a64]">Language:</span>
                <span className="font-medium text-[#141413]">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c6a64]">Assigned Clinic:</span>
                <span className="font-medium text-[#141413]">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c6a64]">Stall Duration:</span>
                <span className="font-mono text-[#c64545] font-semibold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#3d3d3a]">Outreach Notes:</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Counsellor called patient; transport coordinated for Sonai camp..."
                className="w-full text-xs p-2.5 bg-white border border-[#e6dfd8] rounded-lg focus:outline-none focus:border-[#cc785c] text-[#141413]"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-[#6c6a64] block">Update Status:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded-lg border border-[#e6dfd8] bg-white hover:bg-[#f5f0e8] text-xs flex items-center justify-between text-[#141413] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#cc785c]" />
                    <span>Callback completed — scheduled for mobile camp</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded-lg border border-[#e6dfd8] bg-white hover:bg-[#f5f0e8] text-xs flex items-center justify-between text-[#141413] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#e8a55a]" />
                    <span>Phone unreachable — dispatched Block ASHA for home visit</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full text-left p-3 rounded-lg border border-[#e6dfd8] bg-white hover:bg-[#f5f0e8] text-xs flex items-center justify-between text-[#141413] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5db872]" />
                    <span>Verified in-person clinical visit completed</span>
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
