// Shared fallback for broken product images.
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'>
      <rect width='100%' height='100%' fill='hsl(30 20% 92%)'/>
      <text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle'
        font-family='Georgia, serif' font-size='18' fill='hsl(30 15% 45%)'>
        No image
      </text>
    </svg>`,
  );

export function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.src === FALLBACK_IMAGE) return;
  el.src = FALLBACK_IMAGE;
}
