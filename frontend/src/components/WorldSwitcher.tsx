import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, Heart, PenLine } from "lucide-react";

const worlds = [
  { to: "/", label: "Gateway", key: "gateway", icon: Home },
  { to: "/professional", label: "Professional", key: "professional", icon: Briefcase },
  { to: "/personal", label: "Personal", key: "personal", icon: Heart },
  { to: "/emotional", label: "Emotional", key: "emotional", icon: PenLine },
];

export default function WorldSwitcher() {
  const { pathname } = useLocation();
  if (pathname === "/recruiter") return null;

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
              className="relative flex-1 min-w-0 flex items-center justify-center gap-1.5 text-center px-2 py-2.5 md:flex-none md:px-4 md:py-2 text-[10px] md:text-xs font-mono uppercase tracking-[0.1em] md:tracking-[0.15em] rounded-full transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? activeText : baseText,
                background: isActive ? activeBg : "transparent",
                boxShadow: isActive
                  ? `0 0 20px -4px ${activeAccent}40, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : "none",
              }}
            >
              <Icon size={12} strokeWidth={1.5} style={{ opacity: isActive ? 1 : 0.5 }} />
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
