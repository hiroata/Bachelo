const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Bachelo Database Complete Setup & Population');
console.log('================================================\n');

async function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: __dirname, 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    console.log('');
    return false;
  }
}

async function main() {
  console.log('This script will:');
  console.log('1. 🏗️  Set up complete database schema');
  console.log('2. 📊 Diagnose any issues');
  console.log('3. 📝 Populate with sample data');
  console.log('4. 📈 Generate statistics\n');

  // Check if pg is installed
  try {
    execSync('node -e "require(\'pg\')"', { stdio: 'ignore' });
    console.log('✅ PostgreSQL client (pg) is installed\n');
  } catch (error) {
    console.log('📦 Installing PostgreSQL client...');
    const installSuccess = await runCommand('npm install pg', 'Installing pg package');
    if (!installSuccess) {
      console.log('❌ Failed to install pg package. Please run: npm install pg');
      process.exit(1);
    }
  }

  // Step 1: Complete database setup
  const setupSuccess = await runCommand('node setup-complete-database.js', 'Database Schema Setup');
  
  if (!setupSuccess) {
    console.log('⚠️  Database setup encountered issues, but continuing...\n');
  }

  // Step 2: Diagnose and populate
  const populateSuccess = await runCommand('node diagnose-and-populate-database.js', 'Database Diagnosis & Population');
  
  if (!populateSuccess) {
    console.log('⚠️  Database population encountered issues\n');
  }

  // Final instructions
  console.log('🎉 Database setup process completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run "npm run dev" to start your application');
  console.log('2. Visit http://localhost:3000 to see your forum');
  console.log('3. Check the admin panel for category management');
  console.log('4. Add your own content and customize as needed');
  
  console.log('\n🛠️  Useful Commands:');
  console.log('- npm run db:setup     (Setup database schema)');
  console.log('- npm run db:populate  (Add sample data)');
  console.log('- npm run dev          (Start development server)');
  
  console.log('\n📖 For more details, see DATABASE_SETUP_GUIDE.md');
}

main().catch(console.error);