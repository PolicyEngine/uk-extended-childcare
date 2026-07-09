"""Universal Family Childcare Promise analysis.

Scores the New Economics Foundation's Universal Family Childcare Promise with
PolicyEngine UK: a universal 15-hour entitlement for every child from 9 months
to 4 years (component 1), plus a cap on the cost of hours above the universal 15
at a percentage of family earnings for working families (component 2).
"""

__all__ = ["run"]


def __getattr__(name: str):
    # `run` pulls in the PolicyEngine stack, which only the [simulation] extra
    # installs; import it lazily so lightweight imports stay cheap.
    if name == "run":
        from .pipeline import run

        return run
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
