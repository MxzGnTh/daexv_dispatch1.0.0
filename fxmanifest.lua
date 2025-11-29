-- =====================================================
-- FXMANIFEST - DAEXV DISPATCH V1.3
-- Sistema de Dispatch Manual 1899
-- Autor: DAEXV
-- Version: 1.3.0
-- =====================================================

fx_version 'adamant'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'DAEXV'
description 'Sistema de Dispatch Manual 1899 - Sin GPS, Radios ni Mapas'
version '1.3.0'

-- =====================================================
-- DEPENDENCIAS
-- =====================================================
dependencies {
    'vorp_core',
    'oxmysql'
}

-- =====================================================
-- SCRIPTS COMPARTIDOS
-- =====================================================
shared_script 'config.lua'

-- =====================================================
-- SCRIPTS DEL CLIENTE
-- =====================================================
client_scripts {
    'client/dispatch_client.lua',
    'client/ode_client.lua'
}

-- =====================================================
-- SCRIPTS DEL SERVIDOR
-- =====================================================
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/dispatch_server.lua',
    'server/ode_server.lua'
}

-- =====================================================
-- INTERFAZ NUI (UNIFICADA)
-- =====================================================
ui_page 'ui/dispatch.html'

files {
    'ui/dispatch.html',
    'ui/styles.css',
    'ui/script.js',
    'ui/ode_system.js',
    'ui/images/**'
}

-- =====================================================
-- INFORMACIÓN DEL RECURSO
-- =====================================================
-- Sistema de Dispatch Manual para RedM 1899
-- Gestión de unidades sin elementos modernos
-- =====================================================
