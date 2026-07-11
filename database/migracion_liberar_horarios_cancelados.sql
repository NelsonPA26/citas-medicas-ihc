USE citas_medicas_ihc;

-- Permite que una cita cancelada libere su horario para una nueva reserva.
-- Ejecutar una sola vez en una base de datos que ya fue creada con el esquema anterior.

ALTER TABLE cita
  DROP INDEX uq_medico_fecha_hora;

ALTER TABLE cita
  ADD COLUMN slot_activo TINYINT GENERATED ALWAYS AS (
    CASE
      WHEN estado = 'cancelada' THEN NULL
      ELSE 1
    END
  ) STORED;

ALTER TABLE cita
  ADD UNIQUE KEY uq_cita_horario_activo (id_medico, fecha, hora, slot_activo);
