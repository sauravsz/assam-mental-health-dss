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
      {/* ── SECTION 1: CONTEXT & STATUTORY SAFEGUARD ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl p-6 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#101111] text-[#ffc533] border border-[#242728]">
              Module 03 · Care Continuity
            </span>
            <span className="text-xs text-[#6a6b6c]">•</span>
            <span className="text-xs text-[#9c9c9d]">14-Day SLA Watchdog</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-[#f4f4f6] tracking-tight">
            Care Continuity &amp; Stalled Referral Ledger
          </h2>
          <p className="text-sm text-[#cdcdcd] leading-relaxed mt-1.5">
            Tracks helpline callers advised to complete in-person psychiatric visits. When 14 days elapse with no clinic verification, cases route to the certified human counsellor work queue.
          </p>
        </div>

        {/* Statutory Safeguard Strip */}
        <div className="mt-5 p-3 bg-[#101111] border border-[#242728] rounded-lg text-xs text-[#cdcdcd] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#59d499] shrink-0" />
            <span>
              <strong className="text-white">Statutory Compliance Invariant:</strong> 100% of candidates have recorded intake consent. Zero automated robocalling permitted under Section 23 of the Mental Healthcare Act 2017.
            </span>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white hover:bg-[#e8e8e8] text-black font-semibold px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Add' : '+ Add Test Ticket'}</span>
            </button>
          )}
        </div>

        {/* Add Referral Form when in Edit Mode */}
        {isEditMode && showAddForm && (
          <form onSubmit={handleAddCase} className="mt-4 p-4 bg-[#101111] border border-[#242728] rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#57c1ff]" /> Register Synthetic Stalled Ticket
              </span>
              <span className="text-[10px] text-[#6a6b6c]">Auto-evaluates complementary suppression</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-[#9c9c9d] block mb-1">Block Node:</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full bg-[#07080a] border border-[#242728] rounded p-1.5 text-xs text-white"
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
                <label className="text-[11px] text-[#9c9c9d] block mb-1">mhGAP Category:</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value as ReferralRecord['mhgapCode'])}
                  className="w-full bg-[#07080a] border border-[#242728] rounded p-1.5 text-xs text-white"
                >
                  <option value="Depression">Depression</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Harm">Self-Harm Risk</option>
                  <option value="Substance">Substance Use</option>
                  <option value="Psychosis">Psychosis</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#9c9c9d] block mb-1">Assigned Clinic:</label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-[#07080a] border border-[#242728] rounded p-1.5 text-xs text-white"
                >
                  <option value="Katigorah CHC">Katigorah CHC</option>
                  <option value="Sonai BPHC">Sonai BPHC</option>
                  <option value="SM Dev Civil Hospital (HQ)">SM Dev Civil Hospital (HQ)</option>
                  <option value="Lakhipur BPHC / CHC">Lakhipur BPHC / CHC</option>
                  <option value="Dholai Model Hospital">Dholai Model Hospital</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#9c9c9d] block mb-1">Days Stalled:</label>
                <input
                  type="number"
                  min="14"
                  max="60"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value) || 14)}
                  className="w-full bg-[#07080a] border border-[#242728] rounded p-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-white hover:bg-[#e8e8e8] text-black font-semibold px-4 py-1.5 rounded-md text-xs cursor-pointer"
            >
              Commit Ticket
            </button>
          </form>
        )}

        {/* 3 Metric Registers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#242728]">
          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#ff6161] block mb-1 font-mono">
              Stalled SLA (&gt;14d)
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-[#ff6161]">{counts.stalled}</div>
            <p className="text-xs text-[#6a6b6c] mt-1 font-mono text-[11px]">Awaiting counsellor review</p>
          </div>

          <div className="bg-[#101111] border border-[#242728] rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#ffc533] block mb-1 font-mono">
              Outreach Active
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-white">{counts.inFollowup + counts.ashaDispatched}</div>
            <p className="text-xs text-[#6a6b6c] mt-1 font-mono text-[11px]">Callback or ASHA visit</p>
          </div>

          <div className="bg-[#101111] border border-[#59d499]/40 rounded-lg p-4">
            <span className="text-xs uppercase tracking-wider text-[#59d499] block mb-1 font-mono">
              Care Recovered
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-[#59d499]">{counts.resolved}</div>
            <p className="text-xs text-[#6a6b6c] mt-1 font-mono text-[11px]">Verified clinic attendance</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: QUEUE TABLE & ACTIONS ── */}
      <section className="bg-[#0d0d0d] border border-[#242728] rounded-xl shadow-xl overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#f4f4f6] tracking-tight">
              Prioritized Stalled Referral Queue ({filteredRecords.length} Cases)
            </h3>
            <p className="text-xs text-[#9c9c9d] mt-0.5">
              Select "Check In" to record structured telephonic outreach or dispatch village health workers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6a6b6c]" />
              <input
                type="text"
                placeholder="Search case, block, hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#101111] border border-[#242728] rounded-lg text-xs w-full text-white placeholder:text-[#6a6b6c] focus:outline-none"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#101111] border border-[#242728] rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Districts</option>
              <option value="Cachar">Cachar District</option>
              <option value="Kamrup Metro">Kamrup Metro</option>
            </select>
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#101111] text-[#9c9c9d] uppercase text-[10px] border-b border-[#242728]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Block Node</th>
                <th className="py-2.5 px-3">mhGAP Category</th>
                <th className="py-2.5 px-3 text-center">Stall Age</th>
                <th className="py-2.5 px-3">Target Clinic</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242728]">
              {filteredRecords.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-[#101111] transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-white whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#f4f4f6] block">{r.block}</span>
                    <span className="text-[10px] text-[#6a6b6c]">{r.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-white block">{r.mhgapCode}</span>
                    <span className="text-[10px] text-[#6a6b6c]">{r.language} · {r.ageBand}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-xs text-[#ff6161]">
                      {r.daysStalled}d
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#cdcdcd] whitespace-nowrap">
                    {r.assignedFacility}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        r.status === 'Resolved'
                          ? 'bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30'
                          : r.status === 'ASHA Dispatched'
                          ? 'bg-[#57c1ff]/15 text-[#57c1ff] border border-[#57c1ff]/30'
                          : r.status === 'Follow-up Initiated'
                          ? 'bg-[#ffc533]/15 text-[#ffc533] border border-[#ffc533]/30'
                          : 'bg-[#ff6161]/15 text-[#ff6161] border border-[#ff6161]/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveRecordForAction(r)}
                      className="bg-white hover:bg-[#e8e8e8] text-black px-2.5 py-1 rounded text-xs font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-black" />
                      <span>Check In</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technical Drawer */}
        <div className="border border-[#242728] rounded-xl overflow-hidden mt-6 bg-[#07080a]">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 bg-[#0d0d0d] hover:bg-[#101111] text-left flex items-center justify-between text-xs font-medium text-[#9c9c9d] hover:text-white transition-colors cursor-pointer"
          >
            <span>Show Primary &amp; Secondary Complementary Suppression Architecture</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4 text-[#6a6b6c]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6a6b6c]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 space-y-3 bg-[#07080a] border-t border-[#242728] text-xs text-[#cdcdcd]">
              <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] space-y-1">
                <p className="font-semibold text-white">Primary + Secondary Complementary Suppression (DPDP 2023):</p>
                <p className="text-[#9c9c9d] text-[11px] leading-relaxed">
                  Cells with count n &lt; 10 undergo <strong>Primary Suppression</strong>. If exactly one cell in a reporting slice is masked, <strong>Secondary (Complementary) Suppression</strong> is automatically enforced on the second-smallest cell to eliminate algebraic subtraction attacks against marginal totals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {smallCellStats.slice(0, 8).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`border rounded px-2.5 py-1 text-[11px] font-mono ${
                      stat.suppressionType === 'primary'
                        ? 'bg-[#ff6161]/10 text-[#ff6161] border-[#ff6161]/30 font-semibold'
                        : stat.suppressionType === 'secondary'
                        ? 'bg-[#ffc533]/10 text-[#ffc533] border-[#ffc533]/30 font-semibold'
                        : 'bg-[#101111] text-[#cdcdcd] border-[#242728]'
                    }`}
                  >
                    <span className="text-[#6a6b6c]">{stat.group}:</span>{' '}
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
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0d0d] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#242728] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242728] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#f4f4f6]">Log Counsellor Outreach</h3>
                <p className="text-xs text-[#6a6b6c] font-mono">
                  Ticket {activeRecordForAction.id} · Node: {activeRecordForAction.block}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForAction(null)}
                className="text-[#6a6b6c] hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] text-xs space-y-1 text-[#cdcdcd]">
              <div className="flex justify-between">
                <span className="text-[#6a6b6c]">Language:</span>
                <span className="font-semibold text-white">{activeRecordForAction.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a6b6c]">Assigned Hub:</span>
                <span className="font-medium text-white">{activeRecordForAction.assignedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a6b6c]">Stall Duration:</span>
                <span className="font-mono text-[#ff6161] font-bold">{activeRecordForAction.daysStalled} days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#9c9c9d]">Outreach Notes:</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Counsellor called patient; transport coordinated for Sonai camp..."
                className="w-full text-xs p-2.5 bg-[#101111] border border-[#242728] rounded-lg focus:outline-none focus:border-white/30 text-white"
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-[#9c9c9d] block">Update Status:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateStatus('Follow-up Initiated')}
                  className="w-full text-left p-3 rounded-lg border border-[#242728] bg-[#101111] hover:bg-[#141517] hover:border-white/20 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#57c1ff]" />
                    <span>Callback completed — scheduled for mobile camp</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('ASHA Dispatched')}
                  className="w-full text-left p-3 rounded-lg border border-[#242728] bg-[#101111] hover:bg-[#141517] hover:border-white/20 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#ffc533]" />
                    <span>Phone unreachable — dispatched Block ASHA for home visit</span>
                  </span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full text-left p-3 rounded-lg border border-[#242728] bg-[#101111] hover:bg-[#141517] hover:border-white/20 text-xs flex items-center justify-between text-white transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#59d499]" />
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
