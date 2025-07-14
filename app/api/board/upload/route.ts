import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { uploadImageDual, getDefaultStorageProvider } from '@/lib/storage/dual-storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const postId = formData.get('post_id') as string;
    const storageProvider = (formData.get('storage_provider') as string) || getDefaultStorageProvider();
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (files.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 images allowed' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient();
    const uploadedImages = [];
    
    for (const file of files) {
      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
      
      // ファイルタイプチェック
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File ${file.name} has invalid type` },
          { status: 400 }
        );
      }
      
      try {
        // デュアルストレージアップロード
        const uploadResult = await uploadImageDual(
          file, 
          postId || nanoid(),
          'supabase'
        );
        
        // 使用するURLを決定
        const imageUrl = uploadResult.url;
        const thumbnailUrl = uploadResult.thumbnailUrl;
        
        if (!imageUrl) {
          throw new Error('Failed to get image URL from storage');
        }
        
        // データベースに保存
        if (postId) {
          const insertData = {
            post_id: postId,
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
            file_size: file.size,
            mime_type: file.type,
            display_order: uploadedImages.length,
            storage_provider: 'supabase',
          };
          
          const { data: imageRecord, error: dbError } = await supabase
            .from('board_post_images')
            .insert(insertData)
            .select()
            .single();
          
          if (dbError) {
            console.error('Database error:', dbError);
            // エラー時はデータベースエラーは無視して続行
            uploadedImages.push({
              image_url: imageUrl,
              thumbnail_url: thumbnailUrl,
              file_size: file.size,
              mime_type: file.type,
              storage_provider: storageProvider,
            });
          } else {
            uploadedImages.push(imageRecord);
          }
        } else {
          uploadedImages.push({
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
            file_size: file.size,
            mime_type: file.type,
            storage_provider: storageProvider,
          });
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ 
      images: uploadedImages,
      storage_provider: storageProvider 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}