// Server-side proxy for the reinvest-bot's live stats.
// The bot runs on a plain-HTTP VPS; the site is HTTPS, so the browser can't
// fetch the VPS directly (mixed content). This function fetches it
// server-side instead, so the dashboard just calls same-origin `/api/stats`.
//
// BOT_STATS_URL is a Vercel environment variable, not hardcoded here — set it
// (Project Settings -> Environment Variables) once the real bot is deployed.
// Left unset, this cleanly reports "not configured" instead of ever
// accidentally showing a previous/test bot's data on the real site.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const botStatsUrl = process.env.BOT_STATS_URL;
  if (!botStatsUrl) {
    res.status(404).json({ error: "not configured", detail: "BOT_STATS_URL is not set yet" });
    return;
  }

  try {
    const upstream = await fetch(botStatsUrl + (botStatsUrl.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
    if (!upstream.ok) throw new Error("bot responded " + upstream.status);
    const data = await upstream.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "bot unreachable", detail: String(e && e.message ? e.message : e) });
  }
};
