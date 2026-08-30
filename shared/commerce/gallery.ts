export function galleryIndex(current: number, imageCount: number, direction: "previous" | "next") {
  if (imageCount <= 1) return 0;
  return direction === "next" ? (current + 1) % imageCount : (current - 1 + imageCount) % imageCount;
}

export function canUseGalleryKeyboard(target: EventTarget | null) {
  const maybeElement = target as { closest?: (selector: string) => unknown } | null;
  if (!maybeElement || typeof maybeElement.closest !== "function") return true;
  return !maybeElement.closest("input, textarea, select, button, [contenteditable='true']");
}
