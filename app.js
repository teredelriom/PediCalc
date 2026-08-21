// Constantes de validación fisiológica
const MAX_WEIGHT = 150000; // 150kg en gramos
const MIN_WEIGHT = 500; // 500g viable
const MAX_AGE_MONTHS = 216; // 18 años expresados en meses
const MIN_TEMP = 34;
const MAX_TEMP = 43;
const MIN_AMBIENT_TEMP = 20;
const MAX_AMBIENT_TEMP = 50;

// Datos clínicos iniciales
const APORTE_RANGOS = {
  mantenimiento: { kg: [100, 150], m2: [2000, 2500], label: "Volumen mantención" },
  patologicas: { kg: [180, 180], m2: [2800, 2800], label: "Pérdidas patológicas" },
  leve: { kg: [200, 220], m2: [3000, 3200], label: "Deshidratación leve" },
  moderada: { kg: [220, 240], m2: [3200, 3500], label: "Deshidratación moderada" },
  severa: { kg: [250, 270], m2: [3500, 4000], label: "Deshidratación severa" }
};

const MACRONUTRIENTES_NPT = {
  carbohidratos: { min: 50, max: 55, kcalG: 3.4, maxGlucosaMin: 12.5 },
  proteinas: { min: 10, max: 15, kcalG: 4.0, prematurosRango: [1.5, 4.0] },
  lipidos: { min: 30, max: 35, kcalG: 9.5, maxTrigliceridos: 400 },
  oligoelementos: { basal: [0.2, 0.3], colestasis: 0.1, topeMl: 5.0 }
};

const SOLUCIONES_ELECTROLITICAS = {
  cloruroSodio17_7: { meqMl: 3.4 }, // Concentrado
  cloruroSodio10: { meqMl: 1.71 },
  salina0_9: { meq100cc: 15.4 },
  hipertonica3: { meq100cc: 51.3 },
  hipotonica0_45: { meq100cc: 7.7 },
  cloruroPotasio10: { meqMl: 1.34 },
  gluconatoCalcio10: { mgElementalMl: 9.0, meqMl: 0.465 },
  sulfatoMagnesio25: { mgMl: 100, meqMl: 0.81 }
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
    indicacion: "Deshidratación con acidosis metabólica severa (HCO3 < 15)",
    componentes: ["S. Glucosado 5% 500 cc", "NaCl 10% 10 cc", "NaHCO3 2/3 M 26 cc (o NaHCO3 8,4% 17 ml)", "KCl 10% 7,5 cc"],
    naPorLitro: 70,
    incluyeK: true
  },
  sinKcl: {
    nombre: "Mezcla sin KCl",
    indicacion: "Deshidratación severa / anuria u oliguria",
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

// Registro de Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
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

// Manejo de instalación PWA
let deferredPrompt;
const installContainer = document.getElementById('installContainer');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installContainer) installContainer.classList.remove('hidden');
  if (installBtn) {
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
});

window.addEventListener('appinstalled', () => {
  if (installContainer) installContainer.classList.add('hidden');
  deferredPrompt = null;
});

// Funciones de validación
function validateWeight(weight) {
  if (!weight || isNaN(weight)) return { valid: false, message: "Ingrese un peso válido" };
  if (weight < MIN_WEIGHT) return { valid: false, message: `Peso mínimo viable es ${MIN_WEIGHT}g` };
  if (weight > MAX_WEIGHT) return { valid: false, message: `Peso máximo viable es ${MAX_WEIGHT / 1000}kg` };
  return { valid: true };
}

function validateAge(age) {
  if (age !== "" && (isNaN(age) || age < 0)) return { valid: false, message: "Ingrese una edad válida" };
  if (age > MAX_AGE_MONTHS) return { valid: false, message: "Edad máxima pediátrica es 216 meses (18 años)" };
  return { valid: true };
}

function validateGestationalAge(weeks) {
  if (weeks && (isNaN(weeks) || weeks < 20 || weeks > 43)) {
    return { valid: false, message: "Edad gestacional debe estar entre 20 y 43 semanas" };
  }
  return { valid: true };
}

function validateHeight(height) {
  if (height && (isNaN(height) || height < 30 || height > 220)) {
    return { valid: false, message: "Talla debe estar entre 30cm y 220cm" };
  }
  return { valid: true };
}

