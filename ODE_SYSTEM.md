# 📋 SISTEMA ODE - Officer Development & Evaluation

**Sistema de Desarrollo y Evaluación de Oficiales para el Departamento del Sheriff 1899**

---

## 📖 DESCRIPCIÓN

El Sistema ODE (Officer Development & Evaluation) es una herramienta integrada en el Dispatch Manual 1899 que permite a los supervisores evaluar el desempeño de los oficiales de manera estructurada y sistemática.

### ✨ Características Principales

- ✅ **Evaluaciones Individuales** - Cada evaluación se guarda por separado en la base de datos
- ✅ **Sistema de Checks por Botones** - Los checks se marcan mediante botones (Positivo/Negativo/Observado)
- ✅ **Guardado Automático** - Cada click en un botón guarda inmediatamente en la base de datos
- ✅ **6 Categorías de Evaluación** - Cobertura completa del desempeño policial
- ✅ **Notas Generales** - Espacio para observaciones detalladas
- ✅ **Historial Completo** - Todas las evaluaciones se mantienen registradas
- ✅ **Auditoría** - Registro de todos los cambios realizados
- ✅ **Interfaz Western 1899** - Diseño coherente con el tema del servidor

---

## 🔧 INSTALACIÓN

### 1. Base de Datos

Ejecuta el archivo SQL en tu base de datos MySQL:

```bash
sql/ode_system.sql
```

Esto creará 3 tablas:
- `ode_evaluations` - Evaluaciones de oficiales
- `ode_evaluation_checks` - Checks individuales de cada evaluación
- `ode_logs` - Registro de auditoría

### 2. Permisos

El sistema ODE solo es accesible para rangos administrativos configurados en `config.lua`:

```lua
Config.AdminRanks = {
    'sheriff',
    'marshal'
}
```

### 3. Modo Testing

Para permitir que todos los jugadores accedan con permisos de admin (solo para pruebas):

```lua
Config.AllowAllPlayers = true
```

**⚠️ IMPORTANTE:** Cambia a `false` en producción.

---

## 🎮 USO DEL SISTEMA

### Para Supervisores (Admin)

#### 1. Acceder al Sistema ODE

1. Abre el Dispatch con **F6**
2. Haz clic en el botón **"📋 Sistema ODE - Evaluaciones"**
3. Se abrirá el panel ODE con 3 opciones de navegación:
   - **Lista de Oficiales**
   - **Mis Evaluaciones**
   - **Nueva Evaluación**

#### 2. Crear una Nueva Evaluación

**Opción A: Desde la Lista de Oficiales**
1. En la pestaña "Lista de Oficiales"
2. Haz clic en la tarjeta del oficial que deseas evaluar
3. Se creará automáticamente una nueva evaluación

**Opción B: Desde el Formulario**
1. Ve a la pestaña "Nueva Evaluación"
2. Selecciona un oficial del menú desplegable
3. Haz clic en "Iniciar Evaluación"

#### 3. Realizar la Evaluación

El sistema presenta **6 categorías** con múltiples criterios cada una:

1. **Conducta Profesional**
2. **Procedimientos Policiales**
3. **Comunicación**
4. **Patrullaje**
5. **Trabajo en Equipo**
6. **Iniciativa y Liderazgo**

Para cada criterio, puedes marcar:

- **✓ Positivo** (Verde) - El oficial cumple satisfactoriamente
- **✗ Negativo** (Rojo) - El oficial no cumple o necesita mejorar
- **◉ Observado** (Naranja) - Se observó pero requiere más seguimiento

#### 4. Guardar Checks

- Cada vez que haces clic en un botón, **se guarda automáticamente** en la base de datos
- No necesitas hacer clic en "Guardar" - es instantáneo
- El botón seleccionado se resalta para indicar tu elección
- Puedes cambiar tu selección en cualquier momento

#### 5. Agregar Notas Generales

1. Desplázate hasta la sección "Notas Generales"
2. Escribe tus observaciones sobre el desempeño del oficial
3. Haz clic en "Guardar Notas"

#### 6. Completar la Evaluación

1. Una vez revisados todos los criterios
2. Haz clic en **"✓ Completar Evaluación"**
3. La evaluación se marcará como completada
4. Se registrará en el historial

