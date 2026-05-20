DROP DATABASE IF EXISTS citas_medicas_ihc;
CREATE DATABASE citas_medicas_ihc
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE citas_medicas_ihc;

-- =========================================================
-- 1. DATOS PERSONALES Y SEGURIDAD
-- =========================================================

CREATE TABLE persona (
  id_persona INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(80) NOT NULL,
  apellido_paterno VARCHAR(80) NOT NULL,
  apellido_materno VARCHAR(80),
  dni CHAR(8) UNIQUE,
  fecha_nacimiento DATE,
  sexo ENUM('Masculino', 'Femenino', 'Otro', 'No especifica') DEFAULT 'No especifica',
  correo VARCHAR(120) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(150),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('paciente', 'medico', 'enfermera', 'administrativo') NOT NULL DEFAULT 'paciente',
  activo TINYINT(1) DEFAULT 1,
  debe_cambiar_password TINYINT(1) DEFAULT 0,
  failed_attempts TINYINT DEFAULT 0,
  locked_until DATETIME DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_usuario_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE
);

-- =========================================================
-- 2. TABLAS POR ROL
-- =========================================================

CREATE TABLE paciente (
  id_paciente INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  codigo_estudiante VARCHAR(20),
  escuela VARCHAR(100),
  facultad VARCHAR(100),
  contexto_universitario VARCHAR(120),

  CONSTRAINT fk_paciente_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE
);

CREATE TABLE medico (
  id_medico INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  especialidad VARCHAR(80) NOT NULL,
  numero_colegiatura VARCHAR(30) UNIQUE,
  turno ENUM('mañana', 'tarde', 'completo') DEFAULT 'completo',

  CONSTRAINT fk_medico_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE
);

CREATE TABLE enfermera (
  id_enfermera INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  area VARCHAR(80),
  turno ENUM('mañana', 'tarde', 'completo') DEFAULT 'completo',

  CONSTRAINT fk_enfermera_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE
);

CREATE TABLE administrativo (
  id_administrativo INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  cargo VARCHAR(80),
  anexo VARCHAR(20),

  CONSTRAINT fk_administrativo_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE
);

-- =========================================================
-- 3. FLUJO DE CITAS MÉDICAS
-- =========================================================

CREATE TABLE cita (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_medico INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  estado ENUM(
    'pendiente',
    'triaje_registrado',
    'completada',
    'cancelada'
  ) DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_cita_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES paciente(id_paciente)
    ON DELETE RESTRICT,

  CONSTRAINT fk_cita_medico
    FOREIGN KEY (id_medico)
    REFERENCES medico(id_medico)
    ON DELETE RESTRICT,

  CONSTRAINT uq_medico_fecha_hora
    UNIQUE (id_medico, fecha, hora),

  INDEX idx_cita_paciente (id_paciente),
  INDEX idx_cita_medico_fecha (id_medico, fecha),
  INDEX idx_cita_estado (estado)
);

-- =========================================================
-- 4. TRIAJE DE ENFERMERÍA
-- =========================================================

CREATE TABLE triaje (
  id_triaje INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL UNIQUE,
  id_enfermera INT NOT NULL,
  temperatura DECIMAL(4,1),
  presion_arterial VARCHAR(20),
  frecuencia_cardiaca INT,
  saturacion INT,
  sintomas TEXT,
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_triaje_cita
    FOREIGN KEY (id_cita)
    REFERENCES cita(id_cita)
    ON DELETE CASCADE,

  CONSTRAINT fk_triaje_enfermera
    FOREIGN KEY (id_enfermera)
    REFERENCES enfermera(id_enfermera)
    ON DELETE RESTRICT
);

-- =========================================================
-- 5. ANTECEDENTES DEL PACIENTE
-- =========================================================

CREATE TABLE antecedente (
  id_antecedente INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL UNIQUE,
  alergias TEXT,
  enfermedades_previas TEXT,
  medicacion_actual TEXT,
  cirugias TEXT,
  antecedentes_familiares TEXT,
  observaciones TEXT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_antecedente_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES paciente(id_paciente)
    ON DELETE CASCADE
);

-- =========================================================
-- 6. CONSULTA MÉDICA
-- =========================================================

CREATE TABLE consulta (
  id_consulta INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL UNIQUE,
  diagnostico VARCHAR(255),
  tratamiento TEXT,
  recomendaciones TEXT,
  observaciones TEXT,
  privada TINYINT(1) DEFAULT 0,
  borrador TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_consulta_cita
    FOREIGN KEY (id_cita)
    REFERENCES cita(id_cita)
    ON DELETE CASCADE
);

-- =========================================================
-- 7. NOTIFICACIONES INTERNAS
-- =========================================================

CREATE TABLE notificacion (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notificacion_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE CASCADE,

  INDEX idx_notificacion_usuario (id_usuario),
  INDEX idx_notificacion_leida (leida)
);

CREATE TABLE IF NOT EXISTS password_reset_token (
  id_token INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_password_reset_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE CASCADE,

  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);