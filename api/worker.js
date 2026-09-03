const SYSTEM_PROMPT = `あなたはアントロデン攻略Wiki専用のAIアシスタントです。
Wikiに関する質問へ、日本語で初心者にも分かりやすく回答してください。
Wikiにない情報は推測せず、「現在のWiki情報では確認できません」と答えてください。
回答は結論を先に、必要なら攻略のポイントを続けてください。`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "https://tsuritetsu-eng.github.io",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    try {
      const body = await request.json();
      const question = String(body.question || "").trim();
      const wikiContext = String(body.wikiContext || "").slice(0, 18000);
      if (!question || question.length > 1000) return json({ error: "質問は1〜1000文字で入力してください。" }, 400, cors);
      const upstream = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
          messages: [{ role: "system", content: SYSTEM_PROMPT + "\n\n【現在のWiki本文】\n" + wikiContext }, { role: "user", content: question }],
          temperature: 0.3,
          top_p: 0.95,
          max_tokens: 1200,
          extra_body: { chat_template_kwargs: { enable_thinking: true } },
          stream: false
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return json({ error: "NVIDIA API error", detail: data }, upstream.status, cors);
      return json({ answer: data.choices?.[0]?.message?.content || "回答を取得できませんでした。" }, 200, cors);
    } catch (e) {
      return json({ error: "リクエストを処理できませんでした。" }, 500, cors);
    }
  }
};
function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json" } }); }
