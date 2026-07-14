# Cobertura de fuentes y criterio de síntesis

## Objetivo

Este archivo documenta cómo se transformaron los materiales entregados en reglas operativas para Codex. Se revisó el texto, la estructura y las páginas renderizadas de todos los archivos. Cuando dos documentos repetían contenido se consolidó una sola vez.

## Archivos revisados

| Archivo | Páginas | Aporte incorporado |
|---|---:|---|
| `S01-02 - Material-Introduccion y Usabilidad.pdf` | 39 | Fundamentos de interacción persona-ordenador, interfaz como medio y barrera, objetivos de usabilidad, diseño centrado en usuario, flexibilidad y estandarización. |
| `S02 - Material-Usabilidad.pdf` | 27 | Contexto de uso, eficacia, eficiencia, satisfacción, utilidad/aceptabilidad, principios de usabilidad, métricas, DCU y experiencia de usuario. |
| `S03-Material.pdf` | 20 | Cognición individual y distribuida, modelos mentales, ciclo de acción de Norman, percepción inicial, memoria y límites humanos. |
| `S04-Material.pdf` | 21 | Continuación de factor humano: audición, tacto, sistemas sensoriales, percepción, Gestalt, profundidad, reconocimiento, atención y memoria. |
| `S06-Material.pdf` | 10 | Metáforas verbales y visuales, objetos/acciones, metodología para crear metáforas, coherencia y riesgos de representaciones inadecuadas. |
| `S07-Material (1).pdf` | 13 | Casos de uso esenciales, prototipos de baja/alta fidelidad, horizontales/verticales, descartables/evolutivos, storyboard, papel, Mago de Oz y herramientas. |
| `S08-Material_MetodosEvaluación_01.pdf` | 21 | Evaluación durante el ciclo de vida, inspección/indagación/test, heurísticas, recorridos, entrevistas, observación, pensamiento en voz alta, métricas y costes. |
| `S09-Material_MetodosEvaluación_02.pdf` | 94 | Pruebas con usuarios, preparación, reclutamiento, facilitación, presencial/remoto, formal/guerrilla, SUS, card sorting, registros, análisis cuantitativo y cualitativo. |
| `S09-Material_MetodosEvaluación_02 (1).pdf` | 94 | Duplicado binario exacto del archivo anterior; revisado y consolidado sin repetir reglas. |
| `S11-Material (2).pdf` | 34 | Evaluación heurística, planificación, 3–5 evaluadores, severidad/frecuencia, principios y lista extensa de preguntas de comprobación. El texto defectuoso se contrastó visualmente y mediante extracción asistida. |
| `S12-material_Diseño.pdf` | 39 | Análisis de usuarios, tareas y contexto; ciclo de vida de interfaz; modelos mentales/conceptuales; HTA, GOMS y otras notaciones; modelos arquitectónicos y estrategia de diseño. |
| `S13-material_Accecibilidad.pdf` | 10 | Diseño universal, discapacidades visuales/auditivas/motoras/cognitivas, soluciones, accesibilidad web y métodos de comprobación. |

## Contenido convertido en reglas universales

- diseñar desde usuarios, tareas y contexto;
- reducir carga cognitiva y respetar modelos mentales;
- ofrecer retroalimentación, control, consistencia y recuperación;
- prevenir errores antes de redactar mensajes de error;
- usar lenguaje, metáforas y símbolos familiares y coherentes;
- prototipar y evaluar de forma iterativa;
- combinar inspección experta con pruebas de usuarios;
- incorporar accesibilidad y diseño universal desde el inicio;
- registrar evidencia, métricas, severidad y riesgos.

## Contenido conservado como contextual, no obligatorio

- tiempos de respuesta históricos expresados como cifras universales;
- límites rígidos sobre cantidad exacta de colores, iconos o elementos;
- reglas dependientes de teclados físicos antiguos, disquetes, ventanas clásicas o interfaces de terminal;
- detalles anatómicos que no producen una decisión de diseño;
- historia de la disciplina y bibliografía académica;
- herramientas antiguas mencionadas solo como ejemplo;
- modelos formales avanzados cuando no aportan a la tarea actual.

Estos temas no se eliminaron por falta de revisión, sino porque una skill general debe convertir teoría en decisiones verificables y evitar imponer restricciones obsoletas a tecnologías modernas.

## Complementos actuales

Para evitar que los materiales históricos generen prácticas desactualizadas, la síntesis adopta:

- WCAG 2.2 nivel AA como referencia web;
- WCAG2ICT para interpretar accesibilidad en software no web;
- ARIA Authoring Practices solo para patrones personalizados que realmente necesiten ARIA;
- controles nativos y semántica de plataforma como primera opción;
- comprobación automática más revisión manual y pruebas con personas.

## Política de contradicciones

Si una regla histórica contradice un criterio moderno, una convención de plataforma o evidencia de usuarios, no se aplica literalmente. Se conserva su intención —visibilidad, legibilidad, prevención, consistencia o reducción de carga— y se implementa con la solución actual más apropiada.
