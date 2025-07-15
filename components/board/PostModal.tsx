'use client';

import { useState, useRef } from 'react';
import { BoardCategory } from '@/types/board';
import { toast } from 'react-hot-toast';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import StorageProviderSelector, { StorageProvider } from './StorageProviderSelector';
import AIAssistPanel from '@/components/ai/AIAssistPanel';

interface PostModalProps {
  categories: BoardCategory[];
  onClose: () => void;
  onSuccess: () => void;
  defaultTitle?: string;
}

export default function PostModal({
  categories,
  onClose,
  onSuccess,
  defaultTitle = '',
}: PostModalProps) {
  const [formData, setFormData] = useState({
    category_id: categories[0]?.id || '',
    author_name: '',
    author_email: '',
    title: defaultTitle,
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [storageProvider, setStorageProvider] = useState<StorageProvider>('both');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像選択処理
  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      
      if (!isValid) {
        toast.error(`${file.name}は画像ファイルではありません`);
      }
      if (!isUnder5MB) {
        toast.error(`${file.name}は5MBを超えています`);
      }
      
      return isValid && isUnder5MB;
    });

    // 最大4枚まで
    const remainingSlots = 4 - selectedImages.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (validFiles.length > remainingSlots) {
      toast.error('画像は最大4枚までです');
    }

    // プレビュー生成
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...filesToAdd]);
  };

  // 画像削除処理
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // まず投稿を作成
      const response = await fetch('/api/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const post = await response.json();

      // 画像がある場合はアップロード
      if (selectedImages.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('post_id', post.id);
        uploadFormData.append('storage_provider', storageProvider);
        selectedImages.forEach(image => {
          uploadFormData.append('files', image);
        });

        const uploadResponse = await fetch('/api/board/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          console.error('画像のアップロードに失敗しました');
          // 画像アップロードが失敗しても投稿自体は成功しているので続行
        }
      }

      toast.success('投稿が作成されました');
      
      // ポイントを付与
      const userId = localStorage.getItem('user_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', userId);
      
      try {
        await fetch('/api/user/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'post',
            referenceId: post.id
          })
        });
      } catch (error) {
        console.error('Failed to add points:', error);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-pink-500 text-white p-3 rounded-t-lg">
          <h2 className="text-xl font-bold">投稿フォーム</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold w-32">名前</td>
                <td className="py-3">
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="px-3 py-2 border rounded w-full max-w-xs"
                    required
                    maxLength={100}
                    style={{ backgroundColor: '#FFE4E1' }}
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold">E-mail</td>
                <td className="py-3">
                  <input
                    type="text"
                    value={formData.author_email}
                    onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                    className="px-3 py-2 border rounded w-full max-w-xs"
                    placeholder="sage"
                    maxLength={255}
                    style={{ backgroundColor: '#FFE4E1' }}
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold">題名</td>
                <td className="py-3">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="px-3 py-2 border rounded w-full"
                    required
                    maxLength={200}
                    style={{ backgroundColor: '#FFE4E1' }}
                  />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold">カテゴリー</td>
                <td className="py-3">
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="px-3 py-2 border rounded"
                    style={{ backgroundColor: '#FFE4E1' }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ${category.name}` : category.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold align-top">内容</td>
                <td className="py-3">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="px-3 py-2 border rounded w-full"
                    rows={10}
                    required
                    style={{ backgroundColor: '#FFE4E1' }}
                  />
                  
                  {/* AIアシストパネル */}
                  <div className="mt-4">
                    <AIAssistPanel
                      onTextGenerated={(text) => {
                        setFormData(prev => ({
                          ...prev,
                          content: prev.content + '\n\n' + text
                        }));
                      }}
                      onImageGenerated={(images) => {
                        handleImageSelect(images as any);
                      }}
                      initialPrompt={formData.title}
                      category={categories.find(c => c.id === formData.category_id)?.name || ''}
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold align-top">画像</td>
                <td className="py-3">
                  {/* ドラッグ&ドロップエリア */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 mb-2">
                      画像をドラッグ&ドロップ または
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 transition"
                    >
                      ファイルを選択
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      最大4枚まで、各5MB以下
                    </p>
                  </div>

                  {/* 画像プレビュー */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            {selectedImages[index]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 text-right font-bold">保存先</td>
                <td className="py-3">
                  <StorageProviderSelector
                    value={storageProvider}
                    onChange={setStorageProvider}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 font-bold"
              disabled={loading}
            >
              {loading ? '投稿中...' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}