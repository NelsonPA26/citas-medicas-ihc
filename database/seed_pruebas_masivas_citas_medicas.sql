USE citas_medicas_ihc;

-- =========================================================
-- SEED MASIVO DE PRUEBAS - SISTEMA DE CITAS MÉDICAS IHC
-- Contraseña para todos los usuarios: UNT12345*
-- Este script LIMPIA la base de datos y luego inserta datos de prueba.
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE sesion_usuario;
TRUNCATE TABLE password_reset_token;
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
TRUNCATE TABLE consentimiento_privacidad;
TRUNCATE TABLE persona;
SET FOREIGN_KEY_CHECKS = 1;

SET @HASH := '$2b$10$vdNqHjCk8LPdHTLV3B6iweJAWJ81jdlX4SzgZuqb8S0kekaeyGE8u';
SET @SEMANA_ANT := DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY);
SET @SEMANA_ACT := DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY);
SET @SEMANA_SIG := DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY);
SET @SEMANA_HIST1 := DATE_SUB(@SEMANA_ANT, INTERVAL 7 DAY);
SET @SEMANA_HIST2 := DATE_SUB(@SEMANA_ANT, INTERVAL 14 DAY);


-- Usuario admin01 (administrativo)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Ana Lucía', 'Rojas', 'Castillo', '45678901', '1990-11-05', 'Femenino', 'admin01@unitru.edu.pe', '954321098', 'Oficina de Bienestar Universitario');
SET @admin01_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@admin01_persona, 'admin01', @HASH, 'administrativo', 1, 0);
SET @admin01_usuario := LAST_INSERT_ID();
INSERT INTO administrativo (id_persona, cargo, nivel_acceso) VALUES (@admin01_persona, 'Gestión de usuarios', 'principal');
SET @admin01 := LAST_INSERT_ID();

-- Usuario admin02 (administrativo)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Jorge Manuel', 'Campos', 'Vera', '45678902', '1986-04-19', 'Masculino', 'admin02@unitru.edu.pe', '954321099', 'Módulo de atención administrativa');
SET @admin02_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@admin02_persona, 'admin02', @HASH, 'administrativo', 1, 0);
SET @admin02_usuario := LAST_INSERT_ID();
INSERT INTO administrativo (id_persona, cargo, nivel_acceso) VALUES (@admin02_persona, 'Admisión', 'operativo');
SET @admin02 := LAST_INSERT_ID();

-- Usuario admin03 (administrativo operativo de gestion de usuarios)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Mariana Sofia', 'Paredes', 'Vega', '45678903', '1992-09-08', 'Femenino', 'admin03@unitru.edu.pe', '954321100', 'Oficina de Bienestar Universitario');
SET @admin03_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@admin03_persona, 'admin03', @HASH, 'administrativo', 1, 0);
SET @admin03_usuario := LAST_INSERT_ID();
INSERT INTO administrativo (id_persona, cargo, nivel_acceso) VALUES (@admin03_persona, 'Gestión de usuarios', 'operativo');
SET @admin03 := LAST_INSERT_ID();

-- Usuario medico01 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Carlos Alberto', 'Gómez', 'Fernández', '23456789', '1980-03-15', 'Masculino', 'medico01@unitru.edu.pe', '976543210', 'Consultorio 1');
SET @medico01_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico01_persona, 'medico01', @HASH, 'medico', 1, 0);
SET @medico01_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico01_persona, 'Medicina General', 'CMP-10001', 'completo');
SET @medico01 := LAST_INSERT_ID();

-- Usuario medico02 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Roxana Milagros', 'Mendoza', 'Paredes', '23456790', '1982-07-22', 'Femenino', 'medico02@unitru.edu.pe', '976543211', 'Consultorio odontológico');
SET @medico02_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico02_persona, 'medico02', @HASH, 'medico', 1, 0);
SET @medico02_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico02_persona, 'Odontología', 'COP-20002', 'mañana');
SET @medico02 := LAST_INSERT_ID();

-- Usuario medico03 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Luis Enrique', 'Herrera', 'Sánchez', '23456791', '1979-01-30', 'Masculino', 'medico03@unitru.edu.pe', '976543212', 'Consultorio psicológico');
SET @medico03_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico03_persona, 'medico03', @HASH, 'medico', 1, 0);
SET @medico03_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico03_persona, 'Psicología', 'CPSP-30003', 'tarde');
SET @medico03 := LAST_INSERT_ID();

-- Usuario medico04 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Valeria Isabel', 'Salazar', 'Ríos', '23456792', '1985-09-12', 'Femenino', 'medico04@unitru.edu.pe', '976543213', 'Consultorio 2');
SET @medico04_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico04_persona, 'medico04', @HASH, 'medico', 1, 0);
SET @medico04_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico04_persona, 'Medicina General', 'CMP-10004', 'mañana');
SET @medico04 := LAST_INSERT_ID();

-- Usuario medico05 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Diego Armando', 'Castro', 'Luna', '23456793', '1977-12-03', 'Masculino', 'medico05@unitru.edu.pe', '976543214', 'Consultorio odontológico 2');
SET @medico05_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico05_persona, 'medico05', @HASH, 'medico', 0, 0);
SET @medico05_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico05_persona, 'Odontología', 'COP-20005', 'tarde');
SET @medico05 := LAST_INSERT_ID();

-- Usuario medico06 (medico)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Patricia Elena', 'Núñez', 'Aguilar', '23456794', '1984-05-27', 'Femenino', 'medico06@unitru.edu.pe', '976543215', 'Consultorio psicológico 2');
SET @medico06_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@medico06_persona, 'medico06', @HASH, 'medico', 1, 0);
SET @medico06_usuario := LAST_INSERT_ID();
INSERT INTO medico (id_persona, especialidad, numero_colegiatura, turno) VALUES (@medico06_persona, 'Psicología', 'CPSP-30006', 'completo');
SET @medico06 := LAST_INSERT_ID();

-- Usuario enfermera01 (enfermera)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('María Elena', 'Torres', 'Salazar', '34567890', '1988-08-20', 'Femenino', 'enfermera01@unitru.edu.pe', '965432109', 'Área de triaje');
SET @enf01_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@enf01_persona, 'enfermera01', @HASH, 'enfermera', 1, 0);
SET @enf01_usuario := LAST_INSERT_ID();
INSERT INTO enfermera (id_persona, area, turno) VALUES (@enf01_persona, 'Triaje', 'completo');
SET @enf01 := LAST_INSERT_ID();

-- Usuario enfermera02 (enfermera)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Rosa Beatriz', 'Quispe', 'Cabrera', '34567891', '1991-02-14', 'Femenino', 'enfermera02@unitru.edu.pe', '965432110', 'Área de triaje');
SET @enf02_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@enf02_persona, 'enfermera02', @HASH, 'enfermera', 1, 0);
SET @enf02_usuario := LAST_INSERT_ID();
INSERT INTO enfermera (id_persona, area, turno) VALUES (@enf02_persona, 'Triaje', 'mañana');
SET @enf02 := LAST_INSERT_ID();

