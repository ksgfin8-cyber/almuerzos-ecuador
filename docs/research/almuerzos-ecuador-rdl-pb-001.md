# Almuerzos Ecuador · Evaluación del activo tecnológico

**Registro AE-R01 v1 · 21 de noviembre de 2026 · Línea base `d9618be89926e805038ec514326245443cce8707`**

## I. Dictamen ejecutivo

Almuerzos Ecuador implementa un flujo local de captura y representación de pedidos. Convierte gestos en cantidades y extras, obtiene contexto del reloj del dispositivo, calcula una estimación de despacho y prepara un mensaje que entrega al navegador mediante un enlace a WhatsApp. La evidencia respalda conservar como conocimiento reutilizable el esquema simbólico, las transiciones del pedido, la evaluación sobre una instantánea temporal y el patrón de entrega explícita a un canal externo.

La discrepancia con mayor efecto decisional está en esa última frontera. Con una apertura simulada que devolvió `null`, el sistema igualmente registró `ENVIADO` y activó el aviso visual. El aviso de la página dice «Pedido preparado» y contempla que la aplicación externa no abra. La etiqueta interna y el registro de consola ofrecen menos precisión que el aviso. Para una nueva operación que dependa de confirmar recepción, la fiabilidad queda abierta. Otros puntos de gobierno son el significado de `DIFERIDO`, la semántica de las 14:00 y los accesos directos de B al orquestador.

Se justifica continuar la investigación de estos mecanismos y preparar una validación acotada al uso que se elija. La transferencia al contexto receptor queda como propuesta. La ventaja comparativa, el rendimiento, la utilidad económica y el resultado comercial histórico tienen evidencia insuficiente. Las decisiones sobre modificar el producto, invertir en despliegue o operar comercialmente requieren aprobación del propietario.

## A. Admisión y caracterización · M1

| Campo | Resultado |
| --- | --- |
| Candidato y objeto | AE-R01, implementación del sistema de órdenes de Almuerzos Ecuador y sus contratos en la línea base. |
| Identidad Git | El checkout inicial limpio estaba en `30e603dedf6473b6e649924c562d9991ddb556f0`. `git ls-remote --heads origin` y `git fetch origin main` identificaron el SHA solicitado como punta de `main`. La única diferencia entre esos commits fue la incorporación del Playbook. La rama de investigación parte del SHA solicitado. |
| Inventario leído | [Playbook original](../program/RDL-PB-001_v0.1_original_propuesta.md), [invariantes](../../invariantes.md), [criterio de extensión](../../CRITERIO_EXTENSION.md), [HTML](../../index.html), [CSS](../../estilos.css), [catálogo](../../menu.js), [sistema](../../sistema.js). |
| Autoridad | RDL-PB-001 v0.1 rige la investigación. Los otros dos documentos expresan contratos del producto. M1–M7 denominan modos de análisis de esta evaluación. |
| Entradas | Catálogo JavaScript con cinco bases y dos extras, gestos de suma/resta y selección, reloj y zona local, destino configurado o predeterminado, aceptación o cancelación de confirmaciones. |
| Salidas | Estado de pedido en memoria, resumen DOM, estado del mercado, puntos, despacho estimado, texto estructurado y solicitud de apertura externa. |
| Construcción y adaptación | HTML, CSS y scripts clásicos. El menú se edita por catálogo y el destino se guarda en el navegador. La ejecución depende de DOM, JavaScript, reloj, almacenamiento local y, para la entrega externa, permisos y disponibilidad del cliente. No hay aprendizaje ni adaptación automática. |
| Coste y límites | La actualización de una base filtra la lista y la búsqueda usa recorrido lineal. La UI reevalúa las tarjetas y reconstruye el resumen. El mensaje crece con las bases, extras y longitud del catálogo. Tamaño práctico de URL, latencia y carga concurrente quedaron NO EVALUADOS. |

**Antecedente operacional H1.** El propietario declara uso comercial anterior. En la historia alcanzable desde la línea base, `git rev-list --count` contó 43 commits. El inventario histórico de rutas coincide con las siete fuentes. Los asuntos incluyen 24 actualizaciones de menú y 11 de sistema, además de la carga inicial y cambios en otros archivos. El último cambio de menú fue `5a19920` del 26 de febrero de 2026. Son huellas de mantenimiento del artefacto. No se encontraron en ese historial informes de operación, mediciones ni pruebas de ventas. La declaración conserva su condición de antecedente y la utilidad comercial documentada permanece desconocida. El análisis se limitó a metadatos y fuentes del repositorio.