#### 7. Ver Historial de Evaluaciones

1. Ve a la pestaña "Mis Evaluaciones"
2. Verás todas las evaluaciones realizadas
3. Las evaluaciones muestran:
   - Nombre del oficial evaluado
   - Fecha de evaluación
   - Estado (En Progreso / Completada)
   - Nombre del evaluador

---

## 📊 CATEGORÍAS DE EVALUACIÓN

### 1. Conducta Profesional
- Mantiene compostura bajo presión
- Trata a civiles con respeto
- Sigue la cadena de mando
- Viste el uniforme apropiadamente
- Mantiene su equipo en buen estado

### 2. Procedimientos Policiales
- Aplica correctamente las leyes
- Realiza detenciones adecuadas
- Documenta incidentes apropiadamente
- Maneja evidencia correctamente
- Sigue protocolos de uso de fuerza

### 3. Comunicación
- Se comunica claramente por radio
- Reporta actividades oportunamente
- Coordina efectivamente con otros oficiales
- Mantiene profesionalismo verbal
- Escucha activamente instrucciones

### 4. Patrullaje
- Mantiene presencia visible en su distrito
- Responde rápidamente a llamadas
- Identifica actividades sospechosas
- Conoce bien su territorio asignado
- Realiza patrullaje preventivo

### 5. Trabajo en Equipo
- Apoya a otros oficiales
- Participa en operaciones coordinadas
- Comparte información relevante
- Acepta y ofrece asistencia
- Contribuye positivamente al equipo

### 6. Iniciativa y Liderazgo
- Toma decisiones apropiadas
- Muestra iniciativa en situaciones
- Asume responsabilidad de sus acciones
- Puede liderar cuando sea necesario
- Busca oportunidades de mejora

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `ode_evaluations`

Almacena las evaluaciones principales:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) | ID único de la evaluación |
| evaluated_officer_id | INT(11) | ID del oficial evaluado |
| evaluated_officer_name | VARCHAR(100) | Nombre del oficial evaluado |
| evaluator_id | INT(11) | ID del supervisor que evalúa |
| evaluator_name | VARCHAR(100) | Nombre del supervisor |
| evaluation_date | TIMESTAMP | Fecha de la evaluación |
| overall_notes | TEXT | Notas generales |
| status | VARCHAR(20) | Estado: in_progress / completed |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### Tabla: `ode_evaluation_checks`

Almacena cada check individual:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) | ID único del check |
| evaluation_id | INT(11) | ID de la evaluación |
| category | VARCHAR(50) | Categoría del check |
| check_item | VARCHAR(200) | Descripción del criterio |
| check_value | VARCHAR(20) | positive / negative / observed |
| notes | TEXT | Notas específicas del check |
| checked_at | TIMESTAMP | Fecha del check |

### Tabla: `ode_logs`

Registro de auditoría:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) | ID único del log |
| evaluation_id | INT(11) | ID de la evaluación |
| check_id | INT(11) | ID del check (opcional) |
| action | VARCHAR(100) | Acción realizada |
| old_value | VARCHAR(100) | Valor anterior |
| new_value | VARCHAR(100) | Valor nuevo |
| changed_by | INT(11) | ID de quien hizo el cambio |
| timestamp | TIMESTAMP | Fecha y hora |

---

## 🔍 CONSULTAS ÚTILES

### Ver todas las evaluaciones de un oficial

```sql
SELECT * FROM ode_evaluations 
WHERE evaluated_officer_id = [ID_OFICIAL]
ORDER BY evaluation_date DESC;
```

### Ver checks de una evaluación específica

```sql
SELECT * FROM ode_evaluation_checks 
WHERE evaluation_id = [ID_EVALUACION]
ORDER BY category, id;
```

### Ver historial de cambios

```sql
SELECT * FROM ode_logs 
WHERE evaluation_id = [ID_EVALUACION]
ORDER BY timestamp DESC;
```

### Estadísticas de un oficial

```sql
SELECT 
    check_value,
    COUNT(*) as total
FROM ode_evaluation_checks
WHERE evaluation_id IN (
    SELECT id FROM ode_evaluations 
    WHERE evaluated_officer_id = [ID_OFICIAL]
)
GROUP BY check_value;
```

