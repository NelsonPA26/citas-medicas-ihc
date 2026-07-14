---
name: universal-system-ux
description: Diseña, implementa, refactoriza o audita interfaces de sistemas web, móviles y de escritorio con diseño centrado en el usuario, usabilidad, factores humanos, accesibilidad WCAG 2.2 AA, prototipado y evaluación. Úsala al crear pantallas, flujos, formularios, navegación, componentes, dashboards, mensajes, estados, iconografía o pruebas UX. No la actives para cambios exclusivamente backend sin impacto en personas usuarias.
---

# Universal System UX

## Misión

Construye sistemas interactivos que permitan a personas reales completar tareas reales con eficacia, eficiencia, seguridad, accesibilidad y satisfacción. No trates la interfaz como decoración añadida al final: analiza usuarios, tareas y contexto antes de decidir estructura, interacción o apariencia.

## Prioridad de decisiones

Cuando existan reglas en conflicto, aplica este orden:

1. Seguridad de las personas, integridad de datos, requisitos legales y reglas críticas del dominio.
2. Accesibilidad verificable y ausencia de barreras.
3. Necesidades, tareas, contexto y evidencia obtenida de usuarios representativos.
4. Convenciones de la plataforma, sistema de diseño y consistencia del producto existente.
5. Principios de usabilidad, factores humanos y resultados de evaluación.
6. Preferencias estéticas.

No presentes una preferencia visual como si fuera una obligación universal. Las cifras históricas o reglas rígidas de los materiales se consideran heurísticas contextuales, no leyes, cuando contradigan estándares actuales, evidencia del producto o convenciones modernas.

## Regla de activación

Activa esta skill cuando la tarea afecte cualquier punto de contacto con el usuario: interfaz, navegación, búsqueda, formulario, dashboard, flujo, mensaje, notificación, icono, tabla, visualización, autenticación, permisos, error, carga, vacío, ayuda, responsive, accesibilidad o experiencia de uso.

Para una corrección pequeña, aplica solo las reglas relevantes y evita rediseñar zonas no solicitadas. Para una pantalla, módulo o sistema nuevo, ejecuta el flujo completo.

## Flujo obligatorio

### 1. Inspeccionar antes de modificar

- Examina la estructura del repositorio, stack, rutas, componentes, estilos, sistema de diseño, convenciones y pruebas existentes.
- Reutiliza componentes y patrones válidos antes de crear variantes.
- Identifica los flujos afectados, roles, permisos, estados de datos y consecuencias de la acción.
- No cambies comportamiento funcional confirmado sin explicar la razón y verificar impacto.

### 2. Crear un breve contexto de uso

Antes de diseñar una experiencia nueva o modificar un flujo importante, determina y registra:

- usuarios y roles;
- objetivos principales;
- tareas frecuentes, críticas e infrecuentes;
- conocimientos, experiencia y vocabulario del dominio;
- capacidades físicas, sensoriales y cognitivas relevantes;
- dispositivo, tamaño de pantalla, conectividad y entorno físico/social;
- datos sensibles, riesgos y acciones irreversibles;
- criterios de éxito medibles.

Usa [assets/context-brief-template.md](assets/context-brief-template.md). Pregunta solo por información realmente bloqueante. Cuando puedas continuar con una inferencia segura, declárala como supuesto verificable.

### 3. Modelar tareas y arquitectura de información

- Describe primero la intención del usuario y la responsabilidad del sistema; evita fijar prematuramente detalles visuales.
- Para cada flujo incluye: actor, objetivo, precondiciones, disparador, camino principal, alternativas, errores, recuperación y poscondición.
- Organiza navegación y contenidos según tareas y modelos mentales del usuario, no según tablas de base de datos ni estructura interna del código.
- Mantén rutas principales cortas, comprensibles y reversibles.
- En tareas complejas usa análisis jerárquico para dividir objetivos en subtareas sin trasladar esa complejidad al usuario.

Consulta [references/01-context-and-task-analysis.md](references/01-context-and-task-analysis.md).

### 4. Elegir interacción y representación

- Emplea lenguaje, objetos, acciones y metáforas familiares al dominio cuando reduzcan aprendizaje.
- No uses una metáfora solo por decoración ni cuando induzca una acción equivocada.
- Mantén correspondencia clara entre control y resultado.
- Prefiere reconocimiento a recuerdo: opciones visibles, historial, valores anteriores, sugerencias y contexto persistente.
- Ofrece caminos simples para personas novatas y aceleradores no intrusivos para personas expertas.

### 5. Prototipar según la incertidumbre

