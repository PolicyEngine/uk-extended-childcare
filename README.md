# uk-extended-childcare

Scoring the **New Economics Foundation's Universal Family Childcare Promise**
with [PolicyEngine](https://policyengine.org) UK.

The reform has two components:

1. **Universal 15-hour entitlement** for every child from 9 months to 4 years,
   regardless of parental work status (in PolicyEngine: lowering the universal
   entitlement age floor from 3 to 0).
2. **An earnings cost cap** — the cost of childcare above the universal 15 hours
   is capped at a percentage of family earnings (5% preferred, 7.5% transitional)
   for working families; the government pays the rest.

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