## B. Arquitectura y mecanismos · M1, M3

| Bloque | Responsabilidad efectiva y frontera |
| --- | --- |
| A · Identidad sensorial | CSS de estados y controles. Las clases sensoriales se aplican mediante un mapa situado en B. Referencias: `estilos.css:22–45, 245–292`, `index.html:227–243`. |
| B · Interfaz | Renderiza menú, resumen, puntos y despacho. Emite callbacks de pedido y consulta globalmente los auxiliares de C. Retiene referencias al menú y callbacks. La configuración accede a `Sistema.whatsappNumber` y llama directamente a `Sistema.guardarConfiguracion`. Referencias: `index.html:101–195, 202–335, 341–389`. |
| C · Pedido | `{bases:[{id,cantidad}], extras:[id]}`. La vía de G usa deltas unitarios, acota por abajo y elimina las bases con cantidad cero. Los extras son pertenencia sin cantidad. Actualizar una base la mueve al final. C crea nuevos contenedores para el campo modificado y comparte referencias del resto. Referencias: `sistema.js:11–49, 296–312`. |
| D · Tiempo | Única lectura de hora civil del sistema en el código de aplicación. Unifica franja, día, minutos, puntos y despachos. Usa zona del dispositivo y formato `es-EC`. Escoge el primer despacho estrictamente posterior al minuto actual, con una tabla fija. Referencias: `sistema.js:56–113`. |
| E · Reglas | Lee D y retorna un objeto congelado. Prioriza fin de semana, falta de franja y falta de despacho. La firma acepta C, que el cuerpo no consulta. Puede dar `AHORA` con pedido vacío. La condición de pedido con base vive en B y G. Referencias: `sistema.js:120–166, 345–368`, `index.html:323–335`. |
| F · Traductor | Resuelve IDs con el catálogo. Usa fecha, hora, texto de bases y extras, despacho o advertencia y puntos. Conserva el orden de las listas. Devuelve `null` para pedido sin bases. Referencias: `sistema.js:173–217`. |
| G · Orquestador | Inicializa, retiene la selección y la configuración, actualiza tras gestos y cada minuto, y vuelve a consultar D antes de preparar el envío. Normaliza dos caracteres, codifica el texto e invoca `window.open`. El almacenamiento contiene el destino local y el pedido permanece en memoria. Referencias: `sistema.js:224–425`. |
| Catálogo | Constante JavaScript con IDs, nombres, descripción y detalle del día. Su edición cambia la interpretación de los IDs. La representación es un objeto JS y el comentario de inicialización lo denomina JSON. Referencias: `menu.js:1–59`, `sistema.js:244–246, 283–290`. |

Secuencia principal. El gesto en B llama a G, que aplica una transición de C, toma una instantánea de D, consulta E y devuelve una proyección a B. El gesto de envío reevalúa el contexto. G bloquea el pedido sin base, pide confirmación en contexto cerrado y, si procede, encadena F, codificación y solicitud de apertura. La confirmación humana en el canal externo y la recepción comercial quedan fuera de la observabilidad de esta implementación.

**Derivaciones formales F1–F3.**

- **F1 · Categoría.** Fijado un dominio cerrado de estados válidos y un entorno, las funciones totales `S → S` tienen identidad y composición asociativa. La propuesta mezcla transiciones de estado con `(C,D) → Evaluación`, de codominio distinto, y describe el recorrido de actores como composición. Faltan objetos y flechas tipados para esa lectura. Incluir G completo exige modelar reloj, efectos, fallos y configuración. La asociatividad condicional se deriva para funciones, con conformidad integral AMBIGUA. Fuente: `invariantes.md §V`, `sistema.js:296–339, 345–404`.
- **F2 · Monoide.** Las palabras finitas de gestos parametrizados forman un monoide libre por concatenación con palabra vacía. También se pueden componer los endomorfismos inducidos sobre el pedido válido. La lista de gestos elementales carece de una definición de clausura bajo composición. Con lectura cronológica, `reset ⊕ sumar(A)` produce `A:1` y refuta la absorción escrita. Con lectura funcional de derecha a izquierda, reset aplicado al final sí borra el pedido. El orden debe explicitarse. Dos secuencias con el mismo multiconjunto de bases pueden producir distinto orden del mensaje. Fuente: `invariantes.md §V`, P1.
- **F3 · Información.** Una evaluación deja intacta la selección en la ruta inspeccionada. La «información mínima» y `H(C)` carecen de distribución, codificación o criterio de equivalencia. `I(B;E)=0` carece de variables aleatorias definidas. Para una distribución que da probabilidad positiva a dos estados de mercado distinguibles, el indicador calculado en B revela cuál ocurrió. La lectura informal de independencia de datos queda contradicha. La ausencia de una llamada a E desde B sí es verificable por inspección. F carece de acceso directo al DOM, con dependencia estadística indeterminada porque sus entradas pueden provenir de gestos. Fuente: `invariantes.md §V`, `index.html:202–243`, `sistema.js:173–217`.

