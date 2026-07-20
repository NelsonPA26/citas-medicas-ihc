# Sistema Web de Gestion de Citas Medicas - Bienestar UNT

Sistema web para administrar citas medicas del area de Bienestar Universitario. El flujo principal es:

```txt
Paciente reserva cita -> Enfermera registra triaje -> Medico atiende -> Consulta queda en historial
```

El sistema trabaja con cuatro roles:

- `paciente`: reserva citas, revisa sus citas, cancela citas pendientes y consulta su historial.
- `enfermera`: ve citas pendientes de triaje, registra signos vitales y revisa historial de triajes.
- `medico`: atiende citas con triaje, guarda borradores, confirma consultas y revisa pacientes/historial.
- `administrativo`: gestiona usuarios, personal medico/enfermeria y citas segun su nivel de acceso.

## Requisitos

Antes de instalar, tener:

- Node.js LTS.
- pnpm.
- MySQL o XAMPP con MySQL activo.
- Navegador web.

Verificar versiones:

```bash
node -v
pnpm -v
```

Si no tienes pnpm:

```bash
npm install -g pnpm
```

## Instalacion

1. Abrir una terminal en la carpeta del proyecto.

2. Instalar dependencias:

```bash
pnpm install
```

3. Crear el archivo `.env` a partir de `.env.example`.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Ejemplo de `.env` para XAMPP sin clave:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=citas_medicas_ihc
SESSION_SECRET=reemplaza_esto_por_un_secreto_aleatorio_de_al_menos_32_caracteres
APP_URL=http://localhost:3000
```

## Base de datos

Los scripts utiles estan en `database/`:

- `schema.sql`: crea la base de datos y todas las tablas.
- `seed_pruebas_masivas_citas_medicas.sql`: carga usuarios y datos de prueba.
- `limpiar_bd_citas_medicas.sql`: borra datos de prueba sin eliminar las tablas.

Primera instalacion o reinicio completo:

```bash
mysql -u root < database/schema.sql
mysql -u root citas_medicas_ihc < database/seed_pruebas_masivas_citas_medicas.sql
```

Si MySQL pide clave:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p citas_medicas_ihc < database/seed_pruebas_masivas_citas_medicas.sql
```

Cuando la base ya existe y solo quieres volver a cargar datos:

```bash
mysql -u root citas_medicas_ihc < database/limpiar_bd_citas_medicas.sql
mysql -u root citas_medicas_ihc < database/seed_pruebas_masivas_citas_medicas.sql
```

Importante: el seed borra y reemplaza la data de prueba del sistema. No lo ejecutes sobre informacion real.

## Ejecutar el sistema

Modo desarrollo:

```bash
pnpm dev
```

Modo normal:

```bash
pnpm start
```

Abrir en el navegador:

```txt
http://localhost:3000
```

## Usuarios de prueba

Todos usan la contrasena:

```txt
UNT12345*
```

El inicio de sesion se realiza con el correo institucional.

Administrativos:

```txt
admin01@unitru.edu.pe
admin02@unitru.edu.pe
admin03@unitru.edu.pe
```

Medicos:

```txt
medico01@unitru.edu.pe
medico02@unitru.edu.pe
medico03@unitru.edu.pe
medico04@unitru.edu.pe
medico06@unitru.edu.pe
```

Enfermeras:

```txt
enfermera01@unitru.edu.pe
enfermera02@unitru.edu.pe
enfermera03@unitru.edu.pe
```

Pacientes:

```txt
paciente01@unitru.edu.pe
paciente02@unitru.edu.pe
...
paciente20@unitru.edu.pe
```

Tambien existen usuarios inactivos para probar validaciones: `medico05@unitru.edu.pe` y `enfermera04@unitru.edu.pe`.

## Datos que carga el seed

La poblacion masiva deja escenarios suficientes para probar los modulos:

- Cada paciente tiene citas en los estados `pendiente`, `triaje_registrado`, `en_consulta`, `completada` y `cancelada`.
- Las enfermeras activas tienen triajes registrados en varios estados para probar pendientes, activos e historial.
- Los medicos activos tienen citas listas para atender, consultas en borrador y consultas completadas para historial.
- Se cargan antecedentes, notificaciones, consentimiento de privacidad y catalogo de medicamentos para recetas.

Estados usados por las citas:

```txt
pendiente
triaje_registrado
en_consulta
completada
cancelada
```

## Archivos que no se deben entregar o subir

No incluir:

- `.env`, porque contiene configuracion local.
- `node_modules/`, porque se instala con `pnpm install`.
- `tmp/` o cache generado durante pruebas.

El archivo `.env.example` si debe quedarse, porque sirve como plantilla para configurar el proyecto.
