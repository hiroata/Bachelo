// Stable Diffusion ヘルパー関数

import { ImageGenerateOptions } from './types';

// エロティックな画像生成用のプロンプトテンプレート
export const EROTIC_PROMPT_TEMPLATES = {
  portrait: {
    positive: 'beautiful japanese woman, (best quality:1.2), (masterpiece:1.2), (realistic:1.3), detailed face, seductive expression',
    negative: 'worst quality, low quality, normal quality, lowres, bad anatomy, bad hands, bad fingers, missing fingers, error'
  },
  nude: {
    positive: '(nsfw:1.3), nude, naked, beautiful body, perfect anatomy, (best quality:1.2), (masterpiece:1.2)',
    negative: 'clothes, clothing, worst quality, low quality, bad anatomy, bad proportions, extra limbs, deformed'
  },
  lingerie: {
    positive: 'sexy lingerie, seductive pose, (best quality:1.2), (masterpiece:1.2), detailed fabric, lace',
    negative: 'worst quality, low quality, bad anatomy, bad hands, error, missing limbs'
  },
  couple: {
    positive: '2people, couple, intimate, romantic, (best quality:1.2), (masterpiece:1.2), detailed',
    negative: 'worst quality, low quality, bad anatomy, extra limbs, fused bodies, bad proportions'
  }
};

// サンプラー設定
export const SAMPLER_PRESETS = {
  fast: {
    sampler: 'Euler a',
    steps: 20,
    cfgScale: 7
  },
  quality: {
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfgScale: 8
  },
  detailed: {
    sampler: 'DPM++ SDE Karras',
    steps: 40,
    cfgScale: 10
  }
};

// アスペクト比プリセット
export const ASPECT_RATIOS = {
  square: { width: 512, height: 512 },
  portrait: { width: 512, height: 768 },
  landscape: { width: 768, height: 512 },
  wide: { width: 1024, height: 576 },
  tall: { width: 576, height: 1024 }
};

// プロンプト強化関数
export function enhanceEroticPrompt(basePrompt: string, style?: keyof typeof EROTIC_PROMPT_TEMPLATES): string {
  const template = style ? EROTIC_PROMPT_TEMPLATES[style] : EROTIC_PROMPT_TEMPLATES.portrait;
  return `${basePrompt}, ${template.positive}`;
}

// ネガティブプロンプト生成
export function generateNegativePrompt(style?: keyof typeof EROTIC_PROMPT_TEMPLATES): string {
  const template = style ? EROTIC_PROMPT_TEMPLATES[style] : EROTIC_PROMPT_TEMPLATES.portrait;
  return template.negative;
}

// オプション生成ヘルパー
export function createImageOptions(
  prompt: string,
  preset: keyof typeof SAMPLER_PRESETS = 'quality',
  aspectRatio: keyof typeof ASPECT_RATIOS = 'portrait',
  style?: keyof typeof EROTIC_PROMPT_TEMPLATES
): ImageGenerateOptions {
  const samplerSettings = SAMPLER_PRESETS[preset];
  const dimensions = ASPECT_RATIOS[aspectRatio];
  
  return {
    prompt: enhanceEroticPrompt(prompt, style),
    negativePrompt: generateNegativePrompt(style),
    ...dimensions,
    ...samplerSettings
  };
}

// バッチ生成用のシード配列を作成
export function generateSeedArray(count: number, baseSeed?: number): number[] {
  const seeds: number[] = [];
  const base = baseSeed || Math.floor(Math.random() * 1000000);
  
  for (let i = 0; i < count; i++) {
    seeds.push(base + i);
  }
  
  return seeds;
}

// 画像のBase64をBlobに変換
export function base64ToBlob(base64: string, mimeType = 'image/png'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// 画像のBase64をFileオブジェクトに変換
export function base64ToFile(base64: string, filename: string): File {
  const blob = base64ToBlob(base64);
  return new File([blob], filename, { type: 'image/png' });
}

// プロンプトのサニタイズ（危険な内容を除去）
export function sanitizePrompt(prompt: string): string {
  // 明らかに違法または有害なキーワードを除去
  const bannedWords = [
    'child', 'kid', 'minor', 'underage', 'loli', 'shota',
    'violence', 'gore', 'death', 'torture', 'abuse'
  ];
  
  let sanitized = prompt.toLowerCase();
  bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
}