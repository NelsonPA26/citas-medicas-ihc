# Auditoría heurística ampliada

## Uso

Esta lista traduce y moderniza las preguntas de evaluación de los materiales. No todas aplican a todos los sistemas. Marca cada ítem como:

- `CUMPLE`;
- `NO CUMPLE`;
- `PARCIAL`;
- `N/A` con justificación;
- `NO VERIFICADO`.

Por cada incumplimiento registra evidencia, impacto, recomendación, severidad y frecuencia mediante [../assets/heuristic-finding-template.md](../assets/heuristic-finding-template.md).

## Escala

### Severidad

- `0`: no es un problema.
- `1`: cosmético; no bloquea una tarea.
- `2`: menor; provoca fricción o errores recuperables.
- `3`: mayor; dificulta seriamente una tarea importante.
- `4`: crítico; bloquea, causa pérdida de datos, riesgo, exclusión o daño.

### Frecuencia

- `0`: no ocurre.
- `1`: rara.
- `2`: ocasional.
- `3`: frecuente.
- `4`: casi siempre o afecta a la mayoría.

`criticidad = severidad + frecuencia`. Seguridad, privacidad, accesibilidad grave y pérdida de datos tienen prioridad aunque su frecuencia sea baja.

---

# 1. Visibilidad del estado del sistema

## Identidad y ubicación

- [ ] ¿Cada pantalla tiene un título que describe su contenido o tarea?
- [ ] ¿El usuario puede saber dónde está dentro del sistema?
- [ ] ¿La navegación muestra la sección activa?
- [ ] ¿En flujos de varios pasos se indica el paso actual, los completados y los restantes?
- [ ] ¿Las páginas relacionadas muestran su relación mediante títulos, secuencia o navegación?
- [ ] ¿La ventana, pestaña, panel o registro activo se distingue claramente?
- [ ] ¿El contexto seleccionado —paciente, cuenta, proyecto, fecha— permanece visible?

## Selección y estado

- [ ] ¿Los elementos seleccionados se distinguen sin depender solo del color?
- [ ] ¿Los estados activo, inactivo, bloqueado, pendiente, completado y fallido son inequívocos?
- [ ] ¿Un control deshabilitado comunica por qué no está disponible cuando la causa no es obvia?
- [ ] ¿Los menús y listas muestran qué opción está enfocada, seleccionada o ya elegida?
- [ ] ¿Las selecciones múltiples permanecen visibles antes de confirmar?
- [ ] ¿Los objetos movidos, editados o actualizados muestran el cambio?
- [ ] ¿Los filtros, orden y búsqueda activos son visibles y fáciles de limpiar?

## Retroalimentación

- [ ] ¿Toda acción produce una respuesta perceptible?
- [ ] ¿La respuesta aparece cerca de la acción o del contenido afectado?
- [ ] ¿Después de completar una tarea se confirma qué ocurrió y sobre qué objeto?
- [ ] ¿La confirmación distingue entre guardado definitivo, borrador y envío pendiente?
- [ ] ¿El sistema evita confirmar éxito antes de recibir una respuesta real del servidor?
- [ ] ¿Los cambios automáticos se anuncian o resaltan de forma comprensible?
- [ ] ¿Los procesos en segundo plano muestran su estado y permiten consultar el resultado?

## Espera y progreso

- [ ] ¿Las esperas apreciables muestran carga o progreso?
- [ ] ¿La interfaz explica qué se está procesando en operaciones largas?
- [ ] ¿El usuario sabe si puede continuar, cancelar o cerrar durante la espera?
- [ ] ¿Se evita que una acción se envíe dos veces?
- [ ] ¿El progreso es determinado cuando puede calcularse y no una animación indefinida innecesaria?
- [ ] ¿Si una operación tarda más de lo previsto, se informa sin culpar al usuario?
- [ ] ¿Los tiempos de respuesta son adecuados para la tarea y el contexto?
- [ ] ¿La aplicación conserva la continuidad de pensamiento evitando pausas innecesarias entre pasos dependientes?

---

