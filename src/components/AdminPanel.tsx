import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Download,
  FilePlus2,
  KeyRound,
  Lock,
  LogOut,
  PhoneCall,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { CARTILLA_CATEGORIES } from '../types.ts';
import type {
  AdminOverviewPayload,
  CartillaCategory,
  CartillaItem,
  HelplineItem,
  ProjectInfo,
  RiskContactStatus,
} from '../types.ts';

interface AdminPanelProps {
  onExitAdmin: () => void;
  onDataUpdated: () => void;
}

type AdminTab = 'contactos' | 'cartillas' | 'lineas' | 'configuracion';

const TOKEN_STORAGE_KEY = 'maggie_admin_token';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onExitAdmin,
  onDataUpdated,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('contactos');
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});

  // New cartilla form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CartillaCategory>('Sexualidad y envejecimiento');
  const [newDesc, setNewDesc] = useState('');
  const [newAuthor, setNewAuthor] = useState('Comité Maggie Sex Ed');
  const [newBody, setNewBody] = useState('');
  const [newIsDemo, setNewIsDemo] = useState(false);
  const [newCoverTone, setNewCoverTone] = useState<CartillaItem['coverTone']>('plum');
  const [pdfBase64, setPdfBase64] = useState<string | undefined>(undefined);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // New helpline form
  const [hlName, setHlName] = useState('');
  const [hlCity, setHlCity] = useState('');
  const [hlDept, setHlDept] = useState('');
  const [hlPhone, setHlPhone] = useState('');
  const [hlWhatsapp, setHlWhatsapp] = useState('');
  const [hlHours, setHlHours] = useState('24 horas, todos los días');
  const [hlSupport, setHlSupport] = useState('');

  // Prompt & Project config editing
  const [promptDraft, setPromptDraft] = useState('');
  const [projectDraft, setProjectDraft] = useState<ProjectInfo | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const showSuccess = (msg: string) => {
    setFeedbackIsError(false);
    setFeedbackMsg(msg);
  };

  const showError = (msg: string) => {
    setFeedbackIsError(true);
    setFeedbackMsg(msg);
  };

  const parseJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    const raw = await res.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const handleUnauthorized = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setOverview(null);
    setLoginError('Su sesión administrativa expiró. Por favor ingrese nuevamente.');
  };

  const fetchOverview = async (activeToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) throw new Error('Error al cargar el panel.');
      const data = (await res.json()) as AdminOverviewPayload;
      setOverview(data);
      setPromptDraft(data.systemPrompt);
      setProjectDraft(data.projectInfo);
      const nextDrafts: Record<string, string> = {};
      for (const rc of data.riskContacts) {
        nextDrafts[rc.id] = rc.adminNotes;
      }
      setNotesDrafts(nextDrafts);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'No fue posible cargar la información administrativa.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchOverview(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await parseJsonSafe<{ token?: string; error?: string }>(res);
      if (!res.ok || !data?.token) {
        throw new Error(data?.error || 'No fue posible iniciar sesión.');
      }
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setPasswordInput('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Credenciales incorrectas.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setOverview(null);
    onExitAdmin();
  };

  const handleUpdateContactStatus = async (
    id: string,
    status: RiskContactStatus,
    adminNotes: string
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/risk-contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible actualizar el seguimiento.');
      }
      showSuccess('Estado de seguimiento actualizado.');
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al actualizar.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/risk-contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible eliminar el registro.');
      }
      showSuccess('Registro eliminado permanentemente (cumplimiento Ley 1581).');
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al eliminar.');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/risk-contacts/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        throw new Error('No fue posible exportar los registros.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maggie-contactos.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al exportar registros.');
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showError('Por favor seleccione únicamente archivos en formato PDF.');
      e.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showError('El archivo PDF supera el límite máximo permitido de 8 MB.');
      e.target.value = '';
      return;
    }
    setPdfFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCartilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/cartillas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          shortDescription: newDesc,
          authorOrInstitution: newAuthor,
          isDemonstrative: newIsDemo,
          coverTone: newCoverTone,
          bodyText: newBody,
          pdfBase64,
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        showError(data?.error || 'No fue posible crear la cartilla.');
        return;
      }
      setNewTitle('');
      setNewDesc('');
      setNewBody('');
      setPdfBase64(undefined);
      setPdfFileName('');
      showSuccess('Cartilla agregada a la biblioteca.');
      onDataUpdated();
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al publicar la cartilla.');
    }
  };

  const handleDeleteCartilla = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/cartillas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible eliminar la cartilla.');
      }
      showSuccess('Cartilla eliminada de la biblioteca.');
      onDataUpdated();
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al eliminar la cartilla.');
    }
  };

  const handleAddHelpline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/helplines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hlName,
          city: hlCity,
          department: hlDept || hlCity,
          coverage: hlCity,
          phone: hlPhone,
          whatsapp: hlWhatsapp || undefined,
          hours: hlHours,
          supportType: hlSupport || 'Orientación psicológica',
        } satisfies Partial<HelplineItem>),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible guardar la línea de atención.');
      }
      setHlName('');
      setHlCity('');
      setHlDept('');
      setHlPhone('');
      setHlWhatsapp('');
      setHlSupport('');
      showSuccess('Línea de atención agregada.');
      onDataUpdated();
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al guardar la línea.');
    }
  };

  const handleDeleteHelpline = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/helplines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible eliminar la línea de atención.');
      }
      showSuccess('Línea de atención eliminada.');
      onDataUpdated();
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al eliminar la línea.');
    }
  };

  const handleSaveConfig = async (resetPrompt = false) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          systemPrompt: resetPrompt ? undefined : promptDraft,
          projectInfo: projectDraft,
          resetPrompt,
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible guardar la configuración.');
      }
      showSuccess(
        resetPrompt
          ? 'Prompt de Maggie restaurado a la versión base.'
          : 'Configuración del proyecto y prompt guardados.'
      );
      onDataUpdated();
      await fetchOverview(token);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al guardar la configuración.');
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || newAdminPassword.trim().length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newAdminPassword }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await parseJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible actualizar la contraseña.');
      }
      setNewAdminPassword('');
      showSuccess('Contraseña administrativa actualizada correctamente.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error de conexión al actualizar la contraseña.');
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <div className="space-y-6 rounded-3xl border border-[#DFD4EA] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#57407A]">
            <Lock className="h-7 w-7" aria-hidden="true" />
            <h1 className="font-display text-2xl font-extrabold text-[#2B2340]">
              Panel Administrativo Privado
            </h1>
          </div>
          <p className="text-base leading-relaxed text-[#2B2340]">
            Acceso exclusivo para el Comité Directivo de Maggie Sex Ed. Aquí se gestionan los
            contactos voluntarios de seguimiento, las cartillas PDF, las líneas de atención y el
            prompt especializado de Maggie.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-base font-bold text-[#2B2340]">Contraseña de acceso</span>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                placeholder="Ingrese la contraseña del comité"
                className="min-h-[50px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-4 py-2 text-base text-[#2B2340]"
              />
            </label>

            {loginError && (
              <p role="alert" className="rounded-xl bg-[#FFF2EF] p-3 text-base font-bold text-[#B53D24]">
                {loginError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loggingIn}
                className="min-h-[50px] flex-1 rounded-full bg-[#57407A] px-6 py-3 text-base font-bold text-white hover:bg-[#6B4E8C] disabled:opacity-60"
              >
                {loggingIn ? 'Verificando...' : 'Ingresar al panel'}
              </button>
              <button
                type="button"
                onClick={onExitAdmin}
                className="min-h-[50px] rounded-full border border-[#C8BBD6] bg-[#FAF6F0] px-5 py-3 text-base font-bold text-[#2B2340]"
              >
                Volver al sitio
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Header */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-[#DFD4EA] bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#1F6B68]">
            Acceso restringido · Comité de las Tres Directoras
          </p>
          <h1 className="font-display text-2xl font-extrabold text-[#2B2340] sm:text-3xl">
            Panel de Gestión Maggie Sex Ed
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {overview && (
            <div className="rounded-xl border border-[#D9644A] bg-[#FFF2EF] px-4 py-2 text-base font-bold text-[#2B2340] tabular-nums">
              Pendientes de revisión: {overview.pendingCount}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[#D8CBE4] bg-[#FAF6F0] px-4 py-2 text-base font-bold text-[#57407A] hover:bg-[#EFE9F6]"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {feedbackMsg && (
        <div
          role={feedbackIsError ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-base font-semibold ${
            feedbackIsError
              ? 'border-[#D9644A] bg-[#FFF2EF] text-[#9E2E18]'
              : 'border-[#1F6B68] bg-[#E3F2F1] text-[#1F6B68]'
          }`}
        >
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-sm font-bold underline"
          >
            Ocultar
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: 'contactos',
            label: `Contactos voluntarios (${overview?.riskContacts.length ?? 0})`,
            icon: Users,
          },
          {
            id: 'cartillas',
            label: `Cartillas y PDFs (${overview?.cartillas.length ?? 0})`,
            icon: BookOpen,
          },
          {
            id: 'lineas',
            label: `Líneas de atención (${overview?.helplines.length ?? 0})`,
            icon: PhoneCall,
          },
          {
            id: 'configuracion',
            label: 'Prompt de Maggie y Proyecto',
            icon: Settings,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-xl px-5 py-2.5 text-base font-bold transition-colors ${
                active
                  ? 'bg-[#57407A] text-white'
                  : 'border border-[#DFD4EA] bg-white text-[#2B2340] hover:bg-[#EFE9F6]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !overview && (
        <p className="rounded-2xl bg-white p-6 text-lg font-semibold text-[#57407A]">
          Cargando información administrativa...
        </p>
      )}

      {/* TAB 1: Risk Contacts */}
      {overview && activeTab === 'contactos' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFD4EA] bg-white p-5">
            <p className="text-base text-[#2B2340]">
              Registros voluntarios con consentimiento explícito Ley 1581 de 2012. No se almacenan
              transcripciones completas del chat.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleExport('csv')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1F6B68] px-4 py-2 text-sm font-bold text-white hover:bg-[#175452]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => void handleExport('json')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#1F6B68] bg-white px-4 py-2 text-sm font-bold text-[#1F6B68] hover:bg-[#E3F2F1]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {overview.riskContacts.length === 0 ? (
            <div className="rounded-2xl border border-[#DFD4EA] bg-white p-8 text-center text-lg text-[#2B2340]/80">
              No hay registros de contacto voluntario almacenados en este momento.
            </div>
          ) : (
            <div className="space-y-4">
              {overview.riskContacts.map((record) => (
                <article
                  key={record.id}
                  className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#57407A] tabular-nums">
                        ID: {record.id} · {new Date(record.createdAt).toLocaleString('es-CO')}
                      </p>
                      <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
                        {record.nameOrAlias}
                      </h2>
                      <p className="text-base text-[#2B2340]">
                        <strong>Motivo:</strong> {record.reasonSummary} ({record.riskCategory})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg px-3 py-1 text-sm font-bold uppercase ${
                          record.status === 'pendiente'
                            ? 'bg-[#FFF2EF] text-[#B53D24]'
                            : record.status === 'revisado'
                              ? 'bg-[#FDF3DA] text-[#2B2340]'
                              : 'bg-[#E3F2F1] text-[#1F6B68]'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-xl bg-[#FAF6F0] p-4 text-base sm:grid-cols-3">
                    <div>
                      <span className="text-sm font-bold text-[#57407A]">Teléfono</span>
                      <p>{record.phone || 'No indicado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#57407A]">Correo</span>
                      <p>{record.email || 'No indicado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#57407A]">
                        Canal preferido / Consentimiento
                      </span>
                      <p>
                        {record.preferredChannel} · Consentimiento Ley 1581:{' '}
                        {record.consentGiven ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 space-y-1">
                      <span className="text-sm font-bold text-[#2B2340]">
                        Notas internas de seguimiento
                      </span>
                      <input
                        type="text"
                        value={notesDrafts[record.id] ?? record.adminNotes}
                        onChange={(e) =>
                          setNotesDrafts((prev) => ({
                            ...prev,
                            [record.id]: e.target.value,
                          }))
                        }
                        onBlur={() => {
                          const draft = notesDrafts[record.id] ?? record.adminNotes;
                          if (draft !== record.adminNotes) {
                            void handleUpdateContactStatus(record.id, record.status, draft);
                          }
                        }}
                        placeholder="Ej. Llamada realizada por Directora Comportamental..."
                        className="min-h-[44px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {(['pendiente', 'revisado', 'gestionado'] as RiskContactStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() =>
                              void handleUpdateContactStatus(
                                record.id,
                                st,
                                notesDrafts[record.id] ?? record.adminNotes
                              )
                            }
                            className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold capitalize ${
                              record.status === st
                                ? 'bg-[#57407A] text-white'
                                : 'border border-[#D8CBE4] bg-white text-[#2B2340] hover:bg-[#EFE9F6]'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => void handleDeleteContact(record.id)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D9644A] bg-[#FFF2EF] px-4 py-2 text-sm font-bold text-[#B53D24] hover:bg-[#FCE2DC]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Cartillas & PDFs */}
      {overview && activeTab === 'cartillas' && (
        <section className="space-y-6">
          <form
            onSubmit={handleAddCartilla}
            className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6"
          >
            <div className="flex items-center gap-2 text-[#57407A]">
              <FilePlus2 className="h-6 w-6" aria-hidden="true" />
              <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
                Agregar nueva cartilla o documento PDF
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-bold text-[#2B2340]">Título</span>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-bold text-[#2B2340]">Categoría temática</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CartillaCategory)}
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
                >
                  {CARTILLA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-bold text-[#2B2340]">Autor o institución</span>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-bold text-[#2B2340]">Color de portada</span>
                <select
                  value={newCoverTone}
                  onChange={(e) => setNewCoverTone(e.target.value as CartillaItem['coverTone'])}
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
                >
                  <option value="plum">Ciruela</option>
                  <option value="teal">Verde azulado</option>
                  <option value="coral">Coral cálido</option>
                  <option value="gold">Dorado miel</option>
                  <option value="sky">Azul suave</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-bold text-[#2B2340]">Descripción breve</span>
              <input
                type="text"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-bold text-[#2B2340]">
                Texto completo para lectura en pantalla
              </span>
              <textarea
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Redacte el contenido educativo que se mostrará en el lector..."
                className="w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-[#2B2340]">
                <input
                  type="checkbox"
                  checked={newIsDemo}
                  onChange={(e) => setNewIsDemo(e.target.checked)}
                  className="h-5 w-5 accent-[#57407A]"
                />
                <span>Marcar como material demostrativo</span>
              </label>

              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-[#1F6B68] bg-[#E3F2F1] px-4 py-2 text-sm font-bold text-[#1F6B68]">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{pdfFileName ? `PDF listo: ${pdfFileName}` : 'Adjuntar archivo PDF (opcional)'}</span>
                <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="sr-only" />
              </label>
            </div>

            <button
              type="submit"
              className="min-h-[48px] rounded-full bg-[#57407A] px-6 py-2.5 text-base font-bold text-white hover:bg-[#6B4E8C]"
            >
              Publicar cartilla en biblioteca
            </button>
          </form>

          <div className="space-y-3">
            {overview.cartillas.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFD4EA] bg-white p-4"
              >
                <div>
                  <p className="text-sm font-bold text-[#1F6B68]">
                    {c.category} · {c.sourceLabel}
                  </p>
                  <p className="font-display text-lg font-bold text-[#2B2340]">{c.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteCartilla(c.id)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D9644A] bg-[#FFF2EF] px-4 py-2 text-sm font-bold text-[#B53D24]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: Helplines */}
      {overview && activeTab === 'lineas' && (
        <section className="space-y-6">
          <form
            onSubmit={handleAddHelpline}
            className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6"
          >
            <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
              Agregar nueva línea oficial verificada
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Nombre de la línea"
                value={hlName}
                onChange={(e) => setHlName(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
              <input
                type="text"
                required
                placeholder="Ciudad o cobertura (ej. Pereira)"
                value={hlCity}
                onChange={(e) => setHlCity(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
              <input
                type="text"
                placeholder="Departamento (ej. Risaralda)"
                value={hlDept}
                onChange={(e) => setHlDept(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
              <input
                type="text"
                required
                placeholder="Teléfono principal"
                value={hlPhone}
                onChange={(e) => setHlPhone(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
              <input
                type="text"
                placeholder="WhatsApp (opcional)"
                value={hlWhatsapp}
                onChange={(e) => setHlWhatsapp(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
              <input
                type="text"
                required
                placeholder="Horario de atención"
                value={hlHours}
                onChange={(e) => setHlHours(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
              />
            </div>
            <input
              type="text"
              placeholder="Tipo de apoyo (ej. Contención psicológica y primeros auxilios emocionales)"
              value={hlSupport}
              onChange={(e) => setHlSupport(e.target.value)}
              className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-base"
            />
            <button
              type="submit"
              className="min-h-[48px] rounded-full bg-[#57407A] px-6 py-2.5 text-base font-bold text-white hover:bg-[#6B4E8C]"
            >
              Guardar línea de atención
            </button>
          </form>

          <div className="space-y-3">
            {overview.helplines.map((line) => (
              <div
                key={line.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFD4EA] bg-white p-4"
              >
                <div>
                  <p className="font-display text-lg font-bold text-[#2B2340]">{line.name}</p>
                  <p className="text-sm text-[#1F6B68]">
                    {line.city} · Tel: {line.phone} · {line.hours}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteHelpline(line.id)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D9644A] bg-[#FFF2EF] px-4 py-2 text-sm font-bold text-[#B53D24]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: Modular Prompt & Project Info */}
      {overview && activeTab === 'configuracion' && projectDraft && (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
                  Prompt especializado del sistema (Maggie)
                </h2>
                <p className="text-sm text-[#2B2340]/80">
                  Modifique aquí la personalidad, límites temáticos o instrucciones clínicas de
                  Maggie sin reconstruir la página.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveConfig(true)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-4 py-2 text-sm font-bold text-[#2B2340]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Restaurar prompt original</span>
              </button>
            </div>

            <textarea
              rows={14}
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              className="w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] p-4 font-mono text-sm leading-relaxed text-[#2B2340]"
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-[#DFD4EA] bg-white p-6">
            <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
              Información institucional del proyecto
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-bold">Nombre del proyecto</span>
                <input
                  type="text"
                  value={projectDraft.projectName}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, projectName: e.target.value })
                  }
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-bold">Institución educativa</span>
                <input
                  type="text"
                  value={projectDraft.institution}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, institution: e.target.value })
                  }
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-bold">Correo oficial de contacto</span>
                <input
                  type="email"
                  value={projectDraft.contactEmail}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, contactEmail: e.target.value })
                  }
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-bold">Teléfono institucional</span>
                <input
                  type="text"
                  value={projectDraft.contactPhone}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, contactPhone: e.target.value })
                  }
                  className="min-h-[46px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2"
                />
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-bold text-[#57407A]">Nombres del equipo directivo</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {projectDraft.directors.map((dir, i) => (
                  <label key={dir.role} className="block space-y-1">
                    <span className="text-xs font-bold text-[#2B2340]">{dir.role}</span>
                    <input
                      type="text"
                      value={dir.name}
                      onChange={(e) => {
                        const updated = [...projectDraft.directors];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setProjectDraft({ ...projectDraft, directors: updated });
                      }}
                      className="min-h-[44px] w-full rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-3 py-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSaveConfig(false)}
              className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[#57407A] px-6 py-2.5 text-base font-bold text-white hover:bg-[#6B4E8C]"
            >
              <Save className="h-5 w-5" aria-hidden="true" />
              <span>Guardar prompt y datos del proyecto</span>
            </button>
          </div>

          <form
            onSubmit={handleChangeAdminPassword}
            className="space-y-3 rounded-2xl border border-[#DFD4EA] bg-white p-6"
          >
            <div className="flex items-center gap-2 text-[#57407A]">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
              <h2 className="font-display text-xl font-extrabold text-[#2B2340]">
                Actualizar contraseña administrativa
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="password"
                minLength={8}
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Nueva contraseña (mínimo 8 caracteres)"
                className="min-h-[46px] flex-1 rounded-xl border border-[#C8BBD6] bg-[#FAF6F0] px-4 py-2"
              />
              <button
                type="submit"
                className="min-h-[46px] rounded-full bg-[#1F6B68] px-6 py-2 text-base font-bold text-white hover:bg-[#175452]"
              >
                Actualizar contraseña
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-[#2B2340]/75">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>
                Si ADMIN_PASSWORD está definida en los secretos del servidor, esa variable tiene
                prioridad sobre la contraseña guardada aquí.
              </span>
            </p>
          </form>
        </section>
      )}
    </div>
  );
};
