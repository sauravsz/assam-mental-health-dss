export const MethodView = () => (
  <div className="space-y-6 max-w-3xl mx-auto">
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.9px]">How we know.</h1>
      <p className="text-[14px] text-[#5f5f5d] mt-2">
        Every formula behind every alert, on one page. Operator screens link here instead of embedding math.
      </p>
    </div>

    <section className="card p-5">
      <h2 className="text-[15px] font-semibold mb-2">Surveillance — exact Poisson tail</h2>
      <p className="tnum font-mono text-[13px] mb-2">P(Y &gt;= y | lambda) = 1 - sum_k lambda^k e^-lambda / k! (k=0..y-1)</p>
      <p className="text-[14px] text-[#5f5f5d]">
        Exact discrete tail (not a Gaussian approximation) so small rural counts stay valid. Alert flag at Z ≥ 2.5 (p &lt; 0.01) — a prompt for human follow-up, not a diagnosis.
      </p>
    </section>

    <section className="card p-5">
      <h2 className="text-[15px] font-semibold mb-2">Camp siting — capacitated p-median LP</h2>
      <p className="tnum font-mono text-[13px] mb-2">min Z = sum_i sum_j d_i * c_ij * x_ij + M * sum_i u_i</p>
      <p className="text-[14px] text-[#5f5f5d]">
        Two-Phase Primal Simplex in TypeScript. Baseline = headquarters-first; optimum = demand-weighted travel time with unserved-demand penalty.
      </p>
    </section>

    <section className="card p-5">
      <h2 className="text-[15px] font-semibold mb-2">Retention — absorbing Markov chain</h2>
      <p className="tnum font-mono text-[13px] mb-2">N = (I - Q)^-1 &nbsp;&nbsp; B = N * R</p>
      <p className="text-[14px] text-[#5f5f5d]">
        4 transient states (Intake, Specialist, eSanjeevani, DMHP) → 2 absorbing (Verified Recovery, Defaulted). Theoretical absorption 3.2% per 10,000 — the case for the queue.
      </p>
    </section>

    <section className="card p-5">
      <h2 className="text-[15px] font-semibold mb-2">Privacy — DPDP Act 2023 &amp; MHCA 2017 Sec 23</h2>
      <ul className="list-disc pl-5 text-[14px] text-[#5f5f5d] space-y-1 tnum">
        <li>Caller IDs salted and SHA-256 hashed; raw values never retained.</li>
        <li>Counts &lt; 10 suppressed (primary + secondary complementary suppression).</li>
        <li>Every action appended to a SHA-256 hash chain; tamper breaks the chain visibly.</li>
        <li>No automated calls or messages; all follow-up counsellor-initiated with recorded consent.</li>
      </ul>
    </section>

    <section className="card p-5">
      <h2 className="text-[15px] font-semibold mb-2">Limitations</h2>
      <ul className="list-disc pl-5 text-[14px] text-[#5f5f5d] space-y-1">
        <li>Synthetic data throughout — pipeline is real, results are illustrative.</li>
        <li>Cachar travel matrix is estimated, not road-network routing.</li>
        <li>Roles are client-side demo context; production needs server-side SSO + audit.</li>
      </ul>
    </section>
  </div>
)