# 2. Correspondencia entre el sistema y el mundo real

## Lenguaje

- [ ] ¿La interfaz usa palabras que las personas usuarias emplean en su trabajo?
- [ ] ¿Evita nombres de tablas, endpoints, códigos internos y jerga técnica?
- [ ] ¿Las preguntas, instrucciones y mensajes son simples y directos?
- [ ] ¿Los nombres de acciones son específicos en vez de genéricos?
- [ ] ¿Los verbos describen el resultado real: “Guardar cita”, “Cancelar solicitud”, “Descargar informe”?
- [ ] ¿Las abreviaturas son conocidas, explicadas y consistentes?
- [ ] ¿Los códigos de datos son comprensibles o se acompañan de su significado?
- [ ] ¿El estilo gramatical es uniforme dentro de menús y acciones?
- [ ] ¿Los mensajes usan la variante lingüística y formato local apropiados?

## Orden y agrupación

- [ ] ¿Las opciones aparecen en el orden lógico para el usuario y no para la implementación?
- [ ] ¿Las secuencias naturales del proceso se respetan?
- [ ] ¿Los campos relacionados aparecen juntos?
- [ ] ¿Las categorías de menú tienen significado único y no se solapan de forma confusa?
- [ ] ¿La estructura de navegación coincide con la estructura de las tareas?
- [ ] ¿Fechas, horas, monedas, unidades y nombres se presentan en formatos familiares?
- [ ] ¿Los valores se alinean de modo que puedan compararse fácilmente?

## Metáforas y mapeo

- [ ] ¿Los iconos son familiares o incluyen una etiqueta?
- [ ] ¿Las formas y colores respetan convenciones del dominio sin depender solo de ellas?
- [ ] ¿La relación entre un control y su efecto es evidente?
- [ ] ¿Los botones virtuales utilizan nombres coherentes con la acción?
- [ ] ¿Las acciones opuestas no tienen nombres o iconos casi idénticos?
- [ ] ¿Las metáforas no prometen funciones que el sistema no realiza?
- [ ] ¿La interfaz evita copiar literalmente un objeto físico cuando eso empeora accesibilidad o eficiencia?

## Entrada de datos

- [ ] ¿El formato solicitado se expresa en términos comprensibles?
- [ ] ¿El sistema aplica separadores, símbolos o formato automáticamente sin alterar el valor?
- [ ] ¿La entrada acepta variaciones razonables como mayúsculas/minúsculas, espacios o separadores?
- [ ] ¿Los ejemplos usan datos plausibles del dominio?
- [ ] ¿Las unidades están visibles junto al valor y no dependen de memoria?

---

# 3. Control y libertad del usuario

## Salida y cancelación

- [ ] ¿El usuario puede cancelar una operación en progreso cuando sea técnicamente seguro?
- [ ] ¿Puede cerrar un modal, menú o panel sin completar una acción secundaria?
- [ ] ¿Existe una salida clara de estados no deseados?
- [ ] ¿Al cancelar se explica qué datos se conservarán o perderán?
- [ ] ¿La navegación hacia atrás no elimina información sin advertencia?
- [ ] ¿Un flujo de preguntas permite volver al paso anterior cuando el dominio lo admite?

## Corrección y reversibilidad

- [ ] ¿Los datos pueden editarse antes de confirmar?
- [ ] ¿Existe deshacer para acciones reversibles de alto valor?
- [ ] ¿Las acciones destructivas ofrecen recuperación, papelera o periodo de gracia cuando sea viable?
- [ ] ¿El usuario puede revertir varias acciones cuando la tarea lo necesita?
- [ ] ¿Los campos permiten mover el cursor, seleccionar, copiar y corregir normalmente?
- [ ] ¿Los errores no obligan a reiniciar todo el flujo?
- [ ] ¿Se conservan filtros, posición y contexto tras editar un registro?

## Navegación

