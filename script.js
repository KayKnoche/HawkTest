(function() {
  'use strict';

  // ------------------------------------------------------------
  // 1. Felddefinitionen (basierend auf dem ersten JSON-Beispiel)
  // ------------------------------------------------------------
  const fieldDefs = [
    { key: 'CountryCodePan', label: 'CountryCodePan', default: 'DE' },
    { key: 'Participation', label: 'Participation', default: '01' },
    { key: 'Package_Width_Value', label: 'Package_Width_Value', default: '0.6' },
    { key: 'Package_Length_Value', label: 'Package_Length_Value', default: '1.2' },
    { key: 'CityOrg', label: 'CityOrg', default: 'Göttingen' },
    { key: 'RoutingInformation', label: 'RoutingInformation', default: '2LAT6922+74000000' },
    { key: 'StreetAdr', label: 'StreetAdr', default: 'Holzriedstrasse 29' },
    { key: 'Package_Volume_Unit', label: 'Package_Volume_Unit', default: '0' },
    { key: 'Procedure', label: 'Procedure', default: '87' },
    { key: 'ID', label: 'ID', default: '10000478269202' },
    { key: 'Package_Length_Unit', label: 'Package_Length_Unit', default: 'M' },
    { key: 'ShipmentCategory', label: 'ShipmentCategory', default: 'PAKET' },
    { key: 'StreetOrg', label: 'StreetOrg', default: 'Robert-Bosch-Breite 912' },
    { key: 'Status', label: 'Status', default: 'PAN' },
    { key: 'ZipAdr', label: 'ZipAdr', default: '6922' },
    { key: 'ProductCode', label: 'ProductCode', default: '80' },
    { key: 'Package_Width_Unit', label: 'Package_Width_Unit', default: 'M' },
    { key: 'ZipOrg', label: 'ZipOrg', default: '37079' },
    { key: 'CityAdr', label: 'CityAdr', default: 'Wolfurt' },
    { key: 'PackageBatchCardValue', label: 'PackageBatchCardValue', default: 'JJD149990299999006553' },
    { key: 'EkpRegulatorShipment', label: 'EkpRegulatorShipment', default: '7000100904' },
    { key: 'Package_Weight_Value', label: 'Package_Weight_Value', default: '15.0' },
    { key: 'EventClass', label: 'EventClass', default: 'PAN' },
    { key: 'DstID', label: 'DstID', default: '5003' },
    { key: 'CountryCodeAdr', label: 'CountryCodeAdr', default: 'AT' },
    { key: 'Package_Height_Value', label: 'Package_Height_Value', default: '0.6' },
    { key: 'Package_Weight_Unit', label: 'Package_Weight_Unit', default: 'KG' },
    { key: 'AddressedDeliveryChannel', label: 'AddressedDeliveryChannel', default: 'HAUSADRESSE' },
    { key: 'CountryCodeOrg', label: 'CountryCodeOrg', default: 'DE' },
    { key: 'Package_Height_Unit', label: 'Package_Height_Unit', default: 'M' },
    { key: 'PostNumber', label: 'PostNumber', default: 'pegacdhuniversaltier-i-0babab5e71783512925378000' },
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
  const copyInline = document.getElementById('copyBtnInline');
  const sendBtn = document.getElementById('sendBtn');
  const sendBtnInline = document.getElementById('sendBtnInline');
  const resetBtn = document.getElementById('resetDefaultsBtn');
  const recordCount = document.getElementById('recordCount');

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

      // Bei langen Werten etwas kleiner
      if (def.key === 'PostNumber' || def.key === 'PackageBatchCardValue' || def.key === 'RoutingInformation') {
        input.style.fontSize = '0.75rem';
      }

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

  function getCurrentJsonString() {
    return JSON.stringify(getCurrentValues(), null, 2);
  }

  // ------------------------------------------------------------
  // 5. Kopieren (Zwischenablage)
  // ------------------------------------------------------------
  function copyToClipboard() {
    const text = jsonDisplay.textContent;
    if (!text || text.startsWith('//')) {
      alert('Bitte zuerst JSON generieren.');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ JSON in die Zwischenablage kopiert!');
    }).catch(() => {
      // Fallback
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
  // 6. Senden an den Webservice
  // ------------------------------------------------------------
  const ENDPOINT = 'https://depst-mara-stg1.pegacloud.net/prweb/api/HawkTest/01/HawkTest';

  async function sendToService() {
    const payload = getCurrentValues();
    const jsonPayload = JSON.stringify(payload);

    responseContent.textContent = '⏳ Sende Anfrage ...';
    document.getElementById('responseDetails').open = true;

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

      // Versuche, JSON-Antwort hübsch zu formatieren
      try {
        const json = JSON.parse(responseText);
        formattedResponse = JSON.stringify(json, null, 2);
      } catch (_) { /* bleibt als Text */ }

      responseContent.textContent = `✅ Status: ${response.status} ${response.statusText}\n\n📨 Antwort:\n${formattedResponse}`;
    } catch (error) {
      responseContent.textContent = `❌ Fehler beim Senden:\n${error.message}`;
    }
  }

  // ------------------------------------------------------------
  // 7. Event-Listener
  // ------------------------------------------------------------
  generateBtn.addEventListener('click', updatePreview);

  copyBtn.addEventListener('click', copyToClipboard);
  copyInline.addEventListener('click', copyToClipboard);

  sendBtn.addEventListener('click', sendToService);
  sendBtnInline.addEventListener('click', sendToService);

  resetBtn.addEventListener('click', setDefaults);

  // Doppelklick auf ein Feld → Default-Wert setzen
  container.addEventListener('dblclick', (e) => {
    const input = e.target.closest('input');
    if (input && input.dataset.default !== undefined) {
      input.value = input.dataset.default;
      input.style.borderColor = '#1f8b4c';
      setTimeout(() => input.style.borderColor = '', 400);
    }
  });

  // ------------------------------------------------------------
  // 8. Initialisierung
  // ------------------------------------------------------------
  window.addEventListener('load', () => {
    updatePreview();
    responseContent.textContent = '🔹 Bereit. Klicke auf "Senden", um den Service aufzurufen.';
  });

})();
