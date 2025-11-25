# 📜 SISTEMA DE DISPATCH MANUAL 1899

**Sistema de Dispatch contextualizado al año 1899 para RedM con VORP Framework**

Sin GPS, Sin Radios, Sin Mapas, Sin Iconos. Todo es manual y administrativo.

---

## 📋 DESCRIPCIÓN

Sistema completo de Dispatch para el Departamento del Sheriff ambientado en 1899. Permite a los oficiales registrarse manualmente en distritos, actualizar su estado y gestionar unidades de forma administrativa, tal como se hacía en la época del Viejo Oeste.

**NUEVO:** Incluye Sistema ODE (Officer Development & Evaluation) para evaluar el desempeño de oficiales.

### ✨ Características Principales

#### Sistema de Dispatch
- ✅ Panel de Dispatch con tecla **F6**
- ✅ Registro manual de oficiales por distrito
- ✅ **Sistema de Mandos** - Oficiales pueden supervisar pueblos específicos
- ✅ **Pueblos asignables** - Mandos pueden elegir cualquier pueblo de cualquier región
- ✅ Estados manuales (Disponible, Ocupado, Patrullando, etc.)
- ✅ Interfaz estilo pergamino/western con estética de 1899
- ✅ Sistema de permisos por rango
- ✅ Administración para rangos superiores (Sheriff, Marshal)
- ✅ Base de datos MySQL con historial de cambios
- ✅ Sin elementos modernos ni tecnología fuera de época
- ✅ 100% Manual - Nada automático

#### Sistema ODE (Officer Development & Evaluation)
- ✅ **Evaluaciones de Oficiales** - Sistema completo para evaluar desempeño
- ✅ **Checks por Botones** - Positivo/Negativo/Observado con guardado automático
- ✅ **6 Categorías de Evaluación** - Conducta, Procedimientos, Comunicación, Patrullaje, Equipo, Liderazgo
- ✅ **Registro Individual** - Cada evaluación se guarda por separado en base de datos
- ✅ **Historial Completo** - Todas las evaluaciones son permanentes y auditables
- ✅ **Notas Generales** - Espacio para observaciones detalladas
- ✅ **Solo para Admins** - Acceso restringido a rangos superiores

---

## 📁 ESTRUCTURA DEL RECURSO

```
dispatch/
│── fxmanifest.lua
│── config.lua
│── client/
│     └── client.lua
│── server/
│     └── server.lua
│── html/
│     ├── index.html
│     ├── styles.css
│     └── script.js
└── sql/
      ├── dispatch.sql
      └── ode_system.sql
```

---

## 🔧 INSTALACIÓN

### 1. Requisitos Previos

- **RedM Server** actualizado
- **VORP Core** instalado y configurado
- **oxmysql** instalado y configurado
- **MySQL** o **MariaDB** funcionando

### 2. Instalación del Recurso

1. **Descargar o copiar** la carpeta `dispatch` en tu directorio de recursos:
   ```
   resources/[VORP]/dispatch/
   ```

2. **Importar la base de datos**:
   - Abre tu gestor de MySQL (phpMyAdmin, HeidiSQL, etc.)
   - Importa el archivo `sql/dispatch.sql`
   - **NUEVO:** Importa también `sql/ode_system.sql` para el sistema de evaluaciones
   - Esto creará las tablas:
     - **Dispatch:**
       - `dispatch_units` (Registro de unidades)
       - `dispatch_logs` (Historial de cambios)
     - **Sistema ODE:**
       - `ode_evaluations` (Evaluaciones de oficiales)
       - `ode_evaluation_checks` (Checks individuales)
       - `ode_logs` (Auditoría de evaluaciones)

3. **Configurar el recurso**:
   - Abre `config.lua`
   - Ajusta los trabajos permitidos si es necesario:
     ```lua
     Config.AllowedJobs = {
         'sheriff',
         'deputy',
         'marshal'
     }
     ```
   - **Para Testing:** Activa acceso universal (solo para pruebas):
     ```lua
     Config.AllowAllPlayers = true  -- Cambiar a false en producción
     ```
   - Puedes modificar distritos y estados según tu servidor

4. **Añadir al server.cfg**:
   ```cfg
   ensure dispatch
   ```

5. **Reiniciar el servidor** o ejecutar:
   ```
   refresh
   start dispatch
   ```

---

## 🎮 USO DEL SISTEMA

### Para Oficiales Regulares

1. **Abrir el Dispatch**:
   - Presiona **F6** en cualquier momento

2. **Registrarse en Servicio**:
   - Selecciona tu distrito asignado
   - Selecciona tu estado inicial (ej: "Disponible")
   - Haz clic en "Entrar en Servicio"

3. **Actualizar tu Estado**:
   - Selecciona un nuevo estado en el menú desplegable
   - Haz clic en "Actualizar Estado"

4. **Cambiar de Distrito**:
   - Selecciona un nuevo distrito
   - Haz clic en "Cambiar Distrito"