function validateCreatinine(cr) {
  if (cr && (isNaN(cr) || cr < 0.1 || cr > 15)) {
    return { valid: false, message: "Creatinina debe estar entre 0.1 y 15 mg/dL" };
  }
  return { valid: true };
}

function validateTemperature(temp, isBodyTemp = true) {
  if (!temp || isNaN(temp)) return { valid: false, message: "Ingrese un valor numérico" };
  const min = isBodyTemp ? MIN_TEMP : MIN_AMBIENT_TEMP;
  const max = isBodyTemp ? MAX_TEMP : MAX_AMBIENT_TEMP;
  if (temp < min || temp > max) {
    return { valid: false, message: `Debe estar entre ${min}°C y ${max}°C` };
  }
  return { valid: true };
}

// Interfaz de Usuario: Errores
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

function toggleTemperaturas() {
  const condiciones = obtenerCondicionesSeleccionadas();
  const tempFiebre = document.getElementById("tempFiebre");
  const tempAmbiente = document.getElementById("tempAmbiente");
  if (tempFiebre) tempFiebre.classList.toggle("hidden", !condiciones.includes("fiebre"));
  if (tempAmbiente) tempAmbiente.classList.toggle("hidden", !condiciones.includes("ambienteCalido"));
}

function getSelectedSolutionPercentage() {
  const selected = document.querySelector('input[name="solucionBase"]:checked');
  return selected ? parseInt(selected.value) : 5;
}

function obtenerCondicionesSeleccionadas() {
  return Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
    .map(cb => cb.value);
}

// Módulo de Matemáticas Clínicas
const ClinicalMath = {
  hollidaySegar: function(pesoKg) {
    let ml = 0;
    if (pesoKg <= 10) ml = pesoKg * 100;
    else if (pesoKg <= 20) ml = 1000 + ((pesoKg - 10) * 50);
    else ml = 1500 + ((pesoKg - 20) * 20);
    return ml;
  },
  superficieCorporal: function(pesoKg) {
    return ((pesoKg * 4) + 7) / (90 + pesoKg);
  },
  schwartzGFR: function(tallaCm, creatininaMgDl) {
    return (0.413 * tallaCm) / creatininaMgDl;
  },
  promedioRango: function(rango) {
    return (rango[0] + rango[1]) / 2;
  },
  calcularAporteDiario: function(pesoKg, categoria, aporteRangos) {
    const rango = aporteRangos[categoria];
    const usaPeso = pesoKg >= 3 && pesoKg <= 8;
    const superficieCorporal = this.superficieCorporal(pesoKg);
    const unidad = usaPeso ? "cc/kg/día" : "cc/m2";
    const rangoEspecifico = usaPeso ? rango.kg : rango.m2;
    const factor = this.promedioRango(rangoEspecifico);
    const total = usaPeso ? pesoKg * factor : superficieCorporal * factor;
    
    return { 
      total, 
      rango: rangoEspecifico, 
      unidad, 
      factor, 
      usaPeso, 
      superficieCorporal, 
      label: rango.label 
    };
  },
  calcularGramosGlucosa: function(volumenMl, porcentajeGlucosa) {
    return (volumenMl * porcentajeGlucosa) / 100;
  },
  checkPotassiumToxicity: function(potassiumMEq, pesoKg) {
    const meqPerKgDay = potassiumMEq / pesoKg;
    return {
      isToxic: meqPerKgDay > 4,
      limit: 4,
      current: meqPerKgDay
    };
  },
  calcularRequerimientosElectrolitos: function(pesoKg) {
    return {
      na: [3 * pesoKg, 4 * pesoKg],
      k: [2 * pesoKg, 3 * pesoKg],
      cl: [3 * pesoKg, 4 * pesoKg],
      ca: [50 * pesoKg, 100 * pesoKg],
      mg: [0.4 * pesoKg, 0.9 * pesoKg],
      p: [15 * pesoKg, 50 * pesoKg]
    };
  }
};

