# Notas de Seguridad - ZeroInfra Labs

## Sobre los Hashes en el Simulador

### ⚠️ IMPORTANTE: Hashes FICTICIOS

Este simulador contiene **hashes de demostración** que son **ficticios** y se utilizan únicamente con fines educativos. **NO** son hashes reales de contraseñas comprometidas.

#### Ejemplos de Hashes Ficticios Usados:

```
5d41402abc4b2a76b9719d911017c592  →  MD5 de "hello" (ejemplo didáctico)
aad3b435b51404eeaad3b435b51404ee  →  Hash LM vacío (estándar Windows)
31d6cfe0d16ae931b73c59d7e0c089c0  →  Hash NTLM vacío (estándar Windows)
```

### ¿Por qué usamos hashes ficticios?

1. **Seguridad**: Evitamos distribuir hashes reales de contraseñas filtradas
2. **Legal**: No exponemos datos reales de usuarios comprometidos
3. **Educativo**: Los valores predecibles permiten verificar que el simulador funciona
4. **Ético**: No promovemos el uso de diccionarios reales de contraseñas filtradas

### Hashcat en el Simulador

El comando `hashcat` simulado:
- **NO** realiza cálculos criptográficos reales
- **NO** utiliza GPU para crackeo
- **SIEMPRE** "descifra" el hash de demostración (`5d41402abc4b2a76b9719d911017c592` → `hello`)
- Es una **simulación visual** para enseñar el flujo de trabajo

### Uso Responsable

Este simulador está diseñado para:
- ✅ Enseñar metodologías de pentesting de forma segura
- ✅ Practicar comandos sin riesgo de daño real
- ✅ Comprender flujos de trabajo de ciberseguridad

**NO** debe usarse para:
- ❌ Crackear hashes reales
- ❌ Entrenar con contraseñas filtradas reales
- ❌ Cualquier actividad maliciosa

---

## Mejores Prácticas de Seguridad

### Para Entornos Reales

1. **Nunca uses contraseñas comunes** como las mostradas en el simulador
2. **Usa gestores de contraseñas** para generar contraseñas fuertes
3. **Implementa MFA** (Autenticación Multi-Factor) siempre que sea posible
4. **Mantén sistemas actualizados** para prevenir exploits como EternalBlue
5. **Usa firewalls** y segmentación de red adecuada

### Reporte de Vulnerabilidades

Si encuentras vulnerabilidades de seguridad en este simulador:
- Esto es un proyecto educativo de código abierto
- Reporta issues en el repositorio correspondiente
- No se recomienda su uso en producción

---

## Disclaimer Legal

Este software se proporciona "tal cual" para fines educativos. Los autores no se hacen responsables del mal uso de las técnicas demostradas. El uso de estas técnicas contra sistemas sin autorización explícita es ilegal.

**Siempre obtén permiso por escrito antes de realizar pruebas de penetración.**

---

## Referencias

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Código Penal Español - Delitos informáticos](https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444)
- [Computer Fraud and Abuse Act (EE.UU.)](https://www.law.cornell.edu/uscode/text/18/1030)
