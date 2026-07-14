# Contexto, usuarios, tareas y arquitectura de información

## 1. Contexto de uso

No diseñes una interfaz sin entender quién la utilizará, para qué y en qué condiciones. Un sistema usable en un escritorio silencioso puede fallar en un móvil, con poca luz, mala conexión, estrés o interrupciones.

Registra como mínimo:

- roles y segmentos de usuario;
- objetivos y resultados esperados;
- frecuencia de uso;
- experiencia con el dominio y la tecnología;
- vocabulario habitual;
- capacidades sensoriales, motoras y cognitivas relevantes;
- dispositivos y métodos de entrada;
- entorno físico, social y organizacional;
- información compartida entre personas o roles;
- riesgos, privacidad y consecuencias de error;
- restricciones técnicas y legales.

## 2. Perfiles de usuario

Evita una persona genérica que represente a todos. Distingue usuarios cuando cambien de forma material:

- objetivos;
- permisos;
- experiencia;
- frecuencia de uso;
- capacidades;
- contexto;
- tareas críticas.

Para cada perfil define:

| Campo | Pregunta |
|---|---|
| Rol | ¿Qué responsabilidad tiene? |
| Objetivo | ¿Qué necesita conseguir, no qué pantalla quiere? |
| Tareas | ¿Qué hace con frecuencia y qué hace bajo presión? |
| Conocimiento | ¿Qué términos y procesos domina? |
| Limitaciones | ¿Qué barreras podría encontrar? |
| Contexto | ¿Dónde, con qué dispositivo y con qué interrupciones trabaja? |
| Riesgos | ¿Qué daño produce un error o una omisión? |
| Éxito | ¿Cómo sabremos que el sistema le ayuda? |

No conviertas perfiles en estereotipos demográficos sin relación con el diseño.

## 3. Casos de uso esenciales

En etapas tempranas describe la intención sin imponer una solución visual.

Formato:

```text
Caso de uso: [resultado que busca el usuario]
Actor: [rol]
Precondiciones: [estado requerido]
Disparador: [qué inicia la tarea]

Intención del usuario        Responsabilidad del sistema
1. ...                       2. ...
3. ...                       4. ...

Alternativas:
- ...

Errores y recuperación:
- ...

Poscondición:
- ...
```

Ejemplo incorrecto: “El usuario hace clic en el botón azul y abre un modal”.

Ejemplo esencial: “El usuario solicita cambiar la fecha; el sistema muestra fechas válidas y conserva los datos ya ingresados”.

## 4. Análisis jerárquico de tareas

Úsalo cuando una tarea tenga múltiples pasos, decisiones, roles o dependencias.

1. Define el objetivo principal.
2. Descompón en subtareas observables.
3. Identifica orden, paralelismo, repetición y decisiones.
4. Marca información requerida en cada paso.
5. Identifica errores posibles y puntos de abandono.
6. Reduce pasos que solo existen por limitaciones internas.
7. Comprueba si la secuencia coincide con el trabajo real.

No fuerces al usuario a seguir la arquitectura del sistema. Si el proceso real es no lineal, permite guardar borradores, volver y completar información después cuando el dominio lo permita.

## 5. Modelo mental y modelo conceptual

El usuario forma una explicación de cómo funciona el sistema. Diseña un modelo conceptual coherente para que esa explicación sea sencilla y predecible.

Comprueba:

- ¿Los objetos del sistema corresponden a conceptos del dominio?
- ¿Una misma palabra representa siempre el mismo objeto?
- ¿Las acciones producen resultados previsibles?
- ¿La ubicación de información coincide con dónde el usuario la buscaría?
- ¿Los estados y transiciones son visibles?
- ¿La interfaz evita exponer términos técnicos internos?
- ¿Los permisos y restricciones se explican en términos del trabajo?

## 6. Arquitectura de información

La organización debe reflejar objetivos y tareas, no departamentos técnicos ni entidades de base de datos.

### Reglas

- Agrupa por significado y frecuencia de uso.
- Separa tareas de consulta, creación, edición y administración cuando sus riesgos difieran.
- Usa categorías mutuamente comprensibles; evita solapamientos ambiguos.
- Mantén etiquetas breves, específicas y consistentes.
- Coloca primero lo más importante o frecuente.
- Ofrece búsqueda cuando el volumen haga ineficiente navegar.
- Muestra ubicación actual mediante títulos, estado activo y breadcrumbs cuando la jerarquía lo justifique.
- Evita breadcrumbs en flujos lineales cortos donde no aportan orientación.
- No hagas menús excesivamente profundos; prioriza amplitud comprensible y agrupación.
- Mantén accesibles las acciones principales sin saturar la pantalla.

### Card sorting

Úsalo cuando exista incertidumbre sobre categorías o nombres:

- abierto: los participantes crean grupos y etiquetas;
- cerrado: clasifican contenido en categorías propuestas;
- híbrido: pueden usar categorías existentes o crear nuevas.

No uses el resultado como decisión automática; compáralo con tareas, riesgos y restricciones del dominio.

## 7. Flujos

Para cada flujo crítico, dibuja o documenta:

- punto de entrada;
- pasos;
- decisiones;
- estados del sistema;
- datos requeridos;
- validaciones;
- errores;
- cancelación;
- recuperación;
- salida exitosa;
- retorno al contexto anterior.

Comprueba que una flecha represente una acción real o transición de sistema. No inventes botones que no existen solo para cerrar un diagrama; etiqueta la transición con el mecanismo real, por ejemplo “seleccionar Inicio en el sidebar”.

## 8. Criterios de éxito

Define indicadores antes de implementar:

- porcentaje de tareas completadas;
- tiempo o número de pasos;
- errores y recuperaciones;
- necesidad de asistencia;
- abandono;
- satisfacción;
- accesibilidad;
- precisión de datos;
- incidencias de soporte.

Un objetivo útil es específico: “Una persona nueva agenda una cita válida sin ayuda en menos de tres minutos y comprende la confirmación”. Un objetivo inútil es “que se vea moderno”.
