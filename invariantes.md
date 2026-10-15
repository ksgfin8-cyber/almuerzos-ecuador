# MAPA DE INVARIANTES DEL SISTEMA

**Sistema de Órdenes de Almuerzo — Versión Canónica**

---

## I. PROPÓSITO DE ESTE DOCUMENTO

Este documento **NO es documentación técnica**.  
Este documento es **parte del contrato del sistema**.

Define propiedades que **deben sobrevivir a cualquier evolución**, cambio de implementación o extensión de funcionalidad.

Si un cambio rompe un invariante, el sistema **deja de ser este sistema**, aunque "funcione".

---

## II. INVARIANTES GLOBALES

### IG.1 — Unicidad de la Fuente Temporal

**Formulación:**
```
∀t ∈ Tiempo, ∃!D: D.obtenerEstado() → EstadoTemporal(t)
```

**Propiedad:**  
El tiempo tiene exactamente **una fuente de verdad**: el Bloque D.

**Qué lo preserva:**
- Solo D ejecuta `new Date()`
- E recibe tiempo como parámetro, nunca lo calcula
- Ningún bloque consulta el reloj del sistema excepto D

**Qué lo puede romper:**
- E calculando hora actual independientemente
- F infiriendo franjas desde timestamps en UI
- B mostrando hora sin pasar por D vía G

**Responsable:** G (como coordinador)

**Tipo:** Ontológico + Epistémico

---

### IG.2 — Unicidad del Estado

**Formulación:**
```
EstadoSistema = G.estado
∀x ∈ {A,B,C,D,E,F}: x no mantiene estado persistente
```

**Propiedad:**  
Solo G mantiene memoria. Todos los demás bloques son funciones puras o renderizadores efímeros.

**Qué lo preserva:**
- C es inmutable (retorna nuevos objetos)
- D es función pura
- E es función pura
- F es función pura
- B solo renderiza desde datos recibidos

**Qué lo puede romper:**
- B guardando selecciones en variables globales
- C mutándose a sí mismo
- E acumulando evaluaciones previas
- F guardando mensajes anteriores

**Responsable:** G

**Tipo:** Ontológico

---

### IG.3 — Atemporalidad de C

**Formulación:**
```
C(pedido) no depende de t
∀t₁, t₂: si pedido₁ = pedido₂ → C(pedido₁) = C(pedido₂)
```

**Propiedad:**  
El pedido no envejece, no expira, no se invalida. C es estructura simbólica pura.

**Qué lo preserva:**
- C no consulta tiempo
- C no contiene timestamps
- C no tiene TTL (time to live)
- C no se autodestruye

**Qué lo puede romper:**
- Agregar `createdAt` o `expiresAt` a C
- C consultando D internamente
- Lógica de "pedido caduco"

**Responsable:** C (diseño interno) + G (coordinación)

**Tipo:** Ontológico + Temporal

---

### IG.4 — No-Booleanidad de la Validez

**Formulación:**
```
Validez ≠ Boolean
Validez: Pedido × Tiempo → (Ejecutabilidad, Motivo, Contexto)
donde Ejecutabilidad ∈ {AHORA, DIFERIDO, NO_EJECUTABLE}
```

**Propiedad:**  
La validez es un **estado semántico complejo**, no un bit.

**Qué lo preserva:**
- E retorna objeto estructurado: `{ejecutabilidad, motivo, despacho, ...}`
- G nunca simplifica a `if (valido)`
- F traduce el estado completo

**Qué lo puede romper:**
- Reducir evaluación a `pedidoValido: true/false`
- UI mostrando solo "✓" o "✗"
- Lógica condicional que ignora `motivo`

**Responsable:** E (emisor) + G (coordinador)

**Tipo:** Ontológico + Ético

---

### IG.5 — Determinismo Fuerte

**Formulación:**
```
∀s₁, s₂ ∈ EstadoSistema:
  s₁ = s₂ ⟹ eval(s₁) = eval(s₂)
```

**Propiedad:**  
Dado el mismo estado del sistema (C + D + política E), el resultado es **siempre idéntico**.

**Qué lo preserva:**
- D es función pura
- E es función pura
- F es función pura
- Sin aleatoriedad
- Sin heurísticas ocultas

**Qué lo puede romper:**
- `Math.random()`
- APIs externas en tiempo real sin modelar en D
- Heurísticas basadas en comportamiento histórico

