import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
}

export default function ConstellationMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate stars
    const starCount = Math.min(75, Math.floor((width * height) / 18000));
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const alpha = 0.15 + Math.random() * 0.55;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18, // Slow, gentle drift
        vy: (Math.random() - 0.5) * 0.18,
        radius: 0.8 + Math.random() * 1.5,
        alpha,
        baseAlpha: alpha,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const connectionDist = 130;
      const mouseDist = 180;

      // Draw connections first (behind stars)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];

        // Draw connections to other stars
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.09 * Math.min(s1.alpha, s2.alpha);
            ctx.strokeStyle = `rgba(229, 195, 128, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }

        // Draw dynamic connection to mouse cursor
        if (mouse.x > 0 && mouse.y > 0) {
          const mdx = s1.x - mouse.x;
          const mdy = s1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseDist) {
            const alpha = (1 - mdist / mouseDist) * 0.15 * s1.alpha;
            // Warm amber connecting thread to mouse
            ctx.strokeStyle = `rgba(229, 195, 128, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            
            // Mouse magnet effect: pull star slightly towards cursor
            s1.x -= mdx * 0.005;
            s1.y -= mdy * 0.005;
          }
        }
      }

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Update positions
        s.x += s.vx;
        s.y += s.vy;

        // Wrap borders
        if (s.x < 0) s.x = width;
        else if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        else if (s.y > height) s.y = 0;

        // Pulsing star brightness
        s.alpha = s.baseAlpha + Math.sin(Date.now() * 0.001 * s.radius + i) * 0.15;
        s.alpha = Math.max(0.1, Math.min(0.9, s.alpha));

        // Draw star dot
        ctx.fillStyle = `rgba(229, 195, 128, ${s.alpha})`;
        ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = "rgba(229, 195, 128, 0.4)";
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow for performance
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
