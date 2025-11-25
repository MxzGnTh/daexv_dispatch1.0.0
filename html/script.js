// =====================================================
// JAVASCRIPT - SISTEMA DE DISPATCH MANUAL 1899
// Sin GPS, Radios, Mapas ni Iconos
// =====================================================

let isAdmin = false;
let districts = [];
let statuses = [];
let towns = {}; // Pueblos por distrito
let currentUnits = [];

// =====================================================
// MODO DESARROLLO PARA LIVE SERVER
// =====================================================
const isDevelopment = !window.GetParentResourceName;

if (isDevelopment) {
    console.log('[DAEXV DISPATCH] Modo desarrollo activado');
    
    // Simular apertura automática después de cargar
    setTimeout(() => {
        openDispatch({
            isAdmin: true,
            districts: [
                'Mando',
                'Esperando Asignacion',
                'New Hanover',
                'West Elizabeth',
                'Ambarino',
                'Lemoyne',
                'Nuevo Paraíso'
            ],
            statuses: [
                'Disponible',
                'Ocupado',
                'Fuera de servicio',
                'Patrullando',
                'En traslado'
            ],
            towns: {
                'New Hanover': ['Valentine', 'Emerald Ranch', 'Annesburg', 'Van Horn'],
                'West Elizabeth': ['Blackwater', 'Strawberry', 'Manzanita Post'],
                'Ambarino': ['Wapiti', 'Colter'],
                'Lemoyne': ['Saint Denis', 'Rhodes', 'Lagras'],
                'Nuevo Paraíso': ['Tumbleweed', 'Armadillo', 'Chuparosa']
            }
        });
        
        // Simular unidades de prueba
        setTimeout(() => {
            updateUnitsDisplay([
                {
                    id: 1,
                    charidentifier: 1,
                    firstname: 'John',
                    lastname: 'Marston',
                    job: 'sheriff',
                    district: 'Mando',
                    assigned_town: 'Valentine',
                    status: 'Disponible',
                    last_update: new Date().toISOString()
                },
                {
                    id: 2,
                    charidentifier: 2,
                    firstname: 'Arthur',
                    lastname: 'Morgan',
                    job: 'deputy',
                    district: 'Mando',
                    assigned_town: 'Blackwater',
                    status: 'Patrullando',
                    last_update: new Date().toISOString()
                },
                {
                    id: 3,
                    charidentifier: 3,
                    firstname: 'Sadie',
                    lastname: 'Adler',
                    job: 'deputy',
                    district: 'Mando',
                    assigned_town: 'Saint Denis',
                    status: 'Ocupado',
                    last_update: new Date().toISOString()
                },
                {
                    id: 4,
                    charidentifier: 4,
                    firstname: 'Charles',
                    lastname: 'Smith',
                    job: 'marshal',
                    district: 'Lemoyne',
                    assigned_town: 'Rhodes',
                    status: 'Disponible',
                    last_update: new Date().toISOString()
                },
                {
                    id: 5,
                    charidentifier: 5,
                    firstname: 'Javier',
                    lastname: 'Escuella',
                    job: 'deputy',
                    district: 'New Hanover',
                    assigned_town: 'Annesburg',
                    status: 'En traslado',
                    last_update: new Date().toISOString()
                }
            ]);
        }, 500);
    }, 100);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

window.addEventListener('DOMContentLoaded', () => {
    // Event listeners para botones
    document.getElementById('btn-close').addEventListener('click', closeDispatch);
    document.getElementById('btn-register').addEventListener('click', registerUnit);
    document.getElementById('btn-update-status').addEventListener('click', updateOwnStatus);
    document.getElementById('btn-update-district').addEventListener('click', updateOwnDistrict);
    document.getElementById('btn-update-town').addEventListener('click', updateOwnTown);
    document.getElementById('btn-refresh').addEventListener('click', refreshUnits);
    document.getElementById('alert-ok-btn').addEventListener('click', closeAlert);
    
    // Actualizar lista de pueblos cuando cambia el distrito
    document.getElementById('personal-district').addEventListener('change', (e) => {
        updatePersonalTownSelector(e.target.value);
    });
    
    // Tecla ESC para cerrar
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            const alertModal = document.getElementById('custom-alert');
            if (!alertModal.classList.contains('hidden')) {
                closeAlert();
            } else {
                closeDispatch();
            }
        }
    });
});

