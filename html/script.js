// =====================================================
// DISPATCH & ODE SYSTEM - VORP/REDM
// Modular, Production-Ready JavaScript
// =====================================================

// =====================================================
// STATE MANAGEMENT
// =====================================================
const AppState = {
    dispatch: {
        isOpen: false,
        isAdmin: false,
        districts: [],
        statuses: [],
        towns: {},
        units: []
    },
    ode: {
        config: null,
        currentEvaluationId: null,
        currentOfficer: null,
        officers: [],
        checks: {},
        score: { total: 0, max: 0, percentage: 0 },
        stats: null
    }
};

// =====================================================
// CONFIGURATION
// =====================================================
const Config = {
    isDevelopment: !window.GetParentResourceName,
    resourceName: 'daexv_dispatch',
    endpoints: {
        dispatch: {
            refreshUnits: 'refreshUnits',
            registerUnit: 'registerUnit',
            updateOwnStatus: 'updateOwnStatus',
            updateOwnDistrict: 'updateOwnDistrict',
            updateOwnTown: 'updateOwnTown',
            updateUnit: 'updateUnit',
            closeDispatch: 'closeDispatch'
        },
        ode: {
            createEvaluation: 'ode_createEvaluation',
            getOfficersList: 'ode_getOfficersList',
            saveCheck: 'ode_saveCheck',
            updateNotes: 'ode_updateNotes',
            completeEvaluation: 'ode_completeEvaluation',
            getStats: 'ode_getStats'
        }
    }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const Utils = {
    /**
     * Safe logging with prefix
     */
    log: (message, ...args) => {
        console.log(`[DAEXV DISPATCH]`, message, ...args);
    },

    /**
     * Error logging
     */
    error: (message, ...args) => {
        console.error(`[DAEXV DISPATCH ERROR]`, message, ...args);
    },

    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Normalize status string
     */
    normalizeStatus: (status) => {
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
    },

    /**
     * Format date to locale string
     */
    formatDate: (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch (e) {
            return 'N/A';
        }
    },

    /**
     * Get performance color based on level
     */
    getPerformanceColor: (level) => {
        const colors = {
            'Excelente': '#4caf50',
            'Bueno': '#8bc34a',
            'Satisfactorio': '#ffc107',
            'Necesita Mejorar': '#ff9800',
            'Insuficiente': '#f44336'
        };
        return colors[level] || '#999';
    },

    /**
     * Sanitize input to prevent XSS
     */
    sanitize: (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validate input is not empty
     */
    validateNotEmpty: (value, fieldName) => {
        if (!value || value.trim() === '') {
            UI.showAlert(`El campo "${fieldName}" no puede estar vacío.`);
            return false;
        }
        return true;
    }
};

// =====================================================
// API COMMUNICATION
// =====================================================
const API = {
    /**
     * Generic fetch wrapper with error handling
     */
    async call(endpoint, data = {}) {
        if (Config.isDevelopment) {
            Utils.log('Development mode - API call to:', endpoint, data);
            return Promise.resolve({ success: true });
        }

        try {
            const resourceName = GetParentResourceName ? GetParentResourceName() : Config.resourceName;
            const response = await fetch(`https://${resourceName}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            Utils.error(`API call failed for ${endpoint}:`, error);
            UI.showAlert(`Error de comunicación con el servidor. Por favor, intente nuevamente.`);
            throw error;
        }
    },

    /**
     * Dispatch API calls
     */
    dispatch: {
        refreshUnits: () => API.call(Config.endpoints.dispatch.refreshUnits),
        registerUnit: (district, status, town) => API.call(Config.endpoints.dispatch.registerUnit, { district, status, town }),
        updateStatus: (status) => API.call(Config.endpoints.dispatch.updateOwnStatus, { status }),
        updateDistrict: (district) => API.call(Config.endpoints.dispatch.updateOwnDistrict, { district }),
        updateTown: (town) => API.call(Config.endpoints.dispatch.updateOwnTown, { town }),
        updateUnit: (unitId, field, value) => API.call(Config.endpoints.dispatch.updateUnit, { unitId, field, value }),
        close: () => API.call(Config.endpoints.dispatch.closeDispatch)
    },

    /**
     * ODE API calls
     */
    ode: {
        createEvaluation: (officerId, officerName) => API.call(Config.endpoints.ode.createEvaluation, { officerId, officerName }),
        getOfficers: () => API.call(Config.endpoints.ode.getOfficersList),
        saveCheck: (evaluationId, category, checkItem, checkValue, notes = '') => 
            API.call(Config.endpoints.ode.saveCheck, { evaluationId, category, checkItem, checkValue, notes }),
        updateNotes: (evaluationId, notes) => API.call(Config.endpoints.ode.updateNotes, { evaluationId, notes }),
        complete: (evaluationId) => API.call(Config.endpoints.ode.completeEvaluation, { evaluationId }),
        getStats: () => API.call(Config.endpoints.ode.getStats)
    }
};

// =====================================================
// UI COMPONENTS
// =====================================================
const UI = {
    /**
     * Show custom alert modal
     */
    showAlert(message) {
        const alertModal = document.getElementById('custom-alert');
        const alertMessage = document.getElementById('alert-message');
        
        if (!alertModal || !alertMessage) {
            console.warn('Alert modal not found');
            return;
        }

        alertMessage.textContent = Utils.sanitize(message);
        alertModal.classList.remove('hidden');
        
        // Focus on OK button
        setTimeout(() => {
            const okBtn = document.getElementById('alert-ok-btn');
            if (okBtn) okBtn.focus();
        }, 100);
    },

    /**
     * Close alert modal
     */
    closeAlert() {
        const alertModal = document.getElementById('custom-alert');
        if (alertModal) {
            alertModal.classList.add('hidden');
        }
    },

    /**
     * Toggle element visibility
     */
    toggle(elementId, show) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    },

    /**
     * Add loading state to button
     */
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    },

    /**
     * Render officer cards
     */
    renderOfficerCard(officer) {
        const card = document.createElement('div');
        card.className = 'officer-card';
        card.onclick = () => ODE.selectOfficer(officer);

        const perfColor = Utils.getPerformanceColor(officer.last_performance);
        const perfBadge = officer.last_performance 
            ? `<span class="performance-badge" style="background-color: ${perfColor}">${Utils.sanitize(officer.last_performance)}</span>`
            : '';

        const lastEval = officer.last_eval_date 
            ? `Última evaluación: ${Utils.formatDate(officer.last_eval_date)}`
            : 'Sin evaluaciones';

        const avgScore = officer.avg_score !== null && officer.avg_score !== undefined
            ? `<div class="officer-card-score">Promedio: ${officer.avg_score}%</div>`
            : '';

        card.innerHTML = `
            <div class="officer-card-header">
                <div class="officer-card-name">${Utils.sanitize(officer.firstname)} ${Utils.sanitize(officer.lastname)}</div>
                ${perfBadge}
            </div>
            <div class="officer-card-rank">${Utils.sanitize(officer.jobname)}</div>
            <div class="officer-card-info">
                <span class="officer-card-district">${Utils.sanitize(officer.district || 'Sin distrito')}</span>
                <span class="officer-card-evals">${officer.eval_count || 0} evaluaciones</span>
            </div>
            ${avgScore}
            <div class="officer-card-eval">${lastEval}</div>
        `;

        return card;
    },

    /**
     * Render check item with buttons
     */
    renderCheckItem(category, itemText) {
        const div = document.createElement('div');
        div.className = 'check-item';

        const text = document.createElement('div');
        text.className = 'check-item-text';
        text.textContent = Utils.sanitize(itemText);

        const buttons = document.createElement('div');
        buttons.className = 'check-buttons';

        // Create check buttons
        const btnPositive = UI.createCheckButton('✓ Positivo', 'positive', 'check-btn-positive', () => {
            ODE.saveCheck(category, itemText, 'positive', btnPositive);
        });

        const btnNegative = UI.createCheckButton('✗ Negativo', 'negative', 'check-btn-negative', () => {
            ODE.saveCheck(category, itemText, 'negative', btnNegative);
        });

        const btnObserved = UI.createCheckButton('◉ Observado', 'observed', 'check-btn-observed', () => {
            ODE.saveCheck(category, itemText, 'observed', btnObserved);
        });

        buttons.appendChild(btnPositive);
        buttons.appendChild(btnNegative);
        buttons.appendChild(btnObserved);

        div.appendChild(text);
        div.appendChild(buttons);

        return div;
    },

    /**
     * Create check button
     */
    createCheckButton(label, value, className, onClick) {
        const btn = document.createElement('button');
        btn.className = `check-btn ${className}`;
        btn.textContent = label;
        btn.setAttribute('data-value', value);
        btn.onclick = onClick;
        btn.setAttribute('aria-label', `Marcar como ${value}`);
        return btn;
    },

    /**
     * Update score display
     */
    updateScoreDisplay() {
        const display = document.getElementById('eval-score-display');
        if (!display) return;

        const { total, max, percentage } = AppState.ode.score;

        let color = '#f44336';
        if (percentage >= 90) color = '#4caf50';
        else if (percentage >= 75) color = '#8bc34a';
        else if (percentage >= 60) color = '#ffc107';
        else if (percentage >= 40) color = '#ff9800';

        display.innerHTML = `Puntuación: <span style="color: ${color}; font-weight: bold;">${total} / ${max} (${percentage}%)</span>`;
    },

    /**
     * Update stats dashboard
     */
    updateStats(stats) {
        if (!stats) return;

        const updateStat = (id, value) => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = value;
        };

        updateStat('stat-total-evals', stats.total_evaluations || 0);
        updateStat('stat-officers-evaluated', stats.officers_evaluated || 0);
        updateStat('stat-avg-score', (stats.avg_score || 0) + '%');
        updateStat('stat-pending', stats.pending_evaluations || 0);
    }
};

// =====================================================
// DISPATCH MODULE
// =====================================================
const Dispatch = {
    /**
     * Open dispatch panel
     */
    async open(data) {
        try {
            Utils.log('Opening dispatch with data:', data);

            AppState.dispatch.isAdmin = data.isAdmin || false;
            AppState.dispatch.districts = data.districts || [];
            AppState.dispatch.statuses = data.statuses || [];
            AppState.dispatch.towns = data.towns || {};

            // Initialize ODE config if provided
            if (data.odeConfig) {
                AppState.ode.config = data.odeConfig;
                Utils.log('ODE config loaded', data.odeConfig);
            }

            // Show admin indicator
            UI.toggle('admin-indicator', AppState.dispatch.isAdmin);

            // Populate controls
            Dispatch.populateDistricts();
            Dispatch.populateStatuses();

            // Show ODE button only for admins
            UI.toggle('btn-ode', AppState.dispatch.isAdmin);

            // Show dispatch container
            UI.toggle('dispatch-container', true);
            AppState.dispatch.isOpen = true;

            // Request initial units
            await Dispatch.refreshUnits();

        } catch (error) {
            Utils.error('Error opening dispatch:', error);
        }
    },

    /**
     * Close dispatch panel
     */
    async close() {
        try {
            await API.dispatch.close();
            UI.toggle('dispatch-container', false);
            UI.toggle('ode-container', false);
            AppState.dispatch.isOpen = false;
            Utils.log('Dispatch closed');
        } catch (error) {
            Utils.error('Error closing dispatch:', error);
        }
    },

    /**
     * Populate district select
     */
    populateDistricts() {
        const select = document.getElementById('personal-district');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar distrito</option>';
        AppState.dispatch.districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = Utils.sanitize(district);
            select.appendChild(option);
        });
    },

    /**
     * Populate status select
     */
    populateStatuses() {
        const select = document.getElementById('personal-status');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar estado</option>';
        AppState.dispatch.statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = Utils.sanitize(status);
            select.appendChild(option);
        });
    },

    /**
     * Update town select based on district
     */
    updateTownSelect(district) {
        const select = document.getElementById('personal-town');
        if (!select) return;

        select.innerHTML = '<option value="">Sin asignar</option>';

        const towns = AppState.dispatch.towns[district] || [];
        towns.forEach(town => {
            const option = document.createElement('option');
            option.value = town;
            option.textContent = Utils.sanitize(town);
            select.appendChild(option);
        });
    },

    /**
     * Refresh units list
     */
    async refreshUnits() {
        try {
            if (Config.isDevelopment) {
                Utils.log('Development mode - skipping refresh');
                return;
            }
            await API.dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error refreshing units:', error);
        }
    },

    /**
     * Register unit in service
     */
    async registerUnit() {
        const district = document.getElementById('personal-district')?.value;
        const status = document.getElementById('personal-status')?.value;
        const town = document.getElementById('personal-town')?.value || '';

        if (!Utils.validateNotEmpty(district, 'Distrito')) return;
        if (!Utils.validateNotEmpty(status, 'Estado')) return;

        try {
            await API.dispatch.registerUnit(district, status, town);
            UI.showAlert('Unidad registrada correctamente.');
            await Dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error registering unit:', error);
        }
    },

    /**
     * Update own status
     */
    async updateStatus() {
        const status = document.getElementById('personal-status')?.value;
        if (!Utils.validateNotEmpty(status, 'Estado')) return;

        try {
            await API.dispatch.updateStatus(status);
            UI.showAlert('Estado actualizado correctamente.');
            await Dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error updating status:', error);
        }
    },

    /**
     * Update own district
     */
    async updateDistrict() {
        const district = document.getElementById('personal-district')?.value;
        if (!Utils.validateNotEmpty(district, 'Distrito')) return;

        try {
            await API.dispatch.updateDistrict(district);
            UI.showAlert('Distrito actualizado correctamente.');
            await Dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error updating district:', error);
        }
    },

    /**
     * Update own town
     */
    async updateTown() {
        const town = document.getElementById('personal-town')?.value;

        try {
            await API.dispatch.updateTown(town || '');
            UI.showAlert('Pueblo actualizado correctamente.');
            await Dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error updating town:', error);
        }
    },

    /**
     * Display units in UI
     */
    displayUnits(units) {
        AppState.dispatch.units = units;
        const container = document.getElementById('districts-container');
        if (!container) return;

        // Group units by district
        const grouped = {};
        units.forEach(unit => {
            const district = unit.district || 'Sin Distrito';
            if (!grouped[district]) grouped[district] = [];
            grouped[district].push(unit);
        });

        // Render districts
        container.innerHTML = '';
        AppState.dispatch.districts.forEach(district => {
            const districtUnits = grouped[district] || [];
            const card = Dispatch.renderDistrictCard(district, districtUnits);
            container.appendChild(card);
        });
    },

    /**
     * Render district card
     */
    renderDistrictCard(district, units) {
        const card = document.createElement('div');
        card.className = 'district-card';

        const header = document.createElement('div');
        header.className = 'district-header';
        header.innerHTML = `
            <h3 class="district-name">${Utils.sanitize(district)}</h3>
            <span class="unit-count">${units.length} ${units.length === 1 ? 'Unidad' : 'Unidades'}</span>
        `;

        card.appendChild(header);

        if (units.length === 0) {
            const empty = document.createElement('p');
            empty.style.textAlign = 'center';
            empty.style.padding = '20px';
            empty.style.color = 'var(--color-text-medium)';
            empty.textContent = 'Sin unidades asignadas en este distrito';
            card.appendChild(empty);
        } else {
            const table = Dispatch.renderUnitsTable(units);
            card.appendChild(table);
        }

        return card;
    },

    /**
     * Render units table
     */
    renderUnitsTable(units) {
        const table = document.createElement('table');
        table.className = 'units-table';

        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Oficial</th>
                <th>Rango</th>
                <th>Pueblo</th>
                <th>Estado</th>
                ${AppState.dispatch.isAdmin ? '<th>Acciones</th>' : ''}
            </tr>
        `;
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        units.forEach(unit => {
            const row = Dispatch.renderUnitRow(unit);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        return table;
    },

    /**
     * Render unit row
     */
    renderUnitRow(unit) {
        const row = document.createElement('tr');

        const townDisplay = unit.assigned_town 
            ? `★ ${Utils.sanitize(unit.assigned_town)}`
            : 'Sin asignar';

        let actionsHtml = '';
        if (AppState.dispatch.isAdmin) {
            actionsHtml = `
                <td>
                    <select class="western-select" onchange="Dispatch.handleUnitAction(${unit.charidentifier}, 'status', this.value)">
                        <option value="">Cambiar estado</option>
                        ${AppState.dispatch.statuses.map(s => 
                            `<option value="${s}" ${s === unit.status ? 'selected' : ''}>${s}</option>`
                        ).join('')}
                    </select>
                </td>
            `;
        }

        row.innerHTML = `
            <td>${Utils.sanitize(unit.firstname)} ${Utils.sanitize(unit.lastname)}</td>
            <td>${Utils.sanitize(unit.job)}</td>
            <td>${townDisplay}</td>
            <td>${Utils.sanitize(unit.status)}</td>
            ${actionsHtml}
        `;

        return row;
    },

    /**
     * Handle unit action (admin only)
     */
    async handleUnitAction(unitId, field, value) {
        if (!value) return;

        try {
            await API.dispatch.updateUnit(unitId, field, value);
            await Dispatch.refreshUnits();
        } catch (error) {
            Utils.error('Error updating unit:', error);
        }
    }
};

// =====================================================
// ODE MODULE
// =====================================================
const ODE = {
    /**
     * Show ODE panel
     */
    async show() {
        UI.toggle('dispatch-container', false);
        UI.toggle('ode-container', true);

        try {
            await Promise.all([
                API.ode.getOfficers(),
                API.ode.getStats()
            ]);
        } catch (error) {
            Utils.error('Error loading ODE data:', error);
        }

        ODE.showPanel('list');
    },

    /**
     * Hide ODE panel
     */
    hide() {
        UI.toggle('ode-container', false);
        UI.toggle('dispatch-container', true);
    },

    /**
     * Show specific ODE panel
     */
    showPanel(panelName) {
        // Hide all panels
        document.querySelectorAll('.ode-panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        // Remove active class from nav buttons
        document.querySelectorAll('.ode-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected panel
        const panels = {
            list: { panelId: 'ode-panel-list', navId: 'ode-nav-list' },
            create: { panelId: 'ode-panel-create', navId: 'ode-nav-create' },
            evaluations: { panelId: 'ode-panel-evaluations', navId: 'ode-nav-evaluations' },
            evaluation: { panelId: 'ode-panel-evaluation', navId: null }
        };

        const panel = panels[panelName];
        if (panel) {
            UI.toggle(panel.panelId, true);
            if (panel.navId) {
                document.getElementById(panel.navId)?.classList.add('active');
            }

            if (panelName === 'create') {
                ODE.populateOfficerSelect();
            }
        }
    },

    /**
     * Display officers list
     */
    displayOfficers(officers) {
        AppState.ode.officers = officers;
        const container = document.getElementById('officers-list-container');
        if (!container) return;

        container.innerHTML = '';

        if (officers.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">No hay oficiales registrados en el sistema.</p>';
            return;
        }

        officers.forEach(officer => {
            const card = UI.renderOfficerCard(officer);
            container.appendChild(card);
        });
    },

    /**
     * Populate officer select dropdown
     */
    populateOfficerSelect() {
        const select = document.getElementById('eval-officer-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- Seleccionar Oficial --</option>';

        AppState.ode.officers.forEach(officer => {
            const option = document.createElement('option');
            option.value = officer.charidentifier;
            option.textContent = `${Utils.sanitize(officer.firstname)} ${Utils.sanitize(officer.lastname)} (${Utils.sanitize(officer.jobname)})`;
            option.dataset.name = `${officer.firstname} ${officer.lastname}`;
            select.appendChild(option);
        });
    },

    /**
     * Select officer for evaluation
     */
    async selectOfficer(officer) {
        AppState.ode.currentOfficer = officer;

        try {
            await API.ode.createEvaluation(
                officer.charidentifier,
                `${officer.firstname} ${officer.lastname}`
            );
        } catch (error) {
            Utils.error('Error creating evaluation:', error);
        }
    },

    /**
     * Start evaluation from form
     */
    async startEvaluation() {
        const select = document.getElementById('eval-officer-select');
        if (!select) return;

        const officerId = select.value;
        const officerName = select.options[select.selectedIndex]?.dataset.name;

        if (!officerId || !officerName) {
            UI.showAlert('Por favor seleccione un oficial para evaluar.');
            return;
        }

        const officer = AppState.ode.officers.find(o => o.charidentifier == officerId);
        if (officer) {
            await ODE.selectOfficer(officer);
        }
    },

    /**
     * Build evaluation form
     */
    buildEvaluationForm(evaluationId) {
        AppState.ode.currentEvaluationId = evaluationId;
        AppState.ode.checks = {};
        
        // Calculate max score
        let totalChecks = 0;
        AppState.ode.config.Categories.forEach(cat => {
            totalChecks += cat.items.length;
        });
        
        AppState.ode.score = {
            total: 0,
            max: totalChecks * 10,
            percentage: 0
        };

        // Set header info
        const officerName = AppState.ode.currentOfficer 
            ? `${AppState.ode.currentOfficer.firstname} ${AppState.ode.currentOfficer.lastname}`
            : 'Oficial';

        const nameElem = document.getElementById('eval-officer-name');
        const dateElem = document.getElementById('eval-date');

        if (nameElem) nameElem.textContent = officerName;
        if (dateElem) {
            dateElem.innerHTML = `
                Fecha de Evaluación: ${new Date().toLocaleString('es-ES')}<br>
                <span id="eval-score-display" class="score-display">Puntuación: 0 / ${AppState.ode.score.max} (0%)</span>
            `;
        }

        // Build categories
        const container = document.getElementById('evaluation-categories-container');
        if (!container) return;

        container.innerHTML = '';

        AppState.ode.config.Categories.forEach(category => {
            const section = document.createElement('div');
            section.className = 'category-section';

            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = Utils.sanitize(category.name);
            section.appendChild(title);

            category.items.forEach(item => {
                const checkItem = UI.renderCheckItem(category.name, item);
                section.appendChild(checkItem);
            });

            container.appendChild(section);
        });

        ODE.showPanel('evaluation');
    },

    /**
     * Save individual check
     */
    async saveCheck(category, itemText, value, button) {
        if (!AppState.ode.currentEvaluationId) {
            Utils.error('No active evaluation');
            return;
        }

        // Calculate score
        const scoreValues = { positive: 10, observed: 5, negative: 0 };
        const newScore = scoreValues[value] !== undefined ? scoreValues[value] : 0;

        // Update local state
        const checkKey = `${category}:${itemText}`;
        const oldValue = AppState.ode.checks[checkKey];
        const oldScore = oldValue && scoreValues[oldValue] !== undefined ? scoreValues[oldValue] : 0;
        
        AppState.ode.checks[checkKey] = value;

        // Update score
        AppState.ode.score.total = AppState.ode.score.total - oldScore + newScore;
        AppState.ode.score.percentage = AppState.ode.score.max > 0 
            ? Math.round((AppState.ode.score.total / AppState.ode.score.max) * 100) 
            : 0;

        UI.updateScoreDisplay();

        // Update button states
        const checkItem = button.closest('.check-item');
        checkItem.querySelectorAll('.check-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Save to server
        try {
            await API.ode.saveCheck(
                AppState.ode.currentEvaluationId,
                category,
                itemText,
                value
            );
            Utils.log(`Check saved: ${category} - ${itemText} = ${value} (+${newScore} points)`);
        } catch (error) {
            Utils.error('Error saving check:', error);
        }
    },

    /**
     * Save evaluation notes
     */
    async saveNotes() {
        if (!AppState.ode.currentEvaluationId) {
            Utils.error('No active evaluation');
            return;
        }

        const notes = document.getElementById('eval-notes')?.value || '';

        try {
            await API.ode.updateNotes(AppState.ode.currentEvaluationId, notes);
            UI.showAlert('Notas guardadas correctamente.');
        } catch (error) {
            Utils.error('Error saving notes:', error);
        }
    },

    /**
     * Complete evaluation
     */
    async completeEvaluation() {
        if (!AppState.ode.currentEvaluationId) {
            Utils.error('No active evaluation');
            return;
        }

        try {
            await API.ode.complete(AppState.ode.currentEvaluationId);
            UI.showAlert('Evaluación completada exitosamente.');

            // Reset state
            AppState.ode.currentEvaluationId = null;
            AppState.ode.currentOfficer = null;
            AppState.ode.checks = {};

            // Go back to list
            setTimeout(() => {
                ODE.showPanel('list');
            }, 1500);
        } catch (error) {
            Utils.error('Error completing evaluation:', error);
        }
    },

    /**
     * Cancel evaluation
     */
    cancelEvaluation() {
        if (confirm('¿Está seguro que desea cancelar esta evaluación? Los cambios guardados se mantendrán.')) {
            AppState.ode.currentEvaluationId = null;
            AppState.ode.currentOfficer = null;
            AppState.ode.checks = {};
            ODE.showPanel('list');
        }
    }
};

// =====================================================
// EVENT HANDLERS
// =====================================================
const EventHandlers = {
    /**
     * Initialize event listeners
     */
    init() {
        // Dispatch buttons
        document.getElementById('btn-register')?.addEventListener('click', () => Dispatch.registerUnit());
        document.getElementById('btn-update-status')?.addEventListener('click', () => Dispatch.updateStatus());
        document.getElementById('btn-update-district')?.addEventListener('click', () => Dispatch.updateDistrict());
        document.getElementById('btn-update-town')?.addEventListener('click', () => Dispatch.updateTown());
        document.getElementById('btn-refresh')?.addEventListener('click', () => Dispatch.refreshUnits());
        document.getElementById('btn-close')?.addEventListener('click', () => Dispatch.close());

        // ODE buttons
        document.getElementById('btn-ode')?.addEventListener('click', () => ODE.show());
        document.getElementById('btn-ode-back')?.addEventListener('click', () => ODE.hide());

        // ODE navigation
        document.getElementById('ode-nav-list')?.addEventListener('click', () => ODE.showPanel('list'));
        document.getElementById('ode-nav-create')?.addEventListener('click', () => ODE.showPanel('create'));
        document.getElementById('ode-nav-evaluations')?.addEventListener('click', () => ODE.showPanel('evaluations'));

        // ODE actions
        document.getElementById('btn-start-evaluation')?.addEventListener('click', () => ODE.startEvaluation());
        document.getElementById('btn-save-notes')?.addEventListener('click', () => ODE.saveNotes());
        document.getElementById('btn-complete-evaluation')?.addEventListener('click', () => ODE.completeEvaluation());
        document.getElementById('btn-cancel-evaluation')?.addEventListener('click', () => ODE.cancelEvaluation());

        // Alert OK button
        document.getElementById('alert-ok-btn')?.addEventListener('click', () => UI.closeAlert());

        // District change handler
        document.getElementById('personal-district')?.addEventListener('change', (e) => {
            Dispatch.updateTownSelect(e.target.value);
        });
    },

    /**
     * Handle messages from client/server
     */
    handleMessage(event) {
        const { action, ...data } = event.data;

        const handlers = {
            // Dispatch actions
            openDispatch: () => Dispatch.open(data),
            closeDispatch: () => Dispatch.close(),
            updateUnitsDisplay: () => Dispatch.displayUnits(data.units || []),

            // ODE actions
            ode_evaluationCreated: () => ODE.buildEvaluationForm(data.evaluationId),
            ode_receiveOfficersList: () => ODE.displayOfficers(data.officers || []),
            ode_receiveStats: () => UI.updateStats(data.stats),
            ode_checkSaved: () => Utils.log('Check saved successfully'),
            ode_notesUpdated: () => Utils.log('Notes updated successfully'),
            ode_evaluationCompleted: () => Utils.log('Evaluation completed successfully')
        };

        const handler = handlers[action];
        if (handler) {
            try {
                handler();
            } catch (error) {
                Utils.error(`Error handling action ${action}:`, error);
            }
        }
    }
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    Utils.log('Dispatch system initializing...');
    EventHandlers.init();
    
    // Listen for messages
    window.addEventListener('message', EventHandlers.handleMessage);

    // Development mode simulation
    if (Config.isDevelopment) {
        Utils.log('Development mode active');
        
        setTimeout(() => {
            Dispatch.open({
                isAdmin: true,
                districts: ['Mando', 'Esperando Asignacion', 'New Hanover', 'West Elizabeth', 'Ambarino', 'Lemoyne', 'Nuevo Paraíso'],
                statuses: ['Disponible', 'Ocupado', 'Fuera de servicio', 'Patrullando', 'En traslado'],
                towns: {
                    'New Hanover': ['Valentine', 'Emerald Ranch', 'Annesburg', 'Van Horn'],
                    'West Elizabeth': ['Blackwater', 'Strawberry', 'Manzanita Post'],
                    'Ambarino': ['Wapiti', 'Colter'],
                    'Lemoyne': ['Saint Denis', 'Rhodes', 'Lagras'],
                    'Nuevo Paraíso': ['Tumbleweed', 'Armadillo', 'Chuparosa']
                },
                odeConfig: {
                    Scoring: { positive: 10, observed: 5, negative: 0 },
                    PerformanceLevels: [
                        { min: 90, label: 'Excelente', color: '#4caf50' },
                        { min: 75, label: 'Bueno', color: '#8bc34a' },
                        { min: 60, label: 'Satisfactorio', color: '#ffc107' },
                        { min: 40, label: 'Necesita Mejorar', color: '#ff9800' },
                        { min: 0, label: 'Insuficiente', color: '#f44336' }
                    ],
                    Categories: [
                        {
                            name: 'Conducta Profesional',
                            items: [
                                'Mantiene compostura bajo presión',
                                'Trata a civiles con respeto',
                                'Sigue la cadena de mando',
                                'Viste el uniforme apropiadamente',
                                'Mantiene su equipo en buen estado'
                            ]
                        },
                        {
                            name: 'Procedimientos Policiales',
                            items: [
                                'Aplica correctamente las leyes',
                                'Realiza detenciones adecuadas',
                                'Documenta incidentes apropiadamente',
                                'Maneja evidencia correctamente',
                                'Sigue protocolos de uso de fuerza'
                            ]
                        }
                    ]
                }
            });
        }, 500);
    }
});

// Expose functions for global access (needed for inline handlers)
window.Dispatch = Dispatch;
window.ODE = ODE;

Utils.log('Dispatch system ready');
