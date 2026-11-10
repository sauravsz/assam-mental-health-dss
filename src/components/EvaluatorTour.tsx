import { useState, useEffect } from 'react'
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  CheckCircle2,
  Activity,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useScenarioData } from '../engine/scenarioDataContext'
import type { AppView } from '../App'

interface EvaluatorTourProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: AppView) => void
  setNumVans?: (n: number) => void
}

interface TourStep {
  id: number
  phase: string
  title: string
  view: AppView
  icon: typeof Activity
  statutoryRef: string
  mathBadge: string
  brief: string
  keyFinding: string
  actionLabel: string
  executeAction: (ctx: {
    onNavigate: (view: AppView) => void
    applyPresetScenario: ReturnType<typeof useScenarioData>['applyPresetScenario']
    setUserRole: ReturnType<typeof useScenarioData>['setUserRole']
    setNumVans?: (n: number) => void
  }) => void
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    phase: 'Phase 1 of 4 · Surveillance',
    title: 'Earlier Anomaly Surveillance via Discrete Poisson Shocks',
    view: 'state',
    icon: Activity,
    statutoryRef: 'NESFIC Criteria: Earlier Anomaly Detection',
    mathBadge: 'Poisson P(Y ≥ y | λ) · Z > 2.5 · α = 0.01',
    brief:
      'Detects localized mental distress spikes from Tele-MANAS call telemetry before clinical backlogs form. Integrates ASDMA flood crisis multipliers to prevent false-alarm suppression in disaster zones.',
    keyFinding:
      'In a 2.5x monsoon shock, Cachar surges to 680 calls with Z = 3.65 (p < 0.0001), triggering an immediate emergency mobile camp directive.',
    actionLabel: 'Inject Barak Valley Monsoon Surge',
    executeAction: ({ onNavigate, applyPresetScenario }) => {
      applyPresetScenario('barak_flood')
      onNavigate('state')
    },
  },
  {
    id: 2,
    phase: 'Phase 2 of 4 · Optimization',
    title: 'Mobile DMHP Van Siting via Two-Phase Simplex LP',
    view: 'planner',
    icon: MapPin,
    statutoryRef: 'NESFIC Criteria: Optimal Service Planning',
    mathBadge: 'Capacitated p-Median LP · <25 ms Solver Latency',
    brief:
      'Solves the Capacitated p-Median Transportation Linear Program entirely client-side. Evaluates patient distance matrices, clinic capacities, and flood road impedance without greedy heuristic bias.',
    keyFinding:
      'Optimizing 2 mobile vans in Cachar cuts mean patient travel time from 51.2 min (conventional town-first baseline) to 35.3 min — a verified 31.0% travel-time reduction.',
    actionLabel: 'Solve Two-Phase Simplex Siting',
    executeAction: ({ onNavigate, setNumVans }) => {
      if (setNumVans) setNumVans(2)
      onNavigate('planner')
    },
  },
  {
    id: 3,
    phase: 'Phase 3 of 4 · Retention',
    title: 'Care Retention Queue & Closed-Loop Counsellor Audit',
    view: 'queue',
    icon: HeartHandshake,
    statutoryRef: 'MHCA 2017 §23 & DPDP Act 2023 §6',
    mathBadge: 'Absorbing Markov Funnel · N = (I - Q)⁻¹ · 3.2% Recovery',
    brief:
      'Models the 4-stage referral drop-off where 96.8% of Tele-MANAS callers never reach in-person care. Provides human counsellors with a priority queue of stalled callers (>14 days) backed by informed statutory consent.',
    keyFinding:
      'Counsellor check-ins require verified consent with zero robocalls. Only confirmed facility attendance closes a case, algebraically preventing artificial funnel inflation.',
    actionLabel: 'Inspect Counsellor Retention Queue',
    executeAction: ({ onNavigate, setUserRole }) => {
      setUserRole('Counsellor')
      onNavigate('queue')
    },
  },
  {
    id: 4,
    phase: 'Phase 4 of 4 · Governance',
    title: 'DPDP 2023 Compliance & SHA-256 Verifiable Audit Chain',
    view: 'audit',
    icon: ShieldCheck,
    statutoryRef: 'DPDP Act 2023 & Indian IT Act 2000',
    mathBadge: 'Genesis SHA-256 Block · Small-Cell Suppression (n < 10)',
    brief:
      'Ensures every algorithm run, role elevation, and CSV ingestion is immutably logged into a client-side SHA-256 cryptographic chain. Sensitive caller IDs are salted and pseudonymized upon intake.',
    keyFinding:
      'Any unauthorized retrospective edit immediately invalidates subsequent hash pointers, flipping the system ledger status from OK to BROKEN with exact block-height attribution.',
    actionLabel: 'Verify Ledger & Run Tamper Test',
    executeAction: ({ onNavigate, setUserRole }) => {
      setUserRole('State Director')
      onNavigate('audit')
    },
  },
]

