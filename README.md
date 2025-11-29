# 📋 SISTEMA DISPATCH + ODE V2.0 - DOCUMENTACIÓN COMPLETA

## 🎯 DESCRIPCIÓN GENERAL

Sistema unificado que integra el **Dispatch Manual 1899** con el **Departamento ODE (Officer Development & Evaluation)** en una sola interfaz, sin archivos separados.

---

## ✅ PROBLEMA RESUELTO

### ❌ **Error Original:**
```
SCRIPT ERROR: @daexv_dispatch/server/server.lua:308: attempt to compare number with table
```

### ✅ **Causa del Error:**
VORP Core tiene dos formas de obtener el personaje dependiendo de la versión:
1. **API Nueva**: `Character` es un objeto directo
2. **API Antigua**: `Character` es una función que requiere `Character(source)`

### ✅ **Solución Implementada:**
```lua
local Character = User.getUsedCharacter
-- Verificar si es una función (API antigua)
if type(Character) == "function" then
    Character = Character(source)
end
```

Esto garantiza compatibilidad con **cualquier versión de VORP Core**.

---

## 📁 ESTRUCTURA FINAL DEL PROYECTO

```
daexv_dispatch/
├── client/
│   ├── dispatch_client.lua      # Cliente del dispatch principal
│   └── ode_client.lua            # Cliente del sistema ODE
├── server/
│   ├── dispatch_server.lua      # Servidor del dispatch principal
│   └── ode_server.lua            # Servidor del sistema ODE
├── ui/
│   ├── dispatch.html             # INTERFAZ UNIFICADA (único archivo HTML)
│   ├── styles.css                # Estilos integrados
│   ├── script.js                 # JavaScript integrado
│   └── images/                   # Recursos gráficos
├── sql/
│   ├── dispatch.sql              # Tablas del dispatch
│   ├── ode_complete.sql          # Tablas ODE completas ⭐ NUEVO
│   ├── ode_tables.sql            # (Obsoleto - mantener por compatibilidad)
│   └── update_towns.sql          # Actualización de pueblos
├── config.lua                    # Configuración unificada
├── fxmanifest.lua                # Manifest actualizado v2.0
└── README.md                     # Esta documentación
```

### ⚠️ **Archivos ELIMINADOS** (ya no existen):
- ❌ `html/ode.html` (standalone)
- ❌ `html/script_ode.js` (standalone)
- ❌ `html/styles_ode.css` (standalone)
- ❌ Documentación antigua redundante (6 archivos .md)

---

## 🗄️ BASE DE DATOS

### **Archivo Principal:** `sql/ode_complete.sql`

Este archivo contiene **TODAS** las tablas necesarias:

#### 📊 **Tablas Principales:**

1. **`dispatch_units`** - Unidades activas en servicio
2. **`dispatch_ode_fichas`** - Fichas personales de cada miembro
3. **`dispatch_ode_autorizaciones`** - Permisos Marshal → FTO
4. **`dispatch_ode_evaluaciones`** - Evaluaciones del curriculum (15 puntos)
5. **`dispatch_ode_to_notes`** - Notas de instructores (TO Notes) ⭐ NUEVA
6. **`dispatch_ode_historial`** - Historial de cambios y auditoría

#### 🔗 **Foreign Keys:**
- `autorizaciones.fto_charidentifier` → `fichas.charidentifier`
- `autorizaciones.member_charidentifier` → `fichas.charidentifier`
- `evaluaciones.member_charidentifier` → `fichas.charidentifier`
- `to_notes.member_charidentifier` → `fichas.charidentifier`

#### 📈 **Vistas:**
- `view_dispatch_ode_fichas_completas` - Estadísticas por miembro
- `view_ode_autorizaciones_activas` - Autorizaciones vigentes

---

## 👥 SISTEMA DE PERMISOS

### 🎖️ **1. MARSHAL** (Máximo nivel)
**Identificación:** `Config.DeptoODE.marshals` (por charidentifier)

