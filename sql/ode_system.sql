-- =====================================================
-- SISTEMA ODE (Officer Development & Evaluation)
-- Base de Datos MySQL
-- =====================================================

-- Tabla de evaluaciones de oficiales
CREATE TABLE IF NOT EXISTS `ode_evaluations` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `evaluated_officer_id` INT(11) NOT NULL COMMENT 'ID del oficial evaluado (charidentifier)',
    `evaluated_officer_name` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del oficial evaluado',
    `evaluator_id` INT(11) NOT NULL COMMENT 'ID del evaluador (charidentifier)',
    `evaluator_name` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del evaluador',
    `evaluation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `overall_notes` TEXT NULL COMMENT 'Notas generales de la evaluación',
    `total_score` INT(11) DEFAULT 0 COMMENT 'Puntuación total calculada',
    `max_possible_score` INT(11) DEFAULT 0 COMMENT 'Puntuación máxima posible',
    `score_percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje de puntuación',
    `performance_level` VARCHAR(50) DEFAULT NULL COMMENT 'Nivel de desempeño calculado',
    `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress' COMMENT 'Estado: in_progress, completed',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_evaluated_officer` (`evaluated_officer_id`),
    INDEX `idx_evaluator` (`evaluator_id`),
    INDEX `idx_date` (`evaluation_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_performance` (`performance_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de checks individuales de evaluación
CREATE TABLE IF NOT EXISTS `ode_evaluation_checks` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `evaluation_id` INT(11) NOT NULL COMMENT 'ID de la evaluación a la que pertenece',
    `category` VARCHAR(50) NOT NULL COMMENT 'Categoría del check (ej: Conducta, Procedimientos)',
    `check_item` VARCHAR(200) NOT NULL COMMENT 'Descripción del item a evaluar',
    `check_value` VARCHAR(20) NOT NULL COMMENT 'Valor: positive, negative, observed',
    `score` INT(11) DEFAULT 0 COMMENT 'Puntuación del check',
    `notes` TEXT NULL COMMENT 'Notas específicas del check',
    `checked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_evaluation` (`evaluation_id`),
    INDEX `idx_category` (`category`),
    INDEX `idx_value` (`check_value`),
    FOREIGN KEY (`evaluation_id`) REFERENCES `ode_evaluations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de logs de cambios en evaluaciones (auditoría)
CREATE TABLE IF NOT EXISTS `ode_logs` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `evaluation_id` INT(11) NOT NULL,
    `check_id` INT(11) NULL,
    `action` VARCHAR(100) NOT NULL COMMENT 'Acción realizada',
    `old_value` VARCHAR(100) NULL,
    `new_value` VARCHAR(100) NULL,
    `changed_by` INT(11) NOT NULL COMMENT 'ID de quien hizo el cambio',
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_evaluation` (`evaluation_id`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vista para estadísticas de oficiales
CREATE OR REPLACE VIEW `ode_officer_stats` AS
SELECT 
    evaluated_officer_id,
    evaluated_officer_name,
    COUNT(*) as total_evaluations,
    ROUND(AVG(score_percentage), 2) as avg_score,
    MAX(evaluation_date) as last_evaluation,
    (SELECT performance_level FROM ode_evaluations e2 
     WHERE e2.evaluated_officer_id = ode_evaluations.evaluated_officer_id 
     AND e2.status = 'completed'
     ORDER BY evaluation_date DESC LIMIT 1) as last_performance_level
FROM ode_evaluations
WHERE status = 'completed'
GROUP BY evaluated_officer_id, evaluated_officer_name;