- [ ] ¿Es fácil cambiar entre secciones, ventanas o registros relacionados?
- [ ] ¿Los menús profundos ofrecen retorno visible al nivel anterior?
- [ ] ¿El usuario puede avanzar y retroceder entre páginas de un formulario?
- [ ] ¿Cambiar una decisión previa recalcula de forma clara sus consecuencias?
- [ ] ¿No se secuestra el botón Atrás del navegador?
- [ ] ¿Los enlaces abren en la misma pestaña salvo una razón clara y anunciada?

## Personalización y elección

- [ ] ¿El usuario puede elegir preferencias relevantes sin configurar detalles innecesarios?
- [ ] ¿La personalización tiene valores por defecto seguros?
- [ ] ¿Las preferencias pueden restablecerse?
- [ ] ¿La interfaz permite rutas equivalentes por teclado y puntero?
- [ ] ¿Las tareas frecuentes pueden acelerarse sin ocultar el camino estándar?

## Confirmaciones

- [ ] ¿Se confirma solo cuando la consecuencia es destructiva, irreversible, costosa o de gran alcance?
- [ ] ¿La confirmación nombra el objeto y la consecuencia concreta?
- [ ] ¿La acción segura no aparece visualmente igual que la destructiva?
- [ ] ¿No se utilizan confirmaciones repetitivas que el usuario aprende a ignorar?

---

# 4. Consistencia y estándares

## Sistema y plataforma

- [ ] ¿Los componentes siguen el sistema de diseño existente?
- [ ] ¿Los controles nativos mantienen comportamiento esperado de la plataforma?
- [ ] ¿La misma acción usa siempre el mismo nombre, icono y ubicación relativa?
- [ ] ¿El mismo estado usa la misma representación en todo el producto?
- [ ] ¿Los comandos y atajos respetan convenciones conocidas?
- [ ] ¿Las funciones críticas no se asignan a gestos o teclas inesperadas?
- [ ] ¿Los formatos institucionales o del sector se respetan cuando corresponden?

## Títulos, etiquetas y texto

- [ ] ¿Toda pantalla, modal y panel tiene título adecuado?
- [ ] ¿Las etiquetas de campos siguen la misma estructura y posición?
- [ ] ¿Los campos obligatorios y opcionales se marcan de forma consistente?
- [ ] ¿Las instrucciones aparecen en lugares previsibles?
- [ ] ¿Las acciones usan un estilo gramatical uniforme?
- [ ] ¿Se evita abuso de mayúsculas, puntuación y abreviaturas inconsistentes?
- [ ] ¿Los nombres de objetos no cambian entre navegación, formulario y mensaje de éxito?

## Iconos y señales

- [ ] ¿Los iconos poseen nombre accesible y etiqueta visible cuando la comprensión lo requiere?
- [ ] ¿La familia de iconos comparte estilo y nivel de detalle?
- [ ] ¿Un icono no representa acciones distintas?
- [ ] ¿La ventana o pestaña activa se distingue de forma consistente?
- [ ] ¿Los elementos deshabilitados, seleccionados y en foco mantienen patrones uniformes?

## Menús y navegación

- [ ] ¿Los menús se organizan de la misma forma en todas las secciones?
- [ ] ¿Las acciones globales y locales se distinguen?
- [ ] ¿“Salir”, “Cerrar sesión” o acciones equivalentes aparecen en una ubicación predecible?
- [ ] ¿La jerarquía de opciones coincide con títulos y categorías?
- [ ] ¿Las opciones inactivas se ocultan o deshabilitan con una regla consistente?
- [ ] ¿El movimiento por teclado sigue patrones estándar?

## Datos y formularios

- [ ] ¿La estructura de entrada se mantiene entre pantallas equivalentes?
- [ ] ¿Fechas, números, monedas y unidades siguen el mismo formato?
- [ ] ¿La alineación de números facilita comparación?
- [ ] ¿El orden de tabulación es coherente?
- [ ] ¿El método para avanzar o retroceder entre campos es estándar?
- [ ] ¿Los botones principales y secundarios mantienen jerarquía y orden?

## Énfasis

