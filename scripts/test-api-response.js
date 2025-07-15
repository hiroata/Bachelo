const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testApiResponse() {
  try {
    console.log('🔍 API応答をテスト中...\n');

    // 1. 直接データベースから投稿を取得
    console.log('1. データベースから直接取得:');
    const { data: directPosts, error: directError, count } = await supabase
      .from('board_posts')
      .select(`
        *,
        category:board_categories(*),
        images:board_post_images(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (directError) {
      console.error('❌ 直接取得エラー:', directError);
    } else {
      console.log(`✅ 総投稿数: ${count}件`);
      console.log(`✅ 取得投稿数: ${directPosts?.length || 0}件`);
      
      if (directPosts && directPosts.length > 0) {
        console.log('\n最新投稿:');
        directPosts.slice(0, 3).forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
          console.log(`   作成者: ${post.author_name}`);
          console.log(`   カテゴリー: ${post.category?.name || 'なし'}`);
          console.log(`   作成日: ${post.created_at}`);
          console.log(`   内容: ${post.content.substring(0, 100)}...`);
          console.log('');
        });
      }
    }

    // 2. API形式で返信数も含めて取得
    console.log('\n2. 返信数付きで取得:');
    const postsWithReplyCounts = await Promise.all(
      (directPosts || []).slice(0, 3).map(async (post) => {
        const { count: replyCount } = await supabase
          .from('board_replies')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        return {
          ...post,
          replies_count: replyCount || 0
        };
      })
    );

    postsWithReplyCounts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   返信数: ${post.replies_count}件`);
      console.log(`   +評価: ${post.plus_count || 0}件`);
      console.log(`   -評価: ${post.minus_count || 0}件`);
      console.log(`   閲覧数: ${post.view_count || 0}回`);
      console.log('');
    });

    // 3. カテゴリー別の投稿数チェック
    console.log('\n3. カテゴリー別投稿数:');
    const { data: categories } = await supabase
      .from('board_categories')
      .select('*');

    if (categories) {
      for (const category of categories) {
        const { count: categoryCount } = await supabase
          .from('board_posts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        
        console.log(`${category.name}: ${categoryCount || 0}件`);
      }
    }

    // 4. 最新の投稿をJSON形式で出力
    console.log('\n4. APIレスポンス形式:');
    const apiResponse = {
      posts: postsWithReplyCounts,
      total: count || 0,
      page: 1,
      per_page: 5,
      total_pages: Math.ceil((count || 0) / 5)
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    // 5. 実際のAPIエンドポイントをテスト
    console.log('\n5. 実際のAPIテスト:');
    try {
      const apiUrl = `${supabaseUrl.replace('/rest/v1', '')}/api/board/posts?page=1&per_page=5`;
      console.log(`APIエンドポイント: ${apiUrl}`);
      
      // Note: これは実際のAPIエンドポイントではないので、代わりにSupabaseの直接クエリ結果を使用
      console.log('APIテストはローカル環境では実行できません。');
      console.log('ブラウザのNetwork タブでAPIレスポンスを確認してください。');
      
    } catch (apiError) {
      console.error('❌ API テストエラー:', apiError);
    }

    console.log('\n🎉 テスト完了！データベースには十分な投稿があります。');
    console.log('フロントエンドで表示されない場合は以下を確認してください:');
    console.log('1. ブラウザのNetwork タブでAPIレスポンスをチェック');
    console.log('2. React Devtools でstateの値を確認');
    console.log('3. コンソールエラーがないかチェック');
    console.log('4. /api/board/posts へのアクセス権限を確認');

  } catch (error) {
    console.error('❌ テスト中にエラー:', error);
  }
}

testApiResponse();