-- Usuario enfermera03 (enfermera)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Teresa Abigail', 'Vásquez', 'Mori', '34567892', '1987-10-18', 'Femenino', 'enfermera03@unitru.edu.pe', '965432111', 'Área de enfermería');
SET @enf03_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@enf03_persona, 'enfermera03', @HASH, 'enfermera', 1, 0);
SET @enf03_usuario := LAST_INSERT_ID();
INSERT INTO enfermera (id_persona, area, turno) VALUES (@enf03_persona, 'Enfermería general', 'tarde');
SET @enf03 := LAST_INSERT_ID();

-- Usuario enfermera04 (enfermera)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Carmen Luz', 'Ramírez', 'Flores', '34567893', '1989-06-07', 'Femenino', 'enfermera04@unitru.edu.pe', '965432112', 'Área de triaje');
SET @enf04_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@enf04_persona, 'enfermera04', @HASH, 'enfermera', 0, 0);
SET @enf04_usuario := LAST_INSERT_ID();
INSERT INTO enfermera (id_persona, area, turno) VALUES (@enf04_persona, 'Triaje', 'completo');
SET @enf04 := LAST_INSERT_ID();

-- Usuario paciente01 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Juan Carlos', 'Pérez', 'Ramírez', '70000001', '2002-05-10', 'Masculino', 'paciente01@unitru.edu.pe', '987650001', 'Av. Universitaria 101');
SET @pac01_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac01_persona, 'paciente01', @HASH, 'paciente', 1, 0);
SET @pac01_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac01_persona, '2020123001', 'Ingeniería Informática', 'Ingeniería', 'Estudiante regular');
SET @pac01 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac01, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente02 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Lucero Milagros', 'Vargas', 'Lozano', '70000002', '2003-08-21', 'Femenino', 'paciente02@unitru.edu.pe', '987650002', 'Av. América Sur 205');
SET @pac02_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac02_persona, 'paciente02', @HASH, 'paciente', 1, 0);
SET @pac02_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac02_persona, '2021123002', 'Derecho', 'Derecho y Ciencias Políticas', 'Estudiante regular');
SET @pac02 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac02, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente03 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Marco Antonio', 'León', 'Díaz', '70000003', '2001-02-17', 'Masculino', 'paciente03@unitru.edu.pe', '987650003', 'Urb. San Andrés 301');
SET @pac03_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac03_persona, 'paciente03', @HASH, 'paciente', 1, 0);
SET @pac03_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac03_persona, '2019123003', 'Medicina', 'Medicina', 'Internado');
SET @pac03 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac03, 'Alergia referida a penicilina.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente04 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Noely Mercedes', 'Pérez', 'Loyola', '70000004', '2004-11-09', 'Femenino', 'paciente04@unitru.edu.pe', '987650004', 'Jr. Los Laureles 405');
SET @pac04_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac04_persona, 'paciente04', @HASH, 'paciente', 1, 0);
SET @pac04_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac04_persona, '2022123004', 'Enfermería', 'Ciencias de la Salud', 'Estudiante regular');
SET @pac04 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac04, 'No refiere alergias conocidas.', 'Asma leve controlada.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente05 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Sebastián Martín', 'Olivares', 'Sánchez', '70000005', '2002-12-01', 'Masculino', 'paciente05@unitru.edu.pe', '987650005', 'Av. Húsares 510');
SET @pac05_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac05_persona, 'paciente05', @HASH, 'paciente', 1, 0);
SET @pac05_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac05_persona, '2020123005', 'Ingeniería de Sistemas', 'Ingeniería', 'Estudiante regular');
SET @pac05 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac05, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'Loratadina ocasional según síntomas alérgicos.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente06 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Yahaira Cristina', 'Valderrama', 'Ramos', '70000006', '2003-03-23', 'Femenino', 'paciente06@unitru.edu.pe', '987650006', 'Urb. Monserrate 606');
SET @pac06_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac06_persona, 'paciente06', @HASH, 'paciente', 1, 0);
SET @pac06_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac06_persona, '2021123006', 'Psicología', 'Ciencias Sociales', 'Estudiante regular');
SET @pac06 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac06, 'Alergia referida a penicilina.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente07 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Nelson Giordano', 'Pineda', 'Arrascue', '70000007', '2001-07-14', 'Masculino', 'paciente07@unitru.edu.pe', '987650007', 'Av. España 707');
SET @pac07_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac07_persona, 'paciente07', @HASH, 'paciente', 1, 0);
SET @pac07_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac07_persona, '2019123007', 'Ingeniería Informática', 'Ingeniería', 'Estudiante regular');
SET @pac07 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac07, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente08 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Jhan Raul Nick', 'Salirrosas', 'Zumaeta', '70000008', '2002-09-30', 'Masculino', 'paciente08@unitru.edu.pe', '987650008', 'Urb. California 808');
SET @pac08_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac08_persona, 'paciente08', @HASH, 'paciente', 1, 0);
SET @pac08_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac08_persona, '2020123008', 'Administración', 'Ciencias Económicas', 'Estudiante regular');
SET @pac08 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac08, 'No refiere alergias conocidas.', 'Asma leve controlada.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente09 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Diana Carolina', 'Reyes', 'Mendoza', '70000009', '2000-04-05', 'Femenino', 'paciente09@unitru.edu.pe', '987650009', 'La Noria 909');
SET @pac09_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac09_persona, 'paciente09', @HASH, 'paciente', 1, 0);
SET @pac09_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac09_persona, '2018123009', 'Contabilidad', 'Ciencias Económicas', 'Egresante');
SET @pac09 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac09, 'Alergia referida a penicilina.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente10 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Luis Fernando', 'Torres', 'Aguilar', '70000010', '1999-06-11', 'Masculino', 'paciente10@unitru.edu.pe', '987650010', 'Natasha Alta 1001');
SET @pac10_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac10_persona, 'paciente10', @HASH, 'paciente', 1, 0);
SET @pac10_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac10_persona, '2017123010', 'Arquitectura', 'Ingeniería', 'Egresante');
SET @pac10 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac10, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'Loratadina ocasional según síntomas alérgicos.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente11 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Camila Fernanda', 'Morales', 'Paz', '70000011', '2004-01-19', 'Femenino', 'paciente11@unitru.edu.pe', '987650011', 'Covicorti 1111');
SET @pac11_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac11_persona, 'paciente11', @HASH, 'paciente', 1, 0);
SET @pac11_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac11_persona, '2022123011', 'Educación Inicial', 'Educación', 'Estudiante regular');
SET @pac11 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac11, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente12 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('André Nicolás', 'Chávez', 'Silva', '70000012', '2003-10-25', 'Masculino', 'paciente12@unitru.edu.pe', '987650012', 'San Isidro 1212');
SET @pac12_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac12_persona, 'paciente12', @HASH, 'paciente', 1, 0);
SET @pac12_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac12_persona, '2021123012', 'Ingeniería Civil', 'Ingeniería', 'Estudiante regular');
SET @pac12 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac12, 'Alergia referida a penicilina.', 'Asma leve controlada.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente13 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Fiorella Estefany', 'Cruz', 'Vega', '70000013', '2002-08-08', 'Femenino', 'paciente13@unitru.edu.pe', '987650013', 'El Recreo 1313');
SET @pac13_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac13_persona, 'paciente13', @HASH, 'paciente', 1, 0);
SET @pac13_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac13_persona, '2020123013', 'Biología', 'Ciencias Biológicas', 'Estudiante regular');
SET @pac13 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac13, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente14 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Bryan Alexander', 'Rojas', 'Cerna', '70000014', '2001-12-20', 'Masculino', 'paciente14@unitru.edu.pe', '987650014', 'Santo Dominguito 1414');
SET @pac14_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac14_persona, 'paciente14', @HASH, 'paciente', 1, 0);
SET @pac14_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac14_persona, '2019123014', 'Física', 'Ciencias Físicas', 'Estudiante regular');
SET @pac14 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac14, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente15 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('María José', 'Gutiérrez', 'Huamán', '70000015', '2000-05-26', 'Femenino', 'paciente15@unitru.edu.pe', '987650015', 'Trupal 1515');
SET @pac15_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac15_persona, 'paciente15', @HASH, 'paciente', 1, 0);
SET @pac15_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac15_persona, '2018123015', 'Trabajo Social', 'Ciencias Sociales', 'Estudiante regular');
SET @pac15 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac15, 'Alergia referida a penicilina.', 'No registra enfermedades crónicas.', 'Loratadina ocasional según síntomas alérgicos.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente16 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('José Miguel', 'Campos', 'Ruiz', '70000016', '1998-02-02', 'Masculino', 'paciente16@unitru.edu.pe', '987650016', 'Los Jardines 1616');
SET @pac16_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac16_persona, 'paciente16', @HASH, 'paciente', 1, 0);
SET @pac16_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac16_persona, '2016123016', 'Agronomía', 'Ciencias Agropecuarias', 'Egresante');
SET @pac16 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac16, 'No refiere alergias conocidas.', 'Asma leve controlada.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente17 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Karla Sofía', 'Navarro', 'Benites', '70000017', '2003-07-07', 'Femenino', 'paciente17@unitru.edu.pe', '987650017', 'Moche 1717');
SET @pac17_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac17_persona, 'paciente17', @HASH, 'paciente', 1, 0);
SET @pac17_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac17_persona, '2021123017', 'Odontología', 'Estomatología', 'Estudiante regular');
SET @pac17 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac17, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente18 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Renato Alonso', 'Mejía', 'Ponce', '70000018', '2002-11-28', 'Masculino', 'paciente18@unitru.edu.pe', '987650018', 'Buenos Aires 1818');
SET @pac18_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac18_persona, 'paciente18', @HASH, 'paciente', 1, 0);
SET @pac18_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac18_persona, '2020123018', 'Ingeniería Mecánica', 'Ingeniería', 'Estudiante regular');
SET @pac18 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac18, 'Alergia referida a penicilina.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente19 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Valentina Nicole', 'Santos', 'Rivera', '70000019', '2004-03-16', 'Femenino', 'paciente19@unitru.edu.pe', '987650019', 'Las Quintanas 1919');
SET @pac19_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac19_persona, 'paciente19', @HASH, 'paciente', 1, 0);
SET @pac19_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac19_persona, '2022123019', 'Comunicación Social', 'Educación', 'Estudiante regular');
SET @pac19 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac19, 'No refiere alergias conocidas.', 'No registra enfermedades crónicas.', 'No consume medicación actualmente.', 'No registra cirugías previas.', 'Padre con hipertensión arterial.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- Usuario paciente20 (paciente)
INSERT INTO persona (nombres, apellido_paterno, apellido_materno, dni, fecha_nacimiento, sexo, correo, telefono, direccion) VALUES ('Mateo Gabriel', 'Salas', 'Ortega', '70000020', '2001-09-09', 'Masculino', 'paciente20@unitru.edu.pe', '987650020', 'La Merced 2020');
SET @pac20_persona := LAST_INSERT_ID();
INSERT INTO usuario (id_persona, username, password_hash, rol, activo, debe_cambiar_password) VALUES (@pac20_persona, 'paciente20', @HASH, 'paciente', 1, 0);
SET @pac20_usuario := LAST_INSERT_ID();
INSERT INTO paciente (id_persona, codigo_estudiante, escuela, facultad, contexto_universitario) VALUES (@pac20_persona, '2019123020', 'Ingeniería Industrial', 'Ingeniería', 'Estudiante regular');
SET @pac20 := LAST_INSERT_ID();
INSERT INTO antecedente (id_paciente, alergias, enfermedades_previas, medicacion_actual, cirugias, antecedentes_familiares, observaciones) VALUES (@pac20, 'No refiere alergias conocidas.', 'Asma leve controlada.', 'Loratadina ocasional según síntomas alérgicos.', 'No registra cirugías previas.', 'Madre con diabetes mellitus tipo 2.', 'Antecedentes declarados por el paciente para pruebas del sistema.');

