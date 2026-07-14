# Puertas de calidad para sistemas interactivos

Estas puertas se aplican antes de declarar terminada una pantalla, flujo, módulo o auditoría. Marca cada criterio como `Cumple`, `No cumple`, `No aplica` o `Pendiente de evidencia`. Un `No cumple` crítico impide cerrar la tarea.

## Cómo usar las puertas

1. Define el alcance exacto evaluado.
2. Reúne evidencia: código, pruebas, capturas, resultados de herramientas, observación o registro de decisiones.
3. No marques `Cumple` por intuición.
4. Documenta excepciones, responsable y condición de resolución.
5. Repite las puertas afectadas después de cualquier cambio importante.

## G0. Integridad, seguridad y dominio — crítica

- [ ] No se introducen pérdidas, duplicados ni corrupción de datos.
- [ ] Las acciones sensibles verifican identidad, autorización y alcance.
- [ ] Los datos personales o sensibles se muestran, registran y transmiten solo cuando corresponde.
- [ ] Las acciones irreversibles explican consecuencias y aplican prevención, confirmación o recuperación.
- [ ] El diseño no contradice reglas críticas, legales o clínicas/financieras del dominio.
- [ ] Los estados de error no exponen secretos, trazas, identificadores internos ni información de otras personas.

**Bloqueo:** cualquier riesgo confirmado de seguridad, privacidad, pérdida de datos o daño a personas.

## G1. Contexto y usuarios — crítica para trabajo nuevo o flujo importante

- [ ] Están identificados los roles y usuarios principales.
- [ ] Se conocen objetivo, tarea, frecuencia, criticidad y contexto de uso.
- [ ] Se consideran diferencias de experiencia, lenguaje, cultura y capacidades relevantes.
- [ ] Se registran dispositivos, conectividad y condiciones ambientales relevantes.
- [ ] Los supuestos no confirmados están señalados y no se presentan como hechos.
- [ ] Existen criterios observables de éxito.

**Evidencia mínima:** breve de contexto o requisito equivalente.

## G2. Tareas, flujo y arquitectura de información — crítica

- [ ] Cada flujo responde a una intención real del usuario.
- [ ] El camino principal es visible, comprensible y suficientemente corto.
- [ ] Están definidos precondiciones, alternativas, errores, recuperación y poscondición.
- [ ] Los nombres y agrupaciones siguen el vocabulario y modelo mental del usuario.
- [ ] La navegación indica ubicación actual y permite volver sin pérdida accidental.
- [ ] Roles y permisos producen rutas y mensajes coherentes.
- [ ] No se trasladan al usuario decisiones internas que el sistema puede resolver.

## G3. Componentes, estados y retroalimentación — crítica

- [ ] Los controles tienen propósito y etiqueta inequívocos.
- [ ] Se contemplan foco, activo, seleccionado, deshabilitado y carga cuando aplican.
- [ ] Hay estados vacíos, éxito, advertencia, error, sin permisos y fallo de servicio cuando aplican.
- [ ] Cada acción produce respuesta oportuna y cercana al resultado.
- [ ] Se evita el doble envío y se informa el progreso de operaciones largas.
- [ ] Los errores conservan información válida y ofrecen una forma concreta de recuperación.
- [ ] Los modales no sustituyen innecesariamente una respuesta en línea o no bloqueante.

## G4. Diez heurísticas y factores humanos — crítica

- [ ] Estado del sistema visible.
- [ ] Lenguaje y orden compatibles con el mundo del usuario.
- [ ] Control, cancelación, corrección y salida disponibles cuando son necesarios.
- [ ] Consistencia interna y respeto por estándares de plataforma.
- [ ] Prevención de errores antes que dependencia exclusiva de mensajes posteriores.
- [ ] Reconocimiento antes que recuerdo.
- [ ] Eficiencia para personas frecuentes sin perjudicar a principiantes.
- [ ] Jerarquía clara, densidad adecuada y ausencia de contenido irrelevante.
- [ ] Errores explicados en lenguaje humano, con causa y solución.
- [ ] Ayuda contextual disponible para tareas que realmente la requieren.
- [ ] La interfaz respeta atención, memoria, percepción y capacidad motora.

**Para auditorías:** ejecutar `03-heuristic-audit-expanded.md` y registrar hallazgos.

## G5. Accesibilidad — crítica

- [ ] La estructura semántica, títulos, encabezados y landmarks son correctos.
- [ ] Todo control dispone de nombre, rol, estado y valor accesibles.
- [ ] El flujo completo funciona con teclado y el foco es visible, lógico y no queda atrapado.
- [ ] El contenido no depende únicamente de color, sonido, forma, posición o movimiento.
- [ ] Labels, instrucciones y errores de formularios están asociados correctamente.
- [ ] El contraste, zoom, reflow y responsive fueron comprobados.
- [ ] Imágenes y multimedia tienen alternativas adecuadas.
- [ ] Gestos, arrastre, tiempo límite, movimiento y autenticación tienen alternativas accesibles.
- [ ] Los componentes personalizados siguen el patrón accesible correspondiente.
- [ ] Se realizó revisión manual además de cualquier herramienta automática.

**Objetivo web predeterminado:** WCAG 2.2 AA. Los defectos que bloquean teclado, lector de pantalla o comprensión de una tarea crítica impiden cerrar.

## G6. Responsive y contexto técnico — crítica cuando aplica

- [ ] El contenido prioritario funciona en los tamaños objetivo sin pérdida ni solapamiento.
- [ ] No existe desplazamiento horizontal bidimensional innecesario.
- [ ] Tablas y visualizaciones tienen una estrategia móvil comprensible.
- [ ] Los objetivos táctiles son alcanzables y están suficientemente separados.
- [ ] La interfaz tolera contenido real, textos largos, traducciones y datos extremos.
- [ ] Los estados de red lenta, desconexión y reintento están contemplados cuando el producto los necesita.
- [ ] El rendimiento percibido no oculta ni bloquea la tarea sin explicación.

## G7. Validación técnica y regresión — crítica

- [ ] Build o compilación exitosa.
- [ ] Lint, typecheck y pruebas relevantes ejecutados o limitación documentada.
- [ ] Las rutas modificadas fueron recorridas con datos representativos.
- [ ] No se rompieron rutas, permisos, componentes compartidos ni estilos globales.
- [ ] No hay errores relevantes en consola, red o registros de aplicación.
- [ ] Los identificadores, labels, estados y mensajes se obtienen de fuentes coherentes.
- [ ] Las pruebas automatizadas cubren comportamiento crítico cuando es razonable.

## G8. Evaluación y evidencia — crítica para afirmaciones de calidad

- [ ] La evidencia corresponde al alcance y versión evaluados.
- [ ] Se distingue entre inspección experta, prueba automática y prueba con usuarios.
- [ ] Los hallazgos tienen ubicación, reproducción, impacto, heurística y recomendación.
- [ ] Severidad, frecuencia y prioridad están justificadas.
- [ ] Los resultados no confunden opinión con observación.
- [ ] Las correcciones importantes fueron reevaluadas.
- [ ] Las pruebas pendientes, riesgos residuales y límites se comunican explícitamente.

## Regla de decisión final

- **Aprobado:** todas las puertas críticas aplicables cumplen y existe evidencia suficiente.
- **Aprobado con riesgos:** no hay bloqueos críticos, pero existen pendientes menores documentados con impacto y seguimiento.
- **No aprobado:** existe al menos un bloqueo crítico, una afirmación sin evidencia o una ruta esencial no comprobada.
