import { useEffect, useRef, useState } from "react";

/**
 * True once the page has been scrolled down past the header, false again on any
 * meaningful scroll up or when back near the top.
 *
 * Three details keep this from misbehaving:
 *
 * Reads are batched into a rAF callback, and state is only set when the boolean
 * actually flips — a scroll listener that calls setState on every pixel would
 * re-render the whole page tree the entire way down.
 *
 * Direction is only reconsidered after DELTA pixels of travel. Without that, the
 * sub-pixel jitter of a trackpad or a rubber-band bounce flips the header back
 * and forth continuously.
 *
 * The header stays expanded within OFFSET of the top regardless of direction,
 * so it cannot collapse while the first screen is still in view.
 */
const OFFSET = 140;
const DELTA = 8;

export function useCompactHeader(): boolean {
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const evaluate = () => {
      ticking.current = false;
      const y = window.scrollY;
      const travelled = y - lastY.current;

      if (Math.abs(travelled) < DELTA) return;
      lastY.current = y;

      // Collapsing near the top would fight the user as they start scrolling.
      setCompact(y > OFFSET && travelled > 0);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return compact;
}
