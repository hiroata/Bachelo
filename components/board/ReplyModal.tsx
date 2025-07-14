'use client';

import { useState } from 'react';
import { CreateBoardReplyInput } from '@/types/board';

interface ReplyModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<CreateBoardReplyInput, 'post_id'>) => void;
}

export default function ReplyModal({
  onClose,
  onSubmit,
}: ReplyModalProps) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-pink-500 text-white p-3 rounded-t-lg">
          <h2 className="text-xl font-bold">レス投稿フォーム</h2>
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
              <tr>
                <td className="py-3 pr-4 text-right font-bold align-top">内容</td>
                <td className="py-3">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="px-3 py-2 border rounded w-full"
                    rows={8}
                    required
                    style={{ backgroundColor: '#FFE4E1' }}
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