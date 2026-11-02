// Encrypts master.json -> data.enc.json (AES-GCM, PBKDF2-SHA256). Password comes from $BPC_PASSWORD.
// Uses WebCrypto on both sides so the browser can decrypt it directly.
import { readFileSync, writeFileSync } from 'node:fs';
const { subtle } = globalThis.crypto;
const pw = process.env.BPC_PASSWORD;
if (!pw || pw.length < 8) { console.error('Password must be at least 8 characters (use a long passphrase).'); process.exit(1); }

const data = JSON.parse(readFileSync(new URL('../master.json', import.meta.url), 'utf8'));
const problems = [];
if (!Array.isArray(data.listings) || !data.listings.length) problems.push('listings[] missing or empty');
if (!Array.isArray(data.items) || !data.items.length) problems.push('items[] missing or empty');
(data.listings || []).forEach((x, i) => { if (![1, 2].includes(x.r) && !(x.r > 0)) problems.push(`listings[${i}].r`); if (!(x.a > 0)) problems.push(`listings[${i}].a`); if (!(x.p > 0)) problems.push(`listings[${i}].p`); if (!x.s) problems.push(`listings[${i}].s`); });
const ids = new Set();
(data.items || []).forEach((x, i) => {
  if (!x.id) problems.push(`items[${i}].id`); else if (ids.has(String(x.id))) problems.push(`items[${i}].id duplicate ${x.id}`); else ids.add(String(x.id));
  if (!(x.r > 0)) problems.push(`items[${i}].r`); if (!(x.a > 0)) problems.push(`items[${i}].a`); if (!(x.p > 0)) problems.push(`items[${i}].p`);
});
if (!data.asOf) problems.push('asOf missing');
if (problems.length) { console.error('master.json problems:\n - ' + problems.slice(0, 20).join('\n - ')); process.exit(1); }

const iter = 600000;
const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
const km = await subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data)));
const b64 = (b) => Buffer.from(b).toString('base64');
writeFileSync(new URL('../data.enc.json', import.meta.url), JSON.stringify({ v: 1, iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
console.log(`Encrypted ${data.listings.length} listings, ${data.items.length} items (as of ${data.asOf}).`);
