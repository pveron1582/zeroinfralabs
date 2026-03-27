# 🔧 CÓMO APLICAR EL FIX - arp-scan + nmap

## El Problema
Cuando ejecutas `arp-scan`, el mapa muestra máquinas con su OS (ej: "Ubuntu 20.04 LTS") **inmediatamente**, aunque solo hayas descubierto su IP.

El OS **debería aparecer DESPUÉS de ejecutar `nmap -sV`** en esa máquina.

---

## La Solución (3 pasos simples)

### **PASO 1: Reemplaza el archivo nmap.ts**

**Ubicación en tu proyecto:**
```
src/commands/tools/nmap.ts
```

**Qué hacer:**
1. Abre `src/commands/tools/nmap.ts` en tu editor
2. Reemplaza TODO el contenido con el archivo `nmap.ts` que te pasé
3. Guarda

**O si prefieres copy-paste:**

Busca esta sección (línea ~36):
```typescript
let missionId: number | undefined;
for (const m of allMachines) {
  const step = m.learning_steps.find(s =>
    s.task.toLowerCase().includes('escaneo') || s.task.toLowerCase().includes('puerto')
  );
  if (step) { missionId = step.id; break; }
}

const canComplete = currentMissionId === (missionId || 2);
// No mutar directamente el estado aquí; el discovery_level se actualiza en completeMission
return {
  output,
  completedMissionId: canComplete ? (missionId || 2) : undefined
};
```

Y REEMPLAZA por:
```typescript
// Buscar si nmap completa una misión de este escenario
let missionId: number | undefined;
for (const m of allMachines) {
  const step = m.learning_steps.find(s =>
    s.task.toLowerCase().includes('escaneo') || 
    s.task.toLowerCase().includes('puerto') ||
    s.task.toLowerCase().includes('nmap')
  );
  if (step) { missionId = step.id; break; }
}

const canComplete = currentMissionId === (missionId || 2);

// FIX #9: nmap descubre el sistema operativo (discovery_level 2)
// Esto se debe reflejar en la máquina objetivo para que el mapa la muestre
target.discovery_level = Math.max(target.discovery_level ?? 0, 2);

return {
  output,
  completedMissionId: canComplete ? (missionId || 2) : undefined
};
```

---

## ✔️ VALIDAR QUE FUNCIONA

**Test 1: arp-scan (SIN mostrar OS)**
```bash
> arp-scan 192.168.0.0/24

# Ahora abre el mapa (M o click en Network Map)
# Las máquinas descubiertas deben mostrar:
#   privesc-lab
#   192.168.30.11
#   (Sistema desconocido)  ← ¡IMPORTANTE! Aquí NO debe mostrarse "Ubuntu"
```

**Test 2: nmap (AHORA SÍ mostrar OS)**
```bash
> nmap -sV 192.168.30.11

# Abre el mapa nuevamente
# Debería mostrar:
#   privesc-lab
#   192.168.30.11
#   Ubuntu 20.04 LTS  ← ¡AHORA aparece!
```

**Test 3: Cambiar escenario**
```bash
# Desde el mapa, vuelve a home y abre otro escenario
# Las nuevas máquinas deben mostrar "(Sistema desconocido)"
# Confirma que no heredan el OS del escenario anterior
```

---

## 🎯 ¿Por qué funciona?

**Antes del fix:**
- `arp-scan` descubre IP (discovery_level = 1)
- El mapa mostraba el OS igualmente (bug)
- `nmap` ejecutado pero discovery_level NO se actualizaba a 2

**Después del fix:**
- `arp-scan` descubre IP (discovery_level = 1) → mapa muestra "(Sistema desconocido)"
- `nmap -sV` ejecutado → **actualiza discovery_level a 2** ← AQUÍ ESTÁ EL FIX
- El mapa ve que discovery_level >= 2 → muestra el OS real

---

## 📝 Resumen

**Archivo modificado:** `src/commands/tools/nmap.ts`

**Línea agregada (antes del return):**
```typescript
target.discovery_level = Math.max(target.discovery_level ?? 0, 2);
```

**Efecto:**
- ✅ arp-scan muestra "(Sistema desconocido)"
- ✅ nmap -sV actualiza el mapa a mostrar OS real
- ✅ Comportamiento realista de descubrimiento progresivo

---

**¿Dudas? Pregunta.**
