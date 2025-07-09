'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BoardPost, BoardReply } from '@/types/board';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/board/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>;
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-8">投稿が見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* パンくずリスト */}
      <div className="mb-4 text-sm">
        <Link href="/board" className="text-pink-500 hover:underline">
          掲示板
        </Link>
        {' > '}
        <Link
          href={`/board?category=${post.category?.id}`}
          className="text-pink-500 hover:underline"
        >
          {post.category?.name}
        </Link>
        {' > '}
        <span>{post.title}</span>
      </div>

      {/* 投稿本文 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {post.is_pinned && <span className="text-red-500 mr-2">📌</span>}
          {post.title}
        </h1>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 mb-4">
          <span>投稿者: {post.author_name}</span>
          <span>投稿日: {new Date(post.created_at).toLocaleString()}</span>
          <span>閲覧数: {post.view_count}</span>
        </div>

        <div
          className="prose dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 画像 */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {post.images.map((image) => (
              <a
                key={image.id}
                href={image.image_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={image.image_url}
                  alt=""
                  className="w-full h-40 object-cover rounded hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => {
              setShowReplyForm(true);
              setReplyingTo(null);
            }}
            className="bg-pink-500 hover:bg-pink-600"
          >
            返信する
          </Button>
        </div>
      </div>

      {/* 返信一覧 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          返信 ({Array.isArray(post.replies) ? post.replies.length : 0}件)
        </h2>
        
        {Array.isArray(post.replies) && post.replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            onReply={(replyId) => {
              setShowReplyForm(true);
              setReplyingTo(replyId);
            }}
          />
        ))}
      </div>

      {/* 返信フォーム */}
      {showReplyForm && (
        <ReplyForm
          postId={postId}
          parentReplyId={replyingTo}
          onClose={() => {
            setShowReplyForm(false);
            setReplyingTo(null);
          }}
          onSuccess={() => {
            setShowReplyForm(false);
            setReplyingTo(null);
            fetchPost();
          }}
        />
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  onReply,
  depth = 0,
}: {
  reply: BoardReply;
  onReply: (replyId: string) => void;
  depth?: number;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
        depth > 0 ? 'ml-8' : ''
      }`}
    >
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 mb-2">
        <span>投稿者: {reply.author_name}</span>
        <span>{new Date(reply.created_at).toLocaleString()}</span>
      </div>
      
      <div
        className="prose dark:prose-invert max-w-none mb-2"
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => onReply(reply.id)}
      >
        返信
      </Button>

      {/* 子返信 */}
      {Array.isArray(reply.replies) && reply.replies.map((childReply) => (
        <ReplyItem
          key={childReply.id}
          reply={childReply}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function ReplyForm({
  postId,
  parentReplyId,
  onClose,
  onSuccess,
}: {
  postId: string;
  parentReplyId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/board/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          parent_reply_id: parentReplyId,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reply');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('返信の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">返信を投稿</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">名前</label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full p-2 border rounded"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス（任意）</label>
            <input
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">本文</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border rounded"
              rows={6}
              required
              maxLength={5000}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? '投稿中...' : '投稿する'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}