## C. Matriz de propiedades · M2

Todas las filas se refieren a AE-R01. Los alcances experimentales remiten a D. «Contraria» indica dirección de evidencia según §11 y se aplica a la proposición concreta de la fila.

| ID | Propiedad especificada o reclamada | Implementación, evidencia y alcance | Decisión sensible |
| --- | --- | --- | --- |
| C1 | IG.1, ID.2–3, IE.1 · Una lectura civil y evaluación separada | VERIFICADO por inspección y P1 para el código estudiado. D devuelve un objeto congelado y E consume la instantánea. D incorpora puntos y tabla de despacho. La frontera entre hecho temporal y política de calendario necesita interpretación. | Transferir D/E. |
| C2 | IG.2, IG.3 de G, IB.1–3 · Estado exclusivo y callbacks | Favorable para selección administrada por G y gestos de pedido. Contraria para la frontera estricta de administración: B lee y llama a G directamente. B retiene menú y callbacks. «Persistente» es AMBIGUO entre almacenamiento duradero, autoridad del pedido y memoria durante la página. `index.html:101–113, 245–268, 341–389`. | Validar conformidad. |
| C3 | IG.3, IC.1–3 · Pedido simbólico, atemporal e inmutable | VERIFICADO para forma y ausencia de mutación directa en el alcance normal, por inspección y P1. La copia superficial carece de garantía frente a modificación por alias. Los métodos aceptan entradas programáticas fuera del catálogo sin validación de esquema. `sistema.js:11–49`. | Transferir C. |
| C4 | IG.4 · Evaluación estructurada y vocabulario de tres estados | VERIFICADO para estructura y motivos en P1. Solo son alcanzables `AHORA` y `NO_EJECUTABLE` según las asignaciones. La exigencia de que `DIFERIDO` sea alcanzable es AMBIGUA. `sistema.js:120–166`. | Validar política. |
| C5 | IG.5, ID.1, IE.2 · Determinismo y pureza | P1 verifica igualdad con entradas fijadas. La lectura ambiental del reloj impide pureza referencial de D con firma sin argumentos. D es repetible a instante y entorno fijos. E ignora C y F depende de catálogo, orden y textos de tiempo, además de C y E. `sistema.js:56–110, 120–216`. | Transferir evaluador y traductor. |
| C6 | IG.6, IE.3, IA.1–2 · Pasividad y no coerción | Inspección favorable a pasividad de CSS y ausencia de puntos en el predicado de E. Se muestran puntos de franja incluso para sábado temprano en P1. El efecto persuasivo sobre personas queda NO EVALUADO. `estilos.css:22–45, 254–263`, `index.html:310–321`. | Validar interacción si importa al uso. |
| C7 | IG.7 · Agencia ante acciones críticas | P1 verifica ausencia de efectos de apertura al iniciar, al hacer tick y al cancelar, y apertura solicitada tras aceptación en ruta cerrada. La UI pide gesto para abrir o guardar según inspección. No hay garantía de procedencia humana en invocaciones programáticas. Efectividad de consentimiento real NO EVALUADA. | Validar entrega. |
| C8 | IF.1–3 · Traducción sin DOM ni validación operativa | VERIFICADO por inspección y P1 para transformación estructural. El texto fijo «Enviado desde la app» se genera antes del intento de apertura. «Fuera de horario regular» agrupa distintos motivos sin despacho y pierde precisión causal. `sistema.js:173–217`. | Transferir traducción y definir fidelidad. |
| C9 | Criterio de extensión §II.5 · Portabilidad estática | Aplicación sin compilación ni dependencias de paquetes. P2 verifica carga HTTP local. La apertura como archivo quedó sin evidencia del producto por bloqueo administrativo. La inicialización requiere acceso a almacenamiento local y la entrega requiere el canal externo. `sistema.js:240–289, 394–395`. | Continuar o validar en cliente receptor. |
| C10 | Efecto externo y confirmación | OBSERVADO en P1: `window.open → null` seguido de `ENVIADO` y aviso. Evidencia contraria a interpretar ese estado como apertura comprobada. Entrega y recepción reales NO EVALUADAS. `sistema.js:389–404`, `index.html:62–65`. | Validar integración antes de depender de confirmación. |

