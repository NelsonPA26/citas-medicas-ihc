# Auditoria de usabilidad y accesibilidad

Fecha: 18/07/2026  
Sistema: Bienestar UNT - Citas medicas

## Alcance y metodo

Se reviso la guia `Guia_Auditoria_Usabilidad_Accesibilidad(1).pdf` (48 paginas, cuestionario de 306 criterios) junto con el codigo, las rutas y las vistas de los cuatro roles: paciente, enfermera, medico y administrativo.

Se realizaron estas comprobaciones sin crear ni modificar registros clinicos:

- Revision estatica de controladores, rutas, middleware, vistas, JavaScript y CSS.
- Pruebas HTTP con sesiones independientes de paciente, enfermera, medico y administrador principal para comprobar acceso permitido y rechazo de rutas de otro rol.
- Revision de login, registro, reserva, triaje, atencion medica, historial, gestion de usuarios, perfil y ayuda desde su implementacion.
- Revision de validaciones de datos personales, signos vitales, contrasenas, fechas, mensajes de error, ayuda contextual y preferencias visuales.

Estados usados por la guia:

- **C**: comprobado en codigo o prueba HTTP.
- **P**: implementado en parte o necesita una correccion concreta.
- **NC**: incumplimiento identificado con evidencia.
- **NV**: requiere prueba manual, con personas usuarias, navegador, lector de pantalla o medicion que no puede afirmarse solo revisando codigo.

La guia exige pruebas con usuarios, teclado, lector de pantalla y mediciones de contraste/zoom. Por honestidad metodologica, esos criterios se conservan como **NV** hasta realizar dichas pruebas; no se deben declarar aprobados sin evidencia.

## Resultado por bloque de la guia

| Bloque de la guia | Estado | Evidencia resumida |
| --- | --- | --- |
| 1. Visibilidad del estado | P | Estados de cita, triaje, carga y guardado son visibles; falta prueba completa de todos los estados y tiempos de respuesta. |
| 2. Correspondencia con el mundo real | C | Flujos por rol, terminologia clinica y pasos de reserva/triaje/atencion se corresponden con el proceso real. |
| 3. Control y libertad | P | Hay cancelar, volver, editar y borrador en los flujos principales; falta prueba con usuarios de todos los abandonos y recuperaciones. |
| 4. Consistencia y estandares | P | Se consolidaron patrones de paneles, botones y mensajes; el CSS conserva reglas heredadas y duplicadas que ya generaron regresiones al ampliar texto. |
| 5. Prevencion de errores | C | Validaciones de servidor y cliente para fechas, datos personales, signos vitales, contrasenas, duplicados y confirmaciones. |
| 6. Reconocimiento antes que recuerdo | C | Etiquetas, ayudas por campo, pasos guiados, estados y ayuda por modulo reducen la carga de memoria. |
| 7. Flexibilidad y eficiencia | P | Filtros, accesos rapidos, preferencias visuales y borradores existen; no se verificaron todos los atajos de teclado ni todos los filtros con usuarios. |
| 8. Estetica y diseno minimalista | P | La informacion clinica fue agrupada en paneles; deben eliminarse reglas CSS antiguas que alteran la refluencia a escalas grandes. |
| 9. Recuperacion ante errores | C | Mensajes especificos, foco en el primer error, confirmaciones y bloqueo temporal tras intentos fallidos. |
| 10. Ayuda y documentacion | P | Hay ayuda general por rol y ayuda contextual; la ayuda no ofrece busqueda por tema ni se valido su comprension con usuarios. |
| 11. Capacidades humanas | P | Existen ampliacion visual, alto contraste y refluencia prevista; faltan pruebas operativas de teclado, lector de pantalla, 200 % y 400 %. |
| 12. Diseno respetuoso | P | Se usan mensajes claros y no culpabilizantes; falta politica visible sobre datos personales y consentimiento informado. |
| 13. Privacidad y seguridad | NC | Hay fallas de configuracion y proteccion detalladas en los hallazgos 1 a 5. |
| Evaluacion con usuarios y SUS | NV | No hay evidencia de pruebas con personas usuarias ni cuestionario SUS aplicado. |

## Hallazgos que no cumplen o cumplen parcialmente

### 1. Ruta publica de diagnostico de base de datos

- **Estado:** NC
- **Roles afectados:** todos y personas no autenticadas.
- **Ubicacion:** `src/app.js`, ruta `GET /test-db`.
- **Evidencia:** la ruta no usa `isAuthenticated` y devuelve el mensaje de error crudo de MySQL cuando la conexion falla.
- **Riesgo:** expone una capacidad de diagnostico y puede filtrar informacion tecnica interna.
- **Criterios relacionados:** 13.2, 13.3 y 13.10.
- **Correccion:** eliminar la ruta en produccion o protegerla para administrador principal y nunca devolver `error.message` al cliente.

### 2. Sesion no preparada para produccion

