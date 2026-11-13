import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';
import { CARTILLA_CATEGORIES } from '../types.ts';
import type { CartillaCategory, CartillaItem } from '../types.ts';

interface LibrarySectionProps {
  cartillas: CartillaItem[];
  selectedCategory: CartillaCategory | 'Todas';
  onSelectCategory: (category: CartillaCategory | 'Todas') => void;
}

const COVER_STYLES: Record<CartillaItem['coverTone'], string> = {
  plum: 'bg-[#57407A] text-white',
  teal: 'bg-[#1F6B68] text-white',
  coral: 'bg-[#E8836B] text-[#2B2340]',
  gold: 'bg-[#F2B84B] text-[#2B2340]',
  sky: 'bg-[#DCEAF5] text-[#2B2340]',
};

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  cartillas,
  selectedCategory,
  onSelectCategory,
}) => {
  const [sourceFilter, setSourceFilter] = useState<'todas' | 'cartillas' | 'cientificos'>('todas');
  const [activeCartilla, setActiveCartilla] = useState<CartillaItem | null>(null);

  const filtered = useMemo(() => {
    return cartillas.filter((item) => {
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) {
        return false;
      }
      const isMaggieCartilla =
        item.id.startsWith('cartilla-') || item.sourceLabel.includes('Maggie Sex Ed');
      if (sourceFilter === 'cartillas' && !isMaggieCartilla) return false;
      if (sourceFilter === 'cientificos' && isMaggieCartilla) return false;
      return true;
    });
  }, [cartillas, selectedCategory, sourceFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Section Header */}
      <header className="space-y-3 rounded-3xl border border-[#E4D8EC] bg-[#FAF6F0] p-6 sm:p-8">
        <p className="font-sans text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
          Biblioteca psicoeducativa · Lectura accesible y descarga en PDF
        </p>
        <h1 className="font-display text-3xl font-extrabold text-[#2B2340] sm:text-4xl">
          Cartillas educativas y documentos de respaldo
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-[#2B2340]/90">
          Aquí encontrará nuestras cartillas psicoeducativas en lenguaje claro junto con
          investigaciones, libros y manuales reales publicados por universidades e instituciones de
          salud. Puede leerlos aquí o descargar cada PDF de forma gratuita.
        </p>
      </header>

      {/* Source and Category Filters */}
      <div className="space-y-4 rounded-2xl border border-[#E4D8EC] bg-white p-5">
        <div>
          <span className="mb-1.5 block text-base font-bold text-[#2B2340]">
            Tipo de material
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', label: 'Todos los materiales' },
              { id: 'cartillas', label: 'Cartillas Maggie Sex Ed' },
              { id: 'cientificos', label: 'PDFs científicos reales' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSourceFilter(opt.id as typeof sourceFilter)}
                className={`min-h-[48px] rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  sourceFilter === opt.id
                    ? 'bg-[#57407A] text-white'
                    : 'border border-[#D8CBE4] bg-[#FAF6F0] text-[#2B2340] hover:bg-[#EFE9F6]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="border-t border-[#EAE1F0] pt-4">
          <p className="mb-2.5 text-sm font-bold uppercase tracking-wider text-[#57407A]">
            Filtrar por categoría temática
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('Todas')}
              className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === 'Todas'
                  ? 'bg-[#1F6B68] text-white'
                  : 'border border-[#D8CBE4] bg-[#FAF6F0] text-[#2B2340] hover:bg-[#E3F2F1]'
              }`}
            >
              Todas las categorías
            </button>
            {CARTILLA_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#1F6B68] text-white'
                    : 'border border-[#D8CBE4] bg-[#FAF6F0] text-[#2B2340] hover:bg-[#E3F2F1]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-base font-semibold text-[#2B2340]">
        Mostrando {filtered.length} {filtered.length === 1 ? 'material disponible' : 'materiales disponibles'}
        {selectedCategory !== 'Todas' ? ` en «${selectedCategory}»` : ''}.
      </p>

      {/* Grid of Cartillas */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E4D8EC] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[#2B2340]">
            No encontramos cartillas con ese filtro de búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSourceFilter('todas');
              onSelectCategory('Todas');
            }}
            className="mt-4 min-h-[48px] rounded-full bg-[#57407A] px-6 py-2.5 text-base font-bold text-white"
          >
            Mostrar todas las cartillas
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#DFD4EA] bg-white shadow-xs"
            >
              <div>
                {/* Book cover visual */}
                <div className={`p-5 ${COVER_STYLES[item.coverTone]}`}>
                  <p className="font-sans text-xs font-bold uppercase tracking-wider opacity-90">
                    {item.category}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-extrabold leading-snug text-current">
                    {item.title}
                  </h2>
                </div>

                <div className="space-y-3 p-5">
                  <p className="text-sm font-bold text-[#1F6B68]">
                    {item.sourceLabel} · {item.year}
                  </p>
                  <p className="text-base leading-relaxed text-[#2B2340]">
                    {item.shortDescription}
                  </p>
                  <p className="font-serif text-sm italic text-[#2B2340]/80">
                    {item.authorOrInstitution} · {item.readingMinutes} min
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 border-t border-[#EFE9F6] bg-[#FAF6F0] p-4">
                <button
                  type="button"
                  onClick={() => setActiveCartilla(item)}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#57407A] px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#6B4E8C]"
                >
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  <span>Leer aquí</span>
                </button>

                <a
                  href={`/api/cartillas/${item.id}/pdf`}
                  download
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#1F6B68] bg-white px-4 py-2.5 text-base font-bold text-[#1F6B68] transition-colors hover:bg-[#E3F2F1]"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  <span>PDF</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Comfortable Reading Modal */}
      {activeCartilla && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reader-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2340]/65 p-3 sm:p-6"
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#DFD4EA] bg-[#FAF6F0] shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5D9EC] bg-white px-6 py-5">
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
                  {activeCartilla.category} · {activeCartilla.sourceLabel}
                </p>
                <h2
                  id="reader-modal-title"
                  className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl"
                >
                  {activeCartilla.title}
                </h2>
                <p className="font-serif text-base italic text-[#2B2340]/80">
                  {activeCartilla.authorOrInstitution} ({activeCartilla.year})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCartilla(null)}
                aria-label="Cerrar lectura"
                className="inline-flex min-h-[46px] min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#D8CBE4] bg-[#FAF6F0] text-[#2B2340] hover:bg-[#EFE9F6]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
              <p className="mx-auto max-w-prose text-xl leading-relaxed font-semibold text-[#57407A]">
                {activeCartilla.shortDescription}
              </p>

              <div className="mx-auto max-w-prose space-y-6">
                {activeCartilla.sections.map((section, idx) => (
                  <section key={idx} className="space-y-2 border-t border-[#E5D9EC] pt-5">
                    <h3 className="font-display text-2xl font-bold text-[#2B2340]">
                      {section.heading}
                    </h3>
                    <p className="text-[19px] leading-[1.7] text-[#2B2340] whitespace-pre-line">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>

              {activeCartilla.pdfUrl && (
                <div className="mx-auto max-w-prose space-y-3 rounded-2xl border border-[#CFE4E2] bg-[#E3F2F1] p-5">
                  <div className="flex items-center gap-2 text-[#1F6B68]">
                    <FileText className="h-6 w-6" aria-hidden="true" />
                    <h3 className="font-display text-xl font-bold text-[#1F6B68]">
                      Documento PDF completo adjunto
                    </h3>
                  </div>
                  <p className="text-base text-[#2B2340]">
                    Puede abrir el documento PDF original en el visor o descargarlo en su dispositivo
                    para leerlo sin conexión.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href={activeCartilla.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1F6B68] px-5 py-2.5 text-base font-bold text-white hover:bg-[#175452]"
                    >
                      <ExternalLink className="h-5 w-5" aria-hidden="true" />
                      <span>Abrir documento PDF</span>
                    </a>
                    <a
                      href={`/api/cartillas/${activeCartilla.id}/pdf`}
                      download
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[#1F6B68] bg-white px-5 py-2.5 text-base font-bold text-[#1F6B68] hover:bg-[#FAF6F0]"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                      <span>Descargar archivo PDF</span>
                    </a>
                  </div>
                </div>
              )}

              <p className="mx-auto max-w-prose border-t border-[#E5D9EC] pt-4 text-sm text-[#2B2340]/80">
                Aviso educativo: Este contenido es exclusivamente informativo y psicoeducativo. No
                reemplaza la valoración médica, psicológica ni sexológica presencial.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5D9EC] bg-white px-6 py-4">
              <a
                href={`/api/cartillas/${activeCartilla.id}/pdf`}
                download
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#1F6B68] px-6 py-2.5 text-base font-bold text-white hover:bg-[#175452]"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
                <span>Descargar PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveCartilla(null)}
                className="min-h-[48px] rounded-full border border-[#C8BBD6] bg-[#FAF6F0] px-6 py-2.5 text-base font-bold text-[#2B2340] hover:bg-[#EFE9F6]"
              >
                Cerrar lectura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
