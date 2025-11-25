-- =====================================================
-- SERVIDOR - SISTEMA DE DISPATCH MANUAL 1899
-- Sin GPS, Radios, Mapas ni Iconos
-- Todo es manual y administrativo
-- =====================================================

print("^2[DAEXV DISPATCH]^7 ========================================")
print("^2[DAEXV DISPATCH]^7 Servidor iniciando...")
print("^2[DAEXV DISPATCH]^7 ========================================")

local VORPcore = {}

TriggerEvent("getCore", function(core)
    VORPcore = core
    print("^2[DAEXV DISPATCH]^7 VORP Core cargado correctamente")
end)

-- Esperar a que VORP esté listo
Citizen.CreateThread(function()
    while VORPcore.getUser == nil do
        Citizen.Wait(100)
    end
    print("^2[DAEXV DISPATCH]^7 Sistema listo para recibir conexiones")
end)

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Verificar si el jugador tiene un trabajo permitido
local function HasAllowedJob(source)
    print("^3[DAEXV DISPATCH]^7 Verificando trabajo para source: " .. source)
    
    -- Si Config.AllowAllPlayers está activado, permitir a todos
    if Config.AllowAllPlayers then
        print("^2[DAEXV DISPATCH]^7 AllowAllPlayers=true - Acceso concedido")
        return true
    end
    
    -- Validar que Config.AllowedJobs exista y sea una tabla
    if not Config.AllowedJobs or type(Config.AllowedJobs) ~= "table" then
        print("^1[DAEXV DISPATCH]^7 ERROR: Config.AllowedJobs no es una tabla valida")
        return false
    end
    
    local User = VORPcore.getUser(source)
    if not User then 
        print("^1[DAEXV DISPATCH]^7 Usuario no encontrado en VORP")
        return false 
    end
    
    local Character = User.getUsedCharacter
    if not Character then 
        print("^1[DAEXV DISPATCH]^7 Personaje no encontrado")
        return false 
    end
    
    local job = Character.job
    print("^3[DAEXV DISPATCH]^7 Trabajo del jugador: " .. tostring(job))
    
    for _, allowedJob in ipairs(Config.AllowedJobs) do
        if job == allowedJob then
            print("^2[DAEXV DISPATCH]^7 Trabajo PERMITIDO: " .. job)
            return true
        end
    end
    
    print("^1[DAEXV DISPATCH]^7 Trabajo NO permitido: " .. tostring(job))
    return false
end

-- Verificar si es un rango administrativo
local function IsAdminRank(source)
    -- MODO TESTING: Permitir a todos ser admin
    if Config.AllowAllPlayers then
        print("^2[DAEXV DISPATCH]^7 AllowAllPlayers=true - Admin forzado para testing")
        return true
    end
    
    -- Validar que Config.AdminRanks exista y sea una tabla
    if not Config.AdminRanks or type(Config.AdminRanks) ~= "table" then
        print("^1[DAEXV DISPATCH]^7 ERROR: Config.AdminRanks no es una tabla valida")
        return false
    end
    
    local User = VORPcore.getUser(source)
    if not User then return false end
    
    local Character = User.getUsedCharacter
    if not Character then return false end
    
    local job = Character.job
    
    for _, adminRank in ipairs(Config.AdminRanks) do
        if job == adminRank then
            print("^2[DAEXV DISPATCH]^7 Rango ADMIN: " .. job)
            return true
        end
    end
    
    return false
end

-- Obtener datos del personaje
local function GetCharacterData(source)
    local User = VORPcore.getUser(source)
    if not User then return nil end
    
    local Character = User.getUsedCharacter
    if not Character then return nil end
    
    return {
        identifier = Character.identifier,
        charidentifier = Character.charIdentifier,
        firstname = Character.firstname,
        lastname = Character.lastname,
        job = Character.job
    }
end

-- =====================================================
-- EVENTOS DEL SERVIDOR
-- =====================================================

