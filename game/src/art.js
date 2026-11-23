// The four element sigils, drawn as inline SVG so the game needs no image files.
// Each one is a simple original shape in the element's colour: a flame, a droplet,
// a leaf, a mountain peak. Cards show their element by colour AND by this shape.
const SHAPES = {
  flame: '<path d="M32 6 C38 18 50 24 50 40 A18 18 0 1 1 14 40 C14 30 22 26 24 18 C28 24 30 26 32 26 C30 18 30 12 32 6 Z"/>',
  drop: '<path d="M32 4 C44 22 52 32 52 42 A20 20 0 1 1 12 42 C12 32 20 22 32 4 Z"/>',
  leaf: '<path d="M52 8 C24 8 10 26 12 52 C38 54 54 36 52 8 Z"/><path d="M16 48 C26 36 38 26 48 14" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>',
  peak: '<path d="M6 54 L24 16 L34 34 L42 22 L58 54 Z"/><path d="M24 16 L30 26 L24 30 L18 26 Z" fill="#ffffff"/>',
};

/** An SVG string for an element glyph, 64 by 64, filled with the given colour. */
export function elementIcon(glyph, color) {
  const shape = SHAPES[glyph] ?? SHAPES.flame;
  return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><g fill="${color}">${shape}</g></svg>`;
}

/** A small circular portrait for a duelist: a hooded ember mage, or the ash warden. */
export function portraitIcon(kind) {
  if (kind === 'warden') {
    return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#3a2b3f"/><path d="M14 44 C14 28 24 18 32 18 C40 18 50 28 50 44 L44 44 C44 36 38 30 32 30 C26 30 20 36 20 44 Z" fill="#8f1d22"/><circle cx="26" cy="38" r="2.6" fill="#ffd166"/><circle cx="38" cy="38" r="2.6" fill="#ffd166"/><path d="M28 48 L32 46 L36 48" stroke="#ffd166" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#123a2a"/><path d="M14 44 C14 28 24 18 32 18 C40 18 50 28 50 44 L44 44 C44 36 38 30 32 30 C26 30 20 36 20 44 Z" fill="#3d9b4f"/><circle cx="26" cy="38" r="2.6" fill="#e8f5e9"/><circle cx="38" cy="38" r="2.6" fill="#e8f5e9"/><path d="M28 48 L32 46 L36 48" stroke="#e8f5e9" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
}