5. **Ver Otras Unidades**:
   - El panel muestra todas las unidades organizadas por distrito
   - Puedes ver nombres, rangos y estados

### Para Rangos Superiores (Sheriff/Marshal)

Los rangos administrativos tienen controles adicionales:

- **Modificar Estados de Otros Oficiales**:
  - En la tabla de cada unidad, usa los menús desplegables
  - Puedes cambiar el estado de cualquier oficial
  - Puedes reasignar oficiales a otros distritos

- **Limpiar Unidades Inactivas**:
  - Usa el comando `/dispatch:cleanup` en el chat
  - Elimina unidades marcadas como "Fuera de servicio" de hace más de 1 hora

---

## 🗺️ DISTRITOS DISPONIBLES

Los distritos están basados en el mapa de Red Dead Redemption 2:

1. **New Hanover** - Valentine, Emerald Ranch
2. **West Elizabeth** - Blackwater, Strawberry
3. **Ambarino** - Región montañosa del norte
4. **Lemoyne** - Saint Denis, Rhodes
5. **Nuevo Paraíso** - (opcional) Región desértica

Puedes modificar estos distritos en `config.lua`.

---

## 🌟 SISTEMA DE MANDOS Y PUEBLOS

### ¿Qué es un Mando?

Un **Mando** es un oficial especial que supervisa un pueblo específico. A diferencia de los distritos normales, los Mandos tienen **flexibilidad total** para elegir cualquier pueblo de cualquier región.

### Características de los Mandos:

- ✅ **Acceso a todos los pueblos** - No limitados por distrito
- ✅ **Organización por pueblo** - Supervisión específica
- ✅ **3-5 Mandos recomendados** - Para cobertura óptima
- ✅ **Badge dorado ★** - Identificación visual

### Pueblos Disponibles:

#### New Hanover
- Valentine, Emerald Ranch, Annesburg, Van Horn

#### West Elizabeth  
- Blackwater, Strawberry, Manzanita Post

#### Ambarino
- Wapiti, Colter

#### Lemoyne
- Saint Denis, Rhodes, Lagras

#### Nuevo Paraíso
- Tumbleweed, Armadillo, Chuparosa

### Cómo usar Mandos:

**Oficiales en distrito "Mando":**
1. Seleccionar distrito "Mando"
2. Ver TODOS los pueblos disponibles (organizados por región)
3. Elegir cualquier pueblo (ej: Valentine, Blackwater, Saint Denis)
4. Badge dorado ★ indica asignación

**Oficiales en distrito normal:**
- Solo ven pueblos de su distrito específico
- Limitados a su región geográfica

📖 **Documentación completa:** [MANDOS.md](MANDOS.md)

---

## 📌 ESTADOS MANUALES

Los oficiales pueden seleccionar entre:

- **Disponible** - Listo para asignaciones
- **Ocupado** - Atendiendo un caso
- **Fuera de servicio** - No disponible
- **Patrullando** - Recorriendo el distrito
- **En traslado** - Movimiento entre ubicaciones

Personaliza estos estados en `config.lua`.

---

## ⚙️ CONFIGURACIÓN

### Archivo `config.lua`

```lua
-- Trabajos permitidos
Config.AllowedJobs = {
    'sheriff',
    'deputy',
    'marshal'
}

-- Distritos del mapa
Config.Districts = {
    'New Hanover',
    'West Elizabeth',
    'Ambarino',
    'Lemoyne',
    'Nuevo Paraíso'
}

-- Estados permitidos
Config.Status = {
    'Disponible',
    'Ocupado',
    'Fuera de servicio',
    'Patrullando',
    'En traslado'
}

-- Rangos administrativos
Config.AdminRanks = {
    'sheriff',
    'marshal'
}
```

---

## 🗄️ BASE DE DATOS

### Tabla: `dispatch_units`

Almacena información de las unidades activas:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único auto-incremental |
| identifier | VARCHAR(80) | Identificador de Steam/Licencia |
| charidentifier | INT | ID del personaje en VORP |
| firstname | VARCHAR(50) | Nombre del oficial |
| lastname | VARCHAR(50) | Apellido del oficial |
| jobname | VARCHAR(40) | Trabajo actual (sheriff, deputy, etc.) |
| district | VARCHAR(40) | Distrito asignado |
| status | VARCHAR(40) | Estado actual |
| last_update | TIMESTAMP | Última actualización automática |

### Tabla: `dispatch_logs`

Historial de cambios (opcional para auditoría):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del log |
| charidentifier | INT | ID del personaje afectado |
| action | VARCHAR(100) | Acción realizada |
| old_value | VARCHAR(100) | Valor anterior |
| new_value | VARCHAR(100) | Valor nuevo |
| changed_by | INT | Quién hizo el cambio |
| timestamp | TIMESTAMP | Fecha y hora |

---

## 🎨 INTERFAZ VISUAL

La interfaz está diseñada con:

