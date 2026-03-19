"use client";

import { useState } from "react";
import { Eye, EyeOff, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { SHOWS, CAT_META } from "@/lib/shows";

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

    try {
      const res = await fetch("/api/tea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show: selectedShow }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setArticles(Array.isArray(data.articles) ? data.articles : []);
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

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans max-w-[430px] mx-auto pb-12 overflow-x-hidden">
      {/* Header */}
      <div className="px-6 pt-[52px] pb-7 bg-gradient-to-b from-pink/[0.07] to-transparent border-b border-white/[0.07]">
        <div className="text-[11px] tracking-[0.3em] text-gold uppercase mb-2.5 flex items-center gap-1.5">
          <Sparkles size={11} /> Reality TV · Spoiler Protection
        </div>
        <div className="font-playfair text-[58px] font-black leading-none text-white mb-2 -tracking-[1px]">
          The <span className="text-pink italic">Tea</span>
        </div>
        <div className="text-sm text-text-muted font-light">
          All the drama, none of the spoilers ✨
        </div>
      </div>

      {/* Spoiler Toggle */}
      <div
        className={`flex items-center justify-between px-6 py-3.5 border-b border-white/[0.07] transition-colors duration-300 ${
          spoilerFree ? "bg-pink/[0.04]" : "bg-transparent"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300 ${
            spoilerFree ? "text-pink" : "text-text-muted"
          }`}
        >
          {spoilerFree ? <EyeOff size={14} /> : <Eye size={14} />}
          {spoilerFree ? "Spoiler-Free Mode" : "Spoilers Allowed"}
        </div>
        <button
          onClick={() => setSpoilerFree((v) => !v)}
          className={`w-[52px] h-7 rounded-full border-none cursor-pointer relative transition-colors duration-250 shrink-0 ${
            spoilerFree ? "bg-pink" : "bg-[#2a2a2a]"
          }`}
        >
          <div
            className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-[left] duration-250 shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${
              spoilerFree ? "left-[27px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>

      {/* Show Filter */}
      <div className="py-3.5 border-b border-white/[0.07] overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 px-6 whitespace-nowrap">
          {SHOWS.map((show) => {
            const active = selectedShow === show.id;
            return (
              <button
                key={show.id}
                onClick={() => setSelectedShow(show.id)}
                className={`inline-flex items-center gap-[5px] px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap font-sans cursor-pointer transition-all duration-200 ${
                  active
                    ? "font-semibold bg-pink text-white border-none"
                    : "font-normal bg-white/5 text-text-sub border border-white/[0.07]"
                }`}
              >
                {show.emoji} {show.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fetch Button */}
      <div className="px-6 pt-5 pb-2">
        <button
          onClick={fetchTea}
          disabled={loading}
          className={`w-full py-[17px] border-none rounded-2xl text-base font-semibold flex items-center justify-center gap-2.5 font-sans tracking-[0.01em] transition-all duration-200 ${
            loading
              ? "bg-[#1e1e1e] text-text-muted cursor-not-allowed shadow-none"
              : "bg-gradient-to-br from-pink to-[#C9184A] text-white cursor-pointer shadow-[0_4px_24px_rgba(255,27,141,0.35)]"
          }`}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-[spin_1s_linear_infinite]" />
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="px-6 pt-4 flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-card rounded-2xl p-[18px] border border-white/[0.07] animate-[pulse_1.5s_ease-in-out_infinite]"
            >
              <div className="bg-[#222] h-2.5 w-2/5 rounded-md mb-3" />
              <div className="bg-[#222] h-5 w-[85%] rounded-md mb-2" />
              <div className="bg-[#1a1a1a] h-3.5 w-full rounded-md mb-1.5" />
              <div className="bg-[#1a1a1a] h-3.5 w-[70%] rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-5 p-4 bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.3)] rounded-xl text-[#E8736A] text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !loading && (
        <div className="text-center px-8 py-[70px] text-text-muted">
          <div className="text-[56px] mb-5">☕</div>
          <div className="font-playfair text-2xl text-[#444] mb-2.5">
            Ready to spill?
          </div>
          <div className="text-sm text-[#333] leading-relaxed">
            Pick your show above, then tap the button
            <br />
            to get the latest tea — spoiler free. 👑
          </div>
        </div>
      )}

      {/* Articles */}
      {!loading && articles.length > 0 && (
        <div className="px-4 pt-4 flex flex-col gap-3">
          {/* Results header */}
          <div className="px-2 text-xs text-text-muted tracking-[0.05em] uppercase flex justify-between items-center">
            <span>{articles.length} articles found</span>
            <span className={spoilerFree ? "text-pink" : "text-[#444]"}>
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
                className="bg-card rounded-[18px] overflow-hidden animate-[fadeUp_0.35s_ease_both]"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  border: isSpoiler && spoilerFree
                    ? "1px solid rgba(255,27,141,0.2)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isSpoiler && spoilerFree
                    ? "0 0 0 1px rgba(255,27,141,0.1)"
                    : "none",
                }}
              >
                <div className="p-[18px]">
                  {/* Top row */}
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="text-[11px] font-medium text-gold uppercase tracking-[0.08em] max-w-[65%] overflow-hidden text-ellipsis whitespace-nowrap">
                      {article.show || currentShow?.label}
                    </div>
                    <div
                      className="text-[10px] font-bold tracking-[0.12em] px-[9px] py-[3px] rounded-full shrink-0"
                      style={{ background: catMeta.bg, color: catMeta.color }}
                    >
                      {catMeta.label}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="font-playfair text-lg font-bold leading-[1.35] text-text-primary mb-2">
                    {article.title}
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-text-muted mb-3.5 flex gap-1.5">
                    <span className="text-[#555] font-medium">{article.source}</span>
                    <span className="text-[#333]">·</span>
                    <span>{article.date}</span>
                  </div>

                  {/* Spoiler banner */}
                  {spoilerFree && isSpoiler && (
                    <div className="flex items-center justify-between p-[10px_12px] bg-pink/[0.08] border border-pink/25 rounded-[10px] mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-pink tracking-[0.05em]">
                        <AlertTriangle size={12} />
                        SPOILER ALERT
                      </div>
                      <button
                        onClick={() => toggleReveal(i)}
                        className={`text-xs font-semibold px-3 py-[5px] rounded-full cursor-pointer font-sans transition-all duration-200 ${
                          isRevealed
                            ? "bg-white/[0.06] text-text-muted border border-white/[0.07]"
                            : "bg-pink/20 text-pink border border-pink/40"
                        }`}
                      >
                        {isRevealed ? "Hide ↑" : "Reveal ↓"}
                      </button>
                    </div>
                  )}

                  {/* Summary */}
                  <div
                    className={`text-sm leading-[1.65] font-light transition-all duration-300 ${
                      showWall
                        ? "text-transparent blur-[5px] select-none bg-gradient-to-br from-[#2a1520] to-[#1e1218] p-3 rounded-lg"
                        : "text-[#9A9A9A]"
                    }`}
                  >
                    {showWall ? article.safe_summary : displayText}
                  </div>

                  {/* Revealed spoiler section */}
                  {isRevealed && (
                    <div className="mt-3 p-[12px_14px] bg-pink/[0.06] border-l-[3px] border-l-pink rounded-r-lg text-sm leading-[1.65] text-[#AAA] font-light">
                      {article.spoiler_summary}
                    </div>
                  )}

                  {/* Read link */}
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-pink no-underline mt-3.5 font-medium opacity-80"
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

      {/* No Results */}
      {hasSearched && !loading && articles.length === 0 && !error && (
        <div className="text-center px-8 py-[60px] text-text-muted">
          <div className="text-5xl mb-4">🫖</div>
          <div className="font-playfair text-[22px] text-[#444] mb-2">
            No tea found
          </div>
          <div className="text-sm text-[#333]">
            Try a different show or try again
          </div>
        </div>
      )}

      {/* Bottom safe area */}
      <div className="h-8" />
    </div>
  );
}
