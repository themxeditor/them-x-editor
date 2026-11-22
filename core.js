/* MX performance SysEx core — works in browser (global MXCore) and Node (module.exports). */
(function (root) {
  'use strict';
  const HDR = [0x43, 0x00, 0x7f, 0x17]; // 0x43, 0n (patched), model id
  const SIZES = { common: 0x50, rev: 0x26, cho: 0x28, eq: 0x14, arpc: 0x0e, part: 0x3e, arp: 0x48 };
  const OFF = { // part offsets
    msb: 1, lsb: 2, pc: 3, rch: 4, vlo: 6, vhi: 7, nlo: 8, nhi: 9, vol: 0x0e, pan: 0x0f,
    rev: 0x12, cho: 0x13, shift: 0x16
  };
  const CO = { name: 0, mode: 0x41, split: 0x42, link: 0x44, arpAK: 0x49, vol: 0x38, rev: 0x3b, cho: 0x3c };

  function checksum(arr) { let s = 0; for (const b of arr) s += b; return (128 - (s & 127)) & 127; }

  function msg(dev, addr, data) {
    const bc = data.length;
    const body = [bc >> 7 & 127, bc & 127, addr[0], addr[1], addr[2], ...data];
    return Uint8Array.from([0xf0, 0x43, dev & 15, 0x7f, 0x17, ...body, checksum(body), 0xf7]);
  }
  function requestMsg(dev, addr) {
    return Uint8Array.from([0xf0, 0x43, 0x20 | (dev & 15), 0x7f, 0x17, addr[0], addr[1], addr[2], 0xf7]);
  }
  // Parse one bulk dump message -> {addr:[h,m,l], data:Uint8Array} or null
  function parse(m) {
    if (m.length < 11 || m[0] !== 0xf0 || m[1] !== 0x43 || (m[2] & 0xf0) !== 0 || m[3] !== 0x7f || m[4] !== 0x17) return null;
    const bc = (m[5] << 7) | m[6];
    if (m.length !== 7 + 3 + bc + 2) return null;
    const body = Array.from(m.slice(5, 10 + bc));
    if (checksum(body) !== m[10 + bc]) return null;
    return { addr: [m[7], m[8], m[9]], data: m.slice(10, 10 + bc) };
  }

  function bytes(n, fill) { return new Uint8Array(n).fill(fill || 0); }
  function newPart(i) {
    const p = bytes(SIZES.part);
    Object.assign(p, { 1: 0x3f, 2: 0, 3: 0, 4: i, 5: 1, 6: 1, 7: 0x7f, 8: 0, 9: 0x7f, 0x0a: 0x42, 0x0b: 0x3e, 0x0c: 0x40, 0x0d: 0x40,
      0x0e: 0x64, 0x0f: 0x40, 0x10: 0x08, 0x12: 0x0c, 0x15: 0x7f, 0x16: 0x40, 0x18: 1, 0x1b: 0x40, 0x1c: 1, 0x1f: 0x7c, 0x20: 0x6f,
      0x21: 0x7f, 0x22: 1, 0x23: 0x40, 0x24: 0x40, 0x25: 0x40, 0x26: 0x40, 0x27: 0x40, 0x28: 0x40, 0x29: 0x40, 0x2a: 0x40, 0x2b: 0x40,
      0x2d: 0x40, 0x2e: 0x40, 0x3c: 0x40, 0x3d: 0x40 });
    return p;
  }
  function newArp(i) {
    const a = bytes(SIZES.arp);
    Object.assign(a, { 2: i, 6: 1, 7: 1, 8: 3, 0x0a: 0x7f, 0x0b: 1, 0x0c: 0x7f, 0x0f: 1, 0x10: 3, 0x13: 0x64 - 0, 0x15: 0x64 - 0, 0x1a: 1, 0x1c: 0x40,
      0x1d: 1, 0x1e: 0x40, 0x1f: 0x40, 0x21: 1, 0x22: 1, 0x23: 0x40 });
    a[0x12] = 0; a[0x13] = 0x64; a[0x14] = 0; a[0x15] = 0x64 - 0; // 100% as 14-bit pair (hi,lo)
    for (let k = 0; k < 6; k++) { a[0x24 + 4 * k] = 1; a[0x25 + 4 * k] = 0; a[0x26 + 4 * k] = 1; a[0x27 + 4 * k] = 0; }
    return a;
  }
  function setName(common, name) {
    const n = String(name).replace(/[^\x20-\x7e]/g, '?').padEnd(10, ' ').slice(0, 10);
    for (let i = 0; i < 10; i++) common[i] = n.charCodeAt(i);
  }
  function getName(common) { let s = ''; for (let i = 0; i < 10; i++) s += String.fromCharCode(common[i] >= 32 && common[i] < 127 ? common[i] : 32); return s.replace(/\s+$/, ''); }

  // Approximate defaults for effect blocks (Rev-X Hall / Chorus G-Chorus). Prefer a template from the device.
  function newPerformance(name, template) {
    const P = { common: bytes(SIZES.common), rev: bytes(SIZES.rev), cho: bytes(SIZES.cho), eq: bytes(SIZES.eq), arpc: bytes(SIZES.arpc), parts: [], arps: [] };
    for (let i = 0; i < 80; i++) P.common[i] = i < 10 ? 32 : 0;
    Object.assign(P.common, { 0x1f: 0x40, 0x21: 0x40, 0x22: 0x40, 0x23: 0x40, 0x24: 0x40, 0x2a: 0x40, 0x2b: 0x40, 0x2c: 0x40, 0x2d: 0x40, 0x38: 0x7f, 0x3b: 0x7f, 0x3c: 0x7f, 0x42: 0x48 });
    setName(P.common, name || 'Init Perf');
    P.rev[0] = 1; P.rev[1] = 0; P.rev[0x24] = 0x60; P.rev[0x25] = 0x40;
    P.cho[0] = 0x03; P.cho[1] = 0x10; P.cho[0x24] = 0x60; P.cho[0x25] = 0x40;
    const eqd = [0x40, 0x0c, 7, 0, 0x40, 0x14, 7, 1, 0x40, 0x1c, 7, 1, 0x40, 0x2c, 7, 1, 0x40, 0x34, 7, 0];
    // layout per table: lowgain,lowfreq,lowQ,lowshape,lmgain,lmfreq,lmQ,res,mgain,mfreq,mQ,res,hmgain,hmfreq,hmQ,res,hgain,hfreq,hQ,hshape
    const e = [0x40, 0x0c, 7, 0, 0x40, 0x14, 7, 1, 0x40, 0x1c, 7, 1, 0x40, 0x2c, 7, 1, 0x40, 0x34, 7, 0];
    e.forEach((v, i) => P.eq[i] = v);
    P.arpc[0x03] = 0x5a; P.arpc[2] = 0; P.arpc[3] = 0x5a; P.arpc[6] = 1; P.arpc[8] = 1; P.arpc[0x0a] = 1; P.arpc[0x0c] = 1;
    P.arpc[3] = 0x5a; P.arpc[2] = 0; // tempo 90
    for (let i = 0; i < 16; i++) { P.parts.push(newPart(i)); P.arps.push(newArp(i)); }
    if (template) for (const k of ['rev', 'cho', 'eq']) P[k] = Uint8Array.from(template[k]);
    P.parts.forEach(p => p[OFF.rch] = 0x7f);
    return P;
  }
  function clonePerf(P) {
    return { common: P.common.slice(), rev: P.rev.slice(), cho: P.cho.slice(), eq: P.eq.slice(), arpc: P.arpc.slice(),
      parts: P.parts.map(x => x.slice()), arps: P.arps.map(x => x.slice()) };
  }
  // Serialise to SysEx messages. target: nn (0..127 user perf slot) or 'edit'
  function build(dev, P, target) {
    const hm = target === 'edit' ? [0x5f, 0] : [0x50, target];
    const out = [msg(dev, [0x0e, hm[0], hm[1]], [])];
    out.push(msg(dev, [0x36, 0, 0], P.common), msg(dev, [0x36, 1, 0], P.rev), msg(dev, [0x36, 2, 0], P.cho),
      msg(dev, [0x36, 0x10, 0], P.eq), msg(dev, [0x36, 0x30, 0], P.arpc));
    P.parts.forEach((p, i) => out.push(msg(dev, [0x37, i, 0], p)));
    P.arps.forEach((a, i) => out.push(msg(dev, [0x38, i, 0], a)));
    out.push(msg(dev, [0x0f, hm[0], hm[1]], []));
    return out;
  }
  function requestFor(dev, target) { return requestMsg(dev, target === 'edit' ? [0x0e, 0x5f, 0] : [0x0e, 0x50, target]); }
  // Assemble messages into a performance (returns null until header..footer complete)
  function Assembler() {
    let P = null;
    this.feed = function (raw) {
      const m = parse(raw); if (!m) return null;
      const [h, mi, l] = m.addr;
      if (h === 0x0e) { P = newPerformance('', null); P._hdr = [mi, l]; P._seen = 0; return null; }
      if (!P) return null;
      const set = (a, d) => { if (d.length === a.length) { a.set(d); P._seen++; } };
      if (h === 0x36) { const k = { 0: 'common', 1: 'rev', 2: 'cho', 0x10: 'eq', 0x30: 'arpc' }[mi]; if (k) set(P[k], m.data); }
      else if (h === 0x37 && mi < 16) set(P.parts[mi], m.data);
      else if (h === 0x38 && mi < 16) set(P.arps[mi], m.data);
      else if (h === 0x0f) { const r = P; P = null; return r._seen >= 5 ? r : null; }
      return null;
    };
  }
  // Parse a .syx file (concatenated messages) -> array of performances
  function parseSyx(buf) {
    const A = new Assembler(), res = []; let s = -1;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === 0xf0) s = i;
      else if (buf[i] === 0xf7 && s >= 0) { const r = A.feed(buf.slice(s, i + 1)); if (r) res.push(r); s = -1; }
    }
    return res;
  }

  // Parse a .syx file holding performances and/or voices. Slots come from the bulk headers.
  function parseSyxAll(buf) {
    const A = new Assembler(), VA = new VoiceAssembler(), res = { perfs: [], voices: [], skipped: 0 }; let s = -1;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === 0xf0) s = i;
      else if (buf[i] === 0xf7 && s >= 0) {
        const m = buf.slice(s, i + 1); s = -1;
        const P = A.feed(m); if (P) res.perfs.push({ slot: P._hdr[0] === 0x50 ? P._hdr[1] : -1, P });
        const V = VA.feed(m); if (V) { if (V.hdr[0] === 0x0a) res.voices.push({ slot: V.hdr[1], V }); else res.skipped++; }
      }
    }
    return res;
  }

  // Part helpers
  const active = p => p[OFF.rch] !== 0x7f;
  function setVoice(p, v) { p[OFF.msb] = v.b; p[OFF.lsb] = v.l; p[OFF.pc] = v.p - 1; }
  function getVoiceKey(p) { return p[OFF.msb] + ':' + p[OFF.lsb] + ':' + (p[OFF.pc] + 1); }
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = n => noteNames[n % 12] + (Math.floor(n / 12) - 2);
  function addVoice(P, v) { // returns part index or -1 if all 16 used
    const i = P.parts.findIndex(p => !active(p)); if (i < 0) return -1;
    const p = P.parts[i]; p.set(newPart(i)); setVoice(p, v); return i;
  }
  function removeVoice(P, i) { P.parts[i][OFF.rch] = 0x7f; }


  // ---------- Effects (reverb / chorus / insertion share the same param layout: type(2) preset(1) rsv(1) params 16x2 @4) ----------
  const fxGet = (blk, i) => (blk[4 + 2 * i] << 7) | blk[5 + 2 * i];
  const fxSet = (blk, i, v) => { v = Math.max(0, Math.min(16383, v | 0)); blk[4 + 2 * i] = v >> 7; blk[5 + 2 * i] = v & 127; };
  const fxType = blk => [blk[0], blk[1]];
  // Neutral starting values when switching type (exact factory presets are not in the Data List)
  function fxDefaults(type) {
    const out = [];
    for (const p of type[6]) {
      let v = Math.round((p[3] + p[4]) / 2); const n = p[1];
      if (/Dry\/Wet|Balance/.test(n)) v = 64;
      else if (/Feedback Level|Lag|Pan Direction/.test(n) && p[3] === 1) v = 64;
      else if (/Gain/.test(n) && p[3] === 52) v = 64;
      else if (/Width|\bQ\b/.test(n) && p[4] === 120) v = 7;
      out.push([p[0] - 1, v]);
    }
    return out;
  }
  function setFxType(blk, type) {
    blk[0] = type[1]; blk[1] = type[2]; blk[2] = 0;
    for (let i = 0; i < 16; i++) fxSet(blk, i, 0);
    for (const [i, v] of fxDefaults(type)) fxSet(blk, i, v);
  }
  // ---------- Voices (normal voice bulk) ----------
  function voiceAddr(v) {
    const b = v.b, l = v.l, p = v.p - 1;
    if (b === 63 && l <= 7) return [0x0e, l, p];
    if (b === 63 && l === 8) return [0x0e, 0x0a, p];
    if (b === 0) return [0x0e, 0x09, p];
    return null; // drum kits and others: not editable
  }
  const VOICE_BLOCKS = [[0x40, 0, 0, 80], [0x40, 3, 0, 36], [0x40, 6, 0, 60], [0x40, 0x30, 0, 86]]
    .concat([...Array(8).keys()].map(e => [0x41, e, 0, 88]), [...Array(8).keys()].map(e => [0x42, e, 0, 74]));
  const vkey = (h, m) => h + ':' + m;
  function VoiceAssembler() {
    let V = null;
    this.feed = function (raw) {
      const m = parse(raw); if (!m) return null;
      const [h, mi, l] = m.addr;
      if (h === 0x0e) { V = { hdr: [mi, l], blocks: {} }; return null; }
      if (!V) return null;
      if (h === 0x0f) { const r = V; V = null; return r.blocks[vkey(0x40, 0)] ? r : null; }
      V.blocks[vkey(h, mi)] = Uint8Array.from(m.data); return null;
    };
  }
  function buildVoice(dev, V, target) { // target: [0x0e, mid, nn]
    const out = [msg(dev, target, [])];
    for (const [h, m, l] of VOICE_BLOCKS) { const d = V.blocks[vkey(h, m)]; if (d) out.push(msg(dev, [h, m, l], d)); }
    out.push(msg(dev, [0x0f, target[1], target[2]], []));
    return out;
  }
  const voiceName = V => { let s = ''; const c = V.blocks[vkey(0x40, 0)]; for (let i = 0; i < 10; i++) s += String.fromCharCode(c[i] >= 32 && c[i] < 127 ? c[i] : 32); return s.replace(/\s+$/, ''); };
  const setVoiceName = (V, name) => { const c = V.blocks[vkey(0x40, 0)], n = String(name).replace(/[^\x20-\x7e]/g, '?').padEnd(10, ' '); for (let i = 0; i < 10; i++) c[i] = n.charCodeAt(i); };
  const cloneVoice = V => ({ hdr: V.hdr.slice(), blocks: Object.fromEntries(Object.entries(V.blocks).map(([k, v]) => [k, v.slice()])) });
  // Generic spec-driven parameter access: spec {o,s,lo,hi}
  const pget = (b, sp) => sp.s === 2 ? (b[sp.o] << 7) | b[sp.o + 1] : b[sp.o];
  const pset = (b, sp, v) => { v = Math.max(sp.lo, Math.min(sp.hi, v | 0)); if (sp.s === 2) { b[sp.o] = v >> 7; b[sp.o + 1] = v & 127; } else b[sp.o] = v; };

  root.MXCore = {fxGet, fxSet, fxType, fxDefaults, setFxType, voiceAddr, VoiceAssembler, buildVoice, voiceName, setVoiceName, cloneVoice, vkey, pget, pset, VOICE_BLOCKS, SIZES, OFF, CO, checksum, msg, requestMsg, requestFor, parse, build, Assembler, parseSyx, parseSyxAll, newPerformance, clonePerf, newPart, newArp,
    setName, getName, active, setVoice, getVoiceKey, noteName, addVoice, removeVoice };
  if (typeof module !== 'undefined') module.exports = root.MXCore;
})(typeof window !== 'undefined' ? window : globalThis);
