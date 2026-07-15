"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatBn, formatCount, formatCurrency, formatPct } from "../lib/formatters";
import {
  getCostCap,
  getDistribution,
  getMethods,
  getPrograms,
  getReform,
  getReported,
  getSettings,
  getTakeup,
  getUniversalExtension,
} from "../lib/dataHelpers";
import ChartLogo from "./ChartLogo";
import SectionHeading from "./SectionHeading";

const AXIS = { fontSize: 12, fill: colors.gray[500] };
const PRIMARY = colors.primary[600];
const ACCENT = "#29A98B";

function MetricCard({ label, value, note }) {
  return (
    <div className="metric-card">
      <p className="text-sm font-semibold leading-snug text-slate-700">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {note && (
        <p className="mt-2 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500">
          {note}
        </p>
      )}
    </div>
  );
}

export default function ReformTab({ data }) {
  const ext = getUniversalExtension(data);
  const cap = getCostCap(data);
  const reform = getReform(data);
  const dist = getDistribution(data);
  const programs = getPrograms(data);
  const settings = getSettings(data);
  const reported = getReported(data);
  const takeup = getTakeup(data);
  const methods = getMethods(data);

  const changed = programs.filter((p) => Math.abs(p.change_bn) > 1e-6);

  const tuByKey = Object.fromEntries(takeup.scenarios.map((s) => [s.key, s]));
  const tuFull = tuByKey.full;
  const tuBench = tuByKey[takeup.default_key];
  const tuLow = tuByKey.low;
  // Combined cost when the universal extension is priced at benchmark take-up.
  const combinedBenchmark = reform.total.gross_cost_benchmark_takeup_bn;

  const takeupData = takeup.scenarios.map((s) => ({
    label: s.label,
    key: s.key,
    cost: s.cost_bn,
    rate: s.rate,
  }));

  const decileData = dist.by_decile.map((d) => ({
    decile: d.decile,
    avg: d.avg_gain,
    pct: d.pct_of_income,
    winner: d.winner_share,
  }));

  const byAge = ext.by_age.map((a) => ({
    age: `${a.age}`,
    count: a.count_k,
  }));

  const comparison = [
    {
      metric: "Net cost — universal 15h to under-3s (NEF 'first step')",
      reported: `~£${reported.nef_net_cost_low.value}–${reported.nef_net_cost_high.value}bn (full system, net)`,
      ours: `${formatBn(tuBench.cost_bn)} at benchmark take-up (up to ${formatBn(tuFull.cost_bn)})`,
    },
    {
      metric: "Earnings cost cap (5%) for working families",
      reported: "component of full system",
      ours: formatBn(cap.cost_bn),
    },
    {
      metric: "Combined additional cost",
      reported: `~£${reported.nef_net_cost_low.value}–${reported.nef_net_cost_high.value}bn net (replaces other streams)`,
      ours: `${formatBn(combinedBenchmark)} at benchmark take-up (up to ${formatBn(reform.total.gross_cost_bn)})`,
    },
    {
      metric: "Current total government childcare support",
      reported: `£${reported.nef_current_system_cost.value}bn (NEF); ~£${reported.mirror_scheme_cost_2028.value}bn by 2028 (Mirror)`,
      ours: `${formatBn(data.baseline.total_support_bn)} (6 programs)`,
    },
    {
      metric: "Children newly on the universal offer",
      reported: `~${formatCount(reported.dfe_families_funded_hours.value)} families excluded today`,
      ours: `${ext.newly_covered_m.toFixed(2)}m children`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <SectionHeading
          size="lg"
          title="Scoring the Universal Family Childcare Promise"
          description="The reform stacks two components on today's system: a universal 15-hour entitlement for every child from 9 months to 4 years, and a cap on the cost of extra hours at a share of family earnings for working families. Figures are static, survey-weighted PolicyEngine UK results; no behavioural response."
        />
      </div>

      {/* what this analysis adds over NEF's single headline */}
      <section className="section-card" style={{ borderLeft: `4px solid ${ACCENT}` }}>
        <SectionHeading title="What this analysis adds" />
        <p className="text-sm leading-6 text-slate-600">{methods.value_add}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decompose</p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              The universal under-3 extension is <span className="font-semibold">{formatBn(ext.net_cost_bn)}</span> of the
              cost; the earnings cap adds only <span className="font-semibold">{formatBn(cap.cost_bn)}</span>. The extension
              is the bulk — not the cap.
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Who is covered</p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              The <span className="font-semibold">{ext.newly_covered_m.toFixed(2)}m</span> newly-covered children are almost
              all under-3s in <span className="font-semibold">non-working</span> families — working families' under-3s
              already use the 30h offer.
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stress-test take-up</p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              At realistic take-up the extension costs{" "}
              <span className="font-semibold">{formatBn(tuLow.cost_bn)}–{formatBn(tuBench.cost_bn)}</span>, not the{" "}
              {formatBn(tuFull.cost_bn)} full-take-up ceiling.
            </p>
          </div>
        </div>
      </section>

      {/* what the reform changes */}
      <section className="section-card">
        <SectionHeading
          title="What the reform changes"
          description="Each policy lever the Universal Family Childcare Promise moves, and its value before and after. Statutory levers are PolicyEngine parameters; the earnings cost cap is a new mechanism the reform introduces."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Policy lever</th>
                <th>Baseline (current law)</th>
                <th>Reform (UFCP)</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              {reform.changes.map((c) => (
                <tr key={c.policy}>
                  <td className="align-top font-semibold">
                    {c.policy}
                    <div className="mt-1 font-mono text-[11px] font-normal text-slate-400">
                      {c.parameter}
                    </div>
                  </td>
                  <td className="align-top text-slate-600">{c.baseline}</td>
                  <td className="align-top font-medium" style={{ color: colors.primary[700] }}>
                    {c.reform}
                  </td>
                  <td className="align-top text-sm text-slate-500">{c.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* headline metrics */}
      <section className="section-card">
        <SectionHeading
          title="Headline cost"
          description="Component 1 is the change in total spend across all six childcare programs when the universal 15-hour offer is extended down to 9 months. Component 2 is the static government top-up under the earnings cost cap."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="1 · Universal 15h extension (to under-3s)"
            value={formatBn(tuBench.cost_bn)}
            note={`At benchmark take-up (${formatPct(tuBench.rate * 100, 0)}). Full-take-up ceiling: ${formatBn(
              tuFull.cost_bn,
            )}. Low case: ${formatBn(tuLow.cost_bn)}.`}
          />
          <MetricCard
            label={`2 · Earnings cost cap (${formatPct(settings.cap_rate * 100, 0)})`}
            value={formatBn(cap.cost_bn)}
            note={`Government top-up for ${cap.families_helped_m.toFixed(2)}m working families. ${formatPct(
              settings.cap_rate_transitional * 100,
              1,
            )} transitional: ${formatBn(cap.transitional_cost_bn)}.`}
          />
          <MetricCard
            label="Combined additional cost"
            value={formatBn(combinedBenchmark)}
            note={`Benchmark take-up. Full-take-up ceiling: ${formatBn(
              reform.total.gross_cost_bn,
            )}. NEF full-system net estimate: ~£${reported.nef_net_cost_low.value}–${reported.nef_net_cost_high.value}bn (replaces Tax-Free Childcare + UC element).`}
          />
          <MetricCard
            label="Children newly on the universal offer"
            value={`${tuBench.newly_covered_m.toFixed(2)}m`}
            note={`At benchmark take-up; up to ${ext.newly_covered_m.toFixed(
              2,
            )}m at full take-up. Under-3s not already on a funded scheme — largely non-working families.`}
          />
        </div>
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">Where the money goes:</span> the universal
          15h extension to non-working families is the bulk of the cost ({formatBn(ext.net_cost_bn)}{" "}
          at full take-up, {formatBn(tuBench.cost_bn)} at benchmark take-up) — the working-family
          earnings cap adds only {formatBn(cap.cost_bn)} on top. The cap is <em>not</em> the driver.
        </p>
      </section>

      {/* take-up sensitivity — the assumption that most exposes the cost */}
      <section className="section-card">
        <SectionHeading
          title="Would non-working families take it up? Cost by take-up rate"
          description={methods.take_up}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={takeupData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} vertical={false} />
              <XAxis dataKey="label" tick={{ ...AXIS, fontSize: 11 }} interval={0} />
              <YAxis
                tick={AXIS}
                label={{ value: "£bn / year", angle: -90, position: "insideLeft", fontSize: 12, fill: colors.gray[500] }}
              />
              <Tooltip formatter={(v) => formatBn(v)} labelFormatter={(l) => l} />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {takeupData.map((d) => (
                  <Cell key={d.key} fill={d.key === takeup.default_key ? ACCENT : PRIMARY} />
                ))}
                <LabelList dataKey="cost" position="top" formatter={(v) => formatBn(v)} style={{ fontSize: 11, fill: colors.gray[600] }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Take-up scenario</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Component-1 cost</th>
                </tr>
              </thead>
              <tbody>
                {takeup.scenarios.map((s) => (
                  <tr key={s.key}>
                    <td className="align-top">
                      <span className="font-semibold">{s.label}</span>
                      {s.key === takeup.default_key && (
                        <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                          headline
                        </span>
                      )}
                      <div className="mt-1 text-xs leading-5 text-slate-500">{s.note}</div>
                    </td>
                    <td className="align-top text-right">{formatPct(s.rate * 100, 0)}</td>
                    <td className="align-top text-right font-semibold">{formatBn(s.cost_bn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 rounded-md border-l-4 px-4 py-3 text-sm leading-6 text-slate-600" style={{ borderColor: ACCENT, backgroundColor: "#F0FAF7" }}>
          <span className="font-semibold text-slate-800">The take-up question is decisive.</span> Because
          the extension reaches children with a parent already at home, take-up is the single biggest
          swing on the cost. The {formatBn(tuFull.cost_bn)} "£4bn for non-working families" figure is the{" "}
          <em>ceiling</em> — it assumes every eligible family enrols. Benchmarked against the disadvantaged
          2-year-old offer (~{formatPct(reported.takeup_2yo_offer.value * 100, 0)} take-up, the closest real
          comparator), the extension costs {formatBn(tuBench.cost_bn)}; on a low case for the youngest
          children, {formatBn(tuLow.cost_bn)}.
        </p>
      </section>

      {/* newly covered by age */}
      <section className="section-card">
        <SectionHeading
          title="Who is newly covered, by age"
          description="Most under-3s in working families already get the extended (30h) offer, which cannot be combined with the universal offer, so the extension reaches children not on any funded scheme."
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byAge} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} vertical={false} />
            <XAxis dataKey="age" tick={AXIS} label={{ value: "Age (years)", position: "insideBottom", offset: -2, fontSize: 12, fill: colors.gray[500] }} />
            <YAxis tick={AXIS} label={{ value: "Thousands of children", angle: -90, position: "insideLeft", fontSize: 12, fill: colors.gray[500] }} />
            <Tooltip formatter={(v) => `${Math.round(v)}k children`} />
            <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]}>
              <LabelList dataKey="count" position="top" formatter={(v) => `${Math.round(v)}k`} style={{ fontSize: 11, fill: colors.gray[600] }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartLogo />
      </section>

      {/* program table */}
      <section className="section-card">
        <SectionHeading
          title="Every childcare program, baseline vs reform"
          description="The reform is scored net across the whole childcare stack. In this static run only the universal entitlement moves; the cost cap (component 2) is priced separately above."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Program</th>
                <th className="text-right">Baseline</th>
                <th className="text-right">Reform</th>
                <th className="text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td className="text-right">{formatBn(p.baseline_bn)}</td>
                  <td className="text-right">{formatBn(p.reform_bn)}</td>
                  <td className="text-right font-semibold" style={{ color: p.change_bn > 1e-6 ? ACCENT : colors.gray[500] }}>
                    {p.change_bn > 1e-6 ? "+" : ""}
                    {formatBn(p.change_bn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* distribution */}
      <section className="section-card">
        <SectionHeading
          title="Distributional impact by income decile"
          description={`The gain is progressive as a share of net income. Mean gain for the bottom 60% of households: ${formatCurrency(
            dist.bottom60_mean_gain,
          )}/yr (NEF report £${reported.nef_bottom60_gain_low.value}–${reported.nef_bottom60_gain_high.value} for the bottom 60% of earners under the full system with the cost cap).`}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Average annual gain per household (£)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={decileData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} vertical={false} />
                <XAxis dataKey="decile" tick={AXIS} />
                <YAxis tick={AXIS} />
                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => `Decile ${l}`} />
                <Bar dataKey="avg" fill={PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Gain as % of household net income</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={decileData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} vertical={false} />
                <XAxis dataKey="decile" tick={AXIS} />
                <YAxis tick={AXIS} />
                <Tooltip formatter={(v) => formatPct(v, 2)} labelFormatter={(l) => `Decile ${l}`} />
                <Bar dataKey="pct" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Household income decile, 1 = poorest. Overall share of households gaining: {formatPct(dist.overall_winner_share, 1)}.</p>
        <ChartLogo />
      </section>

      {/* poverty + inequality */}
      <section className="section-card">
        <SectionHeading
          title="Poverty and inequality"
          description="The universal entitlement is valued in-kind at DfE funding rates and added to net income, so income-based poverty barely moves even though the in-kind benefit is sizeable."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr><th>Measure</th><th className="text-right">Baseline</th><th className="text-right">Reform</th></tr>
            </thead>
            <tbody>
              <tr><td>Poverty rate, all (BHC)</td><td className="text-right">{formatPct(reform.poverty.all_baseline)}</td><td className="text-right">{formatPct(reform.poverty.all_reform)}</td></tr>
              <tr><td>Child poverty rate (BHC)</td><td className="text-right">{formatPct(reform.poverty.child_baseline)}</td><td className="text-right">{formatPct(reform.poverty.child_reform)}</td></tr>
              <tr><td>Gini (net income)</td><td className="text-right">{reform.inequality.gini_baseline.toFixed(4)}</td><td className="text-right">{reform.inequality.gini_reform.toFixed(4)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* comparison */}
      <section className="section-card">
        <SectionHeading
          title="Our numbers vs the NEF / Mirror figures"
          description="What maps to what: our static score isolates each component; NEF's headline £3-3.4bn is the net cost of the whole system, which also replaces Tax-Free Childcare and the UC childcare element. Same order of magnitude, not like-for-like."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr><th>Metric</th><th>NEF / Mirror reported</th><th>PolicyEngine (this run)</th></tr>
            </thead>
            <tbody>
              {comparison.map((c) => (
                <tr key={c.metric}>
                  <td className="max-w-xs">{c.metric}</td>
                  <td className="text-slate-500">{c.reported}</td>
                  <td className="font-semibold">{c.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
