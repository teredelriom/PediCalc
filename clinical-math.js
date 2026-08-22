/* Pure clinical calculation functions. Keep this file free of DOM access for auditability. */
window.ClinicalMath = {
  superficieCorporal(pesoKg) { return ((pesoKg * 4) + 7) / (90 + pesoKg); },
  schwartzGFR(tallaCm, creatininaMgDl) { return (0.413 * tallaCm) / creatininaMgDl; },
  promedioRango(rango) { return (rango[0] + rango[1]) / 2; },
  calcularAporteDiario(pesoKg, categoria, aporteRangos) {
    const rango = aporteRangos[categoria];
    const usaPeso = pesoKg >= 3 && pesoKg <= 8;
    const superficieCorporal = this.superficieCorporal(pesoKg);
    const rangoEspecifico = usaPeso ? rango.kg : rango.m2;
    const factor = this.promedioRango(rangoEspecifico);
    return { total: usaPeso ? pesoKg * factor : superficieCorporal * factor, rango: rangoEspecifico,
      unidad: usaPeso ? "cc/kg/día" : "cc/m2", factor, usaPeso, superficieCorporal, label: rango.label };
  },
  hollidaySegar(pesoKg) {
    if (pesoKg <= 10) return pesoKg * 100;
    if (pesoKg <= 20) return 1000 + ((pesoKg - 10) * 50);
    return 1500 + ((pesoKg - 20) * 20);
  },
  calcularGramosGlucosa(volumenMl, porcentajeGlucosa) { return (volumenMl * porcentajeGlucosa) / 100; },
  checkPotassiumToxicity(potassiumMEq, pesoKg) {
    const current = potassiumMEq / pesoKg;
    return { isToxic: current > 4, limit: 4, current };
  },
  calcularRequerimientosElectrolitos(pesoKg) {
    return { na: [3 * pesoKg, 4 * pesoKg], k: [2 * pesoKg, 3 * pesoKg], cl: [3 * pesoKg, 4 * pesoKg],
      ca: [50 * pesoKg, 100 * pesoKg], mg: [0.4 * pesoKg, 0.9 * pesoKg], p: [15 * pesoKg, 50 * pesoKg] };
  },
  superficieCorporalExacta(pesoKg) { return pesoKg < 3 || pesoKg > 8 ? this.superficieCorporal(pesoKg) : null; },
  concentracionColoide(gramosTotales, volumenTotal) { return (gramosTotales * 100) / volumenTotal; },
  calculoAlbumina(volumenCalculado) { return (volumenCalculado / 100) * 5; },
  correccionHiponatremia(pesoKg, naIdeal, naReal) { return pesoKg * 0.6 * (naIdeal - naReal); },
  aguaLibreHipernatremia(pesoKg, naReal, naIdeal) { return pesoKg * 0.6 * ((naReal / naIdeal) - 1); },
  calcioCorregido(caSerico, albumina) { return caSerico - albumina + 4; },
  anionGap(na, k, hco3, cl) { return (na + k) - (hco3 + cl); },
  anionGapUrinario(naUr, kUr, clUr) { return naUr + kUr - clUr; },
  osmolaridadEfectiva(na, k, glucemia) { return 2 * (na + k) + (glucemia / 18); },
  correccionBicarbonato(eb, pesoKg) { return eb * 0.3 * pesoKg; },
  sodioCorregidoCAD(na, glucemia) { return na + 0.016 * (glucemia - 100); },
  insulinaNPHTransicion(mlInfusion24h) { return mlInfusion24h / 10; },
  capacidadGastricaNeonatal(pesoGramos) { return Math.floor(pesoGramos / 100) - 3; },
  esquemaParkland(pesoKg, scqPct) { return 4 * pesoKg * scqPct; },
  esquemaGalveston(sc, scqPct) { return 5000 * sc * (scqPct / 100); },
  calcularAporteNeonatal(pesoKg, diasVida) {
    const pretermino = pesoKg <= 1.5;
    let mlKg = 0;
    if (diasVida === 1) mlKg = pretermino ? 90 : 70;
    else if (diasVida === 2) mlKg = pretermino ? 110 : 90;
    else if (diasVida === 3) mlKg = pretermino ? 130 : 110;
    else if (diasVida === 4) mlKg = pretermino ? 150 : 130;
    else mlKg = 155;
    return {
      total: pesoKg * mlKg,
      rango: [mlKg - 10, mlKg + 10],
      unidad: "mL/kg/día",
      factor: mlKg,
      usaPeso: true,
      label: `Neonato (${pretermino ? '≤ 1.5kg' : '> 1.5kg'}, Día ${diasVida})`
    };
  },
  calcularElectrolitosNeonatales(pesoKg, diasVida) {
    if (diasVida <= 2) {
      return { na: [0, 0], k: [0, 0], ca: [50 * pesoKg, 100 * pesoKg], cl: [0,0], mg: [0,0], p: [0,0], restringido: true };
    }
    return {
      na: [3 * pesoKg, 4 * pesoKg],
      k: [1 * pesoKg, 2 * pesoKg],
      cl: [3 * pesoKg, 4 * pesoKg],
      ca: [50 * pesoKg, 100 * pesoKg],
      mg: [0.4 * pesoKg, 0.9 * pesoKg],
      p: [15 * pesoKg, 50 * pesoKg],
      restringido: false
    };
  },
  calcularVIG(volumenMl, porcentajeGlucosa, pesoKg) {
    return (volumenMl * porcentajeGlucosa) / (pesoKg * 144);
  }
};

// Carga el módulo interactivo sin mezclar lógica de interfaz con las fórmulas puras.
if (!document.querySelector('script[data-pedicalc-enhancements]')) {
  const enhancementScript = document.createElement('script');
  enhancementScript.src = 'clinical-enhancements.js';
  enhancementScript.dataset.pedicalcEnhancements = 'true';
  document.head.appendChild(enhancementScript);
}