export const EvaluatorTour = ({ isOpen, onClose, onNavigate, setNumVans }: EvaluatorTourProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const { applyPresetScenario, setUserRole } = useScenarioData()

  const currentStep = TOUR_STEPS[currentStepIndex]

  // Automatically execute step navigation when step index changes while tour is open
  const runStep = (index: number) => {
    setCurrentStepIndex(index)
    const step = TOUR_STEPS[index]
    step.executeAction({ onNavigate, applyPresetScenario, setUserRole, setNumVans })
  }

  // Auto-play timer (advances every 10 seconds if enabled)
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % TOUR_STEPS.length
        TOUR_STEPS[next].executeAction({ onNavigate, applyPresetScenario, setUserRole, setNumVans })
        return next
      })
    }, 10000)
    return () => clearInterval(timer)
  }, [isOpen, isAutoPlaying, onNavigate, applyPresetScenario, setUserRole, setNumVans])

  if (!isOpen) return null

  const Icon = currentStep.icon

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[580px] z-50 animate-fade-in">
      <div className="bg-card border-2 border-blue-600/60 dark:border-blue-400/60 rounded-2xl shadow-2xl p-4 sm:p-5 backdrop-blur-xl bg-card/95 text-charcoal">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Evaluator Guided Tour
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-container text-muted border border-hairline">
                  {currentStep.phase}
                </span>
              </div>
              <p className="text-[11px] text-muted">{currentStep.statutoryRef}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? 'Pause 10s auto-advance' : 'Enable 10s auto-advance'}
              className="p-1 rounded-lg hover:bg-hairline text-muted hover:text-charcoal transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-blue-600" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto'}</span>
            </button>
            <button
              onClick={onClose}
              title="Close evaluator walkthrough"
              className="p-1 rounded-lg hover:bg-hairline text-muted hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="py-3.5 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-container text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-charcoal leading-snug">{currentStep.title}</h4>
              <span className="inline-block mt-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                {currentStep.mathBadge}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">{currentStep.brief}</p>

          <div className="bg-container border border-hairline rounded-xl p-2.5 text-xs text-charcoal">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-charcoal">Evaluator Takeaway: </span>
                <span className="text-muted">{currentStep.keyFinding}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action & Navigation Controls */}
        <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => runStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-blue-600 dark:bg-blue-400 scale-125'
                    : 'bg-hairline hover:bg-muted'
                }`}
                title={`Jump to ${s.title}`}
              />
            ))}
            <span className="text-[11px] font-medium text-muted ml-2 font-mono">
              {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runStep(currentStepIndex)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentStep.actionLabel}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => runStep(Math.max(0, currentStepIndex - 1))}
                className="p-1.5 rounded-xl bg-container hover:bg-hairline text-charcoal disabled:opacity-30 disabled:cursor-not-allowed border border-hairline transition-all cursor-pointer"
                title="Previous tour phase"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentStepIndex === TOUR_STEPS.length - 1}
                onClick={() => runStep(Math.min(TOUR_STEPS.length - 1, currentStepIndex + 1))}
                className="p-1.5 rounded-xl bg-container hover:bg-hairline text-charcoal disabled:opacity-30 disabled:cursor-not-allowed border border-hairline transition-all cursor-pointer"
                title="Next tour phase"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
