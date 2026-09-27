export const help_sed = `sed - Stream editor (subset)

Usage:
  sed [OPTION] SCRIPT [FILE]
  sed [OPTION] -e SCRIPT [-e SCRIPT] [FILE]

Commands:
  s/re/repl/[g][p][i]   Any delimiter, \\1-\\9 and & supported
  Nd, N,Md, /re/d       Delete lines
  Np, /re/p             Print (duplicates unless -n)
  Nq                    Quit after line N

Options:
  -n          Suppress default output
  -e SCRIPT   Script (repeatable; one command each)

Limits: no /re1/,/re2/ ranges, no hold space, no -i.

Examples:
  sed 's/foo/bar/g' file
  sed -n '2p' file
  sed '1,3d' file`;
