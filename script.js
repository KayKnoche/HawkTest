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
    const endpointDisplay = document.getElementById('endpointDisplay');
    const footerEndpoint = document.getElementById('footerEndpoint');

    // SubjectID
    const subjectIdDisplay = document.getElementById('subjectIdDisplay');
    const refreshSubjectBtn = document.getElementById('refreshSubjectBtn');

    // Preset-Buttons
    const presetBtns = document.querySelectorAll('.preset-btn');

    // ============================================================
    // 3. Alle Eingabefelder sammeln
    // ============================================================
    function getAllFields() {
        return document.querySelectorAll('#shipmentForm input[type="text"]');
    }

    function getFieldValue(key) {
        const el = document.getElementById(`field-${key}`);
        return el ? el.value : '';
    }

    function setFieldValue(key, value) {
        const el = document.getElementById(`field-${key}`);
        if (el) el.value = value;
    }

    function getCurrentValues() {
        const fields = getAllFields();
        const obj = {};
        fields.forEach(input => {
            obj[input.name] = input.value;
        });
        return obj;
    }

    // ============================================================
    // 4. Defaults setzen
    // ============================================================
    function setDefaults() {
        const fields = getAllFields();
        fields.forEach(input => {
            if (input.dataset.default !== undefined) {
                input.value = input.dataset.default;
            }
        });
        // Preset-Highlight zurücksetzen
        presetBtns.forEach(b => b.classList.remove('active'));
        updatePreview();
    }

    // ============================================================
    // 5. Preview aktualisieren
    // ============================================================
    function updatePreview() {
        const data = getCurrentValues();
        const jsonStr = JSON.stringify(data, null, 2);
        jsonDisplay.textContent = jsonStr;
        recordCount.textContent = '1 Datensatz';
    }

    // ============================================================
    // 6. Preset anwenden
    // ============================================================
    function applyPreset(size) {
        const p = PRESETS[size];
        if (!p) return;
        setFieldValue('Package_Length_Value', p.length);
        setFieldValue('Package_Width_Value', p.width);
        setFieldValue('Package_Height_Value', p.height);
        setFieldValue('Package_Weight_Value', p.weight);
        // Volumen berechnen (L * B * H)
        const vol = (parseFloat(p.length) * parseFloat(p.width) * parseFloat(p.height)).toFixed(3);
        setFieldValue('Package_Volume_Unit', vol);

        // Highlight
        presetBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.preset-btn[data-preset="${size}"]`)?.classList.add('active');

        updatePreview();
    }

    // ============================================================
    // 7. Kopieren
    // ============================================================
    function copyToClipboard() {
        const text = jsonDisplay.textContent;
        if (!text || text.startsWith('//')) {
            alert('Bitte zuerst JSON generieren.');
            return;
