# Sistema Web de Gestión de Citas Médicas - Bienestar Universitario UNT

## Descripción

Este proyecto es una plataforma web de gestión de citas médicas desarrollada para Bienestar Universitario de la Universidad Nacional de Trujillo.

El sistema permite gestionar el flujo completo de atención médica, desde la reserva de citas por parte del paciente, el registro de triaje por enfermería, la atención médica, hasta el seguimiento administrativo de usuarios y citas.

El proyecto fue desarrollado para el curso de Interacción Humano Computador, tomando como base los 10 principios heurísticos de usabilidad de Nielsen. Por ello, se priorizó una interfaz clara, consistente, fácil de usar y con validaciones que ayuden a prevenir errores.

---

## Tecnologías utilizadas

- Node.js
- Express
- EJS
- MySQL
- pnpm
- express-session
- bcrypt
- mysql2
- nodemon

---

## Roles del sistema

El sistema cuenta con cuatro tipos de usuario:

1. Paciente
2. Médico
3. Enfermera
4. Administrativo

Cada rol tiene un panel de control, menú y funcionalidades propias.

---

## Funcionalidades principales

### Autenticación

- Inicio de sesión con usuario o correo.
- Registro de pacientes.
- Recuperación de contraseña mediante token temporal.
- Cambio de contraseña desde Mi perfil.
- Cierre de sesión.
- Mensajes de éxito y error dentro de la interfaz.
- Redirección obligatoria a Mi perfil cuando un usuario usa contraseña temporal.

### Paciente

- Dashboard con indicadores.
- Reserva de citas mediante flujo por pasos.
- Visualización de citas.
- Cancelación de citas pendientes con modal de confirmación.
- Historial médico.
- Edición de perfil.
- Cambio de contraseña.

### Enfermera

- Dashboard con indicadores.
- Visualización de citas pendientes de triaje.
- Registro de signos vitales.
- Registro de síntomas y observaciones.
- Visualización de triajes realizados.
- Filtros de búsqueda.
- Mi perfil.

### Médico

- Dashboard con indicadores.
- Visualización de citas del día.
- Atención de citas con triaje registrado.
- Registro de diagnóstico, tratamiento, recomendaciones y observaciones.
- Guardado de consulta en borrador.
- Confirmación de consulta mediante modal.
- Visualización de pacientes atendidos.
- Historial por paciente.
- Mi perfil.

### Administrativo

- Dashboard con indicadores.
- Gestión de usuarios.
- Activación y desactivación de usuarios con modal.
- Registro de médicos.
- Registro de enfermeras.
- Visualización general de citas.
- Seguimiento del flujo de atención: cita, triaje, consulta, borrador o completada.

---

## Principios de usabilidad aplicados

El sistema fue diseñado tomando como referencia los 10 principios heurísticos de Nielsen:

1. Visibilidad del estado del sistema.
2. Correspondencia entre el sistema y el mundo real.
3. Control y libertad del usuario.
4. Consistencia y estándares.
5. Prevención de errores.
6. Reconocimiento antes que recuerdo.
7. Flexibilidad y eficiencia de uso.
8. Diseño estético y minimalista.
9. Ayuda a los usuarios a reconocer y recuperarse de errores.
10. Ayuda y documentación.

Se evitaron alertas del navegador como `alert()` y `confirm()`.  
Las acciones importantes utilizan modales propios del sistema.

---

## Estructura del proyecto

```txt
src/
├── controllers/
├── middlewares/
├── public/
│   ├── css/
│   └── js/
├── routes/
└── views/
    ├── layouts/
    ├── paciente/
    ├── medico/
    ├── enfermera/
    └── administrativo/

database/
├── schema.sql
└── seed.sql