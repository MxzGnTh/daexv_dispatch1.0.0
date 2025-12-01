// =====================================================
// ODE SYSTEM - SISTEMA DE EVALUACIONES 1899
// JavaScript del lado del cliente (NUI)
// =====================================================

let evaluacionActual = null;
let evaluaciones = [];
let modoEdicion = false;

// Función auxiliar para obtener el nombre del recurso de forma segura
function getResourceName() {
    try {
        if (typeof GetParentResourceName === 'function') {
            return GetParentResourceName();
        }
    } catch (e) {
        console.warn('[ODE] GetParentResourceName no disponible');
    }
    return 'daexv_dispatch';
}

// =====================================================
// INICIALIZACIÓN DEL SISTEMA ODE
// =====================================================

window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.action === 'abrirODE') {
        abrirSistemaODE();
    }
});

// Listener del botón ODE en el navbar
document.addEventListener('DOMContentLoaded', () => {
    // Botón ODE
    const btnODE = document.getElementById('btn-open-ode');
    if (btnODE) {
        btnODE.addEventListener('click', () => {
            console.log('[ODE] Botón ODE clickeado');
            // Abrir directamente el modal sin pasar por Lua
            abrirSistemaODE();
        });
    }
    
    // Botón Avisos
    const btnAvisos = document.getElementById('btn-open-avisos');
    if (btnAvisos) {
        btnAvisos.addEventListener('click', () => {
            console.log('[ODE] Botón Avisos clickeado');
            abrirSistemaAvisos();
        });
    }
    
    // Botón cerrar avisos
    const btnCerrarAvisos = document.getElementById('btn-close-avisos');
    if (btnCerrarAvisos) {
        btnCerrarAvisos.addEventListener('click', cerrarSistemaAvisos);
    }
});

// =====================================================
// SISTEMA DE AVISOS
// =====================================================

function abrirSistemaAvisos() {
    const modal = document.getElementById('avisos-system-modal');
    if (!modal) {
        console.error('[AVISOS] Modal no encontrado');
        return;
    }
    
    // Cerrar ODE si está abierto
    const odeModal = document.getElementById('ode-system-modal');
    if (odeModal && !odeModal.classList.contains('hidden')) {
        odeModal.classList.add('hidden');
        odeModal.classList.remove('fade-in');
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    console.log('[AVISOS] Modal abierto');
}

function cerrarSistemaAvisos() {
    const modal = document.getElementById('avisos-system-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }
    console.log('[AVISOS] Modal cerrado');
}

// =====================================================
// ABRIR/CERRAR SISTEMA ODE
// =====================================================

function abrirSistemaODE() {
    const modal = document.getElementById('ode-system-modal');
    if (!modal) {
        console.error('[ODE] Modal no encontrado');
        return;
    }
    
    // Cerrar Avisos si está abierto
    const avisosModal = document.getElementById('avisos-system-modal');
    if (avisosModal && !avisosModal.classList.contains('hidden')) {
        avisosModal.classList.add('hidden');
        avisosModal.classList.remove('fade-in');
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    
    // Cargar evaluaciones
    cargarEvaluaciones();
    
    // Activar tab de documentos por defecto
    activarTab('documentos');
}

function cerrarSistemaODE() {
    const modal = document.getElementById('ode-system-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }
    
    // Resetear estado
    evaluacionActual = null;
    modoEdicion = false;
    
    // Verificar si el dispatch está abierto
    const dispatchContainer = document.getElementById('dispatch-container');
    const dispatchAbierto = dispatchContainer && !dispatchContainer.classList.contains('hidden');
    
    // Solo notificar cierre de ODE si el dispatch NO está abierto
    // Si el dispatch está abierto, NO quitamos el focus del NUI
    fetch(`https://${getResourceName()}/cerrarODE`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchAbierto: dispatchAbierto })
    }).catch(e => console.log('[ODE] Fetch error (normal en desarrollo)'));
}

// Listener del botón cerrar
document.addEventListener('DOMContentLoaded', () => {
    const btnCerrar = document.getElementById('btn-close-ode');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarSistemaODE);
    }
    
    // Cerrar con ESC - Solo cerrar ODE si está abierto
    // El dispatch tiene su propio listener de ESC
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            // Primero verificar si hay un modal de curriculum abierto
            const modalCurriculum = document.getElementById('modal-curriculum');
            if (modalCurriculum && !modalCurriculum.classList.contains('hidden')) {
                cerrarModalCurriculum();
                e.stopPropagation();
                return;
            }
            
            // Luego verificar el modal principal de ODE
            const modal = document.getElementById('ode-system-modal');
            if (modal && !modal.classList.contains('hidden')) {
                cerrarSistemaODE();
                e.stopPropagation();
                return;
            }
        }
    });
});

