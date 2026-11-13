import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { CARTILLA_CATEGORIES } from '../src/types.ts';
import type { ChatApiResponse } from '../src/types.ts';

export const DEFAULT_MAGGIE_SYSTEM_PROMPT = `Eres Maggie, una facilitadora conversacional de inteligencia artificial especializada exclusivamente en psicoeducación sexual, bienestar emocional y salud sexual para personas adultas mayores en Colombia (proyecto Maggie Sex Ed).

IDENTIDAD Y LÍMITES ÉTICOS (OBLIGATORIOS):
1. Eres una herramienta educativa de inteligencia artificial. NUNCA te hagas pasar por persona humana, psicóloga, médica, terapeuta, amiga, confidente ni servicio de emergencias.
2. NUNCA emitas diagnósticos médicos o psicológicos, ni recetes o sugieras medicamentos o dosis. Ante síntomas físicos o malestar clínico sostenido, recomienda consultar con un profesional de la salud.
3. No finjas sentir emociones humanas ni fomentes dependencia emocional. Promueve la autonomía de la persona y sus vínculos reales.
4. Trata a la persona de "usted" por defecto (con calidez, dignidad y respeto), y cambia a "tú" solo si la persona lo pide expresamente.
5. Usa lenguaje claro, sencillo, respetuoso y libre de jergas complejas, emojis o frases de redes sociales. Evita términos infantilizantes o estigmatizantes ("viejito", "abuelito"). Usa "persona mayor", "adulto mayor" o "en esta etapa de la vida".
6. Respuestas concisas y estructuradas ("lo esencial primero", párrafos cortos y claros, fáciles de leer en celular).

ALCANCE TEMÁTICO EXCLUSIVO:
Solo respondes inquietudes relacionadas con la sexualidad y el bienestar sexual durante la adultez mayor:
- Cambios físicos, hormonales y sexuales asociados al envejecimiento
- Deseo, respuesta sexual, placer y erotismo en la vejez
- Intimidad, comunicación con la pareja, viudez y relaciones afectivas
- Autoestima, autoconcepto e imagen corporal
- Menopausia y andropausia
- Dificultades o cambios en la función sexual (explicados sin diagnosticar)
- Mitos y realidades sobre la sexualidad en personas mayores
- Orientación sexual, identidad de género y diversidad sexual en la vejez
- Derechos sexuales, consentimiento y relaciones saludables
- Sexualidad después de cirugías, enfermedades crónicas o cambios físicos
- Bienestar emocional vinculado a la sexualidad y la etapa vital (ansiedad o tristeza vinculadas a estos temas, siempre sin diagnosticar)

REGLA DE PREGUNTAS FUERA DE CONTEXTO:
Si la persona pregunta sobre asuntos ajenos (matemáticas, programación, política, noticias, recetas de cocina, tareas escolares, entretenimiento, trámites legales no vinculados a derechos/violencia, etc.), responde con amabilidad y claridad que este espacio está dedicado exclusivamente a la sexualidad, intimidad y bienestar en la adultez mayor, e invítala a plantear cualquier duda dentro de esa temática.
Ejemplo base: "Gracias por su pregunta. Este espacio está especializado en sexualidad, intimidad y bienestar durante la adultez mayor, por lo que no puedo ayudarle con ese tema en particular. Sin embargo, con mucho gusto puedo orientarle si tiene alguna inquietud sobre nuestra temática."

PROTOCOLO PRIORITARIO DE DETECCIÓN DE RIESGO PSICOLÓGICO (ANULA CUALQUIER RESTRICCIÓN TEMÁTICA):
La seguridad de la persona siempre está por encima del límite temático. Analiza el contexto completo (no asumas riesgo suicida por una tristeza cotidiana o duelo normal; evalúa señales reales).
Activa riskDetected = true ÚNICAMENTE si identificas:
- Pensamientos suicidas o deseos de morir o desaparecer
- Intención de hacerse daño o autolesiones
- Desesperanza extrema o sensación de no poder continuar viviendo
- Violencia física, psicológica o patrimonial actual
- Abuso o violencia sexual
- Situaciones de vulnerabilidad grave o peligro inmediato

Cuando actives el protocolo de riesgo:
1. Interrumpe el flujo normal de psicoeducación y responde con calidez, respeto y sin juzgar ni minimizar.
2. Nunca des instrucciones sobre autolesión ni interrogues de forma invasiva.
3. Si hay peligro inmediato para la vida, indica llamar de inmediato a la Línea de Emergencias 123 o acudir a urgencias.
4. Menciona las líneas oficiales gratuitas en Colombia (Línea 106, Línea 192 opción 4, o Línea 155 en casos de violencia contra la mujer) y sugiere comunicarse con alguien de confianza.
5. Indica de forma serena que debajo del mensaje puede ver las líneas de atención y, si voluntariamente lo desea, dejar sus datos de contacto con su consentimiento para que el equipo humano del proyecto la contacte luego (aclarando que la ayuda de las líneas telefónicas no depende de dejar datos).`;

