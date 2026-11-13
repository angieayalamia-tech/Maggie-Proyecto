import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  createAdminToken,
  hashPassword,
  requireAdmin,
  verifyAdminPassword,
} from './server/auth.ts';
import {
  DEFAULT_MAGGIE_SYSTEM_PROMPT,
  generateMaggieResponse,
} from './server/maggiePrompt.ts';
import { generateCartillaPdfBuffer } from './server/pdfGenerator.ts';
import {
  getUploadsDir,
  readStore,
  updateStore,
} from './server/storage.ts';
import type {
  CartillaCategory,
  CartillaItem,
  HelplineItem,
  PreferredContactChannel,
  ProjectInfo,
  RiskContactRecord,
  RiskContactStatus,
} from './src/types.ts';

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'maggie-sex-ed' });
  });

  // Public read-only data (never returns riskContacts or internal prompt)
  app.get('/api/public-data', async (_req, res) => {
    try {
      const store = await readStore();
      res.setHeader('Cache-Control', 'no-store');
      res.json({
        cartillas: store.cartillas,
        helplines: store.helplines,
        projectInfo: store.projectInfo,
      });
    } catch (error) {
      console.error('Error loading public data:', error);
      res.status(500).json({ error: 'No fue posible cargar la información pública.' });
    }
  });

  // Chatbot conversation endpoint (server-side Gemini call)
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, accompaniedMode } = req.body as {
        message?: string;
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
        accompaniedMode?: boolean;
      };

      const cleanMessage = typeof message === 'string' ? message.trim() : '';
      if (!cleanMessage) {
        res.status(400).json({ error: 'Por favor escribe un mensaje antes de enviar.' });
        return;
      }
      if (cleanMessage.length > 2000) {
        res.status(400).json({ error: 'El mensaje es demasiado largo (máximo 2000 caracteres).' });
        return;
      }

      const store = await readStore();
      const safeHistory = Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                (item.role === 'user' || item.role === 'assistant') &&
                typeof item.content === 'string'
            )
            .map((item) => ({
              role: item.role,
              content: item.content.slice(0, 2000),
            }))
        : [];

      const result = await generateMaggieResponse({
        message: cleanMessage,
        history: safeHistory,
        systemPrompt: store.systemPrompt || DEFAULT_MAGGIE_SYSTEM_PROMPT,
        accompaniedMode: Boolean(accompaniedMode),
      });

      res.json(result);
    } catch (error) {
      console.error('Error in /api/chat:', error);
      const rawMsg = error instanceof Error ? error.message : String(error);
      let errMsg = 'No pudimos procesar su mensaje en este momento. Por favor intente nuevamente.';
      if (
        rawMsg.includes('GEMINI_API_KEY') ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('PERMISSION_DENIED')
      ) {
        errMsg =
          'No se pudo validar la clave de Gemini en el servidor. Verifique GEMINI_API_KEY en Settings > Secrets.';
      } else if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
        errMsg =
          'Se agotó temporalmente la cuota diaria gratuita de Gemini. Puede esperar o configurar una clave con mayor cuota en Settings > Secrets.';
      }
      res.status(502).json({ error: errMsg });
    }
  });

  // Voluntary risk contact submission (strictly consent-gated, never exposes list publicly)
  app.post('/api/risk-contacts', async (req, res) => {
    try {
      const {
        nameOrAlias,
        phone,
        email,
        preferredChannel,
        consentGiven,
        reasonSummary,
        riskCategory,
      } = req.body as {
        nameOrAlias?: string;
        phone?: string;
        email?: string;
        preferredChannel?: PreferredContactChannel;
        consentGiven?: boolean;
        reasonSummary?: string;
        riskCategory?: string;
      };

      if (consentGiven !== true) {
        res.status(400).json({
          error:
            'Debe marcar la casilla de consentimiento explícito para autorizar el registro de sus datos.',
        });
        return;
      }

      const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
      const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 120) : '';
      if (!cleanPhone && !cleanEmail) {
        res.status(400).json({
          error: 'Por favor indique al menos un teléfono o un correo electrónico de contacto.',
        });
        return;
      }

      const allowedChannels: PreferredContactChannel[] = ['telefono', 'whatsapp', 'correo'];
      const channel: PreferredContactChannel =
        preferredChannel && allowedChannels.includes(preferredChannel)
          ? preferredChannel
          : cleanPhone
            ? 'telefono'
            : 'correo';

      const now = new Date().toISOString();
      const record: RiskContactRecord = {
        id: `rc-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: now,
        nameOrAlias:
          typeof nameOrAlias === 'string' && nameOrAlias.trim()
            ? nameOrAlias.trim().slice(0, 100)
            : 'Persona usuaria (sin nombre)',
        phone: cleanPhone,
        email: cleanEmail,
        preferredChannel: channel,
        consentGiven: true,
        consentTimestamp: now,
        reasonSummary:
          typeof reasonSummary === 'string' && reasonSummary.trim()
            ? reasonSummary.trim().slice(0, 240)
            : 'Activación voluntaria desde protocolo de apoyo',
        riskCategory:
          typeof riskCategory === 'string' && riskCategory.trim()
            ? riskCategory.trim().slice(0, 60)
            : 'riesgo_detectado',
        status: 'pendiente',
        adminNotes: '',
        updatedAt: now,
      };

      await updateStore((store) => ({
        ...store,
        riskContacts: [record, ...store.riskContacts],
      }));

      res.status(201).json({
        ok: true,
        id: record.id,
        createdAt: record.createdAt,
      });
    } catch (error) {
      console.error('Error saving risk contact:', error);
      res.status(500).json({ error: 'No fue posible registrar sus datos en este momento.' });
    }
  });

  // Download or stream PDF for any cartilla
  app.get('/api/cartillas/:id/pdf', async (req, res) => {
    try {
      const store = await readStore();
      const cartilla = store.cartillas.find((c) => c.id === req.params.id);
      if (!cartilla) {
        res.status(404).json({ error: 'Cartilla no encontrada.' });
        return;
      }

      const safeFileBase = cartilla.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);

      res.setHeader('Cache-Control', 'no-store');

      if (cartilla.uploadedFileName) {
        const uploadedPath = path.join(getUploadsDir(), path.basename(cartilla.uploadedFileName));
        try {
          const bytes = await fs.readFile(uploadedPath);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${safeFileBase || 'cartilla'}.pdf"`);
          res.send(bytes);
          return;
        } catch {
          // Fall through if uploaded file was removed
        }
      }

      if (cartilla.pdfUrl && cartilla.pdfUrl.startsWith('/assets/aistudio/')) {
        const relAssetPath = cartilla.pdfUrl.replace(/^\/+/, '');
        const candidatePaths = [
          path.resolve(process.cwd(), 'public', relAssetPath),
          path.resolve(process.cwd(), 'dist', relAssetPath),
          path.resolve(SERVER_DIR, 'public', relAssetPath),
          path.resolve(SERVER_DIR, 'dist', relAssetPath),
        ];

        for (const candidatePath of candidatePaths) {
          try {
            const bytes = await fs.readFile(candidatePath);
            const rawBase = path.basename(relAssetPath, '.pdf').replace(/_[0-9a-f]{8}$/i, '');
            const cleanName = `${rawBase || safeFileBase || 'cartilla'}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
            res.send(bytes);
            return;
          } catch {
            // Try next candidate path
          }
        }

        res.status(404).json({ error: 'El archivo PDF original de esta cartilla no se encontró en el servidor.' });
        return;
      }

      const pdfBuffer = generateCartillaPdfBuffer(cartilla);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileBase || 'cartilla'}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'No fue posible generar el PDF.' });
    }
  });

  // Admin Login
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { password } = req.body as { password?: string };
      if (!password || typeof password !== 'string') {
        res.status(400).json({ error: 'Ingrese la contraseña administrativa.' });
        return;
      }
      const store = await readStore();
      if (!verifyAdminPassword(password, store.adminPasswordHash)) {
        res.status(401).json({ error: 'Contraseña incorrecta.' });
        return;
      }
      const token = createAdminToken('comite-directivo');
      res.json({ ok: true, token });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
  });

  app.get('/api/admin/session', requireAdmin, (_req, res) => {
    res.json({ authenticated: true });
  });

  app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
    try {
      const { newPassword } = req.body as { newPassword?: string };
      if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
        res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        return;
      }
      const hashed = hashPassword(newPassword.trim());
      await updateStore((store) => ({
        ...store,
        adminPasswordHash: hashed,
      }));
      res.json({ ok: true });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'No fue posible actualizar la contraseña.' });
    }
  });

  // Admin Overview
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const store = await readStore();
      const pendingCount = store.riskContacts.filter((r) => r.status === 'pendiente').length;
      res.json({
        pendingCount,
        riskContacts: store.riskContacts,
        cartillas: store.cartillas,
        helplines: store.helplines,
        projectInfo: store.projectInfo,
        systemPrompt: store.systemPrompt,
      });
    } catch (error) {
      console.error('Admin overview error:', error);
      res.status(500).json({ error: 'Error al cargar el panel administrativo.' });
    }
  });

  // Update Risk Contact status / notes
  app.patch('/api/admin/risk-contacts/:id', requireAdmin, async (req, res) => {
    try {
      const { status, adminNotes } = req.body as {
        status?: RiskContactStatus;
        adminNotes?: string;
      };
      const allowed: RiskContactStatus[] = ['pendiente', 'revisado', 'gestionado'];
      let updatedRecord: RiskContactRecord | null = null;

      await updateStore((store) => ({
        ...store,
        riskContacts: store.riskContacts.map((item) => {
          if (item.id !== req.params.id) return item;
          updatedRecord = {
            ...item,
            status: status && allowed.includes(status) ? status : item.status,
            adminNotes:
              typeof adminNotes === 'string' ? adminNotes.slice(0, 600) : item.adminNotes,
            updatedAt: new Date().toISOString(),
          };
          return updatedRecord;
        }),
      }));

      if (!updatedRecord) {
        res.status(404).json({ error: 'Registro no encontrado.' });
        return;
      }
      res.json(updatedRecord);
    } catch (error) {
      console.error('Update risk contact error:', error);
      res.status(500).json({ error: 'No fue posible actualizar el registro.' });
    }
  });

  // Delete Risk Contact (Ley 1581 deletion compliance)
  app.delete('/api/admin/risk-contacts/:id', requireAdmin, async (req, res) => {
    try {
      let existed = false;
      await updateStore((store) => {
        const filtered = store.riskContacts.filter((item) => {
          if (item.id === req.params.id) {
            existed = true;
            return false;
          }
          return true;
        });
        return { ...store, riskContacts: filtered };
      });
      if (!existed) {
        res.status(404).json({ error: 'Registro no encontrado.' });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete risk contact error:', error);
      res.status(500).json({ error: 'No fue posible eliminar el registro.' });
    }
  });

  // Export authorized records (CSV or JSON)
  app.get('/api/admin/risk-contacts/export', requireAdmin, async (req, res) => {
    try {
      const store = await readStore();
      const format = req.query.format === 'json' ? 'json' : 'csv';
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="maggie-contactos-autorizados-${new Date().toISOString().slice(0, 10)}.json"`
        );
        res.send(JSON.stringify(store.riskContacts, null, 2));
        return;
      }

      const headers = [
        'ID',
        'Fecha_Registro',
        'Nombre_o_Alias',
        'Telefono',
        'Correo',
        'Canal_Preferido',
        'Consentimiento_Ley1581',
        'Fecha_Consentimiento',
        'Motivo_General',
        'Categoria_Riesgo',
        'Estado_Seguimiento',
        'Notas_Comite',
      ];
      const csvEscape = (v: unknown) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return `"${s}"`;
      };
      const rows = store.riskContacts.map((r) =>
        [
          r.id,
          r.createdAt,
          r.nameOrAlias,
          r.phone,
          r.email,
          r.preferredChannel,
          r.consentGiven ? 'SI' : 'NO',
          r.consentTimestamp,
          r.reasonSummary,
          r.riskCategory,
          r.status,
          r.adminNotes,
        ]
          .map(csvEscape)
          .join(',')
      );
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="maggie-contactos-autorizados-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csvContent);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Error al exportar registros.' });
    }
  });

  // Admin: Add new Cartilla (supports optional uploaded PDF base64)
  app.post('/api/admin/cartillas', requireAdmin, async (req, res) => {
    try {
      const {
        title,
        category,
        shortDescription,
        authorOrInstitution,
        year,
        isDemonstrative,
        coverTone,
        bodyText,
        pdfBase64,
      } = req.body as {
        title?: string;
        category?: CartillaCategory;
        shortDescription?: string;
        authorOrInstitution?: string;
        year?: string;
        isDemonstrative?: boolean;
        coverTone?: CartillaItem['coverTone'];
        bodyText?: string;
        pdfBase64?: string;
      };

      if (!title?.trim() || !category || !shortDescription?.trim()) {
        res.status(400).json({
          error: 'Título, categoría y descripción breve son obligatorios.',
        });
        return;
      }

      const id = `cart-${crypto.randomUUID().slice(0, 8)}`;
      let uploadedFileName: string | undefined;

      if (pdfBase64 && typeof pdfBase64 === 'string') {
        const cleanB64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(cleanB64, 'base64');
        if (buffer.byteLength > 8 * 1024 * 1024) {
          res.status(400).json({ error: 'El archivo PDF supera el límite de 8 MB.' });
          return;
        }
        if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
          res.status(400).json({ error: 'El archivo cargado no corresponde a un PDF válido.' });
          return;
        }
        uploadedFileName = `${id}.pdf`;
        await fs.mkdir(getUploadsDir(), { recursive: true });
        await fs.writeFile(path.join(getUploadsDir(), uploadedFileName), buffer);
      }

      const newCartilla: CartillaItem = {
        id,
        title: title.trim().slice(0, 160),
        category,
        shortDescription: shortDescription.trim().slice(0, 320),
        sourceLabel: uploadedFileName
          ? 'Documento PDF cargado por el equipo directivo'
          : isDemonstrative
            ? 'Guía demostrativa Maggie Sex Ed'
            : 'Material psicoeducativo aprobado',
        authorOrInstitution: authorOrInstitution?.trim() || 'Comité Maggie Sex Ed',
        year: year?.trim() || String(new Date().getFullYear()),
        isDemonstrative: Boolean(isDemonstrative),
        coverTone: coverTone || 'plum',
        uploadedFileName,
        pdfUrl: uploadedFileName ? `/uploads/${uploadedFileName}` : undefined,
        readingMinutes: 5,
        createdAt: new Date().toISOString(),
        sections: [
          {
            heading: 'Contenido educativo',
            body:
              bodyText?.trim() ||
              shortDescription.trim(),
          },
        ],
      };

      await updateStore((store) => ({
        ...store,
        cartillas: [newCartilla, ...store.cartillas],
      }));

      res.status(201).json(newCartilla);
    } catch (error) {
      console.error('Create cartilla error:', error);
      res.status(500).json({ error: 'No fue posible guardar la cartilla.' });
    }
  });

  app.delete('/api/admin/cartillas/:id', requireAdmin, async (req, res) => {
    try {
      let deletedItem: CartillaItem | undefined;
      await updateStore((store) => {
        deletedItem = store.cartillas.find((c) => c.id === req.params.id);
        return {
          ...store,
          cartillas: store.cartillas.filter((c) => c.id !== req.params.id),
        };
      });
      if (!deletedItem) {
        res.status(404).json({ error: 'Cartilla no encontrada.' });
        return;
      }
      if (deletedItem.uploadedFileName) {
        const uploadedPath = path.join(getUploadsDir(), path.basename(deletedItem.uploadedFileName));
        await fs.unlink(uploadedPath).catch(() => undefined);
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete cartilla error:', error);
      res.status(500).json({ error: 'No fue posible eliminar la cartilla.' });
    }
  });

  // Admin: Helplines CRUD
  app.post('/api/admin/helplines', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Partial<HelplineItem>;
      if (!body.name?.trim() || !body.city?.trim() || !body.phone?.trim() || !body.hours?.trim()) {
        res.status(400).json({ error: 'Nombre, ciudad, teléfono y horario son obligatorios.' });
        return;
      }
      const item: HelplineItem = {
        id: `hl-${crypto.randomUUID().slice(0, 8)}`,
        name: body.name.trim(),
        city: body.city.trim(),
        department: body.department?.trim() || body.city.trim(),
        coverage: body.coverage?.trim() || body.city.trim(),
        phone: body.phone.trim(),
        whatsapp: body.whatsapp?.trim() || undefined,
        email: body.email?.trim() || undefined,
        hours: body.hours.trim(),
        supportType: body.supportType?.trim() || 'Orientación psicológica',
        notes: body.notes?.trim() || undefined,
        isEmergency: Boolean(body.isEmergency),
      };
      await updateStore((store) => ({
        ...store,
        helplines: [...store.helplines, item],
      }));
      res.status(201).json(item);
    } catch (error) {
      console.error('Create helpline error:', error);
      res.status(500).json({ error: 'No fue posible crear la línea de atención.' });
    }
  });

  app.put('/api/admin/helplines/:id', requireAdmin, async (req, res) => {
    try {
      const body = req.body as Partial<HelplineItem>;
      let updated: HelplineItem | null = null;
      await updateStore((store) => ({
        ...store,
        helplines: store.helplines.map((h) => {
          if (h.id !== req.params.id) return h;
          updated = {
            ...h,
            name: body.name?.trim() || h.name,
            city: body.city?.trim() || h.city,
            department: body.department?.trim() || h.department,
            coverage: body.coverage?.trim() || h.coverage,
            phone: body.phone?.trim() || h.phone,
            whatsapp: body.whatsapp !== undefined ? body.whatsapp.trim() || undefined : h.whatsapp,
            email: body.email !== undefined ? body.email.trim() || undefined : h.email,
            hours: body.hours?.trim() || h.hours,
            supportType: body.supportType?.trim() || h.supportType,
            notes: body.notes !== undefined ? body.notes.trim() || undefined : h.notes,
          };
          return updated;
        }),
      }));
      if (!updated) {
        res.status(404).json({ error: 'Línea no encontrada.' });
        return;
      }
      res.json(updated);
    } catch (error) {
      console.error('Update helpline error:', error);
      res.status(500).json({ error: 'No fue posible actualizar la línea.' });
    }
  });

  app.delete('/api/admin/helplines/:id', requireAdmin, async (req, res) => {
    try {
      let existed = false;
      await updateStore((store) => {
        const filtered = store.helplines.filter((h) => {
          if (h.id === req.params.id) {
            existed = true;
            return false;
          }
          return true;
        });
        return { ...store, helplines: filtered };
      });
      if (!existed) {
        res.status(404).json({ error: 'Línea no encontrada.' });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete helpline error:', error);
      res.status(500).json({ error: 'No fue posible eliminar la línea.' });
    }
  });

  // Admin: Update modular prompt & project info
  app.put('/api/admin/config', requireAdmin, async (req, res) => {
    try {
      const { systemPrompt, projectInfo, resetPrompt } = req.body as {
        systemPrompt?: string;
        projectInfo?: ProjectInfo;
        resetPrompt?: boolean;
      };

      if (!resetPrompt && typeof systemPrompt === 'string' && systemPrompt.trim().length <= 40) {
        res.status(400).json({
          error: 'El prompt del sistema debe tener más de 40 caracteres.',
        });
        return;
      }

      const nextStore = await updateStore((store) => ({
        ...store,
        systemPrompt: resetPrompt
          ? DEFAULT_MAGGIE_SYSTEM_PROMPT
          : typeof systemPrompt === 'string'
            ? systemPrompt.trim()
            : store.systemPrompt,
        projectInfo: projectInfo ? projectInfo : store.projectInfo,
      }));

      res.json({
        projectInfo: nextStore.projectInfo,
        systemPrompt: nextStore.systemPrompt,
      });
    } catch (error) {
      console.error('Config update error:', error);
      res.status(500).json({ error: 'No fue posible guardar la configuración.' });
    }
  });

  // Serve uploaded PDFs cleanly
  app.use('/uploads', express.static(getUploadsDir()));

  // Return JSON 404 for unknown API endpoints instead of falling through to SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Ruta API no encontrada.' });
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maggie Sex Ed server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
