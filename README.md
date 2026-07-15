# uk-extended-childcare

Scoring the **New Economics Foundation's Universal Family Childcare Promise**
with [PolicyEngine](https://policyengine.org) UK.

**🔗 Live dashboard: https://uk-extended-childcare.vercel.app**

The reform has two components:

1. **Universal 15-hour entitlement** for every child from 9 months to 4 years,
   regardless of parental work status (in PolicyEngine: lowering the universal
   entitlement age floor from 3 to 0).
2. **An earnings cost cap** — the cost of childcare above the universal 15 hours
   is capped at a percentage of family earnings (5% preferred, 7.5% transitional)
   for working families; the government pays the rest.

## Headline results (2025-26, static, no behavioural response)

| Result | PolicyEngine UK |
| --- | --- |
| Universal 15h extension to under-3s (component 1) | **£3.09bn/yr** at benchmark take-up (**£4.18bn** ceiling at full take-up) |
| Earnings cost cap at 5% (component 2) | **£1.71bn/yr** (0.44m working families) |
| Combined additional cost | **£4.80bn/yr** at benchmark take-up (**£5.89bn** at full take-up) |
| Children newly on the universal offer | **0.51m** at benchmark take-up (0.69m at full; overwhelmingly under-3s) |
| Current total government childcare support | **£13.58bn** across 6 programs |

### What this analysis adds (and how it answers the obvious objections)

NEF publishes a single net headline for the whole package. Pricing it in
PolicyEngine adds three things a headline can't:

1. **Decomposition — it's the universal extension, not the cap, that costs.** The
   universal under-3 extension is the bulk (£3–4bn depending on take-up); the
   working-family earnings cap adds only **£1.71bn** on top. The cap is *not* the
   driver.
2. **Who is covered.** The newly-covered children are almost entirely under-3s in
   **non-working** families — working families' under-3s already use the 30h
   offer. This makes the "childcare for people who aren't working" question
   explicit rather than buried in a net figure.
3. **A take-up sensitivity band, not a point.** The raw microsim assumes *full*
   take-up, but these children have a parent already at home, so real take-up is
   well below 100%. Because the whole component-1 cost sits in one program, cost
   is exactly linear in take-up. We benchmark against the closest existing offer —
   the disadvantaged 2-year-old entitlement, ~74% take-up ([IFS](https://ifs.org.uk/articles/why-take-two-year-old-offer-has-really-fallen)) —
   and show a low case (~50%). The "£4bn for non-working families" figure is the
   **ceiling**; the take-up-adjusted headline is **£3.09bn** (low case £2.09bn).

NEF's headline £3–3.4bn is the *net* cost of the whole system (which also replaces
Tax-Free Childcare and the UC childcare element); our static score prices each
component additively on top of the current system — same order of magnitude, not
like-for-like. See the dashboard's **Methodology** tab for the full mapping.

## What it produces

A single `data/uk_extended_childcare_results.json`, consumed by the dashboard,
with the baseline childcare system, the reform's fiscal score, distributional and
poverty impacts, and a comparison with the figures NEF and the *Mirror* report.

## Structure

```
src/uk_extended_childcare/
  worker.py      # runs ONE scenario in an isolated process, dumps arrays to .npz
  scenarios.py   # orchestrates the subprocess workers, caches snapshots
  impacts.py     # decile / poverty / Gini via microdf
  reform.py      # (see sources) universal extension + cost-cap definitions
  sources.py     # NEF/Mirror reported figures + methodology prose (with URLs)
  pipeline.py    # assembles the results JSON
  cli.py         # `uk-extended-childcare-build`
dashboard/       # Next.js dashboard (Reform / Baseline / Methodology tabs)
```

Each scenario runs in its **own process** so peak memory stays at a single
microsimulation — the managed release dataset is multi-year and two simulations
do not fit in a small machine's RAM.

## Run

```bash
pip install -e ".[simulation]"
export HF_TOKEN=...            # for the managed dataset download
python -m uk_extended_childcare --year 2025
# reuses cached data/cache/*.npz; pass --force to recompute the microsims
```

## Dashboard

```bash
cd dashboard
bun install     # or npm install
bun run dev
```

Three tabs: **Reform** (the UFCP score), **Baseline** (the current childcare
system), and **Methodology**.

## Sources

- NEF — [The Universal Family Childcare Promise](https://neweconomics.org/2025/07/the-universal-family-childcare-promise) (July 2025)
- *Daily Mirror* — [Free childcare could be extended](https://www.mirror.co.uk/news/uk-news/free-childcare-could-be-extended-37401321)