**Puede:**
- ✅ Ver todas las fichas y evaluaciones
- ✅ Crear evaluaciones para cualquier miembro
- ✅ Editar cualquier evaluación (sin restricciones)
- ✅ Aprobar/rechazar evaluaciones
- ✅ **Otorgar permisos** a FTO para editar evaluaciones
- ✅ **Revocar permisos** de FTO
- ✅ Permitir **visualización** al usuario evaluado
- ✅ Agregar comentarios en fichas
- ✅ Ver historial completo

### 👮 **2. FTO (Field Training Officer)**
**Identificación:** `Config.DeptoODE.ftos` (por charidentifier)

**Puede:**
- ✅ Ver todas las fichas
- ✅ Crear evaluaciones para cualquier miembro
- ✅ Editar **solo si el Marshal le otorgó permiso** para ese miembro específico
- ✅ Otorgar **visualización** al usuario evaluado
- ✅ Agregar comentarios en fichas
- ❌ NO puede aprobar evaluaciones (solo Marshal)

### 📚 **3. TO (Training Officer / Instructor)**
**Identificación:** `Config.DeptoODE.instructores` (por charidentifier)

**Puede:**
- ✅ Ver fichas de miembros
- ✅ Agregar **Notas de Instructor (TO Notes)** en fichas
- ❌ NO puede crear evaluaciones oficiales
- ❌ NO puede editar evaluaciones
- ❌ NO puede aprobar/rechazar

### 👤 **4. Usuario Evaluado**
**Sin rol especial**

**Puede:**
- ✅ Ver su propia ficha **solo si un Marshal o FTO le dio permiso** (`visualizacion_permitida = 1`)
- ❌ NO puede ver fichas de otros
- ❌ NO puede editar nada
- ❌ Solo lectura temporal

---

## 📚 CURRICULUM DE EVALUACIÓN (15 Puntos)

Cada evaluación contiene **15 temas** del temario oficial:

1. **Jerarquía** - Estructura del Departamento del Sheriff
2. **Departamentos** - Departamentos y sus funciones
3. **Derechos y Deberes** - Derechos y deberes de los ciudadanos
4. **Aplicación de la Fuerza** - Protocolo de uso de fuerza
5. **Uso del Arma Letal** - Cuándo usar arma letal
6. **Acudir a un Aviso** - Procedimiento al responder avisos
7. **Situación de Disparos** - Protocolo ante tiroteos
8. **Inviolabilidad de la Propiedad** - Registro de propiedades
9. **Detención de Sospechosos** - Procedimiento de arresto
10. **Procesamiento** - Procesamiento de detenidos
11. **Robos en Establecimientos** - Protocolo ante robos
12. **Situaciones de Rehenes** - Protocolo de negociación
13. **Atenuantes** - Circunstancias atenuantes
14. **Agravantes** - Circunstancias agravantes
15. **Límite de Multas** - Topes de sanciones económicas

### **Estados de Evaluación:**
- `borrador` - En creación
- `en_revision` - Completada, esperando aprobación del Marshal
- `aprobada` - Aprobada por Marshal
- `rechazada` - Rechazada por Marshal
- `cerrada` - Finalizada y archivada

---

## 🔄 FLUJO DE TRABAJO

### **Escenario 1: Marshal Evalúa Directamente**
1. Marshal abre dispatch → Tab "Depto. ODE"
2. Busca miembro → Abre ficha
3. Click en "Evaluar Miembro"
4. Completa curriculum (15 puntos + observaciones)
5. Guarda como "borrador" o "en_revision"
6. Puede aprobar directamente
7. **Opcional:** Otorga visualización al usuario

### **Escenario 2: FTO Evalúa con Autorización**
1. Marshal otorga permiso:
   - Panel de Autorizaciones → "Otorgar Permiso FTO"
   - Selecciona FTO y miembro
2. FTO abre dispatch → Tab "Depto. ODE"
3. Busca miembro → Abre ficha
4. Click en "Evaluar Miembro"
5. Completa evaluación
6. Guarda como "en_revision"
7. **Marshal aprueba** la evaluación