// =====================================================
// COMUNICACIÓN CON LUA
// =====================================================

window.addEventListener('message', (event) => {
    const data = event.data;
    
    switch (data.action) {
        case 'openDispatch':
            openDispatch(data);
            break;
        case 'closeDispatch':
            hideDispatch();
            break;
        case 'updateUnits':
            updateUnitsDisplay(data.units);
            break;
    }
});

// =====================================================
// SISTEMA DE ALERTAS PERSONALIZADO
// =====================================================

function showAlert(message) {
    const alertModal = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    
    alertMessage.textContent = message;
    alertModal.classList.remove('hidden');
    
    // Focus en el botón OK
    setTimeout(() => {
        document.getElementById('alert-ok-btn').focus();
    }, 100);
}

function closeAlert() {
    const alertModal = document.getElementById('custom-alert');
    alertModal.classList.add('hidden');
}

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

function openDispatch(data) {
    isAdmin = data.isAdmin || false;
    districts = data.districts || [];
    statuses = data.statuses || [];
    towns = data.towns || {};
    
    // Initialize ODE system
    if (data.odeConfig) {
        initODE(data.odeConfig);
    }
    
    // Mostrar indicador de admin
    const adminIndicator = document.getElementById('admin-indicator');
    if (isAdmin) {
        adminIndicator.classList.remove('hidden', 'fade-out');
        
        // Ocultar después de 10 segundos con animación
        setTimeout(() => {
            adminIndicator.classList.add('fade-out');
            
            // Ocultar completamente después de la animación
            setTimeout(() => {
                adminIndicator.classList.add('hidden');
            }, 500);
        }, 10000);
    } else {
        adminIndicator.classList.add('hidden');
    }
    
    // Show/hide ODE access button based on admin status
    const odeAccessPanel = document.querySelector('.ode-access-panel');
    if (odeAccessPanel) {
        if (isAdmin) {
            odeAccessPanel.style.display = 'block';
        } else {
            odeAccessPanel.style.display = 'none';
        }
    }
    
    // Poblar selectores
    populateSelects();
    
    // Mostrar panel
    document.getElementById('dispatch-container').classList.remove('hidden');
}

function hideDispatch() {
    document.getElementById('dispatch-container').classList.add('hidden');
}

function closeDispatch() {
    // Ocultar panel inmediatamente
    hideDispatch();
    
    if (isDevelopment) {
        return;
    }
    
    // Notificar al cliente que se cerró
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).catch(err => {
        console.error('[DAEXV DISPATCH] Error al cerrar:', err);
    });
}

function populateSelects() {
    const districtSelect = document.getElementById('personal-district');
    const statusSelect = document.getElementById('personal-status');
    const townSelect = document.getElementById('personal-town');
    
    // Limpiar selectores
    districtSelect.innerHTML = '<option value="">Seleccionar distrito</option>';
    statusSelect.innerHTML = '<option value="">Seleccionar estado</option>';
    townSelect.innerHTML = '<option value="">Sin asignar</option>';
    
    // Poblar distritos
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
    
    // Poblar estados
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
}

