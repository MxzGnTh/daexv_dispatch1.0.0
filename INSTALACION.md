# 🚀 GUÍA DE INSTALACIÓN RÁPIDA

## Requisitos Previos

- ✅ RedM Server actualizado
- ✅ VORP Core instalado
- ✅ oxmysql instalado y configurado
- ✅ MySQL/MariaDB funcionando

---

## Pasos de Instalación

### 1️⃣ Copiar el Recurso

Copia la carpeta `daexv_dispatch` a tu directorio de recursos:
```
resources/[VORP]/daexv_dispatch/
```

### 2️⃣ Importar Base de Datos

Ejecuta el archivo SQL en tu base de datos MySQL:

**Opción A - Tabla Nueva:**
```sql
-- Ejecutar: sql/dispatch.sql
```

**Opción B - Si ya existe la tabla:**
```sql
-- Ejecutar: sql/update_towns.sql
```

### 3️⃣ Configurar el Recurso

Abre `config.lua` y ajusta según tus necesidades:

```lua
-- IMPORTANTE: Desactiva el modo testing en producción
Config.AllowAllPlayers = false

-- Define los trabajos permitidos
Config.AllowedJobs = {
    'sheriff',
    'deputy',
    'marshal'
}

-- Define los administradores (Sheriff y Marshal)
Config.AdminRanks = {
    'sheriff',
    'marshal'
}
```

### 4️⃣ Añadir al server.cfg

Agrega al final de tu `server.cfg`:
```cfg
ensure daexv_dispatch
```

### 5️⃣ Reiniciar el Servidor

```bash
# Consola del servidor
restart daexv_dispatch
```

O reinicia completamente el servidor.

---

## ✅ Verificación de Instalación

### Pruebas Básicas:

1. **Entrar al juego con un personaje que tenga job sheriff/deputy/marshal**

2. **Abrir el dispatch:**
   - Presionar tecla **F6**
   - O escribir comando `/dispatch`

3. **Verificar que aparece el panel**
   - Debe verse la interfaz estilo pergamino 1899
   - Selectores de distrito, pueblo y estado

4. **Registrarse:**
   - Seleccionar distrito
   - Seleccionar pueblo (opcional)
   - Seleccionar estado
   - Click en "Entrar en Servicio"

5. **Verificar persistencia:**
   - Cerrar dispatch (ESC o botón X)
   - Abrir de nuevo con F6
   - Los datos deben mantenerse

---

## 🔧 Configuración de Permisos

### Para Testing:
```lua
Config.AllowAllPlayers = true  -- Permite a todos probar
```

### Para Producción:
```lua
Config.AllowAllPlayers = false  -- Solo trabajos permitidos
Config.AllowedJobs = {'sheriff', 'deputy', 'marshal'}
Config.AdminRanks = {'sheriff', 'marshal'}
```

---

## 🌟 Características del Sistema

✅ **Panel Manual 1899** - Estética de época  
✅ **Registro por Distritos** - New Hanover, West Elizabeth, etc.  
✅ **Sistema de Mandos** - Asignación de pueblos específicos  
✅ **Estados Manuales** - Disponible, Ocupado, Patrullando, etc.  
✅ **Permisos por Rango** - Sheriff/Marshal pueden gestionar todos  
✅ **Persistencia MySQL** - Datos guardados en base de datos  
✅ **Alertas Personalizadas** - Diseño estilo western  

---

## 📋 Pueblos Disponibles

### Mandos Especiales:
Los oficiales en distrito "**Mando**" pueden elegir **CUALQUIER pueblo**:
- Valentine, Blackwater, Saint Denis, Rhodes, etc.

### Distritos Normales:
Solo ven pueblos de su región específica:
- **New Hanover:** Valentine, Emerald Ranch, Annesburg, Van Horn
- **West Elizabeth:** Blackwater, Strawberry, Manzanita Post
- **Lemoyne:** Saint Denis, Rhodes, Lagras
- **Ambarino:** Wapiti, Colter
- **Nuevo Paraíso:** Tumbleweed, Armadillo, Chuparosa

---

## 🆘 Solución de Problemas

### El panel no abre:
- Verificar que el recurso está iniciado: `ensure daexv_dispatch`
- Revisar consola del servidor para errores
- Confirmar que VORP Core está cargado

### No tengo permisos:
- Verificar que tu personaje tiene job: sheriff/deputy/marshal
- Si Config.AllowAllPlayers = false, solo trabajos permitidos

### La base de datos no funciona:
- Verificar que oxmysql está instalado
- Confirmar que las tablas se crearon correctamente
- Revisar credenciales MySQL en server.cfg

### Los pueblos no aparecen:
- Verificar que ejecutaste `sql/update_towns.sql` si actualizaste
- Tabla debe tener columna `assigned_town`

---

## 📚 Documentación Adicional

- **README.md** - Documentación completa del sistema
- **MANDOS.md** - Guía detallada del sistema de mandos
- **ACTUALIZACION.md** - Notas de actualización

---

## 🎮 Uso Básico

### Para Oficiales:
1. F6 para abrir
2. Seleccionar distrito y estado
3. "Entrar en Servicio"
4. Actualizar estado cuando sea necesario

### Para Admins (Sheriff/Marshal):
1. F6 para abrir
2. Ver tabla con todas las unidades
3. Usar selectores para modificar cualquier oficial
4. Asignar distritos y pueblos según necesidad

---

**¡Instalación completada!** 🎉

Si tienes problemas, revisa la consola del servidor para mensajes de error.