---

## ⚙️ CONFIGURACIÓN PERSONALIZADA

### Modificar Categorías de Evaluación

Edita el archivo `config.lua`:

```lua
Config.ODE = {
    Categories = {
        {
            name = 'Tu Categoría',
            items = {
                'Criterio 1',
                'Criterio 2',
                'Criterio 3'
            }
        },
        -- Añade más categorías aquí
    }
}
```

### Cambiar Permisos de Acceso

En `config.lua`:

```lua
-- Solo estos rangos pueden usar el sistema ODE
Config.AdminRanks = {
    'sheriff',
    'marshal',
    'captain'  -- Añadir más rangos
}
```

---

## 🎨 PERSONALIZACIÓN DE INTERFAZ

### Colores de los Botones

Edita `html/styles.css`:

```css
/* Botón Positivo */
.check-btn-positive.active {
    background: #4caf50;  /* Verde */
}

/* Botón Negativo */
.check-btn-negative.active {
    background: #f44336;  /* Rojo */
}

/* Botón Observado */
.check-btn-observed.active {
    background: #ff9800;  /* Naranja */
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### El botón ODE no aparece

1. Verifica que tienes rango de admin en `Config.AdminRanks`
2. Confirma que `Config.AllowAllPlayers = true` para testing
3. Revisa la consola del servidor para errores

### Los checks no se guardan

1. Verifica que las tablas SQL existan
2. Comprueba la conexión a la base de datos (oxmysql)
3. Revisa los logs del servidor para errores SQL

### No aparecen oficiales en la lista

1. Asegúrate de que hay oficiales en servicio en el dispatch
2. Verifica que la tabla `dispatch_units` tenga datos
3. Comprueba los permisos de la base de datos

### Los cambios no persisten

1. Verifica que las transacciones SQL se completen
2. Comprueba los logs de la tabla `ode_logs`
3. Asegúrate de que no hay errores en la consola

---

## 📈 MEJORES PRÁCTICAS

### Para Supervisores

1. **Sé Consistente** - Usa los mismos criterios para todos los oficiales
2. **Sé Específico** - Usa las notas generales para detalles importantes
3. **Sé Constructivo** - Los checks negativos deben ir acompañados de orientación
4. **Documenta Todo** - Cada evaluación es un registro permanente
5. **Seguimiento** - Revisa evaluaciones anteriores antes de hacer una nueva

### Para Administradores

1. **Backups Regulares** - Respalda las tablas ODE periódicamente
2. **Auditoría** - Revisa los logs para detectar patrones
3. **Capacitación** - Asegúrate de que los supervisores entiendan el sistema
4. **Revisión** - Evalúa las categorías periódicamente para mantenerlas relevantes

---

## 📝 NOTAS IMPORTANTES

- ⚠️ **Permanencia**: Las evaluaciones son permanentes y no se pueden eliminar desde la UI
- ⚠️ **Privacidad**: Solo los rangos admin pueden ver las evaluaciones
- ⚠️ **Auditoría**: Todos los cambios quedan registrados en `ode_logs`
- ⚠️ **Testing**: Usa `Config.AllowAllPlayers = true` solo para pruebas
- ⚠️ **Producción**: Cambia a `false` cuando el sistema esté en vivo

---

## 🤝 SOPORTE

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica la configuración en `config.lua`
3. Comprueba que las tablas SQL existan
4. Consulta la sección de solución de problemas

---

## 📜 CHANGELOG

### Versión 1.0.0 - 25 de Noviembre de 2025

**Funcionalidades Iniciales:**
- ✅ Sistema completo de evaluaciones
- ✅ 6 categorías con 30 criterios totales
- ✅ Botones Positivo/Negativo/Observado
- ✅ Guardado automático de checks
- ✅ Sistema de notas generales
- ✅ Historial de evaluaciones
- ✅ Auditoría completa
- ✅ Interfaz Western 1899

---

**Desarrollado para DAEXV Dispatch 1.0.0**  
**Framework:** VORP Core  
**Juego:** RedM (Red Dead Redemption 2)  
**Año de Ambientación:** 1899

---

**¡Sistema ODE listo para evaluar oficiales! 🤠⭐**
