import { useEffect, useRef, useState } from "react";
import type { FocusEventHandler, PointerEventHandler } from "react";

/**
 * Drives the header's compact state.
 *
 * The header collapses once the page has been scrolled down past it, and
 * expands again on any meaningful scroll up, when back near the top, or while
 * the pointer or the keyboard is in the header. That last part is what makes
 * the departments rail usable while collapsed: reaching a category otherwise
 * means scrolling back up to reveal it.
 *
 * Five details keep this from misbehaving:
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
 * Scroll is ignored for SETTLE ms after the rendered state changes, whatever
 * changed it. The header is in normal flow, so resizing it changes the document
 * height, and the browser's scroll anchoring then moves scrollY to keep the
 * content visually still. That adjustment is indistinguishable from the user
 * scrolling, and it is larger than DELTA — so without this the header's own
 * animation re-triggers the listener and the two drive each other forever.
 * Measured before this guard: the header oscillated between 81px and 98px
 * indefinitely with no input at all. Arming it from an effect on the rendered
 * value rather than from the scroll handler is deliberate — a hover expansion
 * moves the document exactly as a scroll collapse does, and would otherwise
 * re-open the same loop.
 *
 * Only a mouse engages on pointer enter. A touch would fire pointerenter on tap
 * and then hold the header open until the next tap elsewhere, since there is no
 * pointer to leave with. The pointer never oscillates against the header's own
 * edge: it expands only while the pointer is inside, and being inside is what
 * keeps it expanded, so the pointer cannot be stranded outside a box that is
 * shrinking because it left.
 */
const OFFSET = 140;
const DELTA = 8;
const SETTLE = 380;

export interface CompactHeader {
  compact: boolean;
  /** Spread onto the header element. */
  handlers: {
    onPointerEnter: PointerEventHandler;
    onPointerLeave: PointerEventHandler;
    onFocus: FocusEventHandler;
    onBlur: FocusEventHandler;
  };
}

export function useCompactHeader(): CompactHeader {
  const [scrolledPast, setScrolledPast] = useState(false);
  // Tracked apart rather than as one "engaged" flag. Clicking a category
  // focuses it, so a shared flag would disengage when the mouse then left,
  // collapsing the rail and marking it inert while it still held focus.
  const [pointerIn, setPointerIn] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const compact = scrolledPast && !pointerIn && !focusIn;

  const scrolledPastRef = useRef(false);
  const lastY = useRef(0);
  const settleUntil = useRef(0);
  const ticking = useRef(false);

  // Whatever moved the header — scroll, pointer or focus — the page is about to
  // move under it. See SETTLE.
  useEffect(() => {
    settleUntil.current = performance.now() + SETTLE;
  }, [compact]);

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
      if (next === scrolledPastRef.current) return;

      scrolledPastRef.current = next;
      setScrolledPast(next);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return {
    compact,
    handlers: {
      onPointerEnter: (event) => { if (event.pointerType === "mouse") setPointerIn(true); },
      onPointerLeave: () => setPointerIn(false),
      onFocus: () => setFocusIn(true),
      // Focus events bubble, so tabbing from one header control to the next
      // fires blur before focus. Disengaging on that would collapse the header
      // mid-traversal and take `inert` on and off the rail as the user moves
      // through it; only focus actually leaving the header counts.
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusIn(false);
      },
    },
  };
}