- [ ] ¿Color, tamaño, tipografía, sonido y movimiento se usan con reglas consistentes?
- [ ] ¿El énfasis se reserva para información importante?
- [ ] ¿Los colores semánticos no cambian de significado?
- [ ] ¿Se proporciona una leyenda cuando existe una codificación compleja?
- [ ] ¿El contraste y la legibilidad se mantienen en todos los temas?

---

# 5. Prevención de errores

## Restricciones y entradas

- [ ] ¿La interfaz impide valores imposibles antes del envío?
- [ ] ¿Los formatos válidos y límites se muestran antes de que ocurra un error?
- [ ] ¿Los controles adecuados reemplazan texto libre cuando existe un conjunto pequeño de opciones?
- [ ] ¿Las opciones son claramente distintas y, cuando corresponde, mutuamente excluyentes?
- [ ] ¿Los campos dependientes aparecen solo cuando son necesarios?
- [ ] ¿Los valores por defecto son seguros y plausibles?
- [ ] ¿La entrada acepta variaciones benignas y normaliza el formato?
- [ ] ¿Se evita mezclar caracteres que se confunden, como O/0 o I/1, en códigos generados?
- [ ] ¿Los campos muestran longitud o formato sin obligar a contar caracteres?
- [ ] ¿El sistema evita duplicados o advierte antes de crearlos?

## Acciones de riesgo

- [ ] ¿Las acciones destructivas están separadas de las frecuentes?
- [ ] ¿El botón destructivo describe la acción específica?
- [ ] ¿Se muestra el alcance: un elemento, selección o todos los resultados?
- [ ] ¿La confirmación evita opciones predeterminadas peligrosas?
- [ ] ¿Las operaciones masivas muestran una vista previa o resumen?
- [ ] ¿Se previene abandonar un formulario con cambios no guardados cuando existe pérdida real?
- [ ] ¿Los permisos impiden ejecutar acciones no autorizadas, no solo ocultarlas?

## Doble ejecución y concurrencia

- [ ] ¿Los botones se protegen contra doble envío?
- [ ] ¿Las operaciones son idempotentes cuando corresponde?
- [ ] ¿Se detectan cambios concurrentes para no sobrescribir datos silenciosamente?
- [ ] ¿El sistema explica conflictos y ofrece opciones de resolución?
- [ ] ¿Los estados de red inestable no producen registros duplicados?

## Anticipación

- [ ] ¿El sistema alerta antes de un error serio, no después?
- [ ] ¿Las consecuencias de una elección compleja se muestran antes de confirmar?
- [ ] ¿La próxima acción probable se facilita sin ejecutarla automáticamente de forma peligrosa?
- [ ] ¿La interfaz evita cambios de contexto inesperados?
- [ ] ¿Las tareas largas pueden guardarse como borrador?

---

# 6. Reconocimiento antes que recuerdo

## Contexto visible

- [ ] ¿Toda la información necesaria para decidir está disponible en el paso actual?
- [ ] ¿El usuario no debe memorizar datos de una pantalla anterior?
- [ ] ¿Se muestra un resumen en flujos largos?
- [ ] ¿Los valores elegidos permanecen visibles?
- [ ] ¿El objeto sobre el que se actúa se identifica claramente?
- [ ] ¿Las instrucciones aparecen donde se necesitan?

## Organización perceptible

- [ ] ¿Preguntas, instrucciones, campos y respuestas se distinguen visualmente?
- [ ] ¿Los grupos lógicos tienen encabezados?
- [ ] ¿El espacio en blanco guía la lectura sin separar elementos relacionados?
- [ ] ¿Las etiquetas están próximas a sus controles?
- [ ] ¿Los bordes se usan para grupos significativos y no como ruido?
- [ ] ¿Las listas largas se dividen en secciones, filtros o búsqueda?
- [ ] ¿La jerarquía tipográfica refleja importancia y no solo decoración?

## Opciones y disponibilidad

