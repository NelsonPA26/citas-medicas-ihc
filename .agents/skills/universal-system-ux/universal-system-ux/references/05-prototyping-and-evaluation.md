# Prototipado y evaluación

## 1. Principio

La interfaz perfecta no aparece en el primer intento. Evaluar es parte del diseño y debe ocurrir desde requisitos hasta despliegue. Combina métodos: la inspección experta encuentra problemas normativos; las pruebas con usuarios revelan problemas reales de comprensión, estrategia y contexto.

## 2. Tipos de prototipo

### Por fidelidad

- **Baja fidelidad:** boceto, papel, wireframe, storyboard. Útil para estructura, vocabulario, orden y flujo.
- **Media fidelidad:** pantallas conectadas con contenido cercano a la realidad. Útil para navegación y comprensión.
- **Alta fidelidad:** diseño o código con interacción detallada. Útil para responsive, accesibilidad, contenido, estados y rendimiento percibido.

No evalúes color, microinteracción o accesibilidad final con un prototipo que no representa esos atributos.

### Por alcance

- **Horizontal:** muchas funciones con poca profundidad; valida arquitectura y cobertura.
- **Vertical:** una función completa y profunda; valida factibilidad, interacción y reglas.

### Por destino

- **Descartable:** se usa para aprender y luego se elimina.
- **Incremental:** componentes probados se integran gradualmente.
- **Evolutivo:** se convierte en producto; requiere estándares de producción desde el inicio.

### Técnicas

- papel y lápiz;
- storyboard;
- prototipo clicable;
- simulación de Mago de Oz;
- código limitado;
- datos simulados;
- prototipo de contenido.

## 3. Riesgos del prototipado

- confundir apariencia con funcionalidad completa;
- convertir un prototipo descartable en producción;
- omitir seguridad, accesibilidad, fiabilidad y rendimiento;
- enamorarse de una solución antes de evaluarla;
- usar contenido irreal que oculta problemas;
- interpretar comentarios como requisitos literales;
- evaluar con personas no representativas.

## 4. Selección de método por etapa

| Etapa | Métodos recomendados |
|---|---|
| Descubrimiento | observación contextual, entrevistas, análisis de tareas, revisión de soporte, card sorting |
| Concepto | casos de uso esenciales, storyboard, prototipo de papel, recorrido plural |
| Diseño | evaluación heurística, recorrido cognitivo, prueba de prototipo, inspección de accesibilidad |
| Desarrollo | pensamiento en voz alta, pruebas de tarea, inspección de estándares, medición de rendimiento |
| Prelanzamiento | pruebas integrales, accesibilidad manual, regresión, prueba remota/presencial |
| Producción | analítica respetuosa, registros, encuestas, soporte, pruebas continuas |

## 5. Evaluación heurística

### Preparación

1. Define alcance, perfiles, tareas y plataforma.
2. Selecciona principios y checklist aplicable.
3. Prepara datos, cuentas y escenarios.
4. Define escalas de severidad y frecuencia.
5. Nombra un coordinador.

### Ejecución

- Usa preferentemente 3–5 evaluadores.
- Cada evaluador inspecciona de forma independiente.
- Realiza al menos una pasada general y otra centrada en criterios.
- Registra problema, ubicación, evidencia, principio, impacto y recomendación.
- Consolida hallazgos después de terminar revisiones individuales.
- Elimina duplicados sin perder evidencia.
- Puntúa severidad y frecuencia.
- Prioriza y asigna responsables.

### Entregables

- alcance y perfiles;
- lista consolidada de problemas;
- evidencia;
- severidad, frecuencia y criticidad;
- recomendación;
- hallazgos no resueltos;
- limitaciones de la evaluación.

Una evaluación heurística no demuestra que usuarios reales puedan completar tareas.

## 6. Recorrido cognitivo

Úsalo para aprendizaje y descubribilidad, especialmente con personas novatas.

Para cada paso pregunta:

1. ¿La persona intentará conseguir el efecto correcto?
2. ¿Verá el control o acción disponible?
3. ¿Relacionará el control con su objetivo?
4. ¿La respuesta del sistema le permitirá saber que avanzó correctamente?

Registra supuestos sobre conocimiento previo. No respondas desde la perspectiva del desarrollador.

## 7. Recorrido plural

Reúne usuarios representativos, desarrolladores y especialistas en usabilidad. Todos recorren el escenario desde el papel de usuario. Primero hablan los usuarios, luego desarrolladores y finalmente especialistas, para reducir influencia del equipo.

