#!/usr/bin/env node

const http = require('http');

async function testApp() {
  console.log('BACHELO Application Test\n');
  
  // Test 1: Mock Data API
  console.log('1. Testing Mock Data API...');
  try {
    const mockDataRes = await fetch('http://localhost:3001/api/test/mock-data');
    const mockData = await mockDataRes.json();
    console.log(`   ✓ Mock data API returned ${mockData.creators.length} creators`);
    console.log(`   ✓ First creator: ${mockData.creators[0].display_name}`);
  } catch (error) {
    console.log(`   ✗ Mock data API failed: ${error.message}`);
  }
  
  // Test 2: Health Check
  console.log('\n2. Testing Health Check API...');
  try {
    const healthRes = await fetch('http://localhost:3001/api/health');
    const health = await healthRes.json();
    console.log(`   ✓ Health status: ${health.status}`);
    console.log(`   ✓ Version: ${health.version}`);
  } catch (error) {
    console.log(`   ✗ Health check failed: ${error.message}`);
  }
  
  // Test 3: Age Gate Removed
  console.log('\n3. Testing Age Gate Removal...');
  try {
    const res = await fetch('http://localhost:3001/creators', {
      redirect: 'manual'
    });
    if (res.status === 200) {
      console.log('   ✓ Age gate successfully removed - direct access allowed');
    } else {
      console.log(`   ✗ Unexpected response: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ✗ Age gate test failed: ${error.message}`);
  }
  
  // Test 4: Creators Page without Cookie
  console.log('\n4. Testing Creators Page without Cookie...');
  try {
    const res = await fetch('http://localhost:3001/creators');
    const html = await res.text();
    const hasCreators = html.includes('クリエイター一覧');
    const hasAoi = html.includes('あおい');
    console.log(`   ✓ Page loaded without cookie: ${res.status === 200 ? 'Yes' : 'No'}`);
    console.log(`   ✓ Shows creator list: ${hasCreators ? 'Yes' : 'No'}`);
    console.log(`   ✓ Shows mock creators: ${hasAoi ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(`   ✗ Creators page test failed: ${error.message}`);
  }
  
  console.log('\n✅ Test completed!');
}

// Wait for server to be ready
console.log('Waiting for server to start...');
setTimeout(testApp, 3000);