function updatePersonalTownSelector(district) {
    const townSelect = document.getElementById('personal-town');
    townSelect.innerHTML = '<option value="">Sin asignar</option>';
    
    // Si está en "Mando", mostrar TODOS los pueblos de TODOS los distritos
    if (district === 'Mando') {
        // Agregar todos los pueblos organizados por distrito
        Object.keys(towns).forEach(districtName => {
            if (towns[districtName] && towns[districtName].length > 0) {
                // Crear optgroup para organizar visualmente
                const optgroup = document.createElement('optgroup');
                optgroup.label = districtName;
                
                towns[districtName].forEach(town => {
                    const option = document.createElement('option');
                    option.value = town;
                    option.textContent = town;
                    optgroup.appendChild(option);
                });
                
                townSelect.appendChild(optgroup);
            }
        });
    } else if (district && towns[district]) {
        // Para otros distritos, solo mostrar sus pueblos
        towns[district].forEach(town => {
            const option = document.createElement('option');
            option.value = town;
            option.textContent = town;
            townSelect.appendChild(option);
        });
    }
}

// =====================================================
// ACTUALIZACIÓN DE UNIDADES
// =====================================================

function updateUnitsDisplay(units) {
    currentUnits = units || [];
    
    // Actualizar hora
    const now = new Date();
    document.getElementById('last-update-time').textContent = 
        now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Agrupar unidades por distrito
    const unitsByDistrict = {};
    
    districts.forEach(district => {
        unitsByDistrict[district] = [];
    });
    
    currentUnits.forEach(unit => {
        if (unitsByDistrict[unit.district]) {
            unitsByDistrict[unit.district].push(unit);
        }
    });
    
    // Renderizar distritos
    const container = document.getElementById('districts-container');
    container.innerHTML = '';
    
    districts.forEach(district => {
        const districtCard = createDistrictCard(district, unitsByDistrict[district]);
        container.appendChild(districtCard);
    });
}

function createDistrictCard(districtName, units) {
    const card = document.createElement('div');
    card.className = 'district-card';
    
    // Header del distrito
    const header = document.createElement('div');
    header.className = 'district-header';
    
    const name = document.createElement('h3');
    name.className = 'district-name';
    name.textContent = districtName;
    
    const count = document.createElement('span');
    count.className = 'unit-count';
    count.textContent = `${units.length} ${units.length === 1 ? 'Unidad' : 'Unidades'}`;
    
    header.appendChild(name);
    header.appendChild(count);
    card.appendChild(header);
    
    // Tabla de unidades
    if (units.length > 0) {
        const table = createUnitsTable(units);
        card.appendChild(table);
    } else {
        const empty = document.createElement('div');
        empty.className = 'empty-district';
        empty.textContent = 'Sin unidades asignadas en este distrito';
        card.appendChild(empty);
    }
    
    return card;
}

