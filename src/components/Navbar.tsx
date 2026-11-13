import React, { useState } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { MaggieAvatar } from './MaggieAvatar.tsx';

export type PublicSection = 'inicio' | 'chat' | 'cartillas' | 'lineas' | 'proyecto';

interface NavbarProps {
  activeSection: PublicSection;
  onNavigate: (section: PublicSection) => void;
}

const NAV_ITEMS: Array<{ id: PublicSection; label: string }> = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'chat', label: 'Habla con nosotros' },
  { id: 'cartillas', label: 'Cartillas educativas' },
  { id: 'lineas', label: 'Líneas de atención' },
  { id: 'proyecto', label: 'Sobre el proyecto' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (section: PublicSection) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5D9EC] bg-[#FAF6F0]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Identity (single line, no clutter) */}
        <button
          type="button"
          onClick={() => handleSelect('inicio')}
          className="flex shrink-0 items-center gap-3 text-left focus-visible:outline-none"
        >
          <MaggieAvatar size={42} variant="plum-circle" />
          <span className="font-display text-xl font-extrabold tracking-tight text-[#57407A] whitespace-nowrap sm:text-2xl">
            Maggie Sex Ed
          </span>
        </button>

        {/* Zone 2: Primary Navigation (5 concise links) */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-xl px-3.5 py-2.5 text-base font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#EFE9F6] text-[#57407A]'
                    : 'text-[#2B2340] hover:bg-[#EFE9F6]/60 hover:text-[#57407A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelect('chat')}
            className="hidden items-center gap-2 rounded-full bg-[#57407A] px-5 py-2.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#6B4E8C] sm:inline-flex whitespace-nowrap"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span>Conversar ahora</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#D8CBE4] bg-white px-3 text-[#2B2340] lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Menú móvil"
          className="border-t border-[#E5D9EC] bg-[#FAF6F0] px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[48px] w-full rounded-xl px-4 py-3 text-left text-lg font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#57407A] text-white'
                      : 'bg-white text-[#2B2340] hover:bg-[#EFE9F6]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
