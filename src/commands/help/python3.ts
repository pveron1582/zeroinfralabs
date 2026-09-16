export const help_python3 = `python3 - Run Python scripts and one-liners (simulated)

Usage:
  python3 script.py [args]     Run a .py file from the filesystem
  python3 -c "code"            Run a single line of code
  python3 --version            Show interpreter version

Supported subset:
  Types        int, float, str, bool, list, dict, tuple, None
  Flow         if/elif/else, while, for, break, continue
  Functions    def, return
  Errors       try/except/finally
  Builtins     print, input, len, range, int, str, bool, open
  Modules      socket, sys, time

Examples:
  python3 -c "print('hola pentesting')"
  python3 /tmp/scan.py 10.0.0.11   # port scanner with socket

Note: scripts with input() wait for keyboard input in the terminal.
open() reads files from the virtual filesystem; socket connects against
the real lab network (open/closed ports and banners).`;
