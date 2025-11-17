-- =====================================================
-- SISTEMA DE DISPATCH MANUAL 1899
-- Base de Datos MySQL
-- =====================================================

CREATE TABLE IF NOT EXISTS `dispatch_units` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(80) NOT NULL,
    `charidentifier` INT(11) NOT NULL,
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `jobname` VARCHAR(40) NOT NULL DEFAULT 'sheriff',
    `district` VARCHAR(40) NOT NULL DEFAULT 'New Hanover',
    `assigned_town` VARCHAR(40) NULL DEFAULT NULL COMMENT 'Pueblo asignado como mando',
    `status` VARCHAR(40) NOT NULL DEFAULT 'Fuera de servicio',
    `last_update` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_char` (`charidentifier`),
    INDEX `idx_identifier` (`identifier`),
    INDEX `idx_district` (`district`),
    INDEX `idx_status` (`status`),
    INDEX `idx_town` (`assigned_town`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- Tabla de logs para historial de cambios (opcional)
-- =====================================================

CREATE TABLE IF NOT EXISTS `dispatch_logs` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `charidentifier` INT(11) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `old_value` VARCHAR(100),
    `new_value` VARCHAR(100),
    `changed_by` INT(11),
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_char` (`charidentifier`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
