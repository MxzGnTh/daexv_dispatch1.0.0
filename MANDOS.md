# 🌟 SISTEMA DE MANDOS - Supervisores de Pueblos

## ¿Qué es un Mando?

Un **Mando** es un oficial especial que supervisa un pueblo específico sin estar limitado a un distrito geográfico. Es un rango de autoridad que permite gestionar poblaciones concretas.

---

## Características de los Mandos

### 🎯 Flexibilidad Total
- Pueden elegir **CUALQUIER pueblo** de **CUALQUIER región**
- No están limitados por fronteras de distritos
- Perfectos para roles de supervisión especializados

### 📍 Organización por Pueblos
Los Mandos aparecen en su propia sección del dispatch y pueden asignarse a:
- Valentine (New Hanover)
- Blackwater (West Elizabeth)
- Saint Denis (Lemoyne)
- Tumbleweed (Nuevo Paraíso)
- Wapiti (Ambarino)
- Y cualquier otro pueblo disponible

### ⚖️ Límite Recomendado
Se recomienda tener entre **3 a 5 Mandos activos** para mantener:
- Control sobre pueblos clave
- Distribución equilibrada de autoridad
- Claridad en la cadena de mando

---

## ¿Cómo Funciona?

### Para convertirse en Mando:

1. **Seleccionar Distrito "Mando"**
   ```
   Panel de Control Personal > Mi Distrito > Mando
   ```

2. **Elegir Pueblo**
   - Al seleccionar "Mando", el selector de pueblos mostrará TODOS los pueblos
   - Los pueblos están organizados por región (optgroups) para fácil navegación
   - Ejemplo visual:
   ```
   Sin asignar
   ─────────────
   New Hanover
     ├─ Valentine
     ├─ Emerald Ranch
     ├─ Annesburg
     └─ Van Horn
   West Elizabeth
     ├─ Blackwater
     ├─ Strawberry
     └─ Manzanita Post
   Lemoyne
     ├─ Saint Denis
     ├─ Rhodes
     └─ Lagras
   ...
   ```

3. **Registrarse o Actualizar**
   - Click en "Entrar en Servicio" (primera vez)
   - O "Cambiar Pueblo" para cambiar asignación

---

## Ejemplos de Uso

### Escenario 1: Supervisor de Pueblo Grande
```
Nombre: John Marston
Rango: Sheriff
Distrito: Mando
Pueblo: Valentine
Estado: Disponible

→ Supervisa todo Valentine sin estar atado a New Hanover
```

### Escenario 2: Equipo de Mandos Distribuidos
```
Mando 1: Valentine    → Controla comercio y ley en el norte
Mando 2: Blackwater   → Supervisa puerto y actividad urbana
Mando 3: Saint Denis  → Gestión de ciudad metropolitana
Mando 4: Rhodes       → Vigilancia de zona agrícola
Mando 5: Tumbleweed   → Control de frontera del desierto
```

### Escenario 3: Rotación de Mandos
```
Semana 1: Mando asignado a Valentine
Semana 2: Cambio a Blackwater (usando "Cambiar Pueblo")
Semana 3: Cambio a Saint Denis
→ Permite flexibilidad operativa
```

---

## Diferencias: Mando vs Distrito Normal

| Característica | Distrito Normal | Mando |
|----------------|----------------|-------|
| **Pueblos disponibles** | Solo de su distrito | Todos los pueblos |
| **Organización** | Por región geográfica | Por pueblo específico |
| **Flexibilidad** | Limitada a zona | Total libertad |
| **Cantidad recomendada** | Sin límite | 3-5 mandos |
| **Uso ideal** | Patrullas regionales | Supervisión de pueblo |
| **Selector visual** | Lista simple | Optgroups por región |

---

## Administración de Mandos

### Para Admins (Marshal/Sheriff):

1. **Asignar a Mando:**
   - En la tabla de unidades, cambiar distrito del oficial a "Mando"
   - Selector de pueblo se expande automáticamente
   - Mostrar todos los pueblos disponibles

2. **Cambiar Pueblo de un Mando:**
   - El tercer selector (pueblo) muestra todos los pueblos organizados
   - Seleccionar nuevo pueblo
   - Cambio se guarda automáticamente

3. **Quitar Mando:**
   - Cambiar distrito a una región normal (New Hanover, West Elizabeth, etc.)
   - O cambiar pueblo a "Sin asignar"

---

## Identificación Visual

### Badge de Mando
Los Mandos con pueblo asignado muestran un **badge dorado con estrella**:

```
★ Valentine
★ Blackwater
★ Saint Denis
```

**Características del badge:**
- Color: Dorado (#8b6914)
- Icono: Estrella ★
- Tooltip: "Mando del pueblo"
- Visible solo para admins en la tabla

---

## Casos de Uso Roleplay

### 🤠 Western Tradicional
```
Sheriff del Condado → Distrito "Mando" → Pueblo: Valentine
- Autoridad máxima en el pueblo
- No se mueve a otras regiones
- Representa el "Sheriff del Pueblo"
```

### 🎖️ Marshal Federal
```
US Marshal → Distrito "Mando" → Rotación de pueblos
- Semana 1: Valentine (investigación)
- Semana 2: Blackwater (tribunal)
- Semana 3: Saint Denis (operativo)
```

### 👮 Supervisores Regionales
```
3 Mandos rotando 15 pueblos:
- Cada Mando supervisa 5 pueblos
- Rotación mensual
- Cobertura total del territorio
```

---

## Configuración Técnica

### Archivo: `config.lua`
```lua
Config.Towns = {
    ['New Hanover'] = {'Valentine', 'Emerald Ranch', 'Annesburg', 'Van Horn'},
    ['West Elizabeth'] = {'Blackwater', 'Strawberry', 'Manzanita Post'},
    ['Ambarino'] = {'Wapiti', 'Colter'},
    ['Lemoyne'] = {'Saint Denis', 'Rhodes', 'Lagras'},
    ['Nuevo Paraíso'] = {'Tumbleweed', 'Armadillo', 'Chuparosa'}
}
```

Para agregar más pueblos, simplemente edita esta tabla.

---

## Preguntas Frecuentes

**P: ¿Cuántos Mandos puede haber?**  
R: Recomendado 3-5, pero no hay límite técnico.

**P: ¿Un Mando puede cambiar de pueblo?**  
R: Sí, en cualquier momento usando "Cambiar Pueblo".

**P: ¿Los Mandos tienen más permisos?**  
R: No, es solo organizacional. Los permisos dependen del job (sheriff/deputy/marshal).

**P: ¿Puede haber 2 Mandos en el mismo pueblo?**  
R: Sí, el sistema lo permite. Gestión organizativa interna.

**P: ¿Un oficial normal puede cambiar a Mando?**  
R: Solo si un Admin (Marshal/Sheriff) lo cambia al distrito "Mando".

---

**Versión:** 1.1.0 - Sistema de Mandos con Pueblos  
**Fecha:** 16 de noviembre de 2025
