"""Distributional and inequality impacts, computed with pure microdf on the
survey-weighted arrays dumped by the scenario workers."""

from __future__ import annotations

import numpy as np
from microdf import MicroDataFrame, MicroSeries


def decile_impact(baseline: dict, reform: dict) -> list[dict]:
    """Average and total household gain by income decile."""
    gain = reform["net"] - baseline["net"]
    df = MicroDataFrame(
        {"decile": baseline["decile"], "gain": gain, "base": baseline["net"]},
        weights=baseline["net_wt"],
    )
    df = df[df["decile"] > 0]
    grp = df.groupby("decile")
    total = grp["gain"].sum()
    avg = grp["gain"].mean()
    base = grp["base"].sum()
    rows = []
    for dec in sorted(df["decile"].unique()):
        sub = df[df["decile"] == dec]
        rows.append(
            {
                "decile": int(dec),
                "total_gain_bn": float(total.loc[dec]) / 1e9,
                "avg_gain": float(avg.loc[dec]),
                "pct_of_income": 100 * float(total.loc[dec]) / float(base.loc[dec]),
                "winner_share": 100 * float((sub["gain"] > 1).sum()) / float(sub["gain"].count()),
            }
        )
    return rows


def overall_winner_share(baseline: dict, reform: dict) -> float:
    gain = reform["net"] - baseline["net"]
    return 100 * float((gain > 1).sum()) / len(gain)


def poverty_impact(baseline: dict, reform: dict) -> dict:
    def rate(d, mask=None):
        v, w = d["pov"], d["pov_wt"]
        if mask is not None:
            v, w = v[mask], w[mask]
        return 100 * float(MicroSeries(v, weights=w).mean())

    cb = baseline["is_child"].astype(bool)
    cr = reform["is_child"].astype(bool)
    return {
        "all_baseline": rate(baseline),
        "all_reform": rate(reform),
        "child_baseline": rate(baseline, cb),
        "child_reform": rate(reform, cr),
    }


def inequality_impact(baseline: dict, reform: dict) -> dict:
    gb = MicroSeries(baseline["net"], weights=baseline["net_wt"]).gini()
    gr = MicroSeries(reform["net"], weights=reform["net_wt"]).gini()
    return {"gini_baseline": float(gb), "gini_reform": float(gr)}


def newly_covered(baseline: dict, reform: dict) -> dict:
    newly = reform["recv"].astype(bool) & ~baseline["recv"].astype(bool)
    wt = baseline["age_wt"]
    total = float((newly * wt).sum())
    by_age = []
    for a in range(0, 5):
        mask = newly & (baseline["age"].astype(int) == a)
        count = float((mask * wt).sum())
        if count > 0:
            by_age.append({"age": a, "count": count})
    return {
        "total": total,
        "by_age": by_age,
        "baseline_on_offer": float((baseline["recv"].astype(float) * wt).sum()),
        "reform_on_offer": float((reform["recv"].astype(float) * reform["age_wt"]).sum()),
    }


def bottom60_mean_gain(baseline: dict, reform: dict) -> float:
    gain = reform["net"] - baseline["net"]
    df = MicroDataFrame(
        {"decile": baseline["decile"], "gain": gain}, weights=baseline["net_wt"]
    )
    df = df[(df["decile"] > 0) & (df["decile"] <= 6)]
    return float(df["gain"].mean())
