import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_STABLE_DIFFUSION_URL || 'http://127.0.0.1:7860';
    
    // WebUIのヘルスチェック
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/sdapi/v1/options`, {
      method: 'GET',
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        error: 'WebUIが応答しません',
        details: `Status: ${response.status}`
      }, { status: 503 });
    }

    const options = await response.json();
    
    // 利用可能なモデルも取得
    const modelsResponse = await fetch(`${baseUrl}/sdapi/v1/sd-models`);
    const models = modelsResponse.ok ? await modelsResponse.json() : [];

    return NextResponse.json({
      connected: true,
      webui_version: options.webui_version || 'unknown',
      current_model: options.sd_model_checkpoint || 'unknown',
      available_models: models.map((m: any) => m.title || m.model_name),
      api_enabled: true
    });

  } catch (error) {
    console.error('SD connection test error:', error);
    
    return NextResponse.json({
      connected: false,
      error: 'Stable Diffusion WebUIに接続できません',
      details: error instanceof Error ? error.message : 'Unknown error',
      help: 'webui-user.batに --api オプションが設定されているか確認してください'
    }, { status: 503 });
  }
}