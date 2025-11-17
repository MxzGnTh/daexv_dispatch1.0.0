# ACTUALIZACIÓN - Sistema de Pueblos Asignados

## Cambios Implementados

### ✅ Nueva Funcionalidad: Asignación de Pueblos (Mandos)

Ahora los oficiales pueden asignarse como **Mando** de un pueblo específico dentro de su distrito.

### Características:

1. **Panel de Control Personal**
   - Nuevo selector "Mi Pueblo (Mando)" para elegir pueblo
   - Botón "Cambiar Pueblo" para actualizar asignación
   - Lista dinámica de pueblos según distrito seleccionado

2. **Controles de Administrador**
   - Tercera columna "Pueblo" en tabla de unidades
   - Selector de pueblo para cada oficial
   - Badge dorado con estrella ★ para mandos

3. **Persistencia de Datos**
   - Campo `assigned_town` en base de datos
   - Los pueblos ahora se guardan correctamente
   - Se mantienen al cerrar/abrir el dispatch

---

## Actualización de Base de Datos

### Si la tabla `dispatch_units` YA EXISTE:

Ejecuta este comando SQL para agregar la columna de pueblos:

```sql
ALTER TABLE dispatch_units 
ADD COLUMN assigned_town VARCHAR(40) NULL DEFAULT NULL COMMENT 'Pueblo asignado como mando' AFTER district,
ADD INDEX idx_town (assigned_town);
```

### Si vas a crear la tabla desde cero:

Usa el archivo `sql/dispatch.sql` que ya incluye el campo `assigned_town`.

---

## Pueblos Disponibles por Distrito

### ⭐ IMPORTANTE: Sección "MANDO"

Los oficiales asignados a la sección **"Mando"** pueden elegir **CUALQUIER pueblo de CUALQUIER distrito**. Esto permite tener 3-5 mandos especiales que supervisan pueblos específicos sin estar limitados a una región.

**Ejemplo de organización:**
- Mando 1 → Valentine (New Hanover)
- Mando 2 → Blackwater (West Elizabeth)  
- Mando 3 → Saint Denis (Lemoyne)
- Mando 4 → Tumbleweed (Nuevo Paraíso)
- Mando 5 → Wapiti (Ambarino)

### Pueblos por Región (para distritos normales):

### New Hanover
- Valentine
- Emerald Ranch
- Annesburg
- Van Horn

### West Elizabeth
- Blackwater
- Strawberry
- Manzanita Post

### Ambarino
- Wapiti
- Colter

### Lemoyne
- Saint Denis
- Rhodes
- Lagras

### Nuevo Paraíso
- Tumbleweed
- Armadillo
- Chuparosa

---

## Cómo Usar

### Para Oficiales en Distrito Normal:

1. Abre el dispatch con F6 o `/dispatch`
2. Selecciona tu distrito en "Mi Distrito"
3. Selecciona tu pueblo en "Mi Pueblo (Mando)" - Solo verás pueblos de TU distrito
4. Click en "Entrar en Servicio" (primera vez)
5. O "Cambiar Pueblo" para actualizar

### Para Oficiales en Sección "MANDO":

1. Abre el dispatch con F6 o `/dispatch`
2. Selecciona **"Mando"** en "Mi Distrito"
3. En "Mi Pueblo (Mando)" verás **TODOS los pueblos de TODOS los distritos**
4. Los pueblos están organizados por región (optgroups)
5. Puedes elegir cualquier pueblo: Valentine, Blackwater, Saint Denis, etc.
6. **Permite tener 3-5 mandos** que pueden supervisar diferentes pueblos

### Para Admins (Marshal/Sheriff):

1. En la tabla de unidades, cada oficial tiene 3 selectores
2. El tercer selector es para asignar pueblo
3. Si el oficial está en distrito "Mando", verá todos los pueblos
4. Si está en otro distrito, solo verá pueblos de ese distrito
5. Selecciona "Sin asignar" para quitar la asignación
6. Los cambios se guardan automáticamente

---

## Archivos Modificados

- ✅ `config.lua` - Agregada tabla `Config.Towns`
- ✅ `server/server.lua` - Eventos para manejar pueblos
- ✅ `client/client.lua` - Callback `updateOwnTown`
- ✅ `html/index.html` - Selector y botón de pueblo
- ✅ `html/script.js` - Lógica de pueblos dinámicos
- ✅ `html/styles.css` - Badge dorado y estilos responsivos
- ✅ `sql/dispatch.sql` - Campo `assigned_town`

---

## Reinicio del Recurso

Después de actualizar la base de datos, ejecuta en la consola del servidor:

```
restart daexv_dispatch
```

O si es la primera vez:

```
ensure daexv_dispatch
```

---

## Verificación

Para verificar que todo funciona:

1. ✅ Al abrir dispatch, debe aparecer selector "Mi Pueblo"
2. ✅ Al seleccionar distrito, pueblos se actualizan
3. ✅ Al registrarse, el pueblo se guarda
4. ✅ Al cerrar y abrir dispatch, el pueblo sigue ahí
5. ✅ Admins ven columna "Pueblo" en tabla
6. ✅ Badge dorado ★ aparece en unidades con pueblo

---

**Fecha de actualización:** 16 de noviembre de 2025
**Versión:** 1.1.0 - Asignación de Pueblos
