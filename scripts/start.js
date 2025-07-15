#!/usr/bin/env node

const { spawn } = require('child_process');

// Get PORT from environment variable
let port = process.env.PORT || '3000';

// Validate if PORT is a valid number
if (!/^\d+$/.test(port) || parseInt(port) < 0 || parseInt(port) > 65535) {
  console.warn(`Invalid PORT value: ${port}. Using default port 3000.`);
  port = '3000';
}

console.log(`Starting Next.js server on port ${port}...`);

// Start Next.js with the validated port
const child = spawn('npx', ['next', 'start', '-p', port], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});