# Sistema Web de Gestión de Citas Médicas - Bienestar Universitario UNT

## Versión 2

Sistema web desarrollado para gestionar el proceso de citas médicas del área de Bienestar Universitario de la Universidad Nacional de Trujillo. Esta versión organiza el flujo completo de atención médica mediante cuatro roles principales: paciente, enfermera, médico y administrador.

El sistema permite registrar usuarios, reservar citas, registrar triaje, atender consultas médicas, gestionar historiales, administrar personal y controlar los estados de cada cita de forma ordenada y trazable.

---

## 1. Tecnologías utilizadas

El proyecto utiliza las siguientes tecnologías:

* Node.js
* Express.js
* EJS
* MySQL
* HTML5
* CSS3
* JavaScript
* bcrypt
* express-session
* pnpm

---

## 2. Requisitos para ejecutar el proyecto

Antes de ejecutar el sistema, se debe tener instalado:

* Node.js en versión LTS.
* pnpm.
* MySQL o XAMPP con MySQL activo.
* Git.
* Navegador web actualizado.

Para verificar Node.js:

```bash
node -v
```

Para verificar pnpm:

```bash
pnpm -v
```

Si no tienes pnpm instalado:

```bash
npm install -g pnpm
```

---

## 3. Instalación del proyecto

Clonar el repositorio:

```bash
git clone https://github.com/NelsonPA26/citas-medicas-ihc.git
```

Ingresar a la carpeta del proyecto:

```bash
cd citas-medicas-ihc
```

Instalar dependencias:

```bash
pnpm install
```

---

## 4. Configuración del archivo `.env`

El proyecto necesita un archivo `.env` en la raíz para conectarse a MySQL.

Crear un archivo llamado:

```txt
.env
```

Ejemplo de configuración local:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=citas_medicas_ihc
SESSION_SECRET=una_clave_aleatoria_de_al_menos_32_caracteres
APP_URL=http://localhost:3000
```

Si usas XAMPP normalmente `DB_USER` es `root` y `DB_PASSWORD` puede ir vacío.

Importante: el archivo `.env` no debe subirse al repositorio porque contiene datos privados de configuración local.

Para compartir la estructura de configuración, se puede subir un archivo:

```txt
.env.example
```

con este contenido:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=citas_medicas_ihc
SESSION_SECRET=una_clave_aleatoria_de_al_menos_32_caracteres
APP_URL=http://localhost:3000
```

---

## 5. Archivos de base de datos

Dentro de la carpeta `database` se utilizan principalmente estos archivos:

```txt
database/
│
├── schema.sql
├── limpiar_bd_citas_medicas.sql
└── seed_pruebas_masivas_citas_medicas.sql
```

### 5.1. `schema.sql`

Crea la base de datos desde cero.

Este archivo contiene:

```sql
DROP DATABASE IF EXISTS citas_medicas_ihc;
CREATE DATABASE citas_medicas_ihc;
USE citas_medicas_ihc;
```

También crea todas las tablas principales:

* persona
* usuario
* paciente
* medico
* enfermera
* administrativo
* cita
* triaje
* antecedente
* consulta
* notificacion
* password_reset_token

Este archivo se usa cuando se quiere reconstruir toda la base de datos.

### 5.2. `limpiar_bd_citas_medicas.sql`

Vacía los registros de la base de datos, pero conserva la estructura de las tablas.

Se usa cuando ya existe la base de datos y solo se quiere eliminar la información registrada para volver a probar.

### 5.3. `seed_pruebas_masivas_citas_medicas.sql`

Inserta datos de prueba para validar el sistema con diferentes situaciones.

Este archivo crea usuarios, pacientes, médicos, enfermeras, administradores, antecedentes, citas, triajes, consultas y notificaciones.

Permite probar el sistema con citas en diferentes estados:

* pendiente
* triaje_registrado
* en_consulta
* completada
* cancelada

---

## 6. Orden recomendado para ejecutar la base de datos

### Primera instalación o reinicio completo

Ejecutar en MySQL:

```txt
1. schema.sql
2. seed_pruebas_masivas_citas_medicas.sql
```

### Cuando solo se quiere limpiar y volver a cargar datos

Ejecutar en MySQL:

```txt
1. limpiar_bd_citas_medicas.sql
2. seed_pruebas_masivas_citas_medicas.sql
```