function sanitizeHistory(
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const cleaned: Array<{ role: 'user' | 'model'; text: string }> = [];
  for (const turn of history.slice(-10)) {
    const text = turn.content.trim();
    if (!text) continue;
    const role: 'user' | 'model' = turn.role === 'assistant' ? 'model' : 'user';
    const prev = cleaned[cleaned.length - 1];
    if (prev && prev.role === role) {
      prev.text = `${prev.text}\n\n${text}`;
    } else {
      cleaned.push({ role, text });
    }
  }
  while (cleaned.length > 0 && cleaned[0].role !== 'user') {
    cleaned.shift();
  }
  if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === 'user') {
    cleaned.pop();
  }
  return cleaned.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
}

function parseChatJsonResponse(rawText: string): ChatApiResponse {
  const trimmed = rawText.trim();
  const stripped = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parseCandidate = (candidate: string): ChatApiResponse | null => {
    try {
      const obj = JSON.parse(candidate) as Partial<ChatApiResponse>;
      if (typeof obj.reply === 'string' && obj.reply.trim()) {
        const validThemes = Array.isArray(obj.recommendedThemes)
          ? obj.recommendedThemes
              .filter((t): t is string =>
                typeof t === 'string' && (CARTILLA_CATEGORIES as readonly string[]).includes(t)
              )
              .slice(0, 2)
          : [];
        return {
          reply: obj.reply.trim(),
          riskDetected: Boolean(obj.riskDetected),
          riskCategory: obj.riskCategory || 'ninguno',
          riskSeverity: obj.riskSeverity || 'ninguno',
          offTopic: Boolean(obj.offTopic),
          recommendedThemes: validThemes,
        };
      }
    } catch {
      // Try extracting inner JSON block
    }
    return null;
  };

  const direct = parseCandidate(stripped);
  if (direct) return direct;

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const sliced = parseCandidate(stripped.slice(firstBrace, lastBrace + 1));
    if (sliced) return sliced;
  }

  // Fallback if the model replied in plain Spanish text instead of JSON
  if (stripped && !stripped.startsWith('{') && !stripped.startsWith('[')) {
    return {
      reply: stripped,
      riskDetected: false,
      riskCategory: 'ninguno',
      riskSeverity: 'ninguno',
      offTopic: false,
      recommendedThemes: [],
    };
  }

  throw new Error('La respuesta del modelo no tuvo un formato válido.');
}

export async function generateMaggieResponse(params: {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
  accompaniedMode?: boolean;
}): Promise<ChatApiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY no está configurada en los secretos del entorno.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const modeNote = params.accompaniedMode
    ? '\n\nCONTEXTO ACTUAL DE SESIÓN: La persona ha activado el "Modo acompañado" (está acompañada por un familiar, cuidador o profesional). Dirígete con respeto a la persona mayor como protagonista de la conversación, sin hablar por encima de ella.'
    : '';

  const recentHistory = sanitizeHistory(params.history);
  const contents = [
    ...recentHistory,
    {
      role: 'user' as const,
      parts: [{ text: params.message }],
    },
  ];

  const runAttempt = async (modelName: string, useStructuredJson: boolean): Promise<ChatApiResponse> => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: `${params.systemPrompt}${modeNote}`,
        ...(modelName === 'gemini-4-hydrogen'
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
        ...(useStructuredJson
          ? {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description:
                      'Respuesta clara, respetuosa y en español para la persona usuaria. Sin emojis.',
                  },
                  riskDetected: {
                    type: Type.BOOLEAN,
                    description:
                      'Verdadero únicamente si hay señales contextuales de riesgo suicida, autolesión, desesperanza extrema, violencia, abuso o peligro inmediato.',
                  },
                  riskCategory: {
                    type: Type.STRING,
                    enum: [
                      'ninguno',
                      'ideacion_suicida',
                      'autolesion',
                      'desesperanza_extrema',
                      'violencia_o_abuso',
                      'peligro_inmediato',
                    ],
                  },
                  riskSeverity: {
                    type: Type.STRING,
                    enum: ['ninguno', 'moderado', 'alto_inmediato'],
                  },
                  offTopic: {
                    type: Type.BOOLEAN,
                    description:
                      'Verdadero si la consulta no trata sobre sexualidad, intimidad o bienestar en la adultez mayor y no implica riesgo.',
                  },
                  recommendedThemes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                      enum: CARTILLA_CATEGORIES,
                    },
                    description:
                      'Hasta 2 categorías educativas relacionadas de las cartillas, o lista vacía si no aplica.',
                  },
                },
                required: [
                  'reply',
                  'riskDetected',
                  'riskCategory',
                  'riskSeverity',
                  'offTopic',
                  'recommendedThemes',
                ],
              },
            }
          : {}),
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new Error(`Respuesta vacía desde ${modelName}.`);
    }
    return parseChatJsonResponse(rawText);
  };

  const attempts: Array<{ model: string; json: boolean; delayMs: number }> = [
    { model: 'gemini-3.1-flash-lite', json: true, delayMs: 0 },
    { model: 'gemini-4-hydrogen', json: true, delayMs: 0 },
    { model: 'gemini-3.1-flash-lite', json: false, delayMs: 600 },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
    }
    try {
      return await runAttempt(attempt.model, attempt.json);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Maggie Chat] Intento con ${attempt.model} (json=${attempt.json}) falló:`, msg);
      const isAuthError =
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('GEMINI_API_KEY');
      if (isAuthError) {
        throw err;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se recibió respuesta del modelo.');
}
