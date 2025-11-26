const Database = require('better-sqlite3');

const sqlite = new Database('local.db');

// Insert sample blog posts
const posts = [
  {
    title: 'El Instante del Hombre Gris: Una Reflexión',
    slug: 'el-instante-del-hombre-gris-reflexion',
    excerpt: 'Una reflexión profunda sobre el momento crucial de transformación personal y social.',
    content: 'En este artículo exploramos el concepto del "Instante del Hombre Gris" y su relevancia en la transformación social actual.',
    author_id: 1,
    published_at: new Date().toISOString(),
    category: 'reflexion',
    featured: 1,
    image_url: '/images/blog/instante-hombre-gris.jpg',
    type: 'blog',
    view_count: 0
  },
  {
    title: 'Video: La Semilla de ¡BASTA!',
    slug: 'video-la-semilla-de-basta',
    excerpt: 'Un video que explica los fundamentos del movimiento ¡BASTA! y su visión de transformación social.',
    content: 'Este video presenta los principios fundamentales del movimiento ¡BASTA! y cómo cada persona puede ser parte del cambio.',
    author_id: 1,
    published_at: new Date().toISOString(),
    category: 'video',
    featured: 1,
    video_url: 'https://youtu.be/ngE6CwUatho',
    type: 'vlog',
    view_count: 0
  },
  {
    title: 'Video: Construyendo el Futuro',
    slug: 'video-construyendo-el-futuro',
    excerpt: 'Un video inspirador sobre cómo construir un futuro mejor para todos.',
    content: 'En este video exploramos las acciones concretas que podemos tomar para construir un futuro más justo y sostenible.',
    author_id: 1,
    published_at: new Date().toISOString(),
    category: 'video',
    featured: 0,
    video_url: 'https://youtu.be/L1qeN78SlEE',
    type: 'vlog',
    view_count: 0
  }
];

posts.forEach(post => {
  const stmt = sqlite.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, author_id, published_at, category, featured, image_url, video_url, type, view_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(post.title, post.slug, post.excerpt, post.content, post.author_id, post.published_at, post.category, post.featured, post.image_url, post.video_url, post.type, post.view_count);
});

console.log('✅ Sample blog posts inserted');
sqlite.close();
