import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { uploadVoiceDual, getDefaultStorageProvider } from '@/lib/storage/dual-storage';
import { createHash } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const storageProvider = (formData.get('storage_provider') as string) || getDefaultStorageProvider();
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files are allowed.' },
        { status: 400 }
      );
    }
    
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ipHash = createHash('sha256').update(ipAddress).digest('hex');
    
    try {
      // デュアルストレージアップロード
      const uploadResult = await uploadVoiceDual(
        file,
        category,
        'supabase'
      );
      
      // 使用するURLを決定
      const voiceUrl = uploadResult.url;
      
      if (!voiceUrl) {
        throw new Error('Failed to get voice URL from storage');
      }
      
      // データベースに保存
      const { data: post, error: dbError } = await supabase
        .from('voice_posts')
        .insert({
          title,
          category,
          voice_url: voiceUrl,
          storage_provider: 'supabase',
          ip_hash: ipHash,
          play_count: 0,
          like_count: 0,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Database error:', dbError);
        // データベースエラーでも音声はアップロード済みなので、URLは返す
        return NextResponse.json({
          id: 'temp-' + Date.now(),
          title,
          category,
          voice_url: voiceUrl,
          storage_provider: storageProvider,
          created_at: new Date().toISOString(),
        });
      }
      
      return NextResponse.json({
        ...post,
        storage_provider: storageProvider
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload voice' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in voice upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}