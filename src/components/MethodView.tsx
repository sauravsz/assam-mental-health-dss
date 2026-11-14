import { Activity, MapPin, HeartHandshake, ShieldCheck, AlertTriangle } from 'lucide-react'

const Head = ({ n, icon: Icon, accent, children }: { n: string; icon: typeof Activity; accent: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="icon-chip" style={{ ['--accent' as string]: `var(--${accent})` }}>
      <Icon className="w-4 h-4" />
    </span>
    <div>
      <span className="eyebrow">Engine {n}</span>
      <h2 className="leading-tight">{children}</h2>
    </div>
  </div>
)

export const MethodView = () => (
  <div className="space-y-5 max-w-4xl mx-auto">
    <div className="hero p-6">
      <span className="eyebrow">Methodology</span>
      <h1 className="mt-1">How we know.</h1>
      <p className="text-[14px] text-muted mt-2 max-w-2xl">
        Every formula behind every alert, on one page. Operator screens link here instead of embedding math.
      </p>
    </div>

    <section className="card p-6">
      <Head n="1" icon={Activity} accent="brand-1">Surveillance — exact Poisson tail</Head>
      <p className="formula tnum text-[13px] mb-3 text-charcoal">P(Y &gt;= y | lambda) = 1 - sum_k lambda^k e^-lambda / k! (k=0..y-1)</p>
      <p className="text-[14px] text-muted">
        Exact discrete tail (not a Gaussian approximation) so small rural counts stay valid. Alert flag at Z ≥ 2.5 (p &lt; 0.01) — a prompt for human follow-up, not a diagnosis.
      </p>
    </section>

    <section className="card p-6">
      <Head n="2" icon={MapPin} accent="brand-2">Camp siting — capacitated p-median LP</Head>
      <p className="formula tnum text-[13px] mb-3 text-charcoal">min Z = sum_i sum_j d_i * c_ij * x_ij + M * sum_i u_i</p>
      <p className="text-[14px] text-muted">
        Two-Phase Primal Simplex in TypeScript. Baseline = headquarters-first; optimum = demand-weighted travel time with unserved-demand penalty.
      </p>
    </section>

    <section className="card p-6">
      <Head n="3" icon={HeartHandshake} accent="brand-rose">Retention — absorbing Markov chain</Head>
      <p className="formula tnum text-[13px] mb-3 text-charcoal">N = (I - Q)^-1 &nbsp;&nbsp; B = N * R</p>
      <p className="text-[14px] text-muted">
        4 transient states (Intake, Specialist, eSanjeevani, DMHP) → 2 absorbing (Verified Recovery, Defaulted). Theoretical absorption 3.2% per 10,000 — the case for the queue.
      </p>
    </section>

    <section className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="icon-chip" style={{ ['--accent' as string]: 'var(--brand-1)' }}><ShieldCheck className="w-4 h-4" /></span>
        <div>
          <span className="eyebrow">Compliance</span>
          <h2 className="leading-tight">Privacy — DPDP Act 2023 &amp; MHCA 2017 Sec 23</h2>
        </div>
      </div>
      <ul className="list-disc pl-5 text-[14px] text-muted space-y-1.5 tnum marker:text-[color:var(--brand-1)]">
        <li>Caller IDs salted and SHA-256 hashed; raw values never retained.</li>
        <li>Counts &lt; 10 suppressed (primary + secondary complementary suppression).</li>
        <li>Every action appended to a SHA-256 hash chain; tamper breaks the chain visibly.</li>
        <li>No automated calls or messages; all follow-up counsellor-initiated with recorded consent.</li>
      </ul>
    </section>

    <section className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="icon-chip" style={{ ['--accent' as string]: 'var(--brand-amber)' }}><AlertTriangle className="w-4 h-4" /></span>
        <div>
          <span className="eyebrow">Transparency</span>
          <h2 className="leading-tight">Limitations</h2>
        </div>
      </div>
      <ul className="list-disc pl-5 text-[14px] text-muted space-y-1.5 marker:text-[color:var(--brand-amber)]">
        <li>Synthetic data throughout — pipeline is real, results are illustrative.</li>
        <li>Cachar travel matrix is estimated, not road-network routing.</li>
        <li>Roles are client-side demo context; production needs server-side SSO + audit.</li>
      </ul>
    </section>
  </div>
)
