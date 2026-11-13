# Lista de agentes de IA a crear: Maggie Sex Ed

Cada agente tiene un propósito, límites claros y una directora responsable. Los perfiles de personalidad de cada uno se crearán en una fase posterior.

---

## Agentes de cara al usuario

### 1. Maggie: facilitadora conversacional
- **Función:** conversar con adultos mayores (y con familiares o profesionales en modo acompañado) sobre sexualidad en la vejez, imagen corporal, autoestima y bienestar emocional, usando los módulos psicoeducativos.
- **Tono:** cálido, empático, paciente, sin prejuicios, con mensajes cortos y lenguaje sencillo.
- **Límites:** no diagnostica, no reemplaza terapia, no da indicaciones médicas.
- **Supervisa:** las tres directoras.
- **Prioridad:** alta (fase 1).

### 2. Detección de riesgo y derivación
- **Función:** identificar señales de riesgo (abuso, depresión profunda, ideas de hacerse daño, otras situaciones de peligro), compartir la línea de ayuda regional y nacional, y solicitar consentimiento y contacto indicando que se usará para comunicarse con la persona.
- **Límites:** no diagnostica, no minimiza, no condiciona la ayuda a que la persona deje su contacto.
- **Nota técnica:** en el Nivel 0 funciona como un protocolo dentro del Prompt del Sistema Maestro de Maggie, no como un agente separado.
- **Supervisa:** Directora Comportamental.
- **Prioridad:** alta (fase 1).

---

## Agentes internos (herramientas de trabajo)

### 3. Contenidos psicoeducativos
- **Función:** redactar borradores de módulos (derechos sexuales, mitos, cambios corporales, comunicación en pareja, autoestima) y adaptarlos a lenguaje simple.
- **Límites:** todo borrador pasa por validación humana; debe citar fuentes verificables y no inventar datos.
- **Supervisa:** Directora Sistémica.
- **Prioridad:** alta (fase 1).

### 4. Directorio de recursos y líneas de ayuda
- **Función:** organizar y mantener la lista de líneas de ayuda y recursos regionales y nacionales, con fecha de última verificación.
- **Límites:** no inventa números ni servicios; toda entrada la verifica una persona antes de usarse.
- **Supervisa:** Directora Comportamental.
- **Prioridad:** alta (fase 1).

### 5. Reporte semanal de riesgo
- **Función:** resumir las alertas de la semana en un formato claro para la revisión de las directoras (qué se detectó, qué se respondió, si hay consentimiento de contacto).
- **Límites:** nunca contacta a nadie; maneja el mínimo de datos y con acceso restringido.
- **Supervisa:** Directora Comportamental.
- **Prioridad:** media (fase 2).

### 6. Simulador de adulto mayor
- **Función:** representar distintos perfiles de usuarios (con timidez, duda, enojo, viudez, vergüenza corporal, dificultades de memoria, situaciones de riesgo) para probar y refinar a Maggie.
- **Límites:** es una herramienta de prueba; sus resultados no sustituyen pruebas con personas reales.
- **Supervisa:** Directora Neuropsicológica.
- **Prioridad:** alta (fase 1).

### 7. Calidad y ética
- **Función:** revisar conversaciones de prueba y contenidos buscando diagnósticos indebidos, lenguaje edadista o sexista, tono inadecuado, falta de accesibilidad o fallas en el protocolo de riesgo.
- **Límites:** señala hallazgos; las directoras deciden los cambios.
- **Supervisa:** Directora Neuropsicológica.
- **Prioridad:** media (fase 1-2).

### 8. Documentación y entregables
- **Función:** organizar el diario de desarrollo, los prompts clave y los borradores de la memoria escrita y del pitch, respetando el límite de páginas y el formato institucional.
- **Límites:** las directoras redactan y aprueban la versión final.
- **Supervisa:** las tres directoras.
- **Prioridad:** alta (para las entregas del 13 y 20 de noviembre).

---

## Resumen por fases

| Fase | Agentes |
|---|---|
| **Fase 1 (ahora)** | 1 Maggie, 2 Riesgo (dentro de Maggie), 3 Contenidos, 4 Directorio, 6 Simulador, 8 Documentación |
| **Fase 2 (después)** | 5 Reporte semanal, 7 Calidad y ética (consolidado) |

## Siguiente paso sugerido

Crear el **perfil de personalidad** de cada agente (tono, valores, estilo de comunicación, límites y frases de ejemplo), empezando por Maggie.
