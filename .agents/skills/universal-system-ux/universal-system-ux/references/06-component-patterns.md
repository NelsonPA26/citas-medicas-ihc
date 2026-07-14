# Patrones prácticos para componentes y flujos

## 1. Acciones y botones

### Etiqueta

- Usa verbo + objeto cuando mejore precisión: `Guardar paciente`, `Enviar solicitud`, `Cancelar cita`.
- Usa `Guardar` cuando el objeto sea inequívoco en el contexto.
- Evita `Aceptar`, `Continuar`, `Listo` o `Sí` cuando no describan la consecuencia.
- La etiqueta debe coincidir con el mensaje de confirmación y el resultado real.

### Jerarquía

- Una acción principal por contexto.
- Acciones secundarias con menor peso visual.
- Acciones destructivas separadas y claramente nombradas.
- No uses el mismo estilo para guardar y eliminar.
- No deshabilites el botón sin explicar requisitos faltantes cuando el motivo no sea obvio.

### Iconos

- Un icono puede reforzar, no reemplazar, una etiqueta crítica.
- Icon-only solo para acciones universales, repetitivas y con nombre accesible/tooltip.
- Mismo icono y metáfora para la misma acción en todo el sistema.
- No mezcles check, disquete y nube para “guardar” sin una diferencia semántica real.

## 2. Formularios

### Estructura

- Una columna para formularios lineales; varias solo cuando la relación sea evidente y el ancho lo permita.
- Agrupa campos por significado con encabezados.
- Coloca label sobre el campo en layouts responsive o cuando las etiquetas varíen en longitud.
- Mantén ayuda y errores próximos al campo.
- Indica obligatorios de manera consistente; cuando la mayoría es obligatoria, puede resultar más claro marcar opcionales.

### Entrada

- Usa tipo de control apropiado.
- Permite pegado, autocompletado y gestores de contraseña.
- No limpies valores correctos tras un error.
- Formatea sin impedir editar.
- No bloquees caracteres durante la escritura si una validación posterior puede explicarlo mejor.
- Usa máscaras con cautela; deben ser compatibles con teclado, pegado y lector de pantalla.

### Validación

- Valida al salir del campo o al enviar según la naturaleza del dato.
- No muestres error antes de que la persona haya tenido oportunidad de completar el campo.
- Muestra requisitos antes de la entrada.
- Indica qué está mal y cómo corregirlo.
- En formularios largos, añade resumen de errores navegable.
- Conserva el foco y evita saltos inesperados.

### Acciones

- Botón principal al final del flujo lógico.
- No dupliques el botón principal en múltiples posiciones sin necesidad.
- `Limpiar` debe usarse rara vez y no parecer una acción primaria.
- Antes de abandonar con datos no guardados, advierte solo si existe pérdida real.
- Ofrece guardar borrador en tareas largas cuando el dominio lo permita.

## 3. Mensajes y notificaciones

### Éxito

Usa feedback no bloqueante y próximo al resultado:

- mensaje en línea para cambios locales;
- toast para confirmación breve que no requiere decisión;
- actualización visible del estado o lista;
- página de confirmación para procesos importantes con próximos pasos.

No uses un modal solo para decir “Guardado correctamente” en cada CRUD. Interrumpe el flujo y obliga a una acción sin valor.

### Error

Incluye:

1. qué no pudo hacerse;
2. causa comprensible si se conoce;
3. qué datos se conservaron;
4. cómo resolver o reintentar;
5. alternativa de soporte si no es recuperable.

### Advertencia

Úsala antes de una consecuencia posible. No conviertas toda información secundaria en advertencia.

### Toasts

- no deben contener información crítica como único canal;
- duración suficiente o pausa/cierre;
- no apilar tantos que oculten contenido;
- usar región de estado apropiada;
- no mover foco automáticamente.

## 4. Modales y diálogos

Usa modal cuando deba resolverse una decisión o tarea breve antes de continuar.

Debe incluir:

- título específico;
- propósito claro;
- acción principal y alternativa;
- cierre visible si se puede cancelar;
- foco inicial lógico;
- contención de foco;
- Escape cuando corresponda;
- retorno de foco;
- contenido que no exceda el espacio disponible.

Evita:

- modales de éxito rutinario;
- modal sobre modal;
- formularios largos dentro de un diálogo pequeño;
- cerrar por clic exterior cuando podría perderse trabajo;
- confirmaciones genéricas como “¿Está seguro?”.

Ejemplo: `Eliminar la cita de Ana Torres del 15 de julio` + consecuencia + `Eliminar cita` / `Conservar cita`.

## 5. Navegación

### Sidebar

