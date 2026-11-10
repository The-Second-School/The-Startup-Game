// Minimal local stand-in for Supabase Realtime BROADCAST (Phoenix protocol v1.0.0, JSON frames, zero dependencies).
// Used by two-device.mjs when no real VITE_SUPABASE_* credentials exist. Relays 'broadcast' events to the other
// sockets joined to the same topic. Run alone: node tests/e2e/mock-realtime.mjs [port]
import http from 'http';
import crypto from 'crypto';

export function startMock(port = 54399) {
  const sockets = new Set();
  const server = http.createServer((q, r) => { r.writeHead(200); r.end('mock realtime'); });
  server.on('upgrade', (req, sock) => {
    const key = req.headers['sec-websocket-key'];
    const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${acc}\r\n\r\n`);
    const c = { sock, topics: new Set(), buf: Buffer.alloc(0) };
    sockets.add(c);
    const send = o => { const p = Buffer.from(JSON.stringify(o)); const h = p.length < 126 ? Buffer.from([0x81, p.length]) : p.length < 65536 ? Buffer.from([0x81, 126, p.length >> 8, p.length & 255]) : (() => { const b = Buffer.alloc(10); b[0] = 0x81; b[1] = 127; b.writeBigUInt64BE(BigInt(p.length), 2); return b; })(); if (!sock.destroyed) sock.write(Buffer.concat([h, p])); };
    const onMsg = m => {
      if (m.event === 'heartbeat' || m.event === 'phx_leave') { send({ topic: m.topic, event: 'phx_reply', payload: { status: 'ok', response: {} }, ref: m.ref }); if (m.event === 'phx_leave') c.topics.delete(m.topic); return; }
      if (m.event === 'phx_join') { c.topics.add(m.topic); send({ topic: m.topic, event: 'phx_reply', payload: { status: 'ok', response: { postgres_changes: [] } }, ref: m.ref, join_ref: m.join_ref }); return; }
      if (m.event === 'broadcast') for (const o of sockets) if (o !== c && o.topics.has(m.topic)) o.send({ topic: m.topic, event: 'broadcast', payload: m.payload, ref: null });
    };
    c.send = send;
    sock.on('data', d => {
      c.buf = Buffer.concat([c.buf, d]);
      for (;;) {
        const b = c.buf; if (b.length < 2) return;
        const op = b[0] & 15; let len = b[1] & 127, off = 2;
        if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; } else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
        if (b.length < off + 4 + len) return;
        const mask = b.subarray(off, off + 4); const data = Buffer.from(b.subarray(off + 4, off + 4 + len));
        for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
        c.buf = b.subarray(off + 4 + len);
        if (op === 8) { sock.end(); return; }
        if (op === 1) { try { onMsg(JSON.parse(data.toString())); } catch { /* ignore */ } }
      }
    });
    const gone = () => sockets.delete(c);
    sock.on('close', gone); sock.on('error', gone);
  });
  return new Promise(res => server.listen(port, () => res({ port, close: () => { for (const c of sockets) c.sock.destroy(); server.close(); } })));
}

if (process.argv[1].endsWith('mock-realtime.mjs')) { const m = await startMock(Number(process.argv[2]) || 54399); console.log('mock realtime on', m.port); }
