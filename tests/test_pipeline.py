"""Smoke tests for the assembly layer (no PolicyEngine required).

These validate the impact math and JSON assembly on synthetic snapshot arrays,
so they run without the [simulation] extra or the managed dataset.
"""
import numpy as np

from uk_extended_childcare import impacts


def _snap(net, decile, wt, recv=None, age=None, pov=None, is_child=None):
    n = len(net)
    return {
        "net": np.array(net, float),
        "net_wt": np.array(wt, float),
        "decile": np.array(decile, int),
        "recv": np.array(recv if recv is not None else np.zeros(n), int),
        "age": np.array(age if age is not None else np.zeros(n), float),
        "age_wt": np.array(wt, float),
        "pov": np.array(pov if pov is not None else np.zeros(n), float),
        "pov_wt": np.array(wt, float),
        "is_child": np.array(is_child if is_child is not None else np.zeros(n), int),
    }


def test_decile_impact_gain_is_positive():
    base = _snap([100, 200, 300], [1, 2, 3], [1, 1, 1])
    ref = _snap([110, 205, 305], [1, 2, 3], [1, 1, 1])
    rows = impacts.decile_impact(base, ref)
    assert len(rows) == 3
    assert rows[0]["avg_gain"] == 10
    assert all(r["pct_of_income"] > 0 for r in rows)


def test_overall_winner_share():
    base = _snap([100, 200], [1, 2], [1, 1])
    ref = _snap([110, 200], [1, 2], [1, 1])
    assert impacts.overall_winner_share(base, ref) == 50.0


def test_newly_covered_counts_by_age():
    base = _snap([1, 1], [1, 1], [10, 10], recv=[0, 0], age=[1, 3])
    ref = _snap([1, 1], [1, 1], [10, 10], recv=[1, 0], age=[1, 3])
    cov = impacts.newly_covered(base, ref)
    assert cov["total"] == 10
    assert cov["by_age"] == [{"age": 1, "count": 10.0}]
