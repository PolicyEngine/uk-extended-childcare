"""Run ONE scenario in an isolated process and dump the arrays we need to a .npz.

Isolating each scenario keeps peak memory to a single microsimulation, which
matters because the managed release dataset is multi-year and two simulations do
not fit in a small machine's RAM. Invoked as::

    python -m uk_extended_childcare.worker <scenario> <out.npz> [cap_rate]

where <scenario> is ``baseline``, ``reform`` (universal 15h extension to under-3s)
or ``costcap`` (the earnings cost cap, needs cap_rate).
"""

from __future__ import annotations

import sys

import numpy as np
import policyengine as pe

from .sources import UNIVERSAL_AGE_FLOOR_REFORM

YEAR = 2025

PROGRAMS = [
    "universal_childcare_entitlement",
    "extended_childcare_entitlement",
    "targeted_childcare_entitlement",
    "tax_free_childcare",
    "uc_childcare_element",
    "childcare_grant",
]


def _snapshot(sim) -> dict:
    """Arrays needed for aggregates, deciles, poverty and Gini."""
    net = sim.calculate("household_net_income", YEAR)
    pov = sim.calculate("in_poverty_bhc", YEAR, map_to="person")
    age = sim.calculate("age", YEAR)
    data = dict(
        net=net.values,
        net_wt=net.weights,
        decile=sim.calculate("household_income_decile", YEAR).values,
        pov=pov.values,
        pov_wt=pov.weights,
        is_child=sim.calculate("is_child", YEAR).values,
        age=age.values,
        age_wt=age.weights,
        recv=sim.calculate("is_child_receiving_universal_childcare", YEAR).values,
    )
    for p in PROGRAMS:
        data[f"prog_{p}"] = np.float64(sim.calculate(p, YEAR).sum())
    return data


def run_baseline(out_path: str) -> None:
    sim = pe.uk.managed_microsimulation()
    np.savez_compressed(out_path, **_snapshot(sim))
    print(f"[baseline] -> {out_path}")


def run_reform(out_path: str) -> None:
    # Universal 15h extension: age floor 3 -> 0. Applied in place (scalar value
    # for all years) so we don't build a second internal baseline simulation,
    # which would double peak memory.
    sim = pe.uk.managed_microsimulation()
    sim.apply_parameter_changes(
        {"gov.dfe.universal_childcare_entitlement.age.min": UNIVERSAL_AGE_FLOOR_REFORM}
    )
    np.savez_compressed(out_path, **_snapshot(sim))
    print(f"[reform] -> {out_path}")


def run_costcap(out_path: str, cap_rate: float) -> None:
    """Static model of the earnings cost cap on hours above the universal 15."""
    sim = pe.uk.managed_microsimulation()
    wt = sim.calculate("extended_childcare_entitlement", YEAR).weights
    emp = sim.calculate("employment_income", YEAR, map_to="benunit").values
    se = sim.calculate("self_employment_income", YEAR, map_to="benunit").values
    earnings = emp + se
    # The extended/30h eligibility test already encodes work + income + a young
    # child in the family (benunit level) — our "working family" definition.
    eligible = sim.calculate(
        "extended_childcare_entitlement_eligible", YEAR
    ).values.astype(bool)
    spend = sim.calculate("childcare_expenses", YEAR, map_to="benunit").values

    cap_amount = cap_rate * earnings
    covered = eligible & (spend > cap_amount)
    govt_topup = np.where(covered, np.maximum(spend - cap_amount, 0.0), 0.0)
    decile = sim.calculate("household_income_decile", YEAR, map_to="benunit").values

    np.savez_compressed(
        out_path,
        cap_rate=np.float64(cap_rate),
        total_cost=np.float64((govt_topup * wt).sum()),
        families_helped=np.float64((covered * wt).sum()),
        topup=govt_topup,
        wt=wt,
        decile=decile,
    )
    print(f"[costcap {cap_rate:.1%}] -> {out_path}")


def main(argv: list[str]) -> int:
    scenario, out_path = argv[0], argv[1]
    if scenario == "baseline":
        run_baseline(out_path)
    elif scenario == "reform":
        run_reform(out_path)
    elif scenario == "costcap":
        run_costcap(out_path, float(argv[2]))
    else:
        raise SystemExit(f"unknown scenario: {scenario}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
