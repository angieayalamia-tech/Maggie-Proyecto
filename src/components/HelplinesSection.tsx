import React, { useMemo, useState } from 'react';
import {
  Clock,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
} from 'lucide-react';
import type { HelplineItem } from '../types.ts';

interface HelplinesSectionProps {
  helplines: HelplineItem[];
}

function normalizePhoneForTel(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

function formatWhatsAppUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  const withCountry = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${withCountry}`;
}

export const HelplinesSection: React.FC<HelplinesSectionProps> = ({ helplines }) => {
  const [cityFilter, setCityFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const regionOptions = useMemo(() => {
    const unique = Array.from(new Set(helplines.map((h) => h.city)));
    return ['Todas', ...unique];
  }, [helplines]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return helplines.filter((item) => {
      if (cityFilter !== 'Todas' && item.city !== cityFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.supportType.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q)
      );
    });
  }, [helplines, cityFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-3 rounded-3xl border border-[#E4D8EC] bg-[#FAF6F0] p-6 sm:p-8">
        <p className="font-sans text-sm font-bold uppercase tracking-wider text-[#D9644A]">
          Directorio verificado · Atención psicológica y emergencias en Colombia
        </p>
        <h1 className="font-display text-3xl font-extrabold text-[#2B2340] sm:text-4xl">
          Líneas de atención y apoyo emocional en Colombia
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-[#2B2340]/90">
          Consulte aquí canales telefónicos y digitales oficiales de atención psicológica, escucha
          emocional y orientación frente a violencias en Colombia. Estos servicios son externos e
          independientes de Maggie Sex Ed y están operados por entidades públicas oficiales.
        </p>
      </header>

      {/* Emergency Strip */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-[#D9644A] bg-[#FFF2EF] p-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
            ¿Peligro inmediato para la vida o urgencia médica?
          </h2>
          <p className="text-base text-[#2B2340]">
            En cualquier lugar de Colombia puede comunicarse gratis las 24 horas con la Línea Única
            de Emergencias 123 o acudir al servicio de urgencias más cercano.
          </p>
        </div>
        <a
          href="tel:123"
          className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#D9644A] px-6 py-3 text-lg font-bold text-white hover:bg-[#b84f37]"
        >
          <PhoneCall className="h-5 w-5" aria-hidden="true" />
          <span>Llamar al 123</span>
        </a>
      </div>

      {/* Search & Region Filter */}
      <div className="space-y-4 rounded-2xl border border-[#E4D8EC] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label htmlFor="helpline-search" className="mb-1.5 block text-base font-bold text-[#2B2340]">
              Buscar por ciudad, departamento o necesidad
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#57407A]"
                aria-hidden="true"
              />
              <input
                id="helpline-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. Bogotá, Medellín, Cali, Barranquilla, violencia..."
                className="min-h-[50px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] pr-4 pl-12 text-base text-[#2B2340]"
              />
            </div>
          </div>

          <div className="md:col-span-6">
            <span className="mb-1.5 block text-base font-bold text-[#2B2340]">
              Filtrar por ciudad o cobertura
            </span>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    cityFilter === city
                      ? 'bg-[#57407A] text-white'
                      : 'border border-[#D8CBE4] bg-[#FAF6F0] text-[#2B2340] hover:bg-[#EFE9F6]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Helpline Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((line) => (
          <article
            key={line.id}
            className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xs ${
              line.isEmergency
                ? 'border-[#D9644A] bg-[#FFF8F6]'
                : 'border-[#DFD4EA] bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-2xl font-extrabold text-[#57407A]">
                  {line.name}
                </h2>
              </div>

              <div className="space-y-1.5 text-base text-[#2B2340]">
                <p className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-5 w-5 shrink-0 text-[#1F6B68]" aria-hidden="true" />
                  <span>
                    {line.city} · {line.department} ({line.coverage})
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-5 w-5 shrink-0 text-[#1F6B68]" aria-hidden="true" />
                  <span>{line.hours}</span>
                </p>
              </div>

              <p className="text-base leading-relaxed text-[#2B2340]">
                <strong>Tipo de apoyo:</strong> {line.supportType}
              </p>

              {line.notes && (
                <p className="flex items-start gap-2 rounded-xl bg-[#FAF6F0] p-3 text-sm text-[#2B2340]/90">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#57407A]" aria-hidden="true" />
                  <span>{line.notes}</span>
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-[#EFE9F6] pt-4">
              <a
                href={`tel:${normalizePhoneForTel(line.phone)}`}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#57407A] px-5 py-2.5 text-base font-bold text-white hover:bg-[#6B4E8C]"
              >
                <PhoneCall className="h-5 w-5" aria-hidden="true" />
                <span>Llamar: {line.phone}</span>
              </a>

              {line.whatsapp && (
                <a
                  href={formatWhatsAppUrl(line.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[#1F6B68] bg-[#E3F2F1] px-4 py-2.5 text-base font-bold text-[#1F6B68] hover:bg-[#d2eae8]"
                >
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  <span>WhatsApp: {line.whatsapp}</span>
                </a>
              )}

              {line.email && (
                <a
                  href={`mailto:${line.email}`}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[#D8CBE4] bg-[#FAF6F0] px-4 py-2.5 text-base font-bold text-[#2B2340] hover:bg-[#EFE9F6]"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  <span>{line.email}</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-[#E4D8EC] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[#2B2340]">
            No encontramos líneas locales exactas con ese término. Recuerde que la{' '}
            <strong>Línea 192 (opción 4)</strong>, la <strong>Línea 155</strong> y el{' '}
            <strong>123</strong> tienen cobertura gratuita en toda Colombia.
          </p>
        </div>
      )}
    </div>
  );
};