Object.assign(ClinicalMath, {
  superficieCorporalExacta: function(pesoKg) {
    if (pesoKg < 3 || pesoKg > 8) return ((pesoKg * 4) + 7) / (90 + pesoKg);
    return null;
  },
  concentracionColoide: function(gramosTotales, volumenTotal) {
    return (gramosTotales * 100) / volumenTotal;
  },
  calculoAlbumina: function(volumenCalculado) {
    return (volumenCalculado / 100) * 5;
  },
  correccionHiponatremia: function(pesoKg, naIdeal, naReal) {
    return pesoKg * 0.6 * (naIdeal - naReal);
  },
  aguaLibreHipernatremia: function(pesoKg, naReal, naIdeal) {
    return pesoKg * 0.6 * ((naReal / naIdeal) - 1);
  },
  calcioCorregido: function(caSerico, albumina) {
    return caSerico - albumina + 4;
  },
  anionGap: function(na, k, hco3, cl) {
    return (na + k) - (hco3 + cl);
  },
  anionGapUrinario: function(naUr, kUr, clUr) {
    return naUr + kUr - clUr;
  },
  osmolaridadEfectiva: function(na, k, glucemia) {
    return 2 * (na + k) + (glucemia / 18);
  },
  correccionBicarbonato: function(eb, pesoKg) {
    return eb * 0.3 * pesoKg;
  },
  sodioCorregidoCAD: function(na, glucemia) {
    return na + 0.016 * (glucemia - 100);
  },
  insulinaNPHTransicion: function(mlInfusion24h) {
    return mlInfusion24h / 10;
  },
  capacidadGastricaNeonatal: function(pesoGramos) {
    return Math.floor(pesoGramos / 100) - 3;
  },
  esquemaParkland: function(pesoKg, scqPct) {
    return 4 * pesoKg * scqPct;
  },
  esquemaGalveston: function(sc, scqPct) {
    return 5000 * sc * (scqPct / 100);
  }
});

function obtenerCategoriaAporte(deficitPct, condiciones) {
  if (deficitPct >= 100) return "severa";
  if (deficitPct >= 75) return "moderada";
  if (deficitPct >= 50) return "leve";
  if (condiciones.includes("perdidasPatologicas")) return "patologicas";
  return "mantenimiento";
}

function seleccionarPreparacion(condiciones, edadMeses, categoria) {
  if (condiciones.includes("hiponatremia")) return PREPARACIONES.sodio105;
  if (categoria === "severa" || condiciones.includes("oliguria") || condiciones.includes("anuria")) return PREPARACIONES.sinKcl;
  if (condiciones.includes("acidosisSevera")) return PREPARACIONES.sodio70Alcalinizante;
  if (condiciones.includes("perdidasPatologicas") || edadMeses > 3) return PREPARACIONES.sodio70;
  return PREPARACIONES.sodio35;
}

