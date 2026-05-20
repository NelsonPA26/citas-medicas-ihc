USE citas_medicas_ihc;

-- =========================================================
-- DATOS DE PRUEBA
-- Contraseña para todos los usuarios: 123456
-- Hash bcrypt generado previamente
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notificacion;
TRUNCATE TABLE consulta;
TRUNCATE TABLE antecedente;
TRUNCATE TABLE triaje;
TRUNCATE TABLE cita;
TRUNCATE TABLE administrativo;
TRUNCATE TABLE enfermera;
TRUNCATE TABLE medico;
TRUNCATE TABLE paciente;
TRUNCATE TABLE usuario;
TRUNCATE TABLE persona;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. PACIENTE DE PRUEBA
-- =========================================================

INSERT INTO persona (
  nombres,
  apellido_paterno,
  apellido_materno,
  dni,
  fecha_nacimiento,
  sexo,
  correo,
  telefono,
  direccion
) VALUES (
  'Juan Carlos',
  'Pérez',
  'Ramírez',
  '12345678',
  '2002-05-10',
  'Masculino',
  'paciente01@unt.edu.pe',
  '987654321',
  'Av. Universitaria 123'
);

INSERT INTO usuario (
  id_persona,
  username,
  password_hash,
  rol,
  activo,
  debe_cambiar_password
) VALUES (
  LAST_INSERT_ID(),
  'paciente01',
  '$2b$10$fB9a94ay4ePokJAymQ.NqO.dB9yviR4KGPVMBbrhcFLQBjiIyRHh6',
  'paciente',
  1,
  0
);

INSERT INTO paciente (
  id_persona,
  codigo_estudiante,
  escuela,
  facultad,
  contexto_universitario
) VALUES (
  1,
  '2020123456',
  'Ingeniería Informática',
  'Facultad de Ingeniería',
  'Estudiante regular'
);

-- =========================================================
-- 2. MÉDICO DE PRUEBA
-- =========================================================

INSERT INTO persona (
  nombres,
  apellido_paterno,
  apellido_materno,
  dni,
  fecha_nacimiento,
  sexo,
  correo,
  telefono,
  direccion
) VALUES (
  'Carlos Alberto',
  'Gómez',
  'Fernández',
  '23456789',
  '1980-03-15',
  'Masculino',
  'medico01@unt.edu.pe',
  '976543210',
  'Av. América Norte 456'
);

INSERT INTO usuario (
  id_persona,
  username,
  password_hash,
  rol,
  activo,
  debe_cambiar_password
) VALUES (
  LAST_INSERT_ID(),
  'medico01',
  '$2b$10$fB9a94ay4ePokJAymQ.NqO.dB9yviR4KGPVMBbrhcFLQBjiIyRHh6',
  'medico',
  1,
  0
);

INSERT INTO medico (
  id_persona,
  especialidad,
  numero_colegiatura,
  turno
) VALUES (
  2,
  'Medicina General',
  'CMP-10001',
  'completo'
);

-- =========================================================
-- 3. ENFERMERA DE PRUEBA
-- =========================================================

INSERT INTO persona (
  nombres,
  apellido_paterno,
  apellido_materno,
  dni,
  fecha_nacimiento,
  sexo,
  correo,
  telefono,
  direccion
) VALUES (
  'María Elena',
  'Torres',
  'Salazar',
  '34567890',
  '1988-08-20',
  'Femenino',
  'enfermera01@unt.edu.pe',
  '965432109',
  'Jr. Los Pinos 789'
);

INSERT INTO usuario (
  id_persona,
  username,
  password_hash,
  rol,
  activo,
  debe_cambiar_password
) VALUES (
  LAST_INSERT_ID(),
  'enfermera01',
  '$2b$10$fB9a94ay4ePokJAymQ.NqO.dB9yviR4KGPVMBbrhcFLQBjiIyRHh6',
  'enfermera',
  1,
  0
);

INSERT INTO enfermera (
  id_persona,
  area,
  turno
) VALUES (
  3,
  'Triaje',
  'completo'
);

-- =========================================================
-- 4. ADMINISTRATIVO DE PRUEBA
-- =========================================================

INSERT INTO persona (
  nombres,
  apellido_paterno,
  apellido_materno,
  dni,
  fecha_nacimiento,
  sexo,
  correo,
  telefono,
  direccion
) VALUES (
  'Ana Lucía',
  'Rojas',
  'Castillo',
  '45678901',
  '1990-11-05',
  'Femenino',
  'admin01@unt.edu.pe',
  '954321098',
  'Oficina Bienestar Universitario UNT'
);

INSERT INTO usuario (
  id_persona,
  username,
  password_hash,
  rol,
  activo,
  debe_cambiar_password
) VALUES (
  LAST_INSERT_ID(),
  'admin01',
  '$2b$10$fB9a94ay4ePokJAymQ.NqO.dB9yviR4KGPVMBbrhcFLQBjiIyRHh6',
  'administrativo',
  1,
  0
);

INSERT INTO administrativo (
  id_persona,
  cargo,
  anexo
) VALUES (
  4,
  'Responsable de Bienestar Universitario',
  '101'
);

-- =========================================================
-- 5. ANTECEDENTE INICIAL DEL PACIENTE
-- =========================================================

INSERT INTO antecedente (
  id_paciente,
  alergias,
  enfermedades_previas,
  medicacion_actual,
  cirugias,
  antecedentes_familiares,
  observaciones
) VALUES (
  1,
  'No refiere alergias conocidas.',
  'No registra enfermedades crónicas.',
  'No consume medicación permanente.',
  'No registra cirugías previas.',
  'Padre con hipertensión arterial.',
  'Paciente de prueba para validación del sistema.'
);

-- =========================================================
-- 6. CITA DE PRUEBA
-- =========================================================

INSERT INTO cita (
  id_paciente,
  id_medico,
  fecha,
  hora,
  motivo,
  estado
) VALUES (
  1,
  1,
  CURDATE(),
  '09:00:00',
  'Control médico general',
  'pendiente'
);

-- =========================================================
-- 7. NOTIFICACIONES DE PRUEBA
-- =========================================================

INSERT INTO notificacion (
  id_usuario,
  titulo,
  mensaje,
  leida
) VALUES
(
  1,
  'Cita registrada',
  'Tu cita médica fue registrada correctamente para el día de hoy a las 09:00.',
  0
),
(
  2,
  'Cita asignada',
  'Tienes una cita médica pendiente para atender hoy a las 09:00.',
  0
),
(
  3,
  'Triaje pendiente',
  'Hay una cita pendiente de triaje para el día de hoy.',
  0
);