import { useLocation } from "react-router-dom";
import TurnLink from "@/components/kit/TurnLink";

const worlds = [
  { to: "/", label: "Gateway", key: "gateway", scene: "var(--cream)" },
  { to: "/professional", label: "Professional", key: "professional", scene: "var(--cobalt)" },
  { to: "/personal", label: "Personal", key: "personal", scene: "var(--orange)" },
  { to: "/emotional", label: "Emotional", key: "emotional", scene: "var(--ink)" },
];

// The floating world pill belongs to the four dimensions. Standalone pages carry
// their own "← Gateway" link at the top, so the pill is redundant there —
// and being fixed to the bottom it overlaps their footers.
const WITHOUT_SWITCHER = new Set([
  "/recruiter",
  "/admin",
  "/zero",
  "/query",
  "/how-i-built-this",
  "/now",
  "/privacy",
]);

export default function WorldSwitcher() {
  const { pathname } = useLocation();
  if (WITHOUT_SWITCHER.has(pathname)) return null;

  return (
    <nav className="running-foot" aria-label="Worlds" data-testid="world-switcher">
      {worlds.map((w) => {
        const isActive = pathname === w.to;
        return (
          <TurnLink
            key={w.key}
            to={w.to}
            sheet={w.scene}
            data-testid={`world-link-${w.key}`}
            aria-current={isActive ? "page" : undefined}
          >
            {w.label}
          </TurnLink>
        );
      })}
    </nav>
  );
}