- Usa baja fidelidad para validar estructura, secuencia y comprensión.
- Usa alta fidelidad o código cuando debas comprobar interacción, responsive, contenido, accesibilidad o rendimiento percibido.
- Elige prototipo horizontal para explorar amplitud del sistema y vertical para probar profundamente una tarea crítica.
- Declara si el prototipo es descartable o evolutivo. Si evolucionará a producción, no sacrifiques arquitectura, seguridad, accesibilidad ni calidad de código.
- Trata el prototipo como una hipótesis que debe evaluarse, no como aprobación automática.

### 6. Implementar todos los estados

Todo componente interactivo debe contemplar, cuando aplique:

- reposo;
- hover sin depender de él;
- foco visible;
- activo/seleccionado;
- deshabilitado con motivo comprensible;
- carga/progreso;
- vacío;
- éxito;
- advertencia;
- error y recuperación;
- sin permisos;
- sin conexión o fallo del servicio.

Nunca dejes una acción sin respuesta visible. La retroalimentación debe aparecer cerca de la acción o resultado, ser oportuna y no bloquear innecesariamente.

### 7. Aplicar los diez principios obligatorios

1. **Visibilidad del estado:** mostrar qué ocurre, qué cambió, qué está seleccionado y cuánto falta cuando exista espera apreciable.
2. **Correspondencia con el mundo real:** usar vocabulario del usuario, orden natural y convenciones del dominio.
3. **Control y libertad:** permitir cancelar, volver, corregir y deshacer cuando sea viable.
4. **Consistencia y estándares:** mismos conceptos, nombres, componentes y comportamientos para lo mismo.
5. **Prevención de errores:** restricciones, formatos, valores por defecto seguros y confirmación solo cuando el riesgo lo justifique.
6. **Reconocimiento antes que recuerdo:** mantener visibles contexto, opciones e información necesaria.
7. **Flexibilidad y eficiencia:** atajos, autocompletado, reutilización de datos y personalización sin complicar el camino básico.
8. **Diseño estético y minimalista:** mostrar lo necesario, con jerarquía clara y sin competir con contenido crítico.
9. **Reconocimiento, diagnóstico y recuperación de errores:** explicar qué pasó, dónde, por qué y cómo resolverlo, sin culpar al usuario.
10. **Ayuda y documentación:** ayuda breve, buscable, contextual, orientada a tareas y coherente con la interfaz.

Para una auditoría completa, usa [references/03-heuristic-audit-expanded.md](references/03-heuristic-audit-expanded.md).

### 8. Respetar factores humanos

- Reduce carga de memoria operativa mediante agrupación, secuencias claras y divulgación progresiva.
- Conserva contexto entre pasos y evita pedir datos que el sistema ya conoce.
- Usa jerarquía visual, proximidad, alineación, similitud y espacios para expresar relaciones.
- No dependas solo de color, sonido, movimiento, forma o posición para transmitir significado.
- Evita texto en mayúsculas sostenidas, párrafos densos, jerga técnica y ambigüedad.
- Mantén objetivos táctiles y controles suficientemente grandes y separados.
- No uses animación que distraiga, provoque malestar o impida actuar; respeta preferencias de movimiento reducido.
- El sonido debe ser complementario, controlable y nunca el único canal de una alerta.

Consulta [references/02-human-factors-and-interface-design.md](references/02-human-factors-and-interface-design.md).

### 9. Cumplir accesibilidad

Para web, apunta como mínimo a **WCAG 2.2 nivel AA**. Para aplicaciones nativas o documentos interactivos, aplica los mismos principios mediante la guía WCAG2ICT y convenciones de accesibilidad de la plataforma.

Reglas mínimas:

- HTML semántico y controles nativos antes que ARIA personalizada.
- Nombre, rol, estado y valor accesibles para todo control.
- Operación completa por teclado, orden de foco lógico, foco visible y no oculto.
- Etiquetas persistentes para campos; placeholder no sustituye label.
- Errores identificados en texto, asociados al campo y anunciados cuando corresponda.
- No comunicar información solo con color.
- Contraste verificable, zoom/reflow y diseño responsive.
- Texto alternativo útil; subtítulos y transcripción para multimedia relevante.
- Autenticación compatible con gestores de contraseñas, pegado y ayudas cognitivas.
- Áreas táctiles adecuadas y alternativas a gestos complejos o arrastre.
- Idioma, títulos, encabezados y landmarks correctos.

Ejecuta la lista de [references/04-accessibility-wcag22.md](references/04-accessibility-wcag22.md) antes de declarar una interfaz terminada.

### 10. Usar patrones de interacción responsables

