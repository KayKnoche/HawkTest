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
    // 2. DOM-Referenzen (mit Prüfung)
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

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // ============================================================
    // 3. Alle sichtbaren Eingabefelder sammeln
    // ============================================================
    function getAllVisibleFields() {
        return document.querySelectorAll('#shipmentForm input[type="text"]:not([type="hidden"])');
    }

    // ============================================================
    // 4. PostNumber generieren
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
    // 5. getCurrentValues – alle Daten sammeln
    // ============================================================
    function getCurrentValues() {
        const obj = {};

        const visibleFields = getAllVisibleFields();
        visibleFields.forEach(input => {
            obj[input.name] = input.value;
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

        // PostNumber generieren
        obj['PostNumber'] = generatePostNumber();

        return obj;
    }

    // ============================================================
    // 6. Maße setzen (Dropdown → Werte + Anzeige)
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
    // 7. Defaults setzen
    // ============================================================
    function setDefaults() {
        console.log('↺ setDefaults aufgerufen');

        const fields = getAllVisibleFields();
        fields.forEach(input => {
            if (input.dataset.default !== undefined) {
                input.value = input.dataset.default;
            }
        });

        if (presetDropdown) presetDropdown.value = '';

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
    // 8. Preview aktualisieren
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
    // 9. Kopieren
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
    // 10. Senden
    // ============================================================
    const ENDPOINT = 'https://depst-mara-stg1.pegacloud.net/prweb/api/HawkTest/01/HawkTest';

    async function sendToService() {
        console.log('🚀 sendToService aufgerufen');
        const payload = getCurrentValues();
        const jsonPayload = JSON.stringify(payload);

        if (responseContent) {
            responseContent.textContent = '⏳ Sende Anfrage ...';
        }

        try {
            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonPayload
            });

            const responseText = await response.text();
            let formattedResponse = responseText;
            try {
                const json = JSON.parse(responseText);
                formattedResponse = JSON.stringify(json, null, 2);
            } catch (_) {}

            if (responseContent) {
                responseContent.textContent = `✅ Status: ${response.status} ${response.statusText}\n\n📨 Antwort:\n${formattedResponse}`;
            }
        } catch (error) {
            if (responseContent) {
                responseContent.textContent = `❌ Fehler beim Senden:\n${error.message}`;
            }
        }
    }

    // ============================================================
    // 11. SubjectID aktualisieren
    // ============================================================
    function refreshSubjectId() {
        console.log('🔄 refreshSubjectId aufgerufen');
        const newId = Math.floor(100000000 + Math.random() * 900000000);
        if (subjectIdDisplay) {
            subjectIdDisplay.textContent = String(newId);
        }
    }

    // ============================================================
    // 12. Stage/Prod Toggle
    // ============================================================
    function setEnvironment(env) {
        console.log('🌍 setEnvironment aufgerufen:', env);
        if (env === 'stage') {
            if (envStage) envStage.classList.add('active');
            if (envProd) envProd.classList.remove('active');
            if (envTitle) envTitle.textContent = 'STAGE – personalisiert via Pega CDH';
        } else {
            if (envProd) envProd.classList.add('active');
            if (envStage) envStage.classList.remove('active');
            if (envTitle) envTitle.textContent = 'PROD – personalisiert via Pega CDH';
        }
    }

    // ============================================================
    // 13. Akkordeon
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
    // 14. Event-Listener registrieren (NACH dem Laden)
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

        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                toggleAccordion(this);
            });
        });
        console.log(`✅ ${accordionHeaders.length} Akkordeon-Header gebunden`);

        // Initiale Werte setzen
        setDefaults();
        if (responseContent) {
            responseContent.textContent = '🔹 Bereit. Klicke auf "Senden", um den Service aufzurufen.';
        }

        // Paketmaße standardmäßig offen
        const panelMeasures = document.getElementById('panelMeasures');
        if (panelMeasures) {
            panelMeasures.classList.add('open');
            const toggle = document.querySelector('.accordion-header[data-target="panelMeasures"] .accordion-toggle');
            if (toggle) toggle.textContent = '−';
        }

        updatePreview();
        console.log('✅ DHL Shipment Test Tool vollständig initialisiert!');
    }

    // ============================================================
    // 15. Start – wenn DOM bereit ist
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
