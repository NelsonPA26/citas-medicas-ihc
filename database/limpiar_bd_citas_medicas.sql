USE citas_medicas_ihc;

-- =========================================================
-- LIMPIEZA TOTAL DE DATOS DE PRUEBA
-- ADVERTENCIA: elimina todos los registros de la base de datos.
-- No elimina la estructura de tablas.
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

SELECT 'Base de datos vaciada correctamente.' AS resultado;
