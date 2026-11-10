import { useState, useRef } from 'react'
import { ShieldCheck, ShieldAlert, Upload, RefreshCw, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'
import { useScenarioData } from '../engine/scenarioDataContext'

export const AuditLogView = () => {
  const {
    userRole,
    auditLogs,
    isChainValid,
    chainBreakReason,
    simulateTamper,
    ingestCsv,
    resetToDefaults,
  } = useScenarioData()

  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessing(true)
    setUploadStatus(null)

    try {
      const text = await file.text()
      const res = await ingestCsv(text)
      setUploadStatus({
        success: res.success,
        message: res.success
          ? `Successfully ingested CSV: ${res.acceptedRows} accepted, ${res.rejectedRows} rejected, ${res.hashedFieldsCount} caller IDs pseudonymized.`
          : `Ingestion failed. Processed ${res.totalRowsProcessed} rows, 0 valid. ${res.errors.join('; ')}`,
      })
    } catch {
      setUploadStatus({ success: false, message: 'Failed to read CSV file' })
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Section 1: Governance & Header */}
      <section className="bg-[#f7f4ed] border border-[#eceae4] rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h1 className="text-xl font-bold text-[#1c1c1c] tracking-tight">
                Cryptographic Audit Log &amp; SHA-256 Hash Chain
              </h1>
            </div>
            <p className="text-xs text-[#5f5f5d] mt-1">
              Tamper-evident append-only ledger enforcing <strong>DPDP Act 2023</strong> and <strong>MHCA 2017 §23</strong> with salted SHA-256 caller pseudonymization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'State Director' ? (
              <button
                onClick={() => simulateTamper()}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Deliberately tamper with an existing log record to test SHA-256 chain verification"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulate DB Tampering</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-[#5f5f5d] bg-[rgba(28,28,28,0.04)] px-2.5 py-1 rounded-lg border border-[#eceae4]">
                Scope: {userRole} (Read-Only)
              </span>
            )}
            <button
              onClick={resetToDefaults}
              className="bg-[rgba(28,28,28,0.04)] hover:bg-slate-200 text-[#1c1c1c] border border-[#eceae4] font-semibold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset state memory to genesis parameters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Chain Integrity Banner */}
        <div className="mt-5">
          {isChainValid ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Cryptographic Chain Verification: INTACT</h4>
                  <p className="text-[12px] text-emerald-700 mt-0.5">
                    All {auditLogs.length} audit entries verified against previous SHA-256 hash signatures. Zero unauthorized edits detected.
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-1 rounded">
                SHA-256 VALID
              </span>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-900">Cryptographic Chain Alert: CHAIN BROKEN</h4>
                  <p className="text-[12px] text-red-700 mt-0.5">
                    {chainBreakReason || 'Hash mismatch detected! An entry was modified without updating subsequent block hashes.'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetToDefaults}
                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-[#fcfbf8] px-3 py-1.5 rounded-lg transition-all"
              >
                Restore Initial Chain
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: CSV Ingestion */}
      {userRole === 'State Director' && (
        <section className="bg-[#f7f4ed] border border-[#eceae4] rounded-2xl p-5 sm:p-6 ">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-[#1c1c1c]">Programme CSV Ingestion &amp; Pseudonymization</h3>
              <p className="text-xs text-[#5f5f5d] mt-0.5">
                Upload raw Tele-MANAS programme CSV data. Phone numbers &amp; caller IDs are salted and SHA-256 hashed before reaching state memory.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload-input"
              />
              <label
                htmlFor="csv-upload-input"
                className="bg-indigo-600 hover:bg-indigo-700 text-[#fcfbf8] font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer "
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Processing CSV...' : 'Upload CSV File'}</span>
              </label>
            </div>
          </div>

          {uploadStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                uploadStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Section 3: Audit Trail */}
      <section className="bg-[#f7f4ed] border border-[#eceae4] rounded-2xl p-5 sm:p-6 ">
        <h3 className="text-base font-bold text-[#1c1c1c] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#5f5f5d]" />
          <span>Immutable Audit Log Trail ({auditLogs.length} Entries)</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-[#eceae4]">
          <table className="w-full text-left text-xs text-[#1c1c1c]">
            <thead className="bg-[#f7f4ed] border-b border-[#eceae4] text-[#1c1c1c] font-semibold uppercase tracking-wider text-[12px]">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Scope</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-3 py-2.5">Details</th>
                <th className="px-3 py-2.5">Previous Hash</th>
                <th className="px-3 py-2.5">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[12px]">
              {auditLogs.slice().reverse().map((log) => (
                <tr key={log.id} className="hover:bg-[#f7f4ed]/80 transition-colors">
                  <td className="px-3 py-2 font-bold text-[#1c1c1c]">#{log.id}</td>
                  <td className="px-3 py-2 text-[#5f5f5d] whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-3 py-2 font-sans font-semibold text-indigo-700">{log.userRole}</td>
                  <td className="px-3 py-2 font-sans text-[#5f5f5d]">{log.districtContext}</td>
                  <td className="px-3 py-2 font-sans font-bold text-[#1c1c1c]">{log.action}</td>
                  <td className="px-3 py-2 font-sans text-[#1c1c1c] max-w-xs truncate">{log.details}</td>
                  <td className="px-3 py-2 text-[#5f5f5d] font-mono text-[12px] truncate max-w-[100px]" title={log.previousHash}>
                    {log.previousHash.substring(0, 12)}...
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-emerald-800 font-bold truncate max-w-[120px]" title={log.hash}>
                    {log.hash.substring(0, 12)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
