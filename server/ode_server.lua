-- =====================================================
-- ODE SERVER - SISTEMA DE EVALUACIONES 1899
-- Compatible con VORP Core
-- =====================================================

local VORPcore = {}
TriggerEvent("getCore", function(core)
    VORPcore = core
end)

-- =====================================================
-- CONFIGURACIÓN
-- =====================================================

local Config = {
    PermisosEvaluador = {
        "marshal",  -- Marshal puede evaluar
        "fto"       -- Field Training Officer
    },
    PuntosRequeridos = 12,  -- Mínimo 12/15 para aprobar
    DebugMode = true
}

-- =====================================================
-- UTILIDADES
-- =====================================================

local function Log(message)
    if Config.DebugMode then
        print("[ODE] " .. message)
    end
end

local function TienePermisoEvaluador(source)
    -- Verificar permisos por trabajo
    local User = VORPcore.getUser(source)
    if not User then return false end
    
    local Character = User.getUsedCharacter
    if not Character then return false end
    
    local job = Character.job
    
    for _, allowedJob in ipairs(Config.PermisosEvaluador) do
        if job == allowedJob then
            return true
        end
    end
    
    return false
end

-- =====================================================
-- CALLBACKS - GESTIÓN DE EVALUACIONES
-- =====================================================

-- Obtener lista de evaluaciones
VORPcore.Callback.Register("ode:getEvaluaciones", function(source, cb, data)
    local User = VORPcore.getUser(source)
    if not User then 
        cb({success = false, message = "Usuario no encontrado"})
        return 
    end
    
    local Character = User.getUsedCharacter
    local identifier = Character.charIdentifier
    
    local query = [[
        SELECT 
            id,
            evaluado_nombre,
            evaluador_nombre,
            tipo_evaluacion,
            objetivo,
            DATE_FORMAT(fecha_creacion, '%d/%m/%Y') as fecha,
            TIME_FORMAT(fecha_creacion, '%H:%i') as hora,
            estado,
            puntuacion_final,
            JSON_EXTRACT(curriculum_data, '$.aprobados') as aprobados,
            JSON_EXTRACT(curriculum_data, '$.observados') as observados,
            JSON_EXTRACT(curriculum_data, '$.rechazados') as rechazados
        FROM ode_evaluaciones
        WHERE evaluado_identifier = ? OR evaluador_identifier = ?
        ORDER BY fecha_creacion DESC
    ]]
    
    exports.ghmattimysql:execute(query, {identifier, identifier}, function(result)
        if result and #result > 0 then
            cb({success = true, evaluaciones = result})
        else
            cb({success = true, evaluaciones = {}})
        end
    end)
end)