- **Éxito:** usa estado en línea, toast o confirmación no bloqueante. No abras un modal de éxito para cada operación rutinaria.
- **Acción destructiva:** confirma cuando sea irreversible, difícil de recuperar o de gran alcance; describe el objeto y consecuencia. Prefiere deshacer cuando sea seguro.
- **Formulario:** agrupa por significado, muestra requisitos antes del envío, valida en el momento adecuado y conserva datos tras errores.
- **Botón:** usa verbo específico orientado a la acción; evita “Aceptar” o “Continuar” cuando pueda indicarse “Guardar paciente” o “Enviar solicitud”.
- **Icono:** acompáñalo con texto si su significado no es universal o la acción es crítica. Mantén una única metáfora para una misma acción.
- **Modal:** úsalo solo cuando la tarea requiere atención o decisión antes de continuar; incluye título, foco inicial correcto, cierre por teclado y retorno de foco.
- **Carga:** muestra progreso y evita dobles envíos. En operaciones largas explica qué se está procesando.
- **Tabla:** ofrece encabezados, orden, filtros y acciones comprensibles; en pantallas pequeñas no reduzcas ilegiblemente el contenido.
- **Permisos:** diferencia claramente “no existe”, “no tienes acceso” y “no está disponible”.

Consulta [references/06-component-patterns.md](references/06-component-patterns.md).

### 11. Evaluar durante todo el ciclo

No esperes al final. Selecciona métodos según etapa y riesgo:

- requisitos: observación contextual, entrevistas, card sorting, análisis de tareas;
- diseño temprano: prototipos, recorrido cognitivo, evaluación heurística;
- implementación: pruebas de tareas, pensamiento en voz alta, inspección de estándares y accesibilidad;
- despliegue: métricas, registros de uso respetuosos con privacidad, soporte, encuestas y pruebas de regresión.

En evaluaciones heurísticas importantes:

- usa preferentemente entre 3 y 5 evaluadores con revisiones independientes;
- consolida hallazgos después de las revisiones individuales;
- asigna severidad de 0 a 4 y frecuencia de 0 a 4;
- calcula criticidad base como `severidad + frecuencia`;
- eleva automáticamente problemas de seguridad, pérdida de datos, bloqueo de tarea crítica y accesibilidad grave.

En pruebas con usuarios:

- recluta personas representativas de los segmentos relevantes;
- evalúa tareas, no opiniones abstractas;
- evita guiar o defender el diseño;
- registra éxito, tiempo, errores, ayudas, abandonos y comentarios;
- separa lo observado de la interpretación;
- protege consentimiento, privacidad y datos personales.

Consulta [references/05-prototyping-and-evaluation.md](references/05-prototyping-and-evaluation.md).

### 12. Verificar con evidencia

Antes de cerrar la tarea:

- ejecuta build, lint, typecheck y pruebas disponibles;
- prueba las rutas modificadas en tamaños relevantes;
- recorre la interfaz solo con teclado;
- comprueba foco, labels, errores, contraste y lector de pantalla cuando haya herramientas;
- inspecciona estados de carga, vacío, fallo, éxito y permisos;
- compara capturas cuando el entorno lo permita;
- verifica que no se rompieron flujos ni componentes reutilizados.

No afirmes “cumple accesibilidad”, “es usable” o “está validado” sin indicar qué se verificó y con qué evidencia. Una herramienta automática no sustituye la revisión manual ni las pruebas con usuarios.

## Puertas de calidad

Aplica [references/07-quality-gates.md](references/07-quality-gates.md). Ninguna tarea de interfaz importante está terminada si falla una puerta crítica:

- contexto y tarea;
- flujo e información;
- estados y recuperación;
- accesibilidad;
- heurísticas;
- validación técnica;
- evidencia y riesgos.

## Prohibiciones

No hagas lo siguiente salvo requisito documentado del dominio:

- diseñar desde la estructura de base de datos en vez de las tareas del usuario;
- ocultar acciones esenciales en iconos ambiguos, hover o gestos sin alternativa;
- usar color como único indicador;
- eliminar el `outline` de foco sin reemplazo equivalente;
- usar placeholder como única etiqueta;
- mostrar códigos internos o trazas como mensaje para el usuario;
- borrar datos o ejecutar acciones de alto impacto sin prevención o recuperación;
- limpiar un formulario después de un error;
- bloquear toda la pantalla para confirmar éxitos rutinarios;
- crear componentes personalizados cuando un control nativo cumple la función;
- agregar información, animaciones, iconos o tarjetas solo para “llenar” espacio;
- asumir que una interfaz es comprensible porque el equipo la comprende;
- declarar éxito basándose únicamente en opinión del diseñador o prueba automática.

## Salida esperada

Al terminar una implementación o auditoría, informa de forma breve:

1. archivos o zonas modificadas;
2. decisiones UX relevantes y su relación con tareas del usuario;
3. validaciones ejecutadas y resultados;
4. problemas encontrados, severidad y corrección;
5. riesgos, supuestos o pruebas pendientes.

Usa [assets/definition-of-done-template.md](assets/definition-of-done-template.md) cuando el trabajo sea amplio.