function createUnitsTable(units) {
    const table = document.createElement('table');
    table.className = 'units-table';
    
    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Oficial</th>
            <th>Rango</th>
            ${isAdmin ? '<th>Pueblo</th>' : ''}
            <th>Estado</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
        </tr>
    `;
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    
    units.forEach(unit => {
        const row = document.createElement('tr');
        
        // Nombre completo
        const nameCell = document.createElement('td');
        nameCell.textContent = `${unit.firstname} ${unit.lastname}`;
        row.appendChild(nameCell);
        
        // Rango/Job
        const jobCell = document.createElement('td');
        jobCell.textContent = capitalizeFirst(unit.job);
        row.appendChild(jobCell);
        
        // Pueblo asignado (solo admin)
        if (isAdmin) {
            const townCell = document.createElement('td');
            if (unit.assigned_town) {
                const townBadge = document.createElement('span');
                townBadge.className = 'town-badge';
                townBadge.textContent = `★ ${unit.assigned_town}`;
                townBadge.title = 'Mando del pueblo';
                townCell.appendChild(townBadge);
            } else {
                townCell.textContent = '-';
            }
            row.appendChild(townCell);
        }
        
        // Estado
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${normalizeStatus(unit.status)}`;
        statusBadge.textContent = unit.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Acciones (solo admin)
        if (isAdmin) {
            const actionsCell = document.createElement('td');
            actionsCell.className = 'admin-controls';
            
            // Select de estado
            const statusSelect = document.createElement('select');
            statusSelect.innerHTML = '<option value="">Cambiar estado</option>';
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === unit.status) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
            });
            statusSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    // Usar charidentifier en lugar de id
                    updateUnit(unit.charidentifier, 'status', e.target.value);
                }
            });
            
            // Select de distrito
            const districtSelect = document.createElement('select');
            districtSelect.innerHTML = '<option value="">Cambiar distrito</option>';
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                if (district === unit.district) {
                    option.selected = true;
                }
                districtSelect.appendChild(option);
            });
            districtSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    // Usar charidentifier en lugar de id
                    updateUnit(unit.charidentifier, 'district', e.target.value);
                }
            });
            
            // Select de pueblo (solo para distritos con pueblos)
            const townSelect = document.createElement('select');
            townSelect.innerHTML = '<option value="">Asignar pueblo</option>';
            
            // Agregar opción de "Sin asignar"
            const noneOption = document.createElement('option');
            noneOption.value = 'NULL';
            noneOption.textContent = 'Sin asignar';
            if (!unit.assigned_town) {
                noneOption.selected = true;
            }
            townSelect.appendChild(noneOption);
            
            // Si está en "Mando", mostrar TODOS los pueblos de TODOS los distritos
            if (unit.district === 'Mando') {
                Object.keys(towns).forEach(districtName => {
                    if (towns[districtName] && towns[districtName].length > 0) {
                        // Crear optgroup para organizar visualmente
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = districtName;
                        
                        towns[districtName].forEach(town => {
                            const option = document.createElement('option');
                            option.value = town;
                            option.textContent = town;
                            if (town === unit.assigned_town) {
                                option.selected = true;
                            }
                            optgroup.appendChild(option);
                        });
                        
                        townSelect.appendChild(optgroup);
                    }
                });
            } else if (towns[unit.district]) {
                // Para otros distritos, solo mostrar sus pueblos
                towns[unit.district].forEach(town => {
                    const option = document.createElement('option');
                    option.value = town;
                    option.textContent = town;
                    if (town === unit.assigned_town) {
                        option.selected = true;
                    }
                    townSelect.appendChild(option);
                });
            }
            
            townSelect.addEventListener('change', (e) => {
                const value = e.target.value === 'NULL' || e.target.value === '' ? null : e.target.value;
                updateUnit(unit.charidentifier, 'assigned_town', value);
            });
            
            actionsCell.appendChild(statusSelect);
            actionsCell.appendChild(districtSelect);
            actionsCell.appendChild(townSelect);
            row.appendChild(actionsCell);
        }
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    return table;
}

// =====================================================
// ACCIONES DEL USUARIO
// =====================================================

function registerUnit() {
    const district = document.getElementById('personal-district').value;
    const status = document.getElementById('personal-status').value;
    const townValue = document.getElementById('personal-town').value;
    const town = townValue === '' ? null : townValue;
    
    if (!district || !status) {
        showAlert('Debes seleccionar un distrito y un estado');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Registrado en ${district} como ${status}${town ? ' - Mando de ' + town : ''}`);
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/registerUnit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, status, town })
    });
}

function updateOwnStatus() {
    const status = document.getElementById('personal-status').value;
    
    if (!status) {
        showAlert('Debes seleccionar un estado');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Estado actualizado a: ${status}`);
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/updateOwnStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
}