### Ejecución desde terminal

Si MySQL tiene contraseña:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p citas_medicas_ihc < database/seed_pruebas_masivas_citas_medicas.sql
```

Si MySQL no tiene contraseña:

```bash
mysql -u root < database/schema.sql
mysql -u root citas_medicas_ihc < database/seed_pruebas_masivas_citas_medicas.sql
```

---

## 7. Ejecución del sistema

Iniciar el servidor en modo desarrollo:

```bash
pnpm dev
```

Luego abrir en el navegador:

```txt
http://localhost:3000
```

---

## 8. Usuarios de prueba

El script de pruebas masivas crea usuarios para validar los diferentes roles.

Contraseña general de prueba:

```txt
UNT12345*
```

Correos disponibles para iniciar sesion:

```txt
admin01@unitru.edu.pe
admin02@unitru.edu.pe
admin03@unitru.edu.pe

medico01@unitru.edu.pe
medico02@unitru.edu.pe
medico03@unitru.edu.pe
medico04@unitru.edu.pe
medico05@unitru.edu.pe
medico06@unitru.edu.pe

enfermera01@unitru.edu.pe
enfermera02@unitru.edu.pe
enfermera03@unitru.edu.pe
enfermera04@unitru.edu.pe

paciente01@unitru.edu.pe
paciente02@unitru.edu.pe
paciente03@unitru.edu.pe
...
paciente20@unitru.edu.pe
```

Algunos usuarios pueden estar inactivos para probar los filtros de estado y la validación de acceso.

---

## 9. Roles del sistema

El sistema trabaja con cuatro roles:

```txt
Paciente
Enfermera
Médico
Administrador
```

Cada rol tiene permisos diferentes según su responsabilidad dentro del flujo de atención.

---

# 10. Flujo general de una cita médica

El flujo principal es:

```txt
Paciente reserva cita
        ↓
Cita queda en estado pendiente
        ↓
Enfermera registra triaje
        ↓
Cita cambia a triaje_registrado
        ↓
Médico atiende la cita
        ↓
Cita puede quedar en en_consulta si se guarda como borrador
        ↓
Médico confirma la consulta
        ↓
