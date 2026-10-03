// Netlify Function: keeps the Groq key on the server (set GROQ_API_KEY in Netlify env vars)
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const need = process.env.SITE_CODE;
  if (need && req.headers.get("x-team-code") !== need) return new Response("Unauthorized", { status: 401 });
  if (!process.env.GROQ_API_KEY) return new Response("Missing GROQ_API_KEY", { status: 500 });
  let b; try { b = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }
  if (!Array.isArray(b.messages) || b.messages.length > 40) return new Response("Bad request", { status: 400 });
  const body = { model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", messages: b.messages, max_tokens: 3500 };
  if (b.tools && b.tools.length) body.tools = b.tools;
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.GROQ_API_KEY },
    body: JSON.stringify(body),
  });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
};
