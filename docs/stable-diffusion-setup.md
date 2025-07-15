# Stable Diffusion WebUI セットアップガイド

## 1. WebUIの起動設定

`D:\AI\Programs\stable-diffusion-webui\webui-user.bat` を編集して、以下の設定を確認してください：

```batch
@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--api --cors-allow-origins=http://localhost:3000,http://127.0.0.1:3000

call webui.bat
```

### 重要な設定:
- `--api`: API機能を有効にする（必須）
- `--cors-allow-origins`: Next.jsアプリからのアクセスを許可

## 2. その他の推奨オプション

必要に応じて以下のオプションも追加できます：

```batch
set COMMANDLINE_ARGS=--api --cors-allow-origins=* --xformers --no-half-vae --enable-insecure-extension-access
```

- `--xformers`: メモリ効率を改善
- `--no-half-vae`: VAEの精度を向上
- `--enable-insecure-extension-access`: 拡張機能へのアクセスを許可

## 3. 起動確認

1. `webui-user.bat`を実行
2. ブラウザで http://127.0.0.1:7860 にアクセスしてWebUIが表示されることを確認
3. http://127.0.0.1:7860/docs にアクセスしてAPI documentationが表示されることを確認

## 4. トラブルシューティング

### 接続できない場合:
1. ファイアウォールでポート7860が開いているか確認
2. Windows Defenderで通信がブロックされていないか確認
3. `--listen`オプションを追加して全IPからのアクセスを許可（セキュリティ注意）

### CORSエラーが出る場合:
```batch
set COMMANDLINE_ARGS=--api --cors-allow-origins=*
```
※本番環境では適切なオリジンを指定してください

## 5. 推奨モデル

エロティック画像生成に適したモデル：
- Realistic Vision
- ChilloutMix
- MeinaMix
- AnyLoRA

これらのモデルは Civitai などからダウンロードして、`models/Stable-diffusion/`フォルダに配置してください。