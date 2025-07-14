'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Database, Server, HardDrive, Shield, Activity, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

export default function SupabaseAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // データベース統計
      const statsRes = await fetch('/api/admin/supabase/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // ヘルスチェック
      const healthRes = await fetch('/api/admin/supabase/health');
      const healthData = await healthRes.json();
      setHealth(healthData);

      // ストレージ詳細
      const storageRes = await fetch('/api/admin/supabase/storage');
      const storageData = await storageRes.json();
      setStorage(storageData);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('古いデータをクリーンアップしますか？')) return;

    try {
      const res = await fetch('/api/admin/supabase/cleanup', { method: 'POST' });
      const result = await res.json();
      alert(`クリーンアップ完了: ${result.voicePosts}件の音声投稿を削除しました`);
      fetchDashboardData();
    } catch (error) {
      alert('クリーンアップ中にエラーが発生しました');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Database className="h-8 w-8" />
        Supabase管理ダッシュボード
      </h1>

      {/* ヘルスステータス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            システムヘルス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${
              health?.status === 'healthy' ? 'text-green-600' :
              health?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {health?.status === 'healthy' ? '正常' :
               health?.status === 'warning' ? '警告' : 'エラー'}
            </div>
            {health?.issues?.length > 0 && (
              <div className="flex-1">
                <p className="text-sm text-gray-600">検出された問題:</p>
                <ul className="text-sm space-y-1">
                  {health.issues.map((issue: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* データベース統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats || {}).map(([table, count]) => (
          <Card key={table}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{table}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count.toLocaleString()}</div>
              <p className="text-xs text-gray-500">レコード</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ストレージ使用状況 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            ストレージ使用状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(storage || {}).map(([bucket, details]: [string, any]) => (
              <div key={bucket} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{bucket}</h4>
                    <p className="text-sm text-gray-600">
                      {details.fileCount} ファイル / {formatBytes(details.totalSize)}
                    </p>
                  </div>
                  {details.largestFile?.name && (
                    <div className="text-right text-sm">
                      <p className="text-gray-600">最大ファイル:</p>
                      <p className="font-mono text-xs">{details.largestFile.name}</p>
                      <p className="text-gray-500">{formatBytes(details.largestFile.size)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* アクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            管理アクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={runCleanup}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              古いデータをクリーンアップ
            </button>
            <button
              onClick={() => window.open('https://app.supabase.com/project/' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1])}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Supabaseダッシュボードを開く
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 推奨事項 */}
      {health?.recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>推奨事項</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}