-- Crear nueva evaluación
VORPcore.Callback.Register("ode:crearEvaluacion", function(source, cb, data)
    if not TienePermisoEvaluador(source) then
        cb({success = false, message = "No tienes permisos para crear evaluaciones"})
        return
    end
    
    local User = VORPcore.getUser(source)
    local Character = User.getUsedCharacter
    local evaluador_id = Character.charIdentifier
    local evaluador_nombre = Character.firstname .. " " .. Character.lastname
    
    -- Obtener datos del evaluado
    local evaluado_id = data.evaluado_identifier
    local evaluado_nombre = data.evaluado_nombre
    local tipo = data.tipo_evaluacion or "Evaluación Inicial"
    local objetivo = data.objetivo or "Sin objetivo especificado"
    
    -- Curriculum inicial con 15 puntos
    local curriculum = {
        puntos = {
            {key = "jerarquia", titulo = "Jerarquía y Cadena de Mando", estado = "pendiente", observacion = ""},
            {key = "derechos", titulo = "Derechos del Acusado", estado = "pendiente", observacion = ""},
            {key = "miranda", titulo = "Derechos Miranda", estado = "pendiente", observacion = ""},
            {key = "jurisprudencia", titulo = "Jurisprudencia Básica", estado = "pendiente", observacion = ""},
            {key = "codigos", titulo = "Códigos y Leyes del Oeste", estado = "pendiente", observacion = ""},
            {key = "busqueda", titulo = "Búsqueda y Aprehensión", estado = "pendiente", observacion = ""},
            {key = "armas", titulo = "Manejo de Armas de Fuego", estado = "pendiente", observacion = ""},
            {key = "patrullaje", titulo = "Técnicas de Patrullaje", estado = "pendiente", observacion = ""},
            {key = "interrogatorio", titulo = "Interrogatorio y Testimonios", estado = "pendiente", observacion = ""},
            {key = "reportes", titulo = "Elaboración de Reportes", estado = "pendiente", observacion = ""},
            {key = "comunicacion", titulo = "Comunicación y Radio", estado = "pendiente", observacion = ""},
            {key = "primeros_auxilios", titulo = "Primeros Auxilios Básicos", estado = "pendiente", observacion = ""},
            {key = "etica", titulo = "Ética y Conducta Profesional", estado = "pendiente", observacion = ""},
            {key = "situaciones_criticas", titulo = "Manejo de Situaciones Críticas", estado = "pendiente", observacion = ""},
            {key = "trabajo_equipo", titulo = "Trabajo en Equipo y Coordinación", estado = "pendiente", observacion = ""}
        },
        aprobados = 0,
        observados = 0,
        rechazados = 0,
        porcentaje = 0
    }
    
    local query = [[
        INSERT INTO ode_evaluaciones 
        (evaluado_identifier, evaluado_nombre, evaluador_identifier, evaluador_nombre, 
         tipo_evaluacion, objetivo, estado, curriculum_data)
        VALUES (?, ?, ?, ?, ?, ?, 'borrador', ?)
    ]]
    
    exports.ghmattimysql:execute(query, {
        evaluado_id,
        evaluado_nombre,
        evaluador_id,
        evaluador_nombre,
        tipo,
        objetivo,
        json.encode(curriculum)
    }, function(result)
        if result and result.insertId then
            Log("Evaluación creada: ID=" .. result.insertId)
            cb({success = true, evaluacion_id = result.insertId, message = "Evaluación creada exitosamente"})
            
            -- Registrar en historial
            local histQuery = [[
                INSERT INTO ode_evaluaciones_historial 
                (evaluacion_id, accion, usuario_identifier, usuario_nombre, cambios)
                VALUES (?, 'crear', ?, ?, ?)
            ]]
            
            exports.ghmattimysql:execute(histQuery, {
                result.insertId,
                evaluador_id,
                evaluador_nombre,
                json.encode({tipo = tipo, objetivo = objetivo})
            })
        else
            cb({success = false, message = "Error al crear la evaluación"})
        end
    end)
end)

-- Obtener detalle de evaluación
VORPcore.Callback.Register("ode:getEvaluacionDetalle", function(source, cb, data)
    local evaluacion_id = data.evaluacion_id
    
    if not evaluacion_id then
        cb({success = false, message = "ID de evaluación no proporcionado"})
        return
    end
    
    local query = [[
        SELECT 
            id,
            evaluado_identifier,
            evaluado_nombre,
            evaluador_nombre,
            tipo_evaluacion,
            objetivo,
            estado,
            puntuacion_final,
            curriculum_data,
            observaciones_generales,
            DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha_completa
        FROM ode_evaluaciones
        WHERE id = ?
    ]]
    
    exports.ghmattimysql:execute(query, {evaluacion_id}, function(result)
        if result and #result > 0 then
            local eval = result[1]
            eval.curriculum_data = json.decode(eval.curriculum_data)
            cb({success = true, evaluacion = eval})
        else
            cb({success = false, message = "Evaluación no encontrada"})
        end
    end)
end)

-- Actualizar evaluación (guardar cambios en curriculum)
VORPcore.Callback.Register("ode:actualizarEvaluacion", function(source, cb, data)
    if not TienePermisoEvaluador(source) then
        cb({success = false, message = "No tienes permisos para editar evaluaciones"})
        return
    end
    
    local evaluacion_id = data.evaluacion_id
    local curriculum_data = data.curriculum_data
    local observaciones = data.observaciones_generales or ""
    
    if not evaluacion_id or not curriculum_data then
        cb({success = false, message = "Datos incompletos"})
        return
    end
    
    local query = [[
        UPDATE ode_evaluaciones
        SET curriculum_data = ?,
            observaciones_generales = ?
        WHERE id = ?
    ]]
    
    exports.ghmattimysql:execute(query, {
        json.encode(curriculum_data),
        observaciones,
        evaluacion_id
    }, function(result)
        if result and result.affectedRows > 0 then
            Log("Evaluación actualizada: ID=" .. evaluacion_id)
            cb({success = true, message = "Evaluación guardada exitosamente"})
        else
            cb({success = false, message = "Error al guardar la evaluación"})
        end
    end)
end)