function updateOwnDistrict() {
    const district = document.getElementById('personal-district').value;
    
    if (!district) {
        showAlert('Debes seleccionar un distrito');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Distrito actualizado a: ${district}`);
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/updateOwnDistrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district })
    });
}

function updateOwnTown() {
    const townValue = document.getElementById('personal-town').value;
    const town = townValue === '' ? null : townValue;
    
    if (isDevelopment) {
        showAlert(`Pueblo actualizado a: ${town || 'Sin asignar'}`);
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/updateOwnTown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ town })
    });
}

function updateUnit(unitId, field, value) {
    if (isDevelopment) {
        showAlert(`Unidad actualizada: ${field} = ${value}`);
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/updateUnit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, field, value })
    });
}

function refreshUnits() {
    if (isDevelopment) {
        showAlert('Unidades actualizadas');
        return;
    }
    
    fetch(`https://${GetParentResourceName()}/refreshUnits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

// =====================================================
// UTILIDADES
// =====================================================

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeStatus(status) {
    const normalized = status.toLowerCase()
        .replace(/\s+/g, '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    
    if (normalized.includes('disponible')) return 'disponible';
    if (normalized.includes('ocupado')) return 'ocupado';
    if (normalized.includes('fuera')) return 'fuera';
    if (normalized.includes('patrullando')) return 'patrullando';
    if (normalized.includes('traslado')) return 'traslado';
    
    return 'fuera';
}

// =====================================================
// ODE SYSTEM (Officer Development & Evaluation)
// =====================================================

let odeConfig = null;
let currentEvaluationId = null;
let currentEvaluatedOfficer = null;
let officersList = [];
let evaluationChecks = {};

// Initialize ODE when dispatch opens
function initODE(config) {
    odeConfig = config;
    console.log('[ODE] Sistema ODE inicializado', config);
}

// Show/Hide ODE System
function showODE() {
    document.getElementById('dispatch-container').classList.add('hidden');
    document.getElementById('ode-container').classList.remove('hidden');
    
    // Request officers list
    fetch('https://daexv_dispatch/ode_getOfficersList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).catch(() => {});
    
    // Show officers list panel by default
    showODEPanel('list');
}

function hideODE() {
    document.getElementById('ode-container').classList.add('hidden');
    document.getElementById('dispatch-container').classList.remove('hidden');
}

// Navigation between ODE panels
function showODEPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.ode-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.ode-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
    if (panelName === 'list') {
        document.getElementById('ode-panel-list').classList.remove('hidden');
        document.getElementById('ode-nav-list').classList.add('active');
    } else if (panelName === 'create') {
        document.getElementById('ode-panel-create').classList.remove('hidden');
        document.getElementById('ode-nav-create').classList.add('active');
        populateOfficerSelect();
    } else if (panelName === 'evaluations') {
        document.getElementById('ode-panel-evaluations').classList.remove('hidden');
        document.getElementById('ode-nav-evaluations').classList.add('active');
    } else if (panelName === 'evaluation') {
        document.getElementById('ode-panel-evaluation').classList.remove('hidden');
    }
}

// Display officers list
function displayOfficersList(officers) {
    officersList = officers;
    const container = document.getElementById('officers-list-container');
    container.innerHTML = '';
    
    if (officers.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No hay oficiales registrados en el sistema.</p>';
        return;
    }
    
    officers.forEach(officer => {
        const card = document.createElement('div');
        card.className = 'officer-card';
        card.onclick = () => selectOfficerForEvaluation(officer);
        
        card.innerHTML = `
            <div class="officer-card-name">${officer.firstname} ${officer.lastname}</div>
            <div class="officer-card-rank">${officer.jobname}</div>
        `;
        
        container.appendChild(card);
    });
}

// Populate officer select dropdown
function populateOfficerSelect() {
    const select = document.getElementById('eval-officer-select');
    select.innerHTML = '<option value="">-- Seleccionar Oficial --</option>';
    
    officersList.forEach(officer => {
        const option = document.createElement('option');
        option.value = officer.charidentifier;
        option.textContent = `${officer.firstname} ${officer.lastname} (${officer.jobname})`;
        option.dataset.name = `${officer.firstname} ${officer.lastname}`;
        select.appendChild(option);
    });
}

// Select officer for evaluation
function selectOfficerForEvaluation(officer) {
    currentEvaluatedOfficer = officer;
    
    // Create new evaluation
    fetch('https://daexv_dispatch/ode_createEvaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            officerId: officer.charidentifier,
            officerName: `${officer.firstname} ${officer.lastname}`
        })
    }).catch(() => {});
}

