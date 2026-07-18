-- Catalogo base para el autocompletado de recetas medicas.
-- Ejecutar una sola vez en la misma base de datos de citas medicas.

CREATE TABLE IF NOT EXISTS medicamento_catalogo (
  id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  activo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS medicamento_presentacion (
  id_presentacion INT AUTO_INCREMENT PRIMARY KEY,
  id_medicamento INT NOT NULL,
  presentacion VARCHAR(80) NOT NULL,
  dosis_habitual VARCHAR(40) NOT NULL,
  unidad_dosis VARCHAR(20) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_presentacion_medicamento
    FOREIGN KEY (id_medicamento) REFERENCES medicamento_catalogo(id_medicamento)
    ON DELETE CASCADE,
  UNIQUE KEY uq_medicamento_presentacion_dosis (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
);

INSERT IGNORE INTO medicamento_catalogo (nombre) VALUES
  ('Paracetamol'), ('Ibuprofeno'), ('Naproxeno'), ('Diclofenaco'), ('Ketorolaco'),
  ('Loratadina'), ('Cetirizina'), ('Clorfenamina'), ('Salbutamol'), ('Dextrometorfano'),
  ('Ambroxol'), ('Solucion salina'), ('Omeprazol'), ('Hidroxido de aluminio y magnesio'),
  ('Butilhioscina'), ('Ondansetron'), ('Sales de rehidratacion oral'), ('Amoxicilina'),
  ('Azitromicina'), ('Nitrofurantoina'), ('Clotrimazol'), ('Hidrocortisona'), ('Mupirocina'),
  ('Metformina'), ('Losartan'), ('Amlodipino');

INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '500', 'mg' FROM medicamento_catalogo WHERE nombre = 'Paracetamol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Jarabe', '160', 'mg/5 mL' FROM medicamento_catalogo WHERE nombre = 'Paracetamol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '400', 'mg' FROM medicamento_catalogo WHERE nombre = 'Ibuprofeno';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Suspension', '100', 'mg/5 mL' FROM medicamento_catalogo WHERE nombre = 'Ibuprofeno';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '250', 'mg' FROM medicamento_catalogo WHERE nombre = 'Naproxeno';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '50', 'mg' FROM medicamento_catalogo WHERE nombre = 'Diclofenaco';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Gel', '1', '%' FROM medicamento_catalogo WHERE nombre = 'Diclofenaco';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '10', 'mg' FROM medicamento_catalogo WHERE nombre = 'Ketorolaco';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '10', 'mg' FROM medicamento_catalogo WHERE nombre = 'Loratadina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '10', 'mg' FROM medicamento_catalogo WHERE nombre = 'Cetirizina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Jarabe', '2', 'mg/5 mL' FROM medicamento_catalogo WHERE nombre = 'Clorfenamina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Inhalador', '100', 'mcg/dosis' FROM medicamento_catalogo WHERE nombre = 'Salbutamol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Jarabe', '15', 'mg/5 mL' FROM medicamento_catalogo WHERE nombre = 'Dextrometorfano';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Jarabe', '15', 'mg/5 mL' FROM medicamento_catalogo WHERE nombre = 'Ambroxol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Solucion nasal', '0.9', '%' FROM medicamento_catalogo WHERE nombre = 'Solucion salina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Capsula', '20', 'mg' FROM medicamento_catalogo WHERE nombre = 'Omeprazol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Suspension oral', '10', 'mL' FROM medicamento_catalogo WHERE nombre = 'Hidroxido de aluminio y magnesio';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '10', 'mg' FROM medicamento_catalogo WHERE nombre = 'Butilhioscina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '4', 'mg' FROM medicamento_catalogo WHERE nombre = 'Ondansetron';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Sobre', '1', 'sobre' FROM medicamento_catalogo WHERE nombre = 'Sales de rehidratacion oral';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Capsula', '500', 'mg' FROM medicamento_catalogo WHERE nombre = 'Amoxicilina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '500', 'mg' FROM medicamento_catalogo WHERE nombre = 'Azitromicina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Capsula', '100', 'mg' FROM medicamento_catalogo WHERE nombre = 'Nitrofurantoina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Crema', '1', '%' FROM medicamento_catalogo WHERE nombre = 'Clotrimazol';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Crema', '1', '%' FROM medicamento_catalogo WHERE nombre = 'Hidrocortisona';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Unguento', '2', '%' FROM medicamento_catalogo WHERE nombre = 'Mupirocina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '850', 'mg' FROM medicamento_catalogo WHERE nombre = 'Metformina';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '50', 'mg' FROM medicamento_catalogo WHERE nombre = 'Losartan';
INSERT IGNORE INTO medicamento_presentacion (id_medicamento, presentacion, dosis_habitual, unidad_dosis)
SELECT id_medicamento, 'Tableta', '5', 'mg' FROM medicamento_catalogo WHERE nombre = 'Amlodipino';
