import { motion } from "framer-motion";

/**
 * A CSS-only 3D wireframe cube that slowly rotates on all axes.
 * Pure CSS `transform-style: preserve-3d` — no WebGL or canvas.
 */
export default function FloatingGeometry() {
  const size = 100; // px per face
  const half = size / 2;
  const borderColor = "rgba(0, 229, 255, 0.15)";
  const glowColor = "rgba(0, 229, 255, 0.06)";

  const faces = [
    { transform: `translateZ(${half}px)`, label: "front" },
    { transform: `rotateY(180deg) translateZ(${half}px)`, label: "back" },
    { transform: `rotateY(90deg) translateZ(${half}px)`, label: "right" },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, label: "left" },
    { transform: `rotateX(90deg) translateZ(${half}px)`, label: "top" },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, label: "bottom" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 2 }}
      className="absolute right-[8%] top-[20%] hidden lg:block pointer-events-none"
      style={{ perspective: "600px", zIndex: 1 }}
    >
      {/* Ambient glow behind the cube */}
      <div
        className="absolute inset-0"
        style={{
          width: size * 2,
          height: size * 2,
          left: -half,
          top: -half,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />

      <div
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          animation: "cube-rotate 20s linear infinite",
        }}
      >
        {faces.map((face) => (
          <div
            key={face.label}
            style={{
              position: "absolute",
              width: size,
              height: size,
              border: `1px solid ${borderColor}`,
              background: "rgba(0, 229, 255, 0.02)",
              transform: face.transform,
              backfaceVisibility: "visible",
            }}
          >
            {/* Corner dots */}
            {[
              { top: -2, left: -2 },
              { top: -2, right: -2 },
              { bottom: -2, left: -2 },
              { bottom: -2, right: -2 },
            ].map((pos, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(0, 229, 255, 0.4)",
                  boxShadow: "0 0 6px rgba(0, 229, 255, 0.3)",
                  ...pos,
                }}
              />
            ))}

            {/* Edge midpoint accent */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent)",
                transform: "translateY(-0.5px)",
              }}
            />
          </div>
        ))}

        {/* Inner wireframe cube (smaller, offset rotation) */}
        <div
          style={{
            position: "absolute",
            width: size * 0.5,
            height: size * 0.5,
            top: size * 0.25,
            left: size * 0.25,
            transformStyle: "preserve-3d",
            animation: "cube-rotate-reverse 15s linear infinite",
          }}
        >
          {faces.map((face) => {
            const innerHalf = (size * 0.5) / 2;
            const innerTransform = face.transform.replace(
              `${half}px`,
              `${innerHalf}px`
            );
            return (
              <div
                key={`inner-${face.label}`}
                style={{
                  position: "absolute",
                  width: size * 0.5,
                  height: size * 0.5,
                  border: `1px solid rgba(0, 229, 255, 0.08)`,
                  transform: innerTransform,
                  backfaceVisibility: "visible",
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
