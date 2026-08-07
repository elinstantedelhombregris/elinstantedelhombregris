"""BLAS thread pinning -- must run before numpy is imported anywhere in the process.

Why this file has no numpy import and why callers must not import numpy first:

OpenBLAS (numpy's default backend on this machine) reads its thread count from the
environment variables below exactly once, when the shared library is dynamically
loaded -- which happens as a side effect of the *first* `import numpy` in the
process. After that point the thread pool is already sized; setting the variables
later is a no-op because there is no supported OpenBLAS API to resize it at runtime
from pure Python (short of the optional `threadpoolctl` package, which this project
does not depend on).

So `pin_blas_threads()` only works if it runs strictly before the first `import
numpy` -- directly or transitively -- anywhere in the interpreter's lifetime. That is
why `ascii_studio/__init__.py` calls it as the very first statement, before importing
any submodule, and why this module itself must stay numpy-free: importing numpy here
would defeat the whole point by loading OpenBLAS before the pin is applied.

The concrete defect this fixes: OpenBLAS defaults to one thread per core (12 on this
machine). The render hot path's glyph best-match matmul is ~15k x 32 @ 32 x 62 --
far too small for 12-way threading to pay for its own coordination overhead, and the
video renderer additionally runs a multiprocessing Pool of worker processes, each of
which would otherwise start its own 12 BLAS threads. Measured on this machine:
single-process 173ms/frame unpinned vs 108ms/frame pinned to 1 thread (1.6x), and
6 concurrent worker processes go from 6.4 fps effective (unpinned, 6 x 12 = 72
threads contending for 12 cores) to 18.4 fps effective (pinned).
"""

from __future__ import annotations

import os

# Every environment variable a BLAS/OpenMP backend numpy might load could read for
# its default thread count. Setting all of them keeps the pin correct regardless of
# which backend a given numpy build/environment resolves to.
_THREAD_ENV_VARS = (
    "OMP_NUM_THREADS",
    "OPENBLAS_NUM_THREADS",
    "MKL_NUM_THREADS",
    "VECLIB_MAXIMUM_THREADS",
    "NUMEXPR_NUM_THREADS",
)


def pin_blas_threads(n: int = 1) -> None:
    """Set BLAS/OpenMP thread-count env vars to ``n``.

    Must be called before numpy is imported anywhere in this process (see module
    docstring). Safe to call multiple times; later calls simply overwrite the value.
    """
    value = str(n)
    for name in _THREAD_ENV_VARS:
        os.environ[name] = value