function procesarNPT(pesoKg) {
  const checkboxNpt = document.getElementById("activarNPT");
  if (!checkboxNpt || !checkboxNpt.checked || isNaN(pesoKg)) return;

  const prot = parseFloat(document.getElementById("nptProteinas").value) || 2.0;
  const lip = parseFloat(document.getElementById("nptLipidos").value) || 1.0;
  const vig = parseFloat(document.getElementById("nptVig").value) || 5.0;

  // Calculos de macronutrientes
  const gramosProt = pesoKg * prot;
  const caloriasProt = gramosProt * MACRONUTRIENTES_NPT.proteinas.kcalG;

  const gramosLip = pesoKg * lip;
  const caloriasLip = gramosLip * MACRONUTRIENTES_NPT.lipidos.kcalG;

  // Glucosa a partir de VIG (mg/kg/min -> gramos/día)
  // gramos = (VIG * peso * 1440) / 1000
  const gramosGluc = (vig * pesoKg * 1440) / 1000;
  const caloriasGluc = gramosGluc * MACRONUTRIENTES_NPT.carbohidratos.kcalG;

  const caloriasTotales = caloriasProt + caloriasLip + caloriasGluc;
  const pctProt = (caloriasProt / caloriasTotales) * 100;
  const pctLip = (caloriasLip / caloriasTotales) * 100;
  const pctGluc = (caloriasGluc / caloriasTotales) * 100;

  let alertas = "";
  if (pctProt < MACRONUTRIENTES_NPT.proteinas.min || pctProt > MACRONUTRIENTES_NPT.proteinas.max) {
    alertas += `<li>Proteínas (${pctProt.toFixed(1)}%) fuera de rango óptimo (${MACRONUTRIENTES_NPT.proteinas.min}-${MACRONUTRIENTES_NPT.proteinas.max}%).</li>`;
  }
  if (pctLip < MACRONUTRIENTES_NPT.lipidos.min || pctLip > MACRONUTRIENTES_NPT.lipidos.max) {
    alertas += `<li>Lípidos (${pctLip.toFixed(1)}%) fuera de rango óptimo (${MACRONUTRIENTES_NPT.lipidos.min}-${MACRONUTRIENTES_NPT.lipidos.max}%).</li>`;
  }
  if (pctGluc < MACRONUTRIENTES_NPT.carbohidratos.min || pctGluc > MACRONUTRIENTES_NPT.carbohidratos.max) {
    alertas += `<li>Carbohidratos (${pctGluc.toFixed(1)}%) fuera de rango óptimo (${MACRONUTRIENTES_NPT.carbohidratos.min}-${MACRONUTRIENTES_NPT.carbohidratos.max}%).</li>`;
  }

  const nptHtml = `
    <strong>Cálculo de NPT (Basado en ${pesoKg.toFixed(2)} kg):</strong><br>
    <ul class="list-disc pl-5 mt-2">
      <li><strong>Proteínas (${prot.toFixed(1)} g/kg/d):</strong> ${gramosProt.toFixed(1)} g/día (${caloriasProt.toFixed(0)} kcal = ${pctProt.toFixed(1)}%)</li>
      <li><strong>Lípidos (${lip.toFixed(1)} g/kg/d):</strong> ${gramosLip.toFixed(1)} g/día (${caloriasLip.toFixed(0)} kcal = ${pctLip.toFixed(1)}%)</li>
      <li><strong>Glucosa (VIG ${vig.toFixed(1)}):</strong> ${gramosGluc.toFixed(1)} g/día (${caloriasGluc.toFixed(0)} kcal = ${pctGluc.toFixed(1)}%)</li>
    </ul>
    <div class="mt-2 text-primary font-bold border-t border-primary/20 pt-2">
      Calorías Totales: ${caloriasTotales.toFixed(0)} kcal/día (${(caloriasTotales/pesoKg).toFixed(0)} kcal/kg/día)
    </div>
    ${alertas ? `<ul class="text-danger mt-2 text-xs list-disc pl-5">${alertas}</ul>` : ''}
  `;

  const nptDiv = document.createElement("div");
  nptDiv.className = `clinical-note success p-3 rounded-md mb-2`;
  nptDiv.innerHTML = `<p class="text-sm">${nptHtml}</p>`;
  document.getElementById("notasClinicas").appendChild(nptDiv);
}

function calcularSolucionRecomendada(total24h, preparacion, condiciones) {
  const VOLUMEN_BASE_PREPARACION = 500; 
  const MEQ_POTASIO_POR_BASE = 10.05; 
  const porcentajeGlucosa = getSelectedSolutionPercentage();
  const factor = total24h / VOLUMEN_BASE_PREPARACION;
  
  const componentesEscalados = preparacion.componentes.map(item => {
    const match = item.match(/^(.*?)(\d+(?:[,.]\d+)?)\s*(cc|ml)/i);
    if (!match) return item;
    const valor = parseFloat(match[2].replace(',', '.')) * factor;
    const componente = match[1].replace(/S\. Glucosado \d+%/i, `S. Glucosado ${porcentajeGlucosa}%`);
    return `${componente}${valor.toFixed(1).replace('.', ',')} ${match[3]}`;
  });

  const solucion = {
    ...preparacion,
    volumen: Math.round(total24h),
    porcentajeGlucosa,
    componentesEscalados,
    sodioTotal: (preparacion.naPorLitro * (total24h / 1000)).toFixed(1),
    potasioTotal: preparacion.incluyeK ? (MEQ_POTASIO_POR_BASE * factor).toFixed(1) : "0",
    glucosaTotal: ClinicalMath.calcularGramosGlucosa(total24h, porcentajeGlucosa).toFixed(1)
  };
  
  mostrarSolucionRecomendada(solucion);
  return solucion;
}

