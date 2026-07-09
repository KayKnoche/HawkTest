(function() {
    'use strict';

    console.log('🚀 Script geladen – warte auf DOM...');

    // ============================================================
    // 1. PRESETS: Vordefinierte Paketgrößen
    // ============================================================
    const PRESETS = {
        S:   { length: '0.20', width: '0.15', height: '0.10', weight: '0.5' },
        M:   { length: '0.40', width: '0.30', height: '0.20', weight: '2.0' },
        L:   { length: '0.60', width: '0.40', height: '0.30', weight: '5.0' },
        XL:  { length: '0.80', width: '0.60', height: '0.40', weight: '10.0' },
        XXL: { length: '1.20', width: '0.80', height: '0.60', weight: '20.0' }
    };

    // ============================================================
    // 2. Endpoints für Stage und Prod
    // ============================================================
    const ENDPOINTS = {
        stage: 'https://depst-mara-stg1.pegacloud.net/prweb/api/HawkTest/01/HawkTest',
        prod: 'https://depst-mara-prod1.pegacloud.net/prweb/api/HawkTest/01/HawkTest'
    };

    let currentEnv = 'stage';
    let currentEndpoint = ENDPOINTS.stage;

    // ============================================================
    // 3. Mapping: EventClass → Status + PrimaryCriteria
    // ============================================================
    const EVENT_MAPPING = {
        'PAN': { status: 'PAN', primaryCriteria: 'PAN_PAKET' },
        'PZA': { status: 'PZA', primaryCriteria: 'PZA_PAKET' }
    };

    // ============================================================
    // 4. DOM-Referenzen (mit Prüfung)
    // ============================================================
    function getEl(id) {
        const el = document.getElementById(id);
        if (!el) console.warn('⚠️ Element nicht gefunden:', id);
        return el;
    }

    const jsonDisplay = getEl('jsonDisplay');
    const responseContent = getEl('responseContent');
    const generateBtn = getEl('generateBtn');
    const copyBtn = getEl('copyBtn');
    const sendBtn = getEl('sendBtn');
    const resetBtn = getEl('resetDefaultsBtn');
    const recordCount = getEl('recordCount');

    const envStage = getEl('envStage');
    const envProd = getEl('envProd');
    const envTitle = getEl('envTitle');
    const endpointDisplay = getEl('endpointDisplay');
    const footerEndpoint = getEl('footerEndpoint');

    const subjectIdDisplay = getEl('subjectIdDisplay');
    const refreshSubjectBtn = getEl('refreshSubjectBtn');

    const presetDropdown = getEl('presetDropdown');

    const displayLength = getEl('displayLength');
    const displayWidth = getEl('displayWidth');
    const displayHeight = getEl('displayHeight');
    const displayWeight = getEl('displayWeight');
    const displayVolume = getEl('displayVolume');

    const fieldLength = getEl('field-Package_Length_Value');
    const fieldWidth = getEl('field-Package_Width_Value');
    const fieldHeight = getEl('field-Package_Height_Value');
    const fieldWeight = getEl('field-Package_Weight_Value');
    const fieldVolume = getEl('field-Package_Volume_Unit');

    const eventSelect = getEl('field-EventClass');
    const fieldStatus = getEl('field-Status');
    const fieldPrimaryCriteria = getEl('field-PrimaryCriteria');

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // ============================================================
    // 5. Alle sichtbaren Eingabefelder sammeln
    // ============================================================
    function getAllVisibleFields() {
        return document.querySelectorAll('#shipmentForm input[type="text"]:not([type="hidden"]), #shipmentForm select');
    }

    // ============================================================
    // 6. EventClass → Status & PrimaryCriteria setzen
    // ============================================================
    function updateEventDependentFields(eventClass) {
        const mapping = EVENT_MAPPING[eventClass];
        if (mapping) {
            if (fieldStatus) fieldStatus.value = mapping.status;
            if (fieldPrimaryCriteria) fieldPrimaryCriteria.value = mapping.primaryCriteria;
            console.log(`📌 EventClass=${eventClass} → Status=${mapping.status}, PrimaryCriteria=${mapping.primaryCriteria}`);
        }
    }

    // ============================================================
    // 7. PostNumber generieren
    // ============================================================
    function generatePostNumber() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 20; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const timestamp = Date.now().toString(36);
        return `pegacdhuniversaltier-i-${timestamp}${randomPart.substring(0, 10)}`;
    }

    // ============================================================
    // 8. getCurrentValues – alle Daten sammeln (OHNE leere Felder)
    // ============================================================
    function getCurrentValues() {
        const obj = {};

        const visibleFields = getAllVisibleFields();
        visibleFields.forEach(input => {
            // NUR Felder mit einem gültigen name-Attribut hinzufügen
            if (input.name && input.name.trim() !== '') {
                obj[input.name] = input.value;
            } else {
                console.warn('⚠️ Feld ohne name-Attribut übersprungen:', input);
            }
        });

        // Maße aus versteckten Feldern
        obj['Package_Length_Value'] = fieldLength ? fieldLength.value : '1.2';
        obj['Package_Width_Value'] = fieldWidth ? fieldWidth.value : '0.6';
        obj['Package_Height_Value'] = fieldHeight ? fieldHeight.value : '0.6';
        obj['Package_Weight_Value'] = fieldWeight ? fieldWeight.value : '15.0';
        obj['Package_Volume_Unit'] = fieldVolume ? fieldVolume.value : '0.432';

        // Feste Einheiten
        obj['Package_Length_Unit'] = 'M';
        obj['Package_Width_Unit'] = 'M';
        obj['Package_Height_Unit'] = 'M';
        obj['Package_Weight_Unit'] = 'KG';

        // Status, PrimaryCriteria und EventClass aus den versteckten / Dropdown-Feldern
        obj['Status'] = fieldStatus ? fieldStatus.value : 'PAN';
        obj['PrimaryCriteria'] = fieldPrimaryCriteria ? fieldPrimaryCriteria.value : 'PAN_PAKET';
        obj['EventClass'] = eventSelect ? eventSelect.value : 'PAN';

        // PostNumber generieren
        obj['PostNumber'] = generatePostNumber();

        return obj;
    }

    // ============================================================
    // 9. Maße setzen
    // ============================================================
    function setMeasures(size) {
        console.log('📐 setMeasures aufgerufen mit:', size);

        if (!size || !PRESETS[size]) {
            displayLength.textContent = '—';
            displayWidth.textContent = '—';
            displayHeight.textContent = '—';
            displayWeight.textContent = '—';
            displayVolume.textContent = '—';
            if (fieldLength) fieldLength.value = '';
            if (fieldWidth) fieldWidth.value = '';
            if (fieldHeight) fieldHeight.value = '';
            if (fieldWeight) fieldWeight.value = '';
            if (fieldVolume) fieldVolume.value = '';
            return;
        }

        const p = PRESETS[size];
        const length = parseFloat(p.length);
        const width = parseFloat(p.width);
        const height = parseFloat(p.height);
        const weight = parseFloat(p.weight);
        const volume = length * width * height;

        displayLength.textContent = length.toFixed(2);
        displayWidth.textContent = width.toFixed(2);
        displayHeight.textContent = height.toFixed(2);
        displayWeight.textContent = weight.toFixed(1);
        displayVolume.textContent = volume.toFixed(3);

        if (fieldLength) fieldLength.value = length.toFixed(2);
        if (fieldWidth) fieldWidth.value = width.toFixed(2);
        if (fieldHeight) fieldHeight.value = height.toFixed(2);
        if (fieldWeight) fieldWeight.value = weight.toFixed(1);
        if (fieldVolume) fieldVolume.value = volume.toFixed(3);
    }

    // ============================================================
    // 10. Defaults setzen
    // ============================================================
    function setDefaults() {
        console.log('↺ setDefaults aufgerufen');

        const fields = getAllVisibleFields();
        fields.forEach(input => {
            if (input.dataset && input.dataset.default !== undefined) {
                input.value = input.dataset.default;
            }
        });

        if (presetDropdown) presetDropdown.value = '';

        if (eventSelect) {
            eventSelect.value = 'PAN';
            updateEventDependentFields('PAN');
        }

        const defaultLength = '1.2';
        const defaultWidth = '0.6';
        const defaultHeight = '0.6';
        const defaultWeight = '15.0';
        const defaultVolume = (parseFloat(defaultLength) * parseFloat(defaultWidth) * parseFloat(defaultHeight)).toFixed(3);

        displayLength.textContent = defaultLength;
        displayWidth.textContent = defaultWidth;
        displayHeight.textContent = defaultHeight;
        displayWeight.textContent = defaultWeight;
        displayVolume.textContent = defaultVolume;

        if (fieldLength) fieldLength.value = defaultLength;
        if (fieldWidth) fieldWidth.value = defaultWidth;
        if (fieldHeight) fieldHeight.value = defaultHeight;
        if (fieldWeight) fieldWeight.value = defaultWeight;
        if (fieldVolume) fieldVolume.value = defaultVolume;

        updatePreview();
    }

    // ============================================================
    // 11. Preview aktualisieren
    // ============================================================
    function updatePreview() {
        console.log('🔄 updatePreview aufgerufen');
        const data = getCurrentValues();
        const jsonStr = JSON.stringify(data, null, 2);
        if (jsonDisplay) {
            jsonDisplay.textContent = jsonStr;
        }
        if (recordCount) {
            recordCount.textContent = '1 Datensatz';
        }
    }

    // ============================================================
    // 12. Kopieren
    // ============================================================
    function copyToClipboard() {
        console.log('📋 copyToClipboard aufgerufen');
        const text = jsonDisplay ? jsonDisplay.textContent : '';
        if (!text || text.startsWith('//')) {
            alert('Bitte zuerst JSON generieren.');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ JSON kopiert!');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('✅ Kopiert (Fallback)');
        });
    }

    // ============================================================
    // 13. Senden
    // ============================================================
    async function sendToService() {
        console.log('🚀 sendToService aufgerufen – Endpoint:', currentEndpoint);
        const payload = getCurrentValues();
        const jsonPayload = JSON.stringify(payload);

        // Prüfe, ob das leere Feld noch vorhanden ist
        if (payload[''] !== undefined) {
            console.warn('⚠️ Leeres Feld im Payload gefunden!', payload['']);
            delete payload[''];
            console.log('🔧 Leeres Feld entfernt');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (responseContent) {
            responseContent.textContent = `⏳ Sende Anfrage an ${currentEnv.toUpperCase()} ...`;
        }

        try {
            const response = await fetch(currentEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            let formattedResponse = responseText;
            try {
                const json = JSON.parse(responseText);
                formattedResponse = JSON.stringify(json, null, 2);
            } catch (_) {}

            if (responseContent) {
                responseContent.textContent = `✅ [${currentEnv.toUpperCase()}] Status: ${response.status} ${response.statusText}\n\n📨 Antwort:\n${formattedResponse}`;
            }
        } catch (error) {
            if (responseContent) {
                responseContent.textContent = `❌ [${currentEnv.toUpperCase()}] Fehler beim Senden:\n${error.message}`;
            }
        }
    }

    // ============================================================
    // 14. SubjectID aktualisieren
    // ============================================================
    function refreshSubjectId() {
        console.log('🔄 refreshSubjectId aufgerufen');
        const newId = Math.floor(100000000 + Math.random() * 900000000);
        if (subjectIdDisplay) {
            subjectIdDisplay.textContent = String(newId);
        }
    }

    // ============================================================
    // 15. Stage/Prod Toggle
    // ============================================================
    function setEnvironment(env) {
        console.log('🌍 setEnvironment aufgerufen:', env);
        currentEnv = env;

        if (env === 'stage') {
            if (envStage) envStage.classList.add('active');
            if (envProd) envProd.classList.remove('active');
            if (envTitle) envTitle.textContent = 'STAGE – personalisiert via Pega CDH';
            currentEndpoint = ENDPOINTS.stage;
        } else {
            if (envProd) envProd.classList.add('active');
            if (envStage) envStage.classList.remove('active');
            if (envTitle) envTitle.textContent = 'PROD – personalisiert via Pega CDH';
            currentEndpoint = ENDPOINTS.prod;
        }

        if (endpointDisplay) {
            endpointDisplay.textContent = currentEndpoint;
        }
        if (footerEndpoint) {
            footerEndpoint.textContent = currentEndpoint;
        }

        console.log('📍 Neuer Endpoint:', currentEndpoint);
    }

    // ============================================================
    // 16. Akkordeon
    // ============================================================
    function toggleAccordion(header) {
        const targetId = header.dataset.target;
        const panel = document.getElementById(targetId);
        if (!panel) return;

        const toggle = header.querySelector('.accordion-toggle');
        const isOpen = panel.classList.contains('open');

        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('open'));
        document.querySelectorAll('.accordion-toggle').forEach(t => t.textContent = '+');

        if (!isOpen) {
            panel.classList.add('open');
            if (toggle) toggle.textContent = '−';
        }
    }

    // ============================================================
    // 17. Event-Listener
    // ============================================================
    function init() {
        console.log('✅ init() wird ausgeführt – binde Events...');

        if (generateBtn) {
            generateBtn.addEventListener('click', updatePreview);
            console.log('✅ generateBtn gebunden');
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', copyToClipboard);
            console.log('✅ copyBtn gebunden');
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', sendToService);
            console.log('✅ sendBtn gebunden');
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', setDefaults);
            console.log('✅ resetBtn gebunden');
        }

        if (refreshSubjectBtn) {
            refreshSubjectBtn.addEventListener('click', refreshSubjectId);
            console.log('✅ refreshSubjectBtn gebunden');
        }

        if (envStage) {
            envStage.addEventListener('click', function() { setEnvironment('stage'); });
            console.log('✅ envStage gebunden');
        }

        if (envProd) {
            envProd.addEventListener('click', function() { setEnvironment('prod'); });
            console.log('✅ envProd gebunden');
        }

        if (presetDropdown) {
            presetDropdown.addEventListener('change', function() {
                console.log('📋 Dropdown geändert:', this.value);
                setMeasures(this.value);
                updatePreview();
            });
            console.log('✅ presetDropdown gebunden');
        }

        if (eventSelect) {
            eventSelect.addEventListener('change', function() {
                console.log('🎯 EventClass geändert:', this.value);
                updateEventDependentFields(this.value);
                updatePreview();
            });
            console.log('✅ eventSelect gebunden');
            updateEventDependentFields(eventSelect.value);
        }

        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                toggleAccordion(this);
            });
        });
        console.log(`✅ ${accordionHeaders.length} Akkordeon-Header gebunden`);

        setDefaults();
        setEnvironment('stage');

        if (responseContent) {
            responseContent.textContent = '🔹 Bereit. Klicke auf "Senden", um den Service aufzurufen.';
        }

        const panelMeasures = document.getElementById('panelMeasures');
        if (panelMeasures) {
            panelMeasures.classList.add('open');
            const toggle = document.querySelector('.accordion-header[data-target="panelMeasures"] .accordion-toggle');
            if (toggle) toggle.textContent = '−';
        }

        updatePreview();
        console.log('✅ DHL Shipment Test Tool vollständig initialisiert!');
        console.log('📍 Aktueller Endpoint:', currentEndpoint);
    }

    // ============================================================
    // 18. Start
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