// =====================================================
// SISTEMA DE TABS
// =====================================================

function activarTab(tabName) {
    // Desactivar todos los tabs
    document.querySelectorAll('.ode-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.ode-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar tab seleccionado
    const btnTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (btnTab) {
        btnTab.classList.add('active');
    }
    
    const contentTab = document.getElementById(`ode-tab-${tabName}`);
    if (contentTab) {
        contentTab.classList.add('active');
    }
    
    // Cargar contenido según el tab
    if (tabName === 'documentos') {
        cargarEvaluaciones();
    }
}

// Listeners de tabs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ode-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            activarTab(tab);
        });
    });
    
    // === BUSCADOR DE EVALUACIONES ===
    const btnBuscar = document.getElementById('btn-buscar-evaluaciones');
    const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
    const inputNombre = document.getElementById('buscar-evaluacion-nombre');
    const inputId = document.getElementById('buscar-evaluacion-id');
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', filtrarEvaluaciones);
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarBusquedaEvaluaciones);
    }
    
    // Buscar al presionar Enter
    if (inputNombre) {
        inputNombre.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filtrarEvaluaciones();
        });
    }
    
    if (inputId) {
        inputId.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filtrarEvaluaciones();
        });
    }
    
    // === TOGGLE DE VISTA CARDS/LISTA ===
    const btnViewCards = document.getElementById('btn-view-cards');
    const btnViewList = document.getElementById('btn-view-list');
    
    if (btnViewCards) {
        btnViewCards.addEventListener('click', () => cambiarVistaEvaluaciones('cards'));
    }
    
    if (btnViewList) {
        btnViewList.addEventListener('click', () => cambiarVistaEvaluaciones('list'));
    }
});

// =====================================================
// TOGGLE DE VISTA CARDS/LISTA
// =====================================================

let vistaActual = 'cards'; // 'cards' o 'list'

function cambiarVistaEvaluaciones(vista) {
    vistaActual = vista;
    
    const container = document.getElementById('evaluaciones-list');
    const btnCards = document.getElementById('btn-view-cards');
    const btnList = document.getElementById('btn-view-list');
    
    if (!container) return;
    
    // Actualizar clases del contenedor
    if (vista === 'list') {
        container.classList.add('view-list');
    } else {
        container.classList.remove('view-list');
    }
    
    // Actualizar botones activos
    if (btnCards && btnList) {
        if (vista === 'cards') {
            btnCards.classList.add('active');
            btnList.classList.remove('active');
        } else {
            btnCards.classList.remove('active');
            btnList.classList.add('active');
        }
    }
    
    console.log('[ODE] Vista cambiada a:', vista);
}

// =====================================================
// FILTRAR EVALUACIONES (BUSCADOR)
// =====================================================

