"""Run scenario workers in isolated subprocesses and load their snapshots.

Each scenario is a separate ``python -m uk_extended_childcare.worker`` process so
peak memory stays at one microsimulation. Snapshots are cached as .npz; delete
them (or pass ``force=True``) to recompute.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import numpy as np


def _run(args: list[str], out: Path, force: bool) -> dict:
    if out.exists() and not force:
        print(f"[cache] reusing {out.name}")
    else:
        cmd = [sys.executable, "-m", "uk_extended_childcare.worker", *args, str(out)]
        print(f"[run] {' '.join(args)} ...")
        subprocess.run(cmd, check=True, env={**os.environ})
    return dict(np.load(out))


def run_baseline(cache_dir: Path, force: bool = False) -> dict:
    return _run(["baseline"], cache_dir / "snap_baseline.npz", force)


def run_reform(cache_dir: Path, force: bool = False) -> dict:
    return _run(["reform"], cache_dir / "snap_reform.npz", force)


def run_costcap(cache_dir: Path, cap_rate: float, force: bool = False) -> dict:
    tag = f"snap_costcap{int(round(cap_rate * 1000))}.npz"
    # worker signature: costcap <out> <cap_rate>; _run appends <out> last, so
    # pass cap_rate before it via a small wrapper.
    out = cache_dir / tag
    if out.exists() and not force:
        print(f"[cache] reusing {out.name}")
    else:
        cmd = [
            sys.executable,
            "-m",
            "uk_extended_childcare.worker",
            "costcap",
            str(out),
            str(cap_rate),
        ]
        print(f"[run] costcap {cap_rate:.1%} ...")
        subprocess.run(cmd, check=True, env={**os.environ})
    return dict(np.load(out))
