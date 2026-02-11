# ブラウザのキャッシュクリア方法

## 推奨: スーパーリロード（キャッシュを無視して再読み込み）

### Chrome / Edge
- macOS: `Command + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

### Firefox
- macOS: `Command + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

### Safari
- macOS: `Command + Option + R`

## 確認方法

1. ブラウザで http://localhost:8000/index.html を開く
2. F12キーを押して開発者ツールを開く
3. Consoleタブを選択
4. 上記のスーパーリロードを実行
5. 「App初期化完了」というログが表示されることを確認
6. ステップを保存後、「ステップ更新」または「ステップ削除」ボタンをクリック
7. コンソールに詳細なログが表示されるか確認
