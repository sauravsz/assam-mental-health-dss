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
    <div className="space-y-6 max-w-5xl mx-auto font-sans-tech">
      {/* ── SECTION 1: CONTEXT & STATUTORY SAFEGUARD ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.3)] relative">
        {/* PCB Solder Pins */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333]"></div>

        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD700] bg-[#09231A] px-2.5 py-1 rounded border border-[#B87333]/50">
            MODULE 03 // CLOSED_LOOP_RETENTION_BUS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#EAD0AC] font-serif-display tracking-tight mt-2.5">
            Care Continuity &amp; Stalled Referral Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#C2AB8E] leading-relaxed mt-1.5">
            Tracks callers advised to complete clinical psychiatric consults. When 14 days elapse with no facility verification, the case routes into the certified human counsellor work queue.
          </p>
        </div>

        {/* Statutory Safeguard Strip */}
        <div className="mt-4 p-3 bg-[#09231A] border border-[#B87333]/60 rounded text-xs text-[#EAD0AC] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>
              <strong className="text-[#FFD700]">Statutory Compliance Invariant:</strong> 100% of candidates have recorded intake consent. Zero automated robocalling permitted under Section 23 of the Mental Healthcare Act 2017.
            </span>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#D98C53] hover:bg-[#B87333] text-[#09231A] font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer font-sans-tech"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Add' : '+ Insert Test Ticket'}</span>
            </button>
          )}
        </div>

        {/* Add Referral Form when in Edit Mode */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-4 bg-[#09231A] border border-[#FFD700] rounded space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFD700] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#D98C53]" /> INJECT_SYNTHETIC_STALLED_TICKET
              </span>
              <span className="text-[10px] text-[#C2AB8E]">Auto-evaluates complementary suppression</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-[#C2AB8E] block mb-1">Block Node:</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-[#144837] border border-[#B87333] rounded p-1.5 text-xs text-[#FFD700]"
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
                <label className="text-[11px] text-[#C2AB8E] block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])}
                  className="w-full bg-[#144837] border border-[#B87333] rounded p-1.5 text-xs text-[#FFD700]"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                  <option value="Psychosis">Psychosis</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#C2AB8E] block mb-1">Assigned Clinic:</label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-[#144837] border border-[#B87333] rounded p-1.5 text-xs text-[#FFD700]"
                >
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital (HQ)</option>
                  <option value="Lakhipur BPHC / CHC">Lakhipur BPHC / CHC</option>
                  <option value="Dholai Model Hospital">Dholai Model Hospital</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#C2AB8E] block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-[#144837] border border-[#B87333] rounded p-1.5 text-xs font-mono text-[#FFD700]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#D98C53] hover:bg-[#B87333] text-[#09231A] font-bold px-4 py-1.5 rounded text-xs cursor-pointer"
            >
              Commit Ticket to Bus
            </button>
          </form>
        )}

        {/* 3 Metric Registers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#B87333]/30">
          <div className="bg-[#09231A] border border-[#D98C53] rounded-lg p-4">
            <span className="text-xs font-mono uppercase text-[#D98C53] block mb-1">STALLED_SLA (&gt;14d)</span>
            <div className="text-3xl font-bold text-[#D98C53] font-serif-display">{counts.stalled}</div>
            <p className="text-xs text-[#C2AB8E] mt-1 font-mono text-[11px]">Awaiting counsellor review</p>
          </div>

          <div className="bg-[#09231A] border border-[#B87333]/50 rounded-lg p-4">
            <span className="text-xs font-mono uppercase text-[#C2AB8E] block mb-1">OUTREACH_ACTIVE</span>
            <div className="text-3xl font-bold text-[#EAD0AC] font-serif-display">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-[#C2AB8E] mt-1 font-mono text-[11px]">Callback or ASHA dispatch</p>
          </div>

          <div className="bg-[#165B45] border border-[#FFD700] rounded-lg p-4 shadow-[0_0_12px_rgba(255,215,0,0.1)]">
            <span className="text-xs font-mono uppercase text-[#FFD700] block mb-1">CARE_RECOVERED</span>
            <div className="text-3xl font-bold text-[#FFD700] font-serif-display">{counts.resolved}</div>
            <p className="text-xs text-[#EAD0AC] mt-1 font-mono text-[11px]">Verified clinic attendance</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: QUEUE TABLE & ACTIONS ── */}
      <section className="bg-[#144837]/90 border border-[#B87333]/70 rounded-lg shadow-[0_2px_14px_rgba(0,0,0,0.3)] overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#EAD0AC] font-serif-display tracking-wide">
              Prioritized Stalled Referral Queue ({filteredRecords.length} Cases)
            </h3>
            <p className="text-xs text-[#C2AB8E] mt-0.5">
              Select "Check In" to record structured telephonic outreach or dispatch village health workers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#B87333]" />
              <input
                type="text"
                placeholder="Search case, block, hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#09231A] border border-[#B87333] rounded text-xs w-full text-[#FFD700] placeholder:text-[#C2AB8E]/50 focus:outline-none"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#09231A] border border-[#B87333] rounded px-2.5 py-1.5 text-xs text-[#FFD700]"
            >
              <option value="All">All Districts</option>
              <option value="Cachar">Cachar District</option>
              <option value="Kamrup Metro">Kamrup Metro</option>
            </select>
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#09231A] text-[#FFD700] uppercase text-[10px] border-b border-[#B87333]/40">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Block Node</th>
                <th className="py-2.5 px-3">mhGAP Profile</th>
                <th className="py-2.5 px-3 text-center">Stall Age</th>
                <th className="py-2.5 px-3">Target Hub</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B87333]/20">
              {filteredRecords.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-[#1A5944] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#FFD700] whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#EAD0AC] block">{r.block}</span>
                    <span className="text-[10px] text-[#C2AB8E]">{r.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#EAD0AC] block font-sans-tech">{r.mhgapCode}</span>
                    <span className="text-[10px] text-[#C2AB8E]">{r.language} · {r.ageBand}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-[#09231A] bg-[#D98C53] px-2 py-0.5 rounded text-[10px]">
                      {r.daysStalled}d
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#C2AB8E] whitespace-nowrap">
                    {r.assignedFacility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${
                        r.status === 'Resolved'
                          ? 'bg-[#165B45] text-[#FFD700] border border-[#FFD700]'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-[#09231A] text-[#D98C53] border border-[#D98C53]'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-[#09231A] text-[#FFD700] border border-[#FFD700]/70'
                          : 'bg-[#8A2E1B] text-[#FFD700]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-[#D98C53] hover:bg-[#B87333] text-[#09231A] px-3 py-1.5 rounded text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-current" />
                      <span>Check In</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical Drawer */}
        <div className="border border-[#B87333]/50 rounded-lg overflow-hidden mt-6 bg-[#09231A]">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-[#09231A] hover:bg-[#144837] text-left flex items-center justify-between text-xs font-semibold text-[#EAD0AC] transition-colors cursor-pointer font-mono"
          >
            <span>// INSPECT PRIMARY &amp; SECONDARY COMPLEMENTARY SUPPRESSION MASK</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#D98C53]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#D98C53]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-3 bg-[#061812] border-t border-[#B87333]/40 text-xs text-[#EAD0AC]">
              <div className="bg-[#09231A] p-3 rounded border border-[#B87333]/30 space-y-1 font-mono">
                <p className="font-semibold text-[#FFD700]">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-[#C2AB8E] text-[11px] leading-relaxed font-sans-tech">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If exactly one cell in a reporting slice is masked, <strong>Secondary (Complementary) Suppression</strong> is automatically enforced on the second-smallest cell to eliminate algebraic subtraction attacks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 font-mono">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded px-2.5 py-1 text-[11px] ${
                      stat.suppressionType === 'primary'
                        ? 'bg-[#09231A] text-[#FFD700] border-[#D98C53] font-bold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-[#09231A] text-[#D98C53] border-[#B87333] font-semibold'
                        : 'bg-[#144837] text-[#EAD0AC] border-[#B87333]/40'
                    }`}
                  >
                    <span className="text-[#C2AB8E] font-sans-tech">{stat.group}:</span>{' '}
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
        <div className="fixed inset-0 bg-[#061812]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans-tech">
          <div className="bg-[#144837] rounded-lg max-w-md w-full p-6 shadow-2xl border-2 border-[#B87333] space-y-4">
            <div className="flex items-center justify-between border-b border-[#B87333]/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#EAD0AC] font-serif-display">Log Counsellor Outreach</h3>
                <p className="text-xs text-[#C2AB8E] font-mono">
                  Ticket {activeRecordForAction.id} · Node: {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-[#C2AB8E] hover:text-[#FFD700] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#09231A] p-3.5 rounded border border-[#B87333]/40 text-xs space-y-1 text-[#EAD0AC]">
              <div className="flex justify-between">
                <span className="text-[#C2AB8E]">Language:</span>
                <span className="font-semibold text-[#FFD700]">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2AB8E]">Assigned Hub:</span>
                <span className="font-semibold text-[#EAD0AC]">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C2AB8E]">Stall Duration:</span>
                <span className="font-mono text-[#D98C53] font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#EAD0AC]">Outreach Interaction Notes:</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Counsellor called patient; coordinated with mobile van camp..."
                className="w-full text-xs p-2.5 bg-[#09231A] border border-[#B87333] rounded focus:outline-none focus:border-[#FFD700] text-[#EAD0AC]"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#EAD0AC] block font-mono">UPDATE CASE STATE:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded border border-[#B87333]/60 bg-[#09231A] hover:bg-[#165B45] hover:border-[#FFD700] text-xs flex items-center justify-between text-[#EAD0AC] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Callback completed — scheduled for mobile van camp</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded border border-[#B87333]/60 bg-[#09231A] hover:bg-[#165B45] hover:border-[#FFD700] text-xs flex items-center justify-between text-[#EAD0AC] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#D98C53]" />
                    <span>Phone unreachable — dispatched Block ASHA for home visit</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full text-left p-3 rounded border border-[#B87333]/60 bg-[#09231A] hover:bg-[#165B45] hover:border-[#FFD700] text-xs flex items-center justify-between text-[#EAD0AC] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" />
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