**Responsable:** Todos los bloques

**Tipo:** Ontológico + Operativo

---

### IG.6 — No Coerción

**Formulación:**
```
∀acción ∈ AccionesUsuario:
  Sistema no induce acción mediante:
    - urgencia artificial
    - castigo emocional
    - optimización de conversión
```

**Propiedad:**  
El sistema **informa**, nunca **persuade**.

**Qué lo preserva:**
- A no usa colores de alarma sin justificación objetiva
- E no genera incentivos persuasivos
- F no usa lenguaje manipulativo
- Sin timers de cuenta regresiva
- Puntos son informativos, no gamificados

**Qué lo puede romper:**
- Mensajes como "¡Última oportunidad!"
- Colores rojos sin estado objetivo
- Descuentos por urgencia
- Notificaciones push no solicitadas

**Responsable:** A (tono) + E (política) + F (lenguaje) + G (UX)

**Tipo:** Ético

---

### IG.7 — Agencia Humana Preservada

**Formulación:**
```
∀acción_crítica ∈ {enviar, guardar, confirmar}:
  requiere gesto_explícito(humano)
```

**Propiedad:**  
El sistema **no actúa en nombre del usuario** sin consentimiento explícito.

**Qué lo preserva:**
- Sin auto-guardado
- Sin auto-envío
- Sin pre-selección "inteligente"
- Sin completado predictivo

**Qué lo puede romper:**
- Guardar pedido en localStorage sin permiso
- Enviar pedido si "parece listo"
- Pre-seleccionar opciones por historial

**Responsable:** G (coordina acciones críticas)

**Tipo:** Ético + Operativo

---

## III. INVARIANTES POR BLOQUE

### Bloque A — Identidad Sensorial

**IA.1 — Vocabulario Emocional**
```
∀clase ∈ A: clase ∉ DominioNegocio
A.vocabulario ⊆ {primario, advertencia, inactivo, alerta, ...}
```

**Invariante:** A nunca contiene `.market-abierto`, `.pedido-valido`, etc.

**IA.2 — Pasividad Semántica**
```
A no interpreta estados, solo los siente
```

**Invariante:** A no sabe qué significa "abierto" vs "cerrado"

---

### Bloque B — Interfaz Humana

**IB.1 — Inmutabilidad del Estado**
```
∀gesto ∈ B: gesto no muta C directamente
B solo emite: callbacks → G
```

**Invariante:** B nunca ejecuta `estado.cantidad = X`

**IB.2 — Ignorancia de Reglas**
```
B no conoce E
B no conoce D
B no conoce F
```

**Invariante:** B solo conoce G a través de callbacks inyectados

**IB.3 — Renderización Pasiva**
```
∀render ∈ B: render(datos_recibidos)
B no consulta estado global
```

**Invariante:** B no lee `Sistema.pedido`, solo recibe datos

---

### Bloque C — Pedido Canónico

**IC.1 — Atemporalidad**
```
C ∩ Tiempo = ∅
```

**Invariante:** C no contiene timestamps, TTL, ni fecha de creación

**IC.2 — Pureza Simbólica**
```
C = {IDs, símbolos, cantidades}
C ∉ {nombres, precios, reglas}
```

**Invariante:** C solo guarda `"A"`, nunca `"Almuerzo A - $5.00"`

**IC.3 — Inmutabilidad Estructural**
```
∀op ∈ OperacionesC: op(C) → C'
C permanece inalterado, retorna nuevo C'
```

**Invariante:** Métodos de C no mutan el objeto original

---

### Bloque D — Tiempo (Axioma)

**ID.1 — Función Pura**
```
D.obtenerEstado() es idempotente en t
∀llamadas en t: mismo output
```

**Invariante:** D no guarda estado entre llamadas

**ID.2 — No Interpretación**
```
D emite hechos, no decisiones
D.franja ≠ "permitido" | "prohibido"
```

**Invariante:** D no dice "válido" o "inválido", solo "franja X"

**ID.3 — Objeto Inmutable**
```
D.obtenerEstado() retorna Object.freeze(...)
```

**Invariante:** El estado temporal no puede mutarse

---

### Bloque E — Reglas Operativas

**IE.1 — Confianza Ciega en D**
```
E(pedido, tiempo) donde tiempo = D.obtenerEstado()
E nunca calcula tiempo
```

**Invariante:** E no ejecuta `new Date()` ni lógica temporal