- [ ] ¿Se distingue selección única de selección múltiple?
- [ ] ¿Los elementos inactivos se identifican y, cuando ayuda, explican su estado?
- [ ] ¿Existen valores por defecto cuando reducen esfuerzo sin inducir errores?
- [ ] ¿Los menús muestran las opciones válidas en vez de exigir comandos memorizados?
- [ ] ¿Las funciones frecuentes son visibles o fáciles de descubrir?
- [ ] ¿Los atajos muestran su combinación junto a la acción?
- [ ] ¿Existe búsqueda o mapa cuando la navegación es compleja?

## Color, forma y redundancia

- [ ] ¿La codificación de color es consistente?
- [ ] ¿El color se combina con texto, icono, patrón o posición?
- [ ] ¿Existe contraste suficiente entre contenido y fondo?
- [ ] ¿Las relaciones entre controles y resultados son perceptibles?
- [ ] ¿Los elementos seleccionables parecen interactivos?
- [ ] ¿Las secuencias largas se fragmentan en bloques legibles?
- [ ] ¿Se evitan pares de datos o símbolos frecuentemente confundidos?

## Formularios

- [ ] ¿Los opcionales se identifican claramente?
- [ ] ¿Los campos condicionales solo aparecen cuando corresponden?
- [ ] ¿Los ejemplos de formato están próximos al campo?
- [ ] ¿El sistema recuerda datos ya ingresados de manera segura?
- [ ] ¿Las opciones recientes o frecuentes se ofrecen sin ocultar las demás?

---

# 7. Flexibilidad y eficiencia de uso

## Personas novatas y expertas

- [ ] ¿El camino básico es comprensible sin conocer atajos?
- [ ] ¿Las personas expertas disponen de aceleradores no intrusivos?
- [ ] ¿Los mensajes pueden ofrecer detalle adicional sin abrumar inicialmente?
- [ ] ¿La densidad de información se adapta al tipo de tarea?
- [ ] ¿La ayuda distingue orientación inicial de referencia avanzada?

## Entrada eficiente

- [ ] ¿Existen atajos para acciones frecuentes?
- [ ] ¿Se puede navegar por teclado entre campos, listas y acciones?
- [ ] ¿Se permite seleccionar directamente con puntero sin perder alternativa de teclado?
- [ ] ¿El autocompletado reduce escritura y sigue siendo corregible?
- [ ] ¿El sistema completa entradas parciales solo cuando son inequívocas?
- [ ] ¿Se pueden copiar o reutilizar datos existentes con control?
- [ ] ¿Es posible guardar borradores de formularios largos?
- [ ] ¿Las plantillas reducen trabajo repetitivo?
- [ ] ¿Las acciones masivas son seguras y transparentes?

## Búsqueda y navegación

- [ ] ¿La búsqueda permite siguiente/anterior o navegación clara entre resultados?
- [ ] ¿Los filtros frecuentes pueden persistir o guardarse?
- [ ] ¿La interfaz recuerda contexto al regresar de un detalle?
- [ ] ¿Los usuarios expertos pueden saltar pasos opcionales sin perder validaciones críticas?
- [ ] ¿Los menús cortos permiten selección directa y los largos ofrecen búsqueda?

## Personalización

- [ ] ¿El usuario puede configurar preferencias realmente útiles?
- [ ] ¿La personalización no rompe consistencia ni accesibilidad?
- [ ] ¿Existe una forma de restaurar valores predeterminados?
- [ ] ¿Las opciones avanzadas se ocultan mediante divulgación progresiva, no mediante descubrimiento accidental?

---

# 8. Diseño estético y minimalista

## Relevancia

- [ ] ¿Cada elemento visible ayuda a comprender, decidir o actuar?
- [ ] ¿La pantalla muestra primero la información esencial?
- [ ] ¿Los datos raros o avanzados están disponibles sin competir con lo principal?
- [ ] ¿Se eliminaron repeticiones que no aportan contexto?
- [ ] ¿Las tarjetas, iconos e ilustraciones tienen propósito funcional?
- [ ] ¿La interfaz evita métricas de vanidad o contenido de relleno?

## Claridad visual

