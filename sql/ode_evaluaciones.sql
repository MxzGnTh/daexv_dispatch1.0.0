-- =====================================================
-- SISTEMA ODE - EVALUACIONES DEL DEPARTAMENTO SHERIFF
-- Base de datos compatible con VORP
-- =====================================================

-- Tabla principal de evaluaciones
CREATE TABLE IF NOT EXISTS `ode_evaluaciones` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `evaluado_identifier` INT(11) NOT NULL COMMENT 'Character ID del evaluado',
    `evaluado_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del evaluado',
    `evaluador_identifier` INT(11) NOT NULL COMMENT 'Character ID del evaluador (FTO/Marshal)',
    `evaluador_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre del evaluador',
    `tipo_evaluacion` VARCHAR(50) NOT NULL COMMENT 'Tipo: Inicial, Promoción, Recertificación',
    `objetivo` TEXT NOT NULL COMMENT 'Objetivo de la evaluación',
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `estado` ENUM('borrador', 'pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'borrador',
    `puntuacion_final` INT(11) DEFAULT NULL COMMENT 'Puntuación de 0 a 15',
    `curriculum_data` JSON NOT NULL COMMENT 'Datos de los 15 puntos del curriculum',
    `observaciones_generales` TEXT DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_evaluado` (`evaluado_identifier`),
    INDEX `idx_evaluador` (`evaluador_identifier`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de evaluaciones (para auditoría)
CREATE TABLE IF NOT EXISTS `ode_evaluaciones_historial` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `evaluacion_id` INT(11) NOT NULL,
    `accion` VARCHAR(50) NOT NULL COMMENT 'crear, editar, aprobar, rechazar',
    `usuario_identifier` INT(11) NOT NULL,
    `usuario_nombre` VARCHAR(100) NOT NULL,
    `cambios` JSON DEFAULT NULL COMMENT 'Datos de los cambios realizados',
    `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_evaluacion` (`evaluacion_id`),
    FOREIGN KEY (`evaluacion_id`) REFERENCES `ode_evaluaciones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura JSON para curriculum_data:
-- {
--   "puntos": [
--     {
--       "key": "jerarquia",
--       "titulo": "Jerarquía y Cadena de Mando",
--       "estado": "aprobado|observado|rechazado|pendiente",
--       "observacion": "Texto opcional de observación"
--     },
--     ... (15 puntos en total)
--   ],
--   "aprobados": 12,
--   "observados": 2,
--   "rechazados": 1,
--   "porcentaje": 80
-- }

-- Insertar evaluación de ejemplo
INSERT INTO `ode_evaluaciones` (
    `evaluado_identifier`,
    `evaluado_nombre`,
    `evaluador_identifier`,
    `evaluador_nombre`,
    `tipo_evaluacion`,
    `objetivo`,
    `estado`,
    `curriculum_data`,
    `observaciones_generales`
) VALUES (
    1,
    'John Marston',
    2,
    'Arthur Morgan',
    'Evaluación Inicial',
    'Evaluar conocimientos básicos del departamento y protocolos de 1899',
    'borrador',
    JSON_OBJECT(
        'puntos', JSON_ARRAY(
            JSON_OBJECT('key', 'jerarquia', 'titulo', 'Jerarquía y Cadena de Mando', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'derechos', 'titulo', 'Derechos del Acusado', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'miranda', 'titulo', 'Derechos Miranda', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'jurisprudencia', 'titulo', 'Jurisprudencia Básica', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'codigos', 'titulo', 'Códigos y Leyes del Oeste', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'busqueda', 'titulo', 'Búsqueda y Aprehensión', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'armas', 'titulo', 'Manejo de Armas de Fuego', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'patrullaje', 'titulo', 'Técnicas de Patrullaje', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'interrogatorio', 'titulo', 'Interrogatorio y Testimonios', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'reportes', 'titulo', 'Elaboración de Reportes', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'comunicacion', 'titulo', 'Comunicación y Radio', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'primeros_auxilios', 'titulo', 'Primeros Auxilios Básicos', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'etica', 'titulo', 'Ética y Conducta Profesional', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'situaciones_criticas', 'titulo', 'Manejo de Situaciones Críticas', 'estado', 'pendiente', 'observacion', ''),
            JSON_OBJECT('key', 'trabajo_equipo', 'titulo', 'Trabajo en Equipo y Coordinación', 'estado', 'pendiente', 'observacion', '')
        ),
        'aprobados', 0,
        'observados', 0,
        'rechazados', 0,
        'porcentaje', 0
    ),
    'Evaluación inicial para ingreso al departamento'
);

-- Vista para consultas rápidas
CREATE OR REPLACE VIEW `ode_evaluaciones_vista` AS
SELECT 
    e.id,
    e.evaluado_identifier,
    e.evaluado_nombre,
    e.evaluador_nombre,
    e.tipo_evaluacion,
    e.objetivo,
    DATE_FORMAT(e.fecha_creacion, '%d/%m/%Y') as fecha,
    TIME_FORMAT(e.fecha_creacion, '%H:%i') as hora,
    e.estado,
    e.puntuacion_final,
    JSON_EXTRACT(e.curriculum_data, '$.aprobados') as puntos_aprobados,
    JSON_EXTRACT(e.curriculum_data, '$.observados') as puntos_observados,
    JSON_EXTRACT(e.curriculum_data, '$.rechazados') as puntos_rechazados,
    JSON_EXTRACT(e.curriculum_data, '$.porcentaje') as porcentaje
FROM ode_evaluaciones e
ORDER BY e.fecha_creacion DESC;

-- Procedimiento para calcular puntuación automáticamente
DELIMITER $$

CREATE PROCEDURE `ode_calcular_puntuacion`(IN evaluacion_id INT)
BEGIN
    DECLARE aprobados INT DEFAULT 0;
    DECLARE observados INT DEFAULT 0;
    DECLARE rechazados INT DEFAULT 0;
    DECLARE porcentaje INT DEFAULT 0;
    DECLARE nuevo_estado VARCHAR(20);
    DECLARE i INT DEFAULT 0;
    DECLARE punto_estado VARCHAR(20);
    
    -- Contar estados iterando por los 15 puntos
    WHILE i < 15 DO
        SET punto_estado = JSON_UNQUOTE(JSON_EXTRACT(
            (SELECT curriculum_data FROM ode_evaluaciones WHERE id = evaluacion_id),
            CONCAT('$.puntos[', i, '].estado')
        ));
        
        IF punto_estado = 'aprobado' THEN
            SET aprobados = aprobados + 1;
        ELSEIF punto_estado = 'observado' THEN
            SET observados = observados + 1;
        ELSEIF punto_estado = 'rechazado' THEN
            SET rechazados = rechazados + 1;
        END IF;
        
        SET i = i + 1;
    END WHILE;
    
    -- Calcular porcentaje
    SET porcentaje = ROUND((aprobados / 15) * 100);
    
    -- Determinar estado
    IF observados > 0 THEN
        SET nuevo_estado = 'pendiente';
    ELSEIF aprobados >= 12 THEN
        SET nuevo_estado = 'aprobado';
    ELSE
        SET nuevo_estado = 'rechazado';
    END IF;
    
    -- Actualizar evaluación
    UPDATE ode_evaluaciones
    SET 
        curriculum_data = JSON_SET(
            curriculum_data,
            '$.aprobados', aprobados,
            '$.observados', observados,
            '$.rechazados', rechazados,
            '$.porcentaje', porcentaje
        ),
        puntuacion_final = aprobados,
        estado = nuevo_estado
    WHERE id = evaluacion_id;
END$$

DELIMITER ;

-- Trigger para registrar cambios en historial
DELIMITER $$

CREATE TRIGGER `ode_evaluacion_historial_after_update`
AFTER UPDATE ON `ode_evaluaciones`
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO ode_evaluaciones_historial (
            evaluacion_id,
            accion,
            usuario_identifier,
            usuario_nombre,
            cambios
        ) VALUES (
            NEW.id,
            CONCAT('cambio_estado_', NEW.estado),
            NEW.evaluador_identifier,
            NEW.evaluador_nombre,
            JSON_OBJECT(
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado,
                'puntuacion', NEW.puntuacion_final
            )
        );
    END IF;
END$$

DELIMITER ;
