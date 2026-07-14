# Accesibilidad y diseño universal

## Objetivo

Diseñar para el rango más amplio posible de personas y situaciones, sin depender de adaptaciones posteriores. La accesibilidad beneficia a personas con discapacidades permanentes, temporales y situacionales.

Para web, la referencia mínima es WCAG 2.2 nivel AA. Para software no web, aplica estos principios con WCAG2ICT y las APIs de accesibilidad de la plataforma.

## Siete principios de diseño universal

1. **Uso equitativo:** la misma funcionalidad esencial está disponible para personas con capacidades distintas.
2. **Uso flexible:** admite diferentes preferencias y métodos de interacción.
3. **Uso simple e intuitivo:** no exige experiencia, lenguaje o concentración excepcionales.
4. **Información perceptible:** comunica por más de un canal y funciona en condiciones ambientales diversas.
5. **Tolerancia al error:** previene incidentes y limita sus consecuencias.
6. **Esfuerzo físico mínimo:** evita precisión, repetición o fuerza innecesarias.
7. **Tamaño y espacio adecuados:** controles y contenido pueden alcanzarse, percibirse y operarse.

## Perceptible

### Texto y estructura

- [ ] La página o vista tiene un título descriptivo.
- [ ] El documento declara el idioma principal y cambios de idioma relevantes.
- [ ] Los encabezados siguen una jerarquía lógica.
- [ ] Las listas, tablas y regiones usan estructura semántica.
- [ ] El orden del DOM coincide con el orden visual y de lectura.
- [ ] La información no depende únicamente de posición, forma, tamaño, color o sonido.

### Imágenes

- [ ] Imágenes informativas tienen texto alternativo que comunica su propósito.
- [ ] Imágenes decorativas usan alternativa vacía o se implementan de forma que tecnología asistiva las ignore.
- [ ] Gráficos complejos incluyen descripción, tabla de datos o explicación equivalente.
- [ ] Iconos de acción tienen nombre accesible y, cuando no son universales, texto visible.
- [ ] CAPTCHA visual tiene alternativa accesible; evita CAPTCHA cuando exista un método menos excluyente.

### Color y contraste

- [ ] El texto normal alcanza al menos 4.5:1.
- [ ] Texto grande alcanza al menos 3:1.
- [ ] Controles, iconos funcionales, estados y foco tienen contraste no textual suficiente, normalmente 3:1.
- [ ] El significado no depende solo de rojo/verde u otros colores.
- [ ] Enlaces dentro de texto se distinguen por algo más que color cuando el contraste no basta.
- [ ] Los temas claro, oscuro y alto contraste se verifican por separado.

### Zoom, reflow y espaciado

- [ ] El contenido sigue siendo usable con zoom de texto o página al 200 %.
- [ ] El contenido refluye en un ancho equivalente a 320 CSS px sin desplazamiento horizontal, salvo contenido bidimensional esencial.
- [ ] Aumentar interlineado, espaciado entre párrafos, letras y palabras no recorta contenido ni controles.
- [ ] No se bloquea el zoom del navegador.
- [ ] La orientación de pantalla no se restringe sin necesidad esencial.

### Audio y video

- [ ] Audio pregrabado relevante dispone de transcripción.
- [ ] Video con audio dispone de subtítulos sincronizados.
- [ ] Información visual esencial del video tiene audiodescripción o alternativa equivalente cuando corresponde.
- [ ] No se reproduce audio automáticamente o existe control inmediato para detenerlo.
- [ ] Una alerta sonora también se presenta visualmente y mediante semántica accesible.

## Operable

### Teclado

- [ ] Toda funcionalidad puede operarse con teclado.
- [ ] No existe trampa de teclado.
- [ ] El orden de tabulación es lógico.
- [ ] No se usan valores positivos de `tabindex` para reparar un DOM desordenado.
- [ ] Enter y Space activan controles según convenciones de su rol.
- [ ] Escape cierra menús, popovers o modales cuando el patrón lo establece.
- [ ] Los componentes personalizados siguen patrones de teclado de ARIA APG.

### Foco

- [ ] El foco es claramente visible.
- [ ] El indicador no depende solo de un cambio de color imperceptible.
- [ ] El foco no queda completamente oculto por headers, overlays o barras fijas.
- [ ] Al abrir un modal el foco entra de forma apropiada y queda contenido.
- [ ] Al cerrar un modal el foco vuelve al elemento que lo abrió o a un destino lógico.
- [ ] Cambios de ruta colocan foco o anuncian el nuevo contexto según el framework.
- [ ] No se mueve el foco inesperadamente durante validación o carga.

### Navegación

- [ ] Existe enlace para saltar al contenido principal cuando hay navegación repetida.
- [ ] Landmarks y regiones tienen nombres comprensibles.
- [ ] Los enlaces describen el destino; evita listas de “clic aquí”.
- [ ] Hay más de una forma de encontrar páginas relevantes cuando corresponde: navegación, búsqueda, mapa o enlaces relacionados.
- [ ] Breadcrumbs identifican la ubicación cuando existe jerarquía profunda.
- [ ] El título y encabezado principal permiten reconocer la vista actual.

### Tiempo, movimiento y destellos

- [ ] Los límites de tiempo pueden desactivarse, ajustarse o ampliarse salvo excepción esencial.
- [ ] La sesión avisa con tiempo suficiente antes de expirar.
- [ ] Contenido que se mueve, parpadea o actualiza automáticamente puede pausarse cuando distrae.
- [ ] Se respeta `prefers-reduced-motion`.
- [ ] No existen destellos que superen umbrales de seguridad.
- [ ] Los carruseles no avanzan sin control del usuario o incluyen pausa accesible.

