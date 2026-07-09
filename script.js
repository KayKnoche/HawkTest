(function() {
    'use strict';

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
    // 2. DOM-Referenzen
    // ============================================================
    const jsonDisplay = document.getElementById('jsonDisplay');
    const responseContent = document.getElementById('responseContent');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');
    const recordCount = document.getElementById('recordCount');

    // Umgebung
    const envStage = document.getElementById('envStage');
    const envProd = document.getElementById('envProd');
    const envTitle = document.getElementById('envTitle');

    // SubjectID
    const subjectIdDisplay = document.getElementById('subjectIdDisplay');
    const refreshSubjectBtn = document.getElementById('refreshSubjectBtn');

    // Preset-Dropdown
    const presetDropdown = document.getElementById('presetDropdown');

    // Anzeige der Maße
    const displayLength = document.getElementById('displayLength');
    const displayWidth = document.getElementById('displayWidth');
    const displayHeight = document.getElementById('displayHeight');
    const displayWeight = document.getElementById('displayWeight');
    const displayVolume = document.getElementById('displayVolume');

    // Versteckte Felder für Maße
    const fieldLength = document.getElementById('field-Package_Length_Value');
    const fieldWidth = document.getElementById('field-Package_Width_Value');
    const fieldHeight = document.getElementById('field-Package_Height_Value');
    const fieldWeight = document.getElementById('field-Package_Weight_Value');
    const fieldVolume = document.getElementById('field-Package_Volume_Unit');

    // Akkordeon-Header
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // ============================================================
    // 3. Alle sichtbaren Eingabefelder sammeln (ohne hidden)
    // ============================================================
    function getAllVisibleFields() {
        return document.querySelectorAll('#shipmentForm input[type="text"]:not([type="hidden"])');
    }

    function getCurrentValues() {
        const obj = {};

        // Alle sichtbaren Felder auslesen
        const visibleFields = getAllVisibleFields();
        visibleFields.forEach(input => {
            obj[input.name] = input.value;
        });

        // Maße aus den versteckten Feldern übernehmen
        obj['Package_Length_Value'] = fieldLength.value;
        obj['Package_Width_Value'] = fieldWidth.value;
        obj['Package_Height_Value'] = fieldHeight.value;
        obj['Package_Weight_Value'] = fieldWeight.value;
        obj['Package_Volume_Unit'] = fieldVolume.value;

        // Feste Einheiten (wie in den Beispieldaten)
        obj['Package_Length_Unit'] = 'M';
        obj['Package_Width_Unit'] = 'M';
        obj['Package_Height_Unit'] = 'M';
        obj['Package_Weight_Unit'] = 'KG';

        // PostNumber automatisch generieren (wie in den Beispieldaten)
        obj['PostNumber'] = generatePostNumber();

        return obj;
    }

    // ============================================================
    // 4. PostNumber generieren (wie in den Beispieldaten)
    // ============================================================
    function generatePostNumber() {
        // Muster: pegacdhuniversaltier-i-0babab5e71783512925378000
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 20; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Timestamp + zufällige Zeichen
        const timestamp = Date.now().toString(36);
        return `pegacdhuniversaltier-i-${timestamp}${randomPart.substring(0, 10)}`;
    }

    // ============================================================
    // 5. Maße setzen (Dropdown → Werte + Anzeige)
    // ============================================================
    function setMeasures(size) {
        if (!size || !PRESETS[size]) {
            // Leere Werte
            displayLength.textContent = '—';
            displayWidth.textContent = '—';
            displayHeight.textContent = '—';
            displayWeight.textContent = '—';
            displayVolume.textContent = '—';
            fieldLength.value = '';
            fieldWidth.value = '';
            fieldHeight.value = '';
            fieldWeight.value = '';
            fieldVolume.value = '';
            return;
        }

        const p = PRESETS[size];
        const length = parseFloat(p.length);
        const width = parseFloat(p.width);
        const height = parseFloat(p.height);
        const weight = parseFloat(p.weight);
        const volume = length * width * height;

        // Anzeige aktualisieren
        displayLength.textContent = length.toFixed(2);
        displayWidth.textContent = width.toFixed(2);
        displayHeight.textContent = height.toFixed(2);
        displayWeight.textContent = weight.toFixed(1);
        displayVolume.textContent = volume.toFixed(3);

        // Versteckte Felder aktualisieren
        fieldLength.value = length.toFixed(2);
        fieldWidth.value = width.toFixed(2);
        fieldHeight.value = height.toFixed(2);
        fieldWeight.value = weight.toFixed(1);
        fieldVolume.value = volume.toFixed(3);
    }

    // ============================================================
    // 6. Defaults setzen
    // ============================================================
    function setDefaults() {
        const fields = getAllVisibleFields();
        fields.forEach(input => {
            if (input.dataset.default !== undefined) {
                input.value = input.dataset.default;
            }
        });

        // Dropdown zurücksetzen
        presetDropdown.value = '';
        setMeasures(null);

        // Standardmaße setzen (wie im ersten Beispiel)
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

        fieldLength.value = defaultLength;
        fieldWidth.value = defaultWidth;
        fieldHeight.value = defaultHeight;
        fieldWeight.value = defaultWeight;
        fieldVolume.value = defaultVolume;

        updatePreview();
    }

    // ============================================================
    // 7. Preview aktualisieren
    // ============================================================
    function updatePreview() {
        const data = getCurrentValues();
        const jsonStr = JSON.stringify(data, null, 2);
        jsonDisplay.textContent = jsonStr;
        recordCount.textContent = '1 Datensatz';
    }

    // ============================================================
    // 8. Kopieren
    // ============================================================
    function copyToClipboard() {
        const text = jsonDisplay.textContent;
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
    // 9. Senden an den Webservice
    // ============================================================
    const ENDPOINT = 'https://depst-mara-stg1.pegacloud.net/prweb/api/HawkTest/01/HawkTest';

    async function sendToService() {
        const payload = getCurrentValues();
        const jsonPayload = JSON.stringify(payload);

        responseContent.textContent = '⏳ Sende Anfrage ...';

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

            responseContent.textContent = `✅ Status: ${response.status} ${response.statusText}\n\n📨 Antwort:\n${formattedResponse}`;
        } catch (error) {
            responseContent.textContent = `❌ Fehler beim Senden:\n${error.message}`;
        }
    }

    // ============================================================
    // 10. SubjectID aktualisieren
    // ============================================================
    function refreshSubjectId() {
        const newId = Math.floor(100000000 + Math.random() * 900000000);
        subjectIdDisplay.textContent = String(newId);
    }

    // ============================================================
    // 11. Stage/Prod Toggle
    // ============================================================
    function setEnvironment(env) {
        if (env === 'stage') {
            envStage.classList.add('active');
            envProd.classList.remove('active');
            envTitle.textContent = 'STAGE – personalisiert via Pega CDH';
        } else {
            envProd.classList.add('active');
            envStage.classList.remove('active');
            envTitle.textContent = 'PROD – personalisiert via Pega CDH';
        }
    }

    // ============================================================
    // 12. Akkordeon (Toggle)
    // ============================================================
    function toggleAccordion(header) {
        const targetId = header.dataset.target;
        const panel = document.getElementById(targetId);
        if (!panel) return;

        const toggle = header.querySelector('.accordion-toggle');
        const isOpen = panel.classList.contains('open');

        // Alle Panels schließen (Akkordeon-Verhalten)
        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('open'));
        document.querySelectorAll('.accordion-toggle').forEach(t => t.textContent = '+');

        // Wenn es vorher geschlossen war, öffnen
        if (!isOpen) {
            panel.classList.add('open');
            toggle.textContent = '−';
        }
    }

    // ============================================================
    // 13. Event-Listener registrieren
    // ============================================================

    // --- Generieren ---
    generateBtn.addEventListener('click', updatePreview);

    // --- Kopieren ---
    copyBtn.addEventListener('click', copyToClipboard);

    // --- Senden ---
    sendBtn.addEventListener('click', sendToService);

    // --- Zurücksetzen ---
    resetBtn.addEventListener('click', setDefaults);

    // --- SubjectID aktualisieren ---
    refreshSubjectBtn.addEventListener('click', refreshSubjectId);

    // --- Stage/Prod Toggle ---
    envStage.addEventListener('click', function() { setEnvironment('stage'); });
    envProd.addEventListener('click', function() { setEnvironment('prod'); });

    // --- Preset-Dropdown ---
    presetDropdown.addEventListener('change', function() {
        const size = this.value;
        setMeasures(size);
        updatePreview();
    });

    // --- Akkordeon ---
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            toggleAccordion(this);
        });
    });

    // ============================================================
    // 14. Initialisierung
    // ============================================================
    window.addEventListener('load', function() {
        // Standardmaße setzen
        setDefaults();
        responseContent.textContent = '🔹 Bereit. Klicke auf "Senden", um den Service aufzurufen.';
        // Paketmaße standardmäßig offen
        const panelMeasures = document.getElementById('panelMeasures');
        if (panelMeasures) {
            panelMeasures.classList.add('open');
            document.querySelector('.accordion-header[data-target="panelMeasures"] .accordion-toggle').textContent = '−';
        }
        updatePreview();
        console.log('✅ DHL Shipment Test Tool geladen – alle Buttons aktiv!');
    });

})();
