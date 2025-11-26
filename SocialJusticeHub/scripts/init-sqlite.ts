import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../shared/schema-sqlite';

// Crear la base de datos SQLite
const sqlite = new Database('./local.db');
const db = drizzle(sqlite, { schema });

// Crear las tablas manualmente para SQLite
async function initDatabase() {
  try {
    console.log('🚀 Inicializando base de datos SQLite...');
    
    // Crear tabla users
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla dreams
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS dreams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        dream TEXT,
        value TEXT,
        need TEXT,
        basta TEXT,
        location TEXT,
        latitude TEXT,
        longitude TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL DEFAULT 'dream',
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Crear tabla community_posts
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        participants INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Crear tabla resources
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla stories
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        story TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Base de datos SQLite inicializada correctamente');
    
    // Insertar algunos datos de ejemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
  } finally {
    sqlite.close();
  }
}

async function insertSampleData() {
  try {
    console.log('📝 Insertando datos de ejemplo...');
    
    // Insertar usuario de ejemplo
    sqlite.exec(`
      INSERT OR IGNORE INTO users (username, password, email, name, location) 
      VALUES ('hombre_gris', 'password123', 'hombre@gris.com', 'El Hombre Gris', 'Argentina')
    `);

    // Insertar algunos sueños de ejemplo
    sqlite.exec(`
      INSERT OR IGNORE INTO dreams (user_id, dream, type, location, latitude, longitude) 
      VALUES 
        (1, 'Una Argentina donde todos tengan acceso a educación de calidad', 'dream', 'Buenos Aires', '-34.6037', '-58.3816'),
        (1, 'Un país donde la corrupción sea solo un mal recuerdo', 'dream', 'Córdoba', '-31.4201', '-64.1888'),
        (1, 'Una sociedad que valore el trabajo honesto y la solidaridad', 'dream', 'Rosario', '-32.9442', '-60.6505')
    `);

    // Insertar algunos valores de ejemplo
    sqlite.exec(`
      INSERT OR IGNORE INTO dreams (user_id, value, type, location, latitude, longitude) 
      VALUES 
        (1, 'La honestidad como base de toda relación humana', 'value', 'Mendoza', '-32.8908', '-68.8272'),
        (1, 'El respeto por la dignidad de cada persona', 'value', 'Tucumán', '-26.8083', '-65.2176'),
        (1, 'La solidaridad como motor del progreso social', 'value', 'La Plata', '-34.9214', '-57.9544')
    `);

    // Insertar algunas necesidades de ejemplo
    sqlite.exec(`
      INSERT OR IGNORE INTO dreams (user_id, need, type, location, latitude, longitude) 
      VALUES 
        (1, 'Acceso universal a la salud y educación', 'need', 'Salta', '-24.7821', '-65.4232'),
        (1, 'Trabajo digno para todos los argentinos', 'need', 'Santa Fe', '-31.6333', '-60.7000'),
        (1, 'Seguridad y justicia para todos', 'need', 'Corrientes', '-27.4692', '-58.8306')
    `);

    // Insertar algunos ¡BASTA! de ejemplo
    sqlite.exec(`
      INSERT OR IGNORE INTO dreams (user_id, basta, type, location, latitude, longitude) 
      VALUES 
        (1, '¡BASTA! de aceptar la corrupción como algo normal', 'basta', 'Buenos Aires', '-34.6037', '-58.3816'),
        (1, '¡BASTA! de postergar nuestros sueños por miedo al cambio', 'basta', 'Córdoba', '-31.4201', '-64.1888'),
        (1, '¡BASTA! de esperar que otros cambien primero', 'basta', 'Rosario', '-32.9442', '-60.6505')
    `);

    console.log('✅ Datos de ejemplo insertados correctamente');
    
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
  }
}

// Ejecutar la inicialización
initDatabase();
