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
  getPrograms,
  getReform,
  getReported,
  getSettings,
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

  const changed = programs.filter((p) => Math.abs(p.change_bn) > 1e-6);

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
      ours: formatBn(ext.net_cost_bn),
    },
    {
      metric: "Earnings cost cap (5%) for working families",
      reported: "component of full system",
      ours: formatBn(cap.cost_bn),
    },
    {
      metric: "Combined gross additional cost",
      reported: `~£${reported.nef_net_cost_low.value}–${reported.nef_net_cost_high.value}bn net (replaces other streams)`,
      ours: formatBn(reform.total.gross_cost_bn),
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
            value={formatBn(ext.net_cost_bn)}
            note="Net change across all six childcare programs, per year."
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
            label="Combined gross additional cost"
            value={formatBn(reform.total.gross_cost_bn)}
            note={`NEF full-system net estimate: ~£${reported.nef_net_cost_low.value}–${reported.nef_net_cost_high.value}bn (replaces Tax-Free Childcare + UC element).`}
          />
          <MetricCard
            label="Children newly on the universal offer"
            value={`${ext.newly_covered_m.toFixed(2)}m`}
            note="Under-3s not already on a funded scheme — largely non-working families."
          />
        </div>
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">Where the money goes:</span> the universal
          15h extension to non-working families ({formatBn(ext.net_cost_bn)}) is the bulk of the
          cost — the working-family earnings cap adds {formatBn(cap.cost_bn)} on top.
        </p>
        <p className="mt-3 rounded-md border-l-4 px-4 py-3 text-sm leading-6 text-slate-600" style={{ borderColor: ACCENT, backgroundColor: "#F0FAF7" }}>
          <span className="font-semibold text-slate-800">Take-up caveat:</span> this is a static
          score with assumed full take-up of the funded hours and no behavioural or labour-supply
          response. The in-kind entitlement is valued at DfE funding rates, so actual fiscal cost
          depends on how many eligible non-working families take up the offer.
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
