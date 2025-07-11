'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, TrendingUp, Clock, Plus, Search, Crown, Heart } from 'lucide-react';
import { Thread, Board } from '@/types/5ch';

interface ThreadWithStats extends Thread {
  first_post?: {
    author_name: string;
    content: string;
  };
  speed: number;
  plus_votes?: number;
  minus_votes?: number;
  boardSlug?: string;
}

export default function GirlsChannelPage() {
  const [threads, setThreads] = useState<ThreadWithStats[]>([]);
  const [selectedTab, setSelectedTab] = useState<'hot' | 'new'>('hot');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, [selectedTab]);

  const fetchThreads = async () => {
    try {
      // 複数の板から人気スレッドを取得
      const boards = ['love', 'fashion', 'food', 'job', 'health'];
      const allThreads: ThreadWithStats[] = [];

      for (const boardSlug of boards) {
        const response = await fetch(`/api/boards/${boardSlug}/threads?per_page=10`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Board ${boardSlug} threads:`, data.threads?.length || 0);
          const threadsWithBoard = (data.threads || []).map((thread: ThreadWithStats) => ({
            ...thread,
            boardSlug // 板のslugを保存
          }));
          allThreads.push(...threadsWithBoard);
        } else {
          console.error(`Failed to fetch threads for ${boardSlug}:`, response.status);
        }
      }

      // ランダムな投票数を追加（デモ用）
      const threadsWithVotes = allThreads.map(thread => ({
        ...thread,
        plus_votes: Math.floor(Math.random() * 2000) + 100,
        minus_votes: Math.floor(Math.random() * 200) + 10
      }));

      // ソート
      if (selectedTab === 'hot') {
        threadsWithVotes.sort((a, b) => (b.plus_votes! - b.minus_votes!) - (a.plus_votes! - a.minus_votes!));
      } else {
        threadsWithVotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setThreads(threadsWithVotes.slice(0, 20));
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateVotePercentage = (plus: number, minus: number) => {
    const total = plus + minus;
    return total > 0 ? (plus / total) * 100 : 50;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${Math.floor(num / 1000)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef5f7' }}>
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-pink-400 to-pink-500 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">👧</span>
                ガールズちゃんねる
              </h1>
              <nav className="hidden md:flex gap-6">
                <Link href="/girls" className="hover:text-pink-100 transition">
                  トップ
                </Link>
                <Link href="/girls/ranking" className="hover:text-pink-100 transition">
                  ランキング
                </Link>
                <Link href="/girls/new" className="hover:text-pink-100 transition">
                  新着
                </Link>
              </nav>
            </div>
            <button className="bg-white text-pink-500 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition flex items-center gap-2">
              <Plus className="w-5 h-5" />
              トピックを投稿する
            </button>
          </div>
        </div>
      </header>

      {/* サブヘッダー */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <p className="text-pink-500 font-medium">女子の好きな話題で毎日おしゃべり♪</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="トピックを検索"
                  className="pl-10 pr-4 py-2 border border-pink-200 rounded-full text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <main className="flex-1">
            {/* タブ */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex">
                <button
                  onClick={() => setSelectedTab('hot')}
                  className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
                    selectedTab === 'hot'
                      ? 'text-pink-500 border-b-3 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  今日の人気トピック
                </button>
                <button
                  onClick={() => setSelectedTab('new')}
                  className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
                    selectedTab === 'new'
                      ? 'text-pink-500 border-b-3 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  新着トピック
                </button>
              </div>
            </div>

            {/* トピック一覧 */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {threads.map((thread, index) => (
                  <div key={thread.id} className="topic-card p-4">
                    <div className="flex gap-4">
                      {/* ランキング番号 */}
                      {selectedTab === 'hot' && index < 3 && (
                        <div className="flex-shrink-0">
                          <div className={`ranking-number ${index === 0 ? 'text-lg' : ''}`}>
                            {index + 1}位
                          </div>
                        </div>
                      )}

                      {/* サムネイル */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-3xl">
                            {index % 3 === 0 ? '💕' : index % 3 === 1 ? '👗' : '🍰'}
                          </span>
                        </div>
                      </div>

                      {/* コンテンツ */}
                      <div className="flex-1">
                        <Link
                          href={`/girls/${thread.boardSlug}/${thread.thread_number}`}
                          className="text-lg font-bold text-gray-800 hover:text-pink-500 transition line-clamp-2"
                        >
                          {thread.title}
                        </Link>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {thread.post_count}コメント
                          </span>
                          <span>{new Date(thread.created_at).toLocaleDateString('ja-JP')}前</span>
                        </div>

                        {/* 投票 */}
                        <div className="mt-3">
                          <div className="flex items-center gap-4">
                            <button className="vote-plus-btn">
                              + {formatNumber(thread.plus_votes || 0)}
                            </button>
                            
                            <div className="flex-1 vote-bar">
                              <div 
                                className="vote-bar-fill"
                                style={{ 
                                  width: `${calculateVotePercentage(
                                    thread.plus_votes || 0, 
                                    thread.minus_votes || 0
                                  )}%` 
                                }}
                              />
                            </div>
                            
                            <button className="vote-minus-btn">
                              - {formatNumber(thread.minus_votes || 0)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* サイドバー */}
          <aside className="w-80 hidden lg:block">
            {/* おすすめトピック */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="font-bold text-lg text-pink-500 mb-4">おすすめトピック</h3>
              <div className="space-y-3">
                {[
                  '藤島ジュリー景子氏が告白本で語ったキンプリ分裂の真相',
                  '1歳の娘が母親運転の車にはねられ死亡',
                  'これで子どもが増えるわけがない',
                  '「外国人という弱い者いじめを競っている」',
                  '7月5日が過ぎるまで一緒に頑張ろう'
                ].map((title, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="block text-sm hover:text-pink-500 transition line-clamp-2"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* 関連キーワード */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-lg text-pink-500 mb-4">関連キーワード</h3>
              <div className="flex flex-wrap gap-2">
                {['#劇場', '#実況', '#愛の、がっこう。', '#感想', '#木曜'].map(tag => (
                  <span
                    key={tag}
                    className="topic-tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}