- **Estado:** NC
- **Roles afectados:** todos.
- **Ubicacion:** `src/app.js`, configuracion de `express-session`.
- **Evidencia:** existe una clave secreta de respaldo conocida, se usa el almacenamiento de memoria por defecto y no se definen propiedades de cookie como `httpOnly`, `sameSite`, `secure` y expiracion.
- **Riesgo:** la sesion no tiene una configuracion robusta para datos clinicos o personales.
- **Criterios relacionados:** 13.3, 13.4 y 13.10.
- **Correccion:** exigir `SESSION_SECRET`, usar un store persistente, y configurar cookie segura con `httpOnly: true`, `sameSite: 'lax'`, `secure` en HTTPS y una expiracion razonable.

### 3. Formularios POST sin proteccion CSRF

- **Estado:** NC
- **Roles afectados:** paciente, enfermera, medico y administrativo.
- **Ubicacion:** todas las rutas POST de `src/routes/*.routes.js`.
- **Evidencia:** no se encontro middleware ni token CSRF en aplicacion, formularios o dependencias.
- **Riesgo:** una sesion autenticada podria ser inducida a ejecutar acciones no deseadas, como cancelar una cita, actualizar datos o cambiar estados de usuarios.
- **Criterios relacionados:** 5.2, 9.5 y 13.10.
- **Correccion:** incorporar proteccion CSRF y verificarla en cada accion que modifica datos.

### 4. Recuperacion de contrasena solo registrada en consola

- **Estado:** P
- **Roles afectados:** todos.
- **Ubicacion:** `src/controllers/auth.controller.js`, `forgotPassword`.
- **Evidencia:** el token se genera y expira correctamente, pero el enlace de recuperacion se imprime en consola en lugar de enviarse por un canal controlado; tampoco se encontro limitacion de solicitudes de recuperacion.
- **Riesgo:** el flujo no es apropiado para operacion real y los enlaces pueden quedar expuestos en logs de servidor.
- **Criterios relacionados:** 5.2, 9.4 y 13.10.
- **Correccion:** enviar el enlace por correo institucional, limitar solicitudes y no escribir el token completo en logs.

### 5. Falta informacion visible de privacidad y consentimiento

- **Estado:** NC
- **Roles afectados:** paciente, enfermera, medico y administrativo.
- **Ubicacion:** login, registro y layouts del sistema.
- **Evidencia:** no se encontro politica de privacidad, aviso de tratamiento de datos ni registro de consentimiento en vistas o rutas.
- **Riesgo:** el uso de datos personales y clinicos no esta explicado de forma transparente a la persona usuaria.
- **Criterios relacionados:** 12.2, 12.3, 13.2 y 13.9.
- **Correccion:** incorporar aviso de privacidad, finalidad de los datos, responsable, derechos de la persona usuaria y registro de aceptacion cuando corresponda.

### 6. Cuenta administrativa operativa sin alcance valido en datos de prueba

- **Estado:** NC de configuracion/datos.
- **Rol afectado:** administrativo operativo.
- **Ubicacion:** `src/controllers/admin.controller.js`, funciones `esAdministrativoAdmision`, `esAdministrativoGestionUsuarios` y `rolesGestionables`; registro `admin02` en base de datos.
- **Evidencia:** el controlador reconoce exactamente las areas `Admision` y `Gestion de usuarios`, mientras que la cuenta operativa de prueba tiene el cargo `Apoyo administrativo`. Como resultado no recibe roles gestionables ni permisos de citas.
- **Riesgo:** una cuenta operativa puede iniciar sesion, pero queda sin capacidad coherente para cumplir su tarea.
- **Criterios relacionados:** 1.5, 2.9, 3.4, 4.3 y 13.3.
- **Correccion:** modelar el alcance administrativo en un campo controlado (por ejemplo `area_operativa`) y migrar los registros existentes a `Admision` o `Gestion de usuarios`; no reutilizar texto libre de cargo para permisos.

### 7. Refluencia y ampliacion visual sin verificacion integral

- **Estado:** P
- **Roles afectados:** todos, especialmente paciente, enfermera y medico en paneles clinicos.
- **Ubicacion:** `src/public/css/styles.css`, reglas de `data-visual-scale`, paneles clinicos y grids de informacion.
- **Evidencia:** existen reglas antiguas y posteriores sobre los mismos grids, incluso declaraciones contradictorias de `display: grid` y `display: block`. Las incidencias reportadas durante las pruebas visuales muestran que ciertos paneles se fragmentaban letra por letra al aumentar el texto.
- **Riesgo:** a 150 %, 200 % o 400 % puede reaparecer solapamiento, columnas estrechas o lectura vertical de palabras.
- **Criterios relacionados:** 4.2, 7.4, 8.2, 11.1, 11.2 y WCAG 1.4.4/1.4.10.
- **Correccion:** consolidar los estilos de paneles en una unica regla reutilizable, eliminar reglas heredadas contradictorias y validar visualmente cada modulo a 100 %, 125 %, 150 %, 200 % y 400 %.

### 8. No existe evidencia de prueba completa de teclado, lector de pantalla y contraste medido

