// =====================================================
// JAVASCRIPT - SISTEMA DE DISPATCH MANUAL 1899
// Solo funciones del Dispatch - ODE está en ode_system.js
// =====================================================

let isAdmin = false;
let districts = [];
let statuses = [];
let towns = {};
let currentUnits = [];

// =====================================================
// FUNCIÓN AUXILIAR PARA OBTENER NOMBRE DEL RECURSO
// =====================================================
function getResourceName() {
    try {
        if (typeof GetParentResourceName === 'function') {
            return GetParentResourceName();
        }
    } catch (e) {
        console.warn('[DISPATCH] GetParentResourceName no disponible');
    }
    return 'daexv_dispatch';
}

// =====================================================
// MODO DESARROLLO
// =====================================================
const isDevelopment = !window.GetParentResourceName;

if (isDevelopment) {
    console.log('[DAEXV DISPATCH] Modo desarrollo activado');
    
    setTimeout(() => {
        openDispatch({
            isAdmin: true,
            districts: ['Mando', 'Esperando Asignacion', 'New Hanover', 'West Elizabeth', 'Lemoyne'],
            statuses: ['Disponible', 'Ocupado', 'Fuera de servicio', 'Patrullando', 'En traslado'],
            towns: {
                'New Hanover': ['Valentine'],
                'West Elizabeth': ['Blackwater', 'Strawberry'],
                'Lemoyne': ['Saint Denis', 'Rhodes'],
            }
        });
        
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
                }
            ]);
        }, 500);
    }, 100);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
    const btnClose = document.getElementById('btn-close');
    const btnRegister = document.getElementById('btn-register');
    const btnEndService = document.getElementById('btn-end-service');
    const btnUpdateStatus = document.getElementById('btn-update-status');
    const btnUpdateDistrict = document.getElementById('btn-update-district');
    const btnUpdateTown = document.getElementById('btn-update-town');
    const btnRefresh = document.getElementById('btn-refresh');
    const alertOkBtn = document.getElementById('alert-ok-btn');
    const personalDistrict = document.getElementById('personal-district');

    if (btnClose) btnClose.addEventListener('click', closeDispatch);
    if (btnRegister) btnRegister.addEventListener('click', registerUnit);
    if (btnEndService) btnEndService.addEventListener('click', endService);
    if (btnUpdateStatus) btnUpdateStatus.addEventListener('click', updateOwnStatus);
    if (btnUpdateDistrict) btnUpdateDistrict.addEventListener('click', updateOwnDistrict);
    if (btnUpdateTown) btnUpdateTown.addEventListener('click', updateOwnTown);
    if (btnRefresh) btnRefresh.addEventListener('click', refreshUnits);
    if (alertOkBtn) alertOkBtn.addEventListener('click', closeAlert);
    
    if (personalDistrict) {
        personalDistrict.addEventListener('change', (e) => {
            updatePersonalTownSelector(e.target.value);
        });
    }
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            // Prioridad 1: Cerrar alerta custom
            const alertModal = document.getElementById('custom-alert');
            if (alertModal && !alertModal.classList.contains('hidden')) {
                closeAlert();
                return;
            }
            
            // Prioridad 2: Cerrar modal de confirmación
            const confirmModal = document.getElementById('confirm-modal');
            if (confirmModal && !confirmModal.classList.contains('hidden')) {
                confirmModal.classList.add('hidden');
                return;
            }
            
            // Prioridad 3: El ODE maneja su propio ESC (ode_system.js)
            // Si ODE está abierto, no cerramos dispatch aquí
            const odeModal = document.getElementById('ode-system-modal');
            if (odeModal && !odeModal.classList.contains('hidden')) {
                return; // ODE maneja su propio cierre
            }
            
            // Prioridad 4: Cerrar avisos si está abierto
            const avisosModal = document.getElementById('avisos-system-modal');
            if (avisosModal && !avisosModal.classList.contains('hidden')) {
                avisosModal.classList.add('hidden');
                avisosModal.classList.remove('fade-in');
                return;
            }
            
            // Prioridad 5: Cerrar dispatch
            closeDispatch();
        }
    });

    console.log('[DISPATCH] Script principal cargado v2.0 Limpio');
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
        case 'loadConfig':
            loadConfiguration(data);
            break;
        case 'showAlert':
            showAlert(data.message);
            break;
    }
});

