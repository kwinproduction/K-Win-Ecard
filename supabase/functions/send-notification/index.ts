const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, message } = await req.json();

    if (!message || !String(message).trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oneSignalApiKey = Deno.env.get("os_v2_app_5poczvfcdvbu7k3d2yhsdljssx6xjc6nkzbehuffylpjoaim4yl4k23uzsbjzsiybabfl3a7grsgkxho5wnbybzyptw2lvh7hwpfvwq");
    const oneSignalAppId = Deno.env.get("ebdc2cd4-a21d-434f-ab63-d60f21ad3295");

    if (!oneSignalApiKey || !oneSignalAppId) {
      return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${=ebdc2cd4-a21d-434f-ab63-d60f21ad3295}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        included_segments: ["Subscribed Users"],
        headings: { en: title || "K-Win Notification" },
        contents: { en: message },
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
