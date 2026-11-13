---
version: alpha
name: Maggie Sex Ed
description: >
  Sistema de diseño de Maggie, facilitadora conversacional de psicoeducación
  sobre sexualidad en la vejez (Colombia). Cálido, redondeado, de alto contraste
  y pensado para leerse en el celular por personas mayores.
colors:
  primary: "#6B4E8C"
  primary-deep: "#57407A"
  secondary: "#E8836B"
  secondary-deep: "#D9644A"
  tertiary: "#2F8F8B"
  tertiary-deep: "#1F6B68"
  accent: "#F2B84B"
  neutral: "#FFF4E6"
  surface: "#FFFFFF"
  surface-lilac: "#EFE9F6"
  surface-mint: "#E3F2F1"
  ink: "#2B2340"
  ink-muted: "#5A5270"
  on-primary: "#FFFFFF"
  on-secondary: "#2B2340"
  on-accent: "#2B2340"
  on-tertiary-deep: "#FFFFFF"
typography:
  display:
    fontFamily: Nunito
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: Atkinson Hyperlegible
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: Atkinson Hyperlegible
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Atkinson Hyperlegible
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.3
  citation:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 28px
    height: 56px
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 28px
    height: 56px
  button-help-line:
    backgroundColor: "{colors.tertiary-deep}"
    textColor: "{colors.on-tertiary-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 28px
    height: 56px
  chat-bubble-maggie:
    backgroundColor: "{colors.surface-lilac}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 16px
  chat-bubble-user:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 16px
  card-science:
    backgroundColor: "{colors.surface-mint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 24px
---

# Maggie Sex Ed

## Overview

Maggie es una facilitadora conversacional con IA que acompaña a adultos mayores
en Colombia (y a familiares y profesionales en modo acompañado) en temas de
sexualidad en la vejez, imagen corporal, autoestima y bienestar emocional.
Nunca diagnostica ni reemplaza una terapia.

Personalidad: empática, honesta y rigurosa. Visualmente se traduce en formas
redondeadas, colores cálidos y suaves, texto grande y mucho contraste. La
interfaz se siente como una conversación tranquila, no como un formulario
clínico. El símbolo es un búho con gafas, no un humano.

## Colors

- **primary (#6B4E8C, ciruela suave):** color de marca, títulos, logotipo,
  botón principal. Significa respeto e intimidad.
- **secondary (#E8836B, coral cálido):** calidez y empatía. Botones secundarios
  y acentos. Nunca con texto blanco encima: usar `ink`.
- **tertiary (#2F8F8B, verde azulado):** ciencia y confianza. Solo para gráficos,
  íconos y títulos grandes. Para texto o botones usar `tertiary-deep`.
- **accent (#F2B84B, dorado miel):** resaltados. Texto `ink` encima.
- **neutral (#FFF4E6, crema):** fondo principal de pantallas y papelería.
- **ink (#2B2340):** texto principal sobre fondos claros.

Reglas de contraste (valores aproximados, verificar con una herramienta de
accesibilidad, objetivo WCAG AA): texto normal 4.5:1 o más, texto grande 3:1 o
más. No usar `tertiary` (#2F8F8B) para texto pequeño.

## Typography

- **Nunito Bold** para títulos y nombre de marca.
- **Atkinson Hyperlegible** para texto corrido y chat. Tamaño mínimo 18px en el
  chat.
- **Source Serif 4** solo para citas y referencias científicas.
- Interlineado 1.5. Alineado a la izquierda, nunca justificado. Sin texto todo en
  mayúsculas.

## Layout

- Móvil primero (ancho de referencia 390px), una columna, un solo botón
  principal por pantalla.
- Escala de espaciado de 4px: 4, 8, 16, 24, 40.
- Márgenes laterales mínimos de 16px. Objetivos táctiles de 56px de alto o más.
- Un enlace visible a la línea de ayuda en todas las pantallas del chat.

## Elevation & Depth

Diseño plano. Sin sombras duras ni degradados. La jerarquía se logra con color
de fondo (`surface-lilac`, `surface-mint`) y bordes finos de 1px en `primary`
al 30% de opacidad.

## Shapes

Esquinas redondeadas: 16px en tarjetas y burbujas, 8px en campos de texto,
forma de píldora en botones. Forma recurrente: burbuja de conversación con la
cola hacia quien habla. Evitar formas puntiagudas.

## Components

- **button-primary:** acción principal. Una por pantalla.
- **button-secondary:** acción de apoyo (por ejemplo, "Quiero saber más").
- **button-help-line:** acceso a la línea de ayuda. Siempre visible, en verde
  azulado profundo.
- **chat-bubble-maggie:** burbuja lila claro, alineada a la izquierda.
- **chat-bubble-user:** burbuja crema con borde fino, alineada a la derecha.
- **card-science:** tarjeta menta clara para datos científicos, con la fuente
  citada en `citation`.

Íconos: línea de 2px o más, esquinas redondeadas, siempre con etiqueta de texto.

## Do's and Don'ts

**Hacer**

- Mensajes cortos, una idea por mensaje, lo esencial primero.
- Tratar de usted por defecto; pasar al tú si la persona lo propone.
- Fondo crema o blanco para el logotipo, con la zona de respeto de 1,5 veces el
  diámetro de un ojo del búho.
- Fotografías de personas mayores reales, con autorización escrita y con dignidad.

**No hacer**

- No texto blanco sobre coral o dorado.
- No `tertiary` (#2F8F8B) para texto pequeño.
- No tablas en el chat; usar narrativa y listas cortas.
- No degradados, sombras duras ni más de tres colores principales por pieza.
- No presentar a Maggie como una persona real ni usar imágenes eróticas.
- No lenguaje infantilizante ("abuelito", "viejito") ni clínico ("disfunción",
  "paciente").
