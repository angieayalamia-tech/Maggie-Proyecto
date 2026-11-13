import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  CartillaItem,
  HelplineItem,
  ProjectInfo,
  RiskContactRecord,
} from '../src/types.ts';
import { DEFAULT_MAGGIE_SYSTEM_PROMPT } from './maggiePrompt.ts';

export interface PersistentStore {
  cartillas: CartillaItem[];
  helplines: HelplineItem[];
  riskContacts: RiskContactRecord[];
  projectInfo: ProjectInfo;
  systemPrompt: string;
  adminPasswordHash?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const SEED_HELPLINES: HelplineItem[] = [
  {
    id: 'hl-123',
    name: 'Línea Única de Emergencias Nacional (123)',
    city: 'Cobertura nacional',
    department: 'Todo el país (Colombia)',
    coverage: 'Nacional',
    phone: '123',
    hours: '24 horas, todos los días del año',
    supportType: 'Emergencias médicas, urgencias psiquiátricas y peligro inmediato para la vida',
    notes: 'Servicio público nacional gratuito. Úsese ante riesgo inminente.',
    isEmergency: true,
  },
  {
    id: 'hl-192',
    name: 'Línea 192 – Opción 4 (Ministerio de Salud)',
    city: 'Cobertura nacional',
    department: 'Todo el país (Colombia)',
    coverage: 'Nacional',
    phone: '192',
    hours: '24 horas, todos los días',
    supportType: 'Teleorientación en salud mental, escucha y primeros auxilios psicológicos',
    notes: 'Marcar 192 y elegir la opción 4 desde fijo o celular sin costo.',
  },
  {
    id: 'hl-155',
    name: 'Línea 155 – Orientación a Mujeres Víctimas de Violencia',
    city: 'Cobertura nacional',
    department: 'Todo el país (Colombia)',
    coverage: 'Nacional',
    phone: '155',
    hours: '24 horas, todos los días del año',
    supportType: 'Orientación psicosocial, jurídica y rutas de protección ante violencia basada en género',
    notes: 'Línea gratuita operada por la Consejería Presidencial para la Equidad de la Mujer.',
  },
  {
    id: 'hl-bog-106',
    name: 'Línea 106 – "El poder de ser escuchado"',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    coverage: 'Distrital (Bogotá D.C.)',
    phone: '106',
    whatsapp: '300 754 8933',
    email: 'linea106@saludcapital.gov.co',
    hours: '24 horas, los 7 días de la semana',
    supportType: 'Escucha activa, contención emocional, primeros auxilios psicológicos e intervención en crisis',
    notes: 'Operada por la Secretaría Distrital de Salud de Bogotá.',
  },
  {
    id: 'hl-bog-purpura',
    name: 'Línea Púrpura Distrital',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    coverage: 'Distrital / Referencia nacional',
    phone: '01 8000 112 137',
    whatsapp: '300 755 1846',
    hours: '24 horas, todos los días',
    supportType: 'Escucha psicológica y orientación sociojurídica para mujeres mayores de 18 años',
    notes: 'Operada por la Secretaría Distrital de la Mujer.',
  },
  {
    id: 'hl-bog-calma',
    name: 'Línea Calma',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    coverage: 'Distrital (Bogotá D.C.)',
    phone: '01 8000 423 614',
    hours: 'Lunes a viernes 8:00 a.m. – 10:30 p.m.; sábados y domingos 2:00 p.m. – 10:30 p.m.',
    supportType: 'Escucha y orientación emocional gratuita dirigida a hombres mayores de 18 años',
    notes: 'También accesible marcando 195 (opción 5) en Bogotá.',
  },
  {
    id: 'hl-med-106',
    name: 'Línea Amiga Saludable / Línea 106',
    city: 'Medellín',
    department: 'Antioquia',
    coverage: 'Municipal y Departamental (Antioquia)',
    phone: '106',
    whatsapp: '300 723 1123',
    hours: '24 horas, los 7 días de la semana',
    supportType: 'Teleorientación en salud mental, prevención del suicidio y primeros auxilios psicológicos',
    notes: 'Teléfono alterno en Medellín: (604) 444 44 48. En Antioquia también articula "Salud para el Alma".',
  },
  {
    id: 'hl-cali-106',
    name: 'Línea 106 – Teleorientación en Salud Mental',
    city: 'Cali',
    department: 'Valle del Cauca',
    coverage: 'Municipal (Santiago de Cali)',
    phone: '106',
    hours: '24 horas, los 7 días de la semana',
    supportType: 'Atención psicológica inicial, contención en crisis y orientación en salud mental',
    notes: 'Operada por la Secretaría de Salud Pública Distrital de Cali.',
  },
  {
    id: 'hl-baq-vida',
    name: 'Línea de la Vida y Salud Mental del Atlántico',
    city: 'Barranquilla',
    department: 'Atlántico',
    coverage: 'Distrital (Barranquilla) y Departamental (Atlántico)',
    phone: '(605) 339 9999',
    hours: '24 horas, los 7 días de la semana',
    supportType: 'Atención en crisis emocionales, apoyo psicológico y orientación en salud mental',
    notes: 'Línea celular Barranquilla: 315 300 2003. Gobernación del Atlántico: 317 621 8394.',
  },
  {
    id: 'hl-buc-hablemos',
    name: 'Línea ¡Hablemos! – Primeros Auxilios Psicológicos',
    city: 'Bucaramanga',
    department: 'Santander',
    coverage: 'Departamental (87 municipios de Santander)',
    phone: '300 916 5070',
    hours: '24 horas, los 7 días de la semana',
    supportType: 'Primeros auxilios psicológicos y orientación ante crisis emocionales',
    notes: 'Urgencias psiquiátricas locales Hospital San Camilo: (607) 697 8111 / 314 482 5847.',
  },
];

const SEED_CARTILLAS: CartillaItem[] = [
  // 11 Maggie Sex Ed psychoeducational PDF cartillas supplied in /public/assets/aistudio/
  {
    id: 'cartilla-abrazos-afecto-deseo',
    title: 'Abrazos, afecto y deseo: el cariño y la sexualidad también cuentan en la vejez',
    category: 'Intimidad, pareja y afectividad',
    shortDescription:
      'Basada en conversaciones con 29 personas mayores de Guano (Ecuador) sobre cómo los abrazos, el afecto y la pareja brindan tranquilidad y bienestar.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Morales Gavilanes, D. A. (2016) — Universidad Nacional de Chimborazo',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/Abrazos_afecto_y_deseo_7b9dd74b.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-11T10:00:00.000Z',
    sections: [
      {
        heading: '¿De qué trata esta cartilla?',
        body: 'Retoma el estudio realizado con 29 personas adultas mayores (10 hombres y 19 mujeres) en Guano, Ecuador, donde 28 de 29 expresaron encontrar tranquilidad en el afecto y los abrazos, 29 de 29 valoraron actividades recreativas y 23 de 29 sintieron respaldo de su pareja.',
      },
      {
        heading: 'Cinco ideas clave para vivir el afecto',
        body: '1) La sexualidad se transforma con los años, no desaparece.\n2) El cariño y los abrazos son salud emocional y física.\n3) Cuando falta el contacto afectivo es frecuente sentir tristeza o frustración.\n4) Aunque el cuerpo responda más despacio, se puede seguir disfrutando.\n5) Sentirse acompañado y escuchado protege el ánimo.',
      },
      {
        heading: 'Consejos diarios y realidades frente a los mitos',
        body: 'Pedir un abrazo o expresar cariño abiertamente, compartir momentos tranquilos en pareja o en comunidad, consultar al médico si alguna molestia o medicamento afecta la intimidad y recordar que el deseo y el amor no tienen fecha de vencimiento.',
      },
    ],
  },
  {
    id: 'cartilla-placer-sin-vencimiento',
    title: 'El placer no tiene fecha de vencimiento',
    category: 'Placer y bienestar sexual',
    shortDescription:
      'Guía cercana sobre sexualidad, cuerpo y afecto en la madurez y la vejez, ampliando el placer más allá de la penetración.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Adaptada de Fundación Triángulo y Diputación Provincial de Valladolid (2021)',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'teal',
    pdfUrl: '/assets/aistudio/Cartilla_Psicoeducativa_Maggie_Sex_Ed_-_El_Placer_No_Tiene_Fecha_de_Vencimiento_d31f396a.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-10T10:00:00.000Z',
    sections: [
      {
        heading: 'El placer acompaña toda la vida',
        body: 'La Organización Mundial de la Salud reconoce la sexualidad como parte integral de la salud y el bienestar en todas las edades. Con el paso del tiempo el deseo no desaparece: cambia de ritmo y se enriquece con el afecto, la calma y el autoconocimiento.',
      },
      {
        heading: 'Más allá de la penetración',
        body: 'Los besos, las caricias, los masajes, el contacto piel con piel y la conversación íntima son formas plenas de sexualidad. Usar lubricantes a base de agua, tomarse tiempo sin prisas, conversar con la pareja y consultar al equipo médico sobre medicamentos favorece el disfrute cómodo y seguro.',
      },
      {
        heading: 'Mitos frecuentes frente a la realidad',
        body: 'Sentir deseo después de los 60 años no es inadecuado ni imposible; la sexualidad es un derecho humano y cada persona decide cómo vivirla, con o sin pareja.',
      },
    ],
  },
  {
    id: 'cartilla-fenomenologia-deseo-madurez',
    title: 'El cuerpo vivido, el deseo y la evidencia en la madurez',
    category: 'Sexualidad y envejecimiento',
    shortDescription:
      'Lo que la investigación fenomenológica enseña sobre el deseo erótico, la historia corporal, el cuidado en pareja y la madurez.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Adaptada de García González & Ventura Miranda (Eds., 2021) — Editorial Universidad de Almería',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'coral',
    pdfUrl: '/assets/aistudio/Cartilla_Psicoeducativa_Maggie_Sex_Ed_-_Fenomenologia_y_Deseo_en_la_Madurez_0be84970.pdf',
    readingMinutes: 7,
    createdAt: '2026-03-09T10:00:00.000Z',
    sections: [
      {
        heading: 'El cuerpo vivido y la historia personal',
        body: 'Desde una mirada fenomenológica, el cuerpo en la madurez guarda memoria, afectos y aprendizajes. Entre los 65 y 80 años, el deseo erótico suele transformarse hacia una mayor complicidad, ternura y conocimiento mutuo.',
      },
      {
        heading: 'Cuidado, salud y situaciones especiales',
        body: 'Sanar tabúes heredados, acompañar el afecto mediante el tacto y la cercanía incluso ante procesos como el deterioro cognitivo o la viudez, y evitar la desexualización en los servicios de salud forman parte de una atención digna.',
      },
      {
        heading: 'Educación sexual a lo largo de la vida',
        body: 'Nunca es tarde para aprender sobre el propio cuerpo, expresar necesidades afectivas y recibir orientación respetuosa libre de edadismo.',
      },
    ],
  },
  {
    id: 'cartilla-derechos-cuerpo-placer',
    title: 'Nuestros derechos, nuestro cuerpo, nuestro placer',
    category: 'Derechos sexuales',
    shortDescription:
      'Educación Sexual Integral para vivir una vejez libre, cuidada y sin prejuicios, incluyendo prevención de infecciones y límites saludables.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Adaptada de Guía de ESI para personas mayores (INSSJP - PAMI)',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'gold',
    pdfUrl: '/assets/aistudio/Cartilla_Psicoeducativa_Maggie_Sex_Ed_-_Nuestros_Derechos__Nuestro_Cuerpo__Nuestro_Placer_592b0658.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-08T10:00:00.000Z',
    sections: [
      {
        heading: 'Cuatro pilares de la Educación Sexual Integral en mayores',
        body: '1) Un cuerpo que cambia con sabiduría y merece cuidado.\n2) El placer más allá del coito.\n3) Diversidad en las formas de amar, desear e identificarse.\n4) Consentimiento claro, límites respetados y una vida libre de violencias.',
      },
      {
        heading: 'Salud sexual práctica y prevención',
        body: 'El uso de preservativos o barreras de látex sigue siendo importante a cualquier edad para prevenir infecciones de transmisión sexual. Los lubricantes a base de agua, la higiene suave y los controles médicos periódicos protegen el bienestar.',
      },
      {
        heading: 'Superar los mitos edadistas',
        body: 'La intimidad, el respeto a la privacidad y la autonomía para decidir sobre el propio cuerpo son derechos vigentes en el hogar, en pareja o en residencias.',
      },
    ],
  },
  {
    id: 'cartilla-redisenando-vida-sexual',
    title: 'Rediseñando el curso de nuestra vida sexual',
    category: 'Mitos y realidades',
    shortDescription:
      'Autonomía, bienestar y libertad afectiva a lo largo de los años para desmontar el mito de la vejez asexuada.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Adaptada de Mauro Brigeiro — Universidad Nacional de Colombia',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'sky',
    pdfUrl: '/assets/aistudio/Cartilla_Psicoeducativa_Maggie_Sex_Ed_-_Redisenando_el_Curso_de_Nuestra_Vida_Sexual_fa5c0aa5.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-07T10:00:00.000Z',
    sections: [
      {
        heading: 'Desmontar el mito de la vejez asexuada',
        body: 'Durante décadas se asoció el envejecimiento con la pérdida total del deseo. Hoy sabemos que el erotismo no tiene edad límite y que cada persona puede vivirlo de manera libre, sin prohibiciones ni presiones.',
      },
      {
        heading: 'Sensibilidad en todo el cuerpo y autonomía',
        body: 'Rediseñar la vida sexual implica dejar atrás exigencias de rendimiento juvenil, reconocer que la sensibilidad habita en todo el cuerpo y priorizar la comunicación honesta, la comodidad y la salud integral.',
      },
    ],
  },
  {
    id: 'cartilla-mientras-haya-vida',
    title: 'Mientras haya vida, hay todo: lo que cuentan las propias personas mayores',
    category: 'Deseo sexual y cambios físicos',
    shortDescription:
      'Experiencias reales de personas mayores de 60 años sobre afecto, autoestima corporal, cambios en el deseo y diálogo con su médico.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Ghidara E. et al. (2019) — Evidencia, Actualización en la Práctica Ambulatoria',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/Cartilla_1_Mientras_haya_vida_hay_todo_2672eeb1.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-06T10:00:00.000Z',
    sections: [
      {
        heading: 'Voces reales después de los 60 años',
        body: 'A partir de entrevistas con 13 personas mayores de 60 años en Tucumán y encuestas poblacionales donde 8 de cada 10 personas de 60 a 74 años mantienen vida sexual activa y 6 de cada 10 creen posible volver a enamorarse.',
      },
      {
        heading: 'Cinco aprendizajes de los participantes',
        body: '1) "Yo me amo": la autoestima y el cuidado del propio cuerpo son la base.\n2) La sexualidad va más allá de la genitalidad.\n3) El peso emocional del vínculo crece con la madurez.\n4) La historia personal influye en cómo se vive hoy el deseo.\n5) Hablar sin vergüenza en consulta médica abre soluciones seguras.',
      },
    ],
  },
  {
    id: 'cartilla-sexualidad-en-la-vejez-npunto',
    title: 'La sexualidad en la vejez: qué cambia, qué sigue igual y cómo cuidarte',
    category: 'Menopausia y andropausia',
    shortDescription:
      'Guía práctica sobre cambios físicos en hombres y mujeres tras la menopausia y en la madurez, autocuidado y diálogo médico sin pena.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en García Lozano R. (2024) — Revista NPunto, Vol. VII, n.º 74',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'teal',
    pdfUrl: '/assets/aistudio/Cartilla_2_La_sexualidad_en_la_vejez_6fc66e5c.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-05T10:00:00.000Z',
    sections: [
      {
        heading: 'Qué cambia en el cuerpo con los años',
        body: 'En los hombres, la erección puede tardar más y ser menos firme, con mayor tiempo de recuperación entre encuentros. En las mujeres, tras la menopausia suele presentarse menor lubricación y sequedad vaginal, mientras se conserva la capacidad de sentir placer y orgasmo.',
      },
      {
        heading: 'Qué ayuda en el cuidado cotidiano',
        body: 'Actividad física aeróbica regular, alimentación equilibrada, uso de hidratantes y lubricantes vaginales para aliviar molestias, conversación abierta en pareja y consulta médica previa antes de tomar fármacos (especialmente por interacciones con medicinas del corazón).',
      },
      {
        heading: 'Hablemos sin pena en consulta',
        body: 'Aunque 78 de cada 100 personas mayores no habían hablado de problemas sexuales con su médico, 82 de cada 100 habrían preferido que el profesional abriera la conversación. Preguntar es cuidar tu salud.',
      },
    ],
  },
  {
    id: 'cartilla-sexualidad-despues-60-medellin',
    title: 'La sexualidad después de los 60 (estudio en Medellín)',
    category: 'Sexualidad y envejecimiento',
    shortDescription:
      'Resultados de un estudio con 665 personas mayores en Medellín sobre ánimo, acompañamiento social, conversación en familia y derechos.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Robledo-Marín C., Cardona-Arango D. et al. (2020) — Medellín, Colombia',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'coral',
    pdfUrl: '/assets/aistudio/Cartilla_3_La_sexualidad_despues_de_los_60_dbeee128.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-04T10:00:00.000Z',
    sections: [
      {
        heading: 'Lo que mostró el estudio en Medellín (665 participantes)',
        body: 'Casi 7 de cada 10 personas que no se sentían tristes consideraron importante la sexualidad. El apoyo social, no sentirse en soledad, haber conversado del tema con hijos o nietos y contar con mayor información se asociaron con una valoración más positiva.',
      },
      {
        heading: 'Un reto extra para las mujeres y tu derecho',
        body: 'El estudio señala diferencias culturales que suelen exigir o juzgar más a las mujeres mayores. En Colombia, la sexualidad y el respeto a la intimidad hacen parte de los derechos de las personas mayores, y en encuestas locales 88 de cada 100 participantes reconocen que el amor y las nuevas relaciones también pertenecen a la vejez.',
      },
    ],
  },
  {
    id: 'cartilla-habla-salud-sexual-icsm',
    title: 'Habla de tu salud sexual: guía basada en recomendaciones internacionales',
    category: 'Consentimiento y relaciones saludables',
    shortDescription:
      'Guía sencilla basada en el consenso ICSM 2024 con hábitos saludables, prevención de infecciones y preguntas para llevar a tu cita médica.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Luria M. et al. (2026) — ICSM 2024, Sexual Medicine Reviews',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'gold',
    pdfUrl: '/assets/aistudio/Habla_de_tu_salud_sexual__1__3e92df47.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-03T10:00:00.000Z',
    sections: [
      {
        heading: 'Cada persona es distinta y tu salud sexual merece atención',
        body: 'Especialistas de varios países revisaron la evidencia a partir de los 65 años: si bajar el ritmo o no tener actividad sexual no te incomoda, también está bien; si algo te preocupa o duele, casi siempre tiene causa y opciones de alivio.',
      },
      {
        heading: 'Tips prácticos y preguntas para llevar a tu cita',
        body: 'Dormir bien, moverse al menos una vez por semana, reducir alcohol y cigarrillo, revisar si tus medicamentos influyen (sin suspenderlos por tu cuenta), usar condón y preguntar por pruebas de infecciones. Puedes llevar a tu cita preguntas como: ¿mis medicamentos afectan mi vida íntima? o ¿qué opciones hay para la sequedad o la erección?',
      },
    ],
  },
  {
    id: 'cartilla-mi-cuerpo-mi-historia-mi-placer',
    title: 'Mi cuerpo, mi historia, mi placer',
    category: 'Autoestima e imagen corporal',
    shortDescription:
      'Cómo mirar con cariño el cuerpo que envejece, redefinir el placer sin comparaciones juveniles y respetar el propio ritmo.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Schaller S. L., Kvalem I. L. & Træen B. (2023) — Sexuality & Culture',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'sky',
    pdfUrl: '/assets/aistudio/Mi_cuerpo_mi_historia_mi_placer_e62076a4.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-02T10:00:00.000Z',
    sections: [
      {
        heading: 'Lo que importa es lo que tu cuerpo te permite sentir',
        body: 'A partir de entrevistas con 32 personas de entre 65 y 85 años, muchas destacaron que la apariencia juvenil importa menos que lo que el cuerpo permite hacer, caminar, bailar, abrazar y compartir.',
      },
      {
        heading: 'Tips prácticos para cuidar tu imagen corporal',
        body: 'Hablarte con cariño como a una buena amiga, moverte de forma suave, compararte menos con revistas o publicidad, ampliar el placer hacia la cercanía y los besos, conversar con tu pareja e ir siempre a tu propio ritmo.',
      },
    ],
  },
  {
    id: 'cartilla-sexualidad-vejez-holistica',
    title: 'Sexualidad en la vejez: cuerpo, mente, familia y sociedad',
    category: 'Diversidad sexual y de género',
    shortDescription:
      'Síntesis de 62 estudios realizada en Medellín sobre prejuicios sociales, duelo, fe, prevención de contagios y Ley 1251 de 2008 en Colombia.',
    sourceLabel: 'Cartilla psicoeducativa Maggie Sex Ed (PDF)',
    authorOrInstitution: 'Basada en Fernández Correa D. (2016) — UNAC, Medellín, Colombia',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/Sexualidad_en_la_vejez_c48d1427.pdf',
    readingMinutes: 6,
    createdAt: '2026-03-01T10:00:00.000Z',
    sections: [
      {
        heading: 'Lo que más pesa son los prejuicios sociales',
        body: 'Esta revisión de 62 estudios hecha en Medellín concluye que, más que los cambios físicos del envejecimiento, lo que más limita la sexualidad son los prejuicios heredados, la vergüenza y la idea falsa de que las personas mayores no sienten.',
      },
      {
        heading: 'Duelo, fe, prevención y derechos en Colombia',
        body: 'Enviudar duele y se respeta el duelo, pero amar otra vez sigue siendo un derecho; la fe y el afecto pueden convivir sin culpa; el condón previene infecciones también en personas mayores; pedir privacidad en casa o residencias es válido; y en Colombia la Ley 1251 de 2008 protege el respeto y buen trato en salud sea cual sea tu orientación.',
      },
    ],
  },
  // 12 REAL verified PDF documents supplied in /public/assets/aistudio/
  {
    id: 'ref-pami-esi',
    title: 'Guía de Educación Sexual Integral para personas mayores',
    category: 'Derechos sexuales',
    shortDescription:
      'Documento institucional de PAMI sobre derechos sexuales, placer, prevención, vínculos y derribo de mitos en la vejez.',
    sourceLabel: 'Documento institucional verificado (PDF real)',
    authorOrInstitution: 'PAMI (Instituto Nacional de Servicios Sociales para Jubilados y Pensionados)',
    year: '2022',
    isDemonstrative: false,
    coverTone: 'teal',
    pdfUrl: '/assets/aistudio/GUIA-ESI-para-PM_49781994.pdf',
    readingMinutes: 15,
    createdAt: '2026-01-10T10:00:00.000Z',
    sections: [
      {
        heading: 'Descripción del documento real',
        body: 'Esta guía oficial aborda la Educación Sexual Integral en personas mayores desde una perspectiva de derechos humanos, diversidad, cuidados y prevención.',
      },
    ],
  },
  {
    id: 'ref-triangulo-guia',
    title: 'Guía sobre sexualidad en la madurez y en la vejez',
    category: 'Diversidad sexual y de género',
    shortDescription:
      'Guía práctica para comprender cambios biopsicosociales, afectividad, prevención y diversidad sexual en personas mayores.',
    sourceLabel: 'Documento institucional verificado (PDF real)',
    authorOrInstitution: 'Fundación Triángulo / Diputación de Valladolid',
    year: '2021',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/GUIA-SEXUALIDAD-MADUREZ-Y-VEJEZ_115bb3b5.pdf',
    readingMinutes: 18,
    createdAt: '2026-01-10T09:00:00.000Z',
    sections: [
      {
        heading: 'Descripción del documento real',
        body: 'Publicación divulgativa sobre vivencias afectivas y sexuales en la madurez y vejez, incluyendo orientación para entornos familiares, residencias y diversidad LGBTI.',
      },
    ],
  },
  {
    id: 'ref-medellin-percepcion',
    title: 'Percepción de la sexualidad en personas mayores de 60 años (Medellín, Colombia)',
    category: 'Sexualidad y envejecimiento',
    shortDescription:
      'Estudio colombiano en Medellín sobre percepciones, vivencias, afecto y barreras culturales en adultos mayores de 60 años.',
    sourceLabel: 'Artículo científico colombiano verificado (PDF real)',
    authorOrInstitution: 'Robledo Marín, Cardona Arango et al. — Revista Colombiana de Ciencias Sociales',
    year: '2020',
    isDemonstrative: false,
    coverTone: 'coral',
    pdfUrl: '/assets/aistudio/percepcion_de_la_sexualidad_85451d4e.pdf',
    readingMinutes: 14,
    createdAt: '2026-01-09T10:00:00.000Z',
    sections: [
      {
        heading: 'Hallazgos en contexto colombiano',
        body: 'Investigación realizada en Medellín que examina cómo las personas mayores comprenden su sexualidad más allá de la genitalidad y cómo los estereotipos sociales influyen en su bienestar.',
      },
    ],
  },
  {
    id: 'ref-icsm-2024',
    title: 'Sexuality and sexual health in older adults: ICSM 2024 recommendations',
    category: 'Deseo sexual y cambios físicos',
    shortDescription:
      'Consenso internacional clínico (en inglés) sobre sexualidad, cambios fisiológicos y salud sexual en adultos mayores.',
    sourceLabel: 'Artículo científico indexado verificado (PDF real)',
    authorOrInstitution: 'Luria et al. — Sexual Medicine Reviews (ICSM 2024)',
    year: '2026',
    isDemonstrative: false,
    coverTone: 'sky',
    pdfUrl: '/assets/aistudio/qeaf069_aa1a315c.pdf',
    readingMinutes: 20,
    createdAt: '2026-01-08T10:00:00.000Z',
    sections: [
      {
        heading: 'Resumen científico',
        body: 'Recomendaciones basadas en evidencia de la Quinta Consulta Internacional de Medicina Sexual (ICSM) sobre evaluación respetuosa, factores médicos, medicación y bienestar sexual en personas mayores.',
      },
    ],
  },
  {
    id: 'ref-brigeiro-unal',
    title: 'La gerontología como un saber sobre la sexualidad en el envejecimiento',
    category: 'Mitos y realidades',
    shortDescription:
      'Capítulo académico de la Universidad Nacional de Colombia sobre cómo la gerontología ha estudiado y visibilizado la sexualidad mayor.',
    sourceLabel: 'Capítulo académico verificado (PDF real)',
    authorOrInstitution: 'Mauro Brigeiro — Universidad Nacional de Colombia',
    year: '2011',
    isDemonstrative: false,
    coverTone: 'teal',
    pdfUrl: '/assets/aistudio/03CAPI02_6bda2546.pdf',
    readingMinutes: 16,
    createdAt: '2026-01-07T10:00:00.000Z',
    sections: [
      {
        heading: 'Aporte académico colombiano',
        body: 'Análisis crítico sobre los discursos gerontológicos en torno al envejecimiento activo, los mitos de la vejez asexuada y las experiencias de hombres y mujeres mayores.',
      },
    ],
  },
  {
    id: 'ref-npunto-vision',
    title: 'La sexualidad en las personas mayores. Una visión global',
    category: 'Menopausia y andropausia',
    shortDescription:
      'Revisión clínica y psicosocial sobre menopausia, andropausia, respuesta sexual, enfermedades crónicas y bienestar.',
    sourceLabel: 'Artículo científico verificado (PDF real)',
    authorOrInstitution: 'García Lozano — Revista NPunto',
    year: '2024',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/6659a341b8c53art4_7d2657a7.pdf',
    readingMinutes: 15,
    createdAt: '2026-01-06T10:00:00.000Z',
    sections: [
      {
        heading: 'Contenido principal',
        body: 'Revisión global de los factores biológicos, hormonales y sociales que intervienen en la vivencia sexual durante la madurez y vejez.',
      },
    ],
  },
  {
    id: 'ref-ual-libro',
    title: 'Fenomenologías de la sexualidad en el adulto mayor',
    category: 'Intimidad, pareja y afectividad',
    shortDescription:
      'Libro académico editado por la Universidad de Almería sobre experiencias vividas, pareja, afecto y educación en la vejez.',
    sourceLabel: 'Libro académico verificado (PDF real)',
    authorOrInstitution: 'García González & Ventura Miranda (Eds.) — Universidad de Almería',
    year: '2021',
    isDemonstrative: false,
    coverTone: 'gold',
    pdfUrl: '/assets/aistudio/LibroAdultoMayor-Repositorios_71afea64.pdf',
    readingMinutes: 25,
    createdAt: '2026-01-05T10:00:00.000Z',
    sections: [
      {
        heading: 'Contenido de la obra',
        body: 'Compilación de investigaciones cualitativas sobre cómo las personas mayores viven su cuerpo, el erotismo, la intimidad de pareja y los prejuicios en distintos entornos.',
      },
    ],
  },
  {
    id: 'ref-dialnet-factores',
    title: 'Factores psicológicos y socioculturales en la vida sexual de los adultos mayores',
    category: 'Autoestima e imagen corporal',
    shortDescription:
      'Artículo sobre cómo las actitudes, la autoestima, el entorno familiar y las creencias culturales moldean la vida sexual mayor.',
    sourceLabel: 'Artículo académico verificado (PDF real)',
    authorOrInstitution: 'Can Valle et al. — Dialnet / Ciencias de la Salud',
    year: '2015',
    isDemonstrative: false,
    coverTone: 'coral',
    pdfUrl: '/assets/aistudio/Dialnet-FactoresPsicologicosYSocioculturalesEnLaVidaSexual-5506389_caacd4b5.pdf',
    readingMinutes: 12,
    createdAt: '2026-01-04T10:00:00.000Z',
    sections: [
      {
        heading: 'Resumen',
        body: 'Explora el papel de la autoestima, la comunicación familiar y los mitos socioculturales sobre el bienestar sexual de personas mayores.',
      },
    ],
  },
  {
    id: 'ref-unac-holistica',
    title: 'La sexualidad en el adulto mayor desde una mirada holística',
    category: 'Placer y bienestar sexual',
    shortDescription:
      'Trabajo de grado realizado en Medellín sobre bienestar integral, afectividad y sexualidad en adultos mayores.',
    sourceLabel: 'Tesis académica colombiana verificada (PDF real)',
    authorOrInstitution: 'Fernández Correa — Corporación Universitaria Adventista (UNAC), Medellín',
    year: '2016',
    isDemonstrative: false,
    coverTone: 'sky',
    pdfUrl: '/assets/aistudio/Trabajo_de_grado_b656a58c.pdf',
    readingMinutes: 18,
    createdAt: '2026-01-03T10:00:00.000Z',
    sections: [
      {
        heading: 'Enfoque del trabajo',
        body: 'Estudio desarrollado en Colombia que promueve una comprensión integral de la sexualidad, el afecto y la calidad de vida en la adultez mayor.',
      },
    ],
  },
  {
    id: 'ref-unach-psicoafectivo',
    title: 'Repercusión de la sexualidad en el aspecto psico-afectivo en adultos mayores',
    category: 'Intimidad, pareja y afectividad',
    shortDescription:
      'Investigación académica sobre la relación entre sexualidad, vínculos afectivos y estado emocional en la vejez.',
    sourceLabel: 'Tesis académica verificada (PDF real)',
    authorOrInstitution: 'Morales Gavilanes — Universidad Nacional de Chimborazo',
    year: '2016',
    isDemonstrative: false,
    coverTone: 'teal',
    pdfUrl: '/assets/aistudio/UNACH-FCEHT-TG-P.EDUC-2016-000015_e78665c3.pdf',
    readingMinutes: 15,
    createdAt: '2026-01-02T10:00:00.000Z',
    sections: [
      {
        heading: 'Enfoque del trabajo',
        body: 'Analiza cómo el reconocimiento afectivo y la libertad para conversar sobre sexualidad impactan positivamente el estado de ánimo y la autoestima.',
      },
    ],
  },
  {
    id: 'ref-vvietto',
    title: 'Mientras haya vida, hay todo: una mirada en la sexualidad del adulto mayor',
    category: 'Consentimiento y relaciones saludables',
    shortDescription:
      'Artículo reflexivo en salud familiar sobre acompañamiento respetuoso, escucha clínica y autonomía en adultos mayores.',
    sourceLabel: 'Artículo académico verificado (PDF real)',
    authorOrInstitution: 'Ghidara et al. — Archivos de Medicina Familiar y General',
    year: '2019',
    isDemonstrative: false,
    coverTone: 'plum',
    pdfUrl: '/assets/aistudio/vvietto__1105_118e4451.pdf',
    readingMinutes: 10,
    createdAt: '2026-01-01T10:00:00.000Z',
    sections: [
      {
        heading: 'Resumen',
        body: 'Destaca la importancia de evitar prejuicios profesionales y respetar la autonomía, intimidad y consentimiento de las personas mayores.',
      },
    ],
  },
  {
    id: 'ref-schaller-identities',
    title: 'Constructions of Sexual Identities in the Ageing Body (estudio cualitativo)',
    category: 'Diversidad sexual y de género',
    shortDescription:
      'Artículo de investigación (en inglés) sobre identidad sexual, cuerpo que envejece y experiencias diversas.',
    sourceLabel: 'Artículo científico indexado verificado (PDF real)',
    authorOrInstitution: 'Schaller et al. — Sexuality & Culture',
    year: '2023',
    isDemonstrative: false,
    coverTone: 'gold',
    pdfUrl: '/assets/aistudio/s12119-023-10067-1_46f7162c.pdf',
    readingMinutes: 16,
    createdAt: '2026-01-01T09:00:00.000Z',
    sections: [
      {
        heading: 'Resumen científico',
        body: 'Explora cómo las personas mayores construyen y renegocian su identidad sexual frente a normas culturales sobre la edad y el género.',
      },
    ],
  },
];

const SEED_PROJECT_INFO: ProjectInfo = {
  projectName: 'Maggie Sex Ed',
  tagline: 'Sin pena, a cualquier edad.',
  institution: '[Institución educativa / organización por definir]',
  institutionPlaceholderNote:
    'Espacio editable desde el Panel Administrativo para registrar la institución, logo y datos de contacto oficiales.',
  purpose:
    'Desmitificar la vejez asexuada y ofrecer psicoeducación confiable, accesible y libre de prejuicios sobre sexualidad, imagen corporal, autoestima y bienestar emocional para personas adultas mayores en Colombia, siempre con supervisión humana y sin reemplazar la atención psicológica o médica profesional.',
  contactEmail: 'maggie.cal.do.20@gmail.com',
  contactPhone: '[Teléfono institucional por definir]',
  cityCountry: 'Colombia',
  dataControllerName: 'Comité de las Tres Directoras — Proyecto Maggie Sex Ed',
  directors: [
    {
      role: 'Directora Neuropsicológica',
      name: 'Maria Paula Vesga Correa',
      focus: 'Accesibilidad cognitiva, lenguaje comprensible y cambios biopsicosociales en el envejecimiento.',
    },
    {
      role: 'Directora Sistémica',
      name: 'Gabriela López Correa',
      focus: 'Contenidos psicoeducativos, pareja, familia, viudez y modo acompañado.',
    },
    {
      role: 'Directora Comportamental',
      name: 'Angie Yeraldin Ayala Mosquera',
      focus: 'Protocolos de riesgo psicológico, derivación a líneas de ayuda y seguimiento humano.',
    },
  ],
  objectives: [
    'Brindar información científica clara sobre sexualidad, cambios físicos y afectividad en la adultez mayor.',
    'Combatir mitos, estigmas y silencios alrededor del deseo, el cuerpo y la diversidad sexual en la vejez.',
    'Facilitar un canal de orientación con inteligencia artificial sujeto a límites éticos estrictos y detección prioritaria de riesgo.',
    'Conectar de forma inmediata con líneas oficiales de atención psicológica y emergencias en Colombia.',
  ],
};

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

export async function readStore(): Promise<PersistentStore> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistentStore>;
    const existingCartillas = (
      parsed.cartillas && parsed.cartillas.length > 0 ? parsed.cartillas : SEED_CARTILLAS
    ).filter((item) => !item.id.startsWith('guide-'));
    const existingById = new Map(existingCartillas.map((item) => [item.id, item]));
    const missingSeedPdfCartillas = SEED_CARTILLAS.filter(
      (seedItem) => Boolean(seedItem.pdfUrl) && !existingById.has(seedItem.id)
    );
    const mergedCartillas = [
      ...missingSeedPdfCartillas,
      ...existingCartillas.map((item) => {
        const seedMatch = SEED_CARTILLAS.find((s) => s.id === item.id);
        if (seedMatch?.pdfUrl && !item.pdfUrl) {
          return { ...item, pdfUrl: seedMatch.pdfUrl };
        }
        return item;
      }),
    ];
    return {
      cartillas: mergedCartillas,
      helplines: parsed.helplines && parsed.helplines.length > 0 ? parsed.helplines : SEED_HELPLINES,
      riskContacts: Array.isArray(parsed.riskContacts) ? parsed.riskContacts : [],
      projectInfo: parsed.projectInfo ?? SEED_PROJECT_INFO,
      systemPrompt: parsed.systemPrompt ?? DEFAULT_MAGGIE_SYSTEM_PROMPT,
      adminPasswordHash: parsed.adminPasswordHash,
    };
  } catch {
    const initial: PersistentStore = {
      cartillas: SEED_CARTILLAS,
      helplines: SEED_HELPLINES,
      riskContacts: [],
      projectInfo: SEED_PROJECT_INFO,
      systemPrompt: DEFAULT_MAGGIE_SYSTEM_PROMPT,
    };
    await writeStore(initial);
    return initial;
  }
}

export async function writeStore(store: PersistentStore): Promise<void> {
  await ensureDirs();
  const task = writeQueue.then(async () => {
    const tmp = `${STORE_PATH}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tmp, STORE_PATH);
  });
  writeQueue = task.catch(() => undefined);
  await task;
}

export async function updateStore(
  updater: (current: PersistentStore) => PersistentStore | Promise<PersistentStore>
): Promise<PersistentStore> {
  const current = await readStore();
  const next = await updater(current);
  await writeStore(next);
  return next;
}
