#!/usr/bin/env bash
# ── list-files-by-lines.sh ────────────────────────────────────────
# Lista todos los archivos del proyecto ordenados por cantidad de líneas
# (de menor a mayor). Excluye node_modules, .git, .venv, dist, coverage.
#
# Uso: ./list-files-by-lines.sh [directorio]
#   Sin argumentos: usa el directorio actual
# ──────────────────────────────────────────────────────────────────

set -euo pipefail

TARGET_DIR="${1:-.}"

printf "%-8s %s\n" "LÍNEAS" "ARCHIVO"
printf "%-8s %s\n" "------" "-----"

find "$TARGET_DIR" \
  -type f \
  \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.css' -o -name '*.html' -o -name '*.json' -o -name '*.md' -o -name '*.sh' -o -name '*.yaml' -o -name '*.yml' -o -name '*.toml' \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/.venv/*' \
  -not -path '*/dist/*' \
  -not -path '*/coverage/*' \
  -not -path '*/.cache/*' \
  | while IFS= read -r file; do
      lines=$(wc -l < "$file")
      printf "%-8s %s\n" "$lines" "$file"
    done \
  | sort -n