// Rutinas de visualización en el DOM
function mostrarSolucionRecomendada(solucion) {
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
            <li><span class="font-medium">Glucosa:</span> SG ${solucion.porcentajeGlucosa}% (${solucion.glucosaTotal} g/24h)</li>
            <li><span class="font-medium">Velocidad:</span> ${(solucion.volumen / 24).toFixed(1)} mL/h</li>
          </ul>
        </div>
      </div>
      ${!solucion.incluyeK ? `<div class="mt-4 p-3 rounded-md clinical-note warning"><p class="font-semibold text-danger"><i class="fas fa-exclamation-triangle mr-1"></i>Sin KCl</p><p class="mt-1 text-sm">No agregar potasio en deshidratación severa u oliguria hasta confirmar diuresis y niveles séricos.</p></div>` : ''}
    </div>`;
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
    ? "<strong>Lactantes:</strong><br>i. La lactancia materna es la alimentación principal y debemos promoverla (libre demanda)<br>ii. Indicar fórmula láctea y fraccionamiento<br>iii. Indicar papilla lactante según tolerancia"
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

function mostrarNotasClinicas(solucion, edadMeses, categoria, pesoKg) {
  const container = document.getElementById("notasClinicas");
  container.innerHTML = "";
  container.classList.remove("hidden");
  
  if (solucion.incluyeK) {
    const kMeq = (solucion.volumen / 500) * 10.05; 
    const checkK = ClinicalMath.checkPotassiumToxicity(kMeq, pesoKg);
    if (checkK.isToxic) {
      const toxicDiv = document.createElement("div");
      toxicDiv.className = "clinical-note warning p-3 rounded-md mb-2";
      toxicDiv.innerHTML = `<p class="font-bold text-danger"><i class="fas fa-exclamation-triangle mr-1"></i> ALERTA DE TOXICIDAD - POTASIO!</p><p class="text-sm mt-1">El aporte de K+ proyectado (${checkK.current.toFixed(2)} mEq/kg/día) supera el límite máximo seguro documentado de ${checkK.limit} mEq/kg/día. Reduzca la dosis basal.</p>`;
      container.appendChild(toxicDiv);
    }
  }
  
  const notas = [
    { tipo: 'success', texto: '<strong>Requerimientos diarios:</strong> Na 3-4 mEq/kg/d, K 2-3 mEq/kg/d, Cl 3-4 mEq/kg/d, Ca 50-100 mg/kg/d, Mg 0,4-0,9 mEq/kg/d y P 15-50 mg/kg/d.' },
    { tipo: 'success', texto: '<strong>Potasio-K:</strong><br>1. KCl 10% tiene 1,34 mEq/ml<br>&nbsp;&nbsp;a. Bolo si K < 3 por vía periférica: 0,5 mEq/kg máximo 20 cc diluído al cuarto a pasar en 4 horas<br>2. Yonka (oral) tiene 1,34 mEq K/ml<br>3. PMK 15% tiene 1,1 mEq/ml' },
    { tipo: 'success', texto: '<strong>Sodio-Na:</strong> NaCl 10% tiene 1,71 mEq/ml<br>1. Bolo si Na < 120 1 ml/kg' },
    { tipo: 'success', texto: '<strong>Fósforo-P:</strong><br>1. PMK 15% tiene 1,1 mEq/ml<br>&nbsp;&nbsp;a. Bolo si P < 2,5: 0,5-1 mEq/kg diluído al cuarto a pasar en 4 horas<br>2. Jarabe de Fosfato: 1,1 mEq/ml' },
    { tipo: 'success', texto: '<strong>Magnesio-Mg:</strong> Sulfato de Magnesio 25%<br>a. Bolo 0,1 – 0,2 ml/kg (máximo 5 cc)' },
    { tipo: 'success', texto: '<strong>Calcio-Ca:</strong> Gluconato de Calcio 10% tiene 8,94 mg cada cc<br>a. Bolo en hipocalcemia sintomática 0,5-1 ml/kg (máximo 20 cc) diluido al cuarto en vía periférica a pasar en 1 hora' },
    { tipo: 'success', texto: '<strong>Bicarbonato:</strong> Bicarbonato 2/3 M tiene 0,66mEq/ml<br>- Bicarbonato de sodio 8.4%: ampolla 10 ml (10meq de Na)<br>- 13ml de del 8.4%-->20ml del 2/3 Molar' }
  ];
  
  if (edadMeses <= 3 && categoria === "mantenimiento") {
    notas.push({ tipo: 'success', texto: 'Paciente ≤ 3 meses sin pérdidas patológicas: se prioriza mezcla Sodio 35.' });
  }
  
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
    ? `${pesoKg.toFixed(2)} kg x ${aporte.factor} ${aporte.unidad}`
    : `${aporte.superficieCorporal.toFixed(3)} m2 x ${aporte.factor} ${aporte.unidad}`;
    
  container.innerHTML = `
    <p class="font-medium mb-2">Cálculo de aportes (${aporte.label}):</p>
    <p class="text-sm bg-white p-2 rounded border border-secondary mb-4">${base} = ${Math.round(total24h)} mL/día. Rango usado: ${rangoTexto} ${aporte.unidad}.</p>
    ${!aporte.usaPeso ? `<p class="text-sm bg-white p-2 rounded border border-secondary mb-4">Superficie corporal = (peso x 4 + 7) / (90 + peso) = ${aporte.superficieCorporal.toFixed(3)} m2.</p>` : ''}
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

// Ejecución Principal
function calcular() {
  ['peso', 'edad', 'edadGestacional', 'talla', 'creatinina', 'tempF', 'tempA'].forEach(id => clearError(id));
  
  const peso = parseFloat(document.getElementById("peso").value);
  const pesoValidation = validateWeight(peso);
  if (!pesoValidation.valid) { showError("peso", pesoValidation.message); return; }
  
  let edad = parseFloat(document.getElementById("edad").value) || 0;
  const unidadEdad = document.getElementById("unidadEdad");
  if (unidadEdad && unidadEdad.value === "años") edad *= 12;
  const edadValidation = validateAge(edad);
  if (!edadValidation.valid) { showError("edad", edadValidation.message); return; }
  
  const edadGest = parseFloat(document.getElementById("edadGestacional").value);
  if (!isNaN(edadGest)) {
    const egVal = validateGestationalAge(edadGest);
    if (!egVal.valid) { showError("edadGestacional", egVal.message); return; }
  }
  
  const talla = parseFloat(document.getElementById("talla").value);
  if (!isNaN(talla)) {
    const tallaVal = validateHeight(talla);
    if (!tallaVal.valid) { showError("talla", tallaVal.message); return; }
  }
  
  const creatinina = parseFloat(document.getElementById("creatinina").value);
  if (!isNaN(creatinina)) {
    const crVal = validateCreatinine(creatinina);
    if (!crVal.valid) { showError("creatinina", crVal.message); return; }
  }
  
  const pesoKg = peso / 1000;
  const deficitPct = parseFloat(document.getElementById("deshidratacion").value);
  const condiciones = obtenerCondicionesSeleccionadas();
  
  const categoria = obtenerCategoriaAporte(deficitPct, condiciones);
  const aporte = ClinicalMath.calcularAporteDiario(pesoKg, categoria, APORTE_RANGOS);
  const total24h = aporte.total;
  const mantenimiento = ClinicalMath.calcularAporteDiario(pesoKg, "mantenimiento", APORTE_RANGOS).total;
  const deficit = Math.max(total24h - mantenimiento, 0);
  
  const preparacion = seleccionarPreparacion(condiciones, edad, categoria);
  
  document.getElementById("mantenimientoResult").textContent = Math.round(mantenimiento);
  document.getElementById("deficitResult").textContent = Math.round(deficit);
  document.getElementById("total24hResult").textContent = Math.round(total24h);
  document.getElementById("flujoHorarioResult").textContent = (total24h / 24).toFixed(1);
  
  const gfrCard = document.getElementById("gfrCard");
  const schwartzRef = document.getElementById("schwartzRef");
  if (talla && creatinina) {
    const gfr = ClinicalMath.schwartzGFR(talla, creatinina);
    document.getElementById("gfrResult").textContent = gfr.toFixed(1);
    gfrCard.classList.remove("hidden");
    schwartzRef.classList.remove("hidden");
  } else {
    gfrCard.classList.add("hidden");
    schwartzRef.classList.add("hidden");
  }
  
  const electrolitos = ClinicalMath.calcularRequerimientosElectrolitos(pesoKg);
  const solucionOptima = calcularSolucionRecomendada(total24h, preparacion);
  
  mostrarFormulaHollidaySegar(pesoKg, aporte, mantenimiento, deficit, total24h, electrolitos);
  mostrarNutricionReferencia(edad);
  mostrarNotasClinicas(solucionOptima, edad, categoria, pesoKg);
  
  // -- Procesar Analítica y Quemados --
  const hco3 = parseFloat(document.getElementById("hco3Real")?.value);
  const cl = parseFloat(document.getElementById("clBasal")?.value);
  const naBasal = parseFloat(document.getElementById("naBasal")?.value);
  const kBasal = parseFloat(document.getElementById("kBasal")?.value);
  const glucemia = parseFloat(document.getElementById("glucemia")?.value);
  const scq = parseFloat(document.getElementById("scq")?.value);
  
  if (!isNaN(pesoKg) && !isNaN(naBasal) && !isNaN(kBasal) && !isNaN(hco3) && !isNaN(cl)) {
    const ag = ClinicalMath.anionGap(naBasal, kBasal, hco3, cl);
    const agDiv = document.createElement("div");
    agDiv.className = `clinical-note warning p-3 rounded-md mb-2`;
    agDiv.innerHTML = `<p class="text-sm"><strong>Anion Gap calculado:</strong> ${ag.toFixed(1)} (Rango normal: 8-12)</p>`;
    document.getElementById("notasClinicas").appendChild(agDiv);
  }

  if (!isNaN(naBasal) && !isNaN(glucemia)) {
    const osmEfectiva = ClinicalMath.osmolaridadEfectiva(naBasal, (kBasal||0), glucemia);
    const naCorregido = ClinicalMath.sodioCorregidoCAD(naBasal, glucemia);
    const osmDiv = document.createElement("div");
    osmDiv.className = `clinical-note warning p-3 rounded-md mb-2`;
    osmDiv.innerHTML = `<p class="text-sm"><strong>Osmolaridad Efectiva:</strong> ${osmEfectiva.toFixed(1)} mOsm/kg | <strong>Na Corregido (CAD):</strong> ${naCorregido.toFixed(1)} mEq/L</p>`;
    document.getElementById("notasClinicas").appendChild(osmDiv);
  }

  if (!isNaN(scq) && scq > 0) {
    const scqLimitada = Math.min(scq, 50);
    let volumenReanimacion = 0;
    let esquemaUtilizado = "";
    if (pesoKg < 10) {
      volumenReanimacion = ClinicalMath.esquemaParkland(pesoKg, scqLimitada);
      esquemaUtilizado = "Parkland (Día 1)";
    } else if (pesoKg <= 30) {
      const sc = ClinicalMath.superficieCorporalExacta(pesoKg);
      if (sc) {
        volumenReanimacion = ClinicalMath.esquemaGalveston(sc, scqLimitada);
        esquemaUtilizado = "Galveston (Día 1)";
      }
    }
    if (volumenReanimacion > 0) {
      const qDiv = document.createElement("div");
      qDiv.className = `clinical-note danger p-3 rounded-md mb-2`;
      qDiv.innerHTML = `<p class="text-sm"><b>Reanimación Quemados (${esquemaUtilizado}):</b> Administrar ${volumenReanimacion.toFixed(0)} mL de Solución Hartman. Pasar 50% en las primeras 8h y 50% en las siguientes 16h. No usar KCl.</p>`;
      document.getElementById("notasClinicas").appendChild(qDiv);
    }
  }

  // -- Procesar Nutrición Parenteral (NPT) --
  procesarNPT(pesoKg);

  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("resultado").scrollIntoView({ behavior: 'smooth' });
}

// Utilidades de Exportación y Guardado
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
  const composicion = Array.from(solucionElem.querySelectorAll(".grid > div:nth-child(1) li")).map(li => li.textContent).join('\n     ');
  const aporteEstimado = Array.from(solucionElem.querySelectorAll(".grid > div:nth-child(2) li")).map(li => li.textContent).join('\n     ');
  
  const textoACopiar = `INDICACIÓN DE HIDRATACIÓN PARENTERAL - PEDIATRÍA\n\n` +
    `DATOS DEL PACIENTE\n  Peso: ${peso.toFixed(3)} kg\n  Edad: ${edadStr}\n  Condiciones relevantes: ${condiciones}\n\n` +
    `REQUERIMIENTOS CALCULADOS\n  Mantenimiento: ${mantenimiento} mL/24h\n  Déficit: ${deficit} mL\n  Total 24h: ${total24h} mL\n  Flujo horario: ${flujoHorario} mL/h\n\n` +
    `SOLUCIÓN RECOMENDADA\n  ${solucionNombre}\n  Composición:\n     ${composicion}\n  Aporte estimado:\n     ${aporteEstimado}\n\n` +
    `OBSERVACIONES\n  Monitorizar electrolitos séricos (Na, K) cada 24h inicialmente\n  Controlar balance hídrico estricto\n  Revaluar requerimientos diariamente`;

  navigator.clipboard.writeText(textoACopiar)
    .then(() => {
      const btn = document.querySelector("button[onclick='copiarIndicaciones()']");
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i> ¡Copiado!';
      setTimeout(() => btn.innerHTML = originalText, 2000);
    }).catch(err => console.error("Error al copiar: ", err));
}

