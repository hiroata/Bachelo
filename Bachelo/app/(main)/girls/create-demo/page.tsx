'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDemoPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const demoThreads = [
    {
      board: 'love',
      title: '【実況・感想】＜木曜劇場＞愛の、がっこう。第1話',
      content: '真面目な高校教師・愛美は、生徒がホストクラブに入り浸っていると聞きJOKERに足を踏み入れた。そこで出会ったのは夜の世界に生きる無学なホスト・カヲルで...',
    },
    {
      board: 'fashion',
      title: '【新宿タワマン殺人・公判】和久井被告(52歳)に懲役17年求刑　キャバ嬢に1600万円を貢ぎ…25歳被害者女性との飽和のLINE文面「結婚するっていうのは？」「うるせぇ、脳内下半身野郎」',
      content: '新宿のタワーマンションで25歳の女性を殺害した罪に問われている52歳の男の裁判で、検察側は懲役17年を求刑しました。',
    },
    {
      board: 'food',
      title: '深夜に独りで寂しくなったら誰かが返事をしてくれるトピpart15',
      content: 'こんな時間に起きてる人いますか？寂しくて眠れません...',
    },
    {
      board: 'job',
      title: 'みんなで楽しむ週末の雑談トピ',
      content: '週末だし楽しく雑談しましょう！今日何してましたか？',
    },
    {
      board: 'health',
      title: '1歳の娘が母親運転の車にはねられ死亡　娘がいると気付かず事故…埼玉',
      content: '埼玉県で痛ましい事故が発生しました。詳細はニュースをご覧ください。',
    }
  ];

  const createDemoThreads = async () => {
    setCreating(true);
    setMessage('デモスレッドを作成中...');

    try {
      let successCount = 0;
      
      for (const thread of demoThreads) {
        const response = await fetch(`/api/boards/${thread.board}/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: thread.title,
            author_name: '名無しさん',
            content: thread.content
          })
        });

        if (response.ok) {
          successCount++;
          setMessage(`${successCount}/${demoThreads.length} スレッドを作成しました`);
          
          // 作成したスレッドにレスを追加
          const data = await response.json();
          const threadUrl = data.url;
          const threadParts = threadUrl.split('/');
          const boardSlug = threadParts[threadParts.length - 2];
          const threadNumber = threadParts[threadParts.length - 1];
          
          // デモレスを追加
          const demoReplies = [
            'こんな脚なげぇホストおるんかいな！',
            '4件の返信',
            '待ってました！',
            'ごめんなさい🙏ラワールに集中したいので、実況には参加しません！'
          ];
          
          for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
            await fetch(`/api/test/read/${boardSlug}/${threadNumber}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author_name: '匿名',
                content: demoReplies[Math.floor(Math.random() * demoReplies.length)]
              })
            });
          }
        }
      }

      setMessage(`完了！${successCount}個のスレッドを作成しました`);
      setTimeout(() => {
        router.push('/girls');
      }, 2000);
    } catch (error) {
      console.error('Error creating demo threads:', error);
      setMessage('エラーが発生しました');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-pink-500 mb-6 text-center">
          デモデータ作成
        </h1>
        
        <p className="text-gray-600 mb-6">
          ガールズちゃんねる風のデモスレッドを作成します。
          これにより、掲示板に5つのサンプルスレッドが追加されます。
        </p>

        {message && (
          <div className="bg-pink-100 text-pink-700 p-4 rounded mb-6">
            {message}
          </div>
        )}

        <button
          onClick={createDemoThreads}
          disabled={creating}
          className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition disabled:opacity-50"
        >
          {creating ? '作成中...' : 'デモスレッドを作成'}
        </button>
      </div>
    </div>
  );
}