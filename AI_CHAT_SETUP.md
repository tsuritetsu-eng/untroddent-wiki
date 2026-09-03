# アントロデン攻略AIの設定

## 追加されたもの

`index.html` に左上の「AI攻略チャット」ボタンとチャット画面を追加しました。ブラウザからNVIDIA APIを直接呼ばず、`window.UNTRODDENT_AI_ENDPOINT`で指定したサーバー側APIへ質問を送ります。APIキーはHTMLへ保存しません。

Python版の中継APIは `api/server.py` です。提示されたNVIDIA Buildのストリーミング方式を使い、APIキーは環境変数から読み込みます。

## NVIDIA APIキーについて

今回のメッセージにAPIキーが平文で含まれているため、そのキーは**漏えいしたものとして直ちにNVIDIA Buildで無効化し、新しいキーを発行**してください。新しいキーをソースコード、GitHub、ブラウザ側JavaScriptへ書き込まないでください。

## Python APIの起動

リポジトリのルートで次を実行します。

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r api/requirements.txt
export NVIDIA_API_KEY='NVIDIA Buildで再発行したキー'
export ALLOWED_ORIGIN='https://tsuritetsu-eng.github.io'
python api/server.py
```

Windows PowerShellの場合は次のようにします。

```powershell
$env:NVIDIA_API_KEY = "NVIDIA Buildで再発行したキー"
$env:ALLOWED_ORIGIN = "https://tsuritetsu-eng.github.io"
python api/server.py
```

既定のモデルは `nvidia/nemotron-3-super-120b-a12b` です。変更する場合は次の環境変数を設定します。

```bash
export NVIDIA_MODEL='nvidia/nemotron-3-super-120b-a12b'
```

公開サーバーへデプロイした後、公開されたAPI URLを `index.html` のAIチャット設定に登録します。

```html
<script>
  window.UNTRODDENT_AI_ENDPOINT = "https://あなたのAPI.example.com/api/ask";
</script>
```

この設定はGitHub Pagesへpushする前に追加してください。APIサーバーはHTTPSで公開し、環境変数として `NVIDIA_API_KEY` を登録します。

## 注意

GitHub Pagesは静的サイトなので、Python Flaskサーバー自体をGitHub Pagesで実行することはできません。GitHub Pagesには画面を置き、Python APIはRender、Railway、Fly.io、Cloud Runなどのサーバー環境へ別途デプロイしてください。

APIキーやGitHubトークンを `index.html`、公開JavaScript、GitHub PagesのHTMLに記載しないでください。
