import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGIN", "https://tsuritetsu-eng.github.io"))

MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-super-120b-a12b")


def get_client():
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise RuntimeError("NVIDIA_API_KEY environment variable is not set")
    return OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
    )


SYSTEM_PROMPT = """あなたはアントロデン攻略Wiki専用のAIアシスタントです。
Wikiに関する質問へ、日本語で初心者にも分かりやすく回答してください。
Wikiにない情報は推測せず、「現在のWiki情報では確認できません」と答えてください。
回答は結論を先に、必要なら攻略のポイントを続けてください。"""


@app.post("/api/ask")
def ask():
    body = request.get_json(silent=True) or {}
    question = str(body.get("question", "")).strip()
    wiki_context = str(body.get("wikiContext", ""))[:18000]

    if not question or len(question) > 1000:
        return jsonify(error="質問は1〜1000文字で入力してください。"), 400

    try:
        completion = get_client().chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT + "\n\n【現在のWiki本文】\n" + wiki_context,
                },
                {"role": "user", "content": question},
            ],
            temperature=0.3,
            top_p=0.95,
            max_tokens=1200,
            extra_body={"chat_template_kwargs": {"enable_thinking": True}},
            stream=True,
        )
        answer_parts = []
        for chunk in completion:
            if not chunk.choices:
                continue
            content = getattr(chunk.choices[0].delta, "content", None)
            if content:
                answer_parts.append(content)
        return jsonify(answer="".join(answer_parts))
    except Exception as exc:
        app.logger.exception("NVIDIA API request failed")
        return jsonify(error="NVIDIA APIへの接続に失敗しました。", detail=str(exc)), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
