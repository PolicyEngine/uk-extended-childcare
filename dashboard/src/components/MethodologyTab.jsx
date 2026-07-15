"use client";

import { getReported, getSettings } from "../lib/dataHelpers";
import SectionHeading from "./SectionHeading";

const METHOD_ORDER = [
  ["universal_extension", "Component 1 — universal 15-hour extension"],
  ["take_up", "Take-up of the universal extension"],
  ["cost_cap", "Component 2 — earnings cost cap"],
  ["caveats", "Caveats"],
];

// Sources to hyperlink inline under each method section (keys into `reported`).
const SECTION_SOURCES = {
  universal_extension: ["takeup_universal_34", "nef_current_system_cost"],
  take_up: ["takeup_2yo_offer", "takeup_universal_34"],
  cost_cap: ["nef_net_cost_low", "poorest40_eligible_share"],
  caveats: ["nef_net_cost_low", "mirror_scheme_cost_2028"],
};

function SourceLinks({ keys, reported }) {
  const links = (keys || []).map((k) => reported[k]).filter(Boolean);
  if (!links.length) return null;
  return (
    <p className="mt-3 text-xs text-slate-500">
      <span className="font-semibold text-slate-600">Sources: </span>
      {links.map((s, i) => (
        <span key={s.url}>
          {i > 0 && " · "}
          <a href={s.url} target="_blank" rel="noreferrer" className="underline">
            {s.description.split(/[—.(]/)[0].trim().slice(0, 70)}
          </a>
        </span>
      ))}
    </p>
  );
}

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
          description="How every result on the other tabs is computed, and where each non-model number comes from. Statutory parameters (funded hours, funding rates, income limits, age floors) are read from the PolicyEngine parameter tree at run time; every other number is linked to its source inline below."
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
          <SourceLinks keys={SECTION_SOURCES[key]} reported={reported} />
        </section>
      ))}
    </div>
  );
}
