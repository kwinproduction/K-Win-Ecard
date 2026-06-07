// api/send-notification.js
// Vercel Serverless Function to securely send push notifications without CORS blocks or key exposure.
export default async function handler(req, res) {
  // Allow requests from all origins (CORS support)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { title, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  // Use environment variables for API key and App ID to keep them secure
  const apiKey = process.env.ONESIGNAL_REST_API_KEY || "idu3ph2svuhunc2xxylhgsddz";
  const appId = process.env.ONESIGNAL_APP_ID || "ebdc2cd4-a21d-434f-ab63-d60f21ad3295";
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Subscribed Users"],
        headings: {
          en: title || "Notification"
        },
        contents: {
          en: message
        }
      })
    });
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("Backend notification error:", error);
    return res.status(500).json({ error: "Failed to send notification: " + error.message });
  }
}
