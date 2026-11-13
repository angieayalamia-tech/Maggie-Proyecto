import React from 'react';
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { MaggieAvatar } from './MaggieAvatar.tsx';
import type { PublicSection } from './Navbar.tsx';

interface HomeSectionProps {
  onNavigate: (section: PublicSection) => void;
  onStartTopicChat: (topicPrompt: string) => void;
}

const EXPLORE_TOPICS = [
  {
    title: 'Cambios físicos y deseo',
    description:
      'Comprender con serenidad cómo evolucionan el cuerpo, la excitación, la menopausia o la andropausia con los años.',
    prompt: '¿Qué cambios físicos y en el deseo sexual son habituales durante la adultez mayor?',
  },
  {
    title: 'Mitos, intimidad y pareja',
    description:
      'Dejar atrás la idea de que la vejez es una etapa sin afecto, erotismo o derecho a nuevos vínculos.',
    prompt: '¿Cuáles son los mitos más comunes sobre la sexualidad en las personas mayores?',
  },
  {
    title: 'Autoestima, diversidad y derechos',
    description:
      'Habitar el propio cuerpo con dignidad, respetar la diversidad sexual y ejercer el consentimiento libre a cualquier edad.',
    prompt: '¿Cómo cuidar la autoestima, la imagen corporal y los derechos sexuales en la vejez?',
  },
];

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigate,
  onStartTopicChat,
}) => {
  return (
    <div className="space-y-14 pb-12">
      {/* Hero Presentation */}
      <section className="rounded-3xl border border-[#E5D9EC] bg-[#FAF6F0] p-6 shadow-sm sm:p-10 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <p className="font-sans text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
              Psicoeducación sexual y bienestar emocional · Adultos mayores en Colombia
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-[#2B2340] sm:text-4xl lg:text-5xl">
              Sin pena, a cualquier edad: un espacio seguro para hablar de sexualidad en la vejez.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#2B2340]/90 sm:text-xl">
              La sexualidad, el afecto, el placer y el cuidado del propio cuerpo nos acompañan toda
              la vida. Aquí puede conversar con tranquilidad, leer cartillas claras con respaldo
              científico y encontrar líneas oficiales de atención psicológica en Colombia.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-[#57407A] px-7 py-3.5 text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#6B4E8C]"
              >
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
                <span>Conversar con Maggie</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cartillas')}
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full border-2 border-[#1F6B68] bg-white px-7 py-3.5 text-lg font-bold text-[#1F6B68] transition-colors hover:bg-[#E3F2F1]"
              >
                <BookOpen className="h-6 w-6" aria-hidden="true" />
                <span>Explorar cartillas educativas</span>
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#DFD4EA] bg-[#EFE9F6]/65 p-4 text-base text-[#2B2340]">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#57407A]" aria-hidden="true" />
              <p>
                <strong>Transparencia ante todo:</strong> Maggie es una herramienta de orientación
                educativa basada en inteligencia artificial. No diagnostica, no receta medicamentos
                ni sustituye una consulta médica o psicológica.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EADBC8] bg-[#FFF4E6] p-8 text-center lg:col-span-4">
            <MaggieAvatar size={156} variant="default" />
            <p className="mt-5 font-display text-2xl font-extrabold text-[#57407A]">
              Hola, soy Maggie
            </p>
            <p className="mt-2 text-base leading-relaxed text-[#2B2340]">
              Estoy disponible a cualquier hora para responder sus preguntas con lenguaje claro,
              respeto y base científica.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('lineas')}
              className="mt-5 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#F2B84B] px-5 py-2.5 text-base font-bold text-[#2B2340] transition-colors hover:bg-[#eab03e]"
            >
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
              <span>Ver líneas de ayuda 24 h</span>
            </button>
          </div>
        </div>
      </section>

      {/* Invitación a explorar temas */}
      <section aria-labelledby="temas-heading" className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="temas-heading" className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl">
              ¿Sobre qué le gustaría aprender hoy?
            </h2>
            <p className="mt-1 text-lg text-[#2B2340]/85">
              Puede elegir un tema para iniciar una conversación directa con Maggie o revisar nuestras lecturas.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {EXPLORE_TOPICS.map((topic) => (
            <article
              key={topic.title}
              className="flex flex-col justify-between rounded-2xl border border-[#E4D8EC] bg-white p-6 shadow-sm"
            >
              <div className="space-y-3">
                <h3 className="font-display text-xl font-bold text-[#57407A]">
                  {topic.title}
                </h3>
                <p className="text-base leading-relaxed text-[#2B2340]">
                  {topic.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartTopicChat(topic.prompt)}
                className="mt-6 inline-flex min-h-[46px] items-center justify-between gap-2 rounded-xl bg-[#EFE9F6] px-4 py-3 text-base font-bold text-[#57407A] transition-colors hover:bg-[#57407A] hover:text-white"
              >
                <span>Preguntar sobre esto</span>
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Three core sections quick overview */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border border-[#CFE4E2] bg-[#E3F2F1] p-7">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#1F6B68]">
              <BookOpen className="h-7 w-7" aria-hidden="true" />
              <h2 className="font-display text-2xl font-extrabold text-[#1F6B68]">
                Cartillas y documentos científicos
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-[#2B2340]">
              Acceda a guías de lectura cómoda en pantalla grande y descargue en PDF tanto nuestras
              cartillas temáticas como investigaciones y guías reales de gerontología y sexualidad.
            </p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onNavigate('cartillas')}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#1F6B68] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#175452]"
            >
              <span>Abrir biblioteca</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#F0D3B8] bg-[#FDF3DA] p-7">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#2B2340]">
              <HeartHandshake className="h-7 w-7 text-[#D9644A]" aria-hidden="true" />
              <h2 className="font-display text-2xl font-extrabold text-[#2B2340]">
                Apoyo psicológico en Colombia
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-[#2B2340]">
              Si atraviesa un momento difícil, soledad intensa o una situación de riesgo, consulte
              los teléfonos oficiales gratuitos disponibles 24 horas en Colombia (Línea 106, 192 y 123).
            </p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onNavigate('lineas')}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#2B2340] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#57407A]"
            >
              <span>Consultar líneas de atención</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
