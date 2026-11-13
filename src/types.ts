export type CartillaCategory =
  | 'Sexualidad y envejecimiento'
  | 'Mitos y realidades'
  | 'Autoestima e imagen corporal'
  | 'Deseo sexual y cambios físicos'
  | 'Intimidad, pareja y afectividad'
  | 'Menopausia y andropausia'
  | 'Derechos sexuales'
  | 'Diversidad sexual y de género'
  | 'Placer y bienestar sexual'
  | 'Consentimiento y relaciones saludables';

export const CARTILLA_CATEGORIES: CartillaCategory[] = [
  'Sexualidad y envejecimiento',
  'Mitos y realidades',
  'Autoestima e imagen corporal',
  'Deseo sexual y cambios físicos',
  'Intimidad, pareja y afectividad',
  'Menopausia y andropausia',
  'Derechos sexuales',
  'Diversidad sexual y de género',
  'Placer y bienestar sexual',
  'Consentimiento y relaciones saludables',
];

export interface CartillaSection {
  heading: string;
  body: string;
}

export interface CartillaItem {
  id: string;
  title: string;
  category: CartillaCategory;
  shortDescription: string;
  sourceLabel: string;
  authorOrInstitution: string;
  year: string;
  isDemonstrative: boolean;
  coverTone: 'plum' | 'teal' | 'coral' | 'gold' | 'sky';
  pdfUrl?: string;
  uploadedFileName?: string;
  readingMinutes: number;
  sections: CartillaSection[];
  createdAt: string;
}

export interface HelplineItem {
  id: string;
  name: string;
  city: string;
  department: string;
  coverage: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  hours: string;
  supportType: string;
  notes?: string;
  isEmergency?: boolean;
}

export type RiskContactStatus = 'pendiente' | 'revisado' | 'gestionado';
export type PreferredContactChannel = 'telefono' | 'whatsapp' | 'correo';

export interface RiskContactRecord {
  id: string;
  createdAt: string;
  nameOrAlias: string;
  phone: string;
  email: string;
  preferredChannel: PreferredContactChannel;
  consentGiven: boolean;
  consentTimestamp: string;
  reasonSummary: string;
  riskCategory: string;
  status: RiskContactStatus;
  adminNotes: string;
  updatedAt: string;
}

export interface TeamDirector {
  role: string;
  name: string;
  focus: string;
}

export interface ProjectInfo {
  projectName: string;
  tagline: string;
  institution: string;
  institutionPlaceholderNote: string;
  purpose: string;
  contactEmail: string;
  contactPhone: string;
  cityCountry: string;
  directors: TeamDirector[];
  objectives: string[];
  dataControllerName: string;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  riskDetected?: boolean;
  riskCategory?: string;
  riskSeverity?: string;
  offTopic?: boolean;
  recommendedThemes?: string[];
}

export interface ChatApiResponse {
  reply: string;
  riskDetected: boolean;
  riskCategory: 'ninguno' | 'ideacion_suicida' | 'autolesion' | 'desesperanza_extrema' | 'violencia_o_abuso' | 'peligro_inmediato';
  riskSeverity: 'ninguno' | 'moderado' | 'alto_inmediato';
  offTopic: boolean;
  recommendedThemes: string[];
}

export interface PublicDataPayload {
  cartillas: CartillaItem[];
  helplines: HelplineItem[];
  projectInfo: ProjectInfo;
}

export interface AdminOverviewPayload {
  pendingCount: number;
  riskContacts: RiskContactRecord[];
  cartillas: CartillaItem[];
  helplines: HelplineItem[];
  projectInfo: ProjectInfo;
  systemPrompt: string;
}