-- El correo institucional es la única credencial visible de acceso.
UPDATE usuario u
INNER JOIN persona p ON p.id_persona = u.id_persona
SET u.username = p.correo;

-- cita01: paciente @pac01, médico @medico01, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '09:00:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita01 := LAST_INSERT_ID();

-- cita02: paciente @pac02, médico @medico02, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico02, DATE_ADD(@SEMANA_SIG, INTERVAL 1 DAY), '09:30:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita02 := LAST_INSERT_ID();

-- cita03: paciente @pac03, médico @medico03, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico03, DATE_ADD(@SEMANA_SIG, INTERVAL 2 DAY), '10:00:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita03 := LAST_INSERT_ID();

-- cita04: paciente @pac04, médico @medico04, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac04, @medico04, DATE_ADD(@SEMANA_SIG, INTERVAL 3 DAY), '10:30:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita04 := LAST_INSERT_ID();

-- cita05: paciente @pac05, médico @medico06, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico06, DATE_ADD(@SEMANA_SIG, INTERVAL 4 DAY), '11:00:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita05 := LAST_INSERT_ID();

-- cita06: paciente @pac06, médico @medico01, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac06, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '11:30:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita06 := LAST_INSERT_ID();

-- cita07: paciente @pac07, médico @medico02, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac07, @medico02, DATE_ADD(@SEMANA_SIG, INTERVAL 1 DAY), '12:00:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita07 := LAST_INSERT_ID();

-- cita08: paciente @pac08, médico @medico03, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac08, @medico03, DATE_ADD(@SEMANA_SIG, INTERVAL 2 DAY), '12:30:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita08 := LAST_INSERT_ID();

