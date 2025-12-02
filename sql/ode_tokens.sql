-- =====================================================
-- SISTEMA ODE - TOKENS DE EVALUADOR
-- Sistema de permisos temporales para evaluadores
-- =====================================================

-- Tabla de tokens de evaluador
CREATE TABLE IF NOT EXISTS `ode_tokens_evaluador` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `charidentifier` INT(11) NOT NULL COMMENT 'Character ID del evaluador con token',
    `nombre_evaluador` VARCHAR(100) NOT NULL COMMENT 'Nombre del evaluador',
    `otorgado_por_id` INT(11) NOT NULL COMMENT 'Character ID de quien otorgó el token',
    `otorgado_por_nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre de quien otorgó el token',
    `fecha_inicio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_expiracion` DATETIME NOT NULL COMMENT 'Fecha en que expira el token',
    `motivo` VARCHAR(255) DEFAULT NULL COMMENT 'Motivo del otorgamiento',
    `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = activo, 0 = revocado',
    `fecha_revocacion` DATETIME DEFAULT NULL,
    `revocado_por_id` INT(11) DEFAULT NULL,
    `revocado_por_nombre` VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_charidentifier` (`charidentifier`),
    INDEX `idx_activo` (`activo`),
    INDEX `idx_expiracion` (`fecha_expiracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para tokens activos y válidos
CREATE OR REPLACE VIEW `ode_tokens_activos` AS
SELECT 
    t.id,
    t.charidentifier,
    t.nombre_evaluador,
    t.otorgado_por_nombre,
    DATE_FORMAT(t.fecha_inicio, '%d/%m/%Y %H:%i') as fecha_inicio_fmt,
    DATE_FORMAT(t.fecha_expiracion, '%d/%m/%Y %H:%i') as fecha_expiracion_fmt,
    t.motivo,
    DATEDIFF(t.fecha_expiracion, NOW()) as dias_restantes
FROM ode_tokens_evaluador t
WHERE t.activo = 1 
  AND t.fecha_expiracion > NOW()
ORDER BY t.fecha_expiracion ASC;

-- Procedimiento para limpiar tokens expirados (ejecutar periódicamente)
DELIMITER $$

CREATE PROCEDURE `ode_limpiar_tokens_expirados`()
BEGIN
    UPDATE ode_tokens_evaluador
    SET activo = 0
    WHERE activo = 1 
      AND fecha_expiracion < NOW();
END$$

DELIMITER ;
