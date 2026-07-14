# Factores humanos y diseño de interfaz

## Principio general

Las personas pierden concentración, olvidan, se equivocan, trabajan bajo presión y poseen capacidades distintas. El sistema debe adaptarse a esa realidad en lugar de exigir atención, memoria y precisión perfectas.

## 1. Ciclo de acción

En cada tarea ayuda al usuario a:

1. entender qué puede conseguir;
2. formar una intención;
3. encontrar la acción apropiada;
4. ejecutarla;
5. percibir la respuesta;
6. interpretar el nuevo estado;
7. comprobar que logró su objetivo.

Una interfaz falla cuando existe una brecha de ejecución —no se sabe qué hacer— o de evaluación —no se entiende qué ocurrió—.

## 2. Atención

- Destaca una sola acción principal por contexto.
- Usa énfasis visual con moderación.
- Evita competir con banners, animaciones, colores intensos y múltiples alertas.
- Coloca información crítica cerca de la acción relacionada.
- Mantén visibles cambios de estado importantes el tiempo suficiente para percibirlos.
- Las alertas urgentes deben ser distinguibles, pero no todo debe parecer urgente.
- No uses parpadeo ni movimiento repetitivo para captar atención.

## 3. Memoria

### Reconocimiento antes que recuerdo

- Muestra opciones disponibles.
- Conserva contexto entre pasos.
- Presenta valores anteriores y ejemplos.
- Permite buscar y filtrar en lugar de recordar códigos.
- Mantén visible el resumen de una operación larga.
- No solicites nuevamente datos que el sistema ya conoce.
- Autocompleta solo cuando el resultado sea inequívoco y editable.

### Agrupación

- Divide información extensa en grupos significativos.
- Usa encabezados descriptivos.
- Agrupa campos relacionados y separa grupos no relacionados.
- Fragmenta identificadores largos en bloques visuales sin alterar su valor.
- Evita formularios de una sola columna interminable sin secciones.

No adoptes “7±2 elementos” como límite universal. La cantidad comprensible depende de familiaridad, agrupación, complejidad y contexto.

## 4. Percepción visual

### Jerarquía

La jerarquía debe indicar con claridad:

- dónde estoy;
- qué es más importante;
- qué pertenece a qué;
- qué puedo accionar;
- qué está seleccionado;
- qué cambió;
- qué requiere atención.

### Principios Gestalt aplicables

- **Proximidad:** elementos cercanos se perciben relacionados.
- **Similitud:** elementos con igual aspecto se interpretan con igual función.
- **Continuidad:** alineaciones guían lectura y recorrido.
- **Cierre:** no dependas de formas incompletas si pueden confundir.
- **Figura-fondo:** controles y texto deben distinguirse de su fondo.

No uses una tarjeta o borde para cada elemento. Agrupa solo cuando exista una relación real.

### Texto

- Usa lenguaje breve y directo.
- Prefiere voz activa.
- Evita mayúsculas sostenidas.
- Mantén longitud de línea y espaciado legibles.
- No reduzcas tipografía para hacer caber contenido.
- Usa encabezados en orden lógico.
- Alinea números para facilitar comparación cuando corresponda.
- No justifiques texto largo a ambos márgenes si crea espacios irregulares.

### Color

- No codifiques información solo mediante color.
- Usa combinaciones con contraste suficiente.
- Mantén significado consistente: un color de error no debe representar éxito en otra pantalla.
- No asumas que rojo/verde será distinguible por todas las personas.
- Acompaña estados con texto, icono, forma o patrón.
- Evita colores altamente saturados para grandes superficies o texto pequeño.
- Usa color para organización y estado, no como decoración excesiva.

Los límites históricos de “cuatro” o “siete” colores no son requisitos universales. El criterio es consistencia, contraste, jerarquía y comprensión.

## 5. Audición

- El sonido complementa, nunca reemplaza, una señal visual o textual.
- Permite silenciar o ajustar volumen cuando el producto emita sonidos.
- Reserva sonidos intensos para situaciones realmente críticas.
- No reproduzcas audio automático sin control.
- Proporciona subtítulos y transcripciones para contenido hablado relevante.

## 6. Movimiento y capacidad motora

- Proporciona objetivos amplios y separados.
- Evita acciones que requieran precisión extrema.
- Permite teclado, voz, switch u otros métodos compatibles con la plataforma.
- No exijas arrastrar; ofrece una alternativa por botones o teclado.
- Evita gestos complejos como único mecanismo.
- Mantén acciones destructivas lejos de acciones frecuentes cuando puedan confundirse.
- Minimiza desplazamientos repetitivos y cambios constantes entre teclado y ratón.
- No cierres un menú o tooltip antes de que la persona pueda mover el puntero hacia él.

## 7. Cognición y lenguaje

- Usa frases simples y vocabulario del dominio.
- Explica siglas en el primer uso cuando no sean universales.
- Evita dobles negaciones.
- Presenta una decisión por vez en contextos complejos.
- Usa ejemplos de formato próximos al campo.
- Evita temporizadores innecesarios.
- Permite revisar antes de confirmar operaciones importantes.
- No cambies automáticamente el contexto al seleccionar un valor, salvo que sea esperado y anunciado.
- Mantén navegación y ayuda en ubicaciones consistentes.

## 8. Modelos para personas novatas y expertas

### Novatas

- instrucciones breves y contextuales;
- valores por defecto seguros;
- explicación de conceptos;
- progresión visible;
- menor densidad cuando la tarea sea nueva;
- prevención y recuperación clara.

### Expertas

- atajos de teclado;
- acciones masivas seguras;
- filtros persistentes;
- plantillas;
- autocompletado;
- repetición de última acción;
- densidad ajustable;
- navegación rápida.

No construyas dos productos incompatibles. El camino básico debe seguir siendo comprensible y los aceleradores no deben ocultar controles esenciales.

## 9. Metáforas e iconografía

Una metáfora es útil cuando transfiere conocimiento del mundo real o del dominio al sistema.

### Evaluación de una metáfora

- ¿Es familiar para los usuarios objetivo?
- ¿Representa correctamente el objeto o acción?
- ¿Permite anticipar el resultado?
- ¿Es culturalmente adecuada?
- ¿Puede ampliarse sin romperse?
- ¿Es coherente con las demás metáforas?
- ¿Necesita etiqueta textual?

### Reglas

- Mismo objeto: misma representación.
- Misma acción: mismo icono, nombre y comportamiento.
- No reutilices un icono con significados diferentes.
- Evita detalles decorativos que dificulten reconocer un icono pequeño.
- Los iconos críticos deben incluir texto visible o nombre accesible inequívoco.
- No inventes símbolos cuando existe una convención consolidada de plataforma.
- Si una metáfora no es comprendida en pruebas, reemplázala; no intentes “educar” al usuario con una mala metáfora.

## 10. Experiencia visceral, conductual y reflexiva

- **Visceral:** primera impresión, legibilidad, orden y confianza.
- **Conductual:** facilidad real para completar tareas, rendimiento y control.
- **Reflexiva:** significado, credibilidad, recuerdo y valoración posterior.

No optimices la apariencia visceral sacrificando el nivel conductual. Una interfaz atractiva que produce errores sigue siendo un mal sistema.
