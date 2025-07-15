/**
 * Supabaseストレージ管理
 */

import { uploadFile, deleteFile } from '../supabase/helpers';

export type StorageProvider = 'supabase';

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  path?: string;
}

// 簡単なSupabaseアップロード関数
async function uploadImage(file: File, postId: string) {
  const path = `board_images/${postId}/${Date.now()}-${file.name}`;
  const result = await uploadFile('board_images', path, file);
  return {
    url: result.publicUrl,
    thumbnailUrl: result.publicUrl,
    path: result.path
  };
}

async function uploadVoice(file: File) {
  const path = `voice/${Date.now()}-${file.name}`;
  const result = await uploadFile('voice', path, file);
  return {
    url: result.publicUrl,
    path: result.path
  };
}

/**
 * 画像をアップロード（Supabase）
 */
export async function uploadImageDual(
  file: File,
  postId: string,
  provider: StorageProvider = 'supabase'
): Promise<UploadResult> {
  try {
    const supabaseResult = await uploadImage(file, postId);
    return {
      url: supabaseResult.url,
      thumbnailUrl: supabaseResult.thumbnailUrl,
      path: supabaseResult.path
    };
  } catch (error) {
    console.error('Supabase upload failed:', error);
    throw error;
  }
}

/**
 * 音声をアップロード（Supabase）
 */
export async function uploadVoiceDual(
  file: File,
  category: string = 'general',
  provider: StorageProvider = 'supabase'
): Promise<UploadResult> {
  try {
    const supabaseResult = await uploadVoice(file);
    return {
      url: supabaseResult.url,
      path: supabaseResult.path
    };
  } catch (error) {
    console.error('Supabase upload failed:', error);
    throw error;
  }
}

/**
 * ファイルを削除（Supabase）
 */
export async function deleteFileDual(
  paths: {
    supabase?: string;
  }
): Promise<void> {
  if (paths.supabase) {
    try {
      // bucketとパスを分離する
      const pathParts = paths.supabase.split('/');
      const bucket = pathParts[0] || 'board_images';
      const filePath = pathParts.slice(1).join('/');
      await deleteFile(bucket, [filePath]);
    } catch (error) {
      console.error('Supabase delete failed:', error);
      throw error;
    }
  }
}

/**
 * 環境変数からデフォルトプロバイダーを取得
 */
export function getDefaultStorageProvider(): StorageProvider {
  return 'supabase';
}