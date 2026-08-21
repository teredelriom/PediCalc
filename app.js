// Constants for validation
const MAX_WEIGHT = 50000; // 50kg in grams
const MAX_AGE_MONTHS = 216; // 18 años expresados en meses
const MIN_TEMP = 35;
const MAX_TEMP = 42;
const MIN_AMBIENT_TEMP = 20;
const MAX_AMBIENT_TEMP = 50;

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content available; please refresh.');
          }
        });
      });
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  });
}

// Handle PWA installation
let deferredPrompt;
const installContainer = document.getElementById('installContainer');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if(installContainer) installContainer.classList.remove('hidden');
});

if(installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installContainer.classList.add('hidden');
      }
      deferredPrompt = null;
    }
  });
}

window.addEventListener('appinstalled', () => {
  if(installContainer) installContainer.classList.add('hidden');
  deferredPrompt = null;
});

// Improved input validation functions
function validateWeight(weight) {
  if (!weight || isNaN(weight)) {
    return { valid: false, message: "Por favor ingrese un peso válido" };
  }
  if (weight < 100) {
    return { valid: false, message: "El peso mínimo es 100g" };
  }
  if (weight > MAX_WEIGHT) {
    return { valid: false, message: `El peso máximo es ${MAX_WEIGHT/1000}kg` };
  }
  return { valid: true };
}

function validateAge(age) {
  if (age && (isNaN(age) || age < 0)) {
    return { valid: false, message: "Por favor ingrese una edad válida" };
  }
  if (age > MAX_AGE_MONTHS) {
    return { valid: false, message: `La edad máxima es 216 meses (18 años)` };
  }
  return { valid: true };
}

function validateTemperature(temp, isBodyTemp = true) {
  if (!temp || isNaN(temp)) return { valid: false };
  
  const min = isBodyTemp ? MIN_TEMP : MIN_AMBIENT_TEMP;
  const max = isBodyTemp ? MAX_TEMP : MAX_AMBIENT_TEMP;
  
  if (temp < min || temp > max) {
    return { 
      valid: false,
      message: `La temperatura debe estar entre ${min}°C y ${max}°C`
    };
  }
  return { valid: true };
}

function showError(inputId, message) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(`${inputId}-error`);
  
  if (inputElement) {
    inputElement.classList.add('border-danger', 'ring-1', 'ring-danger');
    inputElement.classList.remove('border-gray-300');
  }
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.classList.add('text-danger', 'text-xs', 'mt-1', 'font-medium');
  }
}

