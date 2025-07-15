import { NextRequest, NextResponse } from 'next/server';
import { runBoardSetup } from '@/lib/db/auto-setup';

export const dynamic = 'force-dynamic';

/**
 * 掲示板の自動セットアップAPI
 * GET /api/setup/board にアクセスするだけでセットアップ完了
 */
export async function GET(request: NextRequest) {
  try {
    const result = await runBoardSetup();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ セットアップ完了！掲示板が使えるようになりました。',
        next_step: '/board にアクセスして掲示板を確認してください。'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        help: 'エラーが続く場合は、Supabaseダッシュボードで手動でテーブルを作成してください。'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'セットアップに失敗しました',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

/**
 * サンプルデータも含めたフルセットアップ
 */
export async function POST(request: NextRequest) {
  try {
    const { includeSamples } = await request.json();
    
    // 基本セットアップ
    const setupResult = await runBoardSetup();
    
    if (!setupResult.success) {
      return NextResponse.json(setupResult, { status: 500 });
    }
    
    // サンプルデータの作成（オプション）
    if (includeSamples) {
      const { BoardAutoSetup } = await import('@/lib/db/auto-setup');
      const setup = new BoardAutoSetup();
      await setup.createSamplePosts();
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ フルセットアップ完了！',
      included: {
        tables: true,
        categories: true,
        samplePosts: includeSamples || false
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'セットアップに失敗しました'
    }, { status: 500 });
  }
}