-- cita09: paciente @pac09, médico @medico04, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac09, @medico04, DATE_ADD(@SEMANA_SIG, INTERVAL 3 DAY), '13:00:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita09 := LAST_INSERT_ID();

-- cita10: paciente @pac10, médico @medico06, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac10, @medico06, DATE_ADD(@SEMANA_SIG, INTERVAL 4 DAY), '13:30:00', 'Malestar general, Cansancio', 'Reserva pendiente para validación de triaje', 'pendiente');
SET @cita10 := LAST_INSERT_ID();

-- cita11: paciente @pac11, médico @medico01, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac11, @medico01, DATE_ADD(@SEMANA_ACT, INTERVAL 0 DAY), '14:00:00', 'Fiebre, Dolor de garganta', 'Paciente enviado a evaluación médica después de triaje', 'triaje_registrado');
SET @cita11 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita11, @enf01, 37.8, '118/76', 82, 98, 'Fiebre, Dolor de garganta', 'Paciente estable, pasa a consulta médica.');

-- cita12: paciente @pac12, médico @medico02, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac12, @medico02, DATE_ADD(@SEMANA_ACT, INTERVAL 1 DAY), '14:30:00', 'Fiebre, Dolor de garganta', 'Paciente enviado a evaluación médica después de triaje', 'triaje_registrado');
SET @cita12 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita12, @enf02, 37.8, '118/76', 82, 98, 'Fiebre, Dolor de garganta', 'Paciente estable, pasa a consulta médica.');

-- cita13: paciente @pac13, médico @medico03, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac13, @medico03, DATE_ADD(@SEMANA_ACT, INTERVAL 2 DAY), '15:00:00', 'Fiebre, Dolor de garganta', 'Paciente enviado a evaluación médica después de triaje', 'triaje_registrado');
SET @cita13 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita13, @enf03, 37.8, '118/76', 82, 98, 'Fiebre, Dolor de garganta', 'Paciente estable, pasa a consulta médica.');

-- cita14: paciente @pac14, médico @medico04, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac14, @medico04, DATE_ADD(@SEMANA_ACT, INTERVAL 3 DAY), '15:30:00', 'Fiebre, Dolor de garganta', 'Paciente enviado a evaluación médica después de triaje', 'triaje_registrado');
SET @cita14 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita14, @enf01, 37.8, '118/76', 82, 98, 'Fiebre, Dolor de garganta', 'Paciente estable, pasa a consulta médica.');

-- cita15: paciente @pac15, médico @medico06, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac15, @medico06, DATE_ADD(@SEMANA_ACT, INTERVAL 4 DAY), '16:00:00', 'Fiebre, Dolor de garganta', 'Paciente enviado a evaluación médica después de triaje', 'triaje_registrado');
SET @cita15 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita15, @enf02, 37.8, '118/76', 82, 98, 'Fiebre, Dolor de garganta', 'Paciente estable, pasa a consulta médica.');

-- cita16: paciente @pac16, médico @medico01, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac16, @medico01, DATE_ADD(@SEMANA_ACT, INTERVAL 0 DAY), '09:00:00', 'Ansiedad, Insomnio', 'Consulta en proceso con borrador médico', 'en_consulta');
SET @cita16 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita16, @enf01, 36.9, '115/74', 78, 99, 'Ansiedad, Insomnio', 'Signos vitales dentro de rango. Se deriva a médico.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita16, 'Evaluación clínica en curso', 'Tratamiento pendiente de confirmación médica.', 'Continuar evaluación y completar anamnesis.', 'Borrador generado para probar continuidad de atención.', 0, 1);

-- cita17: paciente @pac17, médico @medico02, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac17, @medico02, DATE_ADD(@SEMANA_ACT, INTERVAL 1 DAY), '09:30:00', 'Ansiedad, Insomnio', 'Consulta en proceso con borrador médico', 'en_consulta');
SET @cita17 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita17, @enf02, 36.9, '115/74', 78, 99, 'Ansiedad, Insomnio', 'Signos vitales dentro de rango. Se deriva a médico.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita17, 'Evaluación clínica en curso', 'Tratamiento pendiente de confirmación médica.', 'Continuar evaluación y completar anamnesis.', 'Borrador generado para probar continuidad de atención.', 0, 1);

-- cita18: paciente @pac18, médico @medico03, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac18, @medico03, DATE_ADD(@SEMANA_ACT, INTERVAL 2 DAY), '10:00:00', 'Ansiedad, Insomnio', 'Consulta en proceso con borrador médico', 'en_consulta');
SET @cita18 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita18, @enf03, 36.9, '115/74', 78, 99, 'Ansiedad, Insomnio', 'Signos vitales dentro de rango. Se deriva a médico.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita18, 'Evaluación clínica en curso', 'Tratamiento pendiente de confirmación médica.', 'Continuar evaluación y completar anamnesis.', 'Borrador generado para probar continuidad de atención.', 0, 1);

-- cita19: paciente @pac19, médico @medico04, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac19, @medico04, DATE_ADD(@SEMANA_ACT, INTERVAL 3 DAY), '10:30:00', 'Ansiedad, Insomnio', 'Consulta en proceso con borrador médico', 'en_consulta');
SET @cita19 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita19, @enf01, 36.9, '115/74', 78, 99, 'Ansiedad, Insomnio', 'Signos vitales dentro de rango. Se deriva a médico.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita19, 'Evaluación clínica en curso', 'Tratamiento pendiente de confirmación médica.', 'Continuar evaluación y completar anamnesis.', 'Borrador generado para probar continuidad de atención.', 0, 1);

-- cita20: paciente @pac20, médico @medico06, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac20, @medico06, DATE_ADD(@SEMANA_ACT, INTERVAL 4 DAY), '11:00:00', 'Ansiedad, Insomnio', 'Consulta en proceso con borrador médico', 'en_consulta');
SET @cita20 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita20, @enf02, 36.9, '115/74', 78, 99, 'Ansiedad, Insomnio', 'Signos vitales dentro de rango. Se deriva a médico.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita20, 'Evaluación clínica en curso', 'Tratamiento pendiente de confirmación médica.', 'Continuar evaluación y completar anamnesis.', 'Borrador generado para probar continuidad de atención.', 0, 1);

-- cita21: paciente @pac01, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_ANT, INTERVAL 0 DAY), '09:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita21 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita21, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita21, 'Cefalea tensional', 'Tratamiento sintomático según evaluación médica.', 'Reposo relativo e hidratación.', 'Evolución favorable.', 0, 0);

-- cita22: paciente @pac02, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico02, DATE_ADD(@SEMANA_ANT, INTERVAL 1 DAY), '09:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita22 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita22, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita22, 'Faringitis aguda', 'Manejo sintomático y control de signos de alarma.', 'Evitar bebidas frías y acudir si presenta fiebre persistente.', 'Sin complicaciones.', 0, 0);

