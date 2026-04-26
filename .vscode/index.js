export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { content, mode } = await request.json();

      const prompts = {
        "TONE": "You are a quiet, empathetic observer. Read the user's input and provide a one-sentence emotional reflection. Be warm but not cheesy. Example: 'This feels like a question of the heart.'",
        "QUESTION": "You are a thoughtful coach. Based on the user's situation, ask exactly ONE clarifying, open-ended question that helps them see a new angle. Do not give advice.",
        "PATHS": "Generate 3 distinct, neutral reframes for this situation. Format as a JSON array of objects with 'title' and 'description'. Stay neutral—no advice.",
        "DEEP_DIVE": "The user chose a path. Explore the textures and honesty of this specific path for 3-4 paragraphs. Be poetic but grounded.",
        "UNEXPECTED": "Think outside the box. Provide one unconventional, wild-card perspective that the user definitely hasn't considered yet.",
        "CLOSING": "Write a 2-sentence warm closing thought. Remind them the path is theirs to own."
      };

      const systemPrompt = prompts[mode] || prompts["PATHS"];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY, 
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: content }],
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({ result: data.content[0].text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};