function filtrarEvaluaciones() {
    const nombreBuscado = document.getElementById('buscar-evaluacion-nombre')?.value.toLowerCase().trim() || '';
    const idBuscado = document.getElementById('buscar-evaluacion-id')?.value.trim() || '';
    
    let evaluacionesFiltradas = [...evaluaciones];
    
    // Filtrar por ID (búsqueda exacta)
    if (idBuscado) {
        const idNum = parseInt(idBuscado);
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.id === idNum);
    }
    
    // Filtrar por nombre (evaluado o evaluador)
    if (nombreBuscado) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => {
            const evaluadoNombre = (e.evaluado_nombre || '').toLowerCase();
            const evaluadorNombre = (e.evaluador_nombre || '').toLowerCase();
            return evaluadoNombre.includes(nombreBuscado) || evaluadorNombre.includes(nombreBuscado);
        });
    }
    
    // Renderizar resultados filtrados
    renderizarEvaluacionesFiltradas(evaluacionesFiltradas, nombreBuscado, idBuscado);
}

function renderizarEvaluacionesFiltradas(lista, nombreBuscado, idBuscado) {
    const container = document.getElementById('evaluaciones-list');
    const countLabel = document.getElementById('evaluaciones-count');
    
    if (!container) return;
    
    // Actualizar contador
    if (countLabel) {
        if (nombreBuscado || idBuscado) {
            const criterios = [];
            if (nombreBuscado) criterios.push(`nombre: "${nombreBuscado}"`);
            if (idBuscado) criterios.push(`ID: ${idBuscado}`);
            countLabel.textContent = `Encontradas: ${lista.length} evaluación(es) | Filtro: ${criterios.join(', ')}`;
        } else {
            countLabel.textContent = `Mostrando todas las evaluaciones (${evaluaciones.length})`;
        }
    }
    
    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No se encontraron evaluaciones</h3>
                <p>Intenta con otros criterios de búsqueda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    lista.forEach(evaluacion => {
        const card = crearCardEvaluacion(evaluacion);
        container.appendChild(card);
    });
}

function limpiarBusquedaEvaluaciones() {
    const inputNombre = document.getElementById('buscar-evaluacion-nombre');
    const inputId = document.getElementById('buscar-evaluacion-id');
    const countLabel = document.getElementById('evaluaciones-count');
    
    if (inputNombre) inputNombre.value = '';
    if (inputId) inputId.value = '';
    if (countLabel) countLabel.textContent = `Mostrando todas las evaluaciones (${evaluaciones.length})`;
    
    // Mostrar todas las evaluaciones
    renderizarEvaluaciones();
}

// =====================================================
// CARGAR EVALUACIONES (TAB DOCUMENTOS)
// =====================================================