-- cita23: paciente @pac03, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico03, DATE_ADD(@SEMANA_ANT, INTERVAL 2 DAY), '10:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita23 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita23, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita23, 'Gastritis / dispepsia', 'Dieta blanda, hidratación y reevaluación si persiste dolor abdominal.', 'Evitar irritantes gástricos.', 'Se indica seguimiento.', 0, 0);

-- cita24: paciente @pac04, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac04, @medico04, DATE_ADD(@SEMANA_ANT, INTERVAL 3 DAY), '10:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita24 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita24, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita24, 'Ansiedad en evaluación', 'Orientación inicial y derivación a psicología si persiste sintomatología.', 'Rutina de sueño y seguimiento.', 'Paciente acepta recomendaciones.', 0, 0);

-- cita25: paciente @pac05, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico06, DATE_ADD(@SEMANA_ANT, INTERVAL 4 DAY), '11:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita25 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita25, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita25, 'Rinitis alérgica', 'Medicación según evaluación médica, antecedentes y alergias referidas.', 'Control ambiental y seguimiento.', 'Cuadro leve.', 0, 0);

-- cita26: paciente @pac06, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac06, @medico01, DATE_ADD(@SEMANA_ANT, INTERVAL 0 DAY), '11:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita26 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita26, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita26, 'Cefalea tensional', 'Tratamiento sintomático según evaluación médica.', 'Reposo relativo e hidratación.', 'Evolución favorable.', 0, 0);

-- cita27: paciente @pac07, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac07, @medico02, DATE_ADD(@SEMANA_ANT, INTERVAL 1 DAY), '12:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita27 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita27, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita27, 'Faringitis aguda', 'Manejo sintomático y control de signos de alarma.', 'Evitar bebidas frías y acudir si presenta fiebre persistente.', 'Sin complicaciones.', 0, 0);

-- cita28: paciente @pac08, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac08, @medico03, DATE_ADD(@SEMANA_ANT, INTERVAL 2 DAY), '12:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita28 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita28, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita28, 'Gastritis / dispepsia', 'Dieta blanda, hidratación y reevaluación si persiste dolor abdominal.', 'Evitar irritantes gástricos.', 'Se indica seguimiento.', 0, 0);

-- cita29: paciente @pac09, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac09, @medico04, DATE_ADD(@SEMANA_ANT, INTERVAL 3 DAY), '13:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita29 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita29, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita29, 'Ansiedad en evaluación', 'Orientación inicial y derivación a psicología si persiste sintomatología.', 'Rutina de sueño y seguimiento.', 'Paciente acepta recomendaciones.', 0, 0);

-- cita30: paciente @pac10, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac10, @medico06, DATE_ADD(@SEMANA_ANT, INTERVAL 4 DAY), '13:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita30 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita30, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita30, 'Rinitis alérgica', 'Medicación según evaluación médica, antecedentes y alergias referidas.', 'Control ambiental y seguimiento.', 'Cuadro leve.', 0, 0);

-- cita31: paciente @pac11, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac11, @medico01, DATE_ADD(@SEMANA_ANT, INTERVAL 0 DAY), '14:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita31 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita31, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita31, 'Cefalea tensional', 'Tratamiento sintomático según evaluación médica.', 'Reposo relativo e hidratación.', 'Evolución favorable.', 0, 0);

-- cita32: paciente @pac12, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac12, @medico02, DATE_ADD(@SEMANA_ANT, INTERVAL 1 DAY), '14:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita32 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita32, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita32, 'Faringitis aguda', 'Manejo sintomático y control de signos de alarma.', 'Evitar bebidas frías y acudir si presenta fiebre persistente.', 'Sin complicaciones.', 0, 0);

-- cita33: paciente @pac13, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac13, @medico03, DATE_ADD(@SEMANA_ANT, INTERVAL 2 DAY), '15:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita33 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita33, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita33, 'Gastritis / dispepsia', 'Dieta blanda, hidratación y reevaluación si persiste dolor abdominal.', 'Evitar irritantes gástricos.', 'Se indica seguimiento.', 0, 0);

-- cita34: paciente @pac14, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac14, @medico04, DATE_ADD(@SEMANA_ANT, INTERVAL 3 DAY), '15:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita34 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita34, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita34, 'Ansiedad en evaluación', 'Orientación inicial y derivación a psicología si persiste sintomatología.', 'Rutina de sueño y seguimiento.', 'Paciente acepta recomendaciones.', 0, 0);

-- cita35: paciente @pac15, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac15, @medico06, DATE_ADD(@SEMANA_ANT, INTERVAL 4 DAY), '16:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita35 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita35, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita35, 'Rinitis alérgica', 'Medicación según evaluación médica, antecedentes y alergias referidas.', 'Control ambiental y seguimiento.', 'Cuadro leve.', 0, 0);

-- cita36: paciente @pac16, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac16, @medico01, DATE_ADD(@SEMANA_ANT, INTERVAL 0 DAY), '16:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita36 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita36, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita36, 'Cefalea tensional', 'Tratamiento sintomático según evaluación médica.', 'Reposo relativo e hidratación.', 'Evolución favorable.', 0, 0);

-- cita37: paciente @pac17, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac17, @medico02, DATE_ADD(@SEMANA_ANT, INTERVAL 1 DAY), '17:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita37 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita37, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita37, 'Faringitis aguda', 'Manejo sintomático y control de signos de alarma.', 'Evitar bebidas frías y acudir si presenta fiebre persistente.', 'Sin complicaciones.', 0, 0);

-- cita38: paciente @pac18, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac18, @medico03, DATE_ADD(@SEMANA_ANT, INTERVAL 2 DAY), '09:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita38 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita38, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita38, 'Gastritis / dispepsia', 'Dieta blanda, hidratación y reevaluación si persiste dolor abdominal.', 'Evitar irritantes gástricos.', 'Se indica seguimiento.', 0, 0);

-- cita39: paciente @pac19, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac19, @medico04, DATE_ADD(@SEMANA_ANT, INTERVAL 3 DAY), '09:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita39 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita39, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita39, 'Ansiedad en evaluación', 'Orientación inicial y derivación a psicología si persiste sintomatología.', 'Rutina de sueño y seguimiento.', 'Paciente acepta recomendaciones.', 0, 0);

-- cita40: paciente @pac20, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac20, @medico06, DATE_ADD(@SEMANA_ANT, INTERVAL 4 DAY), '10:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita40 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita40, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita40, 'Rinitis alérgica', 'Medicación según evaluación médica, antecedentes y alergias referidas.', 'Control ambiental y seguimiento.', 'Cuadro leve.', 0, 0);

-- cita41: paciente @pac01, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_ANT, INTERVAL 0 DAY), '10:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita41 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita41, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita41, 'Cefalea tensional', 'Tratamiento sintomático según evaluación médica.', 'Reposo relativo e hidratación.', 'Evolución favorable.', 0, 0);

