Config = {}

-- =====================================================
-- PERMISOS DEL SISTEMA
-- =====================================================

-- Trabajos permitidos para acceder al dispatch
Config.AllowedJobs = {
    -- SISTEMA ACTUAL - SHERIFF
    'sheriff',
    'deputy',
    'marshal',
    
    -- FUTUROS SISTEMAS (Descomenta cuando implementes)
    -- 'doctor',
    -- 'medic',
    -- 'nurse',
    -- 'firefighter',
    -- 'ranger',
}

-- Permitir a CUALQUIER JUGADOR usar el dispatch (para testing)
-- true = Todos pueden usar | false = Solo AllowedJobs
Config.AllowAllPlayers = true  -- Cambiar a true solo para testing

-- Rangos que pueden modificar otros oficiales (administradores del dispatch)
Config.AdminRanks = {
    'sheriff',
    'marshal',
    
    -- FUTUROS JEFES DE SISTEMAS (descomenta cuando sea necesario)
    -- 'doctor', -- Jefe de médicos
    -- 'fire_chief', -- Jefe de bomberos
}

-- =====================================================
-- CONFIGURACIÓN DEL MAPA Y ESTADOS
-- =====================================================

-- Distritos del mapa de 1899
Config.Districts = {
    'Mando',
    'Administrativo',
    'Esperando Asignacion',
    'New Hanover',
    'West Elizabeth',
    'Ambarino',
    'Lemoyne',
    'Nuevo Paraíso'
}

-- =====================================================
-- PUEBLOS/LOCACIONES POR DISTRITO
-- Para asignación específica de mandos territoriales
-- =====================================================
Config.Towns = {
    ['New Hanover'] = {
        'Valentine',
        'Emerald Ranch',
        'Annesburg',
        'Van Horn'
    },
    ['West Elizabeth'] = {
        'Blackwater',
        'Strawberry',
        'Manzanita Post'
    },
    ['Ambarino'] = {
        'Wapiti',
        'Colter'
    },
    ['Lemoyne'] = {
        'Saint Denis',
        'Rhodes',
        'Lagras'
    },
    ['Nuevo Paraíso'] = {
        'Tumbleweed',
        'Armadillo',
        'Chuparosa'
    }
}

-- Estados manuales permitidos
Config.Status = {
    'Disponible',
    'Ocupado',
    'Fuera de servicio',
    'Patrullando',
    'En traslado',
    'En procedimiento'
}

-- Tecla para abrir el dispatch (F6)
Config.OpenKey = 0x3C0A40F2 -- F6

-- =====================================================
-- MENSAJES DEL SISTEMA
-- =====================================================

-- Mensajes del sistema
Config.Lang = {
    ['no_permission'] = 'No tienes permiso para acceder al Dispatch',
    ['dispatch_opened'] = 'Panel de Dispatch abierto',
    ['dispatch_closed'] = 'Panel de Dispatch cerrado',
    ['status_updated'] = 'Estado actualizado correctamente',
    ['district_updated'] = 'Distrito asignado correctamente',
    ['unit_updated'] = 'Unidad actualizada correctamente'
}

-- =====================================================
-- SISTEMA ODE (Officer Development & Evaluation)
-- =====================================================

-- Configuración general del sistema ODE
Config.ODE = {
    -- Puntuación por tipo de check
    Scoring = {
        positive = 10,   -- Puntos por check positivo
        observed = 5,    -- Puntos por check observado  
        negative = 0     -- Puntos por check negativo
    },
    
    -- Niveles de desempeño basados en porcentaje
    PerformanceLevels = {
        { min = 90, label = 'Excelente', color = '#4caf50' },
        { min = 75, label = 'Bueno', color = '#8bc34a' },
        { min = 60, label = 'Satisfactorio', color = '#ffc107' },
        { min = 40, label = 'Necesita Mejorar', color = '#ff9800' },
        { min = 0, label = 'Insuficiente', color = '#f44336' }
    },
    
    -- Categorías y criterios de evaluación
    Categories = {
        {
            name = 'Conducta Profesional',
            items = {
                'Mantiene compostura bajo presión',
                'Trata a civiles con respeto',
                'Sigue la cadena de mando',
                'Viste el uniforme apropiadamente',
                'Mantiene su equipo en buen estado'
            }
        },
        {
            name = 'Procedimientos Policiales',
            items = {
                'Aplica correctamente las leyes',
                'Realiza detenciones adecuadas',
                'Documenta incidentes apropiadamente',
                'Maneja evidencia correctamente',
                'Sigue protocolos de uso de fuerza'
            }
        },
        {
            name = 'Comunicación',
            items = {
                'Se comunica claramente por radio',
                'Reporta actividades oportunamente',
                'Coordina efectivamente con otros oficiales',
                'Mantiene profesionalismo verbal',
                'Escucha activamente instrucciones'
            }
        },
        {
            name = 'Patrullaje',
            items = {
                'Mantiene presencia visible en su distrito',
                'Responde rápidamente a llamadas',
                'Identifica actividades sospechosas',
                'Conoce bien su territorio asignado',
                'Realiza patrullaje preventivo'
            }
        },
        {
            name = 'Trabajo en Equipo',
            items = {
                'Apoya a otros oficiales',
                'Participa en operaciones coordinadas',
                'Comparte información relevante',
                'Acepta y ofrece asistencia',
                'Contribuye positivamente al equipo'
            }
        },
        {
            name = 'Iniciativa y Liderazgo',
            items = {
                'Toma decisiones apropiadas',
                'Muestra iniciativa en situaciones',
                'Asume responsabilidad de sus acciones',
                'Puede liderar cuando sea necesario',
                'Busca oportunidades de mejora'
            }
        }
    }
}
