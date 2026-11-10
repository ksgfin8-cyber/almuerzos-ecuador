# CRITERIOS DE EXTENSIÓN

**Cómo Agregar Funcionalidad Sin Romper el Sistema**

---

## I. PROPÓSITO

Este documento define **cómo decidir si una extensión es válida** antes de implementarla.

No es una guía de implementación.  
Es un **filtro de diseño**.

---

## II. CHECKLIST DE VALIDACIÓN

Para **cualquier nueva característica**, completar:

### 1. Asignación de Responsabilidad

```
Característica: _________________________________

□ ¿En qué bloque vive la lógica principal?
  Opciones: A / B / C / D / E / F / G / JSON
  Respuesta: ___________

□ ¿Respeta las prohibiciones del bloque?
  ✓ Sí / ✗ No → Si No, RECHAZAR

□ ¿Cruza fronteras epistémicas prohibidas?
  Ejemplo: ¿B consulta a E directamente?
  ✓ No cruza / ✗ Cruza → Si Cruza, RECHAZAR
```

---

### 2. Preservación de Invariantes Globales

```
□ ¿Rompe IG.1 (Unicidad temporal)?
  ¿Calcula tiempo fuera de D?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.2 (G único stateful)?
  ¿Introduce estado persistente fuera de G?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.3 (Atemporalidad de C)?
  ¿Agrega timestamps o TTL a C?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.4 (Validez no booleana)?
  ¿Simplifica ejecutabilidad a true/false?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.5 (Determinismo)?
  ¿Introduce aleatoriedad, heurísticas ocultas, APIs sin modelar?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.6 (No coerción)?
  ¿Persuade, presiona, o manipula decisiones?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe IG.7 (Agencia humana)?
  ¿Actúa sin gesto explícito del usuario?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR
```

---

### 3. Análisis de Composición

```
□ ¿Se compone con gestos existentes?
  ¿Forma parte del monoide de gestos?
  ✓ Sí / ✗ No

□ ¿Preserva determinismo en composición?
  ¿(g₁ ⊕ nueva) ⊕ g₃ es predecible?
  ✓ Sí / ✗ No → Si No, REDISEÑAR

□ ¿Introduce dependencias cíclicas?
  ¿Bloque X necesita a Y, pero Y necesita a X?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR
```

---

### 4. Verificación de Pureza

```
□ ¿Las nuevas funciones son puras donde deben serlo?
  D, E, F deben ser funciones puras.
  ✓ Sí / ✗ No → Si No, REDISEÑAR

□ ¿Los side effects están controlados por G?
  ¿Solo G decide cuándo mutar o ejecutar IO?
  ✓ Sí / ✗ No → Si No, REDISEÑAR
```

---

### 5. Portabilidad y Simplicidad

```
□ ¿Requiere infraestructura externa?
  (Backend, APIs, base de datos remota, build process)
  ✓ No / ✗ Sí → Si Sí, RECHAZAR

□ ¿Rompe la portabilidad?
  ¿Sigue funcionando con: git clone → open index.html?
  ✓ Sí / ✗ No → Si No, RECHAZAR

□ ¿Introduce dependencias en runtime?
  ¿Requiere npm install o yarn para ejecutar?
  ✓ No / ✗ Sí → Si Sí, RECHAZAR
```

---

## III. VEREDICTO

```
Si todas las verificaciones pasan:
  → ACEPTAR e implementar

Si 1-2 fallan pero son rediseñables:
  → REDISEÑAR según invariantes

Si 3+ fallan o violan axiomas fundamentales:
  → RECHAZAR (no pertenece al sistema)
```

---

## IV. EJEMPLOS

### ✅ Extensión Válida: "Agregar Favoritos"

```
1. Asignación:
   ✓ Lógica en G (único stateful)
   ✓ C solo guarda símbolos
   ✓ No cruza fronteras epistémicas

2. Invariantes:
   ✓ No rompe IG.1 (no usa tiempo)
   ✓ No rompe IG.2 (estado en G, no en C)
   ✓ No rompe IG.3 (C sigue atemporal)
   ✓ No rompe IG.4-7

3. Composición:
   ✓ cargarFavorito: Estado → Estado (morfismo válido)
   ✓ Composición: seleccionar ⊕ cargarFavorito = válido

4. Pureza:
   ✓ C.setDesdeSnapshot(snapshot) es puro
   ✓ G.guardarFavorito() tiene side effect controlado

5. Portabilidad:
   ✓ localStorage es parte del navegador
   ✓ No rompe git clone → open index.html

Veredicto: ACEPTAR
```

---

### ❌ Extensión Inválida: "Agregar Precios Dinámicos"

```
1. Asignación:
   ✗ ¿Precios en C? → Viola IC.2 (C solo símbolos)
   ✗ ¿Precios en JSON? → Viola contrato (JSON sin lógica comercial)

2. Invariantes:
   ✗ Rompe naturaleza del sistema (no es comercial)
   ✗ Viola Sección II del CONTRATO: "NO-PROPÓSITO"

Veredicto: RECHAZAR (viola identidad del sistema)
```

---

### ⚠️ Extensión Rediseñable: "Mostrar Historial de Pedidos"

**Primer intento:**
```
❌ Guardar historial en C → Viola IG.3 (C atemporal)
```

**Rediseño:**
```
✓ Guardar historial en G (único stateful)
✓ C solo guarda IDs, G mantiene timestamps
✓ Recuperación requiere gesto explícito → Preserva IG.7

Veredicto: ACEPTAR (con rediseño)
```

---

## V. PLANTILLA DE PROPUESTA

Usar esta plantilla para proponer extensiones:

```markdown
## Propuesta de Extensión

**Característica:** [Nombre]

**Descripción:** [1-2 frases]

**Asignación de Bloque:** [A/B/C/D/E/F/G/JSON]

**Checklist de Invariantes:**
- [ ] No rompe IG.1 (unicidad temporal)
- [ ] No rompe IG.2 (G único stateful)
- [ ] No rompe IG.3 (atemporalidad de C)
- [ ] No rompe IG.4 (validez no booleana)
- [ ] No rompe IG.5 (determinismo)
- [ ] No rompe IG.6 (no coerción)
- [ ] No rompe IG.7 (agencia humana)

**Análisis de Composición:**
[Cómo se compone con gestos existentes]

**Portabilidad:**
- [ ] No requiere infraestructura externa
- [ ] Funciona con git clone → open index.html
- [ ] Sin dependencias en runtime

**Veredicto Propuesto:** ACEPTAR / REDISEÑAR / RECHAZAR
```

---

## VI. CIERRE

La extensibilidad **no es agregar cualquier cosa que funcione**.  
La extensibilidad es **crecer sin traicionar la identidad del sistema**.

Este checklist asegura que el sistema evoluciona **dentro de sus límites filosóficos**.