-- cita42: paciente @pac02, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico02, DATE_ADD(@SEMANA_ANT, INTERVAL 1 DAY), '11:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita42 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita42, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita42, 'Faringitis aguda', 'Manejo sintomático y control de signos de alarma.', 'Evitar bebidas frías y acudir si presenta fiebre persistente.', 'Sin complicaciones.', 0, 0);

-- cita43: paciente @pac03, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico03, DATE_ADD(@SEMANA_ANT, INTERVAL 2 DAY), '11:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita43 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita43, @enf02, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita43, 'Gastritis / dispepsia', 'Dieta blanda, hidratación y reevaluación si persiste dolor abdominal.', 'Evitar irritantes gástricos.', 'Se indica seguimiento.', 0, 0);

-- cita44: paciente @pac04, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac04, @medico04, DATE_ADD(@SEMANA_ANT, INTERVAL 3 DAY), '12:00:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita44 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita44, @enf03, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita44, 'Ansiedad en evaluación', 'Orientación inicial y derivación a psicología si persiste sintomatología.', 'Rutina de sueño y seguimiento.', 'Paciente acepta recomendaciones.', 0, 0);

-- cita45: paciente @pac05, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico06, DATE_ADD(@SEMANA_ANT, INTERVAL 4 DAY), '12:30:00', 'Malestar general', 'Consulta completada para historial clínico', 'completada');
SET @cita45 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita45, @enf01, 36.8, '116/75', 76, 98, 'Malestar general', 'Triaje completado sin signos de alarma.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita45, 'Rinitis alérgica', 'Medicación según evaluación médica, antecedentes y alergias referidas.', 'Control ambiental y seguimiento.', 'Cuadro leve.', 0, 0);

-- cita46: paciente @pac01, médico @medico01, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '16:00:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita46 := LAST_INSERT_ID();

-- cita47: paciente @pac03, médico @medico02, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico02, DATE_ADD(@SEMANA_SIG, INTERVAL 1 DAY), '16:30:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita47 := LAST_INSERT_ID();

-- cita48: paciente @pac05, médico @medico03, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico03, DATE_ADD(@SEMANA_SIG, INTERVAL 2 DAY), '17:00:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita48 := LAST_INSERT_ID();

-- cita49: paciente @pac07, médico @medico04, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac07, @medico04, DATE_ADD(@SEMANA_SIG, INTERVAL 3 DAY), '15:00:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita49 := LAST_INSERT_ID();

-- cita50: paciente @pac09, médico @medico06, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac09, @medico06, DATE_ADD(@SEMANA_SIG, INTERVAL 4 DAY), '15:30:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita50 := LAST_INSERT_ID();

-- cita51: paciente @pac11, médico @medico01, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac11, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '14:00:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita51 := LAST_INSERT_ID();

-- cita52: paciente @pac13, médico @medico02, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac13, @medico02, DATE_ADD(@SEMANA_SIG, INTERVAL 1 DAY), '14:30:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita52 := LAST_INSERT_ID();

-- cita53: paciente @pac15, médico @medico03, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac15, @medico03, DATE_ADD(@SEMANA_SIG, INTERVAL 2 DAY), '13:00:00', 'Dolor abdominal', 'Cita cancelada para validar filtros y estados', 'cancelada');
SET @cita53 := LAST_INSERT_ID();

-- =========================================================
-- ESCENARIOS CLINICOS AMPLIADOS PARA PRUEBAS DE HISTORIAL, FILTROS Y ROLES
-- Incluye citas en todos los estados, pacientes con varias consultas y tratamientos variados.
-- =========================================================

-- cita54: paciente @pac02, médico @medico01, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '08:00:00', 'Dolor de cabeza, cansancio visual', 'Reserva pendiente por cefalea asociada a estudio prolongado', 'pendiente');
SET @cita54 := LAST_INSERT_ID();

-- cita55: paciente @pac12, médico @medico04, estado pendiente
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac12, @medico04, DATE_ADD(@SEMANA_SIG, INTERVAL 3 DAY), '08:00:00', 'Tos seca, congestión nasal', 'Reserva pendiente para evaluación respiratoria leve', 'pendiente');
SET @cita55 := LAST_INSERT_ID();

-- cita56: paciente @pac18, médico @medico06, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac18, @medico06, DATE_ADD(@SEMANA_ACT, INTERVAL 2 DAY), '08:00:00', 'Ansiedad, palpitaciones, dificultad para dormir', 'Evaluación psicológica después de triaje por ansiedad académica', 'triaje_registrado');
SET @cita56 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita56, @enf03, 36.6, '122/78', 92, 99, 'Ansiedad, palpitaciones, dificultad para dormir', 'Paciente orientado, sin signos físicos de alarma. Refiere carga académica alta.');

-- cita57: paciente @pac04, médico @medico01, estado triaje_registrado
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac04, @medico01, DATE_ADD(@SEMANA_ACT, INTERVAL 0 DAY), '08:00:00', 'Tos, sibilancias leves, cansancio', 'Paciente asmática con síntomas respiratorios leves', 'triaje_registrado');
SET @cita57 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita57, @enf01, 37.1, '116/72', 88, 96, 'Tos, sibilancias leves, cansancio', 'Se indica evaluación médica por antecedente de asma. Saturación dentro de rango aceptable.');

-- cita58: paciente @pac10, médico @medico04, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac10, @medico04, DATE_ADD(@SEMANA_ACT, INTERVAL 3 DAY), '08:30:00', 'Dolor lumbar, contractura muscular', 'Consulta en progreso por dolor lumbar después de actividad física', 'en_consulta');
SET @cita58 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita58, @enf02, 36.7, '118/76', 74, 98, 'Dolor lumbar, contractura muscular', 'Dolor localizado, sin fiebre ni pérdida de fuerza.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita58, 'Lumbalgia mecánica en evaluación', 'Naproxeno - Tableta; 250 mg; Cada 12 horas. Indicaciones: tomar después de alimentos.\nDiclofenaco - Gel; 1 %; Cada 8 horas. Indicaciones: aplicar en zona dolorosa.', 'Evitar cargas pesadas, realizar pausas activas y volver si aparece dolor irradiado.', 'Borrador para completar examen físico antes de confirmar.', 0, 1);

-- cita59: paciente @pac06, médico @medico03, estado en_consulta
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac06, @medico03, DATE_ADD(@SEMANA_ACT, INTERVAL 2 DAY), '08:30:00', 'Insomnio, preocupación constante, cansancio', 'Consulta psicológica en progreso por ansiedad e insomnio', 'en_consulta');
SET @cita59 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita59, @enf03, 36.5, '110/70', 80, 99, 'Insomnio, preocupación constante, cansancio', 'Paciente refiere exámenes próximos y dificultad para dormir.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita59, 'Ansiedad académica en evaluación', 'Intervención inicial de orientación psicológica. Tratamiento farmacológico no indicado en esta etapa.', 'Registrar horario de sueño, reducir cafeína por la tarde y asistir a seguimiento psicológico.', 'Se continuará entrevista clínica y evaluación de factores de estrés.', 1, 1);

