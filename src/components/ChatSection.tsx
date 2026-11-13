import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type {
  CartillaCategory,
  ChatApiResponse,
  ChatTurn,
  PreferredContactChannel,
} from '../types.ts';
import { MaggieAvatar } from './MaggieAvatar.tsx';
import type { PublicSection } from './Navbar.tsx';

interface ChatSectionProps {
  initialPrompt?: string | null;
  onClearInitialPrompt: () => void;
  onNavigate: (section: PublicSection) => void;
  onOpenCategory: (category: CartillaCategory) => void;
}

const WELCOME_MESSAGE: ChatTurn = {
  id: 'welcome-1',
  role: 'assistant',
  content:
    '¡Hola! Bienvenido/a. Este es un espacio para conversar, aprender y resolver inquietudes sobre la sexualidad durante la adultez mayor. Puede preguntar con tranquilidad. Aquí no hay preguntas vergonzosas ni motivos para sentir juicio.\n\nSoy Maggie, una herramienta educativa de inteligencia artificial (no soy médica ni psicóloga). ¿Sobre qué le gustaría conversar hoy?',
  timestamp: new Date().toISOString(),
};

const QUICK_STARTERS = [
  '¿Es normal que el deseo sexual cambie con la edad?',
  '¿Cómo conversar con mi pareja sobre intimidad sin incomodidad?',
  '¿Qué mitos existen sobre la sexualidad después de los 60 años?',
  '¿Cómo influyen la menopausia o la andropausia en la vida sexual?',
];

