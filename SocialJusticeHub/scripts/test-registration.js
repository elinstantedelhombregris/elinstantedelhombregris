#!/usr/bin/env node

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

async function testRegistration() {
  const testUser = {
    name: "Usuario Test",
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: "Password123!",
    confirmPassword: "Password123!",
    location: "Ciudad Test"
  };

  try {
    console.log('🧪 Probando registro de usuario...');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`👤 Usuario: ${testUser.username}`);
    
    const response = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro exitoso!');
      console.log(`🎯 Usuario creado: ${data.user.name}`);
      console.log(`🔑 Token recibido: ${data.tokens.accessToken ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Error en registro:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Mensaje: ${data.message}`);
      if (data.details) {
        console.log('   Detalles:');
        data.details.forEach(detail => {
          console.log(`     - ${detail.field}: ${detail.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Error de red: ${error.message}`);
  }
}

testRegistration().catch(console.error);