function clearError(inputId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(`${inputId}-error`);
  
  if (inputElement) {
    inputElement.classList.remove('border-danger', 'ring-1', 'ring-danger');
    inputElement.classList.add('border-gray-300');
  }
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

// Function to toggle temperature input fields
function toggleTemperaturas() {
  const checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');
  const condiciones = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  const tempFiebre = document.getElementById("tempFiebre");
  const tempAmbiente = document.getElementById("tempAmbiente");

  if (tempFiebre) tempFiebre.classList.toggle("hidden", !condiciones.includes("fiebre"));
  if (tempAmbiente) tempAmbiente.classList.toggle("hidden", !condiciones.includes("ambienteCalido"));
}

// CSS 'has-[:checked]' natively handles solution selector UI update now.

// Function to get selected solution percentage
function getSelectedSolutionPercentage() {
  const selected = document.querySelector('input[name="solucionBase"]:checked');
  return selected ? parseInt(selected.value) : 5;
}

// Datos iniciales
const APORTE_RANGOS = {
  mantenimiento: { kg: [100, 150], m2: [2000, 2500], label: "Volumen mantención" },
  patologicas: { kg: [180, 180], m2: [2800, 2800], label: "Pérdidas patológicas" },
  leve: { kg: [200, 220], m2: [3000, 3200], label: "Deshidratación leve" },
  moderada: { kg: [220, 240], m2: [3200, 3500], label: "Deshidratación moderada" },
  severa: { kg: [250, 270], m2: [3500, 4000], label: "Deshidratación severa" }
};

const NUTRICION_LACTANTES = [
  { alimento: "Nan 14%", calorias: "73", proteinas: "1,3", hdc: "8,1", lipidos: "3,9" },
  { alimento: "FL 7,5%", calorias: "72", proteinas: "2,2", hdc: "9,1", lipidos: "3" },
  { alimento: "FL 10%", calorias: "79", proteinas: "3", hdc: "10,3", lipidos: "2,9" },
  { alimento: "Papilla 100 cc", calorias: "100", proteinas: "2,6-3,2", hdc: "11,8-13,3", lipidos: "4,6" },
  { alimento: "Compota frutas 50 cc", calorias: "33", proteinas: "0,2", hdc: "7,6", lipidos: "0,2" },
  { alimento: "Papilla 200 cc", calorias: "200", proteinas: "5,2-6,5", hdc: "23,3-26,6", lipidos: "9,1-9,2" }
];

const NUTRICION_FORMULAS_ESPECIALES = [
  { alimento: "Pediasure 20%", calorias: "100", proteinas: "3", hdc: "10,9", lipidos: "4,9" },
  { alimento: "Peptijunior 10%", calorias: "52", proteinas: "1,4", hdc: "5,2", lipidos: "2,8" },
  { alimento: "PreNan 20%", calorias: "100", proteinas: "2,9", hdc: "10,6", lipidos: "5,1" },
  { alimento: "Neocate 10%", calorias: "48", proteinas: "1,3", hdc: "5,4", lipidos: "2,3" },
  { alimento: "Nan sin lactosa 20%", calorias: "101", proteinas: "2,2", hdc: "11,7", lipidos: "5" }
];

const PREPARACIONES = {
  sodio35: {
    nombre: "Sodio 35",
    indicacion: "Sin pérdidas patológicas",
    componentes: ["S. Glucosado 5% 500 cc", "NaCl 10% 10 cc", "KCl 10% 7,5 cc"],
    naPorLitro: 35,
    incluyeK: true
  },
  sodio70: {
    nombre: "Sodio 70",
    indicacion: "Con pérdidas patológicas o niños > 3 meses",
    componentes: ["S. Glucosado 5% 500 cc", "NaCl 10% 20 cc", "KCl 10% 7,5 cc"],
    naPorLitro: 70,
    incluyeK: true
  },
  sodio70Alcalinizante: {
    nombre: "Sodio 70 alcalinizante",
    indicacion: "Deshidratación con acidosis metabólica severa (HCO₃ < 15)",
    componentes: ["S. Glucosado 5% 500 cc", "NaCl 10% 10 cc", "NaHCO₃ 2/3 M 26 cc (o NaHCO₃ 8,4% 17 ml)", "KCl 10% 7,5 cc"],
    naPorLitro: 70,
    incluyeK: true
  },
  sinKcl: {
    nombre: "Mezcla sin KCl",
    indicacion: "Deshidratación severa / anuria",
    componentes: ["Usar la mezcla indicada sin agregado de KCl hasta confirmar diuresis"],
    naPorLitro: 70,
    incluyeK: false
  },
  sodio105: {
    nombre: "Sodio 105",
    indicacion: "Hiponatremia",
    componentes: ["S. Glucosado 5% 500 cc", "NaCl 10% 30 cc", "KCl 10% 7,5 cc"],
    naPorLitro: 105,
    incluyeK: true
  }
};

function promedio(rango) {
  return (rango[0] + rango[1]) / 2;
}

function calcularSuperficieCorporal(pesoKg) {
  return ((pesoKg * 4) + 7) / (90 + pesoKg);
}

function obtenerCategoriaAporte(deficitPct, condiciones) {
  if (deficitPct >= 100) return "severa";
  if (deficitPct >= 75) return "moderada";
  if (deficitPct >= 50) return "leve";
  if (condiciones.includes("perdidasPatologicas")) return "patologicas";
  return "mantenimiento";
}

function calcularAporteDiario(pesoKg, categoria) {
  const rango = APORTE_RANGOS[categoria];
  const usaPeso = pesoKg >= 3 && pesoKg <= 8;
  const superficieCorporal = calcularSuperficieCorporal(pesoKg);
  const unidad = usaPeso ? "cc/kg/día" : "cc/m²/día";
  const factor = promedio(usaPeso ? rango.kg : rango.m2);
  const total = usaPeso ? pesoKg * factor : superficieCorporal * factor;
  return { total, rango: usaPeso ? rango.kg : rango.m2, unidad, factor, usaPeso, superficieCorporal, label: rango.label };
}

function seleccionarPreparacion(condiciones, edadMeses, categoria) {
  if (condiciones.includes("hiponatremia")) return PREPARACIONES.sodio105;
  if (categoria === "severa" || condiciones.includes("oliguria")) return PREPARACIONES.sinKcl;
  if (condiciones.includes("acidosisSevera")) return PREPARACIONES.sodio70Alcalinizante;
  if (condiciones.includes("perdidasPatologicas") || edadMeses > 3) return PREPARACIONES.sodio70;
  return PREPARACIONES.sodio35;
}

function calcular() {
  ['peso', 'edad', 'tempF', 'tempA'].forEach(id => clearError(id));
  const peso = parseFloat(document.getElementById("peso").value);
  const pesoValidation = validateWeight(peso);
  if (!pesoValidation.valid) { showError("peso", pesoValidation.message); return; }

  let edad = parseFloat(document.getElementById("edad").value) || 0;
  const unidadEdad = document.getElementById("unidadEdad");
  if (unidadEdad && unidadEdad.value === "años") {
    edad *= 12;
  }
  const edadValidation = validateAge(edad);
  if (!edadValidation.valid) { showError("edad", edadValidation.message); return; }

  if (!document.getElementById("tempFiebre").classList.contains("hidden")) {
    const tempFValidation = validateTemperature(parseFloat(document.getElementById("tempF").value));
    if (!tempFValidation.valid) { showError("tempF", tempFValidation.message); return; }
  }
  if (!document.getElementById("tempAmbiente").classList.contains("hidden")) {
    const tempAValidation = validateTemperature(parseFloat(document.getElementById("tempA").value), false);
    if (!tempAValidation.valid) { showError("tempA", tempAValidation.message); return; }
  }

  const pesoKg = peso / 1000;
  const deficitPct = parseFloat(document.getElementById("deshidratacion").value);
  const condiciones = obtenerCondicionesSeleccionadas();
  const categoria = obtenerCategoriaAporte(deficitPct, condiciones);
  const aporte = calcularAporteDiario(pesoKg, categoria);
  const total24h = aporte.total;
  const mantenimiento = calcularAporteDiario(pesoKg, "mantenimiento").total;
  const deficit = Math.max(total24h - mantenimiento, 0);
  const preparacion = seleccionarPreparacion(condiciones, edad, categoria);

  document.getElementById("mantenimientoResult").textContent = Math.round(mantenimiento);
  document.getElementById("deficitResult").textContent = Math.round(deficit);
  document.getElementById("total24hResult").textContent = Math.round(total24h);
  document.getElementById("flujoHorarioResult").textContent = (total24h / 24).toFixed(1);

  const electrolitos = calcularRequerimientosElectrolitos(pesoKg);
  const solucionOptima = calcularSolucionRecomendada(total24h, preparacion, condiciones);
  mostrarFormulaHollidaySegar(pesoKg, aporte, mantenimiento, deficit, total24h, electrolitos);
  mostrarNutricionReferencia(edad);
  mostrarNotasClinicas(solucionOptima, condiciones, edad, categoria);
  document.getElementById("solucionesAlternativas").classList.add("hidden");
  document.getElementById("resultado").classList.remove("hidden");
  
  // Scroll to results for better UX on mobile
  document.getElementById("resultado").scrollIntoView({ behavior: 'smooth' });
}

function calcularSolucionRecomendada(total24h, preparacion, condiciones) {
  const VOLUMEN_BASE_PREPARACION = 500; // cc
  const MEQ_POTASIO_POR_BASE = 10.05; // 7.5 cc de KCl 10% (1.34 mEq/cc) = 10.05 mEq por cada 500 cc
  
  const factor = total24h / VOLUMEN_BASE_PREPARACION;
  const componentesEscalados = preparacion.componentes.map(item => {
    const match = item.match(/^(.*?)(\d+(?:[,.]\d+)?)\s*(cc|ml)/i);
    if (!match) return item;
    const valor = parseFloat(match[2].replace(',', '.')) * factor;
    return `${match[1]}${valor.toFixed(1).replace('.', ',')} ${match[3]}`;
  });
  const solucion = {
    ...preparacion,
    volumen: Math.round(total24h),
    componentesEscalados,
    sodioTotal: (preparacion.naPorLitro * (total24h / 1000)).toFixed(1),
    potasioTotal: preparacion.incluyeK ? (MEQ_POTASIO_POR_BASE * factor).toFixed(1) : "0"
  };
  mostrarSolucionRecomendada(solucion, condiciones);
  return solucion;
}

function mostrarSolucionRecomendada(solucion, condiciones) {
  const container = document.getElementById("solucionRecomendadaDetalle");
  container.innerHTML = `
    <div class="solution-card selected p-4 mb-4">
      <h4 class="text-lg font-bold text-primary mb-2">${solucion.nombre}</h4>
      <p class="text-gray-600 text-sm mb-3"><span class="font-medium">Indicación:</span> ${solucion.indicacion}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-semibold text-sm text-primary mb-1">Preparación para ${solucion.volumen} mL/24h:</p>
          <ul class="text-sm space-y-1 list-disc pl-5">${solucion.componentesEscalados.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
        <div>
          <p class="font-semibold text-sm text-primary mb-1">Aporte estimado:</p>
          <ul class="text-sm space-y-1">
            <li><span class="font-medium">Sodio:</span> ${solucion.sodioTotal} mEq/24h (${solucion.naPorLitro} mEq/L)</li>
            <li><span class="font-medium">Potasio:</span> ${solucion.potasioTotal} mEq/24h</li>
            <li><span class="font-medium">Velocidad:</span> ${(solucion.volumen / 24).toFixed(1)} mL/h</li>
          </ul>
        </div>
      </div>
      ${!solucion.incluyeK ? `<div class="mt-4 p-3 rounded-md clinical-note warning"><p class="font-semibold text-danger"><i class="fas fa-exclamation-triangle mr-1"></i>Sin KCl</p><p class="mt-1 text-sm">No agregar potasio en deshidratación severa, anuria u oliguria hasta confirmar diuresis y potasio sérico.</p></div>` : ''}
    </div>`;
}

function calcularRequerimientosElectrolitos(pesoKg) {
  return {
    na: [3 * pesoKg, 4 * pesoKg],
    k: [2 * pesoKg, 3 * pesoKg],
    cl: [3 * pesoKg, 4 * pesoKg],
    ca: [50 * pesoKg, 100 * pesoKg],
    mg: [0.4 * pesoKg, 0.9 * pesoKg],
    p: [15 * pesoKg, 50 * pesoKg]
  };
}

function renderTablaNutricion(datos) {
  return `
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 text-xs md:text-sm">
        <thead class="bg-secondary/40">
          <tr>
            <th class="border border-gray-200 px-2 py-1 text-left">Alimento</th>
            <th class="border border-gray-200 px-2 py-1 text-left">Calorías</th>
            <th class="border border-gray-200 px-2 py-1 text-left">Proteínas (g)</th>
            <th class="border border-gray-200 px-2 py-1 text-left">HdC (g)</th>
            <th class="border border-gray-200 px-2 py-1 text-left">Lípidos (g)</th>
          </tr>
        </thead>
        <tbody>
          ${datos.map(item => `
            <tr>
              <td class="border border-gray-200 px-2 py-1 font-medium">${item.alimento}</td>
              <td class="border border-gray-200 px-2 py-1">${item.calorias}</td>
              <td class="border border-gray-200 px-2 py-1">${item.proteinas}</td>
              <td class="border border-gray-200 px-2 py-1">${item.hdc}</td>
              <td class="border border-gray-200 px-2 py-1">${item.lipidos}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function mostrarNutricionReferencia(edadMeses) {
  const container = document.getElementById("nutricionReferencia");
  if (!container) return;

  const grupo = edadMeses < 24
    ? "<strong>Lactantes:</strong><br>i. La lactancia materna es la alimentación principal y debemos promoverla (siempre a libre demanda)<br>ii. Indicar fórmula láctea (Lactancia materna, fórmula de inicio, FL 7,5%, FL 10%; ocasionalmente fórmulas especiales), volumen y fraccionamiento<br>iii. Indicar papilla lactante menor o lactante mayor de acuerdo al desarrollo del niño y en número según tolerancia esperada"
    : edadMeses < 72
      ? "<strong>Preescolares:</strong> Régimen preescolar común / liviano / blando sin residuos / líquido / hídrico"
      : "<strong>Escolares y adolescentes:</strong> Régimen escolar común / liviano / blando sin residuos / líquido / hídrico";

  container.innerHTML = `
    <div class="clinical-note success p-3 rounded-md">
      <p class="font-semibold text-primary"><i class="fas fa-child mr-1"></i>Orientación por edad</p>
      <p class="mt-1">${grupo}</p>
    </div>
    <div>
      <p class="font-semibold text-primary mb-2 mt-4">Lactantes y papillas (aportes por porción indicada)</p>
      ${renderTablaNutricion(NUTRICION_LACTANTES)}
    </div>
    <div>
      <p class="font-semibold text-primary mb-2 mt-4">Fórmulas especiales (aportes por preparación indicada)</p>
      ${renderTablaNutricion(NUTRICION_FORMULAS_ESPECIALES)}
    </div>`;
}

function mostrarNotasClinicas(solucion, condiciones, edadMeses, categoria) {
  const container = document.getElementById("notasClinicas");
  container.innerHTML = "";
  container.classList.remove("hidden");
  const notas = [
    { tipo: 'success', texto: '<strong>Requerimientos diarios:</strong> Na 3-4 mEq/kg/d, K 2-3 mEq/kg/d, Cl 3-4 mEq/kg/d, Ca 50-100 mg/kg/d, Mg 0,4-0,9 mEq/kg/d y P 15-50 mg/kg/d.' },
    { tipo: 'success', texto: '<strong>Potasio-K:</strong><br>1. KCl 10% tiene 1,34 mEq/ml<br>&nbsp;&nbsp;a. Bolo si K < 3 por vía periférica: 0,5 mEq/kg máximo 20 cc diluído al cuarto a pasar en 4 horas<br>2. Yonka (oral) tiene 1,34 mEq K/ml<br>3. PMK 15% tiene 1,1 mEq/ml' },
    { tipo: 'success', texto: '<strong>Sodio-Na:</strong> NaCl 10% tiene 1,71 mEq/ml<br>1. Bolo si Na < 120 1 ml/kg' },
    { tipo: 'success', texto: '<strong>Fósforo-P:</strong><br>1. PMK 15% tiene 1,1 mEq/ml<br>&nbsp;&nbsp;a. Bolo si P < 2,5: 0,5-1 mEq/kg diluído al cuarto a pasar en 4 horas<br>2. Jarabe de Fosfato: 1,1 mEq/ml' },
    { tipo: 'success', texto: '<strong>Magnesio-Mg:</strong> Sulfato de Magnesio 25%<br>a. Bolo 0,1 – 0,2 ml/kg (máximo 5 cc)' },
    { tipo: 'success', texto: '<strong>Calcio-Ca:</strong> Gluconato de Calcio 10% tiene 8,94 mg cada cc<br>a. Bolo en hipocalcemia sintomática 0,5-1 ml/kg (máximo 20 cc) diluido al cuarto en vía periférica a pasar en 1 hora' },
    { tipo: 'success', texto: '<strong>Bicarbonato:</strong> Bicarbonato 2/3 M tiene 0,66mEq/ml<br>- Bicarbonato de sodio 8.4%: ampolla 10 ml (10meq de Na)<br>- 13ml de del 8.4%-->20ml del 2/3 Molar' }
  ];
  if (edadMeses <= 3 && categoria === "mantenimiento") notas.push({ tipo: 'success', texto: 'Paciente ≤ 3 meses sin pérdidas patológicas: se prioriza mezcla Sodio 35.' });
  notas.forEach(nota => {
    const noteDiv = document.createElement("div");
    noteDiv.className = `clinical-note ${nota.tipo} p-3 rounded-md`;
    noteDiv.innerHTML = `<p class="text-sm">${nota.texto}</p>`;
    container.appendChild(noteDiv);
  });
}

function mostrarFormulaHollidaySegar(pesoKg, aporte, mantenimiento, deficit, total24h, electrolitos) {
  const container = document.getElementById("hollidayOriginal");
  const rangoTexto = aporte.rango[0] === aporte.rango[1] ? aporte.rango[0] : `${aporte.rango[0]}-${aporte.rango[1]}`;
  const base = aporte.usaPeso
    ? `${pesoKg.toFixed(2)} kg × ${aporte.factor} ${aporte.unidad}`
    : `${aporte.superficieCorporal.toFixed(3)} m² × ${aporte.factor} ${aporte.unidad}`;
  container.innerHTML = `
    <p class="font-medium mb-2">Cálculo de aportes (${aporte.label}):</p>
    <p class="text-sm bg-white p-2 rounded border border-secondary mb-4">${base} = ${Math.round(total24h)} mL/día. Rango usado: ${rangoTexto} ${aporte.unidad}.</p>
    ${!aporte.usaPeso ? `<p class="text-sm bg-white p-2 rounded border border-secondary mb-4">Superficie corporal = (peso × 4 + 7) / (90 + peso) = ${aporte.superficieCorporal.toFixed(3)} m².</p>` : ''}
    <p class="font-medium mb-2">Requerimientos diarios de electrolitos:</p>
    <ul class="text-sm space-y-1 list-disc pl-5">
      <li>Líquidos de mantención: ${Math.round(mantenimiento)} mL/24h</li>
      <li>Adicional por pérdidas/deshidratación: ${Math.round(deficit)} mL/24h</li>
      <li>Sodio: ${electrolitos.na[0].toFixed(1)}-${electrolitos.na[1].toFixed(1)} mEq/d</li>
      <li>Potasio: ${electrolitos.k[0].toFixed(1)}-${electrolitos.k[1].toFixed(1)} mEq/d</li>
      <li>Cloro: ${electrolitos.cl[0].toFixed(1)}-${electrolitos.cl[1].toFixed(1)} mEq/d</li>
      <li>Calcio: ${electrolitos.ca[0].toFixed(0)}-${electrolitos.ca[1].toFixed(0)} mg/d</li>
      <li>Magnesio: ${electrolitos.mg[0].toFixed(1)}-${electrolitos.mg[1].toFixed(1)} mEq/d</li>
      <li>Fósforo: ${electrolitos.p[0].toFixed(0)}-${electrolitos.p[1].toFixed(0)} mg/d</li>
    </ul>`;
}

function copiarIndicaciones() {
  const peso = parseFloat(document.getElementById("peso").value) / 1000;
  const edadVal = document.getElementById("edad").value;
  const unidadEdad = document.getElementById("unidadEdad");
  const unidadText = unidadEdad ? unidadEdad.value : "meses";
  const edadStr = edadVal ? `${edadVal} ${unidadText}` : "No especificada";
  const condiciones = obtenerCondicionesSeleccionadas().join(", ") || "Ninguna";
  
  const mantenimiento = document.getElementById("mantenimientoResult").textContent;
  const deficit = document.getElementById("deficitResult").textContent;
  const total24h = document.getElementById("total24hResult").textContent;
  const flujoHorario = document.getElementById("flujoHorarioResult").textContent;
  
  const solucionElem = document.querySelector("#solucionRecomendadaDetalle .solution-card");
  const solucionNombre = solucionElem.querySelector("h4").textContent;
  const composicion = Array.from(solucionElem.querySelectorAll("ul:first-of-type li")).map(li => li.textContent).join('\n   • ');
  const velocidad = `Velocidad de infusión: ${document.getElementById("flujoHorarioResult").textContent} mL/h`;
  
  const textoACopiar = `INDICACIÓN DE HIDRATACIÓN PARENTERAL - PEDIATRÍA\n\n` +
                     `DATOS DEL PACIENTE\n` +
                     `• Peso: ${peso.toFixed(3)} kg\n` +
                     `• Edad: ${edadStr}\n` +
                     `• Condiciones relevantes: ${condiciones}\n\n` +
                     
                     `REQUERIMIENTOS CALCULADOS\n` +
                     `• Mantenimiento: ${mantenimiento} mL/24h\n` +
                     `• Déficit: ${deficit} mL\n` +
                     `• Total 24h: ${total24h} mL\n` +
                     `• Flujo horario: ${flujoHorario} mL/h\n\n` +
                     
                     `SOLUCIÓN RECOMENDADA\n` +
                     `• ${solucionNombre}\n` +
                     `• Composición:\n   • ${composicion}\n` +
                     `   • ${velocidad}\n\n` +
                     
                     `OBSERVACIONES\n` +
                     `• Monitorizar electrolitos séricos (Na, K) cada 24h inicialmente\n` +
                     `• Controlar balance hídrico estricto\n` +
                     `• Revaluar requerimientos diariamente\n` +
                     `• Ajustar según respuesta clínica y laboratorio`;
  
  navigator.clipboard.writeText(textoACopiar)
    .then(() => {
      const btn = document.querySelector("button[onclick='copiarIndicaciones()']");
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i> ¡Copiado!';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error("Error al copiar: ", err);
      alert("No se pudo copiar al portapapeles. Intente manualmente.");
    });
}

function exportarImagen() {
  const resultado = document.getElementById("resultado");
  if (!resultado) {
    alert("No hay resultados para exportar.");
    return;
  }
  
  html2canvas(resultado).then(canvas => {
    const enlace = document.createElement("a");
    enlace.download = "indicacion_hidratacion.png";
    enlace.href = canvas.toDataURL();
    enlace.click();
  });
}

function obtenerCondicionesSeleccionadas() {
  return Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
         .map(cb => cb.value);
}

function updateOnlineStatus() {
  const offlineStatus = document.getElementById('offlineStatus');
  if (navigator.onLine) {
    offlineStatus.style.display = 'none';
  } else {
    offlineStatus.style.display = 'block';
  }
}

// Local Storage Handlers
function saveFormData() {
  const data = {
    peso: document.getElementById('peso').value,
    edad: document.getElementById('edad').value,
    unidadEdad: document.getElementById('unidadEdad').value,
    deshidratacion: document.getElementById('deshidratacion').value,
    tempF: document.getElementById('tempF').value,
    tempA: document.getElementById('tempA').value,
    naBasal: document.getElementById('naBasal').value,
    kBasal: document.getElementById('kBasal').value,
    clBasal: document.getElementById('clBasal').value,
    solucionBase: document.querySelector('input[name="solucionBase"]:checked')?.value,
    condiciones: obtenerCondicionesSeleccionadas()
  };
  localStorage.setItem('pedicalc_formData', JSON.stringify(data));
}

function loadFormData() {
  try {
    const saved = localStorage.getItem('pedicalc_formData');
    if (saved) {
      const data = JSON.parse(saved);
      if(data.peso) document.getElementById('peso').value = data.peso;
      if(data.edad) document.getElementById('edad').value = data.edad;
      if(data.unidadEdad) document.getElementById('unidadEdad').value = data.unidadEdad;
      if(data.deshidratacion) document.getElementById('deshidratacion').value = data.deshidratacion;
      if(data.tempF) document.getElementById('tempF').value = data.tempF;
      if(data.tempA) document.getElementById('tempA').value = data.tempA;
      if(data.naBasal) document.getElementById('naBasal').value = data.naBasal;
      if(data.kBasal) document.getElementById('kBasal').value = data.kBasal;
      if(data.clBasal) document.getElementById('clBasal').value = data.clBasal;
      
      if(data.solucionBase) {
        const rb = document.querySelector(`input[name="solucionBase"][value="${data.solucionBase}"]`);
        if (rb) rb.checked = true;
      }
      
      if(data.condiciones && Array.isArray(data.condiciones)) {
        data.condiciones.forEach(c => {
          const cb = document.getElementById(c);
          if(cb) cb.checked = true;
        });
      }
      
      if(data.peso) document.getElementById('peso').dispatchEvent(new Event('input'));
      if(data.edad) document.getElementById('edad').dispatchEvent(new Event('input'));
      toggleTemperaturas();
      // UI is updated via CSS
    }
  } catch(e) {
    console.error("Error loading saved data", e);
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  
  document.getElementById("peso").addEventListener("input", function() {
    const validation = validateWeight(parseFloat(this.value));
    if (!validation.valid && this.value) {
      showError("peso", validation.message);
    } else {
      clearError("peso");
    }
    document.getElementById("btnCalcular").disabled = !validation.valid;
  });

  function updateAgeValidation() {
    let val = parseFloat(document.getElementById("edad").value);
    if (isNaN(val)) {
      clearError("edad");
      return;
    }
    const unidadEdad = document.getElementById("unidadEdad");
    if (unidadEdad && unidadEdad.value === "años") {
      val *= 12;
    }
    const validation = validateAge(val);
    if (!validation.valid) {
      showError("edad", validation.message);
    } else {
      clearError("edad");
    }
  }

  document.getElementById("edad").addEventListener("input", updateAgeValidation);
  const selUnidad = document.getElementById("unidadEdad");
  if (selUnidad) {
    selUnidad.addEventListener("change", updateAgeValidation);
  }

  document.querySelectorAll('#checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', toggleTemperaturas);
  });
  
  // Attach local storage save on change for all inputs
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveFormData);
    el.addEventListener('keyup', saveFormData);
  });

  // Load saved data
  loadFormData();

  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

