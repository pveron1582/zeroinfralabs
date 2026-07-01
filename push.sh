#!/usr/bin/env bash

# Salir inmediatamente si algún comando falla
set -e

# Ir al directorio del script
cd "$(dirname "$0")"

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Automatización de Subida a GitHub ===${NC}"

# Verificar si estamos en un repositorio de git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: Este directorio no es un repositorio de Git.${NC}"
  exit 1
fi

# Comprobar si hay cambios para confirmar (rastreados o no)
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
  echo -e "${GREEN}✅ No hay cambios pendientes para confirmar.${NC}"
  exit 0
fi

# Mostrar el estado actual
echo -e "${YELLOW}Cambios detectados:${NC}"
git status -s

echo ""

# Obtener el mensaje de commit del primer argumento
COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
  # Si no se pasó un argumento, solicitar el mensaje interactivamente
  read -p "📝 Escribe el mensaje para el commit (o presiona Enter para usar uno por defecto): " USER_INPUT
  COMMIT_MSG="$USER_INPUT"
fi

# Si el mensaje sigue vacío, generar uno por defecto
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Actualización automática: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Añadir todos los cambios
echo -e "\n${BLUE}➕ Añadiendo todos los cambios...${NC}"
git add -A

# Confirmar los cambios
echo -e "${BLUE}💾 Confirmando cambios...${NC}"
git commit -m "$COMMIT_MSG"

# Obtener el nombre de la rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Subir los cambios a GitHub
echo -e "${BLUE}🚀 Subiendo cambios a origin/${CURRENT_BRANCH}...${NC}"
git push origin "$CURRENT_BRANCH"

echo -e "${GREEN}🎉 ¡Subida completada con éxito!${NC}"