- [ ] ¿Existe una jerarquía evidente entre título, contenido y acciones?
- [ ] ¿La acción principal destaca sin convertir toda la pantalla en énfasis?
- [ ] ¿Los grupos relacionados están próximos y los distintos separados?
- [ ] ¿Los iconos se distinguen por significado y no solo por detalles pequeños?
- [ ] ¿El contenido mantiene suficiente espacio para respirar?
- [ ] ¿Los títulos son breves, claros y distintivos?
- [ ] ¿Las etiquetas de campos son familiares y descriptivas?

## Densidad y responsive

- [ ] ¿La densidad corresponde a la frecuencia y experiencia del usuario?
- [ ] ¿En móvil se prioriza contenido en lugar de reducir todo?
- [ ] ¿La información secundaria puede expandirse bajo demanda?
- [ ] ¿Las tablas conservan comprensión al adaptarse?
- [ ] ¿No se ocultan acciones críticas dentro de menús solo para lograr una apariencia limpia?

## Diálogo

- [ ] ¿Los mensajes están escritos en voz activa y tono respetuoso?
- [ ] ¿Cada modal contiene solo la decisión necesaria?
- [ ] ¿Los niveles inferiores de navegación pertenecen a una categoría inequívoca?
- [ ] ¿Los menús emergentes no mezclan navegación, configuración y acciones destructivas sin separación?

---

# 9. Ayudar a reconocer, diagnosticar y recuperarse de errores

## Lenguaje y tono

- [ ] ¿El mensaje explica el problema en lenguaje claro?
- [ ] ¿Evita códigos internos, trazas y jerga técnica?
- [ ] ¿No culpa, ridiculiza ni amenaza al usuario?
- [ ] ¿Evita humor en situaciones graves o frustrantes?
- [ ] ¿Mantiene gramática, terminología y formato consistentes?
- [ ] ¿Distingue error, advertencia e información?
- [ ] ¿El tono transmite que la situación puede resolverse?

## Localización y diagnóstico

- [ ] ¿El campo o zona con error queda identificado visual y programáticamente?
- [ ] ¿El foco se dirige al primer error cuando corresponde sin provocar pérdida de contexto?
- [ ] ¿Se ofrece un resumen de errores en formularios largos?
- [ ] ¿El mensaje indica qué valor o condición es inválida?
- [ ] ¿Explica la causa probable cuando es útil?
- [ ] ¿Distingue errores del usuario, del sistema, de red y de permisos?
- [ ] ¿La severidad y consecuencia se comunican con precisión?

## Recuperación

- [ ] ¿El mensaje indica la acción concreta para resolver el problema?
- [ ] ¿Los datos correctos se conservan?
- [ ] ¿La corrección puede hacerse en el mismo contexto?
- [ ] ¿Existe reintento seguro para fallos temporales?
- [ ] ¿Se evita repetir una operación que ya pudo completarse?
- [ ] ¿Se proporciona contacto o escalamiento cuando el usuario no puede resolverlo?
- [ ] ¿Los errores críticos incluyen identificador de soporte sin exponer información sensible?
- [ ] ¿Las personas novatas pueden acceder a explicación adicional y las expertas a detalle técnico apropiado?

---

# 10. Ayuda y documentación

## Acceso

- [ ] ¿La ayuda es visible y fácil de encontrar?
- [ ] ¿Existe ayuda contextual en tareas complejas?
- [ ] ¿Se puede entrar y salir de la ayuda sin perder el trabajo?
- [ ] ¿Al cerrar la ayuda se retorna al elemento o paso anterior?
- [ ] ¿La ayuda es operable por teclado y accesible?
- [ ] ¿La ubicación de ayuda es consistente en todo el sistema?

## Contenido

- [ ] ¿La ayuda está centrada en tareas reales?
- [ ] ¿Las instrucciones siguen el orden de las acciones?
- [ ] ¿La información es exacta, completa y actualizada?
- [ ] ¿Explica qué puede hacerse con el sistema?
- [ ] ¿Describe para qué sirve un objeto o función?
- [ ] ¿Indica cómo completar una tarea?
- [ ] ¿Explica por qué ocurrió un resultado inesperado?
- [ ] ¿Ayuda a saber dónde está el usuario?
- [ ] ¿Incluye ejemplos representativos?
- [ ] ¿Evita párrafos extensos cuando un procedimiento breve es suficiente?

