import { motion } from "framer-motion";

/**
 * Reveals each word with a slight upward drift + tilt and tiny random
 * jitter — feels handwritten without being literally a path animation.
 */
export default function HandwrittenReveal({
  words = [],
  className = "",
  delay = 0,
  stagger = 0.12,
  testId,
}) {
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
