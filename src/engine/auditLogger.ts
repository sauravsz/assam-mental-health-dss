import type { AuditLogEntry, UserRole } from './types'

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback simple FNV-1a style hash for non-secure contexts / tests
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0') + 'fallback' + (hash >>> 0).toString(16).padStart(8, '0') + '00000000000000000000000000000000000000000000000000000000'.substring(0, 48)
}

export const GENESIS_HASH = '0'.repeat(64)

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 1,
    timestamp: '2026-11-08 09:15:02',
    userRole: 'State Director',
    districtContext: 'All Districts',
    action: 'SYSTEM_INITIALIZATION',
    details: 'DSS System Boot, initialized Poisson anomaly model & Simplex optimizer',
    outcome: 'PERMITTED',
    previousHash: GENESIS_HASH,
    hash: '8f9a2b1c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
  },
]

export async function appendAuditLog(
  logs: AuditLogEntry[],
  userRole: UserRole,
  districtContext: string,
  action: string,
  details: string,
  outcome: 'PERMITTED' | 'ACCESS_DENIED' | 'TAMPER_DETECTED' = 'PERMITTED'
): Promise<AuditLogEntry[]> {
  const previousHash = logs.length > 0 ? logs[logs.length - 1].hash : GENESIS_HASH
  const id = logs.length + 1
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  const payload = `${id}|${timestamp}|${userRole}|${districtContext}|${action}|${details}|${outcome}|${previousHash}`
  const hash = await sha256Hex(payload)
  const newEntry: AuditLogEntry = {
    id,
    timestamp,
    userRole,
    districtContext,
    action,
    details,
    outcome,
    previousHash,
    hash,
  }
  return [...logs, newEntry]
}

export async function verifyAuditChain(
  logs: AuditLogEntry[]
): Promise<{ isValid: boolean; brokenIndex?: number; reason?: string }> {
  if (logs.length === 0) return { isValid: true }
  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i]
    const expectedPrev = i === 0 ? GENESIS_HASH : logs[i - 1].hash
    if (i > 0 && entry.previousHash !== expectedPrev) {
      return { isValid: false, brokenIndex: i, reason: `Previous hash mismatch at index ${i + 1}. Chain broken.` }
    }
    if (i === 0 && entry.previousHash !== GENESIS_HASH) {
      return { isValid: false, brokenIndex: i, reason: `Genesis previous hash mismatch.` }
    }
    const payload = `${entry.id}|${entry.timestamp}|${entry.userRole}|${entry.districtContext}|${entry.action}|${entry.details}|${entry.outcome}|${entry.previousHash}`
    const expectedHash = await sha256Hex(payload)
    if (entry.hash !== expectedHash) {
      return { isValid: false, brokenIndex: i, reason: `Payload hash mismatch at entry ${i + 1} (${entry.action}). Entry contents were modified.` }
    }
  }
  return { isValid: true }
}

export function simulateTamper(logs: AuditLogEntry[]): AuditLogEntry[] {
  if (logs.length < 2) return logs
  const tampered = [...logs]
  tampered[1] = { ...tampered[1], details: 'TAMPERED: Altered call count record without authorization' }
  return tampered
}