-- Enviar evaluación (calcular puntuación final)
VORPcore.Callback.Register("ode:enviarEvaluacion", function(source, cb, data)
    if not TienePermisoEvaluador(source) then
        cb({success = false, message = "No tienes permisos para enviar evaluaciones"})
        return
    end
    
    local User = VORPcore.getUser(source)
    local Character = User.getUsedCharacter
    local evaluador_nombre = Character.firstname .. " " .. Character.lastname
    
    local evaluacion_id = data.evaluacion_id
    
    if not evaluacion_id then
        cb({success = false, message = "ID de evaluación no proporcionado"})
        return
    end
    
    -- Llamar al procedimiento almacenado para calcular puntuación
    local calcQuery = "CALL ode_calcular_puntuacion(?)"
    
    exports.ghmattimysql:execute(calcQuery, {evaluacion_id}, function(calcResult)
        -- Obtener resultado actualizado
        local getQuery = [[
            SELECT 
                estado,
                puntuacion_final,
                JSON_EXTRACT(curriculum_data, '$.aprobados') as aprobados,
                JSON_EXTRACT(curriculum_data, '$.observados') as observados,
                JSON_EXTRACT(curriculum_data, '$.rechazados') as rechazados,
                JSON_EXTRACT(curriculum_data, '$.porcentaje') as porcentaje
            FROM ode_evaluaciones
            WHERE id = ?
        ]]
        
        exports.ghmattimysql:execute(getQuery, {evaluacion_id}, function(result)
            if result and #result > 0 then
                local eval = result[1]
                
                local mensaje = ""
                if eval.estado == "aprobado" then
                    mensaje = string.format("¡Evaluación APROBADA! Puntuación: %d/15 (%d%%)", 
                        eval.puntuacion_final, eval.porcentaje)
                elseif eval.estado == "pendiente" then
                    mensaje = string.format("Evaluación PENDIENTE. Hay %d puntos observados que requieren corrección.", 
                        eval.observados)
                else
                    mensaje = string.format("Evaluación RECHAZADA. Puntuación: %d/15 (%d%%). Se requieren al menos 12 puntos aprobados.", 
                        eval.puntuacion_final, eval.porcentaje)
                end
                
                Log("Evaluación enviada: ID=" .. evaluacion_id .. " Estado=" .. eval.estado)
                
                cb({
                    success = true,
                    estado = eval.estado,
                    puntuacion = eval.puntuacion_final,
                    porcentaje = eval.porcentaje,
                    aprobados = eval.aprobados,
                    observados = eval.observados,
                    rechazados = eval.rechazados,
                    message = mensaje
                })
            else
                cb({success = false, message = "Error al calcular la puntuación"})
            end
        end)
    end)
end)

