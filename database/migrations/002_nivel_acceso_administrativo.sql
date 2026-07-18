-- Ejecutar una sola vez en una base de datos existente.
-- Conserva al administrativo activo más antiguo como administrador principal.

ALTER TABLE administrativo
  ADD COLUMN nivel_acceso ENUM('principal', 'operativo') NOT NULL DEFAULT 'operativo' AFTER cargo;

UPDATE administrativo
SET nivel_acceso = 'principal'
WHERE id_persona = (
  SELECT id_persona
  FROM (
    SELECT u.id_persona
    FROM usuario u
    INNER JOIN administrativo a ON a.id_persona = u.id_persona
    WHERE u.rol = 'administrativo' AND u.activo = 1
    ORDER BY u.fecha_creacion, u.id_usuario
    LIMIT 1
) AS administrador_inicial
);

UPDATE administrativo
SET cargo = CASE
  WHEN cargo IN ('Admisión', 'Recepción', 'Caja') THEN 'Admisión'
  ELSE 'Gestión de usuarios'
END;

UPDATE usuario u
INNER JOIN persona p ON p.id_persona = u.id_persona
SET u.username = p.correo;

ALTER TABLE administrativo
  ADD COLUMN principal_unico TINYINT GENERATED ALWAYS AS (
    CASE WHEN nivel_acceso = 'principal' THEN 1 ELSE NULL END
  ) STORED,
  ADD CONSTRAINT uq_administrativo_principal UNIQUE (principal_unico);

ALTER TABLE administrativo
  DROP COLUMN anexo;
