"""Command-line entry point for the extended-childcare pipeline.

Registered as ``uk-extended-childcare-build`` and invoked by
``python -m uk_extended_childcare``.
"""

from __future__ import annotations

import argparse

from .pipeline import run


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="uk-extended-childcare-build",
        description="Generate dashboard-ready Universal Family Childcare Promise results.",
    )
    parser.add_argument("--year", type=int, default=2025)
    parser.add_argument(
        "--cache-dir",
        default=None,
        help="Directory for scenario snapshot .npz files (default: data/cache).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Recompute scenario snapshots even if cached .npz files exist.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    run(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
