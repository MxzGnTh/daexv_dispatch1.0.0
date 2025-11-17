# 📋 CHANGELOG - Sistema de Dispatch 1899

## [1.1.0] - 2025-11-17

### ✨ Nuevas Características
- **Sistema de Mandos con Pueblos**: Los oficiales pueden asignarse como mandos de pueblos específicos
- **Pueblos por Distrito**: 15+ pueblos disponibles organizados por región
- **Selección Libre para Mandos**: Oficiales en distrito "Mando" pueden elegir cualquier pueblo de cualquier región
- **Alertas Personalizadas**: Modal de alertas con diseño estilo 1899 reemplazando alerts genéricos
- **Persistencia de Pueblos**: Campo `assigned_town` en base de datos con índice optimizado
- **Badge Visual para Mandos**: Identificador dorado con estrella ★ para mandos de pueblo

### 🔧 Mejoras
- Sistema de optgroups para organizar pueblos por región
- Selector dinámico de pueblos según distrito seleccionado
- Botón adicional "Cambiar Pueblo" en panel personal
- Tercera columna "Pueblo" en vista admin
- Estilos CSS mejorados para modal de alertas
- Responsive design optimizado para todas las resoluciones

### 🐛 Correcciones
- Corregido error de persistencia de pueblos al cerrar/abrir dispatch
- Corregido manejo de valores NULL en campo assigned_town
- Eliminado error de compilación CSS en línea 1032
- Limpiados console.logs excesivos del modo desarrollo
- Optimizado manejo de eventos ESC para cerrar alertas

### 📚 Documentación
- Nuevo archivo: `MANDOS.md` - Guía completa del sistema de mandos
- Nuevo archivo: `INSTALACION.md` - Guía de instalación rápida
- Actualizado: `README.md` - Sección de mandos y pueblos
- Actualizado: `ACTUALIZACION.md` - Instrucciones de actualización
- Nuevo archivo: `CHANGELOG.md` - Historial de cambios

### 🗄️ Base de Datos
- Agregado campo: `assigned_town VARCHAR(40) NULL`
- Agregado índice: `idx_town` en campo assigned_town
- Archivo SQL de actualización: `sql/update_towns.sql`

### ⚙️ Configuración
- Agregada tabla: `Config.Towns` con pueblos por distrito
- Actualizado: `Config.AllowAllPlayers = false` (producción)
- Limpiados: AdminRanks (removido deputy temporal)
- Versión actualizada: 1.1.0 en fxmanifest.lua

---

## [1.0.0] - 2025-11-16

### 🎉 Lanzamiento Inicial
- **Sistema de Dispatch Manual 1899**: Sin GPS, radios, mapas ni iconos
- **Interfaz Estilo Pergamino**: Diseño western contextualizado a la época
- **Registro por Distritos**: 8 distritos disponibles
- **Estados Manuales**: 6 estados (Disponible, Ocupado, Patrullando, etc.)
- **Sistema de Permisos**: Por trabajo (sheriff, deputy, marshal)
- **Administración**: Sheriff y Marshal pueden gestionar todas las unidades
- **Persistencia MySQL**: Tablas dispatch_units y dispatch_logs
- **Tecla F6**: Apertura rápida del dispatch
- **Comando /dispatch**: Alternativa por comando
- **Panel Responsive**: Optimizado para resoluciones 720p a 4K
- **Modo Desarrollo**: Testing en Live Server sin RedM

### 📁 Archivos Incluidos
- `fxmanifest.lua` - Manifest del recurso
- `config.lua` - Configuración central
- `client/client.lua` - Lógica del cliente
- `server/server.lua` - Lógica del servidor
- `html/index.html` - Interfaz de usuario
- `html/styles.css` - Estilos western
- `html/script.js` - Lógica de interfaz
- `sql/dispatch.sql` - Estructura de base de datos
- `README.md` - Documentación completa

### 🎨 Características Visuales
- Colores pergamino (#d4c4a8, #c9b896)
- Tipografía: Cinzel (títulos) y Playfair Display (contenido)
- Scrollbar personalizado estilo western
- Badges de estado con colores temáticos
- Animaciones suaves y transiciones
- Bordes decorativos con ornamentos

### 🔐 Sistema de Permisos
- `Config.AllowedJobs`: Trabajos con acceso
- `Config.AdminRanks`: Rangos administrativos
- `Config.AllowAllPlayers`: Modo testing
- Validación VORP Core integrada

---

## 🎯 Próximas Características (Roadmap)

### Versión 1.2.0 (Planeada)
- [ ] Sistema de reportes/casos
- [ ] Historial de actividad por oficial
- [ ] Estadísticas de servicio
- [ ] Exportación de logs
- [ ] Búsqueda/filtrado de unidades
- [ ] Notificaciones en juego

### Versión 1.3.0 (Planeada)
- [ ] Sistema de turnos/horarios
- [ ] Múltiples departamentos (Médicos, Bomberos)
- [ ] Roles personalizados
- [ ] Integración con otros recursos VORP
- [ ] Panel de métricas para admins

---

## 📊 Estadísticas del Proyecto

- **Líneas de Código**: ~2500+
- **Archivos**: 12
- **Pueblos**: 15
- **Distritos**: 8
- **Estados**: 6
- **Resoluciones Soportadas**: 720p - 4K

---

## 🤝 Contribuciones

Este proyecto es mantenido por **DAEXV**.

Para reportar bugs o sugerir mejoras, contacta al desarrollador.

---

## 📄 Licencia

Sistema de Dispatch Manual 1899 © 2025 DAEXV
Todos los derechos reservados.

---

**Última actualización:** 17 de noviembre de 2025
