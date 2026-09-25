// Server-side proxy for the reinvest-bot's live stats.
// The bot runs on a plain-HTTP VPS; the site is HTTPS, so the browser can't
// fetch the VPS directly (mixed content). This function fetches it
// server-side instead, so the dashboard just calls same-origin `/api/stats`.
const BOT_STATS_URL = "http://64.176.64.138:8099/stats.json";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const upstream = await fetch(BOT_STATS_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!upstream.ok) throw new Error("bot responded " + upstream.status);
    const data = await upstream.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "bot unreachable", detail: String(e && e.message ? e.message : e) });
  }
};
