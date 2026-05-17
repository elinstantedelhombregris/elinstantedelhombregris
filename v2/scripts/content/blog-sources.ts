export interface BlogSource {
  slug: string;
  publishedAt: string;
  category: string;
  tags: readonly string[];
}

// Synthetic publishedAt: staggered weekly, newest first. Tune by hand.
export const BLOG_SOURCES: readonly BlogSource[] = [
  { slug: 'el-cansancio-sagrado-por-qu-ya-no-podemos-esperar', publishedAt: '2026-04-30T00:00:00Z', category: 'diagnostico', tags: ['lucidez', 'agotamiento', 'diseno-social'] },
  { slug: 'la-amabilidad-como-ingeniera-social', publishedAt: '2026-04-23T00:00:00Z', category: 'ingenieria-social', tags: ['amabilidad', 'confianza', 'cultura-civica'] },
  { slug: 'diseo-idealizado-la-argentina-posible', publishedAt: '2026-04-16T00:00:00Z', category: 'diseno', tags: ['argentina', 'diseno-idealizado', 'metodo'] },
  { slug: 'el-poder-del-pensamiento-sistmico-en-la-transformacin-social', publishedAt: '2026-04-09T00:00:00Z', category: 'ingenieria-social', tags: ['pensamiento-sistemico', 'transformacion'] },
  { slug: 'la-tica-del-servicio-construyendo-una-sociedad-de-servidores', publishedAt: '2026-04-02T00:00:00Z', category: 'etica', tags: ['servicio', 'etica', 'comunidad'] },
  { slug: 'sistemas-vs-sntomas-cmo-pensar-como-ingeniero-social', publishedAt: '2026-03-26T00:00:00Z', category: 'ingenieria-social', tags: ['sistemas', 'sintomas', 'diagnostico'] },
  { slug: 'la-amabilidad-como-estrategia-de-transformacin', publishedAt: '2026-03-19T00:00:00Z', category: 'ingenieria-social', tags: ['amabilidad', 'estrategia'] },
  { slug: 'aprender-para-ser-libres-la-educacin-como-acto-de-soberana', publishedAt: '2026-03-12T00:00:00Z', category: 'educacion', tags: ['educacion', 'soberania', 'libertad'] },
  { slug: 'la-ciencia-de-la-confianza-el-capital-que-nadie-mide-pero-todos-necesitan', publishedAt: '2026-03-05T00:00:00Z', category: 'confianza', tags: ['confianza', 'capital-social'] },
  { slug: 'por-qu-nos-resistimos-a-cambiar-la-psicologa-de-la-transformacin', publishedAt: '2026-02-26T00:00:00Z', category: 'psicologia', tags: ['cambio', 'psicologia', 'resistencia'] },
  { slug: 'inteligencia-colectiva-por-qu-juntos-pensamos-mejor-de-lo-que-creemos', publishedAt: '2026-02-19T00:00:00Z', category: 'colaboracion', tags: ['inteligencia-colectiva', 'cooperacion'] },
  { slug: 'lo-que-le-debemos-al-futuro-responsabilidad-intergeneracional-como-diseo', publishedAt: '2026-02-12T00:00:00Z', category: 'etica', tags: ['intergeneracional', 'futuro', 'responsabilidad'] },
  { slug: 'las-fuerzas-del-cielo-el-poder-que-ya-tens-y-nadie-te-ense-a-usar', publishedAt: '2026-02-05T00:00:00Z', category: 'poder', tags: ['poder', 'fuerzas-del-cielo'] },
  { slug: 'detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar', publishedAt: '2026-01-29T00:00:00Z', category: 'poder', tags: ['patrones', 'cognicion'] },
  { slug: 'refinarse-o-repetirse', publishedAt: '2026-01-22T00:00:00Z', category: 'crecimiento', tags: ['crecimiento', 'practica'] },
  { slug: 'el-cristo-que-llevs-dentro', publishedAt: '2026-01-15T00:00:00Z', category: 'espiritualidad', tags: ['espiritualidad', 'identidad'] },
  { slug: 'pago-por-inteligencia-artificial-y-por-la-ma', publishedAt: '2026-01-08T00:00:00Z', category: 'tecnologia', tags: ['ia', 'soberania-cognitiva'] },
  { slug: 'buscar-en-el-pasado-para-controlar-el-futuro', publishedAt: '2026-01-01T00:00:00Z', category: 'historia', tags: ['memoria', 'historia', 'futuro'] },
  { slug: 'el-abrazo-que-no-supimos-sostener', publishedAt: '2025-12-25T00:00:00Z', category: 'argentina', tags: ['mundial', 'identidad', 'argentina'] },
];
