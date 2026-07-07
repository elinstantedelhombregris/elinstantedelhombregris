// scripts/seed-circulos-oficiales.ts
// Seed idempotente de círculos oficiales + catálogo de plantillas de campaña.
// Círculos: upsert por nombre. Plantillas: upsert por slug.
// Correr con: npm run seed:circulos
import { eq } from 'drizzle-orm';
import { db, schema } from './db-neon';
import type { CampaignFormSchema, CampaignType } from '../shared/campaign-forms';

const { circles, campaignTemplates } = schema;

// ── Círculos oficiales ──

interface OfficialCircle {
  name: string;
  description: string;
  kind: 'territorial' | 'tematica';
  province: string | null;
  city: string | null;
  theme: string | null;
}

const OFFICIAL_CIRCLES: OfficialCircle[] = [
  {
    name: '¡BASTA! Nacional',
    description:
      'El círculo madre del movimiento. Acá convergen las señales, campañas y relevamientos de todo el país. Abierto a cualquiera que quiera hacer visible lo que hay que hacer.',
    kind: 'tematica',
    province: null,
    city: null,
    theme: 'nacional',
  },
  {
    name: '¡BASTA! Buenos Aires',
    description:
      'Círculo territorial de la provincia de Buenos Aires. Relevamientos y consultas para hacer visible lo que falta en cada barrio bonaerense.',
    kind: 'territorial',
    province: 'Buenos Aires',
    city: null,
    theme: null,
  },
  {
    name: '¡BASTA! Córdoba',
    description:
      'Círculo territorial de Córdoba. Datos abiertos, campañas y señales de toda la provincia.',
    kind: 'territorial',
    province: 'Córdoba',
    city: null,
    theme: null,
  },
  {
    name: '¡BASTA! Santa Fe',
    description:
      'Círculo territorial de Santa Fe. Lo que hay que hacer, hecho visible — de Rosario a Reconquista.',
    kind: 'territorial',
    province: 'Santa Fe',
    city: null,
    theme: null,
  },
];

// ── Plantillas de campaña ──

interface TemplateSeed {
  slug: string;
  type: CampaignType;
  title: string;
  description: string;
  category: string;
  formSchema: CampaignFormSchema;
  mapColor: string;
  mapIcon: string;
}

