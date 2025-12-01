-- =====================================================
-- ODE CLIENT - SISTEMA DE EVALUACIONES 1899
-- Compatible con VORP Core
-- =====================================================

local VORPcore = {}
local odeAbierto = false

-- Esperar a que VORPcore esté listo
TriggerEvent("getCore", function(core)
    VORPcore = core
    print("^2[ODE CLIENT] VORPcore inicializado correctamente^0")
end)

-- =====================================================
-- COMANDOS PARA ABRIR EL SISTEMA ODE
-- =====================================================

RegisterCommand("ode", function()
    AbrirSistemaODE()
end, false)

-- También se puede abrir desde el botón del dispatch
RegisterNUICallback("abrirODE", function(data, cb)
    AbrirSistemaODE()
    cb({success = true})
end)

-- =====================================================
-- FUNCIÓN PRINCIPAL PARA ABRIR ODE
-- =====================================================

function AbrirSistemaODE()
    if odeAbierto then return end
    
    odeAbierto = true
    
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        action = "abrirODE",
        data = {}
    })
end

-- =====================================================
-- CALLBACKS NUI -> CLIENT
-- =====================================================

-- Cerrar sistema ODE
RegisterNUICallback("cerrarODE", function(data, cb)
    odeAbierto = false
    
    -- Solo quitar el focus si el dispatch NO está abierto
    -- Si dispatchAbierto es true, el dispatch sigue visible y necesita el cursor
    if not data.dispatchAbierto then
        SetNuiFocus(false, false)
    end
    
    cb({success = true})
end)

-- Obtener lista de evaluaciones
RegisterNUICallback("ode_getEvaluaciones", function(data, cb)
    print("[ODE CLIENT] Llamando ode:getEvaluaciones")
    TriggerServerCallback("ode:getEvaluaciones", function(result)
        cb(result)
    end, data)
end)

-- Crear nueva evaluación
RegisterNUICallback("ode_crearEvaluacion", function(data, cb)
    print("[ODE CLIENT] Llamando ode:crearEvaluacion")
    TriggerServerCallback("ode:crearEvaluacion", function(result)
        cb(result)
    end, data)
end)

-- Obtener detalle de evaluación
RegisterNUICallback("ode_getEvaluacionDetalle", function(data, cb)
    print("[ODE CLIENT] Llamando ode:getEvaluacionDetalle")
    TriggerServerCallback("ode:getEvaluacionDetalle", function(result)
        cb(result)
    end, data)
end)

-- Actualizar evaluación
RegisterNUICallback("ode_actualizarEvaluacion", function(data, cb)
    print("[ODE CLIENT] Llamando ode:actualizarEvaluacion")
    TriggerServerCallback("ode:actualizarEvaluacion", function(result)
        cb(result)
    end, data)
end)

-- Enviar evaluación
RegisterNUICallback("ode_enviarEvaluacion", function(data, cb)
    print("[ODE CLIENT] Llamando ode:enviarEvaluacion")
    TriggerServerCallback("ode:enviarEvaluacion", function(result)
        cb(result)
    end, data)
end)

-- Buscar jugadores
RegisterNUICallback("ode_buscarJugadores", function(data, cb)
    print("[ODE CLIENT] Buscando jugadores con término: " .. (data.search or "vacio"))
    
    if not VORPcore or not VORPcore.Callback then
        print("^1[ODE CLIENT] ERROR: VORPcore no está inicializado^0")
        cb({success = false, message = "VORPcore no cargado", jugadores = {}})
        return
    end
    
    TriggerServerCallback("ode:buscarJugadores", function(result)
        print("[ODE CLIENT] Resultado de búsqueda recibido")
        if result.success then
            print("[ODE CLIENT] Jugadores encontrados: " .. (result.jugadores and #result.jugadores or 0))
        else
            print("[ODE CLIENT] Error: " .. (result.message or "desconocido"))
        end
        cb(result)
    end, data)
end)

-- =====================================================
-- HELPER PARA CALLBACKS
-- =====================================================

function TriggerServerCallback(callbackName, callback, ...)
    if not VORPcore or not VORPcore.Callback then
        print("^1[ODE CLIENT] ERROR: VORPcore.Callback no disponible para " .. callbackName .. "^0")
        callback({success = false, message = "VORPcore no disponible"})
        return
    end
    
    VORPcore.Callback.TriggerAsync(callbackName, callback, ...)
end

-- =====================================================
-- EVENTOS
-- =====================================================

-- Cerrar ODE con tecla ESC
RegisterNUICallback("cerrarODEconESC", function(data, cb)
    odeAbierto = false
    SetNuiFocus(false, false)
    cb({success = true})
end)

print("^2[ODE CLIENT] Sistema de Evaluaciones cargado correctamente^0")
