import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

// Conectar a la base de datos
const Database = require('better-sqlite3');
const sqlite = new Database('./local.db');

const newPassword = 'Password123!'; // Nueva contraseña para hombre_gris
const username = 'hombre_gris';

async function resetPassword() {
  try {
    console.log(`🔄 Reseteando contraseña para usuario: ${username}`);
    
    // Verificar que el usuario existe
    const user = sqlite.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar en la base de datos
    const stmt = sqlite.prepare(`
      UPDATE users 
      SET password = ?
      WHERE username = ?
    `);
    
    const result = stmt.run(hashedPassword, username);
    
    if (result.changes > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log(`📧 Usuario: ${username}`);
      console.log(`🔑 Nueva contraseña: ${newPassword}`);
      console.log('⚠️  Recuerda cambiar esta contraseña después del primer login');
    } else {
      console.log('❌ No se pudo actualizar la contraseña');
    }
    
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
  } finally {
    sqlite.close();
  }
}

resetPassword();
