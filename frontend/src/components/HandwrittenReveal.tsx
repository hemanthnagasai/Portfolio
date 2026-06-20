import { motion } from "framer-motion";

interface HandwrittenRevealProps {
  words?: string[];
  className?: string;
  delay?: number;
  stagger?: number;
  testId?: string;
}

export default function HandwrittenReveal({
  words = [],
  className = "",
  delay = 0,
  stagger = 0.12,
  testId,
}: HandwrittenRevealProps) {
  return (
    <span className={className} data-testid={testId}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, rotate: -2.5, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1.1,
            delay: delay + i * stagger,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          style={{ display: "inline-block", marginRight: "0.18em" }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}