function cargarEvaluaciones() {
    mostrarCargando('evaluaciones-list');
    
    fetch(`https://${getResourceName()}/ode_getEvaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            evaluaciones = result.evaluaciones || [];
            renderizarEvaluaciones();
        } else {
            mostrarError('evaluaciones-list', result.message || 'Error al cargar evaluaciones');
        }
    })
    .catch(error => {
        console.error('[ODE] Error:', error);
        mostrarError('evaluaciones-list', 'Error de conexión');
    });
}

function renderizarEvaluaciones() {
    const container = document.getElementById('evaluaciones-list');
    if (!container) return;
    
    if (evaluaciones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No hay evaluaciones registradas</h3>
                <p>Las evaluaciones creadas aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    evaluaciones.forEach(evaluacion => {
        const card = crearCardEvaluacion(evaluacion);
        container.appendChild(card);
    });
}

function crearCardEvaluacion(evaluacion) {
    const card = document.createElement('div');
    card.className = 'evaluacion-card';
    card.setAttribute('data-eval-id', evaluacion.id);
    
    // Determinar clase de estado
    let estadoClase = '';
    let estadoTexto = '';
    
    switch(evaluacion.estado) {
        case 'aprobado':
            estadoClase = 'aprobado';
            estadoTexto = '✓ APROBADO';
            break;
        case 'pendiente':
            estadoClase = 'pendiente';
            estadoTexto = '⚠ PENDIENTE';
            break;
        case 'rechazado':
            estadoClase = 'rechazado';
            estadoTexto = '✗ RECHAZADO';
            break;
        default:
            estadoClase = 'borrador';
            estadoTexto = '📝 BORRADOR';
    }
    
    card.innerHTML = `
        <div class="evaluacion-header">
            <div class="evaluacion-titulo">
                <h3>${evaluacion.evaluado_nombre}</h3>
                <span class="badge-eval-tipo">${evaluacion.tipo_evaluacion}</span>
            </div>
            <span class="badge-eval-status ${estadoClase}">${estadoTexto}</span>
        </div>
        
        <div class="evaluacion-body">
            <div class="eval-info-row">
                <div class="eval-info-item">
                    <span class="eval-label">Evaluador:</span>
                    <span class="eval-value">${evaluacion.evaluador_nombre}</span>
                </div>
                <div class="eval-info-item">
                    <span class="eval-label">Fecha:</span>
                    <span class="eval-value">${evaluacion.fecha} ${evaluacion.hora}</span>
                </div>
            </div>
            
            <div class="eval-info-row">
                <div class="eval-info-item">
                    <span class="eval-label">Objetivo:</span>
                    <span class="eval-value">${evaluacion.objetivo}</span>
                </div>
            </div>
            
            ${evaluacion.puntuacion_final !== null && evaluacion.puntuacion_final !== undefined ? `
                <div class="eval-puntuacion">
                    <div class="puntuacion-bar">
                        <div class="puntuacion-fill" style="width: ${(evaluacion.puntuacion_final / 15) * 100}%"></div>
                    </div>
                    <div class="puntuacion-stats">
                        <span class="stat-item aprobado">✓${evaluacion.aprobados ?? 0}</span>
                        <span class="stat-item observado">⚠${evaluacion.observados ?? 0}</span>
                        <span class="stat-item rechazado">✗${evaluacion.rechazados ?? 0}</span>
                        <span class="stat-item total">${evaluacion.puntuacion_final ?? 0}/15</span>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="evaluacion-footer">
            <button class="btn-eval-action btn-editar" onclick="editarEvaluacion(${evaluacion.id})">
                ✏️ Editar
            </button>
            <button class="btn-eval-action btn-ver" onclick="verEvaluacion(${evaluacion.id})">
                👁️ Ver Detalle
            </button>
        </div>
    `;
    
    return card;
}

// =====================================================
// CREAR NUEVA EVALUACIÓN (TAB CREAR)
// =====================================================

function crearNuevaEvaluacion() {
    const evaluadoId = document.getElementById('crear-evaluado-id').value;
    const evaluadoNombre = document.getElementById('crear-evaluado-nombre').value;
    const tipo = document.getElementById('crear-tipo').value;
    const objetivo = document.getElementById('crear-objetivo').value;
    
    if (!evaluadoId || !evaluadoNombre) {
        mostrarAlertaODE('Debes seleccionar un oficial a evaluar');
        return;
    }
    
    if (!tipo || !objetivo) {
        mostrarAlertaODE('Debes completar el tipo y objetivo de la evaluación');
        return;
    }
    
    mostrarCargandoGlobal('Creando evaluación...');
    
    fetch(`https://${getResourceName()}/ode_crearEvaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluado_identifier: parseInt(evaluadoId),
            evaluado_nombre: evaluadoNombre,
            tipo_evaluacion: tipo,
            objetivo: objetivo
        })
    })
    .then(response => response.json())
    .then(result => {
        ocultarCargandoGlobal();
        
        if (result.success) {
            mostrarAlertaODE('✓ ' + result.message, 'success');
            
            // Limpiar formulario
            document.getElementById('crear-evaluado-id').value = '';
            document.getElementById('crear-evaluado-nombre').value = '';
            document.getElementById('crear-tipo').value = '';
            document.getElementById('crear-objetivo').value = '';
            
            // Ir a tab de documentos
            setTimeout(() => {
                activarTab('documentos');
            }, 1500);
        } else {
            mostrarAlertaODE('✗ ' + result.message, 'error');
        }
    })
    .catch(error => {
        ocultarCargandoGlobal();
        console.error('[ODE] Error:', error);
        mostrarAlertaODE('Error de conexión', 'error');
    });
}

// Listener del botón crear
document.addEventListener('DOMContentLoaded', () => {
    const btnCrear = document.getElementById('btn-crear-evaluacion');
    if (btnCrear) {
        btnCrear.addEventListener('click', crearNuevaEvaluacion);
    }
    
    // Listener del botón limpiar formulario
    const btnLimpiarForm = document.getElementById('btn-limpiar-crear-form');
    if (btnLimpiarForm) {
        btnLimpiarForm.addEventListener('click', limpiarFormularioCrear);
    }
});

// Función para limpiar el formulario de crear evaluación
function limpiarFormularioCrear() {
    // Limpiar búsqueda de jugador
    const inputBuscar = document.getElementById('buscar-jugador-input');
    if (inputBuscar) inputBuscar.value = '';
    
    // Limpiar resultados de búsqueda
    const resultados = document.getElementById('resultados-busqueda');
    if (resultados) resultados.innerHTML = '';
    
    // Limpiar oficial seleccionado
    const evalId = document.getElementById('crear-evaluado-id');
    if (evalId) evalId.value = '';
    
    const evalNombre = document.getElementById('crear-evaluado-nombre');
    if (evalNombre) evalNombre.value = '';
    
    // Limpiar tipo de evaluación
    const tipo = document.getElementById('crear-tipo');
    if (tipo) tipo.selectedIndex = 0;
    
    // Limpiar objetivo
    const objetivo = document.getElementById('crear-objetivo');
    if (objetivo) objetivo.value = '';
    
    console.log('[ODE] Formulario de crear evaluación limpiado');
    mostrarAlertaODE('Formulario limpiado', 'success');
}

// =====================================================
// BUSCAR JUGADORES PARA EVALUAR
// =====================================================

let timeoutBusqueda = null;

function buscarJugadores() {
    const input = document.getElementById('buscar-jugador-input');
    
    if (!input) {
        console.error('[ODE] ¡Input no encontrado!');
        return;
    }
    
    const searchTerm = input.value.trim();
    
    console.log('[ODE] buscarJugadores() llamado - término:', searchTerm, 'longitud:', searchTerm.length);
    
    if (searchTerm.length < 2) {
        console.log('[ODE] Término muy corto, limpiando resultados');
        document.getElementById('resultados-busqueda').innerHTML = '';
        return;
    }
    
    // Debounce
    clearTimeout(timeoutBusqueda);
    
    timeoutBusqueda = setTimeout(() => {
        console.log('[ODE] Enviando petición de búsqueda al servidor...');
        
        fetch(`https://${getResourceName()}/ode_buscarJugadores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: searchTerm })
        })
        .then(response => {
            console.log('[ODE] Respuesta recibida, parseando JSON...');
            return response.json();
        })
        .then(result => {
            console.log('[ODE] Resultado recibido:', result);
            
            if (result.success) {
                console.log('[ODE] Jugadores encontrados:', result.jugadores.length);
                mostrarResultadosBusqueda(result.jugadores);
            } else {
                console.error('[ODE] Error en búsqueda:', result.message);
                mostrarResultadosBusqueda([]);
            }
        })
        .catch(error => {
            console.error('[ODE] Error en fetch:', error);
        });
    }, 300);
}