-- cita60: paciente @pac01, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_HIST1, INTERVAL 0 DAY), '08:00:00', 'Fiebre, dolor de garganta, malestar general', 'Consulta previa por infección respiratoria alta', 'completada');
SET @cita60 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita60, @enf01, 38.0, '118/75', 92, 97, 'Fiebre, dolor de garganta, malestar general', 'Fiebre de inicio reciente, tolera vía oral.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita60, 'Infección respiratoria alta', 'Paracetamol - Tableta; 500 mg; Cada 8 horas. Indicaciones: usar si hay fiebre o dolor.\nSolución salina - Solución nasal; 0.9 %; Cada 8 horas. Indicaciones: aplicar lavados nasales.', 'Hidratación, reposo relativo y retorno si fiebre persiste más de 48 horas.', 'Primera consulta respiratoria del paciente con el mismo médico.', 0, 0);

-- cita61: paciente @pac01, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico01, DATE_ADD(@SEMANA_HIST2, INTERVAL 0 DAY), '08:30:00', 'Acidez, dolor epigástrico, náuseas leves', 'Segunda consulta histórica con el mismo médico por dispepsia', 'completada');
SET @cita61 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita61, @enf02, 36.6, '116/74', 76, 99, 'Acidez, dolor epigástrico, náuseas leves', 'Dolor no irradiado. Niega vómitos persistentes.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita61, 'Gastritis / dispepsia', 'Omeprazol - Cápsula; 20 mg; Una vez al día. Indicaciones: tomar antes del desayuno.\nHidróxido de aluminio y magnesio - Suspensión oral; 10 mL; Según necesidad. Indicaciones: usar si hay acidez.', 'Evitar café, alcohol, irritantes y comer en horarios regulares.', 'Caso útil para ver varias consultas del mismo paciente con el mismo médico.', 0, 0);

-- cita62: paciente @pac01, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac01, @medico04, DATE_ADD(@SEMANA_HIST1, INTERVAL 3 DAY), '08:00:00', 'Dolor lumbar después de entrenamiento', 'Consulta histórica con médico diferente por dolor lumbar', 'completada');
SET @cita62 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita62, @enf03, 36.7, '120/78', 72, 98, 'Dolor lumbar después de entrenamiento', 'Sin fiebre, sin alteración neurológica referida.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita62, 'Lumbalgia mecánica', 'Ibuprofeno - Tableta; 400 mg; Cada 8 horas. Indicaciones: tomar después de alimentos por 2 días si hay dolor.\nDiclofenaco - Gel; 1 %; Cada 8 horas. Indicaciones: aplicar en zona lumbar.', 'Pausas activas, estiramientos suaves y evitar carga intensa durante una semana.', 'Permite validar historial con médicos distintos para un mismo paciente.', 0, 0);

-- cita63: paciente @pac02, médico @medico02, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico02, DATE_ADD(@SEMANA_HIST1, INTERVAL 1 DAY), '08:00:00', 'Dolor dental, sensibilidad al frío', 'Consulta odontológica por caries probable', 'completada');
SET @cita63 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita63, @enf01, 36.8, '112/70', 74, 99, 'Dolor dental, sensibilidad al frío', 'Sin fiebre. Dolor localizado en molar inferior.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita63, 'Caries dental probable con sensibilidad dentinaria', 'Paracetamol - Tableta; 500 mg; Cada 8 horas. Indicaciones: usar solo si hay dolor.\nClorhexidina oral indicada como higiene complementaria según evaluación odontológica.', 'Agendar control odontológico, evitar alimentos muy fríos y reforzar higiene oral.', 'Caso odontológico con indicaciones no farmacológicas.', 0, 0);

-- cita64: paciente @pac02, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac02, @medico01, DATE_ADD(@SEMANA_HIST2, INTERVAL 0 DAY), '09:00:00', 'Cefalea, fatiga, visión borrosa ocasional', 'Consulta de medicina general con médico distinto por cefalea', 'completada');
SET @cita64 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita64, @enf02, 36.5, '114/72', 78, 99, 'Cefalea, fatiga, visión borrosa ocasional', 'Paciente refiere uso prolongado de pantallas.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita64, 'Cefalea tensional asociada a fatiga visual', 'Paracetamol - Tableta; 500 mg; Según necesidad. Indicaciones: usar si el dolor limita actividades.', 'Descanso visual cada 40 minutos, hidratación y control si aumenta la frecuencia.', 'Mismo paciente con atención odontológica y medicina general.', 0, 0);

-- cita65: paciente @pac03, médico @medico03, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico03, DATE_ADD(@SEMANA_HIST1, INTERVAL 2 DAY), '08:00:00', 'Ansiedad, irritabilidad, dificultad para concentrarse', 'Seguimiento psicológico por estrés académico', 'completada');
SET @cita65 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita65, @enf03, 36.4, '110/68', 82, 99, 'Ansiedad, irritabilidad, dificultad para concentrarse', 'Signos vitales sin alteración. Paciente colaborador.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita65, 'Estrés académico con ansiedad leve', 'Psicoeducación y técnicas de respiración diafragmática. Tratamiento farmacológico no indicado.', 'Organizar horarios de estudio, higiene del sueño y seguimiento psicológico en dos semanas.', 'Notas internas de orientación psicológica registradas como privadas.', 1, 0);

-- cita66: paciente @pac03, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac03, @medico01, DATE_ADD(@SEMANA_HIST2, INTERVAL 0 DAY), '09:30:00', 'Dolor abdominal, náuseas, diarrea', 'Consulta de medicina general por cuadro digestivo agudo', 'completada');
SET @cita66 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita66, @enf01, 37.2, '116/74', 88, 98, 'Dolor abdominal, náuseas, diarrea', 'Sin signos de deshidratación. Refiere ingesta de alimentos fuera de casa.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita66, 'Gastroenteritis aguda leve', 'Sales de rehidratación oral - Sobre; 1 sobre; Según necesidad. Indicaciones: preparar en agua segura.\nOndansetrón - Tableta; 4 mg; Cada 12 horas. Indicaciones: usar si hay náuseas intensas.', 'Dieta blanda, hidratación y retorno si hay fiebre alta o sangre en heces.', 'Caso digestivo para comparar consultas del mismo paciente en distinta especialidad.', 0, 0);

-- cita67: paciente @pac04, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac04, @medico01, DATE_ADD(@SEMANA_HIST1, INTERVAL 0 DAY), '10:00:00', 'Tos nocturna, sensación de pecho cerrado', 'Control por antecedente de asma leve', 'completada');
SET @cita67 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita67, @enf02, 36.9, '112/72', 86, 96, 'Tos nocturna, sensación de pecho cerrado', 'Paciente con antecedente de asma leve. Saturación estable.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita67, 'Asma leve con síntomas intermitentes', 'Salbutamol - Inhalador; 100 mcg/dosis; Según necesidad. Indicaciones: usar ante dificultad respiratoria leve según indicación médica.', 'Evitar polvo, humo y acudir a emergencia si presenta dificultad respiratoria intensa.', 'Se refuerza educación sobre signos de alarma respiratoria.', 0, 0);

