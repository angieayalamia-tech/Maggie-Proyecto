import React from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  Scale,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type { ProjectInfo } from '../types.ts';
import { MaggieAvatar } from './MaggieAvatar.tsx';

interface AboutAndPrivacySectionProps {
  projectInfo: ProjectInfo;
}

export const AboutAndPrivacySection: React.FC<AboutAndPrivacySectionProps> = ({
  projectInfo,
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Project Identity Header */}
      <section className="rounded-3xl border border-[#E4D8EC] bg-[#FAF6F0] p-6 sm:p-10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <MaggieAvatar size={108} variant="default" className="shrink-0" />
          <div className="space-y-2">
            <p className="font-sans text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
              Sobre el proyecto · Psicoeducación, ética y acompañamiento humano
            </p>
            <h1 className="font-display text-3xl font-extrabold text-[#2B2340] sm:text-4xl">
              {projectInfo.projectName}
            </h1>
            <p className="text-xl font-bold text-[#57407A]">{projectInfo.tagline}</p>
            <p className="max-w-3xl text-lg leading-relaxed text-[#2B2340]">
              {projectInfo.purpose}
            </p>
          </div>
        </div>
      </section>

      {/* Objectives & Institutional Profile */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-extrabold text-[#2B2340]">
            Propósito y objetivos
          </h2>
          <ul className="space-y-3">
            {projectInfo.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-[#2B2340]">
                <CheckCircle2
                  className="mt-1 h-5 w-5 shrink-0 text-[#1F6B68]"
                  aria-hidden="true"
                />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6 lg:col-span-5">
          <dl className="space-y-3 text-base">
            <div className="border-b border-[#EFE9F6] pb-2.5">
              <dt className="text-sm font-bold text-[#57407A]">Ubicación</dt>
              <dd className="mt-0.5 text-[#2B2340]">{projectInfo.cityCountry}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-[#57407A]">Correo de contacto</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-[#2B2340]">
                <Mail className="h-4 w-4 text-[#1F6B68]" aria-hidden="true" />
                <span>{projectInfo.contactEmail}</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Team: Comité de las Tres Directoras */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-[#57407A]" aria-hidden="true" />
          <h2 className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl">
            Equipo directivo: Las humanas deciden, la IA asiste
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {projectInfo.directors.map((dir, index) => (
            <article
              key={index}
              className="space-y-2 rounded-2xl border border-[#DFD4EA] bg-white p-6"
            >
              <p className="text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
                {dir.role}
              </p>
              <h3 className="font-display text-xl font-extrabold text-[#2B2340]">
                {dir.name}
              </h3>
              <p className="text-base leading-relaxed text-[#2B2340]/90">{dir.focus}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Privacy Policy & Habeas Data Colombia (Ley 1581 de 2012) */}
      <section
        id="privacidad"
        aria-labelledby="privacidad-heading"
        className="space-y-6 rounded-3xl border border-[#CFE4E2] bg-white p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <Scale className="h-7 w-7 text-[#1F6B68]" aria-hidden="true" />
          <h2 id="privacidad-heading" className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl">
            Privacidad, Tratamiento de Datos (Ley 1581 de 2012) y Alcance de la IA
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl bg-[#FAF6F0] p-5">
            <div className="flex items-center gap-2 text-[#57407A]">
              <Lock className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-xl font-bold">
                1. Aviso de privacidad y minimización de datos
              </h3>
            </div>
            <p className="text-base leading-relaxed text-[#2B2340]">
              En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el Decreto
              1377 de 2013 de Colombia, el responsable del tratamiento de datos es{' '}
              <strong>{projectInfo.dataControllerName}</strong>.
            </p>
            <p className="text-base leading-relaxed text-[#2B2340]">
              Las conversaciones generales con Maggie se mantienen únicamente en la sesión del
              navegador y <strong>no se almacenan en bases de datos permanentes</strong>. Solo se
              guardan datos personales cuando una persona decide llenar voluntariamente el formulario
              de contacto ante una situación de riesgo o solicitud de apoyo.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-[#FAF6F0] p-5">
            <h3 className="font-display text-xl font-bold text-[#57407A]">
              2. Finalidad y consentimiento informado
            </h3>
            <p className="text-base leading-relaxed text-[#2B2340]">
              Los datos voluntarios (nombre o alias, teléfono, correo y canal preferido) se usan
              exclusivamente para que el equipo humano del proyecto pueda comunicarse con la persona y
              orientarla hacia canales profesionales de apoyo. Nunca se utilizan con fines comerciales
              ni se entregan a terceros sin autorización.
            </p>
            <p className="text-base leading-relaxed text-[#2B2340]">
              La ayuda de las líneas telefónicas oficiales (106, 192, 155, 123) nunca está
              condicionada a entregar datos personales en esta plataforma.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-[#FAF6F0] p-5">
            <h3 className="font-display text-xl font-bold text-[#57407A]">
              3. Derechos de Habeas Data y eliminación de datos
            </h3>
            <p className="text-base leading-relaxed text-[#2B2340]">
              Como titular de sus datos, usted tiene derecho a conocer, actualizar, rectificar y
              solicitar la <strong>eliminación total de sus registros</strong> en cualquier momento
              escribiendo a <strong>{projectInfo.contactEmail}</strong>. El equipo administrativo
              cuenta con herramientas directas para suprimir cualquier registro previa solicitud.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#F0D3B8] bg-[#FDF3DA] p-5">
            <div className="flex items-center gap-2 text-[#2B2340]">
              <ShieldAlert className="h-5 w-5 text-[#D9644A]" aria-hidden="true" />
              <h3 className="font-display text-xl font-bold">
                4. Alcance y límites de la inteligencia artificial
              </h3>
            </div>
            <p className="text-base leading-relaxed text-[#2B2340]">
              Maggie es un asistente psicoeducativo de inteligencia artificial.{' '}
              <strong>
                No es psicóloga, médica, sexóloga, terapeuta ni servicio de atención de
                emergencias.
              </strong>{' '}
              Sus respuestas son orientativas y no sustituyen valoraciones clínicas ni urgencias. En
              situaciones de peligro inminente, comuníquese de inmediato al <strong>123</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