- **Estilo pergamino/western** del año 1899
- **Colores sepia y beige** para dar aspecto antiguo
- **Tipografías serif** (Cinzel, Playfair Display)
- **Sin elementos modernos** (sin GPS, mapas, iconos digitales)
- **Tablas administrativas** simples y organizadas
- **Diseño responsivo** adaptable a diferentes resoluciones

---

## 🛠️ COMANDOS

### Para Jugadores

- **F6** - Abrir/Cerrar el panel de Dispatch

### Para Administradores

- `/dispatch:cleanup` - Limpiar unidades inactivas (requiere rango admin)

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### El panel no se abre con F6

1. Verifica que tu personaje tenga uno de los trabajos permitidos
2. Revisa la consola del servidor para errores
3. Asegúrate de que VORP Core esté cargado correctamente

### No aparecen las unidades

1. Verifica que la base de datos esté importada correctamente
2. Comprueba que oxmysql esté funcionando
3. Revisa los logs del servidor para errores de MySQL

### Los cambios no se guardan

1. Verifica los permisos de la base de datos
2. Asegúrate de que las tablas existan
3. Comprueba que no haya errores en la consola del servidor

### Problemas de permisos

1. Verifica que los trabajos estén configurados en `config.lua`
2. Asegúrate de que los rangos administrativos estén correctos
3. Comprueba que el personaje tenga el trabajo asignado en VORP

---

## 📝 NOTAS IMPORTANTES

- ⚠️ **Sin automático**: Todo debe ser actualizado manualmente por los jugadores
- ⚠️ **Sin GPS**: No hay posiciones automáticas ni mapas
- ⚠️ **Sin radios**: No hay sistema de comunicación integrado
- ⚠️ **Contextualizado**: Diseñado para roleplay inmersivo del año 1899
- ⚠️ **Base de datos**: Se recomienda hacer backups regulares

---

## 📋 SISTEMA ODE (Officer Development & Evaluation)

### Acceso al Sistema ODE

El sistema ODE está integrado en el Dispatch y solo es accesible para rangos administrativos.

1. **Abrir el Dispatch** con F6
2. Si tienes permisos de admin, verás el botón **"📋 Sistema ODE - Evaluaciones"**
3. Haz clic para acceder al panel de evaluaciones

### Características del Sistema ODE

- **Evaluaciones Estructuradas**: 6 categorías con 5 criterios cada una
- **Checks por Botones**: Marca cada criterio como Positivo ✓, Negativo ✗, u Observado ◉
- **Guardado Automático**: Cada clic se guarda instantáneamente en la base de datos
- **Registro Individual**: Cada evaluación se almacena por separado
- **Notas Generales**: Espacio para observaciones detalladas
- **Historial Permanente**: Todas las evaluaciones quedan registradas
- **Auditoría Completa**: Sistema de logs para seguimiento de cambios

### Categorías de Evaluación

1. **Conducta Profesional** (5 criterios)
2. **Procedimientos Policiales** (5 criterios)
3. **Comunicación** (5 criterios)
4. **Patrullaje** (5 criterios)
5. **Trabajo en Equipo** (5 criterios)
6. **Iniciativa y Liderazgo** (5 criterios)

### Guía Rápida de Uso

1. **Crear Evaluación**: 
   - Selecciona un oficial de la lista
   - O usa el formulario "Nueva Evaluación"
   
2. **Evaluar**:
   - Revisa cada categoría
   - Haz clic en Positivo/Negativo/Observado para cada criterio
   - Los cambios se guardan automáticamente
   
3. **Agregar Notas**:
   - Escribe observaciones en "Notas Generales"
   - Haz clic en "Guardar Notas"
   
4. **Completar**:
   - Cuando termines, haz clic en "✓ Completar Evaluación"
   - La evaluación quedará registrada permanentemente

📖 **Documentación Completa del Sistema ODE:** [ODE_SYSTEM.md](ODE_SYSTEM.md)

---

## 🤝 SOPORTE Y CONTRIBUCIONES

Si encuentras errores o tienes sugerencias:

1. Revisa los logs del servidor
2. Verifica la configuración
3. Consulta este README
4. Consulta [ODE_SYSTEM.md](ODE_SYSTEM.md) para el sistema de evaluaciones

---

## 📜 LICENCIA

Este recurso es de código abierto y puede ser modificado para tu servidor.

**Desarrollado por DAEXV**

**Versión**: 1.0.0  
**Fecha**: 2025  
**Framework**: VORP Core  
**Juego**: RedM (Red Dead Redemption 2)

---

## 🎯 FUNCIONALIDADES FUTURAS (Opcional)

Posibles mejoras que podrías añadir:

- Sistema de códigos de llamadas (10-4, 10-20, etc.)
- Registro de incidentes manuales
- Reportes de actividad diaria
- Sistema de fichas de criminales
- Integración con sistema judicial
- Libro de registro de arrestos

---

**¡Disfruta del Dispatch Manual del año 1899! 🤠**
# daexv_dispatch1.0.0