// FUNCIÓN DE PRUEBA MANUAL - Llamar desde consola F8: testBusqueda()
window.testBusqueda = function() {
    console.log('=== TEST DE BÚSQUEDA MANUAL ===');
    
    const jugadoresPrueba = [
        { identifier: 1, nombre: 'John Marston', job: 'sheriff' },
        { identifier: 2, nombre: 'Arthur Morgan', job: 'sheriff' },
        { identifier: 3, nombre: 'Thomas Downes', job: 'civilian' }
    ];
    
    console.log('Mostrando jugadores de prueba:', jugadoresPrueba);
    mostrarResultadosBusqueda(jugadoresPrueba);
};

function mostrarResultadosBusqueda(jugadores) {
    const container = document.getElementById('resultados-busqueda');
    
    if (!container) {
        console.error('[ODE] ¡Contenedor de resultados NO encontrado!');
        return;
    }
    
    console.log('[ODE] mostrarResultadosBusqueda() - Jugadores:', jugadores.length);
    
    // Limpiar primero
    container.innerHTML = '';
    
    if (jugadores.length === 0) {
        container.innerHTML = '<div class="no-results">No se encontraron oficiales</div>';
        container.style.display = 'block'; // Forzar mostrar
        console.log('[ODE] No hay resultados, mostrando mensaje');
        return;
    }
    
    console.log('[ODE] Creando items de resultados...');
    
    jugadores.forEach((jugador, index) => {
        console.log(`[ODE] Agregando jugador ${index + 1}:`, jugador.nombre, jugador.identifier);
        
        const item = document.createElement('div');
        item.className = 'resultado-item';
        item.innerHTML = `
            <span class="jugador-nombre">${jugador.nombre}</span>
            <span class="jugador-job">${jugador.job || 'sheriff'}</span>
        `;
        
        item.addEventListener('click', () => {
            console.log('[ODE] Jugador seleccionado:', jugador);
            seleccionarJugador(jugador);
        });
        
        container.appendChild(item);
    });
    
    // Forzar visibilidad
    container.style.display = 'block';
    console.log('[ODE] Resultados mostrados. Children:', container.children.length);
}

