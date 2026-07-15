"""Single registry of every non-PolicyEngine number and text used in the analysis.

Policy: statutory parameters (age floors, funded hours, funding rates, income
limits) come from the PolicyEngine parameter tree at run time and are never
written here. Everything else — the NEF/Mirror reported figures used as anchors,
the empirical assumptions, and the prose that documents the method — lives here
with a value, a description and a source URL, and is emitted verbatim into the
results JSON so the dashboard renders no hardcoded numbers.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# ── Reform definition ────────────────────────────────────────────────────────
# NEF's "Universal Family Childcare Promise": a universal 15h/week entitlement
# for every child from 9 months to 4 years (component 1), plus a cap on the cost
# of hours above the universal 15 at a % of family earnings for working families
# (component 2). In PolicyEngine, component 1 is lowering the universal
# entitlement age floor from 3 to 0.
UNIVERSAL_AGE_FLOOR_BASELINE = 3      # PolicyEngine baseline: universal 15h starts at age 3
UNIVERSAL_AGE_FLOOR_REFORM = 0        # NEF: from 9 months (modelled as age 0-4)
CAP_RATE = 0.05                       # NEF preferred earnings cap
CAP_RATE_TRANSITIONAL = 0.075         # NEF transitional alternative

# ── Take-up of the universal extension (component 1) ─────────────────────────
# The universal 15h extension newly reaches under-3s who are overwhelmingly in
# NON-WORKING families (working families' under-3s already use the 30h offer).
# The headline scores FULL take-up, but a home parent has less need for formal
# childcare, so real take-up is well below 100%. Because the entire component-1
# cost sits in a single program (the universal entitlement), cost is linear in
# take-up: cost(tau) = full_cost * tau. We therefore present a sensitivity band
# anchored to observed take-up of comparable funded offers rather than a single
# point. Rates below are benchmarks, not PolicyEngine outputs.
TAKEUP_FULL = 1.00        # headline assumption (fiscal ceiling)
TAKEUP_BENCHMARK = 0.74   # peak take-up of the disadvantaged 2-year-old offer
TAKEUP_LOW = 0.50         # illustrative low case for newly-eligible under-2s


@dataclass(frozen=True)
class Source:
    value: Any
    description: str
    url: str


# ── What the reform changes (rendered as a table on the Reform tab) ──────────
# baseline/reform values reference the constants above so they stay in sync.

REFORM_CHANGES = [
    {
        "policy": "Universal free entitlement — youngest eligible age",
        "parameter": "gov.dfe.universal_childcare_entitlement.age.min",
        "baseline": f"{UNIVERSAL_AGE_FLOOR_BASELINE} years",
        "reform": "9 months (modelled as age 0)",
        "effect": "Extends the universal 15h/week offer to every child from 9 months, regardless of whether parents work.",
    },
    {
        "policy": "Universal free entitlement — hours",
        "parameter": "gov.dfe.universal_childcare_entitlement.hours",
        "baseline": "15 hours/week (570/year)",
        "reform": "15 hours/week (unchanged)",
        "effect": "The core universal hours are kept the same; only the eligible age range widens.",
    },
    {
        "policy": "Cost of hours above the universal 15 (working families)",
        "parameter": "new — earnings cost cap",
        "baseline": "No cap (market rates, net of Tax-Free Childcare / UC childcare element)",
        "reform": f"Capped at {int(CAP_RATE * 100)}% of family earnings ({CAP_RATE_TRANSITIONAL * 100:g}% transitional)",
        "effect": "Government pays a working family's childcare spend above the cap on hours beyond the universal 15.",
    },
    {
        "policy": "Working-family / income eligibility for extra hours",
        "parameter": "extended_childcare_entitlement (work + income test)",
        "baseline": "Both parents earning ≥16h at NLW, each under £100k",
        "reform": "Unchanged (retained as the cap's 'working family' test)",
        "effect": "Same work test gates the cost cap; the universal 15h has no work test.",
    },
]


# ── Take-up scenarios for the universal extension (rendered as a band) ───────
# Each scenario scales the full-take-up component-1 cost and reach by `rate`.
# The default headline number is the benchmark, not the ceiling.
TAKEUP_SCENARIOS = [
    {
        "key": "full",
        "rate": TAKEUP_FULL,
        "label": "Full take-up",
        "note": "Fiscal ceiling: every eligible family uses the funded hours. The original headline assumption.",
    },
    {
        "key": "benchmark",
        "rate": TAKEUP_BENCHMARK,
        "label": "2-year-old offer benchmark",
        "note": "Take-up equal to the disadvantaged 2-year-old entitlement (~74% at its peak) — the closest existing funded offer aimed at families who are frequently not working.",
    },
    {
        "key": "low",
        "rate": TAKEUP_LOW,
        "label": "Low case (youngest children)",
        "note": "Illustrative: non-working parents of under-2s have the least need for formal care, so take-up runs below the 2-year-old benchmark.",
    },
]
TAKEUP_DEFAULT_KEY = "benchmark"  # the take-up-adjusted central estimate we headline


# ── NEF / Mirror reported figures (anchors for the comparison) ───────────────

REPORTED = {
    "nef_net_cost_low": Source(
        value=3.0,
        description="NEF net additional cost of the full UFCP system vs the fully rolled-out funded-hours offer (low end).",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_net_cost_high": Source(
        value=3.4,
        description="NEF net additional cost of the full UFCP system (high end).",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_current_system_cost": Source(
        value=10.6,
        description="NEF estimate of current total government childcare support (funded hours + Tax-Free Childcare + UC childcare element) once fully rolled out, £bn/yr.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_bottom60_gain_low": Source(
        value=1081,
        description="NEF: average annual gain for the bottom 60% of earners under the UFCP (low end), £.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_bottom60_gain_high": Source(
        value=1259,
        description="NEF: average annual gain for the bottom 60% of earners under the UFCP (high end), £.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_net_winners_share": Source(
        value=0.585,
        description="NEF Model 2: share of families with pre-school children better off under the UFCP.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "nef_no_worse_off_share": Source(
        value=0.664,
        description="NEF Model 2: share of families no worse off under the UFCP.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "poorest40_eligible_share": Source(
        value=0.216,
        description="NEF: share of families with young children in the poorest 40% who meet the working-family eligibility criteria for expanded funded hours.",
        url="https://neweconomics.org/2025/07/the-universal-family-childcare-promise",
    ),
    "takeup_2yo_offer": Source(
        value=0.74,
        description="Peak take-up of the funded early-education entitlement for disadvantaged 2-year-olds (share of eligible children accessing a place), England — the closest existing offer to a funded entitlement for families who are frequently not working.",
        url="https://ifs.org.uk/articles/why-take-two-year-old-offer-has-really-fallen",
    ),
    "takeup_universal_34": Source(
        value=0.93,
        description="Take-up of the universal 15h entitlement for 3- and 4-year-olds, England (Jan 2025) — an upper benchmark where nearly all families use the offer.",
        url="https://explore-education-statistics.service.gov.uk/find-statistics/funded-early-education-and-childcare/2025",
    ),
    "mirror_scheme_cost_2028": Source(
        value=8.0,
        description="Current childcare scheme projected cost to the taxpayer by 2028, £bn/yr (Mirror/Times).",
        url="https://www.mirror.co.uk/news/uk-news/free-childcare-could-be-extended-37401321",
    ),
    "mirror_universal_offer_cost": Source(
        value=15.0,
        description="Cost of a full 'universal childcare offer', up to £bn/yr (Mirror/Times).",
        url="https://www.mirror.co.uk/news/uk-news/free-childcare-could-be-extended-37401321",
    ),
    "dfe_families_funded_hours": Source(
        value=500_000,
        description="DfE estimate of families benefiting from funded hours (Mirror).",
        url="https://www.mirror.co.uk/news/uk-news/free-childcare-could-be-extended-37401321",
    ),
}


# ── Methodology prose (rendered on the Methodology tab) ──────────────────────

METHODS = {
    "engine": (
        "Baseline and reform are built with the policyengine (policyengine.py) package via "
        "policyengine.uk.managed_microsimulation(), which pins the run to the managed release "
        "dataset for reproducibility. Each scenario runs in its own process (peak memory = one "
        "microsimulation) and the arrays needed for analysis are dumped to disk; all aggregates, "
        "deciles, poverty rates and the Gini are then computed with microdf on the survey-weighted "
        "arrays."
    ),
    "universal_extension": (
        "Component 1 of the UFCP — a universal 15-hour entitlement for every child from 9 months "
        "to 4 years — is modelled by lowering gov.dfe.universal_childcare_entitlement.age.min from "
        "3 to 0. The entitlement is valued at DfE funding rates (higher for younger children), so "
        "the cost is hours x funding_rate(age). Because universal and the extended (30h) offer "
        "cannot be combined, the extension newly reaches children not already on a funded scheme — "
        "largely under-3s in non-working families. Ages are integer years, so the model covers 0-4y, "
        "marginally over-inclusive of NEF's 9-month floor."
    ),
    "cost_cap": (
        "Component 2 — a cap on the cost of childcare above the universal 15 hours at a percentage "
        "of family earnings — is modelled statically: for working families (those meeting the "
        "extended/30h work and income test, which implies a young child), the government tops up "
        "reported childcare spend above cap_rate x family earnings. This uses the FRS childcare "
        "expenditure and is an approximation: it does not re-optimise the number of hours families "
        "would buy under a lower price, which NEF models separately and finds raises both usage and "
        "cost. We report the 5% cap (NEF's preferred) and a 7.5% transitional alternative."
    ),
    "comparison": (
        "Our static score isolates the universal 15h extension (NEF's stated 'first step') and the "
        "cost cap as separate, additive components on top of the current system. NEF's headline "
        "£3-3.4bn is the NET cost of the whole system, which also REPLACES Tax-Free Childcare and "
        "the UC childcare element and is measured against the fully rolled-out 30h offer — so the "
        "figures are the same order of magnitude but not like-for-like."
    ),
    "distribution": (
        "Distributional results weight each household's change in net income by its survey weight "
        "and group by PolicyEngine's household income decile. The universal extension is valued "
        "in-kind at DfE funding rates and added to net income, so poverty (an income concept) barely "
        "moves even though the in-kind benefit is sizeable."
    ),
    "take_up": (
        "The universal extension is priced at FULL take-up in the raw microsimulation, but the "
        "children it newly reaches are overwhelmingly under-3s in NON-WORKING families — a group with "
        "a home parent and therefore lower demand for formal childcare. We do not assume every such "
        "family enrols. Because the entire component-1 cost sits in one program (the universal "
        "entitlement), cost is exactly linear in take-up, so we present a sensitivity band: full "
        "take-up (the fiscal ceiling), a benchmark equal to the observed take-up of the disadvantaged "
        "2-year-old offer (~74%, the closest existing funded offer for often-non-working families), and "
        "a low case (~50%) for the youngest, newly-eligible children. The take-up-adjusted benchmark, "
        "not the ceiling, is the headline cost."
    ),
    "value_add": (
        "NEF publishes a single net headline for the whole package. This analysis adds three things a "
        "headline cannot: (1) it DECOMPOSES the promise into its two levers and prices each separately "
        "on the actual UK microdata, showing the universal under-3 extension — not the earnings cap — "
        "is the bulk of the cost; (2) it shows exactly WHO is newly covered (by age and work status), "
        "making the 'childcare for non-working families' question explicit rather than buried; and (3) "
        "it stress-tests the assumption that most exposes the cost — take-up among non-working families "
        "— turning a point estimate into a defensible range."
    ),
    "caveats": (
        "Static, no behavioural/labour-supply response (NEF: net costs fall ~11% once extra working "
        "hours are counted); the universal extension is shown across a take-up band (see take-up), with "
        "distributional and poverty figures reported at full take-up as an upper bound on reach; the "
        "cost cap does not model induced extra hours; in-kind valuation at DfE funding rates."
    ),
}