-- Verificar permisos y enviar configuración al cliente
RegisterNetEvent('dispatch:checkPermission')
AddEventHandler('dispatch:checkPermission', function()
    local _source = source
    print("^3[DAEXV DISPATCH]^7 ========================================")
    print("^3[DAEXV DISPATCH]^7 Verificacion de permisos - Jugador: " .. _source)
    
    local hasPermission = HasAllowedJob(_source)
    local isAdmin = IsAdminRank(_source)
    
    if hasPermission then
        isAdmin = IsAdminRank(_source)
        print("^2[DAEXV DISPATCH]^7 ACCESO CONCEDIDO - Admin: " .. tostring(isAdmin))
        TriggerClientEvent('dispatch:permissionResult', _source, true, isAdmin)
    else
        print("^1[DAEXV DISPATCH]^7 ACCESO DENEGADO")
        TriggerClientEvent('dispatch:permissionResult', _source, false, false)
    end
    
    print("^3[DAEXV DISPATCH]^7 ========================================")
end)

-- Obtener todas las unidades activas
RegisterNetEvent('dispatch:requestUnits')
AddEventHandler('dispatch:requestUnits', function()
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    exports.oxmysql:execute('SELECT * FROM dispatch_units ORDER BY district, lastname', {}, function(result)
        local units = {}
        
        if result and #result > 0 then
            for _, unit in ipairs(result) do
                table.insert(units, {
                    id = unit.id,
                    charidentifier = unit.charidentifier,
                    firstname = unit.firstname,
                    lastname = unit.lastname,
                    job = unit.jobname,
                    district = unit.district,
                    assigned_town = unit.assigned_town,
                    status = unit.status,
                    last_update = unit.last_update
                })
            end
        end
        
        print("^2[DAEXV DISPATCH]^7 Enviando " .. #units .. " unidades al cliente")
        TriggerClientEvent('dispatch:receiveUnits', _source, units)
    end)
end)

-- Registrar o actualizar unidad al entrar en servicio
RegisterNetEvent('dispatch:registerUnit')
AddEventHandler('dispatch:registerUnit', function(district, status, town)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    -- Verificar si ya existe
    exports.oxmysql:execute('SELECT id FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier}, function(result)
        if result and #result > 0 then
            -- Actualizar
            exports.oxmysql:execute('UPDATE dispatch_units SET district = ?, assigned_town = ?, status = ?, jobname = ? WHERE charidentifier = ?', {
                district, town, status, charData.job, charData.charidentifier
            }, function(affectedRows)
                print("^2[DAEXV DISPATCH]^7 Unidad actualizada: " .. charData.firstname .. " " .. charData.lastname)
                TriggerClientEvent('dispatch:unitUpdated', -1)
            end)
        else
            -- Insertar nuevo
            exports.oxmysql:execute('INSERT INTO dispatch_units (identifier, charidentifier, firstname, lastname, jobname, district, assigned_town, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
                charData.identifier, charData.charidentifier, charData.firstname, charData.lastname, charData.job, district, town, status
            }, function(insertId)
                print("^2[DAEXV DISPATCH]^7 Nueva unidad registrada: " .. charData.firstname .. " " .. charData.lastname)
                TriggerClientEvent('dispatch:unitUpdated', -1)
            end)
        end
    end)
end)