// =====================================================
// SISTEMA DE ALERTAS
// =====================================================
function showAlert(message) {
    const alertModal = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    
    if (alertModal && alertMessage) {
        alertMessage.textContent = message;
        alertModal.classList.remove('hidden');
        
        setTimeout(() => {
            const okBtn = document.getElementById('alert-ok-btn');
            if (okBtn) okBtn.focus();
        }, 100);
    }
}

function closeAlert() {
    const alertModal = document.getElementById('custom-alert');
    if (alertModal) {
        alertModal.classList.add('hidden');
    }
}

// =====================================================
// FUNCIONES PRINCIPALES DISPATCH
// =====================================================
function loadConfiguration(data) {
    console.log('[DISPATCH] Cargando configuración...', data);
    
    isAdmin = data.isAdmin || false;
    districts = data.districts || [];
    statuses = data.statuses || [];
    towns = data.towns || {};
}

function openDispatch(data) {
    if (data) {
        loadConfiguration(data);
    }
    
    isAdmin = isAdmin || (data && data.isAdmin) || false;
    districts = districts.length > 0 ? districts : (data && data.districts) || [];
    statuses = statuses.length > 0 ? statuses : (data && data.statuses) || [];
    towns = Object.keys(towns).length > 0 ? towns : (data && data.towns) || {};
    
    const adminIndicator = document.getElementById('admin-indicator');
    const quickNav = document.getElementById('dispatch-quick-nav');
    
    if (adminIndicator && quickNav) {
        if (isAdmin) {
            adminIndicator.classList.remove('hidden', 'fade-out');
            quickNav.classList.add('hidden');
            
            setTimeout(() => {
                adminIndicator.classList.add('fade-out');
                
                setTimeout(() => {
                    adminIndicator.classList.add('hidden');
                    quickNav.classList.remove('hidden');
                    quickNav.classList.add('fade-in');
                }, 500);
            }, 4000);
        } else {
            adminIndicator.classList.add('hidden');
            quickNav.classList.remove('hidden');
            quickNav.classList.add('fade-in');
        }
    }
    
    populateSelects();
    
    const dispatchWrapper = document.getElementById('dispatch-wrapper');
    if (dispatchWrapper) {
        dispatchWrapper.classList.remove('hidden');
    }
}

function hideDispatch() {
    const dispatchWrapper = document.getElementById('dispatch-wrapper');
    if (dispatchWrapper) {
        dispatchWrapper.classList.add('hidden');
    }
}

