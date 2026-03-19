import { useState } from "react";
import { Eye, EyeOff, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";

// Inject Google Fonts
if (typeof document !== "undefined" && !document.querySelector("#tea-fonts")) {
  const link = document.createElement("link");
  link.id = "tea-fonts";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    ::-webkit-scrollbar { display: none; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
  `;
  document.head.appendChild(style);
}

const SHOWS = [
  { id: "all", label: "All Trash TV", emoji: "📺" },
  { id: "real-housewives", label: "Real Housewives", emoji: "💅" },
  { id: "love-is-blind", label: "Love Is Blind", emoji: "💍" },
  { id: "survivor", label: "Survivor", emoji: "🏝️" },
  { id: "the-bachelor", label: "The Bachelor", emoji: "🌹" },
  { id: "vanderpump-rules", label: "Vanderpump Rules", emoji: "🍷" },
  { id: "below-deck", label: "Below Deck", emoji: "⛵" },
  { id: "the-traitors", label: "The Traitors", emoji: "🗡️" },
  { id: "big-brother", label: "Big Brother", emoji: "👁️" },
  { id: "selling-sunset", label: "Selling Sunset", emoji: "🏠" },
  { id: "the-challenge", label: "The Challenge", emoji: "🏆" },
  { id: "jersey-shore", label: "Jersey Shore", emoji: "🌊" },
];

const CAT_META = {
  drama: { bg: "rgba(255,27,141,0.12)", color: "#FF1B8D", label: "DRAMA" },
  cast: { bg: "rgba(180,100,220,0.12)", color: "#C39BD3", label: "CAST" },
  recap: { bg: "rgba(231,76,60,0.12)", color: "#E8736A", label: "RECAP" },
  preview: { bg: "rgba(39,174,96,0.12)", color: "#2ECC71", label: "PREVIEW" },
  reunion: { bg: "rgba(243,156,18,0.12)", color: "#F5B942", label: "REUNION" },
  news: { bg: "rgba(82,152,219,0.12)", color: "#5DADE2", label: "NEWS" },
};

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

export default function TheTea() {
  const [selectedShow, setSelectedShow] = useState("all");
  const [spoilerFree, setSpoilerFree] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(new Set());
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const currentShow = SHOWS.find((s) => s.id === selectedShow);

  const fetchTea = async () => {
    setLoading(true);
    setError(null);
    setRevealed(new Set());
    setArticles([]);

    const showQuery =
      selectedShow === "all"
        ? "reality TV shows including Real Housewives, Love Is Blind, Survivor, The Bachelor, Vanderpump Rules, Below Deck, and The Traitors"
        : currentShow.label;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      const textBlocks = data.content.filter((b) => b.type === "text");
      const raw = textBlocks[textBlocks.length - 1]?.text || "[]";
      const clean = raw.replace(/```json\n?|\n?```/g, "").trim();

      let parsed = [];
      try {
        parsed = JSON.parse(clean);
      } catch {
        parsed = [];
      }

      setArticles(Array.isArray(parsed) ? parsed : []);
      setHasSearched(true);
    } catch {
      setError("The tea spilled! Check your connection and try again. ☕");
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (i) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  // Colors
  const pink = "#FF1B8D";
  const gold = "#C9A84C";
  const bg = "#0C0A0B";
  const cardBg = "#161214";
  const border = "rgba(255,255,255,0.07)";
  const textPrimary = "#F2EFF0";
  const textMuted = "#666";
  const textSub = "#999";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: textPrimary,
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: "430px",
        margin: "0 auto",
        paddingBottom: "48px",
        overflowX: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "52px 24px 28px",
          background: `linear-gradient(180deg, rgba(255,27,141,0.07) 0%, transparent 100%)`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.3em",
            color: gold,
            textTransform: "uppercase",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Sparkles size={11} /> Reality TV · Spoiler Protection
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "58px",
            fontWeight: "900",
            lineHeight: "1",
            color: "#FFFFFF",
            marginBottom: "8px",
            letterSpacing: "-1px",
          }}
        >
          The{" "}
          <span style={{ color: pink, fontStyle: "italic" }}>Tea</span>
        </div>
        <div style={{ fontSize: "14px", color: textMuted, fontWeight: "300" }}>
          All the drama, none of the spoilers ✨
        </div>
      </div>

      {/* ── SPOILER TOGGLE ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: `1px solid ${border}`,
          background: spoilerFree ? "rgba(255,27,141,0.04)" : "transparent",
          transition: "background 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: spoilerFree ? pink : textMuted,
            transition: "color 0.3s ease",
          }}
        >
          {spoilerFree ? <EyeOff size={14} /> : <Eye size={14} />}
          {spoilerFree ? "Spoiler-Free Mode" : "Spoilers Allowed"}
        </div>
        <button
          onClick={() => setSpoilerFree((v) => !v)}
          style={{
            width: "52px",
            height: "28px",
            borderRadius: "100px",
            background: spoilerFree ? pink : "#2a2a2a",
            border: "none",
            outline: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.25s ease",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: spoilerFree ? "27px" : "3px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.25s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
            }}
          />
        </button>
      </div>

      {/* ── SHOW FILTER ── */}
      <div
        style={{
          padding: "14px 0",
          borderBottom: `1px solid ${border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "0 24px",
            whiteSpace: "nowrap",
          }}
        >
          {SHOWS.map((show) => {
            const active = selectedShow === show.id;
            return (
              <button
                key={show.id}
                onClick={() => setSelectedShow(show.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "8px 14px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: active ? "600" : "400",
                  background: active ? pink : "rgba(255,255,255,0.05)",
                  color: active ? "#fff" : textSub,
                  border: active ? "none" : `1px solid ${border}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {show.emoji} {show.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FETCH BUTTON ── */}
      <div style={{ padding: "20px 24px 8px" }}>
        <button
          onClick={fetchTea}
          disabled={loading}
          style={{
            width: "100%",
            padding: "17px",
            background: loading
              ? "#1e1e1e"
              : `linear-gradient(135deg, ${pink} 0%, #C9184A 100%)`,
            color: loading ? textMuted : "#fff",
            border: "none",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.01em",
            transition: "all 0.2s ease",
            boxShadow: loading ? "none" : "0 4px 24px rgba(255,27,141,0.35)",
          }}
        >
          {loading ? (
            <>
              <RefreshCw
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Brewing the tea...
            </>
          ) : (
            <>
              ☕{" "}
              {hasSearched
                ? "Refresh the Tea"
                : `Spill the Tea on ${currentShow?.label || "Trash TV"}`}
            </>
          )}
        </button>
      </div>

      {/* ── LOADING SKELETON ── */}
      {loading && (
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                background: cardBg,
                borderRadius: "16px",
                padding: "18px",
                border: `1px solid ${border}`,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              <div style={{ background: "#222", height: "10px", width: "40%", borderRadius: "6px", marginBottom: "12px" }} />
              <div style={{ background: "#222", height: "20px", width: "85%", borderRadius: "6px", marginBottom: "8px" }} />
              <div style={{ background: "#1a1a1a", height: "14px", width: "100%", borderRadius: "6px", marginBottom: "6px" }} />
              <div style={{ background: "#1a1a1a", height: "14px", width: "70%", borderRadius: "6px" }} />
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div
          style={{
            margin: "20px 24px",
            padding: "16px",
            background: "rgba(231,76,60,0.1)",
            border: "1px solid rgba(231,76,60,0.3)",
            borderRadius: "12px",
            color: "#E8736A",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!hasSearched && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "70px 32px",
            color: textMuted,
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "20px" }}>☕</div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              color: "#444",
              marginBottom: "10px",
            }}
          >
            Ready to spill?
          </div>
          <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}>
            Pick your show above, then tap the button
            <br />
            to get the latest tea — spoiler free. 👑
          </div>
        </div>
      )}

      {/* ── ARTICLES ── */}
      {!loading && articles.length > 0 && (
        <div
          style={{
            padding: "16px 16px 0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Results header */}
          <div
            style={{
              padding: "0 8px",
              fontSize: "12px",
              color: textMuted,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{articles.length} articles found</span>
            <span style={{ color: spoilerFree ? pink : "#444" }}>
              {spoilerFree ? "🛡️ Spoilers protected" : "👁️ All spoilers visible"}
            </span>
          </div>

          {articles.map((article, i) => {
            const isSpoiler = !!article.is_spoiler;
            const isRevealed = revealed.has(i);
            const cat = article.category || "news";
            const catMeta = CAT_META[cat] || CAT_META.news;
            const showWall = spoilerFree && isSpoiler && !isRevealed;

            const displayText = isRevealed
              ? article.spoiler_summary
              : article.safe_summary;

            return (
              <div
                key={i}
                style={{
                  background: cardBg,
                  borderRadius: "18px",
                  border: `1px solid ${isSpoiler && spoilerFree ? "rgba(255,27,141,0.2)" : border}`,
                  overflow: "hidden",
                  animation: `fadeUp 0.35s ease both`,
                  animationDelay: `${i * 0.06}s`,
                  boxShadow: isSpoiler && spoilerFree
                    ? "0 0 0 1px rgba(255,27,141,0.1)"
                    : "none",
                }}
              >
                <div style={{ padding: "18px" }}>
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        color: gold,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        maxWidth: "65%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {article.show || currentShow?.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        letterSpacing: "0.12em",
                        padding: "3px 9px",
                        borderRadius: "100px",
                        background: catMeta.bg,
                        color: catMeta.color,
                        flexShrink: 0,
                      }}
                    >
                      {catMeta.label}
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      fontWeight: "700",
                      lineHeight: "1.35",
                      color: textPrimary,
                      marginBottom: "8px",
                    }}
                  >
                    {article.title}
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: textMuted,
                      marginBottom: "14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: "500" }}>{article.source}</span>
                    <span style={{ color: "#333" }}>·</span>
                    <span>{article.date}</span>
                  </div>

                  {/* Spoiler banner */}
                  {spoilerFree && isSpoiler && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "rgba(255,27,141,0.08)",
                        border: "1px solid rgba(255,27,141,0.25)",
                        borderRadius: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: pink,
                          letterSpacing: "0.05em",
                        }}
                      >
                        <AlertTriangle size={12} />
                        SPOILER ALERT
                      </div>
                      <button
                        onClick={() => toggleReveal(i)}
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "5px 12px",
                          borderRadius: "100px",
                          background: isRevealed
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(255,27,141,0.2)",
                          color: isRevealed ? textMuted : pink,
                          border: `1px solid ${isRevealed ? border : "rgba(255,27,141,0.4)"}`,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isRevealed ? "Hide ↑" : "Reveal ↓"}
                      </button>
                    </div>
                  )}

                  {/* Summary */}
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.65",
                      color: showWall ? "transparent" : "#9A9A9A",
                      fontWeight: "300",
                      filter: showWall ? "blur(5px)" : "none",
                      userSelect: showWall ? "none" : "auto",
                      transition: "filter 0.3s ease, color 0.3s ease",
                      background: showWall
                        ? "linear-gradient(135deg, #2a1520, #1e1218)"
                        : "transparent",
                      padding: showWall ? "12px" : "0",
                      borderRadius: showWall ? "8px" : "0",
                    }}
                  >
                    {showWall ? article.safe_summary : displayText}
                  </div>

                  {/* Revealed spoiler section */}
                  {isRevealed && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px 14px",
                        background: "rgba(255,27,141,0.06)",
                        borderLeft: `3px solid ${pink}`,
                        borderRadius: "0 8px 8px 0",
                        fontSize: "14px",
                        lineHeight: "1.65",
                        color: "#AAA",
                        fontWeight: "300",
                      }}
                    >
                      {article.spoiler_summary}
                    </div>
                  )}

                  {/* Read link */}
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: pink,
                        textDecoration: "none",
                        marginTop: "14px",
                        fontWeight: "500",
                        opacity: "0.8",
                      }}
                    >
                      Read full article →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NO RESULTS ── */}
      {hasSearched && !loading && articles.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "60px 32px", color: textMuted }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🫖</div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              color: "#444",
              marginBottom: "8px",
            }}
          >
            No tea found
          </div>
          <div style={{ fontSize: "14px", color: "#333" }}>
            Try a different show or try again
          </div>
        </div>
      )}

      {/* Bottom safe area */}
      <div style={{ height: "32px" }} />
    </div>
  );
}
