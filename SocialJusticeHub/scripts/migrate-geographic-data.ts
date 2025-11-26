import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';

const sqlite = new Database('./local.db');
const db = drizzle(sqlite);

async function migrateGeographicData() {
  console.log('🚀 Starting geographic data migration...');

  try {
    // Add new geographic columns to community_posts table
    console.log('📝 Adding geographic columns to community_posts table...');
    
    // Check if columns exist before adding them
    const tableInfo = sqlite.prepare("PRAGMA table_info(community_posts)").all() as any[];
    const existingColumns = tableInfo.map(col => col.name);
    
    const newColumns = [
      { name: 'latitude', sql: "ALTER TABLE community_posts ADD COLUMN latitude REAL" },
      { name: 'longitude', sql: "ALTER TABLE community_posts ADD COLUMN longitude REAL" },
      { name: 'province', sql: "ALTER TABLE community_posts ADD COLUMN province TEXT" },
      { name: 'city', sql: "ALTER TABLE community_posts ADD COLUMN city TEXT" },
      { name: 'postal_code', sql: "ALTER TABLE community_posts ADD COLUMN postal_code TEXT" },
      { name: 'country', sql: "ALTER TABLE community_posts ADD COLUMN country TEXT DEFAULT 'Argentina'" },
      { name: 'address', sql: "ALTER TABLE community_posts ADD COLUMN address TEXT" }
    ];

    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`  ➕ Adding column: ${column.name}`);
        sqlite.exec(column.sql);
      } else {
        console.log(`  ✅ Column ${column.name} already exists`);
      }
    }

    // Create geographic locations lookup table
    const locationsTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='geographic_locations'
    `).get();

    if (!locationsTableExists) {
      console.log('  ➕ Creating geographic_locations table...');
      sqlite.exec(`
        CREATE TABLE geographic_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL, -- 'province', 'city', 'neighborhood'
          parent_id INTEGER,
          latitude REAL,
          longitude REAL,
          postal_code TEXT,
          country TEXT DEFAULT 'Argentina',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES geographic_locations (id)
        )
      `);
    } else {
      console.log('  ✅ geographic_locations table already exists');
    }

    // Create community post likes table
    const likesTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='community_post_likes'
    `).get();

    if (!likesTableExists) {
      console.log('  ➕ Creating community_post_likes table...');
      sqlite.exec(`
        CREATE TABLE community_post_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(post_id, user_id)
        )
      `);
    } else {
      console.log('  ✅ community_post_likes table already exists');
    }

    // Create community post views table for detailed tracking
    const viewsTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='community_post_views'
    `).get();

    if (!viewsTableExists) {
      console.log('  ➕ Creating community_post_views table...');
      sqlite.exec(`
        CREATE TABLE community_post_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          user_id INTEGER,
          ip_address TEXT,
          user_agent TEXT,
          viewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
      `);
    } else {
      console.log('  ✅ community_post_views table already exists');
    }

    // Insert sample geographic data for Argentina
    console.log('🌍 Inserting sample geographic data...');
    
    const provinces = [
      { name: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
      { name: 'Córdoba', latitude: -31.4201, longitude: -64.1888 },
      { name: 'Santa Fe', latitude: -31.6333, longitude: -60.7 },
      { name: 'Mendoza', latitude: -32.8908, longitude: -68.8272 },
      { name: 'Tucumán', latitude: -26.8241, longitude: -65.2226 },
      { name: 'Salta', latitude: -24.7821, longitude: -65.4232 },
      { name: 'Entre Ríos', latitude: -31.7413, longitude: -60.5115 },
      { name: 'Chaco', latitude: -27.4517, longitude: -58.9867 },
      { name: 'Corrientes', latitude: -27.4692, longitude: -58.8306 },
      { name: 'San Juan', latitude: -31.5375, longitude: -68.5364 }
    ];

    for (const province of provinces) {
      const exists = sqlite.prepare(`
        SELECT id FROM geographic_locations 
        WHERE name = ? AND type = 'province'
      `).get(province.name);

      if (!exists) {
        sqlite.prepare(`
          INSERT INTO geographic_locations (name, type, latitude, longitude, country)
          VALUES (?, 'province', ?, ?, 'Argentina')
        `).run(province.name, province.latitude, province.longitude);
        console.log(`    ➕ Added province: ${province.name}`);
      }
    }

    // Insert major cities
    const cities = [
      { name: 'Ciudad Autónoma de Buenos Aires', province: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
      { name: 'La Plata', province: 'Buenos Aires', latitude: -34.9214, longitude: -57.9544 },
      { name: 'Córdoba', province: 'Córdoba', latitude: -31.4201, longitude: -64.1888 },
      { name: 'Rosario', province: 'Santa Fe', latitude: -32.9442, longitude: -60.6505 },
      { name: 'Mendoza', province: 'Mendoza', latitude: -32.8908, longitude: -68.8272 },
      { name: 'San Miguel de Tucumán', province: 'Tucumán', latitude: -26.8241, longitude: -65.2226 },
      { name: 'Salta', province: 'Salta', latitude: -24.7821, longitude: -65.4232 },
      { name: 'Paraná', province: 'Entre Ríos', latitude: -31.7413, longitude: -60.5115 },
      { name: 'Resistencia', province: 'Chaco', latitude: -27.4517, longitude: -58.9867 },
      { name: 'Corrientes', province: 'Corrientes', latitude: -27.4692, longitude: -58.8306 }
    ];

    for (const city of cities) {
      const provinceId = sqlite.prepare(`
        SELECT id FROM geographic_locations 
        WHERE name = ? AND type = 'province'
      `).get(city.province);

      if (provinceId) {
        const exists = sqlite.prepare(`
          SELECT id FROM geographic_locations 
          WHERE name = ? AND type = 'city' AND parent_id = ?
        `).get(city.name, provinceId.id);

        if (!exists) {
          sqlite.prepare(`
            INSERT INTO geographic_locations (name, type, parent_id, latitude, longitude, country)
            VALUES (?, 'city', ?, ?, ?, 'Argentina')
          `).run(city.name, provinceId.id, city.latitude, city.longitude);
          console.log(`    ➕ Added city: ${city.name}`);
        }
      }
    }

    console.log('✅ Geographic data migration completed successfully!');
    
    // Show updated schema
    console.log('\n📋 Updated community_posts schema:');
    const updatedTableInfo = sqlite.prepare("PRAGMA table_info(community_posts)").all();
    console.table(updatedTableInfo);

    // Show geographic data summary
    const provinceCount = sqlite.prepare("SELECT COUNT(*) as count FROM geographic_locations WHERE type = 'province'").get();
    const cityCount = sqlite.prepare("SELECT COUNT(*) as count FROM geographic_locations WHERE type = 'city'").get();
    console.log(`\n🌍 Geographic data summary:`);
    console.log(`  Provinces: ${provinceCount.count}`);
    console.log(`  Cities: ${cityCount.count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Run migration
migrateGeographicData()
  .then(() => {
    console.log('🎉 Geographic migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Geographic migration failed:', error);
    process.exit(1);
  });