function exportarImagen() {
  const resultado = document.getElementById("resultado");
  if (!resultado) return alert("No hay resultados para exportar.");
  html2canvas(resultado).then(canvas => {
    const enlace = document.createElement("a");
    enlace.download = "indicacion_hidratacion.png";
    enlace.href = canvas.toDataURL();
    enlace.click();
  });
}

function updateOnlineStatus() {
  const offlineStatus = document.getElementById('offlineStatus');
  offlineStatus.style.display = navigator.onLine ? 'none' : 'block';
}

function saveFormData() {
  const data = {
    peso: document.getElementById('peso').value,
    edad: document.getElementById('edad').value,
    unidadEdad: document.getElementById('unidadEdad').value,
    edadGestacional: document.getElementById('edadGestacional')?.value,
    talla: document.getElementById('talla')?.value,
    creatinina: document.getElementById('creatinina')?.value,
    deshidratacion: document.getElementById('deshidratacion').value,
    tempF: document.getElementById('tempF')?.value,
    tempA: document.getElementById('tempA')?.value,
    naBasal: document.getElementById('naBasal')?.value,
    kBasal: document.getElementById('kBasal')?.value,
    clBasal: document.getElementById('clBasal')?.value,
    hco3Real: document.getElementById('hco3Real')?.value,
    excesoBase: document.getElementById('excesoBase')?.value,
    glucemia: document.getElementById('glucemia')?.value,
    albumina: document.getElementById('albumina')?.value,
    scq: document.getElementById('scq')?.value,
    nptProteinas: document.getElementById('nptProteinas')?.value,
    nptLipidos: document.getElementById('nptLipidos')?.value,
    nptVig: document.getElementById('nptVig')?.value,
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
      const fields = [
        'peso', 'edad', 'unidadEdad', 'edadGestacional', 'talla', 'creatinina', 
        'deshidratacion', 'tempF', 'tempA', 'naBasal', 'kBasal', 'clBasal', 
        'hco3Real', 'excesoBase', 'glucemia', 'albumina', 'scq', 
        'nptProteinas', 'nptLipidos', 'nptVig'
      ];
      fields.forEach(f => {
        if(data[f]) {
          const el = document.getElementById(f);
          if (el) el.value = data[f];
        }
      });
      
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
    }
  } catch(e) { console.error("Error loading saved data", e); }
}