export const ChatSection: React.FC<ChatSectionProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onNavigate,
  onOpenCategory,
}) => {
  const [messages, setMessages] = useState<ChatTurn[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [accompaniedMode, setAccompaniedMode] = useState(false);

  // Risk protocol & voluntary contact state
  const [riskActive, setRiskActive] = useState(false);
  const [riskCategory, setRiskCategory] = useState<string>('ninguno');
  const [riskDismissedForm, setRiskDismissedForm] = useState(false);

  // Voluntary contact form state
  const [nameOrAlias, setNameOrAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<PreferredContactChannel>('telefono');
  const [consentGiven, setConsentGiven] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const processedInitialRef = useRef<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, riskActive, formSubmitted]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    setChatError(null);
    const userTurnId = `u-${Date.now()}`;
    const userTurn: ChatTurn = {
      id: userTurnId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const priorMessages = messages;
    const nextMessages = [...priorMessages, userTurn];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 35000);

    try {
      const historyPayload = priorMessages
        .filter((m) => m.id !== 'welcome-1' && !m.id.startsWith('welcome-'))
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          accompaniedMode,
        }),
        signal: controller.signal,
      });

      const rawBody = await res.text();
      let data: (ChatApiResponse & { error?: string }) | null = null;
      try {
        data = JSON.parse(rawBody) as ChatApiResponse & { error?: string };
      } catch {
        data = null;
      }

      if (!res.ok || !data || typeof data.reply !== 'string') {
        throw new Error(
          data?.error || 'No fue posible obtener respuesta del chat en este momento. Intente nuevamente.'
        );
      }

      const assistantTurn: ChatTurn = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        riskDetected: data.riskDetected,
        riskCategory: data.riskCategory,
        riskSeverity: data.riskSeverity,
        offTopic: data.offTopic,
        recommendedThemes: data.recommendedThemes,
      };

      setMessages((prev) => [...prev, assistantTurn]);

      if (data.riskDetected) {
        setRiskActive(true);
        setRiskCategory(data.riskCategory);
        setRiskDismissedForm(false);
      }
    } catch (err) {
      // Remove failed turn so history stays valid and restore user's message so they can retry
      setMessages((prev) => prev.filter((m) => m.id !== userTurnId));
      setInput(trimmed);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setChatError('La respuesta tardó demasiado tiempo. Por favor intente enviar su mensaje de nuevo.');
      } else {
        setChatError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un problema de conexión. Por favor intente nuevamente.'
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!initialPrompt) {
      processedInitialRef.current = null;
      return;
    }
    if (processedInitialRef.current !== initialPrompt) {
      processedInitialRef.current = initialPrompt;
      onClearInitialPrompt();
      void sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleNewConversation = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput('');
    setChatError(null);
    setRiskActive(false);
    setRiskCategory('ninguno');
    setRiskDismissedForm(false);
    setFormSubmitted(false);
    setFormError(null);
    setConsentGiven(false);
    setNameOrAlias('');
    setPhone('');
    setEmail('');
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!consentGiven) {
      setFormError(
        'Debe marcar la casilla de autorización para que podamos guardar su contacto.'
      );
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setFormError(
        'Por favor escriba un número de teléfono o un correo electrónico para poder comunicarnos.'
      );
      return;
    }

    setFormSubmitting(true);
    try {
      const reasonMap: Record<string, string> = {
        ideacion_suicida: 'Expresión asociada a ideación o pensamiento suicida',
        autolesion: 'Expresión asociada a riesgo de autolesión',
        desesperanza_extrema: 'Expresión de desesperanza intensa',
        violencia_o_abuso: 'Posible situación de violencia o abuso',
        peligro_inmediato: 'Situación de peligro inmediato',
      };

      const res = await fetch('/api/risk-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameOrAlias: nameOrAlias.trim(),
          phone: phone.trim(),
          email: email.trim(),
          preferredChannel,
          consentGiven,
          reasonSummary:
            reasonMap[riskCategory] || 'Solicitud voluntaria de acompañamiento humano',
          riskCategory,
        }),
      });
      const rawBody = await res.text();
      let data: { ok?: boolean; error?: string } | null = null;
      try {
        data = JSON.parse(rawBody) as { ok?: boolean; error?: string };
      } catch {
        data = null;
      }
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible registrar el contacto.');
      }
      setFormSubmitted(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No fue posible guardar sus datos.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header bar with accessible controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E4D8EC] bg-[#FAF6F0] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <MaggieAvatar size={58} variant="teal-circle" className="shrink-0" />
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl">
              Conversa con Maggie
            </h1>
            <p className="text-base text-[#2B2340]/85">
              Orientación psicoeducativa por inteligencia artificial · No reemplaza terapia ni urgencias
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setAccompaniedMode((prev) => !prev)}
            aria-pressed={accompaniedMode}
            className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl border px-4 py-2 text-base font-bold transition-colors ${
              accompaniedMode
                ? 'border-[#1F6B68] bg-[#E3F2F1] text-[#1F6B68]'
                : 'border-[#D8CBE4] bg-white text-[#2B2340] hover:bg-[#EFE9F6]'
            }`}
          >
            <Users className="h-5 w-5" aria-hidden="true" />
            <span>{accompaniedMode ? 'Modo acompañado activo' : 'Modo acompañado'}</span>
          </button>

          <button
            type="button"
            onClick={handleNewConversation}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[#D8CBE4] bg-white px-4 py-2 text-base font-bold text-[#57407A] transition-colors hover:bg-[#EFE9F6]"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            <span>Nueva conversación</span>
          </button>
        </div>
      </div>

      {/* Urgent support banner option (always calmly reachable) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F0D3B8] bg-[#FDF3DA] px-5 py-3.5 text-base text-[#2B2340]">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="h-5 w-5 shrink-0 text-[#D9644A]" aria-hidden="true" />
          <span>
            ¿Necesita hablar de inmediato con un profesional en Colombia? Marque <strong>106</strong>{' '}
            o ante peligro vital llame al <strong>123</strong>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('lineas')}
          className="font-bold text-[#57407A] underline underline-offset-4 hover:text-[#2B2340]"
        >
          Ver todas las líneas
        </button>
      </div>

      {/* Chat Messages Viewport */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Historial de conversación con Maggie"
        className="space-y-5 rounded-3xl border border-[#E4D8EC] bg-[#FAF6F0] p-4 sm:p-6"
      >
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="mt-1 hidden shrink-0 sm:block">
                  <MaggieAvatar size={42} variant="plum-circle" />
                </div>
              )}

              <div
                className={`max-w-[92%] rounded-2xl p-5 text-[18px] leading-[1.6] sm:max-w-[82%] ${
                  isAssistant
                    ? 'border border-[#DDD0EA] bg-[#EFE9F6] text-[#2B2340]'
                    : 'border border-[#D5C9E2] bg-white text-[#2B2340] shadow-xs'
                }`}
              >
                <p className="mb-1.5 font-sans text-sm font-bold text-[#57407A]">
                  {isAssistant ? 'Maggie (IA psicoeducativa)' : 'Usted'}
                </p>
                <div className="space-y-3 whitespace-pre-line">{msg.content}</div>

                {isAssistant &&
                  msg.recommendedThemes &&
                  msg.recommendedThemes.length > 0 &&
                  !msg.riskDetected && (
                    <div className="mt-4 border-t border-[#D8C8EA] pt-3">
                      <p className="text-sm font-bold text-[#1F6B68]">
                        Lecturas recomendadas en Cartillas educativas:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.recommendedThemes.map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => onOpenCategory(theme as CartillaCategory)}
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1F6B68]/30 bg-white px-3 py-1.5 text-sm font-bold text-[#1F6B68] hover:bg-[#E3F2F1]"
                          >
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            <span>{theme}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <MaggieAvatar size={40} variant="plum-circle" />
            <div className="rounded-2xl border border-[#DDD0EA] bg-[#EFE9F6] px-5 py-4 text-lg font-semibold text-[#57407A]">
              Maggie está preparando su respuesta...
            </div>
          </div>
        )}

        {/* Priority Safety Protocol Panel */}
        {riskActive && (
          <section
            aria-label="Protocolo prioritario de apoyo y líneas de atención"
            className="space-y-5 rounded-2xl border-2 border-[#D9644A] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-[#D9644A]" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-[#2B2340]">
                  Su bienestar y seguridad son lo más importante
                </h2>
                <p className="text-lg leading-relaxed text-[#2B2340]">
                  Por lo que ha compartido, queremos ofrecerle canales reales de atención humana.
                  Maggie es una herramienta de inteligencia artificial y no puede atender una crisis
                  ni prestar primeros auxilios médicos.
                </p>
              </div>
            </div>

            {/* Immediate Official Colombian Lines */}
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="tel:123"
                className="flex min-h-[60px] items-center justify-between rounded-xl border border-[#D9644A] bg-[#FFF2EF] px-4 py-3 text-lg font-bold text-[#2B2340] hover:bg-[#FCE2DC]"
              >
                <span>Emergencias vitales (Colombia): 123</span>
                <PhoneCall className="h-5 w-5 shrink-0 text-[#D9644A]" aria-hidden="true" />
              </a>
              <a
                href="tel:106"
                className="flex min-h-[60px] items-center justify-between rounded-xl border border-[#1F6B68] bg-[#E3F2F1] px-4 py-3 text-lg font-bold text-[#2B2340] hover:bg-[#d2eae8]"
              >
                <span>Línea 106 (Salud mental 24 h)</span>
                <PhoneCall className="h-5 w-5 shrink-0 text-[#1F6B68]" aria-hidden="true" />
              </a>
              <a
                href="tel:192"
                className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#D8CBE4] bg-[#FAF6F0] px-4 py-3 text-base font-bold text-[#2B2340] hover:bg-[#EFE9F6]"
              >
                <span>Línea 192 – Opción 4 (MinSalud)</span>
                <PhoneCall className="h-5 w-5 shrink-0 text-[#57407A]" aria-hidden="true" />
              </a>
              <a
                href="tel:155"
                className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#D8CBE4] bg-[#FAF6F0] px-4 py-3 text-base font-bold text-[#2B2340] hover:bg-[#EFE9F6]"
              >
                <span>Línea 155 (Violencia contra la mujer)</span>
                <PhoneCall className="h-5 w-5 shrink-0 text-[#57407A]" aria-hidden="true" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE1F0] pt-4">
              <p className="text-base text-[#2B2340]">
                También le animamos a comunicarse ahora con un familiar, vecino o persona de confianza.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('lineas')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1F6B68] px-4 py-2 text-base font-bold text-white hover:bg-[#175452]"
              >
                <span>Buscar línea en su ciudad</span>
              </button>
            </div>

            {/* Voluntary, Skippable Contact Form */}
            {!riskDismissedForm && !formSubmitted && (
              <form
                onSubmit={handleSubmitContactForm}
                className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-[#FAF6F0] p-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-6 w-6 text-[#57407A]" aria-hidden="true" />
                    <h3 className="font-display text-xl font-extrabold text-[#57407A]">
                      ¿Desea dejar sus datos de contacto de forma voluntaria?
                    </h3>
                  </div>
                  <p className="text-base text-[#2B2340]">
                    Este paso es <strong>totalmente opcional</strong>. Si decide compartirnos cómo
                    contactarle, una integrante del Comité Directivo del proyecto podrá comunicarse
                    con usted para orientarle hacia redes de apoyo.
                  </p>
                  <div className="flex items-start gap-2 rounded-xl bg-[#FDF3DA] p-3 text-sm font-semibold text-[#2B2340]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D9644A]" aria-hidden="true" />
                    <span>
                      Aviso importante: Enviar sus datos no garantiza una respuesta inmediata y no
                      sustituye la atención de urgencias médicas ni de las líneas 123 o 106.
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-base font-bold text-[#2B2340]">
                      Nombre o cómo prefiere que le llamemos (opcional)
                    </span>
                    <input
                      type="text"
                      value={nameOrAlias}
                      onChange={(e) => setNameOrAlias(e.target.value)}
                      placeholder="Ej. Doña Clara o un alias"
                      className="min-h-[48px] w-full rounded-xl border border-[#C8BBD6] bg-white px-4 py-2 text-base text-[#2B2340]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-base font-bold text-[#2B2340]">
                      Canal preferido de contacto
                    </span>
                    <select
                      value={preferredChannel}
                      onChange={(e) =>
                        setPreferredChannel(e.target.value as PreferredContactChannel)
                      }
                      className="min-h-[48px] w-full rounded-xl border border-[#C8BBD6] bg-white px-4 py-2 text-base text-[#2B2340]"
                    >
                      <option value="telefono">Llamada telefónica</option>
                      <option value="whatsapp">Mensaje de WhatsApp</option>
                      <option value="correo">Correo electrónico</option>
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-base font-bold text-[#2B2340]">
                      Teléfono o celular (opcional si deja correo)
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 300 000 0000"
                      className="min-h-[48px] w-full rounded-xl border border-[#C8BBD6] bg-white px-4 py-2 text-base text-[#2B2340]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-base font-bold text-[#2B2340]">
                      Correo electrónico (opcional si deja teléfono)
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej. correo@ejemplo.com"
                      className="min-h-[48px] w-full rounded-xl border border-[#C8BBD6] bg-white px-4 py-2 text-base text-[#2B2340]"
                    />
                  </label>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D8CBE4] bg-white p-4">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#57407A]"
                  />
                  <span className="text-base leading-relaxed text-[#2B2340]">
                    Autorizo de manera libre, expresa e informada (Ley 1581 de 2012) al equipo
                    directivo de Maggie Sex Ed para guardar estos datos de contacto con el único fin
                    de realizar seguimiento humano y orientarme hacia atención profesional. Comprendo
                    que puedo solicitar su eliminación en cualquier momento y que este envío no
                    garantiza respuesta inmediata.
                  </span>
                </label>

                {formError && (
                  <p role="alert" className="rounded-xl bg-[#FFF2EF] p-3 text-base font-bold text-[#B53D24]">
                    {formError}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="min-h-[50px] rounded-full bg-[#57407A] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#6B4E8C] disabled:opacity-60"
                  >
                    {formSubmitting ? 'Guardando con reserva...' : 'Enviar mis datos voluntariamente'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskDismissedForm(true)}
                    className="min-h-[50px] rounded-full border border-[#C8BBD6] bg-white px-6 py-3 text-base font-bold text-[#2B2340] hover:bg-[#EFE9F6]"
                  >
                    No deseo dejar mis datos
                  </button>
                </div>
              </form>
            )}

            {formSubmitted && (
              <div className="flex items-start gap-3 rounded-2xl border border-[#1F6B68] bg-[#E3F2F1] p-5 text-[#2B2340]">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#1F6B68]" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-lg font-bold text-[#1F6B68]">
                    Sus datos se han registrado con acceso restringido.
                  </p>
                  <p className="text-base">
                    Mientras el comité revisa su solicitud, recuerde que puede llamar de forma
                    gratuita e inmediata a la <strong>Línea 106</strong> o al <strong>123</strong>{' '}
                    si siente peligro en este momento.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        <div ref={endRef} />
      </div>

      {/* Starter prompts (shown at beginning of conversation) */}
      {messages.length <= 2 && (
        <div className="space-y-2">
          <p className="text-base font-bold text-[#2B2340]">
            Algunas preguntas frecuentes para comenzar si lo desea:
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {QUICK_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                disabled={isSending}
                onClick={() => void sendMessage(starter)}
                className="min-h-[50px] rounded-xl border border-[#DCD0E8] bg-white px-4 py-3 text-left text-base font-semibold text-[#57407A] transition-colors hover:bg-[#EFE9F6] disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {chatError && (
        <div role="alert" className="rounded-2xl border border-[#D9644A] bg-[#FFF2EF] p-4 text-base font-semibold text-[#9E2E18]">
          {chatError}
        </div>
      )}

      {/* Large accessible message composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        className="space-y-3 rounded-3xl border border-[#DFD4EA] bg-white p-4 shadow-sm sm:p-5"
      >
        <label htmlFor="maggie-chat-input" className="block text-base font-bold text-[#2B2340]">
          Escriba aquí su pregunta o inquietud con total confianza:
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id="maggie-chat-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="Ejemplo: Tengo dudas sobre los cambios en el deseo después de los 65 años..."
            className="min-h-[84px] flex-1 resize-y rounded-2xl border border-[#C8BBD6] bg-[#FAF6F0] px-4 py-3 text-lg leading-relaxed text-[#2B2340] placeholder:text-[#2B2340]/55"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex min-h-[56px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#57407A] px-7 py-3.5 text-lg font-bold text-white transition-colors hover:bg-[#6B4E8C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span>Enviar</span>
          </button>
        </div>
        <p className="text-sm text-[#2B2340]/75">
          Presione Enter para enviar o Shift + Enter para hacer un salto de línea. Esta conversación
          permanece solo en su sesión actual.
        </p>
      </form>
    </div>
  );
};
