import { useEffect, useState } from "react";

/**
 * Typewriter that reveals the words one character at a time and shows a
 * terminal-style block cursor. Renders inline; pass children as plain text
 * (or array of segments).
 */
export default function Typewriter({
  text,
  speed = 32,
  delay = 200,
  className = "",
  cursorClass = "",
  showCursor = true,
  testId,
}) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setN((c) => {
          if (c >= text.length) {
            clearInterval(interval);
            setDone(true);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  return (
    <>
      <span className={className} data-testid={testId}>
        {text.slice(0, n)}
        {showCursor && (
          <span
            aria-hidden
            className={`inline-block ml-1 align-baseline ${cursorClass}`}
            style={{
              width: "0.55ch",
              height: "0.85em",
              background: "currentColor",
              animation: done
                ? "tw-blink 900ms steps(2,start) infinite"
                : "none",
              verticalAlign: "-0.05em",
            }}
          />
        )}
      </span>
      <style>{`@keyframes tw-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
    </>
  );
}
