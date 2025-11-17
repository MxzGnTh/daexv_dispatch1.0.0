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
