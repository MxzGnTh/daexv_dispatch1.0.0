-- =====================================================
-- CLIENTE - SISTEMA DE DISPATCH MANUAL 1899
-- Sin GPS, Radios, Mapas ni Iconos
-- Apertura con F6
-- =====================================================

print("^2[DAEXV DISPATCH]^7 ========================================")
print("^2[DAEXV DISPATCH]^7 Iniciando cliente...")
print("^2[DAEXV DISPATCH]^7 ========================================")

local VORPcore = {}

TriggerEvent("getCore", function(core)
    VORPcore = core
    print("^2[DAEXV DISPATCH]^7 VORP Core cargado")
end)

local isDispatchOpen = false
local hasPermission = false
local isAdmin = false
local currentUnits = {}

print("^2[DAEXV DISPATCH]^7 Variables inicializadas")

-- =====================================================
-- FUNCIÓN PARA ABRIR/CERRAR DISPATCH
-- =====================================================

local function ToggleDispatch()
    print("^3[DAEXV DISPATCH]^7 ToggleDispatch llamado")
    print("^3[DAEXV DISPATCH]^7 Permiso actual: " .. tostring(hasPermission))
    print("^3[DAEXV DISPATCH]^7 Dispatch abierto: " .. tostring(isDispatchOpen))
    
    if not hasPermission then
        -- Verificar permiso primero
        print("^3[DAEXV DISPATCH]^7 Sin permiso, solicitando verificación al servidor...")
        TriggerServerEvent('dispatch:checkPermission')
        return
    end
    
    isDispatchOpen = not isDispatchOpen
    
    if isDispatchOpen then
        print("^2[DAEXV DISPATCH]^7 Abriendo panel dispatch...")
        -- Solicitar unidades actualizadas
        TriggerServerEvent('dispatch:requestUnits')
        
        -- Abrir UI
        SetNuiFocus(true, true)
        SendNUIMessage({
            action = 'openDispatch',
            isAdmin = isAdmin,
            districts = Config.Districts,
            statuses = Config.Status,
            towns = Config.Towns
        })
        print("^2[DAEXV DISPATCH]^7 Panel abierto, NuiFocus activado")
    else
        print("^3[DAEXV DISPATCH]^7 Cerrando panel dispatch...")
        -- Cerrar UI
        SetNuiFocus(false, false)
        SendNUIMessage({
            action = 'closeDispatch'
        })
        print("^2[DAEXV DISPATCH]^7 Panel cerrado, NuiFocus desactivado")
    end
end

-- =====================================================
-- REGISTRO DE COMANDO
-- =====================================================

-- Comando /dispatch
RegisterCommand('dispatch', function(source, args, rawCommand)
    print("^3[DAEXV DISPATCH]^7 Comando /dispatch ejecutado")
    ToggleDispatch()
end, false)

print("^2[DAEXV DISPATCH]^7 Comando /dispatch registrado")

-- Control de tecla F6
Citizen.CreateThread(function()
    print("^2[DAEXV DISPATCH]^7 Thread de control de tecla F6 iniciado")
    while true do
        Citizen.Wait(0)
        
        -- Detectar F4 (key code 115)
        if IsControlJustReleased(0, 0x1F6D95E5) then -- F4
            print("^3[DAEXV DISPATCH]^7 Tecla F4 presionada")
            ToggleDispatch()
        end
    end
end)

-- =====================================================
-- EVENTOS DEL CLIENTE
-- =====================================================

-- Resultado de verificación de permisos
RegisterNetEvent('dispatch:permissionResult')
AddEventHandler('dispatch:permissionResult', function(allowed, admin)
    print("^3[DAEXV DISPATCH]^7 Respuesta de permisos recibida del servidor")
    print("^3[DAEXV DISPATCH]^7 Permitido: " .. tostring(allowed))
    print("^3[DAEXV DISPATCH]^7 Es Admin: " .. tostring(admin))
    
    hasPermission = allowed
    isAdmin = admin
    
    if allowed then
        print("^2[DAEXV DISPATCH]^7 Permiso concedido, abriendo dispatch")
        ToggleDispatch()
    else
        print("^1[DAEXV DISPATCH]^7 Permiso denegado - No tienes acceso al dispatch")
        if VORPcore and VORPcore.NotifyTip then
            VORPcore.NotifyTip("No tienes permiso para acceder al dispatch", 5000)
        else
            print("^1[DAEXV DISPATCH]^7 No se pudo mostrar notificación VORP")
        end
    end
end)