## D. Preguntas, protocolos y ejecuciones · M4

La selección siguió la escalera del §7. Se empezó por contratos y código, con un presupuesto limitado a dos pasadas de la matriz de reloj y gestos en Node y una carga local en Chromium. La campaña termina al obtener una salida identificable por protocolo o registrar su fallo. Los dobles se limitan a reloj, almacenamiento, temporizador, diálogos y apertura. Ningún caso requiere consultar WhatsApp, contactar un número ni escribir datos de producción.

| Pregunta | Hipótesis y criterio de discriminación | Instrumento y evidencia | Estado |
| --- | --- | --- | --- |
| Q1 · ¿Cómo cambia el despacho en bordes relevantes? | Se espera tabla de franjas con despacho estrictamente posterior y prioridad de fin de semana. Una divergencia en motivo, franja o despacho debilita la lectura. | P1-R1/R2, matriz de once instantes. Comparación adicional de E con C vacío y con A:1, y congelación de D/E. | VERIFICADO dentro de la matriz. Relevante para validar semántica horaria. |
| Q2 · ¿El tiempo altera el pedido y qué conserva la traducción? | Un tick cambia la evaluación y deja la selección intacta. La traducción conserva cantidades, orden y extras. La absorción cronológica de reset falla si se recupera A:1 al sumar después. | P1-R1/R2, traza discreta y comprobaciones del mensaje. | Favorable para transición y traducción. Contraria para absorción cronológica. Relevante para transferir C/F. |
| Q3 · ¿Qué confirma el estado G tras la entrega? | El control negativo cancela y no abre. Ante retorno nulo, un estado posterior `ENVIADO` delimita la semántica observable. | P1-R1/R2, captura de llamadas y retorno nulo. | OBSERVADO y repetido en doble. Relevante para validar integración. |
| Q4 · ¿La entrada estática inicializa desde archivo? | En un perfil limpio deben materializarse cinco bases y dos extras en `file://`. | P2-R1, inspección del DOM. | INCONCLUSO para archivo por limitación instrumental. El control HTTP verifica la carga estática. Relevante para portabilidad. |
| Q5 · ¿Hay evidencia suficiente de valor histórico o transferencia? | Se necesita, respectivamente, un registro operacional atribuible y una aplicación en un receptor definido. | H1 y análisis de compatibilidad F. | Insuficiente. Relevante para inversión y transferencia. |

**P1 v1 · R1 y R2.** Node v24.22.3 en Linux. Código leído de objetos Git, `TZ=America/Guayaquil`, reloj fijado, catálogo del commit, almacenamiento de prueba que devuelve `000`, temporizador capturado y apertura simulada. Fecha de ejecución 21 de noviembre de 2026. Las dos ejecuciones pasaron las aserciones y sus salidas coincidieron byte a byte. Se comprobó repetibilidad en la misma implementación e instrumento. Los estados de mercado se deducen del motivo y la franja según E.

