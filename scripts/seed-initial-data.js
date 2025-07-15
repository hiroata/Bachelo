#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedInitialData() {
  try {
    console.log('Starting initial data seed...');

    // 1. カテゴリーの作成
    const categories = [
      { name: '札幌', description: '札幌エリアの出会い掲示板', display_order: 1 },
      { name: '旭川', description: '旭川エリアの出会い掲示板', display_order: 2 },
      { name: '函館', description: '函館エリアの出会い掲示板', display_order: 3 },
      { name: '帯広', description: '帯広エリアの出会い掲示板', display_order: 4 },
      { name: '釧路', description: '釧路エリアの出会い掲示板', display_order: 5 },
    ];

    console.log('Creating categories...');
    const { data: existingCategories } = await supabase
      .from('board_categories')
      .select('name');

    const existingNames = new Set(existingCategories?.map(c => c.name) || []);
    const newCategories = categories.filter(c => !existingNames.has(c.name));

    if (newCategories.length > 0) {
      const { error: categoryError } = await supabase
        .from('board_categories')
        .insert(newCategories);

      if (categoryError) {
        console.error('Category creation error:', categoryError);
        return;
      }
      console.log(`Created ${newCategories.length} categories`);
    } else {
      console.log('Categories already exist');
    }

    // 2. カテゴリーIDを取得
    const { data: categoryData } = await supabase
      .from('board_categories')
      .select('id, name');

    const categoryMap = {};
    categoryData?.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // 3. サンプル投稿の作成
    const samplePosts = [
      {
        category_id: categoryMap['札幌'],
        author_name: '札幌太郎',
        title: '週末一緒に飲みに行きませんか？',
        content: '30代男性です。土曜日の夜、すすきので一緒に飲める方を探しています。',
        reply_count: 0
      },
      {
        category_id: categoryMap['札幌'],
        author_name: '雪女',
        title: 'カフェ巡り好きな方',
        content: '札幌市内のカフェ巡りが趣味です。一緒に新しいお店を開拓しませんか？',
        reply_count: 0
      },
      {
        category_id: categoryMap['旭川'],
        author_name: '旭川花子',
        title: '旭山動物園デート',
        content: '今度の休日、旭山動物園に一緒に行ってくれる方募集中です！',
        reply_count: 0
      },
      {
        category_id: categoryMap['函館'],
        author_name: '函館人',
        title: '夜景を見に行きませんか',
        content: '函館山の夜景を一緒に見に行ける方を探しています。',
        reply_count: 0
      },
      {
        category_id: categoryMap['帯広'],
        author_name: '十勝男子',
        title: '豚丼食べに行きましょう',
        content: '帯広名物の豚丼を一緒に食べに行きませんか？おすすめのお店知ってます！',
        reply_count: 0
      }
    ];

    console.log('Creating sample posts...');
    const { error: postError } = await supabase
      .from('board_posts')
      .insert(samplePosts);

    if (postError) {
      console.error('Post creation error:', postError);
      return;
    }

    console.log(`Created ${samplePosts.length} sample posts`);
    console.log('Initial data seed completed successfully!');

  } catch (error) {
    console.error('Seed error:', error);
  }
}

seedInitialData();