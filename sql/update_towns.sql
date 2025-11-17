-- =====================================================
-- ACTUALIZACIÓN - Asignación de Pueblos
-- Ejecutar SOLO si la tabla dispatch_units ya existe
-- =====================================================

-- Verificar si la columna assigned_town ya existe
-- Si ejecutas esto y da error "Duplicate column name", 
-- significa que ya está agregada y puedes ignorar el error

ALTER TABLE dispatch_units 
ADD COLUMN assigned_town VARCHAR(40) NULL DEFAULT NULL COMMENT 'Pueblo asignado como mando' AFTER district;

-- Agregar índice para mejorar rendimiento
ALTER TABLE dispatch_units 
ADD INDEX idx_town (assigned_town);

-- Verificar que se agregó correctamente
DESCRIBE dispatch_units;
