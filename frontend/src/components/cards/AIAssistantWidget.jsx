import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pushUserMessage, sendAssistantMessage } from "../../redux/slices/aiSlice";

const SUGGESTIONS = [
  "How can I save more this month?",
  "Where am I overspending?",
  "Is my finance health good?",
];

export default function AIAssistantWidget({ embedded = false }) {
  const dispatch = useDispatch();
  const { chat } = useSelector((s) => s.ai);
  const user = useSelector((s) => s.auth.user);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.sending]);

  const send = (text) => {
    if (!text.trim() || chat.sending) return;
    dispatch(pushUserMessage(text));
    dispatch(sendAssistantMessage({ message: text, session_id: chat.sessionId }));
    setInput("");
  };

  return (
    <div
      data-testid="ai-assistant"
      className={`bg-white ${
        embedded ? "rounded-card shadow-card border border-ink-100" : "rounded-card shadow-card border border-ink-100"
      } overflow-hidden flex flex-col`}
      style={{ minHeight: 400 }}
    >
      <div className="p-5 border-b border-ink-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center">
          <Sparkles size={18} className="text-brand-700" strokeWidth={2.4} />
        </div>
        <div>
          <p className="font-semibold text-ink-900 text-sm">FinGuard AI</p>
          <p className="text-xs text-ink-500">Powered by FinGuard AI Engine</p>
        </div>
        <span className="ml-auto chip chip-success">Online</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: 360 }}>
        {chat.messages.length === 0 && (
          <div className="space-y-3">
            <div className="bg-ink-50 rounded-2xl p-4 text-sm text-ink-700">
              Hi {user?.full_name?.split(" ")[0] || "there"} — I'm FinGuard AI. Ask me about your
              spending, savings goals, or fraud risks.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  data-testid={`suggestion-${s.slice(0, 10).replace(/\s/g, "-")}`}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-2 rounded-full bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {chat.messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl ${
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-br-md"
                    : "bg-ink-100 text-ink-900 rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {chat.sending && (
          <div className="flex justify-start">
            <div className="bg-ink-100 rounded-2xl px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-4 border-t border-ink-100 flex gap-2"
      >
        <input
          data-testid="ai-assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your finances…"
          className="flex-1 h-12 px-4 rounded-2xl bg-ink-50 border border-transparent focus:border-brand-300 focus:bg-white focus:outline-none text-sm"
        />
        <button
          data-testid="ai-assistant-send"
          type="submit"
          disabled={!input.trim() || chat.sending}
          className="h-12 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white flex items-center gap-2 font-semibold text-sm transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