-- Recibir unidades del servidor
RegisterNetEvent('dispatch:receiveUnits')
AddEventHandler('dispatch:receiveUnits', function(units)
    print("^3[DAEXV DISPATCH]^7 Unidades recibidas del servidor")
    print("^3[DAEXV DISPATCH]^7 Total de unidades: " .. #units)
    
    currentUnits = units
    
    -- Enviar a la UI
    SendNUIMessage({
        action = 'updateUnits',
        units = units
    })
    print("^2[DAEXV DISPATCH]^7 Unidades enviadas al NUI")
end)

-- Notificación de actualización de unidades
RegisterNetEvent('dispatch:unitUpdated')
AddEventHandler('dispatch:unitUpdated', function()
    print("^3[DAEXV DISPATCH]^7 Notificación de unidad actualizada")
    if isDispatchOpen then
        print("^3[DAEXV DISPATCH]^7 Solicitando unidades actualizadas...")
        -- Solicitar unidades actualizadas
        TriggerServerEvent('dispatch:requestUnits')
    end
end)

-- =====================================================
-- CALLBACKS NUI
-- =====================================================

-- Cerrar UI
RegisterNUICallback('close', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: close")
    isDispatchOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

-- Registrar unidad al entrar en servicio
RegisterNUICallback('registerUnit', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: registerUnit")
    print("^3[DAEXV DISPATCH]^7 Distrito: " .. tostring(data.district))
    print("^3[DAEXV DISPATCH]^7 Estado: " .. tostring(data.status))
    print("^3[DAEXV DISPATCH]^7 Pueblo: " .. tostring(data.town))
    if data.district and data.status then
        TriggerServerEvent('dispatch:registerUnit', data.district, data.status, data.town)
    end
    cb('ok')
end)

-- Actualizar propio estado
RegisterNUICallback('updateOwnStatus', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: updateOwnStatus")
    print("^3[DAEXV DISPATCH]^7 Nuevo estado: " .. tostring(data.status))
    if data.status then
        TriggerServerEvent('dispatch:updateOwnStatus', data.status)
    end
    cb('ok')
end)

-- Actualizar propio distrito
RegisterNUICallback('updateOwnDistrict', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: updateOwnDistrict")
    print("^3[DAEXV DISPATCH]^7 Nuevo distrito: " .. tostring(data.district))
    if data.district then
        TriggerServerEvent('dispatch:updateOwnDistrict', data.district)
    end
    cb('ok')
end)

-- Actualizar propio pueblo
RegisterNUICallback('updateOwnTown', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: updateOwnTown")
    print("^3[DAEXV DISPATCH]^7 Nuevo pueblo: " .. tostring(data.town))
    TriggerServerEvent('dispatch:updateOwnTown', data.town)
    cb('ok')
end)

-- Actualizar unidad de otro oficial (solo admin)
RegisterNUICallback('updateUnit', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: updateUnit (Admin)")
    print("^3[DAEXV DISPATCH]^7 Unit ID: " .. tostring(data.unitId))
    print("^3[DAEXV DISPATCH]^7 Campo: " .. tostring(data.field))
    print("^3[DAEXV DISPATCH]^7 Valor: " .. tostring(data.value))
    if isAdmin and data.unitId and data.field and data.value then
        TriggerServerEvent('dispatch:updateUnit', data.unitId, data.field, data.value)
    end
    cb('ok')
end)

-- Solicitar actualización de unidades
RegisterNUICallback('refreshUnits', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: refreshUnits")
    TriggerServerEvent('dispatch:requestUnits')
    cb('ok')
end)

-- Salir de servicio
RegisterNUICallback('removeUnit', function(data, cb)
    print("^3[DAEXV DISPATCH]^7 NUI Callback: removeUnit")
    TriggerServerEvent('dispatch:removeUnit')
    cb('ok')
end)

-- =====================================================
-- LIMPIAR AL SALIR DEL JUEGO
-- =====================================================

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        print("^1[DAEXV DISPATCH]^7 Recurso deteniéndose...")
        if hasPermission then
            TriggerServerEvent('dispatch:removeUnit')
        end
        
        -- Cerrar UI si está abierta
        if isDispatchOpen then
            SetNuiFocus(false, false)
        end
        print("^1[DAEXV DISPATCH]^7 Cliente detenido")
    end
end)

print("^2[DAEXV DISPATCH]^7 ========================================")
print("^2[DAEXV DISPATCH]^7 Cliente cargado completamente")
print("^2[DAEXV DISPATCH]^7 Presiona F6 o escribe /dispatch")
print("^2[DAEXV DISPATCH]^7 ========================================")