function closeDispatch() {
    // Primero cerrar cualquier modal ODE que esté abierto
    const odeModal = document.getElementById('ode-system-modal');
    if (odeModal && !odeModal.classList.contains('hidden')) {
        odeModal.classList.add('hidden');
        odeModal.classList.remove('fade-in');
    }
    
    // Cerrar modal de curriculum si está abierto
    const modalCurriculum = document.getElementById('modal-curriculum');
    if (modalCurriculum && !modalCurriculum.classList.contains('hidden')) {
        modalCurriculum.classList.add('hidden');
        modalCurriculum.classList.remove('fade-in');
    }
    
    // Cerrar modal de avisos si está abierto
    const avisosModal = document.getElementById('avisos-system-modal');
    if (avisosModal && !avisosModal.classList.contains('hidden')) {
        avisosModal.classList.add('hidden');
        avisosModal.classList.remove('fade-in');
    }
    
    hideDispatch();
    
    if (isDevelopment) {
        return;
    }
    
    fetch(`https://${getResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).catch(err => {
        console.error('[DISPATCH] Error al cerrar:', err);
    });
}

function populateSelects() {
    const districtSelect = document.getElementById('personal-district');
    const statusSelect = document.getElementById('personal-status');
    const townSelect = document.getElementById('personal-town');
    
    if (districtSelect) {
        districtSelect.innerHTML = '<option value="">Seleccionar distrito</option>';
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
    
    if (statusSelect) {
        statusSelect.innerHTML = '<option value="">Seleccionar estado</option>';
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
    }
    
    if (townSelect) {
        townSelect.innerHTML = '<option value="">Sin asignar</option>';
    }
}

function updatePersonalTownSelector(district) {
    const townSelect = document.getElementById('personal-town');
    if (!townSelect) return;
    
    townSelect.innerHTML = '<option value="">Sin asignar</option>';
    
    if (district === 'Mando') {
        Object.keys(towns).forEach(districtName => {
            if (towns[districtName] && towns[districtName].length > 0) {
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
    
    const now = new Date();
    const lastUpdateTime = document.getElementById('last-update-time');
    if (lastUpdateTime) {
        lastUpdateTime.textContent = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
    
    const unitsByDistrict = {};
    
    districts.forEach(district => {
        unitsByDistrict[district] = {
            total: [],
            byTown: {}
        };
        
        if (towns[district]) {
            towns[district].forEach(town => {
                unitsByDistrict[district].byTown[town] = [];
            });
        }
    });
    
    currentUnits.forEach(unit => {
        if (unitsByDistrict[unit.district]) {
            unitsByDistrict[unit.district].total.push(unit);
            
            if (unit.assigned_town && unitsByDistrict[unit.district].byTown[unit.assigned_town]) {
                unitsByDistrict[unit.district].byTown[unit.assigned_town].push(unit);
            }
        }
    });
    
    const container = document.getElementById('districts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    districts.forEach(district => {
        const districtCard = createDistrictCardWithTowns(district, unitsByDistrict[district]);
        container.appendChild(districtCard);
    });
}

function createDistrictCardWithTowns(districtName, districtData) {
    const card = document.createElement('div');
    card.className = 'district-card';
    
    const units = districtData.total;
    const townGroups = districtData.byTown;
    
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
    
    const hasTowns = towns[districtName] && towns[districtName].length > 0;
    
    if (units.length > 0) {
        if (hasTowns) {
            const townsContainer = document.createElement('div');
            townsContainer.className = 'towns-container';
            
            towns[districtName].forEach(townName => {
                const townUnits = townGroups[townName] || [];
                const townSection = createTownSection(townName, townUnits, districtName);
                townsContainer.appendChild(townSection);
            });
            
            const unassignedUnits = units.filter(u => !u.assigned_town || !townGroups[u.assigned_town]);
            if (unassignedUnits.length > 0) {
                const unassignedSection = createTownSection('Sin Pueblo Asignado', unassignedUnits, districtName);
                unassignedSection.classList.add('unassigned-town');
                townsContainer.appendChild(unassignedSection);
            }
            
            card.appendChild(townsContainer);
        } else {
            const table = createUnitsTable(units);
            card.appendChild(table);
        }
    } else {
        const empty = document.createElement('div');
        empty.className = 'empty-district';
        empty.textContent = 'Sin unidades asignadas en este distrito';
        card.appendChild(empty);
    }
    
    return card;
}

function createTownSection(townName, units, districtName) {
    const section = document.createElement('div');
    section.className = 'town-section';
    
    const townHeader = document.createElement('div');
    townHeader.className = 'town-header';
    
    const townTitle = document.createElement('h4');
    townTitle.className = 'town-name';
    townTitle.innerHTML = `<span class="town-icon">���</span> ${townName}`;
    
    const townCount = document.createElement('span');
    townCount.className = 'town-unit-count';
    townCount.textContent = `${units.length} ${units.length === 1 ? 'oficial' : 'oficiales'}`;
    
    townHeader.appendChild(townTitle);
    townHeader.appendChild(townCount);
    section.appendChild(townHeader);
    
    if (units.length > 0) {
        const table = createUnitsTable(units);
        section.appendChild(table);
    } else {
        const empty = document.createElement('div');
        empty.className = 'empty-town';
        empty.textContent = `No hay oficiales asignados a ${townName}`;
        section.appendChild(empty);
    }
    
    return section;
}

function createUnitsTable(units) {
    const table = document.createElement('table');
    table.className = 'units-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Oficial</th>
            <th>Rango</th>
            <th>Pueblo</th>
            <th>Estado</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    units.forEach(unit => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = `${unit.firstname} ${unit.lastname}`;
        row.appendChild(nameCell);
        
        const jobCell = document.createElement('td');
        jobCell.textContent = capitalizeFirst(unit.job || 'Sin rango');
        row.appendChild(jobCell);
        
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
        
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${normalizeStatus(unit.status)}`;
        statusBadge.textContent = unit.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        if (isAdmin) {
            const actionsCell = document.createElement('td');
            actionsCell.className = 'admin-controls';
            
            const statusSelect = document.createElement('select');
            statusSelect.innerHTML = '<option value="">Cambiar estado</option>';
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === unit.status) option.selected = true;
                statusSelect.appendChild(option);
            });
            statusSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    updateUnit(unit.charidentifier, 'status', e.target.value);
                }
            });
            
            const districtSelect = document.createElement('select');
            districtSelect.innerHTML = '<option value="">Cambiar distrito</option>';
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                if (district === unit.district) option.selected = true;
                districtSelect.appendChild(option);
            });
            districtSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    updateUnit(unit.charidentifier, 'district', e.target.value);
                }
            });
            
            actionsCell.appendChild(statusSelect);
            actionsCell.appendChild(districtSelect);
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
    const district = document.getElementById('personal-district')?.value;
    const status = document.getElementById('personal-status')?.value;
    const townValue = document.getElementById('personal-town')?.value;
    const town = townValue === '' ? null : townValue;
    
    if (!district || !status) {
        showAlert('Debes seleccionar un distrito y un estado');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Registrado en ${district} como ${status}${town ? ' - Mando de ' + town : ''}`);
        return;
    }
    
    fetch(`https://${getResourceName()}/registerUnit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, status, town })
    });
}

