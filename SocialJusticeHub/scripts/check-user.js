import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Usar require para importar los módulos
const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { eq } = require('drizzle-orm');

// Conectar a la base de datos
const sqlite = new Database('./local.db');
const db = drizzle(sqlite);

// Verificar si el usuario existe
async function checkUser() {
  try {
    console.log('🔍 Buscando usuario HombreGris01...');
    
    const user = sqlite.prepare(`
      SELECT id, username, email, name 
      FROM users 
      WHERE username = ?
    `).get('HombreGris01');
    
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('👤 Nombre:', user.name);
      console.log('📧 Email:', user.email);
      console.log('🆔 ID:', user.id);
      console.log('\n💡 Para resetear la contraseña, ejecuta: node scripts/reset-password-simple.js');
    } else {
      console.log('❌ Usuario HombreGris01 no encontrado');
      console.log('\n📋 Usuarios disponibles:');
      
      const users = sqlite.prepare('SELECT username, name, email FROM users LIMIT 10').all();
      users.forEach(user => {
        console.log(`- ${user.username} (${user.name}) - ${user.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    sqlite.close();
  }
}

checkUser();
