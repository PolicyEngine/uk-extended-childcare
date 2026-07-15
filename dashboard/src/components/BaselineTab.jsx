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
  // Childcare Grant is out of PolicyEngine's scope here (£0 model spend), so it
  // is excluded from the baseline breakdown.
  const programs = getPrograms(data).filter((p) => p.id !== "childcare_grant");
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
            note={`Across five funded programs. NEF estimate for the fully rolled-out system: £${reported.nef_current_system_cost.value}bn.`}
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
          title="The programs — model vs official figures"
          description="Each row is a distinct funding stream, with our PolicyEngine model spend next to the official published spend and caseload where one exists. The reform replaces the age-3 floor on the universal entitlement with a 9-month floor, and adds an earnings cost cap on hours above the universal 15."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Program</th>
                <th className="text-right">Model spend</th>
                <th className="text-right">Official spend</th>
                <th>Official caseload (latest)</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td className="align-top font-medium">{p.label}</td>
                  <td className="align-top text-right">{formatBn(p.baseline_bn)}</td>
                  <td className="align-top text-right text-slate-600">
                    {p.official?.official_spend ? (
                      p.official.official_spend
                    ) : (
                      <span className="text-slate-400">no split*</span>
                    )}
                  </td>
                  <td className="align-top text-sm text-slate-600">
                    {p.official ? (
                      <>
                        {p.official.stat}
                        <div className="mt-0.5 text-xs text-slate-400">
                          {p.official.source}, {p.official.period} ·{" "}
                          <a
                            href={p.official.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            source
                          </a>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td>Total</td>
                <td className="text-right">{formatBn(baseline.total_support_bn)}</td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          *The three funded entitlements are not published with a per-stream spend split.{" "}
          <a
            href={baseline.entitlement_spend_note.url}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            IFS
          </a>{" "}
          puts total free-entitlement spending at £{baseline.entitlement_spend_note.value}bn in
          2025-26 (which also includes the new under-3 offer our baseline excludes) vs our combined
          universal + extended + 2-year-old estimate of{" "}
          {formatBn(
            programs
              .filter((p) => !p.official?.official_spend && p.id !== "childcare_grant")
              .reduce((s, p) => s + p.baseline_bn, 0),
          )}
          . Tax-Free Childcare matches official spend closely; the Universal Credit childcare element
          line is well above the ~£0.8bn implied by DWP caseload and is flagged for review.
        </p>
      </section>
    </div>
  );
}