Cita cambia a completada
```

También existe el estado:

```txt
cancelada
```

que se utiliza cuando una cita es anulada antes de la atención médica.

---

## 11. Estados de una cita

### 11.1. Pendiente

La cita fue reservada por el paciente, pero todavía no tiene triaje registrado.

En este estado:

* El paciente puede editar la cita.
* El paciente puede cancelar la cita.
* La enfermera puede registrar el triaje.
* El médico todavía no puede atenderla porque falta el triaje.
* El administrador puede ver el detalle.
* El administrador puede cancelar la cita.

Ejemplo:

```txt
Paciente Juan reserva una cita para Medicina General.
La cita queda pendiente.
La enfermera aún no registra signos vitales.
```

---

### 11.2. Triaje registrado

La enfermera ya registró signos vitales, síntomas verificados y observaciones.

En este estado:

* El paciente ya no puede editar la cita.
* El paciente ya no debe modificar datos de la cita.
* La enfermera puede ver o editar el triaje mientras la consulta médica no haya iniciado.
* El médico ya puede atender la cita.
* El administrador puede ver el detalle.
* El administrador puede cancelar la cita si todavía no inició la consulta médica.

Ejemplo:

```txt
La enfermera registra temperatura, presión arterial, frecuencia cardiaca y síntomas.
La cita pasa de pendiente a triaje_registrado.
```

---

### 11.3. En consulta

El médico inició la atención y guardó un borrador de consulta.

En este estado:

* El paciente no puede editar ni cancelar la cita.
* La enfermera ya no debe modificar el triaje.
* El médico puede continuar la atención.
* El médico puede guardar nuevamente como borrador.
* El médico puede confirmar la consulta.
* El administrador solo debe ver el detalle, pero no cambiar el estado clínico.

Ejemplo:

```txt
El médico empieza la atención, registra parte del diagnóstico y guarda progreso.
La cita queda en_consulta.
```

---

### 11.4. Completada

El médico confirmó la consulta médica.

En este estado:

* El paciente puede ver la consulta en su historial.
* El médico puede ver el historial del paciente.
* La enfermera puede consultar el triaje registrado.
* El administrador puede ver la trazabilidad.
* Nadie debe editar la cita como si estuviera activa.
* No debe aparecer como cita pendiente de atención.

Ejemplo:

```txt
El médico registra diagnóstico y tratamiento.
Luego confirma la consulta.
La cita pasa a completada.
```

---

### 11.5. Cancelada

La cita fue cancelada antes de completarse.

En este estado:

* El paciente puede verla como cita cancelada.
* El médico no debe atenderla.
* La enfermera no debe registrar triaje.
* El administrador solo conserva el registro para trazabilidad.
* La cita cancelada no elimina el historial de reserva.

En esta versión se usa la opción segura: una cita cancelada no libera el horario, porque la base de datos conserva una restricción única por médico, fecha y hora.

Ejemplo:

```txt
El paciente cancela una cita pendiente.
El registro se conserva como cancelado.
El horario no se reutiliza automáticamente.
```

---

# 12. Permisos del paciente

El paciente puede:

* Reservar citas.
* Ver sus citas.
* Editar citas pendientes.
* Cancelar citas pendientes.
* Ver detalle de sus citas.
* Registrar o actualizar sus antecedentes.
* Ver su historial médico cuando existan consultas completadas.

## 12.1. ¿Cuándo puede editar una cita?

El paciente solo puede editar una cita cuando está en estado:

```txt
pendiente
```

No puede editar una cita si está en:

```txt
triaje_registrado
en_consulta
completada
cancelada
```

Esto evita que el paciente modifique datos cuando la atención clínica ya inició.

Ejemplo:

```txt
Si el paciente reservó una cita para el lunes a las 9:00 y aún no fue atendido por enfermería, puede editar la fecha, hora, motivo o síntomas.
```

## 12.2. ¿Cuándo puede cancelar una cita?

El paciente puede cancelar una cita solo si está en estado:

```txt
pendiente
```

No puede cancelar si ya tiene triaje, si está en consulta o si ya fue completada.

Ejemplo:

```txt
Si el paciente ya fue evaluado por enfermería, ya no debe cancelar desde su módulo porque la cita ya forma parte del proceso clínico.
```

## 12.3. ¿Cuándo puede ver historial?

El paciente ve historial cuando tiene consultas médicas completadas.

El historial muestra información como:

* médico
* especialidad
* fecha
* diagnóstico
* tratamiento
* recomendaciones
* observaciones disponibles

---

# 13. Permisos de la enfermera

La enfermera puede:

* Ver citas pendientes de triaje.
* Registrar triaje.
* Editar triaje si la consulta médica todavía no inició.
* Ver historial de triajes.
* Ver detalles de las citas relacionadas con enfermería.

## 13.1. ¿Cuándo puede registrar triaje?

La enfermera puede registrar triaje cuando la cita está en estado:

```txt
pendiente
```

Al registrar el triaje, la cita pasa a:

```txt
triaje_registrado
```

## 13.2. ¿Qué datos registra enfermería?

La enfermera registra:

* temperatura
* presión arterial
* frecuencia cardiaca
* saturación
* síntomas verificados
* observaciones de enfermería

## 13.3. ¿Cuándo puede editar un triaje?

La enfermera puede editar el triaje mientras la cita esté en:

```txt
triaje_registrado
```

No debe editarlo cuando la cita ya está en:

```txt
en_consulta
completada
cancelada
```

Esto conserva la trazabilidad clínica.

Ejemplo:

```txt
Si la enfermera registró mal la presión arterial y el médico aún no inició la consulta, puede corregir el triaje.
Si el médico ya inició la consulta, el triaje ya forma parte del registro clínico usado para la atención.
```

---

# 14. Permisos del médico

El médico puede:

* Ver citas por atender.
* Atender citas con triaje registrado.
* Guardar consulta como borrador.
* Continuar una consulta en progreso.
* Confirmar consulta médica.
* Ver pacientes relacionados.
* Ver historial clínico de pacientes atendidos.

## 14.1. ¿Cuándo puede atender una cita?

El médico puede atender una cita cuando está en estado:

```txt
triaje_registrado
en_consulta
```

No puede atender citas en estado:

```txt
pendiente
completada
cancelada
```

La cita pendiente todavía no tiene triaje, por lo tanto no debe pasar directamente al médico.

Ejemplo:

```txt
Si el paciente tiene cita pendiente pero la enfermera aún no registró signos vitales, el médico no puede iniciar consulta.
```

## 14.2. Guardar consulta como borrador

El médico puede guardar una consulta como borrador.

En ese caso:

```txt
La cita queda en estado en_consulta.
La consulta queda con borrador = 1.
```

Esto sirve cuando el médico todavía no termina de registrar diagnóstico o tratamiento.

Ejemplo:

```txt
El médico empieza a registrar el diagnóstico, pero necesita revisar antecedentes antes de confirmar.
Guarda progreso y continúa después.
```

## 14.3. Confirmar consulta

Para confirmar una consulta, el médico debe registrar como mínimo:

* diagnóstico
* tratamiento

Cuando confirma:

```txt
La cita pasa a completada.
La consulta queda con borrador = 0.
```

Ejemplo:

```txt
El médico registra diagnóstico, tratamiento, recomendaciones y confirma.
Desde ese momento, la cita ya aparece en el historial.
```

## 14.4. Pacientes del médico

El módulo de pacientes muestra personas que tienen o tuvieron citas con el médico.

El filtro recomendado en este módulo es simple:

```txt
Buscar por nombre, apellido o DNI.
```

No se usan filtros de fecha en este módulo porque puede ocultar pacientes relacionados que aún no tienen consulta completada.

---

# 15. Permisos del administrador

El administrador puede:

* Ver el panel general.
* Gestionar usuarios.
* Gestionar médicos.
* Gestionar enfermeras.
* Ver citas.
* Cancelar citas permitidas.
* Activar o desactivar usuarios.
* Cambiar acceso y rol de usuarios.
* Eliminar usuarios solo si no tienen registros históricos asociados.

## 15.1. Gestión de usuarios

El administrador puede:

* Buscar usuarios.
* Filtrar por rol.
* Filtrar por estado.
* Editar correo de acceso.
* Cambiar contraseña.
* Cambiar rol.
* Activar usuario.
* Desactivar usuario.
* Eliminar usuario si no tiene registros históricos.

No se debe eliminar un usuario con registros clínicos asociados porque se perdería trazabilidad.

Ejemplo:

```txt
Si un paciente ya tiene citas, antecedentes o historial, no se elimina.
Solo se desactiva su acceso.
```

## 15.2. Cambio de rol

El cambio de rol modifica el acceso al sistema, pero no elimina registros históricos.

Si el administrador cambia un usuario a médico y no existe ficha médica, el sistema solicita datos mínimos como:

* especialidad
* número de colegiatura
* turno

Si cambia a enfermera y no existe ficha de enfermería, el sistema solicita:

* área
* turno

Ejemplo:

```txt
Un usuario administrativo puede pasar a médico solo si se registra su ficha médica mínima.
```

## 15.3. Gestión de médicos

El administrador puede:

* Ver médicos.
* Buscar médicos.
* Registrar médico.
* Editar médico.
* Activar médico.
* Desactivar médico.
* Eliminar ficha médica solo si no tiene citas asociadas.

Si un médico tiene citas, no se elimina. Se recomienda desactivarlo.

Ejemplo:

```txt
Si medico01 ya atendió pacientes, su ficha no debe eliminarse.
Debe conservarse para mantener historial clínico.
```

## 15.4. Gestión de enfermeras

El administrador puede:

* Ver enfermeras.
* Buscar enfermeras.
* Registrar enfermera.
* Editar enfermera.
* Activar enfermera.
* Desactivar enfermera.
* Eliminar ficha de enfermería solo si no tiene triajes asociados.

Si una enfermera ya registró triajes, no debe eliminarse.

Ejemplo:

```txt
Si enfermera01 registró signos vitales en una cita, su ficha se conserva.
```

## 15.5. Gestión de citas

El administrador puede:

* Ver citas.
* Buscar citas.
* Filtrar por estado.
* Filtrar por fecha.
* Ver detalle.
* Cancelar citas en situaciones permitidas.

El administrador no debe cambiar manualmente una cita a completada o en consulta porque esos estados pertenecen al flujo clínico.

## 15.6. ¿Cuándo puede cancelar una cita el administrador?

El administrador puede cancelar citas en estado:

```txt
pendiente
triaje_registrado
```

No debe cancelar citas en:

```txt
en_consulta
completada
cancelada
```

Ejemplo:

```txt
Si una cita tiene triaje registrado pero el médico aún no inició consulta, el administrador puede cancelarla por una razón operativa.
Si la cita ya está en consulta, no debe cancelarla desde administración.
```

---

# 16. Filtros del sistema

Los filtros se definieron según la necesidad de cada módulo.

## 16.1. Administrador - Usuarios

Filtros:

* búsqueda general
* rol
* estado

Tiene sentido porque el administrador gestiona acceso, tipos de usuario y usuarios activos o inactivos.

## 16.2. Administrador - Citas

Filtros:

* búsqueda general
* estado
* fecha

Tiene sentido porque el administrador revisa distintas citas en diferentes fases del proceso.

## 16.3. Administrador - Médicos y Enfermeras

Filtro recomendado:

* búsqueda general

No se agregan muchos filtros porque son módulos más pequeños y orientados a ubicar personal por nombre, DNI, correo o datos principales.

## 16.4. Médico - Pacientes

Filtro recomendado:

* búsqueda por nombre, apellido o DNI

No se recomienda filtrar por fecha en este módulo porque el médico puede tener pacientes con citas pendientes, en consulta o completadas.

## 16.5. Paciente - Mis citas

Filtros:

* búsqueda
* fecha

Tiene sentido porque el paciente revisa sus propias citas y puede ubicarlas por fecha o información básica.

## 16.6. Enfermera - Triajes

Filtros:

* búsqueda
* fecha

Tiene sentido porque enfermería puede revisar citas pendientes, triajes registrados o historial de triajes.

---

# 17. Principios de usabilidad aplicados

El sistema busca cumplir los 10 principios de usabilidad de Nielsen:

## 17.1. Visibilidad del estado del sistema

Cada cita muestra un estado claro:

* pendiente
* triaje registrado
* en consulta
* completada
* cancelada

## 17.2. Correspondencia con el mundo real

El flujo sigue el proceso real de atención:

```txt
Paciente → Enfermera → Médico → Historial
```

## 17.3. Control y libertad del usuario

Los usuarios tienen opciones según su rol:

* cancelar
* volver
* editar
* guardar borrador
* confirmar consulta
* limpiar filtros

## 17.4. Consistencia y estándares

Los módulos usan botones, filtros, tablas, badges y mensajes con estructura similar.

## 17.5. Prevención de errores

El sistema evita acciones incorrectas:

* el médico no atiende citas sin triaje
* el paciente no edita citas ya evaluadas
* la enfermera no modifica triajes usados por el médico
* el administrador no elimina usuarios con historial
* las contraseñas requieren seguridad mínima

## 17.6. Reconocimiento antes que recuerdo

Las tablas muestran datos relevantes para que el usuario no tenga que recordar información externa.

## 17.7. Flexibilidad y eficiencia

Se usan filtros, búsqueda, paginación y acciones directas para trabajar con varios registros.

## 17.8. Diseño estético y minimalista

Los módulos muestran solo los filtros y acciones necesarias según el rol.

## 17.9. Ayuda para reconocer y corregir errores

El sistema usa mensajes claros cuando una acción no se puede realizar.

## 17.10. Ayuda y documentación

El sistema incluye textos de apoyo en formularios y notas en procesos críticos como edición de rol o atención médica.

---

# 18. Seguridad y validaciones principales

El sistema aplica validaciones como:

* DNI de 8 dígitos.
* Correo válido.
* Teléfono válido.
* Fecha de nacimiento anterior a la fecha actual.
* Contraseña segura.
* Roles válidos.
* Especialidades médicas controladas.
* Turnos permitidos.
* Bloqueo de acciones según estado de cita.
* Verificación de usuario activo en sesión.

Política de contraseña:

```txt
Mínimo 8 caracteres.
Al menos una mayúscula.
Al menos una minúscula.
Al menos un número.
Al menos un símbolo.
```

---

# 19. Consideraciones de seguridad antes de ejecutar el proyecto

Antes de ejecutar o compartir el proyecto, se debe tener en cuenta lo siguiente:

* No subir el archivo `.env` al repositorio, porque contiene datos privados de conexión local.
* Verificar que `.env` esté incluido en el archivo `.gitignore`.
* Usar `.env.example` solo como plantilla de configuración, sin contraseñas reales.
* No subir la carpeta `node_modules`, ya que las dependencias se instalan con `pnpm install`.
* Revisar que la base de datos se cree desde `schema.sql` y que los datos de prueba se carguen desde `seed_pruebas_masivas_citas_medicas.sql`.

Ejemplo recomendado para `.gitignore`:

```gitignore
node_modules/
.env
.DS_Store
```

Si el archivo `.env` fue agregado por error al seguimiento de Git, se puede quitar con:

```bash
git rm --cached .env
```

Luego verificar el estado del repositorio:

```bash
git status
```

---

# 20. Resumen de la versión 2

La versión 2 mejora el sistema en:

* Flujo clínico más consistente.
* Estados de cita mejor controlados.
* Acciones visibles según rol y estado.
* Validaciones más completas.
* Contraseñas más seguras.
* Gestión de usuarios con trazabilidad.
* Gestión de médicos y enfermeras sin pérdida de historial.
* Filtros más coherentes por módulo.
* Datos de prueba masivos para validar el funcionamiento.
* Mejoras de usabilidad visual y funcional.

Esta versión permite probar el sistema completo con distintos escenarios reales de atención médica universitaria.

---

# 21. Datos de prueba, privacidad y seguridad

## 21.1 Usuarios vigentes de la poblacion

Todos los usuarios cargados por `database/seed_pruebas_masivas_citas_medicas.sql`
usan la contrasena temporal `UNT12345*`. El inicio de sesion se realiza con el
correo institucional asociado; el seed alinea el nombre de usuario interno con ese correo.

| Rol | Usuarios activos | Usuario inactivo para prueba |
| --- | --- | --- |
| Administracion | `admin01@unitru.edu.pe`, `admin02@unitru.edu.pe`, `admin03@unitru.edu.pe` | No aplica |
| Medico | `medico01@unitru.edu.pe` a `medico04@unitru.edu.pe`, `medico06@unitru.edu.pe` | `medico05@unitru.edu.pe` |
| Enfermeria | `enfermera01@unitru.edu.pe` a `enfermera03@unitru.edu.pe` | `enfermera04@unitru.edu.pe` |
| Paciente | `paciente01@unitru.edu.pe` a `paciente20@unitru.edu.pe` | No aplica |

Perfiles administrativos:

* `admin01@unitru.edu.pe` es el administrador principal.
* `admin02@unitru.edu.pe` corresponde a Admision y opera citas/pacientes.
* `admin03@unitru.edu.pe` corresponde a Gestion de usuarios y opera pacientes, medicos y enfermeras.

Ejemplos de correo: `admin01@unitru.edu.pe`, `medico01@unitru.edu.pe`,
`enfermera01@unitru.edu.pe` y `paciente01@unitru.edu.pe`.

## 21.2 Poblacion de citas

La carga contiene 53 citas sinteticas y consistentes con el flujo clinico:

* 10 pendientes de triaje en la semana siguiente.
* 5 con triaje registrado listas para atencion medica.
* 5 en consulta con borrador medico.
* 25 completadas, con triaje y consulta para probar historiales.
* 8 canceladas para filtros, trazabilidad y estados.

Tambien carga antecedentes, notificaciones y consentimientos de privacidad de
los pacientes sinteticos. Las fechas se calculan respecto a la semana actual,
por lo que los escenarios siguen siendo utiles al volver a poblar la base.

## 21.3 Orden de carga recomendado

Para una base nueva: ejecutar `database/schema.sql` y luego
`database/seed_pruebas_masivas_citas_medicas.sql`.

Para una base existente de una version anterior: ejecutar una sola vez
`database/migrations/003_seguridad_sesiones_y_privacidad.sql`; despues ejecutar
`database/limpiar_bd_citas_medicas.sql` y el seed si se desea reiniciar la data.
El seed vacia las tablas de negocio antes de poblarlas, por lo que no debe
ejecutarse sobre informacion real.

## 21.4 Variables de entorno necesarias

`SESSION_SECRET` debe ser aleatorio y tener al menos 32 caracteres. Para enviar
recuperaciones de contrasena configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD` y `SMTP_FROM`; el proyecto usa SMTPS con TLS implicito, normalmente
en el puerto `465`. Revise `.env.example` como plantilla y nunca suba `.env` al
repositorio.