-- Actualizar propio estado
RegisterNetEvent('dispatch:updateOwnStatus')
AddEventHandler('dispatch:updateOwnStatus', function(status)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET status = ? WHERE charidentifier = ?', {
        status, charData.charidentifier
    }, function(affectedRows)
        if affectedRows > 0 then
            print("^2[DAEXV DISPATCH]^7 Estado actualizado: " .. status)
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- Actualizar propio distrito
RegisterNetEvent('dispatch:updateOwnDistrict')
AddEventHandler('dispatch:updateOwnDistrict', function(district)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET district = ? WHERE charidentifier = ?', {
        district, charData.charidentifier
    }, function(affectedRows)
        if affectedRows > 0 then
            print("^2[DAEXV DISPATCH]^7 Distrito actualizado: " .. district)
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- Actualizar propio pueblo
RegisterNetEvent('dispatch:updateOwnTown')
AddEventHandler('dispatch:updateOwnTown', function(town)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET assigned_town = ? WHERE charidentifier = ?', {
        town, charData.charidentifier
    }, function(affectedRows)
        if affectedRows > 0 then
            print("^2[DAEXV DISPATCH]^7 Pueblo actualizado: " .. tostring(town))
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- Actualizar unidad (solo admin)
RegisterNetEvent('dispatch:updateUnit')
AddEventHandler('dispatch:updateUnit', function(unitId, field, value)
    local _source = source
    
    if not IsAdminRank(_source) then
        return
    end
    
    local query = string.format('UPDATE dispatch_units SET %s = ? WHERE charidentifier = ?', field)
    
    exports.oxmysql:execute(query, {value, unitId}, function(affectedRows)
        if affectedRows > 0 then
            print("^2[DAEXV DISPATCH]^7 Admin actualizo: " .. field .. " = " .. value)
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- Eliminar unidad
RegisterNetEvent('dispatch:removeUnit')
AddEventHandler('dispatch:removeUnit', function()
    local _source = source
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('DELETE FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier}, function(affectedRows)
        if affectedRows > 0 then
            print("^2[DAEXV DISPATCH]^7 Unidad removida: " .. charData.firstname .. " " .. charData.lastname)
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- Limpiar unidades al desconectarse
AddEventHandler('playerDropped', function(reason)
    local _source = source
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('DELETE FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier}, function(affectedRows)
        if affectedRows > 0 then
            print("^3[DAEXV DISPATCH]^7 Unidad removida por desconexion")
            TriggerClientEvent('dispatch:unitUpdated', -1)
        end
    end)
end)

-- =====================================================
-- SISTEMA ODE (Officer Development & Evaluation)
-- =====================================================

-- Crear nueva evaluación
RegisterNetEvent('ode:createEvaluation')
AddEventHandler('ode:createEvaluation', function(evaluatedOfficerId, evaluatedOfficerName)
    local _source = source
    
    if not IsAdminRank(_source) then
        print("^1[ODE]^7 Usuario sin permisos de admin intentó crear evaluación")
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    local evaluatorName = charData.firstname .. " " .. charData.lastname
    
    exports.oxmysql:execute('INSERT INTO ode_evaluations (evaluated_officer_id, evaluated_officer_name, evaluator_id, evaluator_name, status) VALUES (?, ?, ?, ?, ?)', {
        evaluatedOfficerId, evaluatedOfficerName, charData.charidentifier, evaluatorName, 'in_progress'
    }, function(insertId)
        print("^2[ODE]^7 Nueva evaluación creada - ID: " .. insertId)
        TriggerClientEvent('ode:evaluationCreated', _source, insertId)
    end)
end)

-- Obtener evaluaciones de un oficial
RegisterNetEvent('ode:getEvaluations')
AddEventHandler('ode:getEvaluations', function(officerId)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    exports.oxmysql:execute('SELECT * FROM ode_evaluations WHERE evaluated_officer_id = ? ORDER BY evaluation_date DESC', {officerId}, function(evaluations)
        TriggerClientEvent('ode:receiveEvaluations', _source, evaluations)
    end)
end)

-- Obtener detalles de una evaluación específica
RegisterNetEvent('ode:getEvaluationDetails')
AddEventHandler('ode:getEvaluationDetails', function(evaluationId)
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    exports.oxmysql:execute('SELECT * FROM ode_evaluations WHERE id = ?', {evaluationId}, function(evaluations)
        if evaluations and #evaluations > 0 then
            local evaluation = evaluations[1]
            
            -- Obtener checks de esta evaluación
            exports.oxmysql:execute('SELECT * FROM ode_evaluation_checks WHERE evaluation_id = ? ORDER BY category, id', {evaluationId}, function(checks)
                evaluation.checks = checks or {}
                TriggerClientEvent('ode:receiveEvaluationDetails', _source, evaluation)
            end)
        else
            TriggerClientEvent('ode:receiveEvaluationDetails', _source, nil)
        end
    end)
end)

-- Guardar/actualizar un check individual
RegisterNetEvent('ode:saveCheck')
AddEventHandler('ode:saveCheck', function(evaluationId, category, checkItem, checkValue, notes)
    local _source = source
    
    if not IsAdminRank(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    -- Verificar si el check ya existe
    exports.oxmysql:execute('SELECT id FROM ode_evaluation_checks WHERE evaluation_id = ? AND category = ? AND check_item = ?', {
        evaluationId, category, checkItem
    }, function(existing)
        if existing and #existing > 0 then
            -- Actualizar check existente
            local checkId = existing[1].id
            exports.oxmysql:execute('UPDATE ode_evaluation_checks SET check_value = ?, notes = ?, checked_at = CURRENT_TIMESTAMP WHERE id = ?', {
                checkValue, notes, checkId
            }, function(affectedRows)
                print("^2[ODE]^7 Check actualizado - ID: " .. checkId)
                
                -- Log de cambio
                exports.oxmysql:execute('INSERT INTO ode_logs (evaluation_id, check_id, action, new_value, changed_by) VALUES (?, ?, ?, ?, ?)', {
                    evaluationId, checkId, 'check_updated', checkValue, charData.charidentifier
                })
                
                TriggerClientEvent('ode:checkSaved', _source, true)
            end)
        else
            -- Insertar nuevo check
            exports.oxmysql:execute('INSERT INTO ode_evaluation_checks (evaluation_id, category, check_item, check_value, notes) VALUES (?, ?, ?, ?, ?)', {
                evaluationId, category, checkItem, checkValue, notes
            }, function(insertId)
                print("^2[ODE]^7 Nuevo check guardado - ID: " .. insertId)
                
                -- Log de creación
                exports.oxmysql:execute('INSERT INTO ode_logs (evaluation_id, check_id, action, new_value, changed_by) VALUES (?, ?, ?, ?, ?)', {
                    evaluationId, insertId, 'check_created', checkValue, charData.charidentifier
                })
                
                TriggerClientEvent('ode:checkSaved', _source, true)
            end)
        end
    end)
end)

-- Actualizar notas generales de la evaluación
RegisterNetEvent('ode:updateNotes')
AddEventHandler('ode:updateNotes', function(evaluationId, notes)
    local _source = source
    
    if not IsAdminRank(_source) then
        return
    end
    
    exports.oxmysql:execute('UPDATE ode_evaluations SET overall_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', {
        notes, evaluationId
    }, function(affectedRows)
        print("^2[ODE]^7 Notas de evaluación actualizadas")
        TriggerClientEvent('ode:notesUpdated', _source, true)
    end)
end)

-- Completar evaluación
RegisterNetEvent('ode:completeEvaluation')
AddEventHandler('ode:completeEvaluation', function(evaluationId)
    local _source = source
    
    if not IsAdminRank(_source) then
        return
    end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    exports.oxmysql:execute('UPDATE ode_evaluations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', {
        'completed', evaluationId
    }, function(affectedRows)
        print("^2[ODE]^7 Evaluación completada - ID: " .. evaluationId)
        
        -- Log de completado
        exports.oxmysql:execute('INSERT INTO ode_logs (evaluation_id, action, new_value, changed_by) VALUES (?, ?, ?, ?)', {
            evaluationId, 'evaluation_completed', 'completed', charData.charidentifier
        })
        
        TriggerClientEvent('ode:evaluationCompleted', _source, true)
    end)
end)

-- Obtener todos los oficiales para evaluación
RegisterNetEvent('ode:getOfficersList')
AddEventHandler('ode:getOfficersList', function()
    local _source = source
    
    if not HasAllowedJob(_source) then
        return
    end
    
    exports.oxmysql:execute('SELECT DISTINCT charidentifier, firstname, lastname, jobname FROM dispatch_units ORDER BY lastname, firstname', {}, function(officers)
        TriggerClientEvent('ode:receiveOfficersList', _source, officers or {})
    end)
end)

print("^2[DAEXV DISPATCH]^7 Servidor cargado completamente")
print("^2[ODE]^7 Sistema ODE cargado correctamente")
