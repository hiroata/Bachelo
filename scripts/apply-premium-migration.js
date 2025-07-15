const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyPremiumMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 プレミアム会員システムのマイグレーションを開始...\n');
    
    // SQLファイルを読み込み
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '020_premium_membership.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // SQLを個別のステートメントに分割
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 ${statements.length}個のSQLステートメントを実行します`);
    
    // 各ステートメントを実行
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip BEGIN/COMMIT for now
      if (statement.trim().toUpperCase() === 'BEGIN;' || statement.trim().toUpperCase() === 'COMMIT;') {
        continue;
      }
      
      console.log(`\n実行中 (${i + 1}/${statements.length}): ${statement.substring(0, 50)}...`);
      
      // Direct SQL execution using Supabase client
      const { data, error } = await supabase.rpc('query', { 
        query_text: statement 
      }).single();
      
      if (error) {
        console.error(`❌ エラー: ${error.message}`);
        // Continue with next statement
      } else {
        console.log(`✅ 成功`);
      }
    }
    
    console.log('\n🎉 マイグレーション完了！');
    
    // 確認
    const { data: plans } = await supabase
      .from('membership_plans')
      .select('*');
    
    if (plans) {
      console.log('\n📋 作成されたプラン:');
      plans.forEach(plan => {
        console.log(`  - ${plan.name}: ¥${plan.price}/月`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生:', error);
  }
}

applyPremiumMigration();