| Fecha local | Hora | Franja | Motivo | Despacho | Puntos |
| --- | --- | --- | --- | --- | --- |
| Lun 19-01-2026 | 06:59 | — | FUERA_DE_HORARIO | — | 0 |
| Lun 19-01-2026 | 07:00 | TEMPRANO | — | 12:00 | 3 |
| Lun 19-01-2026 | 10:59 | TEMPRANO | — | 12:00 | 3 |
| Lun 19-01-2026 | 11:00 | NORMAL | — | 12:00 | 1 |
| Lun 19-01-2026 | 11:59 | NORMAL | — | 12:00 | 1 |
| Lun 19-01-2026 | 12:00 | TARDIO | — | 12:30 | 0 |
| Lun 19-01-2026 | 13:59 | TARDIO | — | 14:00 | 0 |
| Lun 19-01-2026 | 14:00 | TARDIO | SIN_DESPACHO | — | 0 |
| Lun 19-01-2026 | 14:01 | — | FUERA_DE_HORARIO | — | 0 |
| Sáb 17-01-2026 | 09:00 | TEMPRANO | FIN_DE_SEMANA | — | 3 |
| Dom 18-01-2026 | 15:00 | — | FIN_DE_SEMANA | — | 0 |

En la matriz, motivo ausente corresponde a `AHORA` y motivo presente a `NO_EJECUTABLE`. Los retornos de D y E quedaron congelados. En G, el inicio terminó en `LISTO`. Envío vacío produjo un aviso y restar desde cero dejó el pedido vacío. Sumar A, B, A y seleccionar JUGO dejó B:1, A:2, JUGO. Con hora abierta F produjo un texto repetible con esa secuencia, detalle, despacho 12:00 y tres puntos. Al mover el reloj a 14:00 y disparar el tick, G conservó la referencia de pedido y cambió el motivo a `SIN_DESPACHO`. Cancelar produjo cero aperturas. Aceptar produjo una llamada a apertura, la respuesta nula, estado `ENVIADO` y aviso. La URL capturada tenía origen `wa.me`, ruta ficticia `/000`, destino `_blank` y texto decodificable con el pedido y nota horaria. Se comprobó ausencia de los dos caracteres que normaliza G. Tras reset y suma, A quedó en uno.

**P2 v1 · R1–R3.** Chromium 156.0.8078.79 en Linux, modo headless, perfiles temporales, mismo árbol base. R1 con volcado DOM no entregó un resultado utilizable. R2 con DevTools obtuvo `["chrome-error:",0,0,null]`. R3 registró `Page.navigate.errorText = net::ERR_BLOCKED_BY_ADMINISTRATOR` para `file://…/index.html`. En el mismo perfil R3 navegó por HTTP loopback con Python 3 y `Runtime.evaluate` devolvió `["http:",5,2,"LISTO"]`. El bloqueo precede a la ejecución de la aplicación. El control confirma carga, scripts e inicialización vía HTTP, con evidencia insuficiente sobre el contrato de apertura directa. Para reproducir, iniciar `python3 -m http.server 18765 --bind 127.0.0.1` desde la línea base, usar `Page.navigate` con cada origen y consultar `location.protocol`, el número de elementos `.opcion-card` y `.extra-card`, y `Sistema.estado`. Se observaron solo DOM e inicialización, sin accionar botones de apertura externa.

## E. Evaluación de evidencia y límites · §§10–12 y 19

- **Favorable.** C1, C3, C4 y C8 tienen fuentes estáticas y resultados de ejecución pertinentes. P1 controla el reloj y aísla efectos, por lo que discrimina ramas y transiciones del código de forma directa. Las dos pasadas comparten implementación, datos, protocolo y condiciones. P2 usa otro motor y observa una capa distinta del mismo producto, con suficiencia para arranque HTTP en ese motor.
- **Contraria.** La configuración de B contradice la regla estricta de callbacks del contrato. P1 refuta absorción de reset en orden cronológico. La apertura nula seguida de `ENVIADO` contradice la interpretación de ese estado como apertura confirmada. El código y el resultado muestran el punto causal en G, que pasa a `ENVIADO` tras la llamada sin consultar su retorno.
- **Ambigua.** La fuente temporal es única en el código, pero «pura» admite una lectura de ausencia de memoria y una lectura referencial. La tabla de despachos está en D pese a que el contrato le atribuye hechos temporales y asigna la decisión a E. La etiqueta `NO_EJECUTABLE` coexiste con una entrega permitida por confirmación. Puede expresar falta de despacho inmediato o prohibición de proceder. El código toma la primera lectura operacional. El Playbook §2.1 exige elevar el conflicto documental. La resolución propuesta es que el propietario precise la autoridad sobre el calendario, el dominio de `DIFERIDO`, la semántica de estados y el significado de «persistente» antes de emitir conformidad.
- **Insuficiente.** La portabilidad desde archivo quedó limitada por el instrumento. Entrega y recepción externas, navegación móvil, cambios de zona, perfiles con almacenamiento denegado, carga, límites de URL, entradas anómalas extensas, accesibilidad y efecto sobre personas quedaron NO EVALUADOS. No se evaluaron ventas, fiabilidad comercial, ventaja competitiva ni productividad.
- **NO APLICABLE.** Validación de aprendizaje, rendimiento de un backend propio y consistencia de transacciones internas. El objeto contiene una política fija, estado local y una solicitud de apertura, sin esos subsistemas.

