import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { onSoundChange, setSound, soundOn } from "@/lib/sfx";
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
  const [sound, setSoundState] = useState(() => soundOn());
  useEffect(() => onSoundChange(setSoundState), []);
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
      <button
        type="button"
        onClick={() => setSound(!sound)}
        aria-pressed={sound}
        aria-label={sound ? "Turn sound off" : "Turn sound on"}
        title={sound ? "Sound on" : "Sound off"}
        className="sound-toggle"
        data-testid="sound-toggle"
      >
        {sound ? <Volume2 size={16} strokeWidth={2.5} aria-hidden="true" /> : <VolumeX size={16} strokeWidth={2.5} aria-hidden="true" />}
        <span className="hidden sm:inline" aria-hidden="true">
          Sound
        </span>
      </button>
    </nav>
  );
}
