import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const worlds = [
  { to: "/", label: "Gateway", key: "gateway" },
  { to: "/professional", label: "Professional", key: "professional" },
  { to: "/personal", label: "Personal", key: "personal" },
  { to: "/emotional", label: "Emotional", key: "emotional" },
];

export default function WorldSwitcher() {
  const { pathname } = useLocation();
  if (pathname === "/recruiter") return null;

  const isLight = pathname === "/personal";
  const baseText = isLight ? "#2C3E2D" : "#E5E5E5";
  const activeBg = isLight ? "#D4A373" : "#FFFFFF";
  const activeText = isLight ? "#FDFBF7" : "#0A0A0A";

  return (
    <AnimatePresence>
      <motion.nav
        key="world-pill"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={`world-pill ${isLight ? "light" : "dark"}`}
        data-testid="world-switcher"
      >
        {worlds.map((w) => {
          const isActive = pathname === w.to;
          return (
            <NavLink
              key={w.key}
              to={w.to}
              data-testid={`world-link-${w.key}`}
              className="relative px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] rounded-full transition-colors"
              style={{
                color: isActive ? activeText : baseText,
                background: isActive ? activeBg : "transparent",
              }}
            >
              {w.label}
            </NavLink>
          );
        })}
      </motion.nav>
    </AnimatePresence>
  );
}
