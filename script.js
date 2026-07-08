(function() {
    'use strict';

    // ------------------------------------------------------------
    // 1. Felddefinitionen
    // ------------------------------------------------------------
    const fieldDefs = [
        { key: 'CountryCodePan', label: 'Land (Absender)', default: 'DE' },
        { key: 'Participation', label: 'Teilnahme', default: '01' },
        { key: 'Package_Width_Value', label: 'Breite', default: '0.6' },
        { key: 'Package_Length_Value', label: 'Länge', default: '1.2' },
        { key: 'Package_Height_Value', label: 'Höhe', default: '0.6' },
        { key: 'Package_Weight_Value', label: 'Gewicht', default: '15.0' },
        { key: 'CityOrg', label: 'Stadt (Org)', default: 'Göttingen' },
        { key: 'ZipOrg', label: 'PLZ (Org)', default: '37079' },
        { key: 'StreetOrg', label: 'Straße (Org)', default: 'Robert-Bosch-Breite 912' },
        { key: 'CityAdr', label: 'Stadt (Adr)', default: 'Wolfurt' },
        { key: 'ZipAdr', label: 'PLZ (Adr)', default: '6922' },
        { key: 'CountryCodeAdr', label: 'Land (Adr)', default: 'AT' },
        { key: 'ID', label: 'ID', default: '10000478269202' },
        { key: 'PackageBatchCardValue', label: 'BatchCard', default: 'JJD149990299999006553' },
        { key: 'EkpRegulatorShipment', label: 'EkpRegulator', default: '7000100904' },
        { key: 'PostNumber', label: 'PostNumber', default: 'pegacdhuniversaltier-i-0babab5e71783512925378000' },
        { key: 'RoutingInformation', label: 'RoutingInfo', default: '2LAT6922+74000000' },
        { key: 'StreetAdr', label: 'Straße (Adr)', default: 'Holzriedstrasse 29' },
        { key: 'Package_Volume_Unit', label: 'Volumen Einheit', default: '0' },
        { key: 'Procedure', label: 'Procedure', default: '87' },
        { key: 'Package_Length_Unit', label: 'Längen-Einheit', default: 'M' },
        { key: 'ShipmentCategory', label: 'Kategorie', default: 'PAKET' },
        { key: 'Status', label: 'Status', default: 'PAN' },
        { key: 'ProductCode', label: 'ProductCode', default: '80' },
        { key: 'Package_Width_Unit', label: 'Breiten-Einheit', default: 'M' },
        { key: 'EventClass', label: 'EventClass', default: 'PAN' },
        { key: 'DstID', label: 'DstID', default: '5003' },
        { key: 'Package_Weight_Unit', label: 'Gewichts-Einheit', default: 'KG' },
        { key: 'AddressedDeliveryChannel', label: 'Zustellkanal', default: 'HAUSADRESSE' },
        { key: 'CountryCodeOrg', label: 'Land (Org)', default: 'DE' },
        { key: 'Package_Height_Unit', label: 'Höhen-Einheit', default: 'M' },
        { key: 'PrimaryCriteria', label: 'PrimaryCriteria', default: 'PAN_PAKET' }
    ];

    // ------------------------------------------------------------
    // 2. DOM-Referenzen
    // ------------------------------------------------------------
    const container = document.getElementById('fieldsContainer');
    const jsonDisplay = document.getElementById('jsonDisplay');
    const responseContent = document.getElementById('responseContent');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');
    const recordCount = document.getElementById('recordCount');
    const refreshSubjectBtn = document.getElementById('refreshSubjectBtn');
    const subjectIdDisplay = document.getElementById('subjectIdDisplay');

    // ------------------------------------------------------------
    // 3. Felder im DOM erzeugen
    // ------------------------------------------------------------
    function buildFields() {
        container.innerHTML = '';
        fieldDefs.forEach(def => {
            const div = document.createElement('div');
            div.className = 'field';

            const label = document.createElement('label');
            label.htmlFor = `field-${def.key}`;
            label.textContent = def.label;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `field-${def.key}`;
            input.name = def.key;
            input.value = def.default;
            input.dataset.default = def.default;

            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        });
    }
    buildFields();

    // ------------------------------------------------------------
    // 4. Hilfsfunktionen
    // ------------------------------------------------------------
    function getCurrentValues() {
        const obj = {};
        fieldDefs.forEach(def => {
            const el = document.getElementById(`field-${def.key}`);
            obj[def.key] = el ? el.value : def.default;
        });
        return obj;
    }

    function setDefaults() {
        fieldDefs.forEach(def => {
            const el = document.getElementById(`field-${def.key}`);
            if (el) el.value = def.default;
        });
        updatePreview();
    }

    function updatePreview() {
        const data = getCurrentValues();
        const jsonStr = JSON.stringify(data, null, 2);
        jsonDisplay.textContent = jsonStr;
        recordCount.textContent = '1 Datensatz';
    }

    // ------------------------------------------------------------
    // 5. Kopieren
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // 6. Senden
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // 7. SubjectID aktualisieren (Demo)
    // ------------------------------------------------------------
    function refreshSubjectId() {
        const newId = Math.floor(100000000 + Math.random() * 900000000);
        subjectIdDisplay.textContent = String(newId);
    }

    // ------------------------------------------------------------
    // 8. Event-Listener
    // ------------------------------------------------------------
    generateBtn.addEventListener('click', updatePreview);
    copyBtn.addEventListener('click', copyToClipboard);
    sendBtn.addEventListener('click', sendToService);
    resetBtn.addEventListener('click', setDefaults);
    refreshSubjectBtn.addEventListener('click', refreshSubjectId);

    // ------------------------------------------------------------
    // 9. Initialisierung
    // ------------------------------------------------------------
    window.addEventListener('load', () => {
        updatePreview();
        responseContent.textContent = '🔹 Bereit. Klicke auf "Senden", um den Service aufzurufen.';
    });

})();