// Start evaluation from form
function startEvaluation() {
    const select = document.getElementById('eval-officer-select');
    const officerId = select.value;
    const officerName = select.options[select.selectedIndex]?.dataset.name;
    
    if (!officerId || !officerName) {
        showAlert('Por favor seleccione un oficial para evaluar.');
        return;
    }
    
    // Find officer in list
    const officer = officersList.find(o => o.charidentifier == officerId);
    if (officer) {
        selectOfficerForEvaluation(officer);
    }
}

// Build evaluation form
function buildEvaluationForm(evaluationId) {
    currentEvaluationId = evaluationId;
    evaluationChecks = {};
    
    const container = document.getElementById('evaluation-categories-container');
    container.innerHTML = '';
    
    if (!odeConfig || !odeConfig.Categories) {
        console.error('[ODE] No hay configuración de categorías');
        return;
    }
    
    // Set header info
    document.getElementById('eval-officer-name').textContent = 
        currentEvaluatedOfficer ? `${currentEvaluatedOfficer.firstname} ${currentEvaluatedOfficer.lastname}` : 'Oficial';
    document.getElementById('eval-date').textContent = 
        `Fecha de Evaluación: ${new Date().toLocaleString('es-ES')}`;
    
    // Build categories
    odeConfig.Categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = category.name;
        section.appendChild(title);
        
        category.items.forEach(item => {
            const checkItem = createCheckItem(category.name, item);
            section.appendChild(checkItem);
        });
        
        container.appendChild(section);
    });
    
    // Show evaluation panel
    showODEPanel('evaluation');
}

// Create check item with buttons
function createCheckItem(category, itemText) {
    const div = document.createElement('div');
    div.className = 'check-item';
    
    const text = document.createElement('div');
    text.className = 'check-item-text';
    text.textContent = itemText;
    
    const buttons = document.createElement('div');
    buttons.className = 'check-buttons';
    
    // Positive button
    const positiveBtn = document.createElement('button');
    positiveBtn.className = 'check-btn check-btn-positive';
    positiveBtn.textContent = '✓ Positivo';
    positiveBtn.onclick = () => saveCheck(category, itemText, 'positive', positiveBtn);
    
    // Negative button
    const negativeBtn = document.createElement('button');
    negativeBtn.className = 'check-btn check-btn-negative';
    negativeBtn.textContent = '✗ Negativo';
    negativeBtn.onclick = () => saveCheck(category, itemText, 'negative', negativeBtn);
    
    // Observed button
    const observedBtn = document.createElement('button');
    observedBtn.className = 'check-btn check-btn-observed';
    observedBtn.textContent = '◉ Observado';
    observedBtn.onclick = () => saveCheck(category, itemText, 'observed', observedBtn);
    
    buttons.appendChild(positiveBtn);
    buttons.appendChild(negativeBtn);
    buttons.appendChild(observedBtn);
    
    div.appendChild(text);
    div.appendChild(buttons);
    
    return div;
}

// Save individual check
function saveCheck(category, itemText, value, button) {
    if (!currentEvaluationId) {
        console.error('[ODE] No hay evaluación activa');
        return;
    }
    
    // Store check locally
    const checkKey = `${category}:${itemText}`;
    evaluationChecks[checkKey] = value;
    
    // Update button states
    const checkItem = button.closest('.check-item');
    checkItem.querySelectorAll('.check-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Save to server
    fetch('https://daexv_dispatch/ode_saveCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluationId: currentEvaluationId,
            category: category,
            checkItem: itemText,
            checkValue: value,
            notes: ''
        })
    }).catch(() => {});
    
    console.log(`[ODE] Check guardado: ${category} - ${itemText} = ${value}`);
}

