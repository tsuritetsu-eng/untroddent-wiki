# アントロデン攻略AIの設定

## 追加されたもの

`index.html` に左上の「AI攻略チャット」ボタンとチャット画面を追加しました。ブラウザからNVIDIA APIを直接呼ばず、`window.UNTRODDENT_AI_ENDPOINT`で指定したサーバー側APIへ質問を送ります。APIキーはHTMLへ保存しません。

## NVIDIA Buildで確認すること

1. [NVIDIA Build](https://build.nvidia.com/)でログインする。
2. 使用モデルのページを開き、Model IDを確認する。既定値は `nvidia/nemotron-3-super-120b-a12b` です。
3. [API Keys](https://build.nvidia.com/settings/api-keys)でAPIキーを発行する。
4. APIキーはサーバー側の秘密情報 `NVIDIA_API_KEY` として登録する。

## API中継サーバーの例（Cloudflare Workers）

`api/worker.js` はCloudflare Workers用の中継サーバーです。CloudflareのWorkerを作成し、ファイルをデプロイした後、Secretsに次を登録します。

- `NVIDIA_API_KEY`: NVIDIA Buildで発行したキー
- `NVIDIA_MODEL`: 任意。未設定なら `nvidia/nemotron-3-super-120b-a12b`
- `ALLOWED_ORIGIN`: `https://tsuritetsu-eng.github.io`

Workerの公開URLを、index.htmlの `</head>` より前などに次の設定として追加してください。

```html
<script>window.UNTRODDENT_AI_ENDPOINT = "https://あなたのworker.example.workers.dev";</script>
```

設定後に質問を送信し、回答が返ることを確認します。Worker側でWiki本文を参照させる場合は、後からWikiデータのJSONを取得してプロンプトへ追加できます。現時点では、モデルが持つ知識だけで断定しないよう安全側の指示を設定しています。

## GitHub Pages

`index.html` を `main` ブランチへpushすれば、既存のGitHub Pages設定で公開されます。GitHubリポジトリの **Settings → Pages** で、Sourceが `Deploy from a branch`、Branchが `main` / `/ (root)` になっていることを確認してください。

## 注意

NVIDIA APIキーやGitHubトークンを `index.html`、公開JavaScript、GitHub PagesのHTMLに記載しないでください。APIキーが未設定の場合、画面にはサーバー側API URL未設定のエラーが表示されます。