// =====================================================
// MODAL DE CONFIRMACIÓN
// =====================================================

function showConfirm(message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const btnYes = document.getElementById('confirm-yes-btn');
    const btnNo = document.getElementById('confirm-no-btn');
    
    if (!modal) return;
    
    if (messageEl) messageEl.textContent = message;
    modal.classList.remove('hidden');
    
    // Limpiar listeners anteriores
    const newBtnYes = btnYes.cloneNode(true);
    const newBtnNo = btnNo.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);
    btnNo.parentNode.replaceChild(newBtnNo, btnNo);
    
    newBtnYes.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    });
    
    newBtnNo.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

function endService() {
    showConfirm('¿Estás seguro de que deseas salir de servicio?', () => {
        if (isDevelopment) {
            showAlert('Has salido de servicio correctamente.');
            return;
        }
        
        console.log('[DISPATCH] Enviando solicitud de salir de servicio...');
        
        fetch(`https://${getResourceName()}/endService`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        .then(() => {
            console.log('[DISPATCH] Salida de servicio exitosa');
            showAlert('Has salido de servicio correctamente.');
        })
        .catch(err => {
            console.log('[DISPATCH] Error:', err);
        });
    });
}

function updateOwnStatus() {
    const status = document.getElementById('personal-status')?.value;
    
    if (!status) {
        showAlert('Debes seleccionar un estado');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Estado actualizado a: ${status}`);
        return;
    }
    
    fetch(`https://${getResourceName()}/updateOwnStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
}

function updateOwnDistrict() {
    const district = document.getElementById('personal-district')?.value;
    
    if (!district) {
        showAlert('Debes seleccionar un distrito');
        return;
    }
    
    if (isDevelopment) {
        showAlert(`Distrito actualizado a: ${district}`);
        return;
    }
    
    fetch(`https://${getResourceName()}/updateOwnDistrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district })
    });
}

function updateOwnTown() {
    const townValue = document.getElementById('personal-town')?.value;
    const town = townValue === '' ? null : townValue;
    
    if (isDevelopment) {
        showAlert(`Pueblo actualizado a: ${town || 'Sin asignar'}`);
        return;
    }
    
    fetch(`https://${getResourceName()}/updateOwnTown`, {
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
    
    fetch(`https://${getResourceName()}/updateUnit`, {
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
    
    fetch(`https://${getResourceName()}/refreshUnits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

// =====================================================
// UTILIDADES
// =====================================================
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeStatus(status) {
    if (!status) return 'fuera';
    
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

console.log('[DAEXV DISPATCH] Script principal cargado v2.0 - Limpio');