### Puntero y tacto

- [ ] Los objetivos interactivos cumplen el tamaño mínimo de WCAG 2.2 o una excepción válida; como referencia AA, 24 × 24 CSS px o separación equivalente.
- [ ] Las acciones no dependen exclusivamente de arrastrar.
- [ ] Los gestos multipunto o basados en trayectoria tienen alternativa simple.
- [ ] Las funciones activadas por movimiento del dispositivo tienen alternativa y pueden deshabilitarse.
- [ ] Los eventos de puntero permiten cancelar antes de completar acciones riesgosas.
- [ ] El nombre visible de un control aparece incluido en su nombre accesible para compatibilidad con control por voz.

## Comprensible

### Lenguaje y predictibilidad

- [ ] El lenguaje es claro, conciso y apropiado para el usuario.
- [ ] Siglas y términos especializados se explican cuando es necesario.
- [ ] El foco no provoca cambios de contexto inesperados.
- [ ] Cambiar un valor no envía automáticamente el formulario sin advertencia.
- [ ] Navegación y ayuda aparecen en posiciones consistentes.
- [ ] Componentes con la misma función mantienen identificación consistente.
- [ ] La ayuda repetida —contacto, soporte, chat— aparece de forma consistente.

### Formularios

- [ ] Cada campo tiene label persistente y asociado programáticamente.
- [ ] Las instrucciones y formatos se muestran antes de la entrada.
- [ ] Campos obligatorios se identifican en texto y semántica.
- [ ] `autocomplete` usa tokens apropiados para datos personales conocidos.
- [ ] Los errores se identifican en texto y se asocian al campo.
- [ ] Se ofrecen sugerencias de corrección cuando son conocidas y seguras.
- [ ] En operaciones legales, financieras o de datos importantes se permite revisar, corregir o revertir.
- [ ] El resumen de errores es navegable y lleva al campo correspondiente.
- [ ] La validación no borra valores correctos.
- [ ] La entrada redundante se autocompleta o permite seleccionar datos anteriores, salvo necesidad de seguridad.

### Autenticación accesible

- [ ] Se permite pegar contraseñas y códigos.
- [ ] Se permite usar gestores de contraseñas.
- [ ] La autenticación no exige resolver una prueba cognitiva sin alternativa.
- [ ] Los códigos de un solo uso pueden autocompletarse cuando la plataforma lo permite.
- [ ] Los requisitos de contraseña aparecen antes y durante la entrada.
- [ ] Mostrar/ocultar contraseña es operable y tiene estado accesible.
- [ ] Los mensajes no revelan información sensible innecesaria.

## Robusto

- [ ] Se usan elementos nativos (`button`, `a`, `input`, `select`, `dialog` cuando sea compatible) antes de recrearlos con `div`.
- [ ] Todo componente comunica nombre, rol, estado y valor.
- [ ] IDs, labels y relaciones ARIA son válidos y únicos.
- [ ] `aria-*` refleja el estado real de la interfaz.
- [ ] No se usa ARIA para cambiar semántica cuando un elemento nativo ya la proporciona.
- [ ] Mensajes de estado se anuncian con una región apropiada sin robar foco.
- [ ] Actualizaciones críticas se anuncian, pero no se saturan lectores de pantalla.
- [ ] La aplicación se prueba con al menos una combinación relevante de navegador y tecnología asistiva cuando el riesgo lo justifica.

## Discapacidades y soluciones

### Visuales

- ceguera: semántica, navegación por lector de pantalla, texto alternativo, teclado;
- baja visión: zoom, reflow, contraste, tamaño ajustable, foco visible;
- deficiencia de color: redundancia de forma/texto/patrón;
- sensibilidad a luz o movimiento: temas, reducción de movimiento, ausencia de destellos.

### Auditivas

- subtítulos, transcripciones, alertas visuales;
- no depender de tono, voz o sonido para instrucciones;
- controles de volumen y reproducción.

### Motoras

- teclado completo, control por voz, objetivos grandes;
- alternativas a arrastre, gestos y tiempos cortos;
- prevención de activación accidental;
- secuencia de foco eficiente.

### Cognitivas, de aprendizaje y neurológicas

- lenguaje simple;
- consistencia y predicción;
- pasos breves, resumen y contexto;
- prevención de errores y recuperación;
- tiempo suficiente;
- autenticación sin pruebas de memoria innecesarias;
- evitar distracción, movimiento y sobrecarga.

### Situacionales

Considera también pantalla bajo sol, manos ocupadas, entorno ruidoso, conexión lenta, lesión temporal, dispositivo compartido, estrés y falta de privacidad.

## Comprobación

### Automática

Usa linters y herramientas de accesibilidad para encontrar errores detectables: nombres, roles, contraste aproximado, estructura, atributos y reglas comunes.

### Manual

- teclado completo;
- zoom y reflow;
- contraste y estados;
- lector de pantalla;
- reducción de movimiento;
- errores de formulario;
- orientación y responsive;
- contenido dinámico;
- autenticación.

### Con personas

Incluye personas con discapacidades relevantes cuando el producto y el riesgo lo permitan. Las herramientas no predicen comprensión, esfuerzo ni compatibilidad real con todos los flujos.

## Regla de declaración

No declares conformidad WCAG basándote solo en una herramienta automática. Documenta alcance, páginas, flujos, nivel, métodos, herramientas, fecha, problemas conocidos y excepciones.
