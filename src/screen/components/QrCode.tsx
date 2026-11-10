// QR code drawn as our own rounded-module SVG (offline, crisp at any size).
import { useEffect, useState } from 'react';

type QR = { modules: { size: number; get(r: number, c: number): number } };

export function QrCode({ text, size = 300 }: { text: string; size?: number }) {
  // The encoder is loaded on demand so it stays out of the entry chunk.
  const [qr, setQr] = useState<QR | null>(null);
  useEffect(() => {
    let live = true;
    void import('qrcode').then(m => { try { if (live) setQr(m.default.create(text, { errorCorrectionLevel: 'M' })); } catch { /* ignore */ } });
    return () => { live = false; };
  }, [text]);
  if (!qr) return <div style={{ width: size, height: size }} />;
  const n = qr.modules.size;
  const q = 2; // quiet zone in modules
  const cells: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) cells.push([r, c]);
  return (
    <svg width={size} height={size} viewBox={`${-q} ${-q} ${n + 2 * q} ${n + 2 * q}`} shapeRendering="geometricPrecision" aria-label="QR code for the host phone">
      <rect x={-q} y={-q} width={n + 2 * q} height={n + 2 * q} rx={3} fill="#fff" />
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c + 0.06} y={r + 0.06} width={0.88} height={0.88} rx={0.3} fill="var(--ink)" />)}
    </svg>
  );
}