// Save evaluation notes
function saveEvaluationNotes() {
    if (!currentEvaluationId) {
        console.error('[ODE] No hay evaluación activa');
        return;
    }
    
    const notes = document.getElementById('eval-notes').value;
    
    fetch('https://daexv_dispatch/ode_updateNotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluationId: currentEvaluationId,
            notes: notes
        })
    }).catch(() => {});
    
    showAlert('Notas guardadas correctamente.');
}

// Complete evaluation
function completeEvaluation() {
    if (!currentEvaluationId) {
        console.error('[ODE] No hay evaluación activa');
        return;
    }
    
    fetch('https://daexv_dispatch/ode_completeEvaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evaluationId: currentEvaluationId
        })
    }).catch(() => {});
    
    showAlert('Evaluación completada exitosamente.');
    
    // Reset state
    currentEvaluationId = null;
    currentEvaluatedOfficer = null;
    evaluationChecks = {};
    
    // Go back to list
    setTimeout(() => {
        showODEPanel('list');
    }, 1500);
}

// Cancel evaluation
function cancelEvaluation() {
    if (confirm('¿Está seguro que desea cancelar esta evaluación? Los cambios guardados se mantendrán.')) {
        currentEvaluationId = null;
        currentEvaluatedOfficer = null;
        evaluationChecks = {};
        showODEPanel('list');
    }
}

// Event listeners for ODE
document.addEventListener('DOMContentLoaded', () => {
    // ODE Access Button
    const odeBtn = document.getElementById('btn-ode');
    if (odeBtn) {
        odeBtn.addEventListener('click', showODE);
    }
    
    // Back to dispatch button
    const odeBackBtn = document.getElementById('btn-ode-back');
    if (odeBackBtn) {
        odeBackBtn.addEventListener('click', hideODE);
    }
    
    // ODE Navigation
    const navList = document.getElementById('ode-nav-list');
    if (navList) {
        navList.addEventListener('click', () => showODEPanel('list'));
    }
    
    const navCreate = document.getElementById('ode-nav-create');
    if (navCreate) {
        navCreate.addEventListener('click', () => showODEPanel('create'));
    }
    
    const navEvaluations = document.getElementById('ode-nav-evaluations');
    if (navEvaluations) {
        navEvaluations.addEventListener('click', () => showODEPanel('evaluations'));
    }
    
    // Start evaluation button
    const startEvalBtn = document.getElementById('btn-start-evaluation');
    if (startEvalBtn) {
        startEvalBtn.addEventListener('click', startEvaluation);
    }
    
    // Save notes button
    const saveNotesBtn = document.getElementById('btn-save-notes');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveEvaluationNotes);
    }
    
    // Complete evaluation button
    const completeBtn = document.getElementById('btn-complete-evaluation');
    if (completeBtn) {
        completeBtn.addEventListener('click', completeEvaluation);
    }
    
    // Cancel evaluation button
    const cancelBtn = document.getElementById('btn-cancel-evaluation');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEvaluation);
    }
});

// Handle ODE messages from client
window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.action === 'ode_evaluationCreated') {
        console.log('[ODE] Evaluación creada con ID:', data.evaluationId);
        buildEvaluationForm(data.evaluationId);
    } else if (data.action === 'ode_receiveOfficersList') {
        console.log('[ODE] Lista de oficiales recibida:', data.officers);
        displayOfficersList(data.officers);
    } else if (data.action === 'ode_checkSaved') {
        console.log('[ODE] Check guardado:', data.success);
        // Visual feedback is already handled in saveCheck function
    } else if (data.action === 'ode_notesUpdated') {
        console.log('[ODE] Notas actualizadas:', data.success);
    } else if (data.action === 'ode_evaluationCompleted') {
        console.log('[ODE] Evaluación completada:', data.success);
    }
});