Úsalo con prototipos tempranos y escenarios concretos.

## 8. Prueba con usuarios

### Objetivos

Formula preguntas observables:

- ¿Puede encontrar la función?
- ¿Comprende las etiquetas?
- ¿Completa la tarea sin ayuda?
- ¿Comete errores?
- ¿Se recupera?
- ¿Comprende el resultado?

No plantees como objetivo “¿le gusta el diseño?” sin tareas concretas.

### Participantes

- Recluta perfiles representativos.
- Incluye diversidad relevante de experiencia, capacidad, dispositivo y contexto.
- No uses solo compañeros del equipo.
- Define criterios de inclusión y exclusión.
- Ajusta la muestra al riesgo, diversidad y fase; itera en rondas pequeñas antes que una única prueba tardía.

### Tareas

- Describe un objetivo, no los pasos ni el nombre exacto del control.
- Usa datos realistas sin exponer información personal.
- Evita pistas incorporadas en la redacción.
- Ordena tareas para reducir aprendizaje artificial.
- Incluye caminos de error y recuperación cuando sean críticos.

Ejemplo adecuado: “Necesitas cambiar tu cita del martes por una fecha disponible la próxima semana”.

Ejemplo inadecuado: “Haz clic en Mis citas y luego en Reprogramar”.

### Facilitación

- Explica que se evalúa el sistema, no a la persona.
- Solicita consentimiento para grabación y tratamiento de datos.
- Invita a pensar en voz alta cuando el método lo requiera.
- No guíes, enseñes ni defiendas el diseño.
- Responde preguntas con neutralidad: “¿Qué harías normalmente?”.
- Intervén solo por seguridad, bloqueo prolongado o reglas definidas.
- Registra observaciones antes de interpretarlas.

### Métricas

- éxito completo, parcial o fallo;
- tiempo por tarea;
- número y tipo de errores;
- retrocesos;
- solicitudes de ayuda;
- abandono;
- confianza o dificultad percibida;
- satisfacción posterior;
- SUS u otro cuestionario estandarizado cuando sea útil.

No conviertas una media en explicación. Relaciona números con conducta observada.

### Modalidades

- **Presencial:** mayor contexto y observación; más coste logístico.
- **Remota moderada:** acceso geográfico y conversación en tiempo real.
- **Remota no moderada:** escala y rapidez; menor capacidad para profundizar.
- **Guerrilla:** útil para señales tempranas, no sustituye perfiles representativos en tareas especializadas.
- **Formal:** adecuada para decisiones de alto riesgo o medición comparativa.

## 9. Otros métodos

### Observación e indagación contextual

Observa el trabajo en su entorno real. Pregunta por excepciones, artefactos, interrupciones, coordinación y atajos. No tomes lo que una persona dice que hace como sustituto de observar lo que realmente hace.

### Entrevistas

Úsalas para motivaciones, experiencia, problemas y lenguaje. Evita preguntas que sugieren una solución.

### Encuestas y cuestionarios

Sirven para patrones y percepción a escala. No prueban por sí solos que una tarea sea usable.

### Focus group

Útil para actitudes y lenguaje compartido; no para medir rendimiento individual ni validar interacción detallada.

### Card sorting

Útil para arquitectura de información y etiquetas.

### Registros y analítica

Muestran qué ocurrió, no necesariamente por qué. Define eventos con propósito, minimiza datos, protege privacidad y combina con investigación cualitativa.

### Seguimiento ocular

Puede mostrar atención visual, no comprensión ni intención. Úsalo solo cuando la pregunta lo justifique.

## 10. Análisis

### Organización

- por tarea;
- por principio heurístico;
- por etapa del flujo;
- por perfil;
- por severidad;
- por patrón emergente.

### Separación de capas

1. **Observación:** “Tres participantes pulsaron Guardar antes de completar la sección”.
2. **Interpretación:** “La jerarquía sugiere que el formulario ya está completo”.
3. **Recomendación:** “Mover la acción final tras el resumen y mostrar progreso”.

No mezcles estas capas.

### Priorización

Considera:

- severidad;
- frecuencia;
- alcance;
- tarea afectada;
- riesgo del dominio;
- accesibilidad;
- coste y dependencia;
- confianza de la evidencia.

## 11. Después de corregir

- ejecuta pruebas de regresión;
- repite tareas críticas;
- verifica que una solución no creó otro problema;
- compara métricas cuando exista línea base;
- documenta decisiones no implementadas y por qué.
