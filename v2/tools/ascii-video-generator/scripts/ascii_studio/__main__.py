"""Allow `python -m ascii_studio`."""

from .cli import main

if __name__ == "__main__":
    raise SystemExit(main())
