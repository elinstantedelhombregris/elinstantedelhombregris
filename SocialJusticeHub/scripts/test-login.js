import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

// Conectar a la base de datos
const Database = require('better-sqlite3');
const sqlite = new Database('./local.db');

const username = 'hombre_gris';
const password = 'Password123!';

async function testLogin() {
  try {
    console.log('🔍 Probando login para usuario:', username);
    
    // Buscar el usuario
    const user = sqlite.prepare(`
      SELECT id, username, email, name, password 
      FROM users 
      WHERE username = ?
    `).get(username);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('👤 Nombre:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    
    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (isValidPassword) {
      console.log('✅ Contraseña correcta - Login exitoso!');
      console.log('🎉 Puedes acceder a la plataforma con:');
      console.log('   Usuario:', username);
      console.log('   Contraseña:', password);
    } else {
      console.log('❌ Contraseña incorrecta');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    sqlite.close();
  }
}

testLogin();