## F. Capacidades recuperables · M6

| Activo y problema que resuelve | Especificidad, condiciones y adaptación | Evidencia actual y revalidación |
| --- | --- | --- |
| Modelo simbólico C y gestos que construyen una intención revisable | IDs de catálogo, cantidades por base y extras binarios responden al menú. Requiere IDs definidos y equivalencia de estados por aclarar. Otro dominio puede requerir validación de tipos, multiplicidades, orden canónico y representación de opciones dependientes. | P1 verifica una trayectoria y el límite inferior. Revalidar clausura, normalización, composición, alias y límites del receptor. |
| Instantánea temporal D y evaluador E que separan observación de decisión | Las franjas, puntos, fines de semana y despacho son locales al negocio. Exige reloj, zona y política explícitos. Adaptar calendario, feriados, semántica de ventanas y motivos. | P1 verifica los bordes seleccionados. Revalidar zonas, cambios de fecha y horario, fronteras y las clases alcanzables. |
| Traductor F que convierte selección a un mensaje revisable | Vocabulario, formato, emoji y marca de tiempo son propios del canal y catálogo. La entrada exige correspondencia íntegra de IDs. Adaptar formato, tratamiento de valores y codificación. | P1 verifica texto repetible, cantidad, orden y codificación simulada. Revalidar fidelidad semántica, caracteres, tamaño y compatibilidad del canal receptor. |
| Orquestación G y gesto de entrega que coordinan efectos | Los temporizadores, diálogos y apertura dependen del navegador. Otro receptor debe definir qué cuenta como intento, apertura, aceptación o entrega y qué hacer al cancelar. | P1 verifica rutas de confirmación y revela el falso indicador de apertura si se interpreta `ENVIADO` como tal. Revalidar rutas abierta/cerrada, cancelación, almacenamiento y semántica de cada efecto. |
| Interfaz B y ejecución estática que permiten edición local sin cadena de compilación | Requiere DOM, almacenamiento y un catálogo confiable. Adaptar etiquetas, interacción y control de dependencias según cliente. | P2 verifica HTTP local. Revalidar protocolo de origen, permisos, navegadores, accesibilidad y escenarios de error. |
| Protocolo de reloj, gestos y dobles incorporado al informe | Útil para sistemas con efectos discretos, entorno sustituible y línea base fija. Requiere adaptar entradas, controles y criterios. | Repetibilidad local. Revalidar en un candidato diferente y medir esfuerzo y poder discriminativo antes de alegar mejora. |

Estos activos tienen transferencia **propuesta** según §12.3. Falta un receptor y evidencia de aplicación.

## G. Evaluación decisional · M5

| Decisión del §13 | Aplicabilidad y estado | Fundamento, coste y condición |
| --- | --- | --- |
| Continuar | Compatible y respaldada para conservar conocimiento y delimitar el siguiente estudio. Cierre técnico recomendado de esta caracterización. | G0 y G1 tienen propósito y ejecución pertinente. El coste siguiente depende del caso de uso. El estado actual justifica estudiar los componentes locales. |
| Validar | Recomendada y condicionada. | Antes de usar la integración como indicador de recepción, fijar la semántica requerida y validar primero en cliente simulado. Validación real requiere aprobación expresa, entorno autorizado y criterios de éxito. La evidencia actual solo sostiene parte de G3. |
| Ampliar investigación | Condicionada a una decisión receptora u operacional. | Priorizar semántica temporal y de entrega por su efecto en operación. Repetir apertura como archivo con un instrumento autorizado si es criterio del uso previsto. La validación histórica requeriría evidencia agregada pertinente y permitida. |
| Transferir | Compatible como posibilidad. Aplicación y autorización pendientes. | G4 sin evidencia en receptor. Adaptar C/E/F aisladamente tiene menos dependencias que trasladar toda la interfaz y la entrega. Revalidar con datos y reglas del receptor. |
| Corregir | Contemplada. Requiere decisión del propietario. | C2 y C10 identifican puntos modificables. El coste y la prioridad dependen del contrato resuelto y la necesidad de confirmar entrega. La investigación queda cerrada con diagnóstico y propuesta de validación. |
| Suspender por limitación instrumental o cerrar como inconcluso | Aplicable de forma acotada a apertura por archivo y a valor histórico cuantificable, respectivamente. | P2 identifica el control faltante para archivo. Git y la declaración no aportan medidas operacionales. |
| Archivar por prioridad | Alternativa condicionada a que no haya receptor ni necesidad de operación. | Conservar el informe reduce pérdida de conocimiento y evita ampliar ensayos sin una decisión a la que servir. |
| Descartar por incumplimiento o por evidencia contraria | Evidencia insuficiente para descartar el activo completo. | Los contraejemplos afectan afirmaciones concretas. Para rechazar bajo un uso específico, se necesita el requisito aplicable y su criticidad confirmada. |

