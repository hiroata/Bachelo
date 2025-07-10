import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const postId = formData.get('post_id') as string;
    
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
      
      // ファイル名生成
      const fileExt = file.name.split('.').pop();
      const fileName = `board/${nanoid()}.${fileExt}`;
      
      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        );
      }
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      // データベースに保存
      if (postId) {
        const insertData: any = {
            post_id: postId,
            image_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            display_order: uploadedImages.length,
          };
        
        const { data: imageRecord, error: dbError } = await supabase
          .from('board_post_images')
          .insert(insertData)
          .select()
          .single();
        
        if (dbError) {
          console.error('Database error:', dbError);
          // アップロードした画像を削除
          await supabase.storage.from('images').remove([fileName]);
          return NextResponse.json(
            { error: 'Failed to save image record' },
            { status: 500 }
          );
        }
        
        uploadedImages.push(imageRecord);
      } else {
        uploadedImages.push({
          image_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
        });
      }
    }
    
    return NextResponse.json({ images: uploadedImages });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}