-- Ejecutar una sola vez en una base de datos existente.
-- Normaliza los alcances administrativos y agrega privacidad/sesiones seguras.

USE citas_medicas_ihc;

UPDATE administrativo
SET cargo = CASE
  WHEN nivel_acceso = 'principal' THEN 'Gestión de usuarios'
  WHEN cargo IN ('Admisión', 'Recepción', 'Caja', 'Apoyo administrativo') THEN 'Admisión'
  ELSE 'Gestión de usuarios'
END;

ALTER TABLE administrativo
  MODIFY COLUMN cargo ENUM('Admisión', 'Gestión de usuarios') NOT NULL;

CREATE TABLE IF NOT EXISTS consentimiento_privacidad (
  id_consentimiento INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL,
  version_politica VARCHAR(20) NOT NULL,
  finalidad VARCHAR(180) NOT NULL,
  aceptado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consentimiento_persona
    FOREIGN KEY (id_persona)
    REFERENCES persona(id_persona)
    ON DELETE CASCADE,
  CONSTRAINT uq_consentimiento_persona_version
    UNIQUE (id_persona, version_politica)
);

CREATE TABLE IF NOT EXISTS sesion_usuario (
  session_id VARCHAR(128) PRIMARY KEY,
  data LONGTEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sesion_usuario_expira (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
