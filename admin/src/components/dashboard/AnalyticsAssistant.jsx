import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles } from "lucide-react";
import { adminApi } from "../../services/api";
import RestaurantIntelligence from "./RestaurantIntelligence";

const suggestedQuestions = [
  "What sold best this week?",
  "Which food should I prepare more tomorrow?",
  "Which item should I review before removing it?",
  "Why did sales fall yesterday?",
  "How might weather, nearby events and promotions relate to yesterday's sales?",
  "What should I promote today?",
  "How could I reduce overpreparation?",
  "What do customer ratings tell us?",
  "Which customers haven't returned?",
];

export default function AnalyticsAssistant() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [intelligence, setIntelligence] = useState(null);
  const [intelligenceError, setIntelligenceError] = useState("");
  const [loadingIntelligence, setLoadingIntelligence] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const conversationRef = useRef(null);
  const questionRef = useRef(null);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const result = await adminApi.restaurantIntelligence();
        if (active) {
          setIntelligence(result);
          setIntelligenceError("");
        }
      } catch (requestError) {
        if (active) setIntelligenceError(requestError.message);
      } finally {
        inFlight = false;
        if (active) setLoadingIntelligence(false);
      }
    }
    refresh();
    const interval = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refreshVersion]);

  useEffect(() => {
    let active = true;
    adminApi.analyticsChatHistory()
      .then((result) => {
        if (!active) return;
        setMessages(result.messages || []);
        setMode(result.geminiEnabled ? "gemini" : "local");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function submitQuestion(event) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || sending) return;
    setSending(true);
    setError("");
    setQuestion("");
    try {
      const result = await adminApi.askAnalytics(prompt);
      const timestamp = result.createdAt || new Date().toISOString();
      setMessages((current) => [
        ...current,
        { id: `${timestamp}-user`, role: "user", content: prompt, createdAt: timestamp },
        { id: `${timestamp}-assistant`, role: "assistant", content: result.answer, createdAt: timestamp },
      ]);
      setMode(result.mode);
      if (result.intelligence) setIntelligence(result.intelligence);
    } catch (requestError) {
      setQuestion(prompt);
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  function askQuestion(prompt) {
    setQuestion(prompt);
    questionRef.current?.focus();
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const modeLabel = !mode ? "Connecting" : mode === "gemini"
    ? "Gemini ready"
    : mode === "local-fallback"
      ? "Local insights · Gemini unavailable"
      : "Local insights · Gemini key not configured";

  return (
    <>
      <RestaurantIntelligence data={intelligence} loading={loadingIntelligence} error={intelligenceError} onRefresh={() => { setLoadingIntelligence(true); setRefreshVersion((version) => version + 1); }} onAsk={askQuestion} />
    <section className="mt-4 overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm" aria-labelledby="analytics-assistant-heading">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#e86a33]">
            <Sparkles size={19} />
          </span>
          <div>
            <h2 id="analytics-assistant-heading" className="font-semibold text-gray-900">Restaurant AI assistant</h2>
            <p className="text-xs text-gray-500">Orders, ratings and weekday demand</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-gray-500">
          <span className={`h-2 w-2 rounded-full ${mode === "gemini" ? "bg-emerald-500" : "bg-amber-500"}`} />
          {modeLabel}
        </span>
      </div>

      <div ref={conversationRef} className="max-h-[420px] min-h-[180px] space-y-4 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
        {loadingHistory ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <LoaderCircle size={16} className="animate-spin" /> Loading saved conversation
          </div>
        ) : messages.length ? (
          messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role !== "user" && (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#e86a33]">
                  <Bot size={16} />
                </span>
              )}
              <p className={`max-w-[min(90%,680px)] whitespace-pre-line rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-gray-900 text-white" : "bg-orange-50/70 text-gray-700"}`}>
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <div className="py-5 text-sm text-gray-500">No saved conversation yet.</div>
        )}
        {sending && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#e86a33]"><Bot size={16} /></span>
            <LoaderCircle size={16} className="animate-spin" /> Checking recent performance
          </div>
        )}
      </div>

      <div className="px-5 pb-4 sm:px-6">
        <label htmlFor="suggested-question" className="sr-only">Suggested restaurant question</label>
        <select id="suggested-question" value="" onChange={(event) => askQuestion(event.target.value)} className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 sm:w-auto sm:max-w-full">
          <option value="" disabled>Suggested questions</option>
          {suggestedQuestions.map((prompt) => <option key={prompt} value={prompt}>{prompt}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="px-5 pb-3 text-sm text-red-600 sm:px-6">{error}</p>}
      <form onSubmit={submitQuestion} className="flex items-end gap-3 border-t border-orange-100 p-4 sm:px-6">
        <label className="sr-only" htmlFor="analytics-question">Ask about restaurant performance</label>
        <textarea
          id="analytics-question"
          ref={questionRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
          maxLength={500}
          rows={2}
          placeholder="Ask your restaurant anything..."
          className="min-h-11 min-w-0 flex-1 resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#e86a33] focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="submit"
          title="Send question"
          aria-label="Send question"
          disabled={!question.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e86a33] text-white transition hover:bg-[#cf5726] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={17} />}
        </button>
      </form>
    </section>
    </>
  );
}