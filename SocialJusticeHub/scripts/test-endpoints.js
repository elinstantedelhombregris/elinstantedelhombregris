#!/usr/bin/env node

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

const endpoints = [
  { method: 'GET', path: '/api/health', description: 'Health check' },
  { method: 'GET', path: '/api/challenges', description: 'Get all challenges' },
  { method: 'GET', path: '/api/challenges/1', description: 'Get challenge by ID' },
  { method: 'GET', path: '/api/challenges/1/steps', description: 'Get challenge steps' },
  { method: 'GET', path: '/api/badges', description: 'Get all badges' },
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint.description}: ${response.status}`);
      if (Array.isArray(data)) {
        console.log(`   📊 Found ${data.length} items`);
      } else if (data.title) {
        console.log(`   📝 "${data.title}"`);
      }
    } else {
      console.log(`❌ ${endpoint.description}: ${response.status} - ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint.description}: Network error - ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n✨ API endpoint testing completed!');
}

runTests().catch(console.error);
