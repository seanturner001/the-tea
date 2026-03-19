import Anthropic from "@anthropic-ai/sdk";
import { SHOWS } from "@/lib/shows";

const SYSTEM_PROMPT = `You are a reality TV news aggregator for a spoiler-protection app called "The Tea."
Search for the 5-7 most recent news articles about the requested show(s) from the past 2 weeks.
For each article found, return a JSON array. Each object must have exactly these fields:
{
  "title": "article headline",
  "source": "publication name (e.g. People, E! News, Entertainment Weekly)",
  "url": "full article URL",
  "date": "date string like 'Mar 15, 2026'",
  "show": "specific show name (e.g. Real Housewives of Beverly Hills)",
  "safe_summary": "2-3 sentence summary with ABSOLUTELY ZERO spoilers. Never mention eliminations, rose ceremony outcomes, tribal council results, who went home, who won challenges, or any episode outcomes. Focus only on cast drama, relationships, behind-the-scenes info, controversies, cast personal life news.",
  "is_spoiler": true or false (true only if article reveals episode outcomes, eliminations, or results),
  "spoiler_summary": "full summary including all spoilers (or same as safe_summary if is_spoiler is false)",
  "category": one of exactly: "drama", "cast", "recap", "preview", "reunion", "news"
}
Return ONLY a valid JSON array. Start with [ and end with ]. No markdown. No text before or after.`;

export async function POST(request) {
  try {
    const { show } = await request.json();

    const found = SHOWS.find((s) => s.id === show);
    if (!found) {
      return Response.json({ error: "Invalid show" }, { status: 400 });
    }

    const showQuery =
      show === "all"
        ? "reality TV shows including " +
          SHOWS.filter((s) => s.id !== "all")
            .map((s) => s.label)
            .join(", ")
        : found.label;

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Find the 5-7 most recent news articles about ${showQuery}. Mix drama, cast updates, recaps, and episode news from the past 2 weeks.`,
        },
      ],
    });

    const textBlocks = message.content.filter((b) => b.type === "text");
    const raw = textBlocks[textBlocks.length - 1]?.text || "[]";
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();

    let articles = [];
    try {
      articles = JSON.parse(clean);
    } catch {
      articles = [];
    }

    return Response.json({
      articles: Array.isArray(articles) ? articles : [],
    });
  } catch (err) {
    console.error("Tea API error:", err);
    return Response.json(
      { error: "Failed to fetch tea" },
      { status: 500 }
    );
  }
}