const TEMPLATES: TemplateSeed[] = [
  {
    slug: 'luminarias-rotas',
    type: 'relevamiento',
    title: 'Luminarias rotas',
    description:
      'Relevá las luminarias que no funcionan en tu barrio. Cada foto es un punto de luz que falta — y un reclamo con evidencia.',
    category: 'infraestructura',
    mapColor: '#FACC15',
    mapIcon: 'lightbulb',
    formSchema: {
      fields: [
        { key: 'foto', label: 'Sacale una foto a la luminaria', type: 'photo', required: true },
        {
          key: 'gravedad',
          label: '¿Qué tan oscura queda la cuadra de noche?',
          type: 'rating',
          required: true,
          max: 5,
          hint: '1 = molesta, 5 = peligrosa',
        },
        {
          key: 'detalle',
          label: 'Contanos dónde está y qué le pasa',
          type: 'text',
          required: false,
          hint: 'Esquina, altura, si titila o está apagada del todo',
        },
      ],
    },
  },
  {
    slug: 'comedores-comunitarios',
    type: 'relevamiento',
    title: 'Comedores comunitarios',
    description:
      'Mapeá los comedores y merenderos de tu zona: dónde están, a cuánta gente alcanzan y qué les falta.',
    category: 'alimentacion',
    mapColor: '#F97316',
    mapIcon: 'utensils',
    formSchema: {
      fields: [
        { key: 'nombre', label: '¿Cómo se llama el comedor o merendero?', type: 'text', required: true },
        {
          key: 'personas',
          label: '¿A cuántas personas alcanza por semana, más o menos?',
          type: 'number',
          required: true,
        },
        {
          key: 'necesidades',
          label: '¿Qué es lo que más le falta?',
          type: 'text',
          required: false,
          hint: 'Alimentos, gas, manos, utensilios…',
        },
        { key: 'foto', label: 'Una foto del lugar (si te dan permiso)', type: 'photo', required: false },
      ],
    },
  },
  {
    slug: 'precios-canasta',
    type: 'relevamiento',
    title: 'Precios de la canasta',
    description:
      'Relevá cuánto salen los productos básicos en tu barrio. Con los datos de todos armamos el mapa real de precios.',
    category: 'economia',
    mapColor: '#38BDF8',
    mapIcon: 'shopping-cart',
    formSchema: {
      fields: [
        {
          key: 'producto',
          label: '¿Qué producto relevaste?',
          type: 'select',
          required: true,
          options: [
            'Pan (kg)',
            'Leche (litro)',
            'Yerba (500 g)',
            'Aceite (litro)',
            'Arroz (kg)',
            'Fideos (500 g)',
            'Azúcar (kg)',
            'Carne picada (kg)',
          ],
        },
        { key: 'precio', label: '¿Cuánto salió? (en pesos)', type: 'number', required: true },
        {
          key: 'comercio',
          label: '¿Qué tipo de comercio era?',
          type: 'select',
          required: false,
          options: ['Almacén de barrio', 'Supermercado chico', 'Supermercado grande', 'Mayorista', 'Feria'],
        },
      ],
    },
  },
  {
    slug: 'basurales-abiertos',
    type: 'relevamiento',
    title: 'Basurales a cielo abierto',
    description:
      'Marcá los basurales y microbasurales de tu zona. Verlos en el mapa es el primer paso para que dejen de existir.',
    category: 'ambiente',
    mapColor: '#84CC16',
    mapIcon: 'trash',
    formSchema: {
      fields: [
        { key: 'foto', label: 'Sacale una foto al basural', type: 'photo', required: true },
        {
          key: 'tamano',
          label: '¿Qué tan grande es?',
          type: 'rating',
          required: true,
          max: 5,
          hint: '1 = unas bolsas, 5 = un basural entero',
        },
      ],
    },
  },
  {
    slug: 'que-falta-en-tu-barrio',
    type: 'consulta',
    title: '¿Qué falta en tu barrio?',
    description:
      'Una pregunta simple para todo el barrio: ¿qué es lo que más falta acá? Las respuestas de todos dibujan el mapa de lo que hay que hacer.',
    category: 'consulta',
    mapColor: '#F472B6',
    mapIcon: 'message-circle',
    formSchema: {
      fields: [
        {
          key: 'que_falta',
          label: '¿Qué es lo que más falta en tu barrio?',
          type: 'select',
          required: true,
          options: [
            'Iluminación y seguridad',
            'Asfalto y veredas',
            'Cloacas y agua',
            'Espacios verdes',
            'Salud cercana',
            'Escuelas y jardines',
            'Transporte',
            'Trabajo',
            'Otra cosa',
          ],
        },
        {
          key: 'detalle',
          label: 'Contanos un poco más, si querés',
          type: 'text',
          required: false,
          hint: 'Con tus palabras: ¿qué cambiaría tu día a día?',
        },
      ],
    },
  },
];

async function upsertCircle(seed: OfficialCircle): Promise<'created' | 'updated'> {
  const [existing] = await db.select().from(circles).where(eq(circles.name, seed.name)).limit(1);

  if (existing) {
    await db
      .update(circles)
      .set({
        description: seed.description,
        kind: seed.kind,
        province: seed.province,
        city: seed.city,
        theme: seed.theme,
        isOfficial: true,
        isPrivate: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(circles.id, existing.id));
    return 'updated';
  }

  await db.insert(circles).values({
    name: seed.name,
    description: seed.description,
    kind: seed.kind,
    province: seed.province,
    city: seed.city,
    theme: seed.theme,
    governance: 'coordinado',
    isPrivate: false,
    isOfficial: true,
    createdBy: null,
  });
  return 'created';
}

async function upsertTemplate(seed: TemplateSeed): Promise<'created' | 'updated'> {
  const [existing] = await db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.slug, seed.slug))
    .limit(1);

  const values = {
    type: seed.type,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    formSchema: JSON.stringify(seed.formSchema),
    mapColor: seed.mapColor,
    mapIcon: seed.mapIcon,
    isActive: true,
  };

  if (existing) {
    await db.update(campaignTemplates).set(values).where(eq(campaignTemplates.id, existing.id));
    return 'updated';
  }

  await db.insert(campaignTemplates).values({ slug: seed.slug, ...values });
  return 'created';
}

async function main() {
  console.log('Sembrando círculos oficiales y plantillas de campaña…\n');

  for (const circle of OFFICIAL_CIRCLES) {
    const result = await upsertCircle(circle);
    console.log(`  [círculo ${result}] ${circle.name}`);
  }

  for (const template of TEMPLATES) {
    const result = await upsertTemplate(template);
    console.log(`  [plantilla ${result}] ${template.slug} (${template.type})`);
  }

  console.log('\nListo. Seed idempotente: correrlo de nuevo solo actualiza.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed falló:', error);
    process.exit(1);
  });
