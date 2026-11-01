import { useContext, useEffect, useState, useRef } from "react";
import { Download, ArrowLeft, MessageSquare, Send, X, Loader2, Linkedin, Github, Mail, Phone, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import { profile, professional, resume } from "@/data/portfolio";
import usePageMeta from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";

// Both lists come from portfolio.json (the same file the résumé PDF and the
// chatbot read), split by the `type` flag — so adding a credential in one
// place updates the page, the PDF, and the bot together.
const certifications = professional.certs.filter((c) => c.type !== "achievement");
const achievements = professional.certs.filter((c) => c.type === "achievement");

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function Recruiter() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Recruiter View — Hemanth Naga Sai Chakka",
    "A fast summary for recruiters: experience, projects, resume download, and an AI chat grounded in Hemanth's real background.",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hey, I'm Hemanth. Thanks for stopping by my portfolio. I set up this space to chat with you about my work at EY, my projects, or anything else you're curious about. Ask me anything!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Whether the user is pinned to the bottom of the chat. Streaming appends
  // dozens of updates per reply; auto-scrolling must never fight someone
  // who scrolled up to reread an earlier answer.
  const stickToBottomRef = useRef(true);

  const busy = isLoading || isStreaming;

  useEffect(() => {
    setDimension("recruiter");
    window.scrollTo(0, 0);
  }, [setDimension]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el && stickToBottomRef.current) {
      // Instant, not smooth: smooth scrolling queues animations on every
      // streamed chunk and turns the pane to jelly.
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      // Focus after the open transition so the pane doesn't jump mid-animation.
      const t = setTimeout(() => inputRef.current?.focus(), 240);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleMessagesScroll = () => {
    const el = messagesRef.current;
    if (el) {
      stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  const handleSendMessage = async (text: string) => {
    // `busy` also blocks a second send while a reply is still streaming —
    // two concurrent streams would both write into the last message.
    if (!text.trim() || busy) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    stickToBottomRef.current = true;

    let streamed = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the last 20 messages — the backend truncates to the same
        // window and its schema rejects histories over 40 outright.
        body: JSON.stringify({ message: text, history: messages.slice(-20) }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to get response");

      // The backend streams the reply as plain-text chunks. The reply bubble
      // is created on the first chunk (not before), so the typing indicator
      // hands off to real text with no empty-bubble moment.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        if (!streamed) {
          setIsLoading(false);
          setIsStreaming(true);
          streamed = chunk;
          setMessages((prev) => [...prev, { role: "model", content: chunk }]);
        } else {
          streamed += chunk;
          const current = streamed;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "model", content: current };
            return next;
          });
        }
      }
      if (!streamed.trim()) throw new Error("Empty response");
    } catch (error) {
      console.error(error);
      // A partial reply that broke mid-stream is worth keeping as-is. If
      // nothing arrived, apologize and restore the question so retrying is
      // one keypress, not a retype.
      if (!streamed.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content:
              "Sorry, I ran into a bit of trouble connecting to my brain. Could you try sending that again?",
          },
        ]);
        setInputValue(text);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const suggestions = [
    "Tell me about your role at EY.",
    "What tech did you use for Emotion Detection?",
    "Tell me about your cricket philosophy.",
    "What are your core technical skills?"
  ];

  return (
    <main className="recruiter-bg text-ink" data-testid="recruiter-page">
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-8 pb-28">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-12 text-sm text-ink-soft">
          <Link to="/" className="inline-flex items-center gap-2 py-3 -my-3 no-underline hover:text-ink transition-colors" data-testid="recruiter-back-link">
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" /> Full portfolio
          </Link>
          <span>Recruiter view</span>
        </div>

        {/* Header */}
        <header className="pb-8 border-b border-line">
          <h1 className="text-[clamp(2.25rem,6vw,3.25rem)] font-black tracking-[-0.045em] leading-[0.95]">Hemanth Naga Sai Chakka</h1>
          <p className="text-lg mt-3">Associate Consultant · EY</p>
          <p className="text-[0.9375rem] text-ink-soft mt-1">
            Mangalagiri, Guntur · B.Tech CSE, KITS (CGPA 8.55)
          </p>

          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {[
              { href: profile.links.linkedin, icon: <Linkedin size={14} aria-hidden="true" />, label: "LinkedIn", id: "recruiter-linkedin-link", ext: true },
              { href: profile.links.github, icon: <Github size={14} aria-hidden="true" />, label: "GitHub", id: "recruiter-github-link", ext: true },
              { href: profile.links.instagram, icon: <Instagram size={14} aria-hidden="true" />, label: "AI on Instagram", id: "recruiter-instagram-link", ext: true },
              { href: "mailto:virathemu9@gmail.com", icon: <Mail size={14} aria-hidden="true" />, label: "virathemu9@gmail.com", id: "recruiter-email-link" },
              { href: "tel:+916309534077", icon: <Phone size={14} aria-hidden="true" />, label: "+91 6309534077", id: "recruiter-phone-link" },
            ].map((c) => (
              <a
                key={c.id}
                href={c.href}
                {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink border-2 border-ink/80 no-underline hover:bg-lime transition-colors"
                data-testid={c.id}
              >
                {c.icon} {c.label}
              </a>
            ))}
          </div>

          <a
            href={`${BACKEND_URL}/api/resume/download`}
            target="_blank" rel="noopener noreferrer"
            data-testid="recruiter-download-btn"
            className="btn fill-ink mt-6 text-[0.9375rem]" style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
          >
            <Download size={15} strokeWidth={2} aria-hidden="true" /> Download résumé (PDF)
          </a>
        </header>

        {/* Summary */}
        <section className="pt-10">
          <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] mb-3">Summary</h2>
          <p className="text-[1.0625rem] leading-relaxed">{resume.summary}</p>
        </section>

        {/* Experience */}
        <section className="pt-12">
          <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Experience</h2>
          {professional.experience.map((e, i) => (
            <div key={i} className="pt-5" data-testid={`recruiter-exp-${i}`}>
              <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                <p className="font-semibold text-[1.0625rem]">{e.role} — {e.company}</p>
                <p className="text-sm text-ink-soft">{e.period}</p>
              </div>
              {e.sub && <p className="text-sm text-ink-soft mt-1">{e.sub}</p>}
              <ul className="mt-3">
                {e.bullets.map((b, j) => (
                  <li key={j} className="text-[0.9375rem] leading-relaxed py-2 border-b border-line last:border-b-0">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className="pt-12">
          <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Projects</h2>
          {professional.projects.map((p, i) => (
            <div key={i} className="py-5 border-b border-line" data-testid={`recruiter-proj-${i}`}>
              <p className="font-semibold text-[1.0625rem]">{p.name}</p>
              <p className="text-sm text-ink-soft mt-1">{p.stack.split(" · ").join(", ")}</p>
              <p className="text-[0.9375rem] leading-relaxed mt-2">{p.desc}</p>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="pt-12">
          <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Education</h2>
          {professional.education.map((e, i) => (
            <div key={i} className="flex justify-between items-baseline gap-4 py-3 border-b border-line" data-testid={`recruiter-edu-${i}`}>
              <div>
                <p className="font-medium">{e.degree}</p>
                <p className="text-sm text-ink-soft">{e.org}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-ink-soft">{e.period}</p>
                <p className="font-semibold">{e.meta}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="pt-12">
          <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Skills</h2>
          <dl>
            {[
              { label: "Languages & tools", items: ["Python", "SQL", "Excel"] },
              { label: "Libraries", items: ["NumPy", "Pandas", "Matplotlib"] },
              { label: "Databases", items: ["MongoDB"] },
              { label: "Domains", items: ["Machine Learning", "NLP", "GenAI Tools", "Data Validation", "Process Automation", "LLM Exploration"] },
            ].map((group) => (
              <div key={group.label} className="grid sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-0.5 py-3 border-b border-line">
                <dt className="text-sm text-ink-soft">{group.label}</dt>
                <dd className="text-[0.9375rem]">{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Certifications + achievements */}
        <div className="grid sm:grid-cols-2 gap-x-10">
          <section className="pt-12">
            <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Certifications</h2>
            {certifications.map((c, i) => (
              <div key={i} className="py-3 border-b border-line" data-testid={`recruiter-cert-${i}`}>
                <p className="text-[0.9375rem] font-medium leading-snug">{c.name}</p>
                <p className="text-sm text-ink-soft">{c.org}</p>
              </div>
            ))}
          </section>
          <section className="pt-12">
            <h2 className="text-[0.8125rem] font-extrabold uppercase tracking-[0.02em] pb-2 border-b border-ink">Achievements</h2>
            {achievements.map((a, i) => (
              <div key={i} className="py-3 border-b border-line" data-testid={`recruiter-ach-${i}`}>
                <p className="text-[0.9375rem] font-medium leading-snug">{a.name}</p>
                <p className="text-sm text-ink-soft">{a.org}</p>
              </div>
            ))}
          </section>
        </div>

        <footer className="pt-12 mt-12 border-t border-line">
          <p className="text-sm text-ink-soft">
            The full layered portfolio is on the{" "}
            <Link to="/" className="text-ink underline decoration-line hover:decoration-ink">home page</Link>. Read the{" "}
            <Link to="/privacy" className="text-ink underline decoration-line hover:decoration-ink" data-testid="recruiter-privacy-link">
              privacy note
            </Link>
            .
          </p>
        </footer>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-full">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="origin-bottom-right w-[calc(100vw-32px)] sm:w-96 h-[520px] max-h-[75vh] bg-cream border-[3px] border-ink rounded-card shadow-[6px_6px_0_var(--ink)] flex flex-col overflow-hidden mb-4"
              role="dialog"
              aria-label="Chat with Hemanth"
              onKeyDown={(e) => {
                if (e.key === "Escape") closeChat();
              }}
              data-testid="chatbot-window"
            >
              {/* Chat Header */}
              <div className="bg-ink text-cream p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src="/portrait-head.webp"
                    alt=""
                    width={36}
                    height={36}
                    className="w-9 h-9 object-cover rounded-full border-2 border-cream/40"
                  />
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">Hemanth</h3>
                    <p className="text-xs text-cream/70 leading-none mt-1">
                      AI · answers from my real story
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeChat}
                  className="p-2 -m-0.5 hover:bg-cream/10 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={messagesRef}
                onScroll={handleMessagesScroll}
                role="log"
                aria-label="Conversation"
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e6e6d3] light-scroll"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 text-[0.9375rem] max-w-[85%] leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === "user"
                          ? "bg-ink text-cream rounded-[1.1rem] rounded-br-md"
                          : "bg-cream border-2 border-ink/15 text-ink rounded-[1.1rem] rounded-bl-md"
                      } ${isStreaming && msg.role === "model" && i === messages.length - 1 ? "stream-caret" : ""}`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-start"
                  >
                    <div
                      className="px-4 py-3.5 bg-cream border-2 border-ink/15 rounded-[1.1rem] rounded-bl-md flex items-center gap-1"
                      aria-label="Hemanth is typing"
                    >
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="p-3 bg-[#e6e6d3] border-t border-line flex flex-wrap gap-1.5 justify-start">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      disabled={busy}
                      className="text-[0.8125rem] font-semibold text-left px-3 py-2 rounded-full bg-cream border-2 border-ink/80 hover:bg-lime transition-colors text-ink disabled:opacity-50"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="p-3 border-t border-line flex gap-2 items-center bg-cream"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about my work, projects, cricket…"
                  maxLength={2000}
                  aria-label="Your message"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full border-2 border-ink/80 bg-cream text-base sm:text-[0.9375rem] text-ink placeholder:text-ink-soft focus:outline-none focus:border-ink transition-colors disabled:bg-[#e6e6d3] disabled:text-ink-soft"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || busy}
                  aria-label="Send message"
                  className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-full transition-colors ${
                    inputValue.trim() && !busy
                      ? "bg-ink text-lime hover:bg-[#000]"
                      : "bg-[#e6e6d3] text-ink-soft cursor-not-allowed"
                  }`}
                >
                  {busy ? <Loader2 size={17} className="animate-spin motion-reduce:animate-none" /> : <Send size={17} />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="btn fill-ink !px-5 !py-3.5"
          style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
          data-testid="chatbot-toggle-btn"
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          <span className="font-semibold text-sm">{isOpen ? "Close" : "Ask Hemanth"}</span>
        </motion.button>
      </div>
    </main>
  );
}