- Ordena por tareas y frecuencia, no por orden de tablas.
- Agrupa módulos relacionados y evita secciones vacías.
- Muestra estado activo con más de una señal.
- Mantén etiquetas visibles; no dependa solo de iconos.
- Coloca configuración y administración separadas de tareas diarias.
- En móvil, el menú debe cerrar de forma accesible y devolver foco.

### Breadcrumbs

Úsalos cuando exista jerarquía y ayuden a volver a niveles superiores. No sustituyen el título ni la navegación principal.

- deben estar separados visualmente del título;
- el último elemento identifica la vista actual y no necesita ser enlace;
- las etiquetas deben coincidir con navegación y títulos;
- no los uses para representar pasos de un formulario; usa un stepper.

### Pestañas

- Úsalas para vistas relacionadas del mismo contexto.
- No las uses como pasos secuenciales obligatorios.
- Implementa patrón de teclado y estados ARIA apropiados.
- Conserva datos al cambiar de pestaña.

## 6. Tablas y listas

- Título o descripción del conjunto.
- Encabezados semánticos.
- Orden visible y reversible.
- Filtros activos visibles.
- Búsqueda y paginación comprensibles.
- Selección masiva con alcance claro.
- Acciones por fila con etiqueta o menú inequívoco.
- Estado vacío que explique por qué y qué hacer.
- No ocultes columnas críticas en móvil; prioriza, apila o permite desplazamiento controlado.
- Mantén encabezados y primera columna visibles solo si no ocultan foco/contenido.
- Para listas muy grandes, informa cantidad y resultados filtrados.

## 7. Dashboard y tarjetas

- Cada indicador debe responder una pregunta real.
- Incluye etiqueta, valor, periodo y comparación cuando corresponda.
- No uses colores de estado sin texto.
- Evita tarjetas redundantes que repiten navegación.
- Coloca primero indicadores accionables o críticos.
- Los gráficos deben tener título, unidades, leyenda y alternativa textual/tabular.
- No uses gráficos si una cifra o tabla comunica mejor.
- Las tarjetas clicables deben parecer interactivas y ser operables por teclado.

## 8. Búsqueda y filtros

- Placeholder no sustituye label accesible.
- Permite enviar con Enter.
- Muestra término, cantidad y estado de resultados.
- Ofrece limpiar consulta y filtros.
- Diferencia “sin resultados” de error de red.
- Sugiere correcciones sin reemplazar silenciosamente la consulta.
- Los filtros deben persistir al abrir un detalle y volver cuando eso ayuda a la tarea.
- En filtros complejos, muestra chips o resumen de criterios activos.

## 9. Carga, vacío y fallos

### Carga

- skeleton solo si representa la estructura real;
- spinner con etiqueta accesible para espera breve;
- progreso determinado para operaciones medibles;
- no reemplazar contenido estable por parpadeos durante cada actualización.

### Vacío

Distingue:

- primera vez: explica valor y acción inicial;
- sin resultados: muestra filtros/consulta y cómo modificarlos;
- sin permisos: explica acceso;
- datos aún no disponibles: indica condición o fecha;
- error: ofrece recuperación.

### Fallos

- conserva contenido previo cuando sea seguro;
- permite reintento;
- evita recargar toda la página por un fallo parcial;
- identifica la zona afectada;
- no muestres datos obsoletos como actuales sin avisar.

## 10. Autenticación y permisos

- Login con labels persistentes, mostrar contraseña y recuperación visible.
- No impedir pegar contraseñas.
- Mensajes de credenciales inválidas no deben revelar cuentas existentes si el riesgo lo desaconseja.
- Explica bloqueo, espera y recuperación.
- Diferencia autenticación de autorización.
- No muestres acciones que nunca puede realizar un rol, salvo que explicar su disponibilidad tenga valor.
- Si una acción está temporalmente restringida, muestra condición y siguiente paso.
- Cambio de contraseña obligatorio debe explicar motivo y requisitos antes de enviar.

## 11. Destrucción, archivo y eliminación

- Prefiere archivar o papelera si el dominio lo permite.
- Confirma eliminación irreversible.
- Nombra el objeto y cantidad.
- Explica dependencias y datos asociados.
- No uses botón principal neutro para eliminar.
- Después de eliminar, muestra resultado y opción deshacer cuando sea segura.
- Si falla, conserva el elemento y explica el estado.

## 12. Responsive

- Diseña por prioridad de contenido, no por reducción proporcional.
- Comprueba anchos pequeños, medianos y grandes.
- No oculta funcionalidad esencial en móvil.
- Evita scroll horizontal salvo tablas/diagramas esenciales.
- Mantén targets táctiles y separación.
- Reubica acciones sin cambiar su significado.
- Prueba teclado en escritorio y táctil/lector de pantalla en móvil.
- Considera teclado virtual, safe areas y orientación.
