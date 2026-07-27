import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, Heart, PenLine } from "lucide-react";

const worlds = [
  { to: "/", label: "Gateway", key: "gateway", icon: Home },
  { to: "/professional", label: "Professional", key: "professional", icon: Briefcase },
  { to: "/personal", label: "Personal", key: "personal", icon: Heart },
  { to: "/emotional", label: "Emotional", key: "emotional", icon: PenLine },
];

// The floating switcher belongs to the four dimensions. Standalone pages
// carry their own "← Gateway" link at the top, so the pill is redundant
// there — and being fixed to the bottom it overlaps their footers.
const WITHOUT_SWITCHER = new Set([
  "/recruiter",
  "/query",
  "/how-i-built-this",
  "/now",
  "/privacy",
]);

export default function WorldSwitcher() {
  const { pathname } = useLocation();
  if (WITHOUT_SWITCHER.has(pathname)) return null;

  const isLight = false; // All worlds now dark cinematic
  const baseText = "#a0a0b0";
  const activeBg = "rgba(255,255,255,0.1)";
  const activeText = "#ffffff";
  const accentMap: Record<string, string> = {
    "/": "#c8b6ff",
    "/professional": "#00E5FF",
    "/personal": "#FFB703",
    "/emotional": "#FFB703",
  };
  const activeAccent = accentMap[pathname] || "#c8b6ff";

  return (
    <AnimatePresence>
      <motion.nav
        key="world-pill"
        initial={{ opacity: 0, x: "-50%", y: 20 }}
        animate={{ opacity: 1, x: "-50%", y: 0 }}
        exit={{ opacity: 0, x: "-50%", y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="world-pill dark"
        data-testid="world-switcher"
      >
        {worlds.map((w) => {
          const isActive = pathname === w.to;
          const Icon = w.icon;
          return (
            <NavLink
              key={w.key}
              to={w.to}
              data-testid={`world-link-${w.key}`}
              // The label is visually hidden below md, so give the link an
              // explicit accessible name — otherwise the icon-only mobile
              // nav announces as a bare "link" to screen readers.
              aria-label={w.label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 min-w-0 flex items-center justify-center gap-1.5 text-center px-2 py-2.5 md:flex-none md:px-4 md:py-2 text-[10px] md:text-xs font-mono uppercase tracking-[0.1em] md:tracking-[0.15em] rounded-full transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? activeText : baseText,
                background: isActive ? activeBg : "transparent",
                boxShadow: isActive
                  ? `0 0 20px -4px ${activeAccent}40, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : "none",
              }}
            >
              <Icon size={12} strokeWidth={1.5} aria-hidden="true" style={{ opacity: isActive ? 1 : 0.5 }} />
              <span className="hidden md:inline">{w.label}</span>
              {/* Glowing underline */}
              {isActive && (
                <motion.div
                  layoutId="world-active-bar"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)`,
                    boxShadow: `0 0 8px ${activeAccent}60`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </motion.nav>
    </AnimatePresence>
  );
}
