'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BoardPost, BoardReply, CreateBoardReplyInput } from '@/types/board';
import ReplyModal from '@/components/board/ReplyModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LiveChatWidget from '@/components/chat/LiveChatWidget';
import ReactionBar from '@/components/board/ReactionBar';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<BoardPost | null>(null);
  const [replies, setReplies] = useState<BoardReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [userId] = useState(() => {
    // 匿名ユーザーIDの生成・取得
    if (typeof window !== 'undefined') {
      let storedUserId = localStorage.getItem('user_id');
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_id', storedUserId);
      }
      return storedUserId;
    }
    return 'user_temp';
  });

  const fetchPostDetails = useCallback(async () => {
    setLoading(true);
    try {
      // モックポストの場合は404ページへリダイレクト
      if (postId.startsWith('mock-')) {
        toast.error('この投稿はサンプルデータです');
        router.push('/board/categories');
        return;
      }
      
      const response = await fetch(`/api/board/posts/${postId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('投稿が見つかりません');
          router.push('/board/categories');
          return;
        }
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data.post || data);
      setReplies(data.replies || []);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('投稿の取得に失敗しました');
      router.push('/board/categories');
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId, fetchPostDetails]);

  const handleReplySubmit = async (replyData: Omit<CreateBoardReplyInput, 'post_id'>) => {
    try {
      const response = await fetch('/api/board/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...replyData,
          post_id: postId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }

      setShowReplyForm(false);
      fetchPostDetails();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('返信の投稿に失敗しました');
    }
  };

  const handleVote = async (voteType: 'plus' | 'minus') => {
    if (voting) return;
    
    setVoting(true);
    try {
      const response = await fetch(`/api/board/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      setPost(prev => prev ? {
        ...prev,
        plus_count: data.plus_count,
        minus_count: data.minus_count
      } : null);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleReplyVote = async (replyId: string, voteType: 'plus' | 'minus') => {
    if (voting) return;
    
    setVoting(true);
    try {
      const response = await fetch(`/api/board/replies/${replyId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote on reply');
      }

      const data = await response.json();
      setReplies(prev => prev.map(reply => 
        reply.id === replyId 
          ? { ...reply, plus_count: data.plus_count, minus_count: data.minus_count }
          : reply
      ));
    } catch (error) {
      console.error('Error voting on reply:', error);
    } finally {
      setVoting(false);
    }
  };

  // 投稿が削除可能かチェック（30分以内）
  const canDeletePost = () => {
    if (!post) return false;
    const createdAt = new Date(post.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffMinutes <= 30;
  };

  // 投稿削除処理
  const handleDeletePost = async () => {
    setDeletingPost(true);
    try {
      const response = await fetch(`/api/board/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      toast.success('投稿を削除しました');
      setShowDeleteDialog(false);
      // 掲示板一覧に戻る
      router.push('/board');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setDeletingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#E8E8E8' }}>
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-8">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#E8E8E8' }}>
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-8">投稿が見つかりません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E8E8' }}>
      <div className="flex gap-6 py-4" style={{ paddingLeft: '200px', paddingRight: '200px' }}>
        {/* メインコンテンツ */}
        <div className="flex-[7] bg-white rounded">
          <div className="p-4">
            {/* パンくずリスト */}
            <div className="text-sm mb-4">
              <Link href="/board" className="text-blue-600 hover:underline">掲示板</Link>
              {' > '}
              {post.category && (
                <>
                  <Link href={`/board?category=${post.category.id}`} className="text-blue-600 hover:underline">
                    {post.category.name}
                  </Link>
                  {' > '}
                </>
              )}
              <span className="text-gray-600">{post.title}</span>
            </div>

            {/* スレッドタイトル */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h1 className="text-2xl font-bold">
                {post.is_pinned && <span className="text-red-500 mr-2">📌</span>}
                {post.title}
              </h1>
              {canDeletePost() && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              )}
            </div>

            {/* 最初の投稿 */}
            <div className="mb-6">
              {/* 投稿ヘッダー */}
              <div className="text-sm text-gray-500 mb-3">
                <span className="mr-2 font-normal">1</span>
                <span className="mr-2">管理人</span>
                <span className="mr-2">{new Date(post.created_at).toLocaleString('ja-JP', { 
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }).replace(/\//g, '/')}</span>
                <span className="text-gray-400">[通報]</span>
              </div>
              
              {/* 投稿タイトル（最初の投稿のみ） */}
              <h2 className="text-xl font-bold text-pink-500 mb-3">
                {post.title}
              </h2>
              
              
              {/* 投稿内容 */}
              <div className={`whitespace-pre-wrap break-all mb-2 ${
                  (post.plus_count || 0) > 0 && 
                  (post.plus_count || 0) / ((post.plus_count || 0) + (post.minus_count || 0)) > 0.7
                    ? 'text-pink-500 text-lg font-bold'
                    : 'text-black'
              }`}>
                {post.content}
              </div>
              
              {/* 返信数バッジ */}
              <div className="mb-4">
                <div className="relative inline-block">
                  <div className="bg-pink-400 text-white px-3 py-1 text-sm rounded">
                    <span className="font-bold">💬 {replies.length}件の返信</span>
                  </div>
                  <div className="absolute -bottom-2 left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-400"></div>
                </div>
              </div>
              
              {/* 画像 */}
              {post.images && post.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {post.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.thumbnail_url || image.image_url}
                      alt=""
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => window.open(image.image_url, '_blank')}
                    />
                  ))}
                </div>
              )}
              
              {/* リアクションバー */}
              <div className="mb-4">
                <ReactionBar
                  postId={postId}
                  userId={userId}
                  showLabels={true}
                  className="border-t pt-4"
                />
              </div>

              {/* 従来の投票システム */}
              <div className="flex justify-end">
                <div className="flex items-center gap-4">
                  <span className="text-pink-500 font-bold">
                    +{post.plus_count || 0}
                  </span>
                  <button
                    onClick={() => handleVote('plus')}
                    className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded flex items-center justify-center transition-colors text-lg font-bold"
                    disabled={voting}
                  >
                    +
                  </button>
                  
                  <div className="w-80 h-6 bg-gray-200 rounded overflow-hidden relative">
                    {(post.plus_count || 0) + (post.minus_count || 0) > 0 ? (
                      <>
                        <div 
                          className="h-full bg-pink-400 absolute left-0 top-0 transition-all duration-300"
                          style={{
                            width: `${((post.plus_count || 0) / ((post.plus_count || 0) + (post.minus_count || 0))) * 100}%`
                          }}
                        />
                      </>
                    ) : (
                      <div className="h-full bg-gray-200" />
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleVote('minus')}
                    className="w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center justify-center transition-colors text-lg font-bold"
                    disabled={voting}
                  >
                    −
                  </button>
                  <span className="text-gray-600 font-bold">
                    -{post.minus_count || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* 返信一覧 */}
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <div key={reply.id} className="border-b pb-4">
                  {/* 返信ヘッダー */}
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="mr-2 font-normal">{index + 2}</span>
                    <span className="mr-2">匿名</span>
                    <span className="mr-2">{new Date(reply.created_at).toLocaleString('ja-JP', { 
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }).replace(/\//g, '/')}</span>
                    <span className="text-gray-400">[通報]</span>
                  </div>
                  
                  {/* 返信内容 */}
                  <div className="mb-3">
                    <div className={`whitespace-pre-wrap break-all ${
                        (reply.plus_count || 0) > 0 && 
                        (reply.plus_count || 0) / ((reply.plus_count || 0) + (reply.minus_count || 0)) > 0.7
                          ? 'text-pink-500 text-lg font-bold'
                          : 'text-gray-800'
                    }`}>
                      {reply.content}
                    </div>
                    {/* 返信数バッジ */}
                    {reply.replies && reply.replies.length > 0 && (
                      <div className="mt-2">
                        <div className="relative inline-block">
                          <div className="bg-pink-400 text-white px-3 py-1 text-sm rounded">
                            <span className="font-bold">💬 {reply.replies.length}件の返信</span>
                          </div>
                          <div className="absolute -bottom-2 left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-400"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 返信用リアクションバー */}
                  <div className="mb-3">
                    <ReactionBar
                      replyId={reply.id}
                      userId={userId}
                      className="border-t pt-2"
                    />
                  </div>
                  
                  {/* 返信の投票システム */}
                  <div className="flex justify-end">
                    <div className="flex items-center gap-4">
                      <span className="text-pink-500 font-bold">
                        +{reply.plus_count || 0}
                      </span>
                      <button
                        onClick={() => handleReplyVote(reply.id, 'plus')}
                        className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded flex items-center justify-center transition-colors text-lg font-bold"
                        disabled={voting}
                      >
                        +
                      </button>
                      
                      <div className="w-80 h-6 bg-gray-200 rounded overflow-hidden relative">
                        {(reply.plus_count || 0) + (reply.minus_count || 0) > 0 ? (
                          <>
                            <div 
                              className="h-full bg-pink-400 absolute left-0 top-0 transition-all duration-300"
                              style={{
                                width: `${((reply.plus_count || 0) / ((reply.plus_count || 0) + (reply.minus_count || 0))) * 100}%`
                              }}
                            />
                          </>
                        ) : (
                          <div className="h-full bg-gray-200" />
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleReplyVote(reply.id, 'minus')}
                        className="w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center justify-center transition-colors text-lg font-bold"
                        disabled={voting}
                      >
                        −
                      </button>
                      <span className="text-gray-600 font-bold">
                        -{reply.minus_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 返信ボタン */}
            <div className="text-center mt-8 mb-4">
              <button
                onClick={() => setShowReplyForm(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded"
              >
                返信する
              </button>
            </div>

            {/* レス削除依頼 */}
            <div className="text-center text-sm text-gray-500 mb-4">
              レスの削除依頼は、レス番号をクリックして下さい
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="flex-[3] bg-gray-50">
          <div className="p-4">
            <div className="bg-gray-700 text-white p-3 rounded-t">
              <h3 className="font-bold">その他の新着投稿</h3>
            </div>
            <div className="bg-white rounded-b shadow p-4">
              <p className="text-gray-500 text-center py-8">関連投稿を表示予定</p>
            </div>
          </div>
        </div>
      </div>

      {/* 返信フォームモーダル */}
      {showReplyForm && (
        <ReplyModal
          onClose={() => setShowReplyForm(false)}
          onSubmit={handleReplySubmit}
        />
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePost}
        title="投稿を削除"
        message="この投稿を削除してもよろしいですか？削除後は元に戻せません。"
        confirmText="削除"
        cancelText="キャンセル"
        isLoading={deletingPost}
      />

      {/* ライブチャット */}
      <LiveChatWidget postId={postId} />
    </div>
  );
}