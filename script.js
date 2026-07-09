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
    // 2. Endpoints für Stage und Prod (angepasst)
    // ============================================================
    const ENDPOINTS = {
        stage: 'https://depst-mara-stg1.pegacloud.net/prweb/api/HawkTest/01/HawkTest',
        prod: 'https://depst-mara-prod1.pegacloud.net/prweb/api/HawkTest/01/HawkTest'
    };

    let currentEnv = 'stage';
    let currentEndpoint = ENDPOINTS.stage;

    // ============================================================
    // 3. DOM-Referenzen (mit Prüfung)
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

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // ============================================================
    // 4. Alle sichtbaren Eingabefelder sammeln
    // ============================================================
    function getAllVisibleFields() {
        return document.querySelectorAll('#shipmentForm input[type="text"]:not([type="hidden"])');
    }

    // ============================================================
    // 5. PostNumber generieren
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
    // 6. getCurrentValues – alle Daten sammeln
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
        obj['Package_Height_Value'] = fieldHeight ? fieldHeight.value : '0.
