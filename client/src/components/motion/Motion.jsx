import { useEffect, useRef, useState } from "react";
import "./motion.css";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// True once the element has scrolled into view (fires once).
export const useInView = (options = { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView];
};

// Fades/slides its content in when scrolled into view. Children with
// className="stagger" and style={{ "--i": index }} animate one after another.
export const Reveal = ({ as: Tag = "div", className = "", children, ...rest }) => {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

// Animated number that counts up from 0 when it becomes visible.
export const CountUp = ({ value, duration = 1400, decimals = 0, suffix = "" }) => {
  const [ref, inView] = useInView();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || value == null) return;
    if (reducedMotion()) {
      setShown(value);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  return (
    <span ref={ref}>
      {value == null ? "–" : shown.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Image that fades in once loaded (and handles already-cached images).
export const FadeImg = ({ className = "", onLoad, ...props }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, [props.src]);
  return (
    <img
      ref={ref}
      className={`fadeImg ${loaded ? "loaded" : ""} ${className}`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      {...props}
    />
  );
};

// Small celebratory burst (pure CSS particles).
const CONFETTI_COLORS = ["#ffb703", "#0a3d8f", "#0e8a3a", "#ef476f", "#4cc9f0"];
export const Confetti = ({ count = 28 }) => (
  <div className="confetti" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const dist = 90 + (i % 5) * 22;
      return (
        <span
          key={i}
          style={{
            "--x": `${Math.cos(angle) * dist}px`,
            "--y": `${Math.sin(angle) * dist - 40}px`,
            "--r": `${(i * 47) % 360}deg`,
            "--d": `${(i % 7) * 25}ms`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      );
    })}
  </div>
);
