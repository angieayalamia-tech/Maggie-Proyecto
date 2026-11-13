# Equipo del proyecto Maggie Sex Ed

**Proyecto:** Chatbot de psicoeducación sobre sexualidad en la vejez (desmitificar la vejez asexuada, imagen corporal, autoestima, ansiedad y depresión), dirigido a adultos mayores, familiares y profesionales.
**Uso previsto:** desde el celular, solos o acompañados.
**Plataforma base (Nivel 0):** ChatGPT o Gemini con un Prompt del Sistema Maestro y un guion conversacional estructurado.

---

## 1. Principios de diseño del equipo

1. **Las humanas deciden, la IA asiste.** Toda decisión clínica, ética o de riesgo es humana.
2. **El chatbot no diagnostica.** Informa, acompaña y deriva.
3. **El seguimiento de riesgo es un rol humano.** Ningún agente contacta a un adulto mayor ni decide sobre un caso de riesgo.
4. **Consentimiento explícito.** El contacto solo se solicita cuando se detecta riesgo, indicando claramente que se usará para comunicarse con la persona.
5. **Minimizar datos sensibles.** Se guarda solo lo necesario para el seguimiento, con acceso restringido a las directoras.

---

## 2. Equipo humano (por ahora, 3 personas)

Las tres son **directoras del proyecto** y comparten la decisión final sobre contenido, ética y casos de riesgo. Cada una lidera además un frente según su enfoque.

### Directora Neuropsicológica
- **Frente:** accesibilidad cognitiva y salud en el envejecimiento.
- Valida que el lenguaje, la longitud de los mensajes y el ritmo de la conversación sean comprensibles para adultos mayores (incluyendo posibles dificultades de memoria o atención).
- Revisa los contenidos sobre cambios corporales, cognitivos y sexuales asociados a la edad.
- Supervisa al **Agente de Calidad y Ética** en los criterios de accesibilidad.

### Directora Sistémica
- **Frente:** familia, pareja y contexto social.
- Orienta el modo "acompañado" (familiares, cuidadores, profesionales) y los módulos sobre mitos sociales y dinámicas familiares.
- Valida la sensibilidad cultural y el trato hacia la pareja, la viudez y los vínculos.
- Supervisa al **Agente de Contenidos Psicoeducativos**.

### Directora Comportamental
- **Frente:** intervención, ansiedad, depresión y seguimiento de riesgo.
- Define los criterios de alerta y el protocolo de derivación.
- Lidera la revisión semanal de casos de riesgo y el seguimiento con el adulto.
- Supervisa al **Agente de Detección de Riesgo y Derivación** y al **Agente de Reporte Semanal**.

### Responsabilidades compartidas (las tres)
- Aprobar el Prompt del Sistema Maestro y cualquier cambio.
- Aprobar todo contenido antes de que llegue al chatbot.
- Decidir sobre casos de riesgo (rotación semanal de quien coordina, con revisión conjunta).
- Verificar que las líneas de ayuda regionales y nacionales estén vigentes.
- Redactar y firmar los entregables académicos (informe, pitch).

---

## 3. Equipo de agentes de IA

Los agentes se dividen en dos grupos:

- **De cara al usuario (en producción):** conversan con los adultos mayores.
- **Internos (herramientas de trabajo):** ayudan a las directoras a construir, probar y documentar el proyecto. No tienen contacto con usuarios.

| Agente | Grupo | Supervisa |
|---|---|---|
| 1. Maggie, facilitadora conversacional | Usuario | Las tres |
| 2. Detección de riesgo y derivación | Usuario (integrado en Maggie) | Comportamental |
| 3. Contenidos psicoeducativos | Interno | Sistémica |
| 4. Directorio de recursos y líneas de ayuda | Interno | Comportamental |
| 5. Reporte semanal de riesgo | Interno | Comportamental |
| 6. Simulador de adulto mayor | Interno | Neuropsicológica |
| 7. Calidad y ética | Interno | Neuropsicológica |
| 8. Documentación y entregables | Interno | Las tres |

Detalle completo en `agentes_ia_maggie_sex_ed.md`.

---

## 4. Qué se queda siempre en manos humanas

- Diagnóstico o valoración clínica (el chatbot nunca la hace).
- Contacto y seguimiento con adultos mayores en situación de riesgo.
- Decisiones éticas y manejo de datos sensibles.
- Validación final de cualquier contenido psicoeducativo.
- Relaciones con instituciones, profesionales externos y futuros colaboradores.
- Evaluación del impacto real del proyecto.

---

## 5. Flujo del caso de riesgo

1. El adulto menciona una situación de riesgo (abuso, depresión profunda, ideas de hacerse daño, otra).
2. Maggie responde con calidez, **sin diagnosticar**, y comparte la línea de ayuda regional y nacional correspondiente.
3. Maggie pide el contacto **en ese momento**, explicando que se usará para comunicarse con la persona. Si no acepta, se respeta su decisión y se mantiene la derivación a la línea de ayuda.
4. Si hay consentimiento, el caso queda registrado con acceso restringido.
5. Cada semana, el agente de reporte prepara un resumen para las directoras.
6. Las directoras revisan y la Directora Comportamental (con apoyo de las otras dos) hace el seguimiento humano con la persona.

**Puntos a cuidar:** pedir el contacto en un momento de vulnerabilidad requiere un tono muy cuidadoso y nunca debe condicionar el acceso a la ayuda. Además, una revisión semanal puede ser lenta para una situación urgente, por lo que la derivación inmediata a la línea de ayuda es la protección principal, y el seguimiento es complementario.

---

## 6. Crecimiento futuro del equipo

Cuando el equipo crezca, los perfiles más valiosos de sumar serían:

- Supervisor o supervisora clínica (psicología o psiquiatría geriátrica).
- Profesional en sexología clínica.
- Perfil técnico (para pasar de Nivel 0 a una aplicación propia).
- Adultos mayores y familiares como grupo de prueba y asesoría.
