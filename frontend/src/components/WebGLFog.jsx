import { useEffect, useRef } from "react";

const VS = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS = `
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_velocity;
uniform vec3  u_tint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 m = u_mouse / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 d2 = uv - m;
  d2.x *= aspect;
  float d = length(d2);

  // base flowing fog
  vec2 q = uv * 2.4 + u_time * 0.022;
  q += vec2(fbm(q + u_time * 0.04), fbm(q + 1.234));
  float n = fbm(q + u_velocity * 0.4);

  // cursor influence (gentle bright halo)
  float halo = exp(-d * 4.0) * (0.18 + u_velocity * 0.6);
  float fog = n * 0.55 + halo;

  // tint per dimension
  vec3 col = u_tint * fog;

  // overall low alpha
  float a = clamp(fog * 0.45, 0.0, 0.55);
  gl_FragColor = vec4(col, a);
}
`;

const TINTS = {
  gateway:      [0.95, 0.95, 1.00],
  professional: [0.20, 0.85, 1.00],
  personal:     [0.95, 0.78, 0.55],
  emotional:    [1.00, 0.78, 0.20],
  recruiter:    [0.0, 0.0, 0.0],
};

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn("WebGL shader compile error", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function WebGLFog({ dimension = "gateway" }) {
  const canvasRef = useRef(null);
  const dimRef = useRef(dimension);

  useEffect(() => {
    dimRef.current = dimension;
  }, [dimension]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    if (!gl) return;

    const prog = gl.createProgram();
    const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uVel = gl.getUniformLocation(prog, "u_velocity");
    const uTint = gl.getUniformLocation(prog, "u_tint");

    let mouse = [0, 0];
    let lastMouse = [0, 0];
    let velocity = 0;
    let lastTimeStamp = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      mouse = [e.clientX * dpr, (window.innerHeight - e.clientY) * dpr];
    };
    window.addEventListener("mousemove", onMove);

    let frame;
    const start = performance.now();
    const draw = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      // velocity (pixel delta / frame), normalized
      const dx = mouse[0] - lastMouse[0];
      const dy = mouse[1] - lastMouse[1];
      const v = Math.min(0.8, Math.hypot(dx, dy) / 30);
      velocity += (v - velocity) * 0.18; // smooth
      lastMouse = [...mouse];

      const tint = TINTS[dimRef.current] || TINTS.gateway;

      // skip rendering on recruiter (transparent)
      if (dimRef.current !== "recruiter") {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uMouse, mouse[0], mouse[1]);
        gl.uniform1f(uVel, velocity);
        gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }

      lastTimeStamp = now;
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-testid="webgl-fog"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9997, mixBlendMode: "screen", opacity: 0.7 }}
    />
  );
}