-- cita68: paciente @pac05, médico @medico06, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico06, DATE_ADD(@SEMANA_HIST1, INTERVAL 4 DAY), '08:00:00', 'Insomnio, preocupación por rendimiento, cansancio', 'Consulta psicológica por insomnio relacionado a exámenes', 'completada');
SET @cita68 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita68, @enf03, 36.6, '108/68', 76, 99, 'Insomnio, preocupación por rendimiento, cansancio', 'Paciente tranquilo durante entrevista de triaje.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita68, 'Insomnio relacionado a estrés académico', 'Orientación psicológica breve y plan de higiene del sueño. No se indica medicación.', 'Evitar pantallas antes de dormir, horario regular y seguimiento si persiste insomnio.', 'Registro privado por contenido de salud mental.', 1, 0);

-- cita69: paciente @pac05, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac05, @medico01, DATE_ADD(@SEMANA_HIST2, INTERVAL 0 DAY), '10:30:00', 'Estornudos, picazón nasal, lagrimeo', 'Consulta de medicina general por alergia estacional', 'completada');
SET @cita69 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita69, @enf01, 36.4, '116/70', 72, 99, 'Estornudos, picazón nasal, lagrimeo', 'Cuadro compatible con alergia estacional. Sin dificultad respiratoria.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita69, 'Rinitis alérgica', 'Loratadina - Tableta; 10 mg; Una vez al día. Indicaciones: tomar por la noche si causa somnolencia.\nSolución salina - Solución nasal; 0.9 %; Cada 8 horas.', 'Evitar polvo, limpiar habitación y acudir si aparece dificultad respiratoria.', 'Mismo paciente con psicología y medicina general.', 0, 0);

-- cita70: paciente @pac08, médico @medico01, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac08, @medico01, DATE_ADD(@SEMANA_HIST1, INTERVAL 0 DAY), '11:00:00', 'Ardor al orinar, dolor bajo vientre', 'Consulta por síntomas urinarios', 'completada');
SET @cita70 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita70, @enf02, 37.0, '114/72', 84, 98, 'Ardor al orinar, dolor bajo vientre', 'Niega fiebre alta. Se deriva para evaluación médica.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita70, 'Infección urinaria probable', 'Nitrofurantoína - Cápsula; 100 mg; Cada 12 horas. Indicaciones: tomar con alimentos según evaluación médica.', 'Aumentar consumo de agua, no automedicarse y volver si presenta fiebre o dolor lumbar.', 'Caso de tratamiento antibiótico registrado para pruebas de historial.', 0, 0);

-- cita71: paciente @pac09, médico @medico04, estado completada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac09, @medico04, DATE_ADD(@SEMANA_HIST1, INTERVAL 3 DAY), '08:30:00', 'Lesión rojiza en antebrazo, picazón', 'Consulta por dermatitis leve', 'completada');
SET @cita71 := LAST_INSERT_ID();
INSERT INTO triaje (id_cita, id_enfermera, temperatura, presion_arterial, frecuencia_cardiaca, saturacion, sintomas, observaciones) VALUES (@cita71, @enf01, 36.5, '112/70', 76, 99, 'Lesión rojiza en antebrazo, picazón', 'Lesión localizada. Niega fiebre.');
INSERT INTO consulta (id_cita, diagnostico, tratamiento, recomendaciones, observaciones, privada, borrador) VALUES (@cita71, 'Dermatitis de contacto probable', 'Hidrocortisona - Crema; 1 %; Cada 12 horas. Indicaciones: aplicar capa delgada por pocos días.\nCetirizina - Tableta; 10 mg; Por la noche. Indicaciones: usar si la picazón interfiere con descanso.', 'Evitar rascado, suspender producto irritante y volver si se extiende.', 'Sin complicaciones al examen.', 0, 0);

-- cita72: paciente @pac12, médico @medico02, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac12, @medico02, DATE_ADD(@SEMANA_SIG, INTERVAL 1 DAY), '08:00:00', 'Control dental preventivo', 'Cita odontológica cancelada por cruce de horario académico', 'cancelada');
SET @cita72 := LAST_INSERT_ID();

-- cita73: paciente @pac18, médico @medico01, estado cancelada
INSERT INTO cita (id_paciente, id_medico, fecha, hora, sintomas, motivo, estado) VALUES (@pac18, @medico01, DATE_ADD(@SEMANA_SIG, INTERVAL 0 DAY), '08:30:00', 'Dolor de garganta leve', 'Cita cancelada porque el paciente reprogramó atención', 'cancelada');
SET @cita73 := LAST_INSERT_ID();

-- =========================================================
-- CONSENTIMIENTO DE PRIVACIDAD PARA CUENTAS DE PACIENTE DE PRUEBA
-- =========================================================
INSERT INTO consentimiento_privacidad (id_persona, version_politica, finalidad)
SELECT p.id_persona, '2026-07', 'Datos sinteticos de prueba para Bienestar UNT'
FROM paciente p;

-- =========================================================
-- NOTIFICACIONES DE PRUEBA
-- =========================================================
INSERT INTO notificacion (id_usuario, titulo, mensaje, leida) VALUES
(@pac01_usuario, 'Cita registrada', 'Tu cita médica fue registrada correctamente.', 0),
(@pac04_usuario, 'Consulta en proceso', 'Tu atención médica se encuentra en consulta.', 0),
(@medico01_usuario, 'Citas listas para atención', 'Tienes pacientes con triaje registrado o consulta en progreso.', 0),
(@enf01_usuario, 'Triajes pendientes', 'Existen citas pendientes de triaje en el sistema.', 0),
(@admin01_usuario, 'Datos de prueba cargados', 'La base de datos fue poblada con registros masivos de prueba.', 1);

-- =========================================================
-- RESUMEN FINAL
-- =========================================================
SELECT 'persona' AS tabla, COUNT(*) AS total FROM persona
UNION ALL SELECT 'usuario', COUNT(*) FROM usuario
UNION ALL SELECT 'paciente', COUNT(*) FROM paciente
UNION ALL SELECT 'medico', COUNT(*) FROM medico
UNION ALL SELECT 'enfermera', COUNT(*) FROM enfermera
UNION ALL SELECT 'administrativo', COUNT(*) FROM administrativo
UNION ALL SELECT 'cita', COUNT(*) FROM cita
UNION ALL SELECT 'triaje', COUNT(*) FROM triaje
UNION ALL SELECT 'consulta', COUNT(*) FROM consulta
UNION ALL SELECT 'antecedente', COUNT(*) FROM antecedente
UNION ALL SELECT 'notificacion', COUNT(*) FROM notificacion;

SELECT estado, COUNT(*) AS total FROM cita GROUP BY estado ORDER BY FIELD(estado, 'pendiente', 'triaje_registrado', 'en_consulta', 'completada', 'cancelada');
