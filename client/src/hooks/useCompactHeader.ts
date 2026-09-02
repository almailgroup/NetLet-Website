import { useEffect, useRef, useState } from "react";

/**
 * True once the page has been scrolled down past the header, false again on any
 * meaningful scroll up or when back near the top.
 *
 * Four details keep this from misbehaving:
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
 *
 * And scroll is ignored for SETTLE ms after a flip. The header is in normal
 * flow, so collapsing it shortens the document, and the browser's scroll
 * anchoring then moves scrollY to keep the content visually still. That
 * adjustment is indistinguishable from the user scrolling, and it is larger
 * than DELTA — so without this the header's own animation re-triggers the
 * listener and the two drive each other forever. Measured before this guard:
 * the header oscillated between 81px and 98px indefinitely with no input at
 * all. The baseline is kept current while settling, so travel afterwards is
 * measured from where the page actually came to rest.
 */
const OFFSET = 140;
const DELTA = 8;
const SETTLE = 380;

export function useCompactHeader(): boolean {
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const lastY = useRef(0);
  const settleUntil = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const evaluate = () => {
      ticking.current = false;
      const y = window.scrollY;

      if (performance.now() < settleUntil.current) {
        lastY.current = y;
        return;
      }

      const travelled = y - lastY.current;
      if (Math.abs(travelled) < DELTA) return;
      lastY.current = y;

      // Collapsing near the top would fight the user as they start scrolling.
      const next = y > OFFSET && travelled > 0;
      if (next === compactRef.current) return;

      compactRef.current = next;
      settleUntil.current = performance.now() + SETTLE;
      setCompact(next);
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
