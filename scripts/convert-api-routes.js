#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// APIルートファイルを検索
const apiRoutes = glob.sync('app/api/**/*.ts', { cwd: process.cwd() });

console.log(`Found ${apiRoutes.length} API route files`);

let convertedCount = 0;

apiRoutes.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // createRouteHandlerClientのインポートを変換
  if (content.includes('createRouteHandlerClient')) {
    content = content.replace(
      /import\s*{\s*createRouteHandlerClient\s*}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"]/g,
      "import { createClient } from '@/lib/supabase/server'"
    );
    modified = true;
  }

  // cookiesのインポートを削除
  if (content.includes("import { cookies } from 'next/headers'")) {
    content = content.replace(/import\s*{\s*cookies\s*}\s*from\s*['"]next\/headers['"]\s*;?\n?/g, '');
    modified = true;
  }

  // createRouteHandlerClient({ cookies })をcreateClient()に変換
  if (content.includes('createRouteHandlerClient')) {
    content = content.replace(
      /const\s+supabase\s*=\s*createRouteHandlerClient\s*\(\s*{\s*cookies\s*}\s*\)/g,
      'const supabase = createClient()'
    );
    modified = true;
  }

  // export const dynamic = 'force-dynamic'を追加（まだない場合）
  if (!content.includes("export const dynamic = 'force-dynamic'") && modified) {
    // インポート文の後に追加
    const importEndMatch = content.match(/(import[\s\S]*?(?:from\s*['"][^'"]+['"];?\s*\n)+)/);
    if (importEndMatch) {
      const importSection = importEndMatch[0];
      content = content.replace(importSection, importSection + "\nexport const dynamic = 'force-dynamic';\n");
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    convertedCount++;
    console.log(`✅ Converted: ${file}`);
  }
});

console.log(`\n✨ Conversion complete! Modified ${convertedCount} files.`);