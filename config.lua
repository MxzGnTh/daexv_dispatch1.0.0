Config = {}

-- =====================================================
-- PERMISOS DEL SISTEMA
-- =====================================================

-- Trabajos permitidos para acceder al dispatch
Config.AllowedJobs = {
    -- SISTEMA ACTUAL - SHERIFF
    'sheriff',
    'pinkerton',
    'marshal',
    'police',  -- Policía sin rangos específicos
    
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
    'sheriff', -- 5
    'marshal', -- 8
    'pinkerton', -- 5
    -- FUTUROS JEFES DE SISTEMAS (descomenta cuando sea necesario)
    -- 'doctor', -- Jefe de médicos
    -- 'fire_chief', -- Jefe de bomberos
}

-- =====================================================
-- PERMISOS DEL SISTEMA ODE (Evaluaciones)
-- =====================================================

-- Trabajos permitidos para acceder al sistema ODE de evaluaciones
Config.PermisosEvaluador = {
    'sheriff',
    'pinkerton',
    'marshal',
}

Config.Grades = {
    ['sheriff'] = 5,
    ['marshal'] = 8,
    ['pinkerton'] = 5,
    -- FUTUROS JEFES DE SISTEMAS (descomenta cuando sea necesario)
    -- ['doctor'] = 4,
    -- ['fire_chief'] = 4,
}

Config.Labels = {
    {job = 'sheriff', grade = 1, label = 'Recluta'},
    {job = 'sheriff', grade = 2, label = 'Aprendiz'},
    {job = 'sheriff', grade = 3, label = 'Alguacil'},
    {job = 'sheriff', grade = 4, label = 'Supervisor'},
    {job = 'sheriff', grade = 5, label = 'Ayudante'},
    {job = 'sheriff', grade = 6, label = 'Adjunto'},
    {job = 'sheriff', grade = 7, label = 'Sheriff'},
    {job = 'pinkerton', grade = 3, label = 'Alguacil'},
    {job = 'pinkerton', grade = 4, label = 'Supervisor'},
    {job = 'pinkerton', grade = 5, label = 'Ayudante'},
    {job = 'pinkerton', grade = 6, label = 'Adjunto'},
    {job = 'pinkerton', grade = 7, label = 'Sheriff'},
    {job = 'marshal', grade = 8, label = 'Adjunto'},
    {job = 'marshal', grade = 9, label = 'Estatal'},
    {job = 'marshal', grade = 10, label = 'Regional'},
}

-- =====================================================
-- CONFIGURACIÓN DEL MAPA Y ESTADOS
-- =====================================================

-- Distritos del mapa de 1899
Config.Districts = {
    'Esperando Asignacion',
    'New Hanover',
    'West Elizabeth',
    'Lemoyne',
}

-- =====================================================
-- PUEBLOS/LOCACIONES POR DISTRITO
-- Para asignación específica de mandos territoriales
-- =====================================================
Config.Towns = {
    ['New Hanover'] = {
        'Valentine',
        --'Emerald Ranch',
    },
    ['West Elizabeth'] = {
        'Blackwater',
        'Strawberry',
    },
    ['Lemoyne'] = {
        'Saint Denis',
        'Rhodes',
    },
}

-- Estados manuales permitidos
Config.Status = {
    'Disponible',
    'Ocupado',
    'Patrullando',
    'En traslado',
    'En procedimiento',
    'Mando',
    'Administrativo',
}

-- Tecla para abrir el dispatch (F4)
Config.OpenKey = 0x1F6D95E5 -- F4

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