### **Escenario 3: Instructor (TO) Agrega Notas**
1. TO abre dispatch → Tab "Depto. ODE"
2. Busca miembro → Abre ficha
3. Tab "Historial de Evaluaciones" → "Agregar Nota TO"
4. Selecciona categoría del curriculum
5. Escribe nota de entrenamiento
6. Marca como "importante" si es necesario
7. Guarda

### **Escenario 4: Usuario Ve su Evaluación**
1. Marshal/FTO otorga visualización temporal:
   - Abre evaluación → "Permitir Visualización"
2. Usuario abre dispatch → Tab "Depto. ODE"
3. Ve su propia ficha (solo lectura)
4. Puede ver evaluaciones aprobadas
5. Permiso puede ser revocado en cualquier momento

---

## 🚀 INSTALACIÓN

### **1. Importar Base de Datos**
```sql
-- Ejecutar en orden:
source sql/dispatch.sql
source sql/ode_complete.sql
```

### **2. Configurar Config.lua**
```lua
Config.DeptoODE = {
    -- Identificadores de roles (charidentifier de VORP)
    marshals = {
        "ABC123",  -- Ejemplo: charidentifier del Marshal
    },
    ftos = {
        "DEF456",  -- Ejemplo: charidentifier del FTO
        "GHI789",
    },
    instructores = {
        "JKL012",  -- Ejemplo: charidentifier del TO
    },
    
    -- Curriculum completo (15 puntos)
    curricula = {
        {id = "jerarquia", label = "Jerarquía del Departamento"},
        -- ... (resto de puntos)
    }
}
```

### **3. Reiniciar Recurso**
```
ensure daexv_dispatch
```

---

## 🧪 TESTING

### **Modo Testing (AllowAllPlayers = true)**
```lua
Config.AllowAllPlayers = true
```

Esto permite:
- ✅ Cualquier jugador accede al dispatch
- ✅ Todos son considerados "admin" temporalmente
- ✅ Ideal para testear con 1 solo jugador

### **Producción**
```lua
Config.AllowAllPlayers = false
Config.AllowedJobs = {"sheriff", "marshal", "deputy"}
```

---

## 📝 NOTAS TÉCNICAS

### **Compatibilidad VORP:**
El sistema detecta automáticamente la versión de VORP Core y se adapta:
```lua
if type(Character) == "function" then
    Character = Character(source)
end
```

### **Optimizaciones SQL:**
- Índices compuestos para consultas frecuentes
- Foreign keys para integridad referencial
- Vistas materializadas para estadísticas
- ON DELETE CASCADE para limpieza automática

### **Seguridad:**
- Validación de permisos en **servidor** (nunca confiar en cliente)
- Logs de auditoría en tabla `historial`
- Autorizaciones temporales revocables

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "GetUser no funciona"**
✅ **Solucionado** - Implementado fallback automático para API antigua de VORP

### **No veo el dispatch**
- Verifica que `Config.AllowAllPlayers = true` (testing)
- O que tu `job` está en `Config.AllowedJobs`

### **No puedo editar evaluaciones como FTO**
- Necesitas autorización del Marshal
- Marshal debe ir a "Panel de Autorizaciones" → "Otorgar Permiso"

### **Usuario no ve su evaluación**
- Marshal/FTO debe otorgar visualización explícitamente
- En la evaluación → "Permitir Visualización"

---

## 📞 COMANDOS

### **Abrir Dispatch:**
```
F6 (configurable en dispatch_client.lua)
```

### **Salir de Servicio:**
Dentro del tab "Depto. ODE" → Botón "Salir de Servicio"

---

## 🎨 PERSONALIZACIÓN

### **Cambiar Colores:**
Editar `ui/styles.css` - Variables CSS al inicio del archivo

### **Modificar Curriculum:**
Editar `config.lua` → `Config.DeptoODE.curricula`

### **Agregar Roles:**
Editar `config.lua` → Agregar charidentifiers en `marshals`, `ftos` o `instructores`

---

## 📜 LICENCIA

Este sistema es propiedad de **DAEXV** y está diseñado para servidores RedM con VORP Core.

---

**Version:** 2.0.0  
**Última actualización:** 21 de Noviembre de 2025  
**Autor:** DAEXV (con asistencia de GitHub Copilot)
