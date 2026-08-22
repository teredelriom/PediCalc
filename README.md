## PEDICALC | CALCULADORAS PEDIÁTRICAS v5.3.0

## 🩺 Descripción:
Esta aplicación web reúne calculadoras pediátricas en una página de inicio. Desde allí se accede rápidamente al balance hídrico, la nutrición parenteral, el manejo inicial de pacientes quemados y herramientas clínicas complementarias.

## ✨ Características principales:
- Cálculo de mantenimiento, déficit y flujo horario según peso y grado de deshidratación.
- Ajustes inteligentes según condiciones clínicas como hiponatremia, hipernatremia, oliguria, fiebre, etc.
- Recomendación automática de solución intravenosa óptima.
- Comparación de soluciones alternativas.
- Indicaciones completas para enfermería con instrucciones de preparación.
- Panel de herramientas complementarias con cálculo neonatal por horas de vida, cargas de cristaloides/albúmina, planes de diarrea y correcciones de Na, K, bicarbonato y calcio cuando se ingresan los laboratorios necesarios.
- Mensajes de seguridad que recuerdan la necesidad de validar cada resultado con el protocolo institucional y la monitorización clínica.
- Exportación de resultados como imagen, impresión o copiar al portapapeles.
- Interfaz adaptativa y moderna con Tailwind CSS.
- Compatible con instalación como Aplicación Web Progresiva (PWA).
- Página de inicio con accesos directos a balance hídrico, nutrición, quemados y herramientas clínicas.

## 🛠️ Tecnologías utilizadas:
- 🧾 HTML5
- 🎨 Tailwind CSS
- 🧠 JavaScript Vanilla
- 🌟 Font Awesome
- 🖼️ html2canvas (exportar resultados)
- 📲 PWA con manifest.json y sw.js

### Arquitectura

- `clinical-math.js` concentra las fórmulas puras (sin acceso al DOM), incluidas superficie corporal, Holliday-Segar, Schwartz y correcciones bioquímicas, para facilitar su auditoría clínica.
- `app.js` se limita a validación, estado, selección de protocolos y presentación de resultados.
- `sw.js` precachea los recursos de la aplicación y usa una estrategia *Stale-While-Revalidate*: entrega el recurso local de inmediato y actualiza la caché en segundo plano cuando hay conectividad.

📁 Archivos esperados en el mismo directorio:
- 📄 inicio.html (página de inicio)
- 📄 index.html (calculadora clínica integrada)
- 🔧 sw.js (Service Worker para funcionalidad offline)
- 📝 manifest.json (para instalación como app)
- 🖼️ Íconos opcionales para PWA (icon-192.png, icon-512.png, etc.)

## 🧪 Instrucciones de uso:
1- Abrir inicio.html en un navegador moderno (preferentemente Chrome o Firefox).
2- Elegir la calculadora requerida desde la página de inicio.
3- Para balance hídrico, ingresar peso (en gramos), edad y condiciones clínicas presentes.
4- (Opcional) Ingresar electrolitos basales para mayor precisión.
5- Presionar "Calcular Hidratación" y revisar los resultados, solución recomendada, fórmulas y notas clínicas.
6- Usar los botones para copiar indicaciones, exportar o imprimir.

## 🧪 Requisitos

- Navegador compatible con PWA (Chrome, Edge, Safari).
- Permitir permisos de almacenamiento local.

## 👩‍⚕️ Uso Clínico

Esta herramienta está orientada al **uso médico profesional**. Las fórmulas aplicadas siguen los principios de aportes por peso/superficie corporal y estándares de manejo hidroelectrolítico pediátrico.
- El código está optimizado para uso clínico, pero no reemplaza el juicio médico.
- Las advertencias clínicas se generan automáticamente si hay desviaciones significativas en sodio o condiciones críticas presentes.
- Todos los cálculos están basados en la tabla de aportes por kg/superficie corporal y guías clínicas pediátricas actualizadas.

## 📄 Licencia

Uso clínico libre. Si reutilizas este código, se agradece atribución al autor original.
