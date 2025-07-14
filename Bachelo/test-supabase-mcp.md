# Supabase MCP接続テスト

Claude CodeにSupabaseのMCPサーバーを設定しました。

## 設定内容
- **サーバー名**: supabase
- **プロジェクトID**: dleqvbspjouczytoukctv
- **モード**: 読み取り専用（--read-only）
- **アクセストークン**: 設定済み

## 接続確認方法

MCPリソースを使用してSupabaseに接続できるか確認するには、AIアシスタントに以下のようなリクエストをしてください：

1. `@supabase` を使ってデータベーススキーマを確認
2. テーブル一覧の取得
3. 特定のテーブルの構造確認

## 設定コマンド

実行したコマンド：
```bash
claude mcp add-json supabase '{"command": "npx", "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=dleqvbspjouczytoukctv"], "env": {"SUPABASE_ACCESS_TOKEN": "sbp_d9a22e7fda2368820cfe1eb59fc78507ae8697e1"}}'
```

## Cursorとの違い

Claude Codeの利点：
- 環境変数を直接設定可能（バッチファイル不要）
- JSONで完全な設定を一度に投入可能
- CLIでシンプルに管理

## トラブルシューティング

もし接続できない場合：
1. `claude mcp list` で設定を確認
2. `claude mcp remove supabase` で一度削除
3. 上記のコマンドで再設定

設定が完了しました！