function seleccionarJugador(jugador) {
    document.getElementById('crear-evaluado-id').value = jugador.identifier;
    document.getElementById('crear-evaluado-nombre').value = jugador.nombre;
    document.getElementById('resultados-busqueda').innerHTML = '';
    document.getElementById('buscar-jugador-input').value = '';
}

// Listener del input de búsqueda
document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar = document.getElementById('buscar-jugador-input');
    if (inputBuscar) {
        console.log('[ODE] Input de búsqueda encontrado y conectado');
        inputBuscar.addEventListener('input', buscarJugadores);
        
        // TEST: Forzar búsqueda al hacer clic
        inputBuscar.addEventListener('focus', () => {
            console.log('[ODE] Input enfocado, valor actual:', inputBuscar.value);
            if (inputBuscar.value.length >= 2) {
                buscarJugadores();
            }
        });
    } else {
        console.error('[ODE] ¡ERROR! Input buscar-jugador-input NO encontrado');
    }
    
    // TEST: Verificar que el contenedor de resultados existe
    const contenedorResultados = document.getElementById('resultados-busqueda');
    if (contenedorResultados) {
        console.log('[ODE] Contenedor de resultados encontrado');
    } else {
        console.error('[ODE] ¡ERROR! Contenedor resultados-busqueda NO encontrado');
    }
});

// =====================================================
// EDITAR EVALUACIÓN (MODAL CURRICULUM)
// =====================================================

