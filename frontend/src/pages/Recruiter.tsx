import { useContext, useEffect, useState, useRef } from "react";
import { Download, ArrowLeft, MessageSquare, Send, X, Loader2, Linkedin, Github, Mail, Phone, GraduationCap, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import { professional } from "@/data/portfolio";
import usePageMeta from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";

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
    document.documentElement.style.setProperty("--grain-opacity", "0");
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
    <main className="recruiter-bg min-h-screen relative" data-testid="recruiter-page">
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 relative">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10 text-xs uppercase tracking-[0.2em] text-[#4B5563] font-plex">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-black transition-colors" data-testid="recruiter-back-link">
            <ArrowLeft size={12} /> Full portfolio
          </Link>
          <span>Recruiter view</span>
        </div>

        {/* Header */}
        <header className="pb-6 border-b border-[#E5E7EB]">
          <h1 className="font-plex font-semibold text-4xl md:text-5xl text-[#111827] tracking-tight">
            Hemanth Naga Sai Chakka
          </h1>
          <p className="font-plex text-lg text-[#4B5563] mt-2">Senior Data Analyst · EY</p>
          <p className="font-plex text-sm text-[#4B5563] mt-3">
            Mangalagiri, Guntur · B.Tech CSE, KITS (CGPA 8.55)
          </p>

          {/* Contact Links */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <a
              href="https://www.linkedin.com/in/hemanth-chakka-5126111a9/"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-plex font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all"
              data-testid="recruiter-linkedin-link"
            >
              <Linkedin size={13} /> LinkedIn
            </a>
            <a
              href="https://github.com/hemanthnagasai"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-plex font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:text-[#111827] hover:border-[#111827] hover:bg-[#111827]/5 transition-all"
              data-testid="recruiter-github-link"
            >
              <Github size={13} /> GitHub
            </a>
            <a
              href="mailto:virathemu9@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-plex font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:text-[#DC2626] hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all"
              data-testid="recruiter-email-link"
            >
              <Mail size={13} /> virathemu9@gmail.com
            </a>
            <a
              href="tel:+916309534077"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-plex font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:text-[#059669] hover:border-[#059669] hover:bg-[#059669]/5 transition-all"
              data-testid="recruiter-phone-link"
            >
              <Phone size={13} /> +91 6309534077
            </a>
          </div>

          <a
            href={`${BACKEND_URL}/api/resume/download`}
            target="_blank" rel="noopener noreferrer"
            data-testid="recruiter-download-btn"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#111827] text-white text-sm font-plex font-medium rounded-lg hover:bg-black transition-all hover:shadow-lg"
          >
            <Download size={14} /> Download Resume (PDF)
          </a>
        </header>

        {/* Summary */}
        <section className="py-8">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-3">Summary</h2>
          <p className="font-plex text-[15px] leading-relaxed text-[#111827]">
            Senior Data Analyst at EY working at the intersection of data, technology, and people.
            Translate complexity into clarity, automate repetitive workflows, and leverage GenAI to
            simplify complex findings for non-technical stakeholders.
          </p>
        </section>

        {/* Experience */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Experience</h2>
          {professional.experience.map((e, i) => (
            <div key={i} data-testid={`recruiter-exp-${i}`}>
              <div className="flex justify-between items-baseline">
                <p className="font-plex font-semibold text-[#111827]">{e.role} — {e.company}</p>
                <p className="font-plex text-sm text-[#4B5563]">{e.period}</p>
              </div>
              {e.sub && <p className="font-plex text-sm text-[#4B5563] italic mb-2">{e.sub}</p>}
              <ul className="mt-3 space-y-1.5">
                {e.bullets.map((b, j) => (
                  <li key={j} className="font-plex text-[14px] leading-relaxed text-[#111827] pl-4 relative">
                    <span className="absolute left-0 top-2 w-1 h-1 bg-[#111827] rounded-full" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Projects</h2>
          <div className="space-y-6">
            {professional.projects.map((p, i) => (
              <div key={i} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] transition-colors" data-testid={`recruiter-proj-${i}`}>
                <p className="font-plex font-semibold text-[#111827] mb-2">{p.name}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.stack.split(" · ").map((tech) => (
                    <span
                      key={tech}
                      className="inline-block px-2 py-0.5 text-[11px] font-plex font-medium text-[#4B5563] bg-white border border-[#E5E7EB] rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="font-plex text-[14px] leading-relaxed text-[#374151]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Education</h2>
          {professional.education.map((e, i) => (
            <div key={i} className="flex justify-between items-baseline mb-2" data-testid={`recruiter-edu-${i}`}>
              <div>
                <p className="font-plex font-medium text-[#111827]">{e.degree}</p>
                <p className="font-plex text-sm text-[#4B5563]">{e.org}</p>
              </div>
              <div className="text-right">
                <p className="font-plex text-sm text-[#4B5563]">{e.period}</p>
                <p className="font-plex text-sm font-medium text-[#111827]">{e.meta}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Skills</h2>
          <div className="space-y-4">
            {[
              { label: "Languages & Tools", items: ["Python", "SQL", "Excel"] },
              { label: "Libraries & Frameworks", items: ["NumPy", "Pandas", "Matplotlib"] },
              { label: "Databases", items: ["MongoDB"] },
              { label: "Domains & Concepts", items: ["Machine Learning", "NLP", "GenAI Tools", "Data Validation", "Process Automation", "LLM Exploration"] },
            ].map((group) => (
              <div key={group.label}>
                <p className="font-plex text-[11px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-2 font-medium">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-3 py-1 text-[13px] font-plex font-medium text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] hover:border-[#D1D5DB] transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Certifications */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Certifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Basic Python", org: "HackerRank" },
              { name: "Artificial Intelligence", org: "Simplilearn" },
              { name: "Generative AI for Everyone", org: "Coursera" },
              { name: "Data Analytics", org: "Code Crave" },
              { name: "Data Engineering", org: "ISI Kolkata" },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] transition-colors" data-testid={`recruiter-cert-${i}`}>
                <GraduationCap size={15} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-plex text-[13px] font-semibold text-[#111827] leading-tight">{c.name}</p>
                  <p className="font-plex text-[11px] text-[#9CA3AF] mt-0.5">{c.org}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "IIC Regional Meet — High Recognition", org: "KL University" },
              { name: "Startup Mahakumbh 2024", org: "DELHI" },
              { name: "Jeevan Kaushal Club Coordinator", org: "Co-Curricular" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] transition-colors" data-testid={`recruiter-ach-${i}`}>
                <Award size={15} className="text-[#D97706] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-plex text-[13px] font-semibold text-[#111827] leading-tight">{a.name}</p>
                  <p className="font-plex text-[11px] text-[#9CA3AF] mt-0.5">{a.org}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-8 border-t border-[#E5E7EB] text-center">
          <p className="font-plex text-xs text-[#4B5563]">
            Full layered portfolio available at{" "}
            <Link to="/" className="underline hover:text-black">Home</Link>.
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
              className="origin-bottom-right w-[calc(100vw-32px)] sm:w-96 h-[520px] max-h-[75vh] bg-white ring-1 ring-black/5 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4"
              role="dialog"
              aria-label="Chat with Hemanth"
              onKeyDown={(e) => {
                if (e.key === "Escape") closeChat();
              }}
              data-testid="chatbot-window"
            >
              {/* Chat Header */}
              <div
                className="text-white p-4 flex justify-between items-center"
                style={{
                  background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/avatar.jpeg"
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#151d2b]"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="font-plex font-semibold text-sm leading-tight">Hemanth</h3>
                    <p className="text-[11px] text-neutral-400 font-medium leading-none mt-1">
                      AI · answers from my real story
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeChat}
                  className="p-2 -m-0.5 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] light-scroll"
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
                      className={`px-4 py-2.5 rounded-2xl text-sm font-plex max-w-[85%] leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === "user"
                          ? "bg-[#111827] text-white rounded-br-md"
                          : "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-md shadow-sm"
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
                      className="px-4 py-3.5 rounded-2xl rounded-bl-md bg-white border border-[#E5E7EB] shadow-sm flex items-center gap-1"
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
                <div className="p-3 bg-[#FAFAFA] border-t border-[#E5E7EB] flex flex-wrap gap-1.5 justify-start">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      disabled={busy}
                      className="text-xs font-plex px-3 py-2 bg-white border border-[#E5E7EB] rounded-full hover:bg-neutral-50 hover:border-neutral-400 transition-colors text-[#4B5563] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/25"
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
                className="p-3 border-t border-[#E5E7EB] flex gap-2 items-center bg-white"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about my work, projects, cricket…"
                  maxLength={2000}
                  aria-label="Your message"
                  className="flex-1 min-w-0 px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-base sm:text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10 font-plex transition-[border-color,box-shadow] disabled:bg-neutral-50 disabled:text-neutral-400"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || busy}
                  aria-label="Send message"
                  className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/30 ${
                    inputValue.trim() && !busy
                      ? "bg-[#111827] text-white hover:bg-black"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
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
          className="flex items-center gap-2 px-5 py-3.5 bg-[#111827] text-white hover:bg-black rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/40 focus-visible:ring-offset-2"
          style={{
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          data-testid="chatbot-toggle-btn"
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          <span className="font-plex font-medium text-sm">{isOpen ? "Close" : "Ask Hemanth"}</span>
        </motion.button>
      </div>
    </main>
  );
}
