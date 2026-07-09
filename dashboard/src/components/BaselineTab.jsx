"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatBn, formatPct } from "../lib/formatters";
import { getBaseline, getPrograms, getReported } from "../lib/dataHelpers";
import ChartLogo from "./ChartLogo";
import SectionHeading from "./SectionHeading";

const AXIS = { fontSize: 12, fill: colors.gray[500] };
const PRIMARY = colors.primary[600];

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

export default function BaselineTab({ data }) {
  const baseline = getBaseline(data);
  const programs = getPrograms(data);
  const reported = getReported(data);

  const spendData = programs
    .map((p) => ({ label: p.label.replace(/ \(.*\)$/, ""), value: p.baseline_bn }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <SectionHeading
          size="lg"
          title="England's current childcare system"
          description="A patchwork of programs, most of them conditional on parents working. The universal (unconditional) offer only begins at age 3; younger children are covered only through the working-parent (30h), low-income 2-year-old, Tax-Free Childcare or Universal Credit routes. This is the baseline the reform is scored against."
        />
      </div>

      <section className="section-card">
        <SectionHeading title="At a glance" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total government childcare support"
            value={formatBn(baseline.total_support_bn)}
            note={`Across six programs. NEF estimate for the fully rolled-out system: £${reported.nef_current_system_cost.value}bn.`}
          />
          <MetricCard
            label="Children under 5"
            value={`${baseline.children_under5_m.toFixed(2)}m`}
            note={`Of whom ${baseline.children_under3_m.toFixed(2)}m are under 3 — the group the reform targets.`}
          />
          <MetricCard
            label="On the universal (15h) offer today"
            value={`${baseline.on_universal_offer_m.toFixed(2)}m`}
            note="Only children aged 3-4 (plus those not on the 30h working-parent offer)."
          />
          <MetricCard
            label="Poorest 40% meeting work test"
            value={formatPct(reported.poorest40_eligible_share.value * 100, 1)}
            note="NEF: only this share of low-income families with young children qualify for the expanded funded hours."
          />
        </div>
      </section>

      <section className="section-card">
        <SectionHeading
          title="Spending by program"
          description="Weighted annual cost of each childcare program in the PolicyEngine baseline (managed release dataset)."
        />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            layout="vertical"
            data={spendData}
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} horizontal={false} />
            <XAxis type="number" tick={AXIS} tickFormatter={(v) => `£${v.toFixed(0)}bn`} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: colors.gray[600] }} width={180} />
            <Tooltip formatter={(v) => formatBn(v)} />
            <Bar dataKey="value" fill={PRIMARY} radius={[0, 6, 6, 0]}>
              <LabelList dataKey="value" position="right" formatter={(v) => formatBn(v)} style={{ fontSize: 11, fill: colors.gray[600] }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ChartLogo />
      </section>

      <section className="section-card">
        <SectionHeading
          title="The programs"
          description="Each row is a distinct funding stream. The reform replaces the age-3 floor on the universal entitlement with a 9-month floor, and adds an earnings cost cap on hours above the universal 15."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr><th>Program</th><th className="text-right">Baseline spend</th></tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td className="text-right">{formatBn(p.baseline_bn)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td>Total</td>
                <td className="text-right">{formatBn(baseline.total_support_bn)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <SectionHeading
          title="Baseline poverty and inequality"
          description="Reference values the reform tab compares against."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Poverty rate, all (BHC)" value={formatPct(baseline.poverty_all_pct)} />
          <MetricCard label="Child poverty rate (BHC)" value={formatPct(baseline.child_poverty_pct)} />
          <MetricCard label="Gini (net income)" value={baseline.gini.toFixed(4)} />
        </div>
      </section>
    </div>
  );
}
