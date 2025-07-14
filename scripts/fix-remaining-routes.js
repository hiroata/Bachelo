#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// APIルートファイルを検索
const apiRoutes = glob.sync('app/api/**/*.ts', { cwd: process.cwd() });

console.log(`Checking ${apiRoutes.length} API route files for remaining issues...`);

let fixedCount = 0;

apiRoutes.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // createRouteHandlerClient残存チェック（関数内でも）
  if (content.includes('createRouteHandlerClient')) {
    // すべてのcreateRouteHandlerClient呼び出しを置換
    content = content.replace(
      /createRouteHandlerClient<Database>\s*\(\s*{\s*cookies\s*}\s*\)/g,
      'createClient()'
    );
    content = content.replace(
      /createRouteHandlerClient\s*\(\s*{\s*cookies\s*}\s*\)/g,
      'createClient()'
    );
    modified = true;
  }

  // cookiesがまだ使われている場合、削除
  if (content.includes('{ cookies }') && !content.includes('// cookies')) {
    content = content.replace(/,?\s*{\s*cookies\s*}/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✨ Fixed ${fixedCount} remaining files.`);