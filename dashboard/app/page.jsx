"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BaselineTab from "../src/components/BaselineTab";
import MethodologyTab from "../src/components/MethodologyTab";
import ReformTab from "../src/components/ReformTab";

const TAB_OPTIONS = [
  { id: "reform", label: "The reform" },
  { id: "baseline", label: "Current system (baseline)" },
  { id: "methodology", label: "Methodology" },
];

function getInitialTab(tabParam) {
  if (TAB_OPTIONS.some((tab) => tab.id === tabParam)) {
    return tabParam;
  }
  return "reform";
}

function TabLink({ onSelect, children }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="font-semibold text-[color:var(--pe-color-primary-600)] underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(() => getInitialTab(searchParams.get("tab")));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveTab(getInitialTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/uk_extended_childcare_results.json");
        if (!response.ok) {
          throw new Error("uk_extended_childcare_results.json not found; run the pipeline first");
        }
        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "reform") {
      router.replace("/", { scroll: false });
      return;
    }
    router.replace(`/?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="title-row">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-8">
          <h1>Universal Family Childcare Analysis</h1>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-[1400px] px-6 py-10 md:px-8 md:py-12">
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <p className="mb-3 text-[1.05rem] leading-relaxed text-slate-600">
            This dashboard uses{" "}
            <a href="https://policyengine.org" target="_blank" rel="noreferrer" className="underline">
              PolicyEngine
            </a>{" "}
            UK&apos;s microsimulation model to score the New Economics Foundation&apos;s{" "}
            <a
              href="https://neweconomics.org/2025/07/the-universal-family-childcare-promise"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Universal Family Childcare Promise
            </a>
            {data ? ` for fiscal year ${data.fiscal_year_label}` : ""}. The reform has two
            components: a <strong>universal 15-hour entitlement</strong> for every child from 9
            months to 4 years (today the universal offer only starts at age 3), and an{" "}
            <strong>earnings cost cap</strong> on the childcare hours a working family buys above
            the universal 15. The{" "}
            <TabLink onSelect={() => handleTabChange("reform")}>The reform</TabLink> tab shows the
            fiscal cost of each component, who is newly covered, and the distributional impact. The{" "}
            <TabLink onSelect={() => handleTabChange("baseline")}>Current system</TabLink> tab sets
            out today&apos;s childcare programs and spending. The{" "}
            <TabLink onSelect={() => handleTabChange("methodology")}>Methodology</TabLink> tab
            explains how every result is computed, with sources for every assumption.
          </p>
        </div>

        <div className="mb-8 mt-8 flex w-fit flex-wrap border-b-2 border-slate-200">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Error: {error}
          </p>
        )}
        {loading && !error && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading data...
          </p>
        )}

        {!loading && !error && data && (
          <>
            {activeTab === "reform" && <ReformTab data={data} />}
            {activeTab === "baseline" && <BaselineTab data={data} />}
            {activeTab === "methodology" && <MethodologyTab data={data} />}
          </>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>
            Replication code:{" "}
            <a
              href="https://github.com/PolicyEngine/uk-extended-childcare"
              target="_blank"
              rel="noreferrer"
            >
              PolicyEngine/uk-extended-childcare
            </a>
            {data?.package_versions
              ? `, run on policyengine.py ${data.package_versions.policyengine}`
              : ""}
            .
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-slate-500">Loading...</p>}>
      <Dashboard />
    </Suspense>
  );
}