function editarEvaluacion(evalId) {
    mostrarCargandoGlobal('Cargando evaluación...');
    
    fetch(`https://${getResourceName()}/ode_getEvaluacionDetalle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluacion_id: evalId })
    })
    .then(response => response.json())
    .then(result => {
        ocultarCargandoGlobal();
        
        if (result.success) {
            evaluacionActual = result.evaluacion;
            modoEdicion = true;
            abrirModalCurriculum();
        } else {
            mostrarAlertaODE('✗ ' + result.message, 'error');
        }
    })
    .catch(error => {
        ocultarCargandoGlobal();
        console.error('[ODE] Error:', error);
        mostrarAlertaODE('Error de conexión', 'error');
    });
}

function verEvaluacion(evalId) {
    editarEvaluacion(evalId); // Por ahora usa la misma función
}

function abrirModalCurriculum() {
    const modal = document.getElementById('modal-curriculum');
    if (!modal) {
        console.error('[ODE] Modal curriculum no encontrado');
        return;
    }
    
    // Llenar información de la evaluación
    document.getElementById('modal-eval-evaluado').textContent = evaluacionActual.evaluado_nombre;
    document.getElementById('modal-eval-tipo').textContent = evaluacionActual.tipo_evaluacion;
    document.getElementById('modal-eval-objetivo').textContent = evaluacionActual.objetivo;
    document.getElementById('modal-eval-fecha').textContent = evaluacionActual.fecha_completa;
    document.getElementById('modal-eval-estado').textContent = evaluacionActual.estado.toUpperCase();
    document.getElementById('modal-eval-estado').className = `badge-status ${evaluacionActual.estado}`;
    
    // Renderizar curriculum
    renderizarCurriculum();
    
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
}

function cerrarModalCurriculum() {
    const modal = document.getElementById('modal-curriculum');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }
    
    evaluacionActual = null;
    modoEdicion = false;
}

// Listeners del modal
document.addEventListener('DOMContentLoaded', () => {
    const btnCerrarModal = document.getElementById('btn-cerrar-modal-curriculum');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModalCurriculum);
    }
    
    const btnGuardar = document.getElementById('btn-guardar-curriculum');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarCurriculum);
    }
    
    const btnEnviar = document.getElementById('btn-enviar-evaluacion');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarEvaluacion);
    }
});

function renderizarCurriculum() {
    const container = document.getElementById('curriculum-puntos-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const puntos = evaluacionActual.curriculum_data.puntos;
    
    puntos.forEach((punto, index) => {
        const item = crearItemCurriculum(punto, index);
        container.appendChild(item);
    });
}

function crearItemCurriculum(punto, index) {
    const item = document.createElement('div');
    item.className = 'curriculum-item';
    item.setAttribute('data-index', index);
    
    const estadoActual = punto.estado || 'pendiente';
    
    item.innerHTML = `
        <div class="curriculum-header">
            <span class="curriculum-numero">${index + 1}</span>
            <h4 class="curriculum-titulo">${punto.titulo}</h4>
            <span class="curriculum-badge ${estadoActual}">${estadoActual.toUpperCase()}</span>
        </div>
        
        <div class="curriculum-controls">
            <div class="estado-buttons">
                <button class="btn-estado ${estadoActual === 'aprobado' ? 'active' : ''}" 
                        data-estado="aprobado" 
                        onclick="cambiarEstadoPunto(${index}, 'aprobado')">
                    ✓ Aprobado
                </button>
                <button class="btn-estado ${estadoActual === 'observado' ? 'active' : ''}" 
                        data-estado="observado" 
                        onclick="cambiarEstadoPunto(${index}, 'observado')">
                    ⚠ Observado
                </button>
                <button class="btn-estado ${estadoActual === 'rechazado' ? 'active' : ''}" 
                        data-estado="rechazado" 
                        onclick="cambiarEstadoPunto(${index}, 'rechazado')">
                    ✗ Rechazado
                </button>
            </div>
            
            <div class="observacion-field">
                <label>Observación:</label>
                <textarea 
                    class="observacion-input" 
                    placeholder="Agregar observación (opcional)"
                    onchange="actualizarObservacion(${index}, this.value)"
                >${punto.observacion || ''}</textarea>
            </div>
        </div>
    `;
    
    return item;
}

function cambiarEstadoPunto(index, nuevoEstado) {
    if (!evaluacionActual || !evaluacionActual.curriculum_data.puntos[index]) return;
    
    // Actualizar estado en memoria
    evaluacionActual.curriculum_data.puntos[index].estado = nuevoEstado;
    
    // Actualizar UI
    const item = document.querySelector(`.curriculum-item[data-index="${index}"]`);
    if (item) {
        // Actualizar botones
        item.querySelectorAll('.btn-estado').forEach(btn => {
            btn.classList.remove('active');
        });
        
        item.querySelector(`.btn-estado[data-estado="${nuevoEstado}"]`).classList.add('active');
        
        // Actualizar badge
        const badge = item.querySelector('.curriculum-badge');
        badge.className = `curriculum-badge ${nuevoEstado}`;
        badge.textContent = nuevoEstado.toUpperCase();
    }
}

function actualizarObservacion(index, valor) {
    if (!evaluacionActual || !evaluacionActual.curriculum_data.puntos[index]) return;
    
    evaluacionActual.curriculum_data.puntos[index].observacion = valor;
}

function guardarCurriculum() {
    mostrarCargandoGlobal('Guardando cambios...');
    
    fetch(`https://${getResourceName()}/ode_actualizarEvaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluacion_id: evaluacionActual.id,
            curriculum_data: evaluacionActual.curriculum_data,
            observaciones_generales: document.getElementById('observaciones-generales')?.value || ''
        })
    })
    .then(response => response.json())
    .then(result => {
        ocultarCargandoGlobal();
        
        if (result.success) {
            mostrarAlertaODE('✓ Cambios guardados correctamente', 'success');
        } else {
            mostrarAlertaODE('✗ ' + result.message, 'error');
        }
    })
    .catch(error => {
        ocultarCargandoGlobal();
        console.error('[ODE] Error:', error);
        mostrarAlertaODE('Error de conexión', 'error');
    });
}

