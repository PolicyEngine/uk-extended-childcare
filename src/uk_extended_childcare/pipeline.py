"""Build the dashboard JSON for the Universal Family Childcare Promise analysis.

Runs three PolicyEngine scenarios (baseline, universal 15h extension, earnings
cost cap) via isolated subprocess workers, computes every impact with microdf,
and writes a single results JSON consumed by the dashboard. All statutory
parameters come from the PolicyEngine tree at run time; every reported anchor and
every line of methodology prose comes from :mod:`uk_extended_childcare.sources`.
"""

from __future__ import annotations

import importlib.metadata
import json
from dataclasses import asdict
from pathlib import Path

import numpy as np

from . import impacts, sources
from .scenarios import run_baseline, run_costcap, run_reform
from .sources import (
    CAP_RATE,
    CAP_RATE_TRANSITIONAL,
    TAKEUP_DEFAULT_KEY,
    TAKEUP_SCENARIOS,
    UNIVERSAL_AGE_FLOOR_BASELINE,
    UNIVERSAL_AGE_FLOOR_REFORM,
)

REPO_ROOT = Path(__file__).resolve().parents[2]

PROGRAM_LABELS = {
    "universal_childcare_entitlement": "Universal 15h entitlement (England)",
    "extended_childcare_entitlement": "Extended 30h working-parent entitlement",
    "targeted_childcare_entitlement": "Targeted 2-year-old entitlement",
    "tax_free_childcare": "Tax-Free Childcare (HMRC)",
    "uc_childcare_element": "Universal Credit childcare element",
    "childcare_grant": "Childcare Grant (students, DfE)",
}


def _versions() -> dict:
    out = {}
    for pkg in ("policyengine", "policyengine-uk", "microdf-python"):
        try:
            out[pkg.replace("-", "_")] = importlib.metadata.version(pkg)
        except importlib.metadata.PackageNotFoundError:
            out[pkg.replace("-", "_")] = None
    return out


def _programs(baseline: dict, reform: dict) -> list[dict]:
    rows = []
    for var, label in PROGRAM_LABELS.items():
        b = float(baseline[f"prog_{var}"]) / 1e9
        r = float(reform[f"prog_{var}"]) / 1e9
        rows.append(
            {
                "id": var,
                "label": label,
                "baseline_bn": b,
                "reform_bn": r,
                "change_bn": r - b,
                "official": sources.OFFICIAL_PROGRAM_STATS.get(var),
            }
        )
    return rows


def _reported() -> dict:
    return {k: asdict(v) for k, v in sources.REPORTED.items()}


def build(cache_dir: Path, year: int = 2025, force: bool = False) -> dict:
    baseline = run_baseline(cache_dir, force)
    reform = run_reform(cache_dir, force)
    cap5 = run_costcap(cache_dir, CAP_RATE, force)
    cap75 = run_costcap(cache_dir, CAP_RATE_TRANSITIONAL, force)

    programs = _programs(baseline, reform)
    baseline_total = sum(p["baseline_bn"] for p in programs)
    reform_total = sum(p["reform_bn"] for p in programs)
    universal_net_cost = reform_total - baseline_total

    cov = impacts.newly_covered(baseline, reform)
    age_wt = baseline["age_wt"]
    age = baseline["age"].astype(int)
    under5 = float(((age < 5) * age_wt).sum())
    under3 = float(((age < 3) * age_wt).sum())

    cap5_cost = float(cap5["total_cost"]) / 1e9
    cap75_cost = float(cap75["total_cost"]) / 1e9

    takeup = impacts.takeup_sensitivity(
        universal_net_cost, cov["total"] / 1e6, TAKEUP_SCENARIOS
    )
    takeup_by_key = {r["key"]: r for r in takeup}
    ext_benchmark_cost = takeup_by_key[TAKEUP_DEFAULT_KEY]["cost_bn"]

    result = {
        "year": year,
        "fiscal_year_label": f"{year}-{str(year + 1)[-2:]}",
        "package_versions": _versions(),
        "settings": {
            "universal_hours_per_week": 15,
            "weeks_per_year": 38,
            "age_floor_baseline": UNIVERSAL_AGE_FLOOR_BASELINE,
            "age_floor_reform": UNIVERSAL_AGE_FLOOR_REFORM,
            "cap_rate": CAP_RATE,
            "cap_rate_transitional": CAP_RATE_TRANSITIONAL,
        },
        "methods": sources.METHODS,
        "reported": _reported(),
        "programs": programs,
        "baseline": {
            "total_support_bn": baseline_total,
            "children_under5_m": under5 / 1e6,
            "children_under3_m": under3 / 1e6,
            "on_universal_offer_m": cov["baseline_on_offer"] / 1e6,
            "poverty_all_pct": impacts.poverty_impact(baseline, reform)["all_baseline"],
            "child_poverty_pct": impacts.poverty_impact(baseline, reform)["child_baseline"],
            "gini": impacts.inequality_impact(baseline, reform)["gini_baseline"],
        },
        "reform": {
            "changes": sources.REFORM_CHANGES,
            "universal_extension": {
                "net_cost_bn": universal_net_cost,
                "newly_covered_m": cov["total"] / 1e6,
                "by_age": [{"age": r["age"], "count_k": r["count"] / 1e3} for r in cov["by_age"]],
                "on_universal_offer_m": cov["reform_on_offer"] / 1e6,
                "reform_total_bn": reform_total,
                "takeup": {
                    "full_cost_bn": universal_net_cost,
                    "default_key": TAKEUP_DEFAULT_KEY,
                    "benchmark_cost_bn": ext_benchmark_cost,
                    "scenarios": takeup,
                },
            },
            "cost_cap": {
                "cap_rate": CAP_RATE,
                "cost_bn": cap5_cost,
                "families_helped_m": float(cap5["families_helped"]) / 1e6,
                "transitional_cap_rate": CAP_RATE_TRANSITIONAL,
                "transitional_cost_bn": cap75_cost,
            },
            "total": {
                "gross_cost_bn": universal_net_cost + cap5_cost,
                "gross_cost_transitional_bn": universal_net_cost + cap75_cost,
                # Combined cost when the universal extension is priced at benchmark
                # take-up (the cost cap is a working-family offer, kept at full
                # take-up as an upper bound on that component).
                "gross_cost_benchmark_takeup_bn": ext_benchmark_cost + cap5_cost,
            },
            "distribution": {
                "by_decile": impacts.decile_impact(baseline, reform),
                "overall_winner_share": impacts.overall_winner_share(baseline, reform),
                "bottom60_mean_gain": impacts.bottom60_mean_gain(baseline, reform),
            },
            "poverty": impacts.poverty_impact(baseline, reform),
            "inequality": impacts.inequality_impact(baseline, reform),
        },
    }
    return result


def run(args) -> None:
    cache_dir = Path(getattr(args, "cache_dir", None) or (REPO_ROOT / "data" / "cache"))
    cache_dir.mkdir(parents=True, exist_ok=True)
    result = build(cache_dir, year=args.year, force=getattr(args, "force", False))

    out_path = REPO_ROOT / "data" / "uk_extended_childcare_results.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(result, f, indent=2)
    print(f"wrote {out_path}")

    # Also publish to the dashboard's public/data directory.
    dash = REPO_ROOT / "dashboard" / "public" / "data" / "uk_extended_childcare_results.json"
    if dash.parent.exists():
        with open(dash, "w") as f:
            json.dump(result, f, indent=2)
        print(f"wrote {dash}")
