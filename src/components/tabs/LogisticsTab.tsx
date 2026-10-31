import type { Block, Facility } from '../../engine/types'

interface LogisticsTabProps {
  blocks: Block[]
  facilities: Facility[]
  isEditMode: boolean
  updateMedicineStock: (
    facId: number,
    med: 'haloperidol' | 'fluoxetine' | 'valproate',
    status: 'Adequate' | 'Low Stock' | 'Critical'
  ) => void
}

export const LogisticsTab = ({
  blocks,
  facilities,
  isEditMode,
  updateMedicineStock,
}: LogisticsTabProps) => {
  return (
    <div className="space-y-4">
      {/* Panel 1: Psychotropic Stock matching dss-1 #medtbl */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Psychotropic medicine stock
        </h2>
        <p className="text-[13px] text-[var(--mut)] mb-3">
          Alert triggered when facility stock covers fewer than 15 days of projected camp demand. In edit mode, dropdowns allow manual stock updates.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[13px] text-[var(--mut)] font-medium">
                <th className="py-2 px-2.5">Health Facility</th>
                <th className="py-2 px-2.5">Revenue Circle</th>
                <th className="py-2 px-2.5 text-center">Haloperidol (Antipsychotic)</th>
                <th className="py-2 px-2.5 text-center">Fluoxetine (Antidepressant)</th>
                <th className="py-2 px-2.5 text-center">Sodium Valproate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-[var(--line)]/20">
                  <td className="py-2.5 px-2.5 font-medium text-[var(--ink)]">{fac.name}</td>
                  <td className="py-2.5 px-2.5 text-[var(--mut)]">{fac.blockName}</td>

                  {/* Haloperidol */}
                  <td className="py-2.5 px-2.5 text-center">
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.haloperidol}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'haloperidol',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="text-[12px] p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          fac.medicineStock.haloperidol === 'Adequate'
                            ? 'bg-[var(--ok)]/15 text-[var(--ok)]'
                            : fac.medicineStock.haloperidol === 'Low Stock'
                            ? 'bg-[var(--tea)]/15 text-[var(--tea)]'
                            : 'bg-[var(--alert)]/15 text-[var(--alert)] font-semibold'
                        }`}
                      >
                        {fac.medicineStock.haloperidol}
                      </span>
                    )}
                  </td>

                  {/* Fluoxetine */}
                  <td className="py-2.5 px-2.5 text-center">
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.fluoxetine}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'fluoxetine',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="text-[12px] p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          fac.medicineStock.fluoxetine === 'Adequate'
                            ? 'bg-[var(--ok)]/15 text-[var(--ok)]'
                            : fac.medicineStock.fluoxetine === 'Low Stock'
                            ? 'bg-[var(--tea)]/15 text-[var(--tea)]'
                            : 'bg-[var(--alert)]/15 text-[var(--alert)] font-semibold'
                        }`}
                      >
                        {fac.medicineStock.fluoxetine}
                      </span>
                    )}
                  </td>

                  {/* Valproate */}
                  <td className="py-2.5 px-2.5 text-center">
                    {isEditMode ? (
                      <select
                        value={fac.medicineStock.valproate}
                        onChange={(e) =>
                          updateMedicineStock(
                            fac.id,
                            'valproate',
                            e.target.value as 'Adequate' | 'Low Stock' | 'Critical'
                          )
                        }
                        className="text-[12px] p-1 border border-[var(--line)] rounded bg-[var(--panel)] text-[var(--ink)]"
                      >
                        <option value="Adequate">Adequate</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          fac.medicineStock.valproate === 'Adequate'
                            ? 'bg-[var(--ok)]/15 text-[var(--ok)]'
                            : fac.medicineStock.valproate === 'Low Stock'
                            ? 'bg-[var(--tea)]/15 text-[var(--tea)]'
                            : 'bg-[var(--alert)]/15 text-[var(--alert)] font-semibold'
                        }`}
                      >
                        {fac.medicineStock.valproate}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel 2: Counselling & Rehabilitation Planning matching dss-1 #svctbl */}
      <div className="dss-panel">
        <h2 className="text-[19px] font-semibold text-[var(--ink)] font-serif-fraunces mb-1">
          Counselling and rehabilitation planning
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[13px] text-[var(--mut)] font-medium">
                <th className="py-2 px-2.5">Revenue Block</th>
                <th className="py-2 px-2.5 text-right">Population</th>
                <th className="py-2 px-2.5 text-right">Projected Monthly Sessions</th>
                <th className="py-2 px-2.5 text-right">Counsellors Required</th>
                <th className="py-2 px-2.5 text-right">Rehab-Relevant Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {blocks.map((b) => {
                const sessions = Math.round((b.population / 10000) * 1.5 * 10) / 10
                const counsellors = Math.max(1, Math.round((sessions / 80) * 10) / 10)
                const rehabCases = Math.round(sessions * 0.22)

                return (
                  <tr key={b.id} className="hover:bg-[var(--line)]/20">
                    <td className="py-2 px-2.5 font-medium text-[var(--ink)]">{b.name}</td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">{b.population.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--ink)]">{sessions} sessions</td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--river)] font-semibold">{counsellors} staff</td>
                    <td className="py-2 px-2.5 text-right font-mono text-[var(--mut)]">{rehabCases} cases</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-[var(--mut)] mt-3">
          Sessions needed = calls in the last 30 days × 1.5. Each counsellor delivers 80 sessions a month. Rehab-relevant calls are psychosis and substance-use categories.
        </p>
      </div>
    </div>
  )
}
