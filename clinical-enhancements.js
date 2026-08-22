// PediCalc – interactive clinical enhancements
(function(){
  'use strict';
  const PRESENTATIONS = [
    {id:'nacl10', name:'NaCl 10%', unit:'mEq Na⁺/mL', factor:1.71, ampouleMl:10, element:'Na⁺'},
    {id:'nacl177', name:'NaCl 17,7%', unit:'mEq Na⁺/mL', factor:3.40, ampouleMl:10, element:'Na⁺'},
    {id:'kcl10', name:'KCl 10%', unit:'mEq K⁺/mL', factor:1.34, ampouleMl:10, element:'K⁺'},
    {id:'caglu10', name:'Gluconato de calcio 10%', unit:'mEq Ca²⁺/mL', factor:0.465, ampouleMl:10, element:'Ca²⁺'},
    {id:'mgso425', name:'Sulfato de magnesio 25%', unit:'mEq Mg²⁺/mL', factor:0.81, ampouleMl:10, element:'Mg²⁺'}
  ];
  const NUTRITION = [
    {id:'nan14',name:'NAN 14%',base:'100 mL',kcal:73,protein:1.3,carb:8.1,fat:3.9},
    {id:'fl75',name:'FL 7,5%',base:'100 mL',kcal:72,protein:2.2,carb:9.1,fat:3.0},
    {id:'fl10',name:'FL 10%',base:'100 mL',kcal:79,protein:3.0,carb:10.3,fat:2.9},
    {id:'pediasure20',name:'Pediasure 20%',base:'100 mL',kcal:100,protein:3.0,carb:10.9,fat:4.9},
    {id:'peptijunior10',name:'Peptijunior 10%',base:'100 mL',kcal:52,protein:1.4,carb:5.2,fat:2.8},
    {id:'prenAN20',name:'PreNan 20%',base:'100 mL',kcal:100,protein:2.9,carb:10.6,fat:5.1},
    {id:'neocate10',name:'Neocate 10%',base:'100 mL',kcal:48,protein:1.3,carb:5.4,fat:2.3},
    {id:'nanSL20',name:'NAN sin lactosa 20%',base:'100 mL',kcal:101,protein:2.2,carb:11.7,fat:5.0}
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=id=>{const e=document.getElementById(id); return e&&e.value!==''?Number(e.value):NaN;};
  const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
  function weightKg(){const g=num('peso'); return Number.isFinite(g)?g/1000:NaN;}
  function ensureStyles(){if(document.getElementById('pcx-styles'))return; const s=document.createElement('style'); s.id='pcx-styles'; s.textContent=`
    .pcx-shell{margin-top:1rem;border:1px solid #d9e6e5;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(31,61,60,.07)}
    .pcx-head{padding:1rem 1.1rem;background:linear-gradient(135deg,#effaf8,#f8fbfb);border-bottom:1px solid #d9e6e5}.pcx-head h3{margin:0;color:#246f6a;font-weight:800}.pcx-head p{margin:.25rem 0 0;color:#607271;font-size:.82rem}
    .pcx-tabs{display:flex;gap:.45rem;padding:.7rem;overflow:auto;border-bottom:1px solid #edf1f1}.pcx-tab{white-space:nowrap;border:1px solid #d8e3e2;background:#fff;color:#3e5554;padding:.55rem .75rem;border-radius:10px;font-weight:700;font-size:.82rem;cursor:pointer}.pcx-tab.active{background:#3fb8af;color:#fff;border-color:#3fb8af}.pcx-pane{display:none;padding:1rem}.pcx-pane.active{display:block}.pcx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem}.pcx-field label{display:block;font-size:.75rem;font-weight:700;color:#46605e;margin-bottom:.3rem}.pcx-field input,.pcx-field select{width:100%;padding:.65rem .7rem;border:1px solid #ccd9d8;border-radius:9px;background:#fff}.pcx-unit{font-size:.72rem;color:#738280;margin-top:.2rem}.pcx-results{margin-top:1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:.65rem}.pcx-kpi{padding:.8rem;border-radius:11px;background:#f5f9f8;border:1px solid #e1eceb}.pcx-kpi .v{font-size:1.25rem;font-weight:800;color:#246f6a}.pcx-kpi .l{font-size:.7rem;color:#687876;margin-top:.15rem}.pcx-callout{padding:.8rem;border-radius:10px;margin-top:.8rem;background:#f7fbfa;border-left:4px solid #3fb8af;font-size:.78rem;color:#4f6260}.pcx-warning{background:#fff8f0;border-left-color:#f59e0b}.pcx-prep{padding:1rem;border-radius:12px;background:#f5f9f8;border:1px solid #dce9e7;margin-top:1rem}.pcx-prep strong{color:#246f6a}.pcx-muted{color:#70807e;font-size:.72rem}.pcx-bar{height:9px;background:#e9eeee;border-radius:20px;overflow:hidden;margin-top:.45rem}.pcx-bar>span{display:block;height:100%;background:#3fb8af;border-radius:20px}.pcx-formula{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#f8faf9;padding:.65rem;border-radius:8px;font-size:.73rem;white-space:pre-wrap}
  `; document.head.appendChild(s);}
  function panel(){
    const sec=document.getElementById('sec-hidratacion'); if(!sec||document.getElementById('pcx-panel'))return;
    const el=document.createElement('div'); el.id='pcx-panel'; el.className='pcx-shell'; el.innerHTML=`
      <div class="pcx-head"><h3><i class="fas fa-layer-group mr-2"></i>Módulo clínico interactivo</h3><p>Aportes diarios, balance de 24 h, nutrición y preparación de reposiciones a partir de presentaciones seleccionadas.</p></div>
      <div class="pcx-tabs">
        <button type="button" class="pcx-tab active" data-pane="daily">Aportes diarios</button>
        <button type="button" class="pcx-tab" data-pane="balance">Balance 24 h</button>
        <button type="button" class="pcx-tab" data-pane="nutrition">Aporte nutricional</button>
        <button type="button" class="pcx-tab" data-pane="replacement">Reposición</button>
      </div>
      <section class="pcx-pane active" data-section="daily">${dailyHTML()}</section>
      <section class="pcx-pane" data-section="balance">${balanceHTML()}</section>
      <section class="pcx-pane" data-section="nutrition">${nutritionHTML()}</section>
      <section class="pcx-pane" data-section="replacement">${replacementHTML()}</section>`;
    sec.appendChild(el);
    el.querySelectorAll('.pcx-tab').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('.pcx-tab').forEach(x=>x.classList.remove('active'));el.querySelectorAll('.pcx-pane').forEach(x=>x.classList.remove('active'));b.classList.add('active');el.querySelector(`[data-section="${b.dataset.pane}"]`).classList.add('active');}));
    bindAll(el);
    calculateDaily(); calculateBalance(); calculateNutrition(); calculateReplacement();
  }
  function dailyHTML(){return `<div class="pcx-grid">
    <div class="pcx-field"><label>Método</label><select id="pcx-method"><option value="hs">Holliday-Segar</option><option value="kg">mL/kg/día</option><option value="m2">mL/m²/día</option><option value="neonatal">Neonatal</option><option value="custom">Personalizado</option></select></div>
    <div class="pcx-field"><label>Aporte</label><input id="pcx-rate" type="number" value="100" step="1"><div class="pcx-unit" id="pcx-rate-unit">mL/kg/día</div></div>
    <div class="pcx-field hidden" id="pcx-days-field"><label>Día de vida</label><input id="pcx-days" type="number" min="1" max="28" value="1"><div class="pcx-unit">días</div></div>
    <div class="pcx-field"><label>Factor / restricción</label><input id="pcx-factor" type="number" value="100" min="0" max="200" step="5"><div class="pcx-unit">% del objetivo</div></div>
  </div><div class="pcx-results" id="pcx-daily-results"></div><div class="pcx-formula" id="pcx-daily-formula"></div>`;}
  function balanceHTML(){return `<div class="pcx-grid">
    <div class="pcx-field"><label>Prescrito</label><input id="pcx-prescribed" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL/24 h</div></div>
    <div class="pcx-field"><label>VO / enteral</label><input id="pcx-in-oral" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL</div></div>
    <div class="pcx-field"><label>IV</label><input id="pcx-in-iv" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL</div></div>
    <div class="pcx-field"><label>Medicamentos / otros</label><input id="pcx-in-other" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL</div></div>
    <div class="pcx-field"><label>Orina</label><input id="pcx-out-urine" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL/24 h</div></div>
    <div class="pcx-field"><label>Otros egresos medidos</label><input id="pcx-out-other" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL</div></div>
    <div class="pcx-field"><label>Horas de registro</label><input id="pcx-hours" type="number" min="1" max="24" step="1" value="24"><div class="pcx-unit">h</div></div>
  </div><div class="pcx-results" id="pcx-balance-results"></div><div id="pcx-balance-note"></div>`;}
  function nutritionHTML(){return `<div class="pcx-grid">
    <div class="pcx-field"><label>Fórmula / alimento</label><select id="pcx-food">${NUTRITION.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div>
    <div class="pcx-field"><label>Volumen</label><input id="pcx-food-volume" type="number" min="0" step="1" value="0"><div class="pcx-unit">mL/día</div></div>
    <div class="pcx-field"><label>Objetivo energético</label><input id="pcx-kcal-target" type="number" min="0" step="1" value="100"><div class="pcx-unit">kcal/kg/día</div></div>
  </div><div class="pcx-results" id="pcx-nutrition-results"></div><div id="pcx-nutrition-note"></div>`;}
  function replacementHTML(){return `<div class="pcx-grid">
    <div class="pcx-field"><label>Electrolito</label><select id="pcx-repl-element"><option value="Na⁺">Sodio</option><option value="K⁺">Potasio</option><option value="Ca²⁺">Calcio</option><option value="Mg²⁺">Magnesio</option></select></div>
    <div class="pcx-field"><label>Necesidad</label><input id="pcx-repl-dose" type="number" min="0" step="0.1" value="0"><div class="pcx-unit">mEq totales</div></div>
    <div class="pcx-field"><label>Presentación disponible</label><select id="pcx-repl-presentation"></select></div>
    <div class="pcx-field"><label>Volumen final</label><input id="pcx-final-volume" type="number" min="1" step="1" value="100"><div class="pcx-unit">mL</div></div>
    <div class="pcx-field"><label>Tiempo</label><input id="pcx-repl-hours" type="number" min="0.1" step="0.1" value="4"><div class="pcx-unit">horas</div></div>
  </div><div id="pcx-repl-results"></div><div class="pcx-callout pcx-warning"><strong>Verificación obligatoria:</strong> confirmar concentración, presentación, compatibilidad, vía, velocidad máxima y protocolo institucional antes de administrar. Las presentaciones son configurables y los valores mostrados corresponden a la base actualmente incluida en PediCalc.</div>`;}
  function bindAll(root){
    const ids=['pcx-method','pcx-rate','pcx-days','pcx-factor','pcx-prescribed','pcx-in-oral','pcx-in-iv','pcx-in-other','pcx-out-urine','pcx-out-other','pcx-hours','pcx-food','pcx-food-volume','pcx-kcal-target','pcx-repl-element','pcx-repl-dose','pcx-repl-presentation','pcx-final-volume','pcx-repl-hours'];
    ids.forEach(id=>{const e=root.querySelector('#'+id);if(e)e.addEventListener('input',refresh);if(e&&e.tagName==='SELECT')e.addEventListener('change',refresh);});
    const element=root.querySelector('#pcx-repl-element'); if(element) element.addEventListener('change',()=>{populatePresentations();calculateReplacement();});
    populatePresentations();
    function refresh(){calculateDaily();calculateBalance();calculateNutrition();calculateReplacement();}
  }
  function getMethodValue(w){const method=document.getElementById('pcx-method')?.value; const factor=(num('pcx-factor')||100)/100; if(!Number.isFinite(w)||w<=0)return {total:NaN,formula:'Ingrese el peso del paciente para calcular el aporte.'}; if(method==='hs'){const base=ClinicalMath.hollidaySegar(w);return {total:base*factor,formula:`Holliday-Segar: ${fmt(base,0)} mL/d × ${fmt(factor*100,0)}%`};} if(method==='kg'){const rate=num('pcx-rate');return {total:w*rate*factor,formula:`Peso × aporte: ${fmt(w,2)} kg × ${fmt(rate,0)} mL/kg/d × ${fmt(factor*100,0)}%`};} if(method==='m2'){const rate=num('pcx-rate');const sc=ClinicalMath.superficieCorporal(w);return {total:sc*rate*factor,formula:`SC × aporte: ${fmt(sc,3)} m² × ${fmt(rate,0)} mL/m²/d × ${fmt(factor*100,0)}%`};} if(method==='neonatal'){const day=num('pcx-days')||1;const r=ClinicalMath.calcularAporteNeonatal(w,day);return {total:r.total*factor,formula:`Neonatal: ${fmt(r.factor,0)} mL/kg/d × ${fmt(w,2)} kg × ${fmt(factor*100,0)}%`};} const rate=num('pcx-rate');return {total:rate*factor,formula:`Personalizado: ${fmt(rate,0)} mL/d × ${fmt(factor*100,0)}%`};}
  function calculateDaily(){if(!document.getElementById('pcx-panel'))return;const w=weightKg();const method=document.getElementById('pcx-method')?.value;document.getElementById('pcx-days-field')?.classList.toggle('hidden',method!=='neonatal');const unit=document.getElementById('pcx-rate-unit');if(unit)unit.textContent=method==='m2'?'mL/m²/día':method==='custom'?'mL/día':'mL/kg/día';const r=getMethodValue(w);const out=document.getElementById('pcx-daily-results');if(!out)return;const hourly=r.total/24;out.innerHTML=`<div class="pcx-kpi"><div class="v">${fmt(r.total,0)}</div><div class="l">mL/24 h</div></div><div class="pcx-kpi"><div class="v">${fmt(hourly,1)}</div><div class="l">mL/h</div></div><div class="pcx-kpi"><div class="v">${Number.isFinite(w)?fmt(r.total/w,1):'—'}</div><div class="l">mL/kg/día</div></div><div class="pcx-kpi"><div class="v">${Number.isFinite(w)?fmt(ClinicalMath.superficieCorporal(w),3):'—'}</div><div class="l">SC (m²)</div></div>`;document.getElementById('pcx-daily-formula').textContent=r.formula;}
  function calculateBalance(){if(!document.getElementById('pcx-panel'))return;const w=weightKg();const p=num('pcx-prescribed')||0;const oral=num('pcx-in-oral')||0;const iv=num('pcx-in-iv')||0;const other=num('pcx-in-other')||0;const urine=num('pcx-out-urine')||0;const outOther=num('pcx-out-other')||0;const hours=num('pcx-hours')||24;const income=oral+iv+other;const outcome=urine+outOther;const balance=income-outcome;const diur=(w>0&&hours>0)?urine/(w*hours):NaN;const out=document.getElementById('pcx-balance-results');out.innerHTML=`<div class="pcx-kpi"><div class="v">${fmt(income,0)}</div><div class="l">Ingresos administrados (mL)</div></div><div class="pcx-kpi"><div class="v">${fmt(outcome,0)}</div><div class="l">Egresos medidos (mL)</div></div><div class="pcx-kpi"><div class="v">${balance>=0?'+':''}${fmt(balance,0)}</div><div class="l">Balance neto (mL)</div></div><div class="pcx-kpi"><div class="v">${Number.isFinite(w)?(balance>=0?'+':'')+fmt(balance/w,1):'—'}</div><div class="l">Balance mL/kg</div></div><div class="pcx-kpi"><div class="v">${fmt(diur,2)}</div><div class="l">Diuresis mL/kg/h</div></div><div class="pcx-kpi"><div class="v">${fmt(p,0)}</div><div class="l">Prescrito (mL/24 h)</div></div>`;let note='';if(p>0){const diff=income-p;note+=`<div class="pcx-callout ${diff>0?'pcx-warning':''}"><strong>Prescrito vs administrado:</strong> ${diff>=0?'+':''}${fmt(diff,0)} mL (${fmt(income/p*100,0)}% de lo prescrito).</div>`;}if(urine>0&&w>0){note+=`<div class="pcx-callout"><strong>Diuresis:</strong> ${fmt(diur,2)} mL/kg/h. La interpretación depende del contexto clínico y del protocolo local.</div>`;}document.getElementById('pcx-balance-note').innerHTML=note;}
  function calculateNutrition(){const w=weightKg();const food=NUTRITION.find(x=>x.id===document.getElementById('pcx-food')?.value)||NUTRITION[0];const vol=num('pcx-food-volume')||0;const factor=vol/100;const kcal=factor*food.kcal,protein=factor*food.protein,carb=factor*food.carb,fat=factor*food.fat;const target=num('pcx-kcal-target')||0;const pct=w>0&&target>0?(kcal/w/target)*100:NaN;const out=document.getElementById('pcx-nutrition-results');if(!out)return;out.innerHTML=`<div class="pcx-kpi"><div class="v">${fmt(kcal,0)}</div><div class="l">kcal/día</div></div><div class="pcx-kpi"><div class="v">${w>0?fmt(kcal/w,1):'—'}</div><div class="l">kcal/kg/día</div></div><div class="pcx-kpi"><div class="v">${w>0?fmt(protein/w,2):'—'}</div><div class="l">proteína g/kg/d</div></div><div class="pcx-kpi"><div class="v">${w>0?fmt(carb/w,2):'—'}</div><div class="l">HDC g/kg/d</div></div><div class="pcx-kpi"><div class="v">${w>0?fmt(fat/w,2):'—'}</div><div class="l">lípidos g/kg/d</div></div>`;document.getElementById('pcx-nutrition-note').innerHTML=`<div class="pcx-callout"><strong>${esc(food.name)}</strong>: valores de referencia por 100 mL. <br><span class="pcx-muted">Aporte hídrico: ${fmt(vol,0)} mL/d. Agua libre y micronutrientes no se estiman aquí automáticamente.</span></div>${Number.isFinite(pct)?`<div class="pcx-callout"><strong>Objetivo energético:</strong> ${fmt(target,0)} kcal/kg/d → cumplimiento ${fmt(pct,0)}%.<div class="pcx-bar"><span style="width:${Math.max(0,Math.min(100,pct))}%"></span></div></div>`:''}`;}
  function populatePresentations(){const element=document.getElementById('pcx-repl-element')?.value;const sel=document.getElementById('pcx-repl-presentation');if(!sel)return;const items=PRESENTATIONS.filter(x=>x.element===element);sel.innerHTML=items.map(x=>`<option value="${x.id}">${esc(x.name)} — ${fmt(x.factor,3)} ${esc(x.unit)}</option>`).join('');}
  function calculateReplacement(){const sel=document.getElementById('pcx-repl-presentation');const out=document.getElementById('pcx-repl-results');if(!sel||!out)return;const p=PRESENTATIONS.find(x=>x.id===sel.value);const dose=num('pcx-repl-dose')||0;const finalV=num('pcx-final-volume')||100;const hours=num('pcx-repl-hours')||1;if(!p){out.innerHTML='';return;}const ampoles=p.ampouleMl*p.factor;const volume=dose/p.factor;const ampCount=volume/p.ampouleMl;const diluent=Math.max(0,finalV-volume);const rate=finalV/hours;const finalConc=dose/finalV;out.innerHTML=`<div class="pcx-results"><div class="pcx-kpi"><div class="v">${fmt(volume,1)}</div><div class="l">mL de ${esc(p.name)}</div></div><div class="pcx-kpi"><div class="v">${fmt(ampCount,2)}</div><div class="l">ampollas equivalentes</div></div><div class="pcx-kpi"><div class="v">${fmt(diluent,1)}</div><div class="l">mL para completar</div></div><div class="pcx-kpi"><div class="v">${fmt(rate,1)}</div><div class="l">mL/h</div></div></div><div class="pcx-prep"><strong>Preparación calculada</strong><br>Extraer <strong>${fmt(volume,1)} mL</strong> de ${esc(p.name)} (${fmt(p.factor,3)} ${esc(p.unit)}).<br>Agregar diluyente compatible hasta un <strong>volumen final de ${fmt(finalV,0)} mL</strong>.<br>Concentración final: <strong>${fmt(finalConc,3)} mEq/mL</strong>.<br>Si se administra en ${fmt(hours,1)} h: <strong>${fmt(rate,1)} mL/h</strong>.<br><span class="pcx-muted">1 ampolla de ${fmt(p.ampouleMl,0)} mL contiene ${fmt(ampoles,2)} mEq de ${esc(p.element)}.</span></div>`;}
  function init(){ensureStyles();panel();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.PediCalcEnhancements={PRESENTATIONS,NUTRITION};
})();
