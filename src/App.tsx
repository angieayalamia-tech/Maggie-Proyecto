import { useCallback, useEffect, useState } from 'react';
import { AboutAndPrivacySection } from './components/AboutAndPrivacySection.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ChatSection } from './components/ChatSection.tsx';
import { HelplinesSection } from './components/HelplinesSection.tsx';
import { HomeSection } from './components/HomeSection.tsx';
import { LibrarySection } from './components/LibrarySection.tsx';
import { Navbar } from './components/Navbar.tsx';
import type { PublicSection } from './components/Navbar.tsx';
import type { CartillaCategory, PublicDataPayload } from './types.ts';

export default function App() {
  const [activeSection, setActiveSection] = useState<PublicSection>('inicio');
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.hash === '#admin'
    );
  });

  const [publicData, setPublicData] = useState<PublicDataPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CartillaCategory | 'Todas'>('Todas');

  const loadPublicData = useCallback(async () => {
    try {
      const res = await fetch('/api/public-data');
      if (!res.ok) throw new Error('No fue posible cargar los recursos de la plataforma.');
      const data = (await res.json()) as PublicDataPayload;
      setPublicData(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Error de conexión al cargar la plataforma.'
      );
    }
  }, []);

  useEffect(() => {
    void loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    const syncAdminRoute = () => {
      setIsAdminRoute(
        window.location.hash === '#admin' || window.location.pathname === '/admin'
      );
    };
    window.addEventListener('hashchange', syncAdminRoute);
    window.addEventListener('popstate', syncAdminRoute);
    return () => {
      window.removeEventListener('hashchange', syncAdminRoute);
      window.removeEventListener('popstate', syncAdminRoute);
    };
  }, []);

  const navigateTo = (section: PublicSection) => {
    setIsAdminRoute(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', '/');
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTopicChat = (prompt: string) => {
    setInitialChatPrompt(prompt);
    navigateTo('chat');
  };

  const handleOpenCategory = (category: CartillaCategory) => {
    setSelectedCategory(category);
    navigateTo('cartillas');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF4E6] text-[#2B2340]">
      <Navbar activeSection={activeSection} onNavigate={navigateTo} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 sm:px-6 sm:pt-8">
        {loadError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-[#D9644A] bg-[#FFF2EF] p-4 text-base font-bold text-[#9E2E18]"
          >
            {loadError}
          </div>
        )}

        {isAdminRoute ? (
          <AdminPanel
            onExitAdmin={() => navigateTo('inicio')}
            onDataUpdated={() => void loadPublicData()}
          />
        ) : (
          <>
            {activeSection === 'inicio' && (
              <HomeSection
                onNavigate={navigateTo}
                onStartTopicChat={handleStartTopicChat}
              />
            )}

            {activeSection === 'chat' && (
              <ChatSection
                initialPrompt={initialChatPrompt}
                onClearInitialPrompt={() => setInitialChatPrompt(null)}
                onNavigate={navigateTo}
                onOpenCategory={handleOpenCategory}
              />
            )}

            {activeSection === 'cartillas' && (
              <LibrarySection
                cartillas={publicData?.cartillas ?? []}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {activeSection === 'lineas' && (
              <HelplinesSection helplines={publicData?.helplines ?? []} />
            )}

            {activeSection === 'proyecto' && publicData?.projectInfo && (
              <AboutAndPrivacySection projectInfo={publicData.projectInfo} />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[#E5D9EC] bg-[#FAF6F0] px-4 py-8 text-base text-[#2B2340]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p className="font-display text-lg font-extrabold text-[#57407A]">
              {publicData?.projectInfo.projectName || 'Maggie Sex Ed'} · Sin pena, a cualquier edad
            </p>
            <p className="text-sm text-[#2B2340]/80">
              Herramienta psicoeducativa de inteligencia artificial. No sustituye atención médica,
              psicológica ni emergencias (en Colombia marque 123 o 106).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
            <button
              type="button"
              onClick={() => navigateTo('proyecto')}
              className="text-[#1F6B68] underline underline-offset-4 hover:text-[#2B2340]"
            >
              Privacidad (Ley 1581 de 2012)
            </button>
            <button
              type="button"
              onClick={() => navigateTo('lineas')}
              className="text-[#1F6B68] underline underline-offset-4 hover:text-[#2B2340]"
            >
              Líneas de ayuda
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = 'admin';
                setIsAdminRoute(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#2B2340]/65 hover:text-[#57407A]"
            >
              Acceso equipo directivo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