G2 carece de comparador para ventaja. G5 carece de datos de beneficio, costes de mantenimiento y riesgo operacional suficientes. No se autoriza inversión ni despliegue con este dictamen. Se justifica reabrir si se identifica un receptor, se precisa un requisito crítico o aparece evidencia operacional pertinente.

## H. Aprendizaje metodológico · M7

La lectura estática delimitó el grafo de responsabilidades, los estados alcanzables y el significado de las fronteras de dependencia. La derivación formal separó la composición de funciones del relato de interacción. Las pruebas computacionales discriminaron minuto límite, orden de gestos, estabilidad del pedido y resultado de apertura nula. El control HTTP permitió atribuir el caso de archivo al instrumento. Los contratos aportaron criterios de contraste, con ambigüedades localizadas que modifican decisiones. La historia Git aportó procedencia y evolución, con alcance insuficiente para reconstruir operación.

El método transferible consiste en fijar versión e inventario, vincular cada afirmación a una decisión, localizar primero por inspección, elegir casos de borde que discriminen y registrar el efecto justo donde cruza la frontera externa. El registro conserva preguntas, métodos, datos, dirección y alcance de evidencia, control y condiciones de reapertura. La comparación entre dominios, una réplica independiente y cualquier mejora de productividad quedan pendientes.

**Cierre §19.2 y §23.** La caracterización queda concluida dentro de la línea base y los instrumentos descritos. Las afirmaciones abiertas se conservan junto a sus límites y las condiciones para reabrirlas. Los hallazgos documentales y técnicos se elevan al propietario para resolver su alcance contractual y decidir eventuales nuevas autorizaciones.

## Apéndice · Instrumento P1 v1

Extraer el bloque a un archivo temporal `check.cjs` y ejecutar desde el repositorio con `TZ=America/Guayaquil node /ruta/temporal/check.cjs`. El programa lee la línea base por Git y captura la apertura como llamada local.