**IE.2 — No Mutación de C**
```
E recibe C como inmutable
E retorna evaluación, no C modificado
```

**Invariante:** E no altera el pedido

**IE.3 — No Persuasión**
```
E.puntos son informativos
puntos ∉ ejecutabilidad
```

**Invariante:** Los puntos no cambian si algo es ejecutable o no

---

### Bloque F — Traductor

**IF.1 — Independencia del DOM**
```
F no accede a document
F no accede a window (excepto para abrir WhatsApp)
```

**Invariante:** F nunca ejecuta `querySelector`, `getElementById`, etc.

**IF.2 — Traducción Estructural**
```
F(estructura) → mensaje
F no inventa información
```

**Invariante:** Todo lo que F dice está en los datos que recibió

**IF.3 — No Validación**
```
F no decide cuándo se llama
F no valida ejecutabilidad
```

**Invariante:** G decide si F se invoca, F solo traduce

---

### Bloque G — Orquestador

**IG.1 — Único Stateful**
```
Estado global = G.estado
```

**Invariante:** Solo G mantiene variables persistentes

**IG.2 — Coordinador, No Ejecutor**
```
G coordina, no ejecuta dominio
G.procesarSeleccion(id) { C.setSeleccion(...) }
```

**Invariante:** G no reimplementa lógica de C, D, E, F

**IG.3 — Inyección de Callbacks**
```
B recibe callbacks de G
B nunca llama a G directamente
```

**Invariante:** `B → callback → G`, no `B → G.método()`

---

## IV. CLASIFICACIÓN POR TIPO

### Ontológicos (Qué ES el sistema)
- IG.1 — Unicidad temporal
- IG.2 — G único stateful
- IG.3 — Atemporalidad de C
- IG.4 — Validez no booleana

### Epistémicos (Qué puede SABER cada bloque)
- IB.2 — B no conoce E, D, F
- IE.1 — E confía ciegamente en D
- IF.1 — F no accede al DOM
- IC.2 — C solo símbolos

### Temporales (Relación con el tiempo)
- IG.1 — D única fuente
- IC.1 — C atemporal
- ID.2 — D no interpreta

### Éticos (Qué NUNCA debe hacer)
- IG.6 — No coerción
- IG.7 — Agencia humana
- IE.3 — No persuasión

### Operativos (Secuencias y flujos)
- IG.5 — Determinismo
- IB.1 — B no muta
- IG.3 — Callbacks inyectados

---

## V. RELACIÓN CON TEORÍA FORMAL

### Estructura de Categoría

El sistema forma una categoría donde:

**Objetos:** Estados del sistema `(C, D, E_eval, G_estado)`

**Morfismos:** Transiciones de estado via callbacks
```
seleccionar: Estado → Estado
evaluar: (C, D) → Evaluación
```

**Composición:**
```
Usuario → B → G → C → (D,E) → G → B
```

**Identidad:**
```
id_estado: Estado → Estado (sin cambios)
```

**Asociatividad:**
```
(f ∘ g) ∘ h = f ∘ (g ∘ h)
```

---

### Monoide de Gestos

Los gestos forman un monoide:

**Conjunto:** `Gestos = {seleccionar, cantidad+, cantidad-, toggleExtra, reset}`

**Operación:** Composición secuencial `⊕`

**Elemento neutro:** `noop`

**Asociatividad:**
```
(g₁ ⊕ g₂) ⊕ g₃ = g₁ ⊕ (g₂ ⊕ g₃)
```

**Propiedad:**
```
reset ⊕ cualquier_gesto = reset
```

---

### Invariantes Informacionales

**Entropía de C:**
```
H(C) = información mínima para reconstruir pedido
```

**Propiedad:**
```
H(C) es constante entre evaluaciones
Solo gestos humanos aumentan H(C)
```

**No-Leakage:**
```
I(B; E) = 0 (B no filtra información de E)
I(F; DOM) = 0 (F no depende del DOM)
```

---

## VI. CIERRE

Este documento define la **identidad ontológica, epistémica y ética** del sistema.

Cualquier código que viole estos invariantes **no pertenece al sistema**, aunque funcione técnicamente.

Los invariantes sobreviven a:
- Cambios de implementación
- Refactorizaciones
- Extensiones de funcionalidad
- Cambios de tecnología

Si un invariante debe cambiar, **el contrato debe actualizarse conscientemente**.
