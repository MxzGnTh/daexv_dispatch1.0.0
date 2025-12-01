-- =====================================================
-- SERVIDOR - SISTEMA DE DISPATCH MANUAL 1899
-- VORP Core - RedM Framework
-- =====================================================

local VORPcore = {}
local activeUnits = {}

TriggerEvent("getCore", function(core)
    VORPcore = core
end)

-- Inicialización
Citizen.CreateThread(function()
    while VORPcore.getUser == nil do
        Citizen.Wait(100)
    end
    print("^2[DAEXV DISPATCH]^7 Sistema iniciado")
    
    -- Limpiar tabla al iniciar
    exports.oxmysql:execute('DELETE FROM dispatch_units', {})
    activeUnits = {}
end)

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

local function HasAllowedJob(source)
    if Config.AllowAllPlayers then return true end
    if not Config.AllowedJobs then return false end
    
    local User = VORPcore.getUser(source)
    if not User then return false end
    
    local Character = User.getUsedCharacter
    if not Character then return false end
    
    for _, allowedJob in ipairs(Config.AllowedJobs) do
        if Character.job == allowedJob then
            return true
        end
    end
    
    return false
end

-- Verificar si es un rango administrativo
local function IsAdminRank(source)
    if Config.AllowAllPlayers then return true end
    if not Config.AdminRanks then return false end
    
    local User = VORPcore.getUser(source)
    if not User then return false end
    
    local Character = User.getUsedCharacter
    if not Character then return false end
    
    for _, adminRank in ipairs(Config.AdminRanks) do
        if Character.job == adminRank and Character.jobGrade >= (Config.Grades[Character.job] or 0) then
            return true
        end
    end
    
    return false
end

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

RegisterNetEvent('dispatch:checkPermission')
AddEventHandler('dispatch:checkPermission', function()
    local _source = source
    local hasPermission = HasAllowedJob(_source)
    local isAdmin = hasPermission and IsAdminRank(_source) or false
    
    TriggerClientEvent('dispatch:permissionResult', _source, hasPermission, isAdmin)
end)

RegisterNetEvent('dispatch:requestUnits')
AddEventHandler('dispatch:requestUnits', function()
    local _source = source
    if not HasAllowedJob(_source) then return end
    
    local units = {}
    for _, unit in pairs(activeUnits) do
        table.insert(units, {
            id = unit.id or 0,
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
    
    table.sort(units, function(a, b)
        if a.district == b.district then
            return (a.lastname or "") < (b.lastname or "")
        end
        return (a.district or "") < (b.district or "")
    end)
    
    TriggerClientEvent('dispatch:receiveUnits', _source, units)
end)

RegisterNetEvent('dispatch:registerUnit')
AddEventHandler('dispatch:registerUnit', function(district, status, town)
    local _source = source
    if not HasAllowedJob(_source) then return end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    local charKey = tostring(charData.charidentifier)
    
    activeUnits[charKey] = {
        id = 0,
        charidentifier = charData.charidentifier,
        identifier = charData.identifier,
        firstname = charData.firstname,
        lastname = charData.lastname,
        jobname = charData.job,
        district = district,
        assigned_town = town,
        status = status,
        last_update = os.date("%Y-%m-%d %H:%M:%S"),
        source = _source
    }
    
    -- Backup en DB
    exports.oxmysql:execute('SELECT id FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier}, function(result)
        if result and #result > 0 then
            exports.oxmysql:execute('UPDATE dispatch_units SET district = ?, assigned_town = ?, status = ?, jobname = ? WHERE charidentifier = ?', {
                district, town, status, charData.job, charData.charidentifier
            })
        else
            exports.oxmysql:execute('INSERT INTO dispatch_units (identifier, charidentifier, firstname, lastname, jobname, district, assigned_town, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
                charData.identifier, charData.charidentifier, charData.firstname, charData.lastname, charData.job, district, town, status
            })
        end
    end)
    
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

RegisterNetEvent('dispatch:updateOwnStatus')
AddEventHandler('dispatch:updateOwnStatus', function(status)
    local _source = source
    if not HasAllowedJob(_source) then return end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    local charKey = tostring(charData.charidentifier)
    if activeUnits[charKey] then
        activeUnits[charKey].status = status
        activeUnits[charKey].last_update = os.date("%Y-%m-%d %H:%M:%S")
    end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET status = ? WHERE charidentifier = ?', {status, charData.charidentifier})
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

RegisterNetEvent('dispatch:updateOwnDistrict')
AddEventHandler('dispatch:updateOwnDistrict', function(district)
    local _source = source
    if not HasAllowedJob(_source) then return end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    local charKey = tostring(charData.charidentifier)
    if activeUnits[charKey] then
        activeUnits[charKey].district = district
        activeUnits[charKey].last_update = os.date("%Y-%m-%d %H:%M:%S")
    end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET district = ? WHERE charidentifier = ?', {district, charData.charidentifier})
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

RegisterNetEvent('dispatch:updateOwnTown')
AddEventHandler('dispatch:updateOwnTown', function(town)
    local _source = source
    if not HasAllowedJob(_source) then return end
    
    local charData = GetCharacterData(_source)
    if not charData then return end
    
    local charKey = tostring(charData.charidentifier)
    if activeUnits[charKey] then
        activeUnits[charKey].assigned_town = town
        activeUnits[charKey].last_update = os.date("%Y-%m-%d %H:%M:%S")
    end
    
    exports.oxmysql:execute('UPDATE dispatch_units SET assigned_town = ? WHERE charidentifier = ?', {town, charData.charidentifier})
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

RegisterNetEvent('dispatch:updateUnit')
AddEventHandler('dispatch:updateUnit', function(unitId, field, value)
    local _source = source
    if not IsAdminRank(_source) then return end
    
    -- Actualizar en memoria
    for charKey, unit in pairs(activeUnits) do
        if unit.charidentifier == unitId then
            activeUnits[charKey][field] = value
            activeUnits[charKey].last_update = os.date("%Y-%m-%d %H:%M:%S")
            break
        end
    end
    
    local query = string.format('UPDATE dispatch_units SET %s = ? WHERE charidentifier = ?', field)
    exports.oxmysql:execute(query, {value, unitId})
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

RegisterNetEvent('dispatch:removeUnit')
AddEventHandler('dispatch:removeUnit', function()
    local _source = source
    
    -- Eliminar de memoria
    for key, unit in pairs(activeUnits) do
        if unit.source == _source then
            print("^2[DAEXV DISPATCH]^7 " .. unit.firstname .. " " .. unit.lastname .. " salió de servicio")
            activeUnits[key] = nil
            break
        end
    end
    
    -- Eliminar de DB
    local charData = GetCharacterData(_source)
    if charData then
        exports.oxmysql:execute('DELETE FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier})
    end
    
    TriggerClientEvent('dispatch:unitUpdated', -1)
end)

AddEventHandler('playerDropped', function(reason)
    local _source = source
    
    for key, unit in pairs(activeUnits) do
        if unit.source == _source then
            activeUnits[key] = nil
            break
        end
    end
    
    local charData = GetCharacterData(_source)
    if charData then
        exports.oxmysql:execute('DELETE FROM dispatch_units WHERE charidentifier = ?', {charData.charidentifier})
    end
end)

print("^2[DAEXV DISPATCH]^7 Servidor cargado")