function enviarEvaluacion() {
    if (!confirm('¿Estás seguro de enviar esta evaluación?\n\nSe calculará la puntuación final y no podrás modificarla después.')) {
        return;
    }
    
    mostrarCargandoGlobal('Enviando evaluación...');
    
    fetch(`https://${getResourceName()}/ode_enviarEvaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluacion_id: evaluacionActual.id
        })
    })
    .then(response => response.json())
    .then(result => {
        ocultarCargandoGlobal();
        
        if (result.success) {
            mostrarResultadoEvaluacion(result);
            
            setTimeout(() => {
                cerrarModalCurriculum();
                cargarEvaluaciones();
            }, 3000);
        } else {
            mostrarAlertaODE('✗ ' + result.message, 'error');
        }
    })
    .catch(error => {
        ocultarCargandoGlobal();
        console.error('[ODE] Error:', error);
        mostrarAlertaODE('Error de conexión', 'error');
    });
}

function mostrarResultadoEvaluacion(result) {
    let icono = '';
    let clase = '';
    
    if (result.estado === 'aprobado') {
        icono = '✓';
        clase = 'success';
    } else if (result.estado === 'pendiente') {
        icono = '⚠';
        clase = 'warning';
    } else {
        icono = '✗';
        clase = 'error';
    }
    
    const mensaje = `
        ${icono} ${result.message}
        
        Puntuación: ${result.puntuacion}/15 (${result.porcentaje}%)
        Aprobados: ${result.aprobados}
        Observados: ${result.observados}
        Rechazados: ${result.rechazados}
    `;
    
    mostrarAlertaODE(mensaje, clase);
}

// =====================================================
// UTILIDADES UI
// =====================================================

function mostrarCargando(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    }
}

function mostrarError(containerId, mensaje) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="error-message">${mensaje}</div>`;
    }
}

function mostrarCargandoGlobal(mensaje = 'Cargando...') {
    let loader = document.getElementById('ode-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'ode-loader';
        loader.className = 'ode-global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p class="loader-text">${mensaje}</p>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        loader.querySelector('.loader-text').textContent = mensaje;
        loader.classList.remove('hidden');
    }
}

function ocultarCargandoGlobal() {
    const loader = document.getElementById('ode-loader');
    if (loader) {
        loader.classList.add('hidden');
    }
}

function mostrarAlertaODE(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `ode-alert ode-alert-${tipo}`;
    alerta.textContent = mensaje;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        alerta.classList.remove('show');
        setTimeout(() => alerta.remove(), 300);
    }, 4000);
}

console.log('[ODE SYSTEM] JavaScript cargado correctamente');
