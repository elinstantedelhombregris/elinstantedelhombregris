"""Cinematic ASCII Studio v2.

Side effect on import: this package pins BLAS/OpenMP threading to 1 thread (see
``ascii_studio._threads`` for the full rationale) by setting OMP_NUM_THREADS,
OPENBLAS_NUM_THREADS, MKL_NUM_THREADS, VECLIB_MAXIMUM_THREADS and NUMEXPR_NUM_THREADS
in os.environ. It has to happen here, as the first statement of the package
``__init__``, before any submodule that touches numpy is imported -- numpy/OpenBLAS reads its thread count
once at load time, so pinning after ``import numpy`` has already run anywhere in the
process has no effect. This also covers multiprocessing workers on macOS's default
``spawn`` start method: unpickling a worker target such as ``ascii_studio.video``'s
Pool initializer imports this package first, so the pin lands before that worker's
own ``import numpy``.

The render hot path (glyph best-match matmul, ~15k x 32 @ 32 x 62) is far smaller
than what OpenBLAS's default 12-way threading (this machine's core count) can
usefully parallelise, and the video renderer additionally fans out across a
multiprocessing Pool -- N worker processes x 12 BLAS threads each otherwise fight
over the same cores. Pinning to 1 thread is narrowly scoped to what this package's
render path needs; it is not a general "run quiet" flag.
"""

from ._threads import pin_blas_threads

pin_blas_threads(1)