- **Estado:** NV
- **Roles afectados:** todos.
- **Ubicacion:** sistema completo.
- **Evidencia positiva:** hay idioma `es`, enlace para saltar al contenido, foco visible en varios controles, `aria-live` para mensajes, etiquetas y modo de alto contraste.
- **Limitacion:** no se ejecutaron recorridos completos con Tab/Shift+Tab/Enter/Esc, NVDA/VoiceOver ni medicion de contraste de todos los pares de color.
- **Criterios relacionados:** 11.1 a 11.24 y WCAG 1.4.3, 1.4.4, 1.4.10, 2.1.1, 2.4.7, 3.3.1, 4.1.2.
- **Correccion:** ejecutar una matriz de pruebas manuales por rol y documentar resultado, navegador, resolucion, zoom y tecnologia asistiva.

### 9. Ayuda sin busqueda por tema ni validacion de comprension

- **Estado:** P
- **Roles afectados:** todos.
- **Ubicacion:** `src/views/paciente/ayuda.ejs`, `src/views/enfermera/ayuda.ejs`, `src/views/medico/ayuda.ejs` y `src/views/admin/ayuda.ejs`.
- **Evidencia:** las pantallas de ayuda ofrecen contenido por modulo, pero no se encontro un buscador de ayuda y no hay resultados de prueba de comprension.
- **Criterios relacionados:** 10.12, 10.16 y 10.17.
- **Correccion:** agregar busqueda por palabra clave o indice de temas y probar si una persona puede resolver tareas frecuentes con la ayuda.

### 10. Falta evidencia de evaluacion con personas usuarias y SUS

- **Estado:** NV
- **Roles afectados:** todos.
- **Ubicacion:** proceso de evaluacion, no una vista concreta.
- **Evidencia:** no se encontraron actas de pruebas con paciente, enfermera, medico y administrativo, ni resultados SUS.
- **Criterios relacionados:** seccion de evaluacion de la guia, especialmente 12.11 a 12.15.
- **Correccion:** realizar al menos cinco pruebas por perfil o una muestra justificada, registrar tareas, errores, tiempo, comentarios y aplicar SUS.

## Aspectos comprobados que si estan presentes

- Rutas protegidas con autenticacion y restriccion de rol. En pruebas HTTP, cada perfil accedio a sus propios modulos y al intentar entrar en otro rol fue redirigido a su tablero.
- Validaciones de servidor y cliente para DNI, telefono, correo, contrasena robusta, fechas, datos academicos y signos vitales.
- Bloqueo temporal de cuenta despues de cinco intentos fallidos y mensajes de acceso comprensibles.
- Contraseñas almacenadas con `bcrypt`; los tokens de recuperacion se almacenan con hash y vencimiento.
- Confirmaciones, mensajes de exito/error, foco en el primer campo invalido y prevencion de doble envio.
- Enlace de salto al contenido, `lang="es"`, labels, descripciones asociadas, mensajes con `aria-live`, reduccion de movimiento y preferencias de tamano/alto contraste persistentes.
- Separacion de funciones administrativas: principal, admision y gestion de usuarios en la logica del controlador. Falta corregir el dato operativo indicado en el hallazgo 6.

## Recomendacion de cierre

Antes de presentar el sistema como conforme con la guia, se deben corregir primero los hallazgos 1, 2, 3, 5, 6 y 7. Despues se debe ejecutar la prueba manual de accesibilidad y una prueba de usabilidad con personas usuarias para convertir los criterios NV en C, P o NC con evidencia.

## Actualizacion tecnica posterior a la auditoria

Se aplicaron y verificaron las siguientes correcciones el 18/07/2026:

* La ruta publica `/test-db` ahora responde `404` y no expone detalles de MySQL.
* La sesion exige una clave de al menos 32 caracteres, usa cookie `httpOnly`, `sameSite=lax`, vencimiento de 30 minutos y almacenamiento persistente en `sesion_usuario`.
* Todas las solicitudes que modifican datos requieren token CSRF; una solicitud sin token fue comprobada con respuesta `403`.
* El token de recuperacion ya no se imprime en consola. El envio se realiza por SMTPS cuando se configuran las variables SMTP; si el correo no se envia, el token se invalida.
* El registro de pacientes exige consentimiento de privacidad y lo registra en `consentimiento_privacidad`; se incorporo una politica visible en `/privacidad`.
* La poblacion y migracion normalizan los perfiles administrativos de Admision y Gestion de usuarios.
* Se consolido el patron final de refluencia de tarjetas informativas para evitar columnas de texto fragmentado al ampliar la visualizacion.

Despues de estas correcciones, los hallazgos 1, 2, 3, 5 y 6 quedan corregidos tecnicamente. El hallazgo 4 queda condicionado a configurar un proveedor SMTP real. Siguen pendientes por su naturaleza manual las pruebas con personas usuarias, SUS, teclado, lector de pantalla, contraste medido y verificacion visual completa a 200 % y 400 %.
