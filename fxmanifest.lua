fx_version 'adamant'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'DAEXV'
description 'Sistema de Dispatch Manual 1899 - Sin GPS, Radios ni Mapas. Sistema completo de gestion de unidades con asignacion de pueblos para mandos territoriales.'
version '1.1.0'

-- Dependencias
dependencies {
    'vorp_core',
    'oxmysql'
}

-- Scripts compartidos
shared_script 'config.lua'

-- Scripts del cliente
client_scripts {
    'client/client.lua'
}

-- Scripts del servidor
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/server.lua'
}

-- Archivos de la interfaz
ui_page 'html/index.html'

files {
    'html/index.html',
    'html/styles.css',
    'html/script.js'
}
