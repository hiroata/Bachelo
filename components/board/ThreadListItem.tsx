'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Thread {
  id: string;
  thread_number: number;
  title: string;
  post_count: number;
  last_post_at: string;
  created_at: string;
  author_name: string;
  board_slug: string;
}

interface ThreadListItemProps {
  thread: Thread;
  index: number;
}

export default function ThreadListItem({ thread, index }: ThreadListItemProps) {
  // スレッドの勢いを計算
  const calculateSpeed = () => {
    const now = new Date();
    const created = new Date(thread.created_at);
    const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const speed = thread.post_count / Math.max(hours, 1);
    return Math.round(speed * 24); // レス/日
  };

  // スレッドの状態を判定
  const getThreadStatus = () => {
    if (thread.post_count >= 1000) return { text: '1000', class: 'text-red-600 font-bold' };
    if (thread.post_count >= 900) return { text: `${thread.post_count}`, class: 'text-orange-600 font-bold' };
    if (thread.post_count >= 500) return { text: `${thread.post_count}`, class: 'text-yellow-600' };
    return { text: `${thread.post_count}`, class: 'text-gray-600' };
  };

  const status = getThreadStatus();
  const speed = calculateSpeed();

  return (
    <div className="flex items-center py-2 px-4 hover:bg-gray-50 border-b border-gray-200">
      {/* 順位 */}
      <div className="w-12 text-center text-gray-500 font-mono">
        {index + 1}
      </div>

      {/* スレタイトル */}
      <div className="flex-1 px-4">
        <Link 
          href={`/test/read/${thread.board_slug}/${thread.thread_number}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {thread.title}
        </Link>
        <span className="text-gray-500 text-sm ml-2">
          ({thread.post_count})
        </span>
      </div>

      {/* レス数 */}
      <div className={`w-16 text-center ${status.class}`}>
        {status.text}
      </div>

      {/* 勢い */}
      <div className="w-20 text-center text-gray-600">
        {speed > 100 ? (
          <span className="text-red-500 font-bold">{speed}</span>
        ) : speed > 50 ? (
          <span className="text-orange-500">{speed}</span>
        ) : (
          <span>{speed}</span>
        )}
      </div>

      {/* 最終更新 */}
      <div className="w-32 text-right text-gray-500 text-sm">
        {formatDistanceToNow(new Date(thread.last_post_at), {
          addSuffix: true,
          locale: ja
        })}
      </div>
    </div>
  );
}