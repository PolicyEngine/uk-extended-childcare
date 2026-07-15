"use client";

import { getReported, getSettings } from "../lib/dataHelpers";
import SectionHeading from "./SectionHeading";

const METHOD_ORDER = [
  ["value_add", "What this analysis adds"],
  ["engine", "Simulation engine"],
  ["universal_extension", "Component 1 — universal 15-hour extension"],
  ["take_up", "Take-up of the universal extension"],
  ["cost_cap", "Component 2 — earnings cost cap"],
  ["distribution", "Distributional impact"],
  ["comparison", "Comparison with NEF / Mirror"],
  ["caveats", "Caveats"],
];

export default function MethodologyTab({ data }) {
  const methods = data.methods;
  const settings = getSettings(data);
  const reported = getReported(data);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <SectionHeading
          size="lg"
          title="Methodology"
          description="How every result on the other tabs is computed, and where each non-model number comes from. Statutory parameters (funded hours, funding rates, income limits, age floors) are read from the PolicyEngine parameter tree at run time; every other number is listed with a source below."
        />
      </div>

      <section className="section-card">
        <SectionHeading title="Reform definition" />
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          <li>
            <strong>Universal entitlement age floor:</strong> lowered from{" "}
            {settings.age_floor_baseline} to {settings.age_floor_reform} years
            (9 months to 4 years), keeping {settings.universal_hours_per_week} hours/week for{" "}
            {settings.weeks_per_year} weeks a year.
          </li>
          <li>
            <strong>Earnings cost cap:</strong> {(settings.cap_rate * 100).toFixed(0)}% of family
            earnings (preferred), with a {(settings.cap_rate_transitional * 100).toFixed(1)}%
            transitional alternative, on childcare bought above the universal 15 hours by working
            families.
          </li>
        </ul>
      </section>

      {METHOD_ORDER.filter(([key]) => methods[key]).map(([key, title]) => (
        <section className="section-card" key={key}>
          <SectionHeading title={title} />
          <p className="text-sm leading-6 text-slate-600">{methods[key]}</p>
        </section>
      ))}

      <section className="section-card">
        <SectionHeading
          title="Reported figures and sources"
          description="Every NEF / Mirror number used as an anchor or in the comparison, with its source."
        />
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr><th>Figure</th><th>Description</th><th>Source</th></tr>
            </thead>
            <tbody>
              {Object.entries(reported).map(([key, s]) => (
                <tr key={key}>
                  <td className="whitespace-nowrap font-semibold">
                    {typeof s.value === "number" && s.value >= 1000
                      ? s.value.toLocaleString("en-GB")
                      : s.value}
                  </td>
                  <td className="text-slate-600">{s.description}</td>
                  <td>
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                      link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <SectionHeading title="Package versions" />
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {Object.entries(data.package_versions).map(([k, v]) => (
            <li key={k}>
              <code>{k}</code>: {v ?? "not installed"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