```js
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const base = 'd9618be89926e805038ec514326245443cce8707';
const read = name => execFileSync('git', ['show', base + ':' + name], {encoding: 'utf8'});
const plain = v => JSON.parse(JSON.stringify(v));
async function run() {
  let instant, accept = false;
  const events = [];
  const c = vm.createContext({
    module: {exports: {}},
    Date: class extends Date { constructor() { super(instant); } },
    console: {log(){}, error(e){events.push(['error', String(e)]);}},
    localStorage: {getItem: () => '000', setItem: (...args) => events.push(['storage', ...args])},
    window: {open: (...args) => { events.push(['open', ...args]); return null; }},
    confirm: () => { events.push(['confirm']); return accept; },
    alert: () => events.push(['alert']),
    setInterval: (fn, ms) => {c.tick = fn; assert.equal(ms, 60000);},
    mostrarMensajeConfirmacion: () => events.push(['feedback'])
  });
  for (const f of ['menu.js', 'sistema.js']) vm.runInContext(read(f), c, {filename: f});
  const {Sistema: g, Pedido: p, Tiempo: d, Reglas: e, Traductor: f} = c.module.exports;
  const cases = [
    ['2026-01-19T06:59:00-05:00',null,'FUERA_DE_HORARIO',null,0],
    ['2026-01-19T07:00:00-05:00','TEMPRANO',null,'12:00',3],
    ['2026-01-19T10:59:00-05:00','TEMPRANO',null,'12:00',3],
    ['2026-01-19T11:00:00-05:00','NORMAL',null,'12:00',1],
    ['2026-01-19T11:59:00-05:00','NORMAL',null,'12:00',1],
    ['2026-01-19T12:00:00-05:00','TARDIO',null,'12:30',0],
    ['2026-01-19T13:59:00-05:00','TARDIO',null,'14:00',0],
    ['2026-01-19T14:00:00-05:00','TARDIO','SIN_DESPACHO',null,0],
    ['2026-01-19T14:01:00-05:00',null,'FUERA_DE_HORARIO',null,0],
    ['2026-01-17T09:00:00-05:00','TEMPRANO','FIN_DE_SEMANA',null,3],
    ['2026-01-18T15:00:00-05:00',null,'FIN_DE_SEMANA',null,0]
  ];
  for (const [t, franja, motivo, despacho, puntos] of cases) {
    instant = t;
    const time = d.obtenerEstado();
    const empty = p.reset();
    const result = e.evaluar(empty, time);
    const actual = [time.franja, result.motivo, result.despachoAsignado, result.puntos];
    assert.deepEqual(actual, [franja, motivo, despacho, puntos]);
    assert.equal(result.ejecutabilidad, motivo ? 'NO_EJECUTABLE' : 'AHORA');
    assert.deepEqual(plain(result), plain(e.evaluar(p.setBase(empty,'A',1),time)));
    assert.deepEqual(plain(time),plain(d.obtenerEstado()));
    assert.ok(Object.isFrozen(time) && Object.isFrozen(result));
    console.log('T', t, JSON.stringify(actual), result.ejecutabilidad);
  }
  instant = cases[1][0];
  await g.iniciar();
  assert.equal(g.estado, 'LISTO');
  assert.deepEqual(events, []);
  g.enviarPedido();
  assert.deepEqual(events.splice(0), [['alert']]);
  g.ajustarBase('A',-1);
  assert.equal(g.pedido.bases.length,0);
  const initial = g.pedido;
  g.ajustarBase('A',1);
  g.ajustarBase('B',1);
  g.ajustarBase('A',1);
  g.toggleExtra('JUGO');
  assert.deepEqual(plain(initial), {bases:[],extras:[]});
  assert.deepEqual(plain(g.pedido),{bases:[{id:'B',cantidad:1},{id:'A',cantidad:2}],extras:['JUGO']});
  const snapshot = g.pedido;
  const text = f.generarMensaje(snapshot,g.evaluacion,g.tiempo,g.menu);
  assert.equal(text,f.generarMensaje(snapshot,g.evaluacion,g.tiempo,g.menu));
  assert.match(text,/1 × .*Almuerzo B — Churrasco[\s\S]*2 × .*Almuerzo A[\s\S]*Jugo[\s\S]*12:00[\s\S]*Puntos:\* 3/);
  instant = cases[7][0];
  c.tick();
  assert.equal(g.pedido,snapshot);
  assert.equal(g.evaluacion.motivo,'SIN_DESPACHO');
  g.enviarPedido();
  assert.deepEqual(events.splice(0),[['confirm']]);
  accept = true;
  g.enviarPedido();
  assert.deepEqual(events.map(x=>x[0]), ['confirm','open','feedback']);
  const url = new URL(events[1][1]);
  assert.equal(url.origin,'https://wa.me');
  assert.equal(url.pathname,'/000');
  assert.equal(events[1][2],'_blank');
  const message = url.searchParams.get('text');
  assert.match(message,/Churrasco[\s\S]*Jugo[\s\S]*fuera de horario/);
  assert.ok(!/[\u00a0━]/u.test(message));
  assert.equal(g.estado,'ENVIADO');
  assert.equal(g.pedido,snapshot);
  g.resetearPedido();
  g.ajustarBase('A',1);
  assert.equal(p.getCantidadBase(g.pedido,'A'),1);
  console.log('G LISTO, vacío bloqueado, orden B/A y JUGO, tick sin mutación; cancelar=0 aperturas; aceptar=1 intento nulo y ENVIADO; reset→sumar=A:1');
}
run().catch(error=>{console.error(error); process.exitCode=1;});
```
