-- =====================================================
-- CLIENTE - SISTEMA DE DISPATCH MANUAL 1899
-- VORP Core - RedM Framework
-- =====================================================

local VORPcore = {}
local isDispatchOpen = false
local hasPermission = false
local isAdmin = false

TriggerEvent("getCore", function(core)
    VORPcore = core
end)

-- =====================================================
-- FUNCIÓN PRINCIPAL
-- =====================================================

local function ToggleDispatch()
    if not hasPermission then
        TriggerServerEvent('dispatch:checkPermission')
        return
    end
    
    isDispatchOpen = not isDispatchOpen
    
    if isDispatchOpen then
        TriggerServerEvent('dispatch:requestUnits')
        SetNuiFocus(true, true)
        SendNUIMessage({
            action = 'openDispatch',
            isAdmin = isAdmin,
            districts = Config.Districts,
            statuses = Config.Status,
            towns = Config.Towns
        })
    else
        SetNuiFocus(false, false)
        SendNUIMessage({ action = 'closeDispatch' })
    end
end

-- =====================================================
-- COMANDOS Y TECLAS
-- =====================================================

RegisterCommand('dispatch', function()
    ToggleDispatch()
end, false)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if IsControlJustReleased(0, Config.OpenKey) then
            ToggleDispatch()
        end
    end
end)

-- =====================================================
-- EVENTOS DEL CLIENTE
-- =====================================================

RegisterNetEvent('dispatch:permissionResult')
AddEventHandler('dispatch:permissionResult', function(allowed, admin)
    hasPermission = allowed
    isAdmin = admin
    
    if allowed then
        ToggleDispatch()
    else
        if VORPcore and VORPcore.NotifyTip then
            VORPcore.NotifyTip(Config.Lang['no_permission'], 5000)
        end
    end
end)

RegisterNetEvent('dispatch:receiveUnits')
AddEventHandler('dispatch:receiveUnits', function(units)
    SendNUIMessage({
        action = 'updateUnits',
        units = units
    })
end)

RegisterNetEvent('dispatch:unitUpdated')
AddEventHandler('dispatch:unitUpdated', function()
    if isDispatchOpen then
        TriggerServerEvent('dispatch:requestUnits')
    end
end)

-- =====================================================
-- CALLBACKS NUI
-- =====================================================

RegisterNUICallback('close', function(data, cb)
    isDispatchOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('registerUnit', function(data, cb)
    if data.district and data.status then
        TriggerServerEvent('dispatch:registerUnit', data.district, data.status, data.town)
    end
    cb('ok')
end)

RegisterNUICallback('updateOwnStatus', function(data, cb)
    if data.status then
        TriggerServerEvent('dispatch:updateOwnStatus', data.status)
    end
    cb('ok')
end)

RegisterNUICallback('updateOwnDistrict', function(data, cb)
    if data.district then
        TriggerServerEvent('dispatch:updateOwnDistrict', data.district)
    end
    cb('ok')
end)

RegisterNUICallback('updateOwnTown', function(data, cb)
    TriggerServerEvent('dispatch:updateOwnTown', data.town)
    cb('ok')
end)

RegisterNUICallback('updateUnit', function(data, cb)
    if isAdmin and data.unitId and data.field and data.value then
        TriggerServerEvent('dispatch:updateUnit', data.unitId, data.field, data.value)
    end
    cb('ok')
end)

RegisterNUICallback('refreshUnits', function(data, cb)
    TriggerServerEvent('dispatch:requestUnits')
    cb('ok')
end)

RegisterNUICallback('endService', function(data, cb)
    cb({ok = true})
    TriggerServerEvent('dispatch:removeUnit')
end)

-- =====================================================
-- LIMPIEZA
-- =====================================================

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        if hasPermission then
            TriggerServerEvent('dispatch:removeUnit')
        end
        if isDispatchOpen then
            SetNuiFocus(false, false)
        end
    end
end)

print("^2[DAEXV DISPATCH]^7 Cliente cargado - F4 o /dispatch")