## Búsqueda y presentación

- [ ] ¿La información puede buscarse con palabras del usuario?
- [ ] ¿Los resultados de ayuda priorizan la tarea actual?
- [ ] ¿La estructura visual de la ayuda es legible?
- [ ] ¿Los enlaces tienen nombres descriptivos?
- [ ] ¿Las capturas o instrucciones coinciden con la versión actual?
- [ ] ¿El usuario puede cambiar el nivel de detalle?
- [ ] ¿Las opciones ambiguas ofrecen explicación adicional sin obligar a abandonar el flujo?

---

# 11. Habilidades y ampliación de capacidades

- [ ] ¿El sistema aprovecha conocimiento previo del usuario?
- [ ] ¿La interacción es fácil de aprender y recordar?
- [ ] ¿Existen varios niveles de detalle cuando los perfiles lo necesitan?
- [ ] ¿El usuario inicia acciones en lugar de responder continuamente a interrupciones?
- [ ] ¿El sistema transforma, calcula o completa datos que no requieren juicio humano?
- [ ] ¿El foco inicial se coloca en el control más probable sin impedir navegación?
- [ ] ¿El método para moverse entre campos es simple y visible?
- [ ] ¿Los dispositivos y métodos de entrada corresponden a las capacidades y al entorno?
- [ ] ¿Las funciones frecuentes son más accesibles que las raras?
- [ ] ¿El sistema anticipa la próxima actividad sin ejecutarla de forma invasiva?
- [ ] ¿Se permite elegir entre texto, iconos u otras presentaciones cuando aporta accesibilidad o eficiencia?

# 12. Interacción placentera y respetuosa

- [ ] ¿La interfaz trata al usuario con respeto incluso cuando se equivoca?
- [ ] ¿Los iconos forman una familia coherente y sin detalle excesivo?
- [ ] ¿El color se utiliza con discreción y propósito?
- [ ] ¿La gestión de ventanas, paneles y modales se mantiene al mínimo?
- [ ] ¿La interfaz coincide con documentos o procesos físicos solo cuando esa correspondencia ayuda?
- [ ] ¿El usuario puede desactivar automatizaciones visuales innecesarias?
- [ ] ¿Se minimiza escritura repetitiva?
- [ ] ¿Los dispositivos y gestos son adecuados al entorno de uso?
- [ ] ¿Se minimizan movimientos de mano y vista entre controles?
- [ ] ¿Existe alternativa a tareas que requieran puntero preciso?
- [ ] ¿Las acciones frecuentes se encuentran en posiciones accesibles?
- [ ] ¿Las entradas parciales inequívocas pueden completarse con confirmación o fácil corrección?
- [ ] ¿El sistema evita patrones manipuladores, culpa, urgencia falsa y obstáculos para cancelar?

# 13. Privacidad

- [ ] ¿Las áreas protegidas requieren autorización real del servidor?
- [ ] ¿La interfaz no revela existencia o contenido sensible a personas sin permisos?
- [ ] ¿Los controles de acceso se prueban y no dependen solo de ocultar botones?
- [ ] ¿Se recopilan únicamente los datos necesarios?
- [ ] ¿El propósito de los datos se explica en el momento de recopilarlos?
- [ ] ¿Los valores sensibles se ocultan por defecto cuando corresponde?
- [ ] ¿El usuario puede revisar y corregir datos antes de enviarlos?
- [ ] ¿Las notificaciones evitan mostrar información sensible en pantallas bloqueadas o compartidas?
- [ ] ¿Los registros y mensajes de error no exponen secretos ni datos personales?
- [ ] ¿Las sesiones expiran de forma proporcional al riesgo y permiten guardar trabajo cuando sea seguro?
- [ ] ¿Las acciones sobre datos personales dejan trazabilidad apropiada?
- [ ] ¿Eliminar, exportar o compartir datos comunica alcance y consecuencias?