// Inicialización de Eventos DOM
document.addEventListener("DOMContentLoaded", () => {
  function setBtnDisabled(isDisabled) {
    document.getElementById("btnCalcular").disabled = isDisabled;
  }

  function attachValidation(id, validateFn) {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", function() {
      if (!this.value) { clearError(id); return; }
      const validation = validateFn(parseFloat(this.value));
      if (!validation.valid) showError(id, validation.message);
      else clearError(id);
      setBtnDisabled(!validation.valid);
    });
  }

  attachValidation("peso", validateWeight);
  attachValidation("talla", validateHeight);
  attachValidation("creatinina", validateCreatinine);
  attachValidation("edadGestacional", validateGestationalAge);

  function updateAgeValidation() {
    let val = parseFloat(document.getElementById("edad").value);
    if (isNaN(val)) { clearError("edad"); return; }
    const unidadEdad = document.getElementById("unidadEdad");
    if (unidadEdad && unidadEdad.value === "años") val *= 12;
    const validation = validateAge(val);
    if (!validation.valid) showError("edad", validation.message);
    else clearError("edad");
    setBtnDisabled(!validation.valid);
  }

  document.getElementById("edad").addEventListener("input", updateAgeValidation);
  const selUnidad = document.getElementById("unidadEdad");
  if (selUnidad) selUnidad.addEventListener("change", updateAgeValidation);

  document.querySelectorAll('#checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', toggleTemperaturas);
  });

  const btnNpt = document.getElementById("activarNPT");
  if (btnNpt) {
    btnNpt.addEventListener("change", function() {
      const div = document.getElementById("nptInputs");
      if (this.checked) div.classList.remove("hidden");
      else div.classList.add("hidden");
    });
  }
  
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveFormData);
    el.addEventListener('keyup', saveFormData);
  });

  loadFormData();
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});