-- Buscar jugadores para evaluar
VORPcore.Callback.Register("ode:buscarJugadores", function(source, cb, data)
    Log("Búsqueda de jugadores iniciada por source: " .. source)
    
    if not TienePermisoEvaluador(source) then
        Log("Permisos denegados para source: " .. source)
        cb({success = false, message = "No tienes permisos"})
        return
    end
    
    local searchTerm = data.search or ""
    Log("Término de búsqueda: '" .. searchTerm .. "'")
    
    -- MODO PRUEBAS: Buscar TODOS los personajes (sin filtro de job)
    local query = [[
        SELECT 
            c.charidentifier as identifier,
            CONCAT(c.firstname, ' ', c.lastname) as nombre,
            COALESCE(c.job, 'N/A') as job,
            COALESCE(c.jobgrade, 0) as grade
        FROM characters c
        WHERE (c.firstname LIKE ? OR c.lastname LIKE ?)
        ORDER BY c.firstname, c.lastname
        LIMIT 50
    ]]
    -- NOTA: Para producción, agregar: AND c.job = 'sheriff'
    
    local searchPattern = "%" .. searchTerm .. "%"
    
    exports.ghmattimysql:execute(query, {searchPattern, searchPattern}, function(result)
        if result then
            Log("Jugadores encontrados: " .. #result)
            for i, jugador in ipairs(result) do
                Log("  - " .. jugador.nombre .. " (ID: " .. jugador.identifier .. ")")
            end
            cb({success = true, jugadores = result})
        else
            Log("No se encontraron resultados o error en query")
            cb({success = true, jugadores = {}})
        end
    end)
end)

-- =====================================================
-- COMANDOS ADMINISTRATIVOS
-- =====================================================

-- Comando para probar la búsqueda de jugadores
RegisterCommand("ode_test_buscar", function(source, args, rawCommand)
    local searchTerm = args[1] or ""
    
    print("^3[ODE TEST] Probando búsqueda con término: '" .. searchTerm .. "'^0")
    
    -- Verificar TODOS los personajes en la tabla
    local testQuery = [[
        SELECT 
            charidentifier,
            firstname,
            lastname,
            COALESCE(job, 'N/A') as job,
            COALESCE(jobgrade, 0) as jobgrade
        FROM characters
        ORDER BY charidentifier DESC
        LIMIT 10
    ]]
    
    exports.ghmattimysql:execute(testQuery, {}, function(result)
        if result then
            print("^2[ODE TEST] Últimos 10 personajes en la tabla characters:^0")
            for i, char in ipairs(result) do
                print(string.format("  %d. %s %s | Job: %s | Grade: %s | ID: %s", 
                    i, char.firstname or "N/A", char.lastname or "N/A", 
                    char.job or "N/A", tostring(char.jobgrade or "N/A"), 
                    tostring(char.charidentifier)))
            end
            print("^3[ODE TEST] Total mostrado: " .. #result .. " personajes^0")
        else
            print("^1[ODE TEST] Error al consultar la tabla characters^0")
        end
    end)
    
    -- Contar TOTAL de personajes
    local countQuery = "SELECT COUNT(*) as total FROM characters"
    
    exports.ghmattimysql:execute(countQuery, {}, function(result)
        if result and result[1] then
            print("^2[ODE TEST] Total de personajes en DB: " .. result[1].total .. "^0")
        end
    end)
    
    -- Si hay término de búsqueda, probar el filtro
    if searchTerm ~= "" then
        local searchQuery = [[
            SELECT 
                charidentifier,
                CONCAT(firstname, ' ', lastname) as nombre,
                COALESCE(job, 'N/A') as job
            FROM characters
            WHERE firstname LIKE ? OR lastname LIKE ?
            LIMIT 20
        ]]
        
        local pattern = "%" .. searchTerm .. "%"
        
        exports.ghmattimysql:execute(searchQuery, {pattern, pattern}, function(result)
            if result then
                print("^2[ODE TEST] Resultados búsqueda '" .. searchTerm .. "': " .. #result .. "^0")
                for i, char in ipairs(result) do
                    print(string.format("  %d. %s | Job: %s | ID: %s", 
                        i, char.nombre, char.job, tostring(char.charidentifier)))
                end
            end
        end)
    end
end, false)

RegisterCommand("ode_stats", function(source, args, rawCommand)
    if not TienePermisoEvaluador(source) then
        TriggerClientEvent("vorp:TipRight", source, "No tienes permisos", 3000)
        return
    end
    
    local query = [[
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobadas,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazadas
        FROM ode_evaluaciones
    ]]
    
    exports.ghmattimysql:execute(query, {}, function(result)
        if result and #result > 0 then
            local stats = result[1]
            local mensaje = string.format(
                "Estadísticas ODE:\nTotal: %d | Aprobadas: %d | Pendientes: %d | Rechazadas: %d",
                stats.total, stats.aprobadas, stats.pendientes, stats.rechazadas
            )
            TriggerClientEvent("vorp:TipRight", source, mensaje, 5000)
        end
    end)
end, false)

print("^2[ODE SERVER] Sistema de Evaluaciones cargado correctamente^0")
