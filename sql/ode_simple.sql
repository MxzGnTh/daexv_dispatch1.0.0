-- =====================================================
-- SISTEMA ODE - BASE DE DATOS SIMPLIFICADA
-- Officer Development & Evaluation System
-- =====================================================

-- Tabla de miembros del departamento
CREATE TABLE IF NOT EXISTS `ode_members` (
    `member_id` INT AUTO_INCREMENT PRIMARY KEY,
    `character_id` VARCHAR(50) NOT NULL UNIQUE,
    `identifier` VARCHAR(100) NOT NULL,
    `firstname` VARCHAR(100) NOT NULL,
    `lastname` VARCHAR(100) NOT NULL,
    `job` VARCHAR(50) NOT NULL,
    `rank` VARCHAR(100) DEFAULT 'Recluta',
    `grade` INT DEFAULT 1,
    `status` ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_character_id (character_id),
    INDEX idx_job (job),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS `ode_evaluacion` (
    `evaluar_id` INT AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT NOT NULL,
    `evaluador_id` INT NOT NULL,
    `evaluador_role` ENUM('MARSHAL', 'FTO', 'TO') NOT NULL,
    `evaluar_type` ENUM('inicial', 'campo', 'final', 'promocion', 'disciplinaria') DEFAULT 'inicial',
    `objective` TEXT,
    `score_data` JSON,
    `final_score` INT DEFAULT 0,
    `comments` TEXT,
    `recommendations` TEXT,
    `status` ENUM('borrador', 'pendiente', 'aprobado', 'rechazado', 'cerrado') DEFAULT 'borrador',
    `allow_view` TINYINT(1) DEFAULT 0,
    `allow_view_granted_by` INT,
    `allow_view_granted_at` TIMESTAMP NULL,
    `approved_by` INT,
    `approved_at` TIMESTAMP NULL,
    `is_public` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES ode_members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES ode_members(member_id),
    INDEX idx_member_id (member_id),
    INDEX idx_evaluador_id (evaluador_id),
    INDEX idx_status (status),
    INDEX idx_evaluar_type (evaluar_type),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FIN DE LA BASE DE DATOS ODE - VERSIÓN SIMPLIFICADA
-- Solo 2 tablas esenciales: ode_members y ode_evaluacion
-- Los 15 puntos se guardan en score_data (JSON